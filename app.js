// Define response audio paths
const responses = {
    "Quick Tap Response": "sound/uh-huh.mp3",
    "Double-Tap Response": "sound/yeah.mp3",
    "Soft Response": "sound/mmm.mp3",
    "Neutral Response": "sound/oh really.mp3",
    "Enthusiastic Response": "sound/that's amazing.mp3",
    "Holding Response": "sound/totally agree.mp3",
    "Swipe Response": "sound/yeah.mp3"
};

let isPlaying = false; // Flag to prevent overlapping audio playback

// Function to play audio for the specified response
function playResponseAudio(filePath) {
    if (isPlaying) return; // Prevent overlapping

    const audio = new Audio(filePath);
    isPlaying = true;
    audio.play().then(() => {
        console.log("Audio played successfully");
    }).catch(error => {
        console.error("Playback failed:", error);
        isPlaying = false;
    });

    // Reset flag when audio finishes
    audio.onended = () => {
        isPlaying = false;
    };
}

// Handle button clicks
document.querySelectorAll('.circle-btn').forEach(button => {
    button.addEventListener('click', () => {
        const responseText = button.getAttribute('data-response');
        document.getElementById('responseDisplay').textContent = `Response: ${responseText}`;

        if (responses[responseText] && !isPlaying) {
            playResponseAudio(responses[responseText]);
        }
    });
});
