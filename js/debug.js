/**
 * HeavyHITR - Debug Module
 * Provides debug tools and data validation
 * @author danweboptic
 * @lastUpdated 2025-03-24 13:36:04
 */

import { workoutContent, coachMessages } from './data.js';
import { workoutConfig } from './settings.js';
import { speak } from './voice.js';

// Validate workout content structure
export function validateWorkoutContent() {
    console.log('=== VALIDATING WORKOUT CONTENT ===');

    // Check if workoutContent exists
    if (!workoutContent) {
        console.error('workoutContent is undefined or null');
        return false;
    }

    console.log('Available workout types:', Object.keys(workoutContent));

    // Check each workout type
    Object.entries(workoutContent).forEach(([type, content]) => {
        console.log(`Checking ${type} content...`);

        if (!Array.isArray(content)) {
            console.error(`${type} content is not an array`);
            return;
        }

        console.log(`${type} has ${content.length} exercises`);

        if (content.length === 0) {
            console.warn(`${type} content array is empty`);
            return;
        }

        // Check first item structure
        const firstItem = content[0];
        console.log(`First ${type} exercise:`, firstItem);

        if (!firstItem.focus) {
            console.error(`${type} exercise missing 'focus' property`);
        }

        if (!firstItem.instruction) {
            console.error(`${type} exercise missing 'instruction' property`);
        }
    });

    // Check specifically for the currently selected workout type
    const selectedType = workoutConfig.workoutType;
    console.log(`Checking selected workout type: ${selectedType}`);

    const selectedContent = workoutContent[selectedType];
    if (!selectedContent || !Array.isArray(selectedContent) || selectedContent.length === 0) {
        console.error(`Missing or invalid content for selected workout type: ${selectedType}`);
        return false;
    }

    console.log(`Found ${selectedContent.length} exercises for ${selectedType}`);
    selectedContent.forEach((exercise, index) => {
        console.log(`Exercise ${index + 1}: ${exercise.focus || 'missing focus'}`);
    });

    // Validate coach messages
    console.log('=== VALIDATING COACH MESSAGES ===');
    if (!coachMessages) {
        console.error('coachMessages is undefined or null');
    } else {
        console.log('Available coach message types:', Object.keys(coachMessages));

        // Check each message type
        Object.entries(coachMessages).forEach(([type, messages]) => {
            if (!Array.isArray(messages)) {
                console.error(`${type} messages is not an array`);
            } else if (messages.length === 0) {
                console.warn(`${type} messages array is empty`);
            } else {
                console.log(`${type} has ${messages.length} messages`);
            }
        });
    }

    console.log('=== WORKOUT CONTENT VALIDATION COMPLETE ===');
    return true;
}

// Test voice announcement with focus content
export function testVoiceAnnouncement() {
    console.log('=== TESTING VOICE ANNOUNCEMENT ===');

    if (!workoutContent || !workoutConfig || !workoutContent[workoutConfig.workoutType]) {
        console.error('Required data for voice test is missing');
        return;
    }

    // Get first focus content
    const focusContent = workoutContent[workoutConfig.workoutType][0];

    if (!focusContent) {
        console.error('No focus content available for testing');
        return;
    }

    console.log('Testing voice with focus:', focusContent.focus);

    // Create test message
    const message = `Round 1 of 6. ${focusContent.focus}. ${focusContent.instruction || ''}`;
    console.log('Test message:', message);

    // Speak the message
    speak(message, 'high');
}

// Test focus announcement
export function testFocusAnnouncement() {
    if (!workoutContent || !workoutConfig) return;

    const type = workoutConfig.workoutType;
    if (!workoutContent[type] || !Array.isArray(workoutContent[type]) || workoutContent[type].length === 0) {
        console.error(`No workout content available for ${type}`);
        return;
    }

    // Get the first focus content
    const focus = workoutContent[type][0];
    console.log('Testing with focus:', focus);

    // Import the announceRoundStart function
    import('./voice.js').then(voiceModule => {
        voiceModule.announceRoundStart(1, 6, type, focus.focus, focus.instruction);
    }).catch(err => {
        console.error('Error importing voice module:', err);
    });
}

// Add to the global debug object
window.debugHeavyHITR.testFocusAnnouncement = testFocusAnnouncement;

// Expose debug functions to global scope for testing in browser console
window.debugHeavyHITR = {
    validateWorkoutContent,
    testVoiceAnnouncement,
    inspectWorkoutContent: () => console.log(workoutContent),
    inspectCoachMessages: () => console.log(coachMessages),
    speakTest: (text) => speak(text, 'high')
};

// Run validation on load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        validateWorkoutContent();
    }, 1000);
});