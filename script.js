const touchArea = document.getElementById('touchArea');
const responseDisplay = document.getElementById('responseDisplay');
let touchStartTime = 0;
let holdTimer = null;
let lastTapTime = 0;

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
    const audio = new Audio(filePath);
    audio.play();
}

// Function to trigger a response and play audio
function triggerResponse(responseText) {
    responseDisplay.textContent = `Response: ${responseText}`;
    console.log(`Triggered: ${responseText}`);
    if (responses[responseText]) {
        playResponseAudio(responses[responseText]);
    }
}

// Touch event listeners
touchArea.addEventListener('touchstart', (e) => {
    touchStartTime = Date.now();
    responseDisplay.textContent = "Response: None";
    
    // Start hold timer for holding response
    holdTimer = setTimeout(() => {
        triggerResponse('Holding Response');
    }, 600);
});

touchArea.addEventListener('touchend', (e) => {
    const touchDuration = Date.now() - touchStartTime;
    clearTimeout(holdTimer); // Stop hold timer if touch ends early

    // Check if it’s a quick tap or double-tap
    if (touchDuration < 300) {
        const currentTime = Date.now();
        if (currentTime - lastTapTime < 300) {
            triggerResponse('Double-Tap Response');
        } else {
            triggerResponse('Quick Tap Response');
        }
        lastTapTime = currentTime;
    }
});

touchArea.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    if (touch.clientX < window.innerWidth / 3) {
        triggerResponse('Soft Response');
    } else if (touch.clientX > (2 * window.innerWidth) / 3) {
        triggerResponse('Enthusiastic Response');
    } else {
        triggerResponse('Neutral Response');
    }
});
