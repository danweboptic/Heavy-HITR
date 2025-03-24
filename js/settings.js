/**
 * HeavyHITR - Settings Module
 * Manages user settings and workout configuration
 * @author danweboptic
 * @lastUpdated 2025-03-21 15:17:59
 */

// Main workout configuration
export const workoutConfig = {
    rounds: 6,
    roundLength: 60,
    breakLength: 20,
    difficulty: 'intermediate',
    workoutType: 'striking'
};

// Workout state during active workout
export const workoutState = {
    isRunning: false,
    isPaused: false,
    currentRound: 1,
    isBreak: false,
    timeRemaining: 0,
    totalTime: 0,
    startTime: null,
    interval: null,
    exerciseIndex: 0
};

// Music settings
export const musicSettings = {
    volume: 0.4,
    enabled: true,
    category: 'energetic'
};

// Voice coach settings
export const voiceSettings = {
    enabled: true,
    volume: 0.7,
    voice: 'en-US-female', // Default voice
    countdown: true,
    encouragement: true,
    instructions: true
};

// App settings
export const appSettings = {
    screenLock: false,
    soundEffects: true,
    countdownTimer: true,
    darkMode: true,
    weight: 70,
    weightUnit: 'kg'
};

// Load settings from localStorage
export function loadSettings() {
    try {
        // Load workout config
        const savedWorkoutConfig = localStorage.getItem('heavyhitr-config');
        if (savedWorkoutConfig) {
            const parsed = JSON.parse(savedWorkoutConfig);

            // Apply saved values
            workoutConfig.rounds = parsed.rounds || workoutConfig.rounds;
            workoutConfig.roundLength = parsed.roundLength || workoutConfig.roundLength;
            workoutConfig.breakLength = parsed.breakLength || workoutConfig.breakLength;
            workoutConfig.difficulty = parsed.difficulty || workoutConfig.difficulty;
            workoutConfig.workoutType = parsed.workoutType || workoutConfig.workoutType;
        }

        // Load music settings
        const savedMusicSettings = localStorage.getItem('heavyhitr-music');
        if (savedMusicSettings) {
            const parsed = JSON.parse(savedMusicSettings);

            musicSettings.volume = parsed.volume !== undefined ? parsed.volume : musicSettings.volume;
            musicSettings.enabled = parsed.enabled !== undefined ? parsed.enabled : musicSettings.enabled;
            musicSettings.category = parsed.category || musicSettings.category;
        }

        // Load voice settings
        const savedVoiceSettings = localStorage.getItem('heavyhitr-voice');
        if (savedVoiceSettings) {
            const parsed = JSON.parse(savedVoiceSettings);

            voiceSettings.enabled = parsed.enabled !== undefined ? parsed.enabled : voiceSettings.enabled;
            voiceSettings.volume = parsed.volume !== undefined ? parsed.volume : voiceSettings.volume;
            voiceSettings.voice = parsed.voice || voiceSettings.voice;
            voiceSettings.countdown = parsed.countdown !== undefined ? parsed.countdown : voiceSettings.countdown;
            voiceSettings.encouragement = parsed.encouragement !== undefined ? parsed.encouragement : voiceSettings.encouragement;
            voiceSettings.instructions = parsed.instructions !== undefined ? parsed.instructions : voiceSettings.instructions;
        }

        // Load app settings
        const savedAppSettings = localStorage.getItem('heavyhitr-app');
        if (savedAppSettings) {
            const parsed = JSON.parse(savedAppSettings);

            appSettings.screenLock = parsed.screenLock !== undefined ? parsed.screenLock : appSettings.screenLock;
            appSettings.soundEffects = parsed.soundEffects !== undefined ? parsed.soundEffects : appSettings.soundEffects;
            appSettings.countdownTimer = parsed.countdownTimer !== undefined ? parsed.countdownTimer : appSettings.countdownTimer;
            appSettings.darkMode = parsed.darkMode !== undefined ? parsed.darkMode : appSettings.darkMode;
            appSettings.weight = parsed.weight !== undefined ? parsed.weight : appSettings.weight;
            appSettings.weightUnit = parsed.weightUnit || appSettings.weightUnit;
        }

        console.log('Settings loaded successfully');
        return true;
    } catch (error) {
        console.error('Error loading settings:', error);
        return false;
    }
}

// Save workout config to localStorage
export function saveWorkoutConfig() {
    try {
        localStorage.setItem('heavyhitr-config', JSON.stringify(workoutConfig));
        return true;
    } catch (error) {
        console.error('Error saving workout config:', error);
        return false;
    }
}

// Save music settings to localStorage
export function saveMusicSettings() {
    try {
        localStorage.setItem('heavyhitr-music', JSON.stringify(musicSettings));
        return true;
    } catch (error) {
        console.error('Error saving music settings:', error);
        return false;
    }
}

// Save voice settings to localStorage
export function saveVoiceSettings() {
    try {
        localStorage.setItem('heavyhitr-voice', JSON.stringify(voiceSettings));
        return true;
    } catch (error) {
        console.error('Error saving voice settings:', error);
        return false;
    }
}

// Save app settings to localStorage
export function saveAppSettings() {
    try {
        localStorage.setItem('heavyhitr-app', JSON.stringify(appSettings));
        return true;
    } catch (error) {
        console.error('Error saving app settings:', error);
        return false;
    }
}