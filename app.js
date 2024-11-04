let isPlaying = false;
let audioDuration = 0; // Variable to hold audio duration
let volumeValues = []; // Array to hold precomputed volume values
let pitchValues = []; // Array to hold precomputed pitch values
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

            // Precompute volume and pitch values
            precomputeValues();

            source.connect(gainNode);
            gainNode.connect(audioContext.destination);
            source.start(0);

            let playbackStartTime = audioContext.currentTime; // Store the time when playback starts
            const updateAudioProfile = setInterval(() => {
                const currentTime = audioContext.currentTime - playbackStartTime;
                if (currentTime >= audioDuration) {
                    clearInterval(updateAudioProfile);
                    isPlaying = false;
                } else {
                    // Use precomputed values
                    if (currentTime < volumeValues.length) {
                        const volumeFactor = volumeValues[Math.floor(currentTime)];
                        gainNode.gain.setValueAtTime(volumeFactor, audioContext.currentTime);
                    }

                    if (currentTime < pitchValues.length) {
                        const pitchFactor = pitchValues[Math.floor(currentTime)];
                        source.playbackRate.setValueAtTime(pitchFactor, audioContext.currentTime);
                    }
                }
            }, 10); // Update every 100ms

            source.onended = () => {
                isPlaying = false;
                clearInterval(updateAudioProfile);
            };
        });
}

// Function to precompute volume and pitch values based on drawn points
function precomputeValues() {
    volumeValues = computeInterpolatedValues(volumePoints, audioDuration);
    pitchValues = computeInterpolatedValues(pitchPoints, audioDuration, true);
}

// Function to compute interpolated values
function computeInterpolatedValues(points, duration, isPitch = false) {
    const values = [];
    const numPoints = points.length;

    if (numPoints === 0) return values;

    // Calculate duration per point
    const durationPerPoint = duration / (numPoints - 1);

    // Interpolating between each point
    for (let i = 0; i < numPoints - 1; i++) {
        const startValue = points[i] || (isPitch ? 50 : 0);
        const endValue = points[i + 1] || (isPitch ? 50 : 0);

        for (let j = 0; j < Math.ceil(durationPerPoint / 0.1); j++) { // Calculate for every 100ms
            const t = j / Math.ceil(durationPerPoint / 0.1);
            const interpolatedValue = ((1 - t) * startValue + t * endValue);
            values.push(isPitch ? interpolatedValue / 50 : interpolatedValue / 100); // Scale for volume and pitch
        }
    }

    // Handle the last point
    const lastPointValue = points[numPoints - 1] || (isPitch ? 50 : 0);
    for (let j = 0; j < Math.ceil(durationPerPoint / 0.1); j++) { // Fill the rest of the array
        values.push(isPitch ? lastPointValue / 50 : lastPointValue / 100);
    }

    return values;
}

// Add mouse event listeners for volume canvas
volumeCanvas.addEventListener('mousedown', (e) => {
    const rect = volumeCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addPoint(volumePoints, x, y, volumeCanvas);
});

volumeCanvas.addEventListener('mousemove', (e) => {
    if (e.buttons !== 1) return; // Only draw when mouse is down
    const rect = volumeCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addPoint(volumePoints, x, y, volumeCanvas);
});

// Add mouse event listeners for pitch canvas
pitchCanvas.addEventListener('mousedown', (e) => {
    const rect = pitchCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addPoint(pitchPoints, x, y, pitchCanvas);
});

pitchCanvas.addEventListener('mousemove', (e) => {
    if (e.buttons !== 1) return; // Only draw when mouse is down
    const rect = pitchCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addPoint(pitchPoints, x, y, pitchCanvas);
});

// Function to add points to the profile and redraw
function addPoint(points, x, y, canvas) {
    const pointX = Math.floor((x / canvas.width) * 100); // Scale x to 100 points
    const pointY = Math.floor((1 - (y / canvas.height)) * 100); // Invert y and scale

    // Ensure we don't overwrite existing points on the same x value
    if (pointX < 100 && (points[pointX] === undefined)) {
        points[pointX] = pointY; // Store point
    }

    drawCanvas(points, canvas); // Draw the updated points
}

// Function to draw the current points on the canvas
function drawCanvas(points, canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    // Draw the middle line
    const middleY = canvas.height / 2;
    ctx.beginPath();
    ctx.moveTo(0, middleY);
    ctx.lineTo(canvas.width, middleY);
    ctx.strokeStyle = "red"; // Color for middle line
    ctx.stroke();

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
    const responseText = $(this).data('response');
    $(this).removeClass('pressed'); // Remove pressed effect
    playResponseAudio(responses[responseText]); // Play audio response
});
