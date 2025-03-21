/**
 * HeavyHITR - Utility Functions
 * Common utility functions used throughout the application
 * @author danweboptic
 * @lastUpdated 2025-03-21 15:17:59
 */

// Format time (seconds) to MM:SS
export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Format longer time (seconds) to HH:MM:SS
export function formatLongTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    return formatTime(seconds);
}

// Format date to a readable string
export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format date as relative time (today, yesterday, etc.)
export function formatRelativeDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return formatDate(dateString);
    }
}

// Capitalize first letter of a string
export function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Calculate calories burned during workout
export function calculateCaloriesBurned(durationSeconds, weight, difficulty) {
    // Boxing MET value ranges from 7-9 depending on intensity
    let metValue;

    switch (difficulty) {
        case 'beginner':
            metValue = 7;
            break;
        case 'intermediate':
            metValue = 8;
            break;
        case 'advanced':
            metValue = 9;
            break;
        default:
            metValue = 8;
    }

    // Calories = MET × weight (kg) × duration (hours)
    // Convert seconds to hours
    const durationHours = durationSeconds / 3600;

    // Calculate and round to nearest integer
    return Math.round(metValue * weight * durationHours);
}