let isPlaying = false;
let selectedVolumeFunction = "linear"; // Default function for volume
let selectedPitchFunction = "linear"; // Default function for pitch
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

let volumePoints = [];
let pitchPoints = [];
let audioDuration = 0; // Variable to hold audio duration

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
    // Normalize x based on audio duration and max points
    const scaledX = Math.floor((x / canvas.width) * 100); // Scale to 100 points
    if (!points[scaledX]) {
        points[scaledX] = y; // Save y coordinate for the given x
        drawProfile(points, canvas.getContext('2d'));
    }
}

// Function to draw the profile
function drawProfile(points, ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clear the canvas
    ctx.beginPath();
    points.forEach((y, x) => {
        if (y !== undefined) {
            const scaledY = ctx.canvas.height - y; // Flip y to fit canvas
            ctx.lineTo(x * (ctx.canvas.width / 100), scaledY);
        }
    });
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Function to get volume factor from points
function getVolumeFactor(points) {
    // Calculate average of y values or get a default value
    const values = points.filter(y => y !== undefined);
    if (values.length > 0) {
        return Math.min(1, Math.max(0, Math.max(...values) / volumeCanvas.height));
    }
    return 1; // Default to full volume
}

// Handle Button Clicks
document.querySelectorAll('.circle-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const response = this.getAttribute('data-response');
        document.getElementById('responseDisplay').innerText = `Response: ${response}`;
        playResponseAudio(responses[response]);
    });

    // Add pressed state for visual feedback
    btn.addEventListener('mousedown', function() {
        this.classList.add('pressed');
    });
    btn.addEventListener('mouseup', function() {
        this.classList.remove('pressed');
    });
});

// Apply button functionality
document.getElementById('linearButton').onclick = () => setActiveVolumeFunction("linear");
document.getElementById('exponentialButton').onclick = () => setActiveVolumeFunction("exponential");
document.getElementById('sigmoidButton').onclick = () => setActiveVolumeFunction("sigmoid");
document.getElementById('sineButton').onclick = () => setActiveVolumeFunction("sine");

document.getElementById('linearPitchButton').onclick = () => setActivePitchFunction("linear");
document.getElementById('exponentialPitchButton').onclick = () => setActivePitchFunction("exponential");
document.getElementById('sigmoidPitchButton').onclick = () => setActivePitchFunction("sigmoid");
document.getElementById('sinePitchButton').onclick = () => setActivePitchFunction("sine");

// Functions for setting active volume and pitch functions
function setActiveVolumeFunction(func) {
    selectedVolumeFunction = func;
    document.querySelectorAll('.btn-group .btn').forEach(button => {
        button.classList.remove('active-function');
    });
    document.getElementById(func.toLowerCase() + 'Button').classList.add('active-function');
}

function setActivePitchFunction(func) {
    selectedPitchFunction = func;
    document.querySelectorAll('.btn-group .btn').forEach(button => {
        button.classList.remove('active-function');
    });
    document.getElementById(func.toLowerCase() + 'PitchButton').classList.add('active-function');
}
