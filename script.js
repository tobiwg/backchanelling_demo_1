const touchArea = document.getElementById('touchArea');
const responseDisplay = document.getElementById('responseDisplay');
let touchStartTime = 0;
let holdTimer = null;
let lastTapTime = 0;
let isPlaying = false; // Flag to track audio playback

// Define response audio paths
const responses = {
    "Quick Tap Response": "sound/uh-huh.mp3",
    "Double-Tap Response": "sound/yeah.mp3",
    "Soft Response": "sound/mmm.mp3",
    "Neutral Response": "sound/oh really.mp3",
    "Enthusiastic Response": "sound/that's amazing.mp3",
    "Holding Response": "sound/totally agree.mp3"
};

// Function to play the corresponding audio file
function playResponseAudio(filePath) {
    if (isPlaying) return; // Exit if audio is still playing

    const audio = new Audio(filePath);
    isPlaying = true; // Set flag to true when playback starts
    
    audio.play()
        .then(() => {
            console.log("Audio played successfully");
        })
        .catch(error => {
            console.error("Playback failed:", error); // Catch the NotAllowedError here
            isPlaying = false; // Reset if playback fails
        });

    // Set flag to false once audio finishes
    audio.onended = () => {
        isPlaying = false;
    };
}

// Function to trigger a response and play audio
function triggerResponse(responseText) {
    responseDisplay.textContent = `Response: ${responseText}`;
    console.log(`Triggered: ${responseText}`);
    if (responses[responseText] && !isPlaying) {
        playResponseAudio(responses[responseText]);
    }
}

// Touch event listeners
touchArea.addEventListener('pointerstart', (e) => {
    touchStartTime = Date.now();
    responseDisplay.textContent = "Response: None";

    // Start hold timer for holding response
    holdTimer = setTimeout(() => {
        if (!isPlaying) {  // Only trigger if no audio is playing
            triggerResponse('Holding Response');
        }
    }, 600); // 600ms for holding response
});

touchArea.addEventListener('pointerend', (e) => {
    clearTimeout(holdTimer); // Stop hold timer if touch ends early

    const touchDuration = Date.now() - touchStartTime;

    // Only process taps if the touch was quick enough
    if (touchDuration < 300) {
        const currentTime = Date.now();
        if (currentTime - lastTapTime < 800) {
            // If within 300ms, it's a double tap
            if (!isPlaying) { // Only trigger if no audio is playing
                triggerResponse('Double-Tap Response');
            }
        } else {
            // Otherwise, it's a quick tap
            if (!isPlaying) { // Only trigger if no audio is playing
                triggerResponse('Quick Tap Response');
            }
        }
        lastTapTime = currentTime; // Update the last tap time
    }
});

touchArea.addEventListener('pointermove', (e) => {
    const touch = e.touches[0];
    // Prevent triggering audio on touchmove
    if (!isPlaying) { // Only trigger if no audio is playing
        if (touch.clientX < window.innerWidth / 3) {
            triggerResponse('Soft Response');
        } else if (touch.clientX > (2 * window.innerWidth) / 3) {
            triggerResponse('Enthusiastic Response');
        } else {
            triggerResponse('Neutral Response');
        }
    }
});
