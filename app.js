let isPlaying = false;
let selectedFunction = "linear"; // Default function
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
document.getElementById("linearButton").onclick = () => selectedFunction = "linear";
document.getElementById("exponentialButton").onclick = () => selectedFunction = "exponential";
document.getElementById("sigmoidButton").onclick = () => selectedFunction = "sigmoid";
document.getElementById("sineButton").onclick = () => selectedFunction = "sine";

// Calculate Volume Based on Selected Function
function getVolumeFactor(t) {
    switch (selectedFunction) {
        case "linear": return linear(t);
        case "exponential": return exponential(t);
        case "sigmoid": return sigmoid(t);
        case "sine": return sineWave(t);
        default: return linear(t);
    }
}

// Play Response Audio with Volume Transformation
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
            source.connect(gainNode).connect(audioContext.destination);

            const duration = buffer.duration;
            source.start();

            for (let t = 0; t <= 1; t += 0.01) {
                const volumeFactor = getVolumeFactor(t);
                gainNode.gain.setValueAtTime(volumeFactor, audioContext.currentTime + t * duration);
            }

            source.onended = () => {
                isPlaying = false;
                audioContext.close();
            };
        })
        .catch(error => {
            console.error("Playback failed:", error);
            isPlaying = false;
        });
}

// Button Click Event Handling
document.querySelectorAll(".circle-btn").forEach(button => {
    button.addEventListener("click", () => {
        const response = button.getAttribute("data-response");
        if (responses[response]) {
            button.classList.add("pressed");
            playResponseAudio(responses[response]);
            document.getElementById("responseDisplay").textContent = `Response: ${response}`;
            setTimeout(() => button.classList.remove("pressed"), 150);
        }
    });
});
