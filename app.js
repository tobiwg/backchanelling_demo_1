let isPlaying = false;
let audioDuration = 0;
let volumeValues = [];
let pitchValues = [];
let useDrawnVolume = false;
let useDrawnPitch = false;

const responses = {
    "Quick Tap Response": "sound/uh-huh.mp3",
    "Double-Tap Response": "sound/yeah.mp3",
    "Soft Response": "sound/mmm.mp3",
    "Neutral Response": "sound/oh really.mp3",
    "Enthusiastic Response": "sound/that's amazing.mp3",
    "Holding Response": "sound/totally agree.mp3"
};

const volumeCanvas = document.getElementById('volumeCanvas');
const pitchCanvas = document.getElementById('pitchCanvas');
const volumeCtx = volumeCanvas.getContext('2d');
const pitchCtx = pitchCanvas.getContext('2d');

let volumePoints = [];
let pitchPoints = [];

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
                        const volumeFactor = volumeValues[Math.floor(currentTime)];
                        gainNode.gain.setValueAtTime(volumeFactor, audioContext.currentTime);
                    }
                    if (currentTime < pitchValues.length) {
                        const pitchFactor = pitchValues[Math.floor(currentTime)];
                        source.playbackRate.setValueAtTime(pitchFactor, audioContext.currentTime);
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
    if (useDrawnVolume) {
        volumeValues = computeInterpolatedValues(volumePoints, audioDuration);
    } else {
        volumeValues = predefinedProfile("linear");
    }

    if (useDrawnPitch) {
        pitchValues = computeInterpolatedValues(pitchPoints, audioDuration, true);
    } else {
        pitchValues = predefinedProfile("linear", true);
    }
}

function computeInterpolatedValues(points, duration, isPitch = false) {
    const values = [];
    // Simplified for clarity. Add your interpolation logic here.
    return values;
}

function predefinedProfile(type, isPitch = false) {
    const values = [];
    const numValues = Math.ceil(audioDuration * 10);
    let startValue = isPitch ? 1 : 0.5;

    for (let i = 0; i < numValues; i++) {
        const t = i / numValues;
        let value;
        switch (type) {
            case "linear":
                value = startValue + t * (isPitch ? 0.5 : 0.5);
                break;
            case "exponential":
                value = startValue * Math.pow(2, t);
                break;
            case "sigmoid":
                value = startValue / (1 + Math.exp(-10 * (t - 0.5)));
                break;
            case "sine":
                value = startValue + 0.5 * Math.sin(2 * Math.PI * t);
                break;
            default:
                value = startValue;
        }
        values.push(value);
    }
    return values;
}

document.getElementById('linearVolumeButton').addEventListener('click', () => {
    useDrawnVolume = false;
    volumeValues = predefinedProfile("linear");
});
document.getElementById('exponentialVolumeButton').addEventListener('click', () => {
    useDrawnVolume = false;
    volumeValues = predefinedProfile("exponential");
});
document.getElementById('sigmoidVolumeButton').addEventListener('click', () => {
    useDrawnVolume = false;
    volumeValues = predefinedProfile("sigmoid");
});
document.getElementById('sineVolumeButton').addEventListener('click', () => {
    useDrawnVolume = false;
    volumeValues = predefinedProfile("sine");
});

document.getElementById('linearPitchButton').addEventListener('click', () => {
    useDrawnPitch = false;
    pitchValues = predefinedProfile("linear", true);
});
document.getElementById('exponentialPitchButton').addEventListener('click', () => {
    useDrawnPitch = false;
    pitchValues = predefinedProfile("exponential", true);
});
document.getElementById('sigmoidPitchButton').addEventListener('click', () => {
    useDrawnPitch = false;
    pitchValues = predefinedProfile("sigmoid", true);
});
document.getElementById('sinePitchButton').addEventListener('click', () => {
    useDrawnPitch = false;
    pitchValues = predefinedProfile("sine", true);
});

$('.circle-btn').click(function() {
    const responseText = $(this).data('response');
    $('#responseDisplay').text(`Response: ${responseText}`);
    playResponseAudio(responses[responseText]);
});
