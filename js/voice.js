/**
 * HeavyHITR - Voice Coach Module
 * Handles voice announcements and coaching during workouts
 * @author danweboptic
 * @lastUpdated 2025-03-24 15:37:16
 */

// Import Voice Settings
import { voiceSettings } from './settings.js';

// Voice options configuration
const voiceOptions = {
    'en-US-female': { name: 'US English Female', voice: 'US English Female', pitch: 1.0 },
    'en-US-male': { name: 'US English Male', voice: 'US English Male', pitch: 0.95 },
    'en-GB-female': { name: 'UK English Female', voice: 'UK English Female', pitch: 1.0 },
    'en-GB-male': { name: 'UK English Male', voice: 'UK English Male', pitch: 0.95 },
    'en-AU-female': { name: 'Australian Female', voice: 'Australian Female', pitch: 1.0 }
};

// Queue for voice announcements to prevent overlap
const voiceQueue = [];
let isSpeaking = false;
let voiceAvailable = false;

/**
 * Initialize voice coach based on user settings
 */
export function initVoiceCoach() {
    console.log('Initializing voice coach');

    // Check if ResponsiveVoice is available
    if (typeof responsiveVoice !== 'undefined') {
        if (responsiveVoice.voiceSupport()) {
            console.log('ResponsiveVoice is supported');
            voiceAvailable = true;

            // Set up event listeners for ResponsiveVoice
            responsiveVoice.addEventListener('OnReady', () => {
                console.log('ResponsiveVoice is ready');
            });

            responsiveVoice.addEventListener('OnVoiceReady', () => {
                console.log('Voice is ready');
            });
        } else {
            console.warn('ResponsiveVoice is not fully supported in this browser');
            voiceAvailable = false;
        }
    } else {
        console.error('ResponsiveVoice library not found');
        voiceAvailable = false;
    }
}

/**
 * Process the voice queue to play announcements in sequence
 */
function processVoiceQueue() {
    if (voiceQueue.length === 0 || isSpeaking) return;

    isSpeaking = true;
    const nextItem = voiceQueue.shift();

    // Check if voice is enabled
    if (!voiceSettings.enabled) {
        isSpeaking = false;
        processVoiceQueue(); // Process next if any
        return;
    }

    // Check if ResponsiveVoice is available
    if (!voiceAvailable || typeof responsiveVoice === 'undefined') {
        console.warn('Voice coach not available');
        isSpeaking = false;
        processVoiceQueue(); // Process next if any
        return;
    }

    // Get voice option based on current settings
    const voiceOption = voiceOptions[voiceSettings.voice] || voiceOptions['en-US-female'];

    // Speak the text
    responsiveVoice.speak(nextItem.text, voiceOption.voice, {
        pitch: voiceOption.pitch,
        rate: 0.95, // Slightly slower for better clarity
        volume: voiceSettings.volume,
        onend: () => {
            // Mark as complete and process the next item in queue
            console.log('Voice announcement complete:', nextItem.text);
            isSpeaking = false;

            // Small delay between announcements for better user experience
            setTimeout(() => {
                processVoiceQueue();
            }, 300);
        },
        onerror: (error) => {
            console.error('Voice announcement error:', error);
            isSpeaking = false;
            processVoiceQueue(); // Try the next one
        }
    });
}

/**
 * Add announcement to the voice queue
 * @param {string} text - The text to announce
 * @param {boolean} immediate - Whether to speak immediately (clearing the queue)
 */
function queueAnnouncement(text, immediate = false) {
    if (!voiceSettings.enabled || !text) return;

    if (immediate) {
        // Clear the queue for immediate announcements
        voiceQueue.length = 0;

        // Stop any current announcement
        if (isSpeaking && typeof responsiveVoice !== 'undefined') {
            responsiveVoice.cancel();
            isSpeaking = false;
        }
    }

    // Add to queue
    voiceQueue.push({ text, timestamp: Date.now() });

    // Process queue if not currently speaking
    if (!isSpeaking) {
        processVoiceQueue();
    }
}

/**
 * Direct speak function for backward compatibility with debug.js
 * @param {string} text - The text to speak
 * @param {string} priority - Priority level ('high', 'normal', 'low')
 */
export function speak(text, priority = 'normal') {
    // For backward compatibility with existing code
    const immediate = priority === 'high';
    queueAnnouncement(text, immediate);
}

/**
 * Announce countdown (3, 2, 1)
 * @param {number} seconds - The number of seconds to announce
 */
