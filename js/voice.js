/**
 * HeavyHITR - Voice Coach Module
 * Provides voice guidance using ResponsiveVoice.js
 * @author danweboptic
 * @lastUpdated 2025-03-21 15:17:59
 */

import { voiceSettings } from './settings.js';

// ResponsiveVoice requires a script tag in HTML:
// <script src="https://code.responsivevoice.org/responsivevoice.js?key=YOUR_API_KEY"></script>

// State variables
let speakQueue = [];
let isSpeaking = false;

// Initialize voice coach
export function initVoiceCoach() {
    if (!voiceSettings.enabled) return;

    if (!window.responsiveVoice) {
        console.warn('ResponsiveVoice not loaded');
        return false;
    }

    // Initialize ResponsiveVoice if not already
    if (!window.responsiveVoice.isInitialized()) {
        window.responsiveVoice.init();
    }

    console.log('Voice coach initialized with ResponsiveVoice');
    return true;
}

// Get voice name from settings
function getVoiceName() {
    const voiceMap = {
        'en-US-female': 'US English Female',
        'en-US-male': 'US English Male',
        'en-GB-female': 'UK English Female',
        'en-GB-male': 'UK English Male',
        'en-AU-female': 'Australian Female'
    };

    return voiceMap[voiceSettings.voice] || 'US English Female';
}

// Speak text using ResponsiveVoice
export function speak(text, priority = 'medium') {
    if (!voiceSettings.enabled || !window.responsiveVoice) return;

    // Clear all pending speech if high priority
    if (priority === 'high') {
        window.responsiveVoice.cancel();
        speakQueue = [];
        isSpeaking = false;
    }

    // If already speaking, add to queue unless it's low priority
    if (isSpeaking && priority !== 'high') {
        if (priority !== 'low') {
            speakQueue.push({ text, priority });
        }
        return;
    }

    // Start speaking
    isSpeaking = true;

    // Speech parameters
    const params = {
        pitch: 1,
        rate: 1.1,
        volume: voiceSettings.volume,
        onend: () => {
            isSpeaking = false;

            // Check if there's more in the queue
            if (speakQueue.length > 0) {
                const nextSpeech = speakQueue.shift();
                speak(nextSpeech.text, nextSpeech.priority);
            }
        },
        onerror: (e) => {
            console.error('Speech error:', e);
            isSpeaking = false;

            // Continue with queue even if there's an error
            if (speakQueue.length > 0) {
                const nextSpeech = speakQueue.shift();
                speak(nextSpeech.text, nextSpeech.priority);
            }
        }
    };

    // Start speaking with ResponsiveVoice
    window.responsiveVoice.speak(text, getVoiceName(), params);
}

// Set voice coach volume
export function setVolume(volume) {
    voiceSettings.volume = volume;
    // Volume is applied per utterance when speaking
}

// Enable/disable voice coach
export function toggleVoiceCoach() {
    voiceSettings.enabled = !voiceSettings.enabled;

    // If disabled, clear any pending speech
    if (!voiceSettings.enabled && window.responsiveVoice) {
        window.responsiveVoice.cancel();
        speakQueue = [];
        isSpeaking = false;
    }

    return voiceSettings.enabled;
}

// Test the voice coach
export function testVoice() {
    speak("Voice coach test. This is how instructions will sound during your workout.", 'high');
}

// Announcement methods for workout events

// Countdown announcement
export function announceCountdown(number) {
    if (!voiceSettings.enabled || !voiceSettings.countdown) return;
    speak(number.toString(), 'high');
}

// Round start announcement
export function announceRoundStart(roundNumber, totalRounds, workoutType) {
    if (!voiceSettings.enabled || !voiceSettings.instructions) return;

    const messages = [
        `Round ${roundNumber} of ${totalRounds}. Begin.`,
        `Starting round ${roundNumber}.`,
        `Round ${roundNumber}, focus on your ${workoutType}.`
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];
    speak(message, 'high');
}

// Round end announcement
export function announceRoundEnd(isLastRound) {
    if (!voiceSettings.enabled || !voiceSettings.instructions) return;

    if (isLastRound) {
        const messages = [
            "Final round complete. Great job!",
            "Workout complete. Well done!",
            "You've finished all rounds. Excellent work!"
        ];

        const message = messages[Math.floor(Math.random() * messages.length)];
        speak(message, 'high');
    } else {
        const messages = [
            "Round complete. Rest now.",
            "Good work. Take a break.",
            "Round finished. Recover for the next round."
        ];

        const message = messages[Math.floor(Math.random() * messages.length)];
        speak(message, 'medium');
    }
}

// Break end announcement
export function announceBreakEnd() {
    if (!voiceSettings.enabled || !voiceSettings.instructions) return;

    const messages = [
        "Break over. Get ready.",
        "Prepare for the next round.",
        "Break time finished."
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];
    speak(message, 'high');
}

// Encouragement announcement
export function announceEncouragement(workoutType) {
    if (!voiceSettings.enabled || !voiceSettings.encouragement) return;

    // Different encouragements based on workout type
    const encouragements = {
        punching: [
            "Keep those punches sharp.",
            "Great power, maintain your form.",
            "Speed and accuracy, you're doing great."
        ],
        footwork: [
            "Light on your feet, keep moving.",
            "Maintain that footwork, looking good.",
            "Stay balanced and mobile."
        ],
        defense: [
            "Keep your guard up, good work.",
            "Nice defensive movement.",
            "Stay tight and focused."
        ],
        conditioning: [
            "Push through, keep up the pace.",
            "You're doing great, maintain intensity.",
            "Keep pushing, almost there."
        ],
        general: [
            "You're doing great, keep it up.",
            "Stay focused, you've got this.",
            "Excellent work, maintain intensity."
        ]
    };

    // Select encouragements based on workout type or use general ones
    const typeEncouragements = encouragements[workoutType] || encouragements.general;
    const message = typeEncouragements[Math.floor(Math.random() * typeEncouragements.length)];

    speak(message, 'low');
}

// Halfway announcement
export function announceHalfway() {
    if (!voiceSettings.enabled || !voiceSettings.instructions) return;
    speak("Halfway point", 'medium');
}

// Export all functions
export default {
    initVoiceCoach,
    speak,
    setVolume,
    toggleVoiceCoach,
    announceCountdown,
    announceRoundStart,
    announceRoundEnd,
    announceBreakEnd,
    announceEncouragement,
    announceHalfway,
    testVoice
};