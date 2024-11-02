let isPlaying = false;
let audioDuration = 0; // Variable to hold audio duration
const responses = {
    "Quick Tap Response": "sound/uh-huh.mp3",
    "Double-Tap Response": "sound/yeah.mp3",
    "Soft Response": "sound/mmm.mp3",
    "Neutral Response": "sound/oh really.mp3",
    "Enthusiastic Response": "sound/that's amazing.mp3",
    "Holding Response": "sound/totally agree.mp3"
};

// Canvas setup
const volumeCanvas = document.getElementById('volumeCanvas');
const pitchCanvas = document.getElementById('pitchCanvas');
const volumeCtx = volumeCanvas.getContext('2d');
const pitchCtx = pitchCanvas.getContext('2d');

// Setting up canvas dimensions
volumeCanvas.width = volumeCanvas.offsetWidth;
pitchCanvas.width = pitchCanvas.offsetWidth;

// Arrays to hold volume and pitch points
let volumePoints = [];
let pitchPoints = [];
let volumeTimes = [];
let pitchTimes = [];

// Function to play audio response
function playResponseAudio(audioUrl) {
    if (isPlaying) return;
    isPlaying = true;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const gainNode = audioContext.createGain();
    const source = audioContext.createBufferSource();
    
    fetch(audioUrl)
        .then(response => response.arrayBuffer())
        .then(data => audioContext.decodeAudioData(data))
        .then(buffer => {
            source.buffer = buffer;
            audioDuration = buffer.duration; // Store audio duration
            source.connect(gainNode);
            gainNode.connect(audioContext.destination);
            source.start(0);

            // Update volume based on profiles every 100ms
            const updateAudioProfile = setInterval(() => {
                const currentTime = audioContext.currentTime;
                if (currentTime >= audioDuration) {
                    clearInterval(updateAudioProfile);
                    isPlaying = false;
                } else {
                    // Interpolate volume
                    const volumeFactor = interpolateProfile(volumePoints, volumeTimes, currentTime);
                    if (volumeFactor !== undefined && isFinite(volumeFactor)) {
                        gainNode.gain.setValueAtTime(volumeFactor, audioContext.currentTime); // Apply interpolated volume
                    }
                }
            }, 100); // Update every 100ms

            source.onended = () => {
                isPlaying = false;
                clearInterval(updateAudioProfile);
            };
        });
}

// Interpolate profile function
function interpolateProfile(points, times, currentTime) {
    if (points.length === 0) return 0; // If no points, return 0

    // Normalize currentTime to a value between 0 and audioDuration
    const normalizedTime = (currentTime / audioDuration) * 100; // Scale to 0-100

    // Find the index of the last point that is less than or equal to normalizedTime
    let index = -1;
    for (let i = 0; i < times.length; i++) {
        if (times[i] <= normalizedTime) {
            index = i;
        } else {
            break;
        }
    }

    // If no valid index, return the first point if available, else return 0
    if (index < 0) return points[0] ? points[0] / 100 : 0;

    // If we are at the last point or beyond, return the last point
    if (index >= points.length - 1) return points[points.length - 1] / 100;

    // Interpolate between the two points
    const nextIndex = index + 1;
    const startValue = points[index] / 100; // Scale to 0-1
    const endValue = points[nextIndex] / 100; // Scale to 0-1
    const startTime = times[index];
    const endTime = times[nextIndex];

    const duration = endTime - startTime;
    const position = normalizedTime - startTime;

    // Linear interpolation
    return startValue + (endValue - startValue) * (position / duration);
}

// Add mouse event listeners for volume canvas
volumeCanvas.addEventListener('mousedown', (e) => {
    const rect = volumeCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addPoint(volumePoints, volumeTimes, x, y, volumeCanvas, audioDuration);
});

volumeCanvas.addEventListener('mousemove', (e) => {
    if (e.buttons !== 1) return; // Only draw when mouse is down
    const rect = volumeCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addPoint(volumePoints, volumeTimes, x, y, volumeCanvas, audioDuration);
});

// Add mouse event listeners for pitch canvas
pitchCanvas.addEventListener('mousedown', (e) => {
    const rect = pitchCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addPoint(pitchPoints, pitchTimes, x, y, pitchCanvas, audioDuration);
});

pitchCanvas.addEventListener('mousemove', (e) => {
    if (e.buttons !== 1) return; // Only draw when mouse is down
    const rect = pitchCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addPoint(pitchPoints, pitchTimes, x, y, pitchCanvas, audioDuration);
});

// Function to add points to the profile and redraw
function addPoint(points, times, x, y, canvas, audioDuration) {
    const pointX = Math.floor((x / canvas.width) * 100); // Scale x to 100 points
    const pointY = Math.floor((1 - (y / canvas.height)) * 100); // Invert y and scale
    const currentTime = (pointX / 100) * audioDuration; // Map to audio time

    // Ensure we don't overwrite existing points on the same x value
    if (pointX < 100 && (points[pointX] === undefined || times[pointX] === undefined)) {
        points[pointX] = pointY; // Store point
        times[pointX] = currentTime; // Store corresponding time
    }

    drawCanvas(points, canvas); // Draw the updated points
}

// Function to draw the current points on the canvas
function drawCanvas(points, canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    ctx.beginPath();
    ctx.moveTo(0, canvas.height); // Start from the bottom left

    for (let i = 0; i < points.length; i++) {
        if (points[i] !== undefined) {
            ctx.lineTo(i * (canvas.width / 100), canvas.height - (points[i] / 100) * canvas.height);
        }
    }

    ctx.lineTo(canvas.width, canvas.height); // Close the path
    ctx.fillStyle = "rgba(0, 0, 255, 0.5)"; // Fill with a color
    ctx.fill();
    ctx.stroke();
}

// Button event listeners for playing responses
$('.circle-btn').on('mousedown', function() {
    const responseText = $(this).data('response');
    $('#responseDisplay').text('Response: ' + responseText);
    $(this).addClass('pressed'); // Add pressed effect
});

$('.circle-btn').on('mouseup', function() {
    $(this).removeClass('pressed'); // Remove pressed effect
    const responseText = $(this).data('response');
    playResponseAudio(responses[responseText]); // Play audio for the selected response
});

// Button event listeners for volume function selection
$('.btn-group > button').on('click', function() {
    $('.btn-group > button').removeClass('active-function'); // Remove active class from all buttons
    $(this).addClass('active-function'); // Add active class to the clicked button
});

// Button event listeners for pitch function selection
$('.btn-group > button').on('click', function() {
    $('.btn-group > button').removeClass('active-function'); // Remove active class from all buttons
    $(this).addClass('active-function'); // Add active class to the clicked button
});