export function announceCountdown(seconds) {
    if (!voiceSettings.enabled || !voiceSettings.countdown) return;

    queueAnnouncement(seconds.toString(), true);
}

/**
 * Announce the start of a round
 * @param {number} currentRound - The current round number
 * @param {number} totalRounds - The total number of rounds
 * @param {string} workoutType - The type of workout
 * @param {string} focus - Optional focus area
 * @param {string} instruction - Optional instruction
 */
export function announceRoundStart(currentRound, totalRounds, workoutType, focus, instruction) {
    if (!voiceSettings.enabled) return;

    // Basic round announcement
    let announcement = `Round ${currentRound} of ${totalRounds}. `;

    // Add focus and instruction if provided and instructions are enabled
    if (voiceSettings.instructions && focus) {
        announcement += `Focus on ${focus}. `;

        if (instruction) {
            announcement += instruction;
        }
    }

    queueAnnouncement(announcement);
}

/**
 * Announce the end of a round
 * @param {boolean} isLastRound - Whether this is the last round
 */
export function announceRoundEnd(isLastRound) {
    if (!voiceSettings.enabled) return;

    if (isLastRound) {
        queueAnnouncement("Workout complete! Great job!");
    } else {
        queueAnnouncement("Round complete. Take a break.");
    }
}

/**
 * Announce the end of a break
 */
export function announceBreakEnd() {
    if (!voiceSettings.enabled) return;

    queueAnnouncement("Break over. Get ready.");
}

/**
 * Announce encouragement during the workout
 * @param {string} workoutType - The type of workout
 */
export function announceEncouragement(workoutType) {
    if (!voiceSettings.enabled || !voiceSettings.encouragement) return;

    // Encouragement messages based on workout type
    const messages = {
        striking: [
            "Keep your guard up!",
            "Rotate your hips for power!",
            "Stay light on your feet!",
            "Snap those punches!"
        ],
        footwork: [
            "Stay on your toes!",
            "Quick, light steps!",
            "Maintain your stance!",
            "Control your movement!"
        ],
        defense: [
            "Keep your eyes up!",
            "Maintain your guard!",
            "Move your head!",
            "Small movements, stay efficient!"
        ],
        conditioning: [
            "Push through!",
            "Stay strong!",
            "You've got this!",
            "Maintain your pace!"
        ]
    };

    // Get messages for this workout type or use generic ones
    const typeMessages = messages[workoutType] || [
        "Keep going!",
        "You're doing great!",
        "Stay focused!",
        "Maintain your intensity!"
    ];

    // Pick a random message
    const randomMessage = typeMessages[Math.floor(Math.random() * typeMessages.length)];

    queueAnnouncement(randomMessage);
}

/**
 * Test the voice coach with a sample announcement
 */
export function testVoice() {
    if (!voiceAvailable || typeof responsiveVoice === 'undefined') {
        console.warn('Voice coach not available for testing');
        alert('Voice coach not available. Please check your browser permissions and try again.');
        return;
    }

    // Create a test message
    const testMessage = "This is your HeavyHITR voice coach. I'll guide you through your workout.";

    // Force the announcement (skip the queue)
    const voiceOption = voiceOptions[voiceSettings.voice] || voiceOptions['en-US-female'];

    // Speak test message directly
    responsiveVoice.speak(testMessage, voiceOption.voice, {
        pitch: voiceOption.pitch,
        rate: 0.95,
        volume: voiceSettings.volume
    });
}

/**
 * Stop all ongoing voice announcements
 */
export function stopAllAnnouncements() {
    if (typeof responsiveVoice !== 'undefined') {
        responsiveVoice.cancel();
    }

    // Clear the queue
    voiceQueue.length = 0;
    isSpeaking = false;
}

/**
 * Check if voice coach is available
 * @returns {boolean} Whether voice coach is available
 */
export function isVoiceCoachAvailable() {
    return voiceAvailable;
}

/**
 * Get list of available voices
 * @returns {Array} Array of voice objects with id and name
 */
export function getAvailableVoices() {
    return Object.entries(voiceOptions).map(([id, option]) => ({
        id,
        name: option.name
    }));
}

export default {
    initVoiceCoach,
    announceCountdown,
    announceRoundStart,
    announceRoundEnd,
    announceBreakEnd,
    announceEncouragement,
    testVoice,
    stopAllAnnouncements,
    isVoiceCoachAvailable,
    getAvailableVoices,
    speak // Include in default export for backward compatibility
};