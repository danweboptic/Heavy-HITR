/**
 * HeavyHITR - Settings Module
 * Contains all configuration values for the application
 * @author danweboptic
 * @lastUpdated 2025-03-21 11:48:06
 */

// Workout configurations
export const workoutConfig = {
    rounds: 6,
    roundLength: 60, // in seconds
    breakLength: 20, // in seconds
    difficulty: 'intermediate',
    workoutType: 'punching',
};

// Music tracks collection
export const musicTracks = {
    energetic: [
        { src: 'audio/energetic_beat_1.mp3', title: 'Energetic Beat 1' },
        { src: 'audio/energetic_beat_2.mp3', title: 'Energetic Beat 2' }
    ],
    relaxed: [
        { src: 'audio/relaxed_beat_1.mp3', title: 'Relaxed Beat 1' },
        { src: 'audio/relaxed_beat_2.mp3', title: 'Relaxed Beat 2' }
    ],
    intense: [
        { src: 'audio/intense_beat_1.mp3', title: 'Intense Beat 1' },
        { src: 'audio/intense_beat_2.mp3', title: 'Intense Beat 2' }
    ]
};

// Default music settings
export const musicSettings = {
    volume: 0.4,
    enabled: true,
    category: 'energetic'
};

// Workout state
export const workoutState = {
    isRunning: false,
    isPaused: false,
    currentRound: 0,
    isBreak: false,
    timeRemaining: 0,
    totalTime: 0,
    interval: null
};