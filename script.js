const touchArea = document.getElementById('touchArea');
const responseDisplay = document.getElementById('responseDisplay');
const elevenLabsApiKey = 'sk_b0c43ae4baabf9a6672340bfb34dbc3fd581e17295c19467'; // Replace with your ElevenLabs API key
const voice_id = 'TX3LPaxmHKxFdv7VOQHJ'; // Replace with your chosen ElevenLabs voice ID
let touchStartTime = 0;
let holdTimer = null;
let lastTapTime = 0;

// Predefined responses with corresponding audio phrases
const responses = {
    "Quick Tap Response": "uh-huh",
    "Double-Tap Response": "yeah",
    "Soft Response": "mmm",
    "Neutral Response": "oh really",
    "Enthusiastic Response": "that's amazing",
    "Holding Response": "totally agree"
};

// Function to handle ElevenLabs API TTS request
async function playResponseAudio(text) {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'xi-api-key': elevenLabsApiKey
        },
        body: JSON.stringify({
            text,
            voice_settings: {
                stability: 0.5, // Adjust as needed
                similarity_boost: 0.75 // Adjust as needed
            }
        })
    });
    
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
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

// Touch event listeners for Force Touch (if available) and fallback gestures
touchArea.addEventListener('touchstart', (e) => {
    touchStartTime = Date.now();
    responseDisplay.textContent = "Response: None";
    holdTimer = setTimeout(() => {
        triggerResponse('Holding Response');
    }, 600);

    if (e.touches[0].force !== undefined) {
        touchArea.addEventListener('touchforcechange', (event) => {
            handleForceTouch(event.touches[0].force);
        });
    }
});

touchArea.addEventListener('touchend', (e) => {
    const touchDuration = Date.now() - touchStartTime;
    clearTimeout(holdTimer);

    if (touchDuration < 300 && !e.touches[0].force) {
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
