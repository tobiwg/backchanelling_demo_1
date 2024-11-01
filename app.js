const responses = {
    "Quick Tap Response": "sound/uh-huh.mp3",
    "Double-Tap Response": "sound/yeah.mp3",
    "Soft Response": "sound/mmm.mp3",
    "Neutral Response": "sound/oh really.mp3",
    "Enthusiastic Response": "sound/that's amazing.mp3",
    "Holding Response": "sound/totally agree.mp3",
    "Swipe Response": "sound/yeah.mp3"
};
let isPlaying = false;

// Sigmoid function for volume and pitch
function sigmoid(t, midpoint = 0.5, steepness = 10) {
    return 1 / (1 + Math.exp(-steepness * (t - midpoint)));
}

// Function to apply volume and pitch transformations
function playResponseAudio(filePath) {
    if (isPlaying) return; // Exit if audio is still playing
    isPlaying = true;

    // Create Audio Context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();

    // Load the audio file
    fetch(filePath)
        .then(response => response.arrayBuffer())
        .then(data => audioContext.decodeAudioData(data))
        .then(buffer => {
            source.buffer = buffer;
            source.connect(gainNode).connect(audioContext.destination);

            const duration = buffer.duration;
            source.start();

            // Apply transformations using the sigmoid function
            for (let t = 0; t <= 1; t += 0.01) {
                const sigmoidValue = sigmoid(t);
                
                // Volume transformation (gain) follows the sigmoid curve
                gainNode.gain.setValueAtTime(sigmoidValue, audioContext.currentTime + t * duration);

                // Pitch transformation by adjusting playbackRate
                source.playbackRate.setValueAtTime(1 + (sigmoidValue - 0.5) * 0.2, audioContext.currentTime + t * duration);
            }

            // When audio ends, reset isPlaying
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


function handleButtonClick(button) {
    const responseText = button.getAttribute('data-response');
    document.getElementById('responseDisplay').textContent = `Response: ${responseText}`;

    if (responses[responseText] && !isPlaying) {
        playResponseAudio(responses[responseText]);
    }

    button.classList.add('pressed');
    setTimeout(() => {
        button.classList.remove('pressed');
    }, 100);
}

document.querySelectorAll('.circle-btn').forEach(button => {
    button.addEventListener('click', () => handleButtonClick(button));
});