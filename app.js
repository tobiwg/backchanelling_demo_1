// Canvas and playback variables
let isPlaying = false;
let audioDuration = 2; // Default duration, will update based on audio
let volumeValues = [];
let pitchValues = [];
let useDrawnVolume = false;
let useDrawnPitch = false;

const volumeCanvas = document.getElementById('volumeCanvas');
const pitchCanvas = document.getElementById('pitchCanvas');
const volumeCtx = volumeCanvas.getContext('2d');
const pitchCtx = pitchCanvas.getContext('2d');

let volumePoints = [];
let pitchPoints = [];

// Sample audio responses
const responses = {
    "Quick Tap Response": "sound/uh-huh.mp3",
    "Double-Tap Response": "sound/yeah.mp3",
    "Soft Response": "sound/mmm.mp3",
    "Neutral Response": "sound/oh really.mp3",
    "Enthusiastic Response": "sound/that's amazing.mp3",
    "Holding Response": "sound/totally agree.mp3"
};

// Predefined curve types
const volumeProfiles = ["linear", "exponential", "sigmoid", "sine"];
const pitchProfiles = ["linear", "exponential", "sigmoid", "sine"];

// Function to draw on the canvas (clears old points first)
function updateCanvas(canvas, ctx, points) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    points.forEach((point, index) => {
        const x = point.x * canvas.width;
        const y = point.y * canvas.height;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Event listeners to capture points on the canvas
function addCanvasListeners(canvas, points, ctx) {
    let isDrawing = false;
    canvas.addEventListener("mousedown", () => isDrawing = true);
    canvas.addEventListener("mouseup", () => isDrawing = false);
    canvas.addEventListener("mousemove", (e) => {
        if (isDrawing) {
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) / canvas.width;
            const y = 1 - (e.clientY - rect.top) / canvas.height;
            points.push({ x, y });
            updateCanvas(canvas, ctx, points);
        }
    });
}

addCanvasListeners(volumeCanvas, volumePoints, volumeCtx);
addCanvasListeners(pitchCanvas, pitchPoints, pitchCtx);
// Clear button functionality for both volume and pitch canvases
document.getElementById('clearVolumeButton').addEventListener('click', () => {
    volumePoints = [];
    updateCanvas(volumeCanvas, volumeCtx, volumePoints);
    useDrawnVolume = false; // Reset to use predefined if not redrawn
});

document.getElementById('clearPitchButton').addEventListener('click', () => {
    pitchPoints = [];
    updateCanvas(pitchCanvas, pitchCtx, pitchPoints);
    useDrawnPitch = false; // Reset to use predefined if not redrawn
});

function computeInterpolatedValues(points, duration) {
    const values = [];
    for (let i = 0; i < duration * 100; i++) {
        const t = i / (duration * 100 - 1);
        let value = 0;
        if (points.length > 1) {
            for (let j = 1; j < points.length; j++) {
                const p0 = points[j - 1];
                const p1 = points[j];
                if (t >= p0.x && t <= p1.x) {
                    const fraction = (t - p0.x) / (p1.x - p0.x);
                    value = p0.y * (1 - fraction) + p1.y * fraction;
                    break;
                }
            }
        }
        values.push(value);
    }
    return values;
}

function predefinedProfile(type, duration) {
    const values = [];
    for (let i = 0; i < duration * 100; i++) {
        const t = i / (duration * 100 - 1);
        let value;
        switch (type) {
            case "linear":
                value = t;
                break;
            case "exponential":
                value = Math.pow(t, 2);
                break;
            case "sigmoid":
                value = 1 / (1 + Math.exp(-10 * (t - 0.5)));
                break;
            case "sine":
                value = 0.5 + 0.5 * Math.sin(2 * Math.PI * t - Math.PI / 2);
                break;
            default:
                value = t;
        }
        values.push(value);
    }
    return values;
}

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
            audioDuration = buffer.duration;
            precomputeValues();

            source.connect(gainNode);
            gainNode.connect(audioContext.destination);
            source.start(0);

            let playbackStartTime = audioContext.currentTime;
            const updateAudioProfile = setInterval(() => {
                const currentTime = audioContext.currentTime - playbackStartTime;
                if (currentTime >= audioDuration) {
                    clearInterval(updateAudioProfile);
                    isPlaying = false;
                } else {
                    if (currentTime < volumeValues.length) {
                        gainNode.gain.setValueAtTime(volumeValues[Math.floor(currentTime * 100)], audioContext.currentTime);
                    }
                    if (currentTime < pitchValues.length) {
                        source.playbackRate.setValueAtTime(pitchValues[Math.floor(currentTime * 100)], audioContext.currentTime);
                    }
                }
            }, 10);

            source.onended = () => {
                isPlaying = false;
                clearInterval(updateAudioProfile);
            };
        });
}

function precomputeValues() {
    volumeValues = useDrawnVolume ? computeInterpolatedValues(volumePoints, audioDuration) : predefinedProfile("linear", audioDuration);
    pitchValues = useDrawnPitch ? computeInterpolatedValues(pitchPoints, audioDuration) : predefinedProfile("linear", audioDuration);
}

// Event listeners for predefined profile buttons
document.getElementById('linearVolumeButton').addEventListener('click', () => {
    useDrawnVolume = false;
    volumeValues = predefinedProfile("linear", audioDuration);
    updateCanvas(volumeCanvas, volumeCtx, volumeValues.map((y, x) => ({ x: x / volumeValues.length, y })));
});
document.getElementById('exponentialVolumeButton').addEventListener('click', () => {
    useDrawnVolume = false;
    volumeValues = predefinedProfile("exponential", audioDuration);
    updateCanvas(volumeCanvas, volumeCtx, volumeValues.map((y, x) => ({ x: x / volumeValues.length, y })));
});
document.getElementById('sigmoidVolumeButton').addEventListener('click', () => {
    useDrawnVolume = false;
    volumeValues = predefinedProfile("sigmoid", audioDuration);
    updateCanvas(volumeCanvas, volumeCtx, volumeValues.map((y, x) => ({ x: x / volumeValues.length, y })));
});
document.getElementById('sineVolumeButton').addEventListener('click', () => {
    useDrawnVolume = false;
    volumeValues = predefinedProfile("sine", audioDuration);
    updateCanvas(volumeCanvas, volumeCtx, volumeValues.map((y, x) => ({ x: x / volumeValues.length, y })));
});

document.getElementById('linearPitchButton').addEventListener('click', () => {
    useDrawnPitch = false;
    pitchValues = predefinedProfile("linear", audioDuration);
    updateCanvas(pitchCanvas, pitchCtx, pitchValues.map((y, x) => ({ x: x / pitchValues.length, y })));
});
document.getElementById('exponentialPitchButton').addEventListener('click', () => {
    useDrawnPitch = false;
    pitchValues = predefinedProfile("exponential", audioDuration);
    updateCanvas(pitchCanvas, pitchCtx, pitchValues.map((y, x) => ({ x: x / pitchValues.length, y })));
});
document.getElementById('sigmoidPitchButton').addEventListener('click', () => {
    useDrawnPitch = false;
    pitchValues = predefinedProfile("sigmoid", audioDuration);
    updateCanvas(pitchCanvas, pitchCtx, pitchValues.map((y, x) => ({ x: x / pitchValues.length, y })));
});
document.getElementById('sinePitchButton').addEventListener('click', () => {
    useDrawnPitch = false;
    pitchValues = predefinedProfile("sine", audioDuration);
    updateCanvas(pitchCanvas, pitchCtx, pitchValues.map((y, x) => ({ x: x / pitchValues.length, y })));
});

$('.circle-btn').click(function() {
    const responseText = $(this).data('response');
    $('#responseDisplay').text(`Response: ${responseText}`);
    playResponseAudio(responses[responseText]);
});
