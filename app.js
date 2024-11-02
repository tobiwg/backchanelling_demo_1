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

            // Update volume and pitch based on profiles every 100ms
            const updateAudioProfile = setInterval(() => {
                const currentTime = audioContext.currentTime;
                if (currentTime >= audioDuration) {
                    clearInterval(updateAudioProfile);
                    isPlaying = false;
                } else {
                    // Apply interpolated volume
                    const volumeFactor = getVolumeForCurrentTime(currentTime);
                    if (volumeFactor !== undefined && isFinite(volumeFactor)) {
                        gainNode.gain.setValueAtTime(volumeFactor, audioContext.currentTime); // Apply interpolated volume
                    }

                    // Apply interpolated pitch
                    const pitchFactor = getPitchForCurrentTime(currentTime);
                    if (pitchFactor !== undefined && isFinite(pitchFactor)) {
                        source.playbackRate.setValueAtTime(pitchFactor, audioContext.currentTime); // Apply interpolated pitch
                    }
                }
            }, 100); // Update every 100ms

            source.onended = () => {
                isPlaying = false;
                clearInterval(updateAudioProfile);
            };
        });
}

// Function to get the volume for the current time based on points
function getVolumeForCurrentTime(currentTime) {
    const numPoints = volumePoints.length;

    if (numPoints === 0) return 0; // If no points, return 0

    // Calculate duration per point
    const durationPerPoint = audioDuration / (numPoints - 1);

    // Determine which segment the current time falls into
    const pointIndex = Math.floor(currentTime / durationPerPoint);

    // Ensure the point index is within bounds
    if (pointIndex < 0) return volumePoints[0] ? volumePoints[0] / 100 : 0;
    if (pointIndex >= numPoints - 1) return volumePoints[numPoints - 1] ? volumePoints[numPoints - 1] / 100 : 0;

    // Linear interpolation between points
    const t = (currentTime % durationPerPoint) / durationPerPoint;
    const startVolume = volumePoints[pointIndex] || 0;
    const endVolume = volumePoints[pointIndex + 1] || 0;

    return ((1 - t) * startVolume + t * endVolume) / 100; // Return the interpolated volume factor scaled to 0-1
}

// Function to get the pitch for the current time based on points
function getPitchForCurrentTime(currentTime) {
    const numPoints = pitchPoints.length;

    if (numPoints === 0) return 1; // Default pitch (1.0 means original pitch)

    // Calculate duration per point
    const durationPerPoint = audioDuration / (numPoints - 1);

    // Determine which segment the current time falls into
    const pointIndex = Math.floor(currentTime / durationPerPoint);

    // Ensure the point index is within bounds
    if (pointIndex < 0) return pitchPoints[0] ? pitchPoints[0] / 50 : 1; // Default to original pitch
    if (pointIndex >= numPoints - 1) return pitchPoints[numPoints - 1] ? pitchPoints[numPoints - 1] / 50 : 1; // Last point

    // Linear interpolation between points
    const t = (currentTime % durationPerPoint) / durationPerPoint;
    const startPitch = pitchPoints[pointIndex] || 50; // Normalize to original pitch
    const endPitch = pitchPoints[pointIndex + 1] || 50;

    // Normalize pitch values: Middle line is 50 (original pitch)
    const interpolatedPitch = ((1 - t) * startPitch + t * endPitch) / 50; // Scale to a factor for playback rate

    return interpolatedPitch; // Return pitch factor
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
