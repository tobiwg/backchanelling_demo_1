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

// Volume Control Functions
function linear(t) { return t; }
function exponential(t) { return t * t; }
function sigmoid(t, midpoint = 0.5, steepness = 10) {
    return 1 / (1 + Math.exp(-steepness * (t - midpoint)));
}
function sineWave(t) { return (Math.sin(2 * Math.PI * t) + 1) / 2; }

// Set Volume Function based on Selected Option
function setActiveVolumeFunction(buttonId, functionName) {
    selectedVolumeFunction = functionName;

    // Remove active state from all buttons
    document.querySelectorAll(".btn-group:first-child button").forEach(btn => btn.classList.remove("active-function"));

    // Add active state to the selected button
    document.getElementById(buttonId).classList.add("active-function");
}

// Set Pitch Function based on Selected Option
function setActivePitchFunction(buttonId, functionName) {
    selectedPitchFunction = functionName;

    // Remove active state from all buttons
    document.querySelectorAll(".btn-group:last-child button").forEach(btn => btn.classList.remove("active-function"));

    // Add active state to the selected button
    document.getElementById(buttonId).classList.add("active-function");
}

document.getElementById("linearButton").onclick = () => setActiveVolumeFunction("linearButton", "linear");
document.getElementById("exponentialButton").onclick = () => setActiveVolumeFunction("exponentialButton", "exponential");
document.getElementById("sigmoidButton").onclick = () => setActiveVolumeFunction("sigmoidButton", "sigmoid");
document.getElementById("sineButton").onclick = () => setActiveVolumeFunction("sineButton", "sine");

document.getElementById("linearPitchButton").onclick = () => setActivePitchFunction("linearPitchButton", "linear");
document.getElementById("exponentialPitchButton").onclick = () => setActivePitchFunction("exponentialPitchButton", "exponential");
document.getElementById("sigmoidPitchButton").onclick = () => setActivePitchFunction("sigmoidPitchButton", "sigmoid");
document.getElementById("sinePitchButton").onclick = () => setActivePitchFunction("sinePitchButton", "sine");

// Calculate Volume Based on Selected Function
function getVolumeFactor(t) {
    switch (selectedVolumeFunction) {
        case "linear": return linear(t);
        case "exponential": return exponential(t);
        case "sigmoid": return sigmoid(t);
        case "sine": return sineWave(t);
        default: return linear(t);
    }
}

// Calculate Pitch Based on Selected Function (placeholder)
function getPitchFactor(t) {
    switch (selectedPitchFunction) {
        case "linear": return linear(t);
        case "exponential": return exponential(t);
        case "sigmoid": return sigmoid(t);
        case "sine": return sineWave(t);
        default: return linear(t);
    }
}

// Play Response Audio with Volume and Pitch Transformation
function playResponseAudio(filePath) {
    if (isPlaying) return;
    isPlaying = true;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();

    fetch(filePath)
        .then(response => response.arrayBuffer())
        .then(data => audioContext.decodeAudioData(data))
        .then(buffer => {
            source.buffer = buffer;
            source.connect(gainNode);
            gainNode.connect(audioContext.destination);
            gainNode.gain.value = getVolumeFactor(1); // Volume at full
            source.start(0);
            source.onended = () => {
                isPlaying = false;
            };
        });
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
