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
        let selectedFunction = "linear"; // Default function

        // Mathematical functions
        function linear(t) { return t; }
        function exponential(t) { return t * t; }
        function sigmoid(t, midpoint = 0.5, steepness = 10) {
            return 1 / (1 + Math.exp(-steepness * (t - midpoint)));
        }
        function sineWave(t) { return (Math.sin(2 * Math.PI * t) + 1) / 2; }

        // Update selected function on button click
        document.getElementById("linearButton").onclick = () => selectedFunction = "linear";
        document.getElementById("exponentialButton").onclick = () => selectedFunction = "exponential";
        document.getElementById("sigmoidButton").onclick = () => selectedFunction = "sigmoid";
        document.getElementById("sineButton").onclick = () => selectedFunction = "sine";

        function getVolumeFactor(t) {
            switch (selectedFunction) {
                case "linear": return linear(t);
                case "exponential": return exponential(t);
                case "sigmoid": return sigmoid(t);
                case "sine": return sineWave(t);
                default: return linear(t);
            }
        }

        // Function to play audio with volume adjustment
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

                    // Apply selected volume control function over time
                    for (let t = 0; t <= 1; t += 0.01) {
                        const volumeFactor = getVolumeFactor(t);
                        gainNode.gain.setValueAtTime(volumeFactor, audioContext.currentTime + t * duration);
                    }

                    // Reset isPlaying flag when audio finishes
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