
import { ElevenLabsClient, play } from "elevenlabs";

const elevenlabs = new ElevenLabsClient({
    apiKey: "sk_b0c43ae4baabf9a6672340bfb34dbc3fd581e17295c19467", // Defaults to process.env.ELEVENLABS_API_KEY
});

const audio = await elevenlabs.generate({
    voice: "Sarah",
    text: "Hello! 你好! Hola! नमस्ते! Bonjour! こんにちは! مرحبا! 안녕하세요! Ciao! Cześć! Привіт! வணக்கம்!",
    model_id: "eleven_multilingual_v2",
});


const touchArea = document.getElementById('touchArea');
const responseDisplay = document.getElementById('responseDisplay');
let touchStartTime = 0;
let holdTimer = null;
let lastTapTime = 0;
document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
});
// Disable scrolling.
document.ontouchmove = function (e) {
    e.preventDefault();
  }
// Function to handle force-sensitive touch response
function handleForceTouch(force) {
    if (force < 0.2) {
        triggerResponse('Light Touch Response');
    } else if (force < 0.5) {
        triggerResponse('Medium Force Response');
    } else {
        triggerResponse('Strong Force Response');
    }
}

// Add force touch event if available
touchArea.addEventListener('touchstart', (e) => {
    touchStartTime = Date.now();
    responseDisplay.textContent = "Response: None";
    holdTimer = setTimeout(async () => {
        triggerResponse('Holding Response');
        await play(audio);
    }, 600); // Longer hold for intense response
    
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

// Handle sliding across screen
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

// Function to trigger a response
function triggerResponse(responseText) {
    responseDisplay.textContent = `Response: ${responseText}`;
    console.log(`Triggered: ${responseText}`);
    // Add sound or visual feedback here if desired
}
