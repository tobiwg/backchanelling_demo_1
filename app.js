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
let volumePoints = new Array(100).fill(0);
let pitchPoints = new Array(100).fill(0);

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
            gainNode.gain.value = getVolumeFactor(volumePoints); // Apply drawn volume profile
            source.start(0);
            source.onended = () => {
                isPlaying = false;
            };
        });
}

// Add mouse event listeners for volume canvas
volumeCanvas.addEventListener('mousedown', (e) => {
    const rect = volumeCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addPoint(volumePoints, x, y, volumeCanvas, audioDuration);
});

volumeCanvas.addEventListener('mousemove', (e) => {
    if (e.buttons !== 1) return; // Only draw when mouse is down
    const rect = volumeCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addPoint(volumePoints, x, y, volumeCanvas, audioDuration);
});

// Add mouse event listeners for pitch canvas
pitchCanvas.addEventListener('mousedown', (e) => {
    const rect = pitchCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addPoint(pitchPoints, x, y, pitchCanvas, audioDuration);
});

pitchCanvas.addEventListener('mousemove', (e) => {
    if (e.buttons !== 1) return; // Only draw when mouse is down
    const rect = pitchCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addPoint(pitchPoints, x, y, pitchCanvas, audioDuration);
});

// Function to add points to the profile and redraw
function addPoint(points, x, y, canvas, duration) {
    const pointX = Math.floor((x / canvas.width) * 100); // Scale x to 100 points
    const pointY = Math.floor((1 - (y / canvas.height)) * 100); // Invert y and scale
    points[pointX] = pointY; // Store point

    drawCanvas(points, canvas); // Draw the updated points

    if (duration > 0) {
        const volumeFactor = getVolumeFactor(volumePoints);
        const pitchFactor = getPitchFactor(pitchPoints);
        applyProfileToAudio(volumeFactor, pitchFactor); // Apply profiles to audio
    }
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

// Function to calculate volume factor from points
function getVolumeFactor(points) {
    const maxVolume = Math.max(...points.filter(p => p !== undefined), 1);
    return Math.min(1, maxVolume / 100); // Return a value between 0 and 1
}

// Function to calculate pitch factor from points
function getPitchFactor(points) {
    const maxPitch = Math.max(...points.filter(p => p !== undefined), 1);
    return Math.min(1, maxPitch / 100); // Return a value between 0 and 1
}

// Function to apply drawn profiles to audio playback
function applyProfileToAudio(volumeFactor, pitchFactor) {
    // This function should apply the volumeFactor and pitchFactor to the audio source
    console.log(`Volume Factor: ${volumeFactor}, Pitch Factor: ${pitchFactor}`);
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
