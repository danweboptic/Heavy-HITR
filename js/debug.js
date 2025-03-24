/**
 * HeavyHITR - Debug Module
 * Provides debug tools and data validation
 * @author danweboptic
 * @lastUpdated 2025-03-24 13:13:24
 */

import { workoutContent } from './data.js';
import { workoutConfig } from './settings.js';

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

    console.log('=== WORKOUT CONTENT VALIDATION COMPLETE ===');
    return true;
}

// Expose validation to global scope for debugging in browser console
window.debugHeavyHITR = {
    validateWorkoutContent,
    inspectWorkoutContent: () => console.log(workoutContent),
};

// Run validation on load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        validateWorkoutContent();
    }, 1000);
});

export default {
    validateWorkoutContent
};