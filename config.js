/**
 * HeavyHITR - Configuration Module
 * Manages app settings and preferences
 */

// Workout configurations
const workoutConfig = {
    rounds: 6,
    roundLength: 60, // in seconds
    breakLength: 20, // in seconds
    difficulty: 'intermediate',
    workoutType: 'punching',
    bpmRanges: {
        beginner: { min: 90, max: 110 },
        intermediate: { min: 120, max: 140 },
        advanced: { min: 150, max: 170 }
    }
};

// Workout state
let workoutState = {
    isRunning: false,
    isPaused: false,
    currentRound: 0,
    isBreak: false,
    timeRemaining: 0,
    totalTime: 0,
    interval: null
};

// Save settings to localStorage
function saveSettings() {
    const settings = {
        rounds: workoutConfig.rounds,
        roundLength: workoutConfig.roundLength,
        breakLength: workoutConfig.breakLength,
        difficulty: workoutConfig.difficulty,
        workoutType: workoutConfig.workoutType
    };
    
    localStorage.setItem('heavyhitr-settings', JSON.stringify(settings));
}

// Load settings from localStorage
function loadSettings() {
    const savedSettings = localStorage.getItem('heavyhitr-settings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        
        // Apply saved settings
        workoutConfig.rounds = settings.rounds || 6;
        workoutConfig.roundLength = settings.roundLength || 60;
        workoutConfig.breakLength = settings.breakLength || 20;
        workoutConfig.difficulty = settings.difficulty || 'intermediate';
        workoutConfig.workoutType = settings.workoutType || 'punching';
    }
}

// Check for dark mode preference and set appropriate class
function initTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
    }
    
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        if (event.matches) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    });
}

// Export module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        workoutConfig, 
        workoutState, 
        saveSettings, 
        loadSettings,
        initTheme
    };
}