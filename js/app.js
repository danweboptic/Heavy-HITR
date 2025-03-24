/**
 * HeavyHITR - Main Application
 * @author danweboptic
 * @lastUpdated 2025-03-24 16:48:55
 */

// Import modules
import { workoutConfig, appSettings, saveWorkoutConfig, saveAppSettings } from './settings.js';
import { workoutContent, coachMessages } from './data.js';
import {
    playSound,
    playCountdownSound,
    startMusic,
    stopMusic,
    pauseMusic,
    resumeMusic
} from './audio.js';
import {
    initVoiceCoach,
    announceCountdown,
    announceRoundStart,
    announceRoundEnd,
    announceBreakEnd,
    announceEncouragement,
    testVoice,
    stopAllAnnouncements
} from './voice.js';
import {
    formatTime,
    generateUUID,
    calculateCaloriesBurned,
    debounce
} from './utils.js';
import {
    initCalendar,
    updateWorkoutStats,
    saveWorkoutHistory
} from './history.js';

// Application state
let workoutState = {
    isActive: false,
    isPaused: false,
    currentRound: 1,
    totalRounds: 3,
    isBreak: false,
    currentTime: 0,
    totalTime: 0,
    interval: null,
    currentFocus: null,
    musicPlayer: null
};

// Wake lock instance
let wakeLock = null;

// DOM elements cache
const elements = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('HeavyHITR initializing...');

    // Ensure settings are initialized
    ensureSettingsInitialized();

    // Cache DOM elements
    cacheElements();

    // Set up event listeners
    setupEventListeners();

    // Initialize voice coach
    initVoiceCoach();

    // Initialize workout UI with saved settings
    initWorkoutUI();

    // Initialize workout history view
    initWorkoutHistory();

    // Setup iOS audio context unlocking
    setupIOSAudioUnlock();

    console.log('HeavyHITR initialized');
});

// Ensure settings objects are properly initialized
function ensureSettingsInitialized() {
    // Set default values if not set
    if (!workoutConfig) {
        console.warn('Workout config not initialized, using defaults');
        workoutConfig = {
            workoutType: 'striking',
            difficulty: 'intermediate',
            rounds: 3,
            roundLength: 180,
            breakLength: 30,
            showCountdown: true,
            music: true,
            musicVolume: 0.5
        };
    }

    if (!appSettings) {
        console.warn('App settings not initialized, using defaults');
        appSettings = {
            sound: true,
            preventSleep: true,
            weight: 70,
            weightUnit: 'kg',
            prevWeightUnit: 'kg',
            voice: {
                enabled: true,
                voice: 'en-US-female',
                volume: 0.8,
                countdown: true,
                encouragement: true,
                instructions: true
            }
        };
    }

    // Ensure voice settings exist
    if (!appSettings.voice) {
        appSettings.voice = {
            enabled: true,
            voice: 'en-US-female',
            volume: 0.8,
            countdown: true,
            encouragement: true,
            instructions: true
        };
    }

    // Save initialized settings
    saveWorkoutConfig();
    saveAppSettings();
}

// Cache DOM elements for better performance
function cacheElements() {
    // Tab navigation
    elements.tabButtons = document.querySelectorAll('.tab-btn');
    elements.tabContents = document.querySelectorAll('.tab-content');

    // Workout configuration
    elements.categoryCards = document.querySelectorAll('.category-card');
    elements.difficultyButtons = document.querySelectorAll('.difficulty-btn');
    elements.roundsSlider = document.getElementById('rounds');
    elements.roundsValue = document.getElementById('rounds-value');
    elements.roundLengthSlider = document.getElementById('round-length');
    elements.roundLengthValue = document.getElementById('round-length-value');
    elements.breakLengthSlider = document.getElementById('break-length');
    elements.breakLengthValue = document.getElementById('break-length-value');
    elements.startWorkoutBtn = document.getElementById('start-workout');

    // Music controls
    elements.toggleMusicBtn = document.getElementById('toggle-music');
    elements.musicStatusText = document.getElementById('music-status');
    elements.musicVolumeSlider = document.getElementById('music-volume');
    elements.currentTrackName = document.getElementById('current-track-name');

    // Workout active overlay
    elements.workoutActive = document.getElementById('workout-active');
    elements.workoutTitle = document.querySelector('.workout-title');
    elements.workoutType = document.querySelector('.workout-type');
    elements.timerValue = document.getElementById('timer-value');
    elements.timerLabel = document.getElementById('timer-label');
    elements.timerProgress = document.getElementById('timer-progress');
    elements.roundIndicators = document.getElementById('round-indicators');
    elements.focusTitle = document.getElementById('focus-title');
    elements.focusInstruction = document.getElementById('focus-instruction');
    elements.coachMessage = document.getElementById('coach-message');
    elements.pauseWorkoutBtn = document.getElementById('pause-workout');
    elements.endWorkoutBtn = document.getElementById('end-workout');
    elements.workoutCloseBtn = document.getElementById('workout-close');

    // Workout complete overlay
    elements.workoutComplete = document.getElementById('workout-complete');
    elements.summaryRounds = document.getElementById('summary-rounds');
    elements.summaryTime = document.getElementById('summary-time');
    elements.summaryLevel = document.getElementById('summary-level');
    elements.summaryType = document.getElementById('summary-type');
    elements.shareWorkoutBtn = document.getElementById('share-workout');
    elements.newWorkoutBtn = document.getElementById('new-workout');

    // Settings
    elements.soundToggle = document.getElementById('sound-toggle');
    elements.voiceToggle = document.getElementById('voice-toggle');
    elements.voiceType = document.getElementById('voice-type');
    elements.voiceVolume = document.getElementById('voice-volume');
    elements.voiceVolumeValue = document.getElementById('voice-volume-value');
    elements.voiceCountdownToggle = document.getElementById('voice-countdown-toggle');
    elements.voiceEncouragementToggle = document.getElementById('voice-encouragement-toggle');
    elements.voiceInstructionsToggle = document.getElementById('voice-instructions-toggle');
    elements.testVoiceBtn = document.getElementById('test-voice-btn');
    elements.countdownToggle = document.getElementById('countdown-toggle');
    elements.screenlockToggle = document.getElementById('screenlock-toggle');
    elements.userWeight = document.getElementById('user-weight');
    elements.weightUnit = document.getElementById('weight-unit');
    elements.clearHistoryBtn = document.getElementById('clear-history-btn');
    elements.resetSettingsBtn = document.getElementById('reset-settings-btn');

    // Stats
    elements.totalWorkouts = document.getElementById('total-workouts');
    elements.weekWorkouts = document.getElementById('week-workouts');
    elements.streakCount = document.getElementById('streak-count');
}

// Set up event listeners
function setupEventListeners() {
    // Tab navigation
    elements.tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.id.replace('tab-', '');
            activateTab(tabId);
        });
    });

    // Category selection
    elements.categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            elements.categoryCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            workoutConfig.workoutType = card.dataset.type;
            saveWorkoutConfig();
        });

        // Keyboard accessibility
        card.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                card.click();
            }
        });
    });

    // Difficulty selection
    elements.difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            elements.difficultyButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            workoutConfig.difficulty = button.dataset.level;
            saveWorkoutConfig();
        });
    });

    // Rounds slider
    elements.roundsSlider.addEventListener('input', () => {
        const value = elements.roundsSlider.value;
        elements.roundsValue.textContent = value;
        workoutConfig.rounds = parseInt(value);
        saveWorkoutConfig();
    });

    // Round length slider
    elements.roundLengthSlider.addEventListener('input', () => {
        const value = elements.roundLengthSlider.value;
        elements.roundLengthValue.textContent = formatTime(value);
        workoutConfig.roundLength = parseInt(value);
        saveWorkoutConfig();
    });

    // Break length slider
    elements.breakLengthSlider.addEventListener('input', () => {
        const value = elements.breakLengthSlider.value;
        elements.breakLengthValue.textContent = formatTime(value);
        workoutConfig.breakLength = parseInt(value);
        saveWorkoutConfig();
    });

    // Music toggle
    elements.toggleMusicBtn.addEventListener('click', () => {
        workoutConfig.music = !workoutConfig.music;
        updateMusicToggle();
        saveWorkoutConfig();
    });

    // Music volume slider
    elements.musicVolumeSlider.addEventListener('input', () => {
        const volume = parseFloat(elements.musicVolumeSlider.value);
        workoutConfig.musicVolume = volume;

        if (workoutState.musicPlayer) {
            workoutState.musicPlayer.volume(volume);
        }

        saveWorkoutConfig();
    });

    // Start workout button
    elements.startWorkoutBtn.addEventListener('click', startWorkout);

    // Pause workout button
    elements.pauseWorkoutBtn.addEventListener('click', togglePauseWorkout);

    // End workout button
    elements.endWorkoutBtn.addEventListener('click', confirmEndWorkout);

    // Close workout button
    elements.workoutCloseBtn.addEventListener('click', confirmEndWorkout);

    // Share workout button
    elements.shareWorkoutBtn.addEventListener('click', shareWorkout);

    // New workout button
    elements.newWorkoutBtn.addEventListener('click', hideWorkoutComplete);

    // Settings event listeners
    setupSettingsEventListeners();
}

// Settings-specific event listeners
function setupSettingsEventListeners() {
    // Sound toggle
    if (elements.soundToggle) {
        elements.soundToggle.addEventListener('change', () => {
            appSettings.sound = elements.soundToggle.checked;
            saveAppSettings();
        });
    }

    // Voice toggle
    if (elements.voiceToggle) {
        elements.voiceToggle.addEventListener('change', () => {
            // Ensure voice object exists
            if (!appSettings.voice) {
                appSettings.voice = {
                    enabled: true,
                    voice: 'en-US-female',
                    volume: 0.8,
                    countdown: true,
                    encouragement: true,
                    instructions: true
                };
            }

            appSettings.voice.enabled = elements.voiceToggle.checked;

            const voiceSettings = document.getElementById('voice-settings');
            if (voiceSettings) {
                if (elements.voiceToggle.checked) {
                    voiceSettings.classList.remove('disabled');
                } else {
                    voiceSettings.classList.add('disabled');
                }
            }

            saveAppSettings();
        });
    }

    // Voice type selector
    if (elements.voiceType) {
        elements.voiceType.addEventListener('change', () => {
            // Ensure voice object exists
            if (!appSettings.voice) {
                appSettings.voice = {
                    enabled: true,
                    voice: 'en-US-female',
                    volume: 0.8,
                    countdown: true,
                    encouragement: true,
                    instructions: true
                };
            }

            appSettings.voice.voice = elements.voiceType.value;
            saveAppSettings();
        });
    }

    // Voice volume slider
    if (elements.voiceVolume && elements.voiceVolumeValue) {
        elements.voiceVolume.addEventListener('input', () => {
            // Ensure voice object exists
            if (!appSettings.voice) {
                appSettings.voice = {
                    enabled: true,
                    voice: 'en-US-female',
                    volume: 0.8,
                    countdown: true,
                    encouragement: true,
                    instructions: true
                };
            }

            const volume = parseFloat(elements.voiceVolume.value);
            appSettings.voice.volume = volume;
            elements.voiceVolumeValue.textContent = `${Math.round(volume * 100)}%`;
            saveAppSettings();
        });
    }

    // Voice countdown toggle
    if (elements.voiceCountdownToggle) {
        elements.voiceCountdownToggle.addEventListener('change', () => {
            // Ensure voice object exists
            if (!appSettings.voice) {
                appSettings.voice = {
                    enabled: true,
                    voice: 'en-US-female',
                    volume: 0.8,
                    countdown: true,
                    encouragement: true,
                    instructions: true
                };
            }

            appSettings.voice.countdown = elements.voiceCountdownToggle.checked;
            saveAppSettings();
        });
    }

    // Voice encouragement toggle
    if (elements.voiceEncouragementToggle) {
        elements.voiceEncouragementToggle.addEventListener('change', () => {
            // Ensure voice object exists
            if (!appSettings.voice) {
                appSettings.voice = {
                    enabled: true,
                    voice: 'en-US-female',
                    volume: 0.8,
                    countdown: true,
                    encouragement: true,
                    instructions: true
                };
            }

            appSettings.voice.encouragement = elements.voiceEncouragementToggle.checked;
            saveAppSettings();
        });
    }

    // Voice instructions toggle
    if (elements.voiceInstructionsToggle) {
        elements.voiceInstructionsToggle.addEventListener('change', () => {
            // Ensure voice object exists
            if (!appSettings.voice) {
                appSettings.voice = {
                    enabled: true,
                    voice: 'en-US-female',
                    volume: 0.8,
                    countdown: true,
                    encouragement: true,
                    instructions: true
                };
            }

            appSettings.voice.instructions = elements.voiceInstructionsToggle.checked;
            saveAppSettings();
        });
    }

    // Test voice button
    if (elements.testVoiceBtn) {
        elements.testVoiceBtn.addEventListener('click', () => {
            testVoice();
        });
    }

    // Countdown toggle
    if (elements.countdownToggle) {
        elements.countdownToggle.addEventListener('change', () => {
            workoutConfig.showCountdown = elements.countdownToggle.checked;
            saveWorkoutConfig();
        });
    }

    // Screen lock toggle
    if (elements.screenlockToggle) {
        elements.screenlockToggle.addEventListener('change', () => {
            appSettings.preventSleep = elements.screenlockToggle.checked;
            saveAppSettings();
        });
    }

    // User weight input
    if (elements.userWeight) {
        elements.userWeight.addEventListener('change', () => {
            let weight = parseFloat(elements.userWeight.value);

            // Validate weight (min 30, max 200)
            if (isNaN(weight) || weight < 30) {
                weight = 30;
                elements.userWeight.value = weight;
            } else if (weight > 200) {
                weight = 200;
                elements.userWeight.value = weight;
            }

            appSettings.weight = weight;
            saveAppSettings();
        });
    }

    // Weight unit select
    if (elements.weightUnit) {
        elements.weightUnit.addEventListener('change', () => {
            appSettings.weightUnit = elements.weightUnit.value;

            // Convert weight between kg and lb
            const currentWeight = parseFloat(elements.userWeight.value);
            if (appSettings.weightUnit === 'kg' && appSettings.prevWeightUnit === 'lb') {
                // Convert lb to kg
                elements.userWeight.value = Math.round(currentWeight * 0.453592);
                appSettings.weight = parseFloat(elements.userWeight.value);
            } else if (appSettings.weightUnit === 'lb' && appSettings.prevWeightUnit === 'kg') {
                // Convert kg to lb
                elements.userWeight.value = Math.round(currentWeight * 2.20462);
                appSettings.weight = parseFloat(elements.userWeight.value);
            }

            appSettings.prevWeightUnit = appSettings.weightUnit;
            saveAppSettings();
        });
    }

    // Clear history button
    if (elements.clearHistoryBtn) {
        elements.clearHistoryBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all workout history? This cannot be undone.')) {
                localStorage.removeItem('heavyhitr-workout-history');
                initWorkoutHistory();
                alert('Workout history cleared');
            }
        });
    }

    // Reset settings button
    if (elements.resetSettingsBtn) {
        elements.resetSettingsBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
                localStorage.removeItem('heavyhitr-workout-config');
                localStorage.removeItem('heavyhitr-app-settings');
                location.reload();
            }
        });
    }
}

// Initialize workout UI with saved settings
function initWorkoutUI() {
    // Set workout type
    elements.categoryCards.forEach(card => {
        if (card.dataset.type === workoutConfig.workoutType) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });

    // Set difficulty
    elements.difficultyButtons.forEach(button => {
        if (button.dataset.level === workoutConfig.difficulty) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });

    // Set rounds
    elements.roundsSlider.value = workoutConfig.rounds;
    elements.roundsValue.textContent = workoutConfig.rounds;

    // Set round length
    elements.roundLengthSlider.value = workoutConfig.roundLength;
    elements.roundLengthValue.textContent = formatTime(workoutConfig.roundLength);

    // Set break length
    elements.breakLengthSlider.value = workoutConfig.breakLength;
    elements.breakLengthValue.textContent = formatTime(workoutConfig.breakLength);

    // Set music toggle
    updateMusicToggle();

    // Set music volume
    elements.musicVolumeSlider.value = workoutConfig.musicVolume;

    // Initialize settings UI
    initSettingsUI();
}

// Initialize settings UI with saved settings
function initSettingsUI() {
    // Ensure appSettings has been initialized
    if (!appSettings) {
        ensureSettingsInitialized();
    }

    // Sound toggle
    if (elements.soundToggle) {
        elements.soundToggle.checked = appSettings.sound;
    }

    // Ensure voice settings exist
    if (!appSettings.voice) {
        appSettings.voice = {
            enabled: true,
            voice: 'en-US-female',
            volume: 0.8,
            countdown: true,
            encouragement: true,
            instructions: true
        };
        saveAppSettings();
    }

    // Voice settings
    if (elements.voiceToggle) {
        elements.voiceToggle.checked = appSettings.voice.enabled;
    }

    if (elements.voiceType) {
        elements.voiceType.value = appSettings.voice.voice;
    }

    if (elements.voiceVolume) {
        elements.voiceVolume.value = appSettings.voice.volume;
    }

    if (elements.voiceVolumeValue) {
        elements.voiceVolumeValue.textContent = `${Math.round(appSettings.voice.volume * 100)}%`;
    }

    if (elements.voiceCountdownToggle) {
        elements.voiceCountdownToggle.checked = appSettings.voice.countdown;
    }

    if (elements.voiceEncouragementToggle) {
        elements.voiceEncouragementToggle.checked = appSettings.voice.encouragement;
    }

    if (elements.voiceInstructionsToggle) {
        elements.voiceInstructionsToggle.checked = appSettings.voice.instructions;
    }

    // Workout settings
    if (elements.countdownToggle) {
        elements.countdownToggle.checked = workoutConfig.showCountdown;
    }

    if (elements.screenlockToggle) {
        elements.screenlockToggle.checked = appSettings.preventSleep;
    }

    // User settings
    if (elements.userWeight) {
        elements.userWeight.value = appSettings.weight;
    }

    if (elements.weightUnit) {
        elements.weightUnit.value = appSettings.weightUnit;
    }

    // Voice settings container visibility
    const voiceSettings = document.getElementById('voice-settings');
    if (voiceSettings) {
        if (!appSettings.voice.enabled) {
            voiceSettings.classList.add('disabled');
        } else {
            voiceSettings.classList.remove('disabled');
        }
    }
}

// Initialize workout history view
function initWorkoutHistory() {
    try {
        // Initialize calendar view
        if (typeof initCalendar === 'function') {
            initCalendar();
        }

        // Update stats
        if (typeof updateWorkoutStats === 'function') {
            updateWorkoutStats();
        }
    } catch (error) {
        console.error('Error initializing workout history:', error);
    }
}

// Update music toggle button
function updateMusicToggle() {
    if (workoutConfig.music) {
        elements.toggleMusicBtn.classList.add('active');
        elements.musicStatusText.textContent = 'ON';
    } else {
        elements.toggleMusicBtn.classList.remove('active');
        elements.musicStatusText.textContent = 'OFF';
    }
}

// Activate a specific tab
function activateTab(tabId) {
    // Update tab buttons
    elements.tabButtons.forEach(button => {
        if (button.id === `tab-${tabId}`) {
            button.classList.add('active');
            button.setAttribute('aria-selected', 'true');
        } else {
            button.classList.remove('active');
            button.setAttribute('aria-selected', 'false');
        }
    });

    // Update tab content
    elements.tabContents.forEach(content => {
        if (content.id === `${tabId}-content`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });

    // Special handling for history tab
    if (tabId === 'history') {
        initWorkoutHistory();
    }
}

// Start a workout
async function startWorkout() {
    console.log('Starting workout');

    // Prevent multiple starts
    if (workoutState.isActive) return;

    // Ensure settings are initialized
    ensureSettingsInitialized();

    // Request wake lock if enabled
    if (appSettings.preventSleep) {
        requestWakeLock();
    }

    // Reset workout state
    workoutState = {
        isActive: true,
        isPaused: false,
        currentRound: 1,
        totalRounds: workoutConfig.rounds,
        isBreak: false,
        currentTime: workoutConfig.roundLength,
        totalTime: 0,
        interval: null,
        currentFocus: null,
        musicPlayer: null
    };

    // Update workout overlay info
    elements.workoutTitle.textContent = `${capitalizeFirstLetter(workoutConfig.difficulty)} Workout`;
    elements.workoutType.textContent = capitalizeFirstLetter(workoutConfig.workoutType);

    // Create round indicators
    createRoundIndicators();

    // Show workout overlay
    showWorkoutOverlay();

    // Select exercise focus for this round
    selectExerciseFocus();

    // Start music if enabled
    if (workoutConfig.music) {
        try {
            // Map workout type to music mood
            let musicMood = 'energetic';

            switch(workoutConfig.workoutType) {
                case 'striking':
                    musicMood = 'energetic';
                    break;
                case 'footwork':
                    musicMood = 'intense';
                    break;
                case 'defense':
                    musicMood = 'relaxed';
                    break;
                case 'conditioning':
                    musicMood = 'intense';
                    break;
                default:
                    musicMood = 'energetic';
            }

            workoutState.musicPlayer = await startMusic(musicMood, workoutConfig.musicVolume);
            if (elements.currentTrackName && workoutState.musicPlayer) {
                elements.currentTrackName.textContent = workoutState.musicPlayer.getCurrentTrackName() || 'Playing...';
            }
        } catch (error) {
            console.error('Error starting music:', error);
        }
    }

    // Start countdown if enabled
    if (workoutConfig.showCountdown) {
        startCountdown(() => {
            // Play start sound
            if (appSettings.sound) {
                playSound('start');
            }

            // Start the timer
            startTimer();

            // Announce round start
            if (appSettings.voice && appSettings.voice.enabled) {
                let focus = workoutState.currentFocus ? workoutState.currentFocus.focus : '';
                let instruction = workoutState.currentFocus ? workoutState.currentFocus.instruction : '';

                announceRoundStart(
                    workoutState.currentRound,
                    workoutState.totalRounds,
                    workoutConfig.workoutType,
                    focus,
                    instruction
                );
            }
        });
    } else {
        // Play start sound
        if (appSettings.sound) {
            playSound('start');
        }

        // Start the timer immediately
        startTimer();

        // Announce round start
        if (appSettings.voice && appSettings.voice.enabled) {
            let focus = workoutState.currentFocus ? workoutState.currentFocus.focus : '';
            let instruction = workoutState.currentFocus ? workoutState.currentFocus.instruction : '';

            announceRoundStart(
                workoutState.currentRound,
                workoutState.totalRounds,
                workoutConfig.workoutType,
                focus,
                instruction
            );
        }
    }
}

// Show the workout overlay
function showWorkoutOverlay() {
    elements.workoutActive.classList.add('active');
    // Remove aria-hidden when overlay is visible
    elements.workoutActive.setAttribute('aria-hidden', 'false');
    elements.workoutActive.removeAttribute('inert');
    document.body.classList.add('overlay-active');
}

// Hide the workout overlay
function hideWorkoutOverlay() {
    // Remove focus from any element inside the overlay before hiding
    if (document.activeElement && elements.workoutActive.contains(document.activeElement)) {
        document.activeElement.blur();
    }

    elements.workoutActive.classList.remove('active');
    // Set aria-hidden when overlay is hidden AND use inert attribute
    elements.workoutActive.setAttribute('aria-hidden', 'true');
    elements.workoutActive.setAttribute('inert', '');
    document.body.classList.remove('overlay-active');
}

// Create round indicators
function createRoundIndicators() {
    elements.roundIndicators.innerHTML = '';

    for (let i = 1; i <= workoutState.totalRounds; i++) {
        const indicator = document.createElement('div');
        indicator.className = 'indicator-dot';

        if (i === workoutState.currentRound) {
            indicator.classList.add('active');
        }

        elements.roundIndicators.appendChild(indicator);
    }
}

// Update round indicators
function updateRoundIndicators() {
    const indicators = elements.roundIndicators.querySelectorAll('.indicator-dot');

    indicators.forEach((indicator, index) => {
        indicator.classList.remove('active', 'completed');

        if (index + 1 < workoutState.currentRound) {
            indicator.classList.add('completed');
        } else if (index + 1 === workoutState.currentRound) {
            indicator.classList.add('active');
        }
    });
}

// Select a random exercise focus
function selectExerciseFocus() {
    const exercises = workoutContent[workoutConfig.workoutType];

    if (!exercises || exercises.length === 0) {
        console.error(`No exercises found for ${workoutConfig.workoutType}`);
        return;
    }

    // Get a random exercise that's different from the current one
    let randomIndex = Math.floor(Math.random() * exercises.length);

    // Try to get a different exercise than current if possible
    if (workoutState.currentFocus && exercises.length > 1) {
        let attempts = 0;
        const currentIndex = exercises.findIndex(ex => ex.focus === workoutState.currentFocus.focus);

        while (randomIndex === currentIndex && attempts < 5) {
            randomIndex = Math.floor(Math.random() * exercises.length);
            attempts++;
        }
    }

    workoutState.currentFocus = exercises[randomIndex];

    // Update UI
    if (elements.focusTitle && elements.focusInstruction && workoutState.currentFocus) {
        elements.focusTitle.textContent = workoutState.currentFocus.focus;
        elements.focusInstruction.textContent = workoutState.currentFocus.instruction || '';
    }
}

// Start the countdown before workout begins
function startCountdown(callback) {
    let count = 3;

    // Update UI
    elements.timerValue.textContent = count;
    elements.timerLabel.textContent = 'STARTING';
    elements.timerProgress.style.strokeDashoffset = '0';

    // Add pulse animation class
    elements.timerValue.classList.add('pulse-animation');

    // Start countdown
    const countdownInterval = setInterval(() => {
        count -= 1;

        if (count > 0) {
            // Update UI
            elements.timerValue.textContent = count;

            // Play sound
            if (appSettings.sound) {
                playCountdownSound();
            }

            // Announce countdown
            if (appSettings.voice && appSettings.voice.enabled && appSettings.voice.countdown) {
                announceCountdown(count);
            }
        } else {
            // Clear interval
            clearInterval(countdownInterval);

            // Remove pulse animation class
            elements.timerValue.classList.remove('pulse-animation');

            // Execute callback
            callback();
        }
    }, 1000);
}

// Start the timer
function startTimer() {
    // Initial UI update
    updateTimerUI();

    // Set interval
    workoutState.interval = setInterval(() => {
        // Decrease current time
        workoutState.currentTime -= 1;

        // Increase total time
        workoutState.totalTime += 1;

        // Update UI
        updateTimerUI();

        // Check if time is up
        if (workoutState.currentTime <= 0) {
            if (workoutState.isBreak) {
                endBreak();
            } else {
                endRound();
            }
        }

        // Random encouragement during round
        if (!workoutState.isBreak &&
            appSettings.voice &&
            appSettings.voice.enabled &&
            appSettings.voice.encouragement &&
            workoutState.currentTime > 5) {

            // 5% chance of encouragement each second
            if (Math.random() < 0.05) {
                announceEncouragement(workoutConfig.workoutType);
            }
        }

        // Play countdown sound for last 3 seconds
        if (workoutState.currentTime <= 3 && workoutState.currentTime > 0) {
            if (appSettings.sound) {
                playCountdownSound();
            }

            if (appSettings.voice && appSettings.voice.enabled && appSettings.voice.countdown) {
                announceCountdown(workoutState.currentTime);
            }
        }

    }, 1000);
}

// Update the timer UI
function updateTimerUI() {
    // Update timer value
    elements.timerValue.textContent = formatTime(workoutState.currentTime);

    // Update timer label
    if (workoutState.isBreak) {
        elements.timerLabel.textContent = 'REST';
    } else {
        elements.timerLabel.textContent = `ROUND ${workoutState.currentRound}`;
    }

    // Update progress circle
    const totalSeconds = workoutState.isBreak ? workoutConfig.breakLength : workoutConfig.roundLength;
    const progress = workoutState.currentTime / totalSeconds;
    const circumference = 2 * Math.PI * 45; // Circle has r=45
    const dashOffset = circumference * (1 - progress);
    elements.timerProgress.style.strokeDasharray = circumference;
    elements.timerProgress.style.strokeDashoffset = dashOffset;

    // Update round indicators
    updateRoundIndicators();
}

// End the current round
function endRound() {
    clearInterval(workoutState.interval);

    // Play round end sound
    if (appSettings.sound) {
        playSound('roundEnd');
    }

    const isLastRound = workoutState.currentRound >= workoutState.totalRounds;

    // Announce round end
    if (appSettings.voice && appSettings.voice.enabled) {
        announceRoundEnd(isLastRound);
    }

    if (isLastRound) {
        // End the workout
        completeWorkout();
    } else {
        // Start break
        startBreak();
    }
}

// Start a break between rounds
function startBreak() {
    workoutState.isBreak = true;
    workoutState.currentTime = workoutConfig.breakLength;

    // Update UI
    updateTimerUI();

    // Start timer
    startTimer();
}

// End the break
function endBreak() {
    clearInterval(workoutState.interval);

    // Play round start sound
    if (appSettings.sound) {
        playSound('roundStart');
    }

    // Move to next round
    workoutState.currentRound += 1;
    workoutState.isBreak = false;
    workoutState.currentTime = workoutConfig.roundLength;

    // Select new exercise focus
    selectExerciseFocus();

    // Announce break end and round start
    if (appSettings.voice && appSettings.voice.enabled) {
        announceBreakEnd();

        // Short delay before announcing round start
        setTimeout(() => {
            let focus = workoutState.currentFocus ? workoutState.currentFocus.focus : '';
            let instruction = workoutState.currentFocus ? workoutState.currentFocus.instruction : '';

            announceRoundStart(
                workoutState.currentRound,
                workoutState.totalRounds,
                workoutConfig.workoutType,
                focus,
                instruction
            );
        }, 1500);
    }

    // Update UI
    updateTimerUI();

    // Start timer
    startTimer();
}

// Toggle pause/resume workout
function togglePauseWorkout() {
    if (workoutState.isPaused) {
        // Resume workout
        resumeWorkout();
    } else {
        // Pause workout
        pauseWorkout();
    }
}

// Pause the workout
function pauseWorkout() {
    workoutState.isPaused = true;
    clearInterval(workoutState.interval);

    // Pause music
    if (workoutState.musicPlayer) {
        pauseMusic();
    }

    // Play pause sound
    if (appSettings.sound) {
        playSound('pause');
    }

    // Update button text
    elements.pauseWorkoutBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        RESUME
    `;

    // Add paused class to timer
    elements.timerValue.classList.add('paused');
}

// Resume the workout
function resumeWorkout() {
    workoutState.isPaused = false;

    // Resume music
    if (workoutConfig.music && workoutState.musicPlayer) {
        resumeMusic();
    }

    // Play resume sound
    if (appSettings.sound) {
        playSound('resume');
    }

    // Update button text
    elements.pauseWorkoutBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        PAUSE
    `;

    // Remove paused class from timer
    elements.timerValue.classList.remove('paused');

    // Restart the timer
    startTimer();
}

// Confirm ending the workout
function confirmEndWorkout() {
    if (workoutState.totalTime < 10) {
        // If workout just started, end without confirmation
        endWorkout();
    } else {
        // Pause the workout
        if (!workoutState.isPaused) {
            pauseWorkout();
        }

        // Show confirmation dialog
        const confirmed = confirm('Are you sure you want to end your workout?');

        if (confirmed) {
            endWorkout();
        } else {
            // Resume if the user was not paused before
            if (!workoutState.isPaused) {
                resumeWorkout();
            }
        }
    }
}

// End the workout without completing
function endWorkout() {
    clearInterval(workoutState.interval);

    // Stop music
    if (workoutState.musicPlayer) {
        stopMusic();
    }

    // Stop voice announcements
    stopAllAnnouncements();

    // Release wake lock
    releaseWakeLock();

    // Reset workout state
    workoutState.isActive = false;
    workoutState.isPaused = false;

    // Hide workout overlay
    hideWorkoutOverlay();

    // Reset UI elements
    elements.timerValue.classList.remove('paused');
    elements.pauseWorkoutBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        PAUSE
    `;

    // Show completion screen if more than 1 minute of workout completed
    if (workoutState.totalTime >= 60) {
        completeWorkout();
    }
}

// Complete the workout
function completeWorkout() {
    // Clear any remaining intervals
    clearInterval(workoutState.interval);

    // Stop music
    if (workoutState.musicPlayer) {
        stopMusic();
    }

    // Play complete sound
    if (appSettings.sound) {
        playSound('complete');
    }

    // Release wake lock
    releaseWakeLock();

    // Save workout to history
    let workoutSummary;
    try {
        if (typeof saveWorkoutHistory === 'function') {
            workoutSummary = saveWorkoutHistory();
        }
    } catch (error) {
        console.error('Error saving workout history:', error);
    }

    // Update summary view
    elements.summaryRounds.textContent = workoutState.currentRound;
    elements.summaryTime.textContent = formatTime(workoutState.totalTime);
    elements.summaryLevel.textContent = capitalizeFirstLetter(workoutConfig.difficulty);
    elements.summaryType.textContent = capitalizeFirstLetter(workoutConfig.workoutType);

    // Hide workout overlay and show completion
    hideWorkoutOverlay();
    showWorkoutComplete();
}

// Show workout complete overlay
function showWorkoutComplete() {
    elements.workoutComplete.classList.add('active');
    elements.workoutComplete.setAttribute('aria-hidden', 'false');
    elements.workoutComplete.removeAttribute('inert');
    document.body.classList.add('overlay-active');
}

// Hide workout complete overlay
function hideWorkoutComplete() {
    // Remove focus from any element inside the overlay before hiding
    if (document.activeElement && elements.workoutComplete.contains(document.activeElement)) {
        document.activeElement.blur();
    }

    elements.workoutComplete.classList.remove('active');
    elements.workoutComplete.setAttribute('aria-hidden', 'true');
    elements.workoutComplete.setAttribute('inert', '');
    document.body.classList.remove('overlay-active');
}

// Share workout results
function shareWorkout() {
    const minutes = Math.floor(workoutState.totalTime / 60);
    const seconds = workoutState.totalTime % 60;
    const timeString = `${minutes}m ${seconds}s`;

    const shareText = `Just completed a ${capitalizeFirstLetter(workoutConfig.difficulty)} ${capitalizeFirstLetter(workoutConfig.workoutType)} workout on HeavyHITR! ${workoutState.currentRound} rounds in ${timeString}. 🥊💪 #HeavyHITR #Boxing`;

    // Check if Web Share API is supported
    if (navigator.share) {
        navigator.share({
            title: 'HeavyHITR Workout Complete',
            text: shareText
        }).catch(error => {
            console.log('Error sharing:', error);
            fallbackShare(shareText);
        });
    } else {
        fallbackShare(shareText);
    }
}

// Fallback share method (copy to clipboard)
function fallbackShare(text) {
    // Create a temporary input element
    const input = document.createElement('textarea');
    input.value = text;
    document.body.appendChild(input);

    // Select and copy the text
    input.select();
    document.execCommand('copy');

    // Remove the input element
    document.body.removeChild(input);

    // Show confirmation
    alert('Copied to clipboard! You can paste this in your social media posts.');
}

// Request wake lock to keep screen on
async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Wake Lock is active');

            // Add event listener for visibility change
            document.addEventListener('visibilitychange', handleVisibilityChange);
        }
    } catch (error) {
        console.error('Wake Lock request failed:', error);
    }
}

// Release wake lock
function releaseWakeLock() {
    if (wakeLock) {
        try {
            wakeLock.release();
            wakeLock = null;
            console.log('Wake Lock released');

            // Remove event listener
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        } catch (error) {
            console.error('Failed to release Wake Lock:', error);
        }
    }
}

// Handle visibility change for wake lock
async function handleVisibilityChange() {
    if (document.visibilityState === 'visible' && wakeLock === null) {
        requestWakeLock();
    }
}

// iOS Audio Context unlocking
function setupIOSAudioUnlock() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (isIOS) {
        console.log('iOS device detected, setting up audio unlocking');

        // Function to unlock audio
        function unlockAudio() {
            // Create a temporary Howl
            const unlockHowl = new Howl({
                src: ['audio/tap.mp3'],
                volume: 0.01,
                onend: function() {
                    console.log('Audio context unlocked');
                }
            });

            // Try to play it
            unlockHowl.play();
        }

        // Try to unlock on user interaction
        document.addEventListener('touchend', unlockAudio, { once: true });
        document.addEventListener('click', unlockAudio, { once: true });
    }
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Expose public methods for global access if needed
window.HeavyHITR = {
    activateTab: activateTab,
    startWorkout: startWorkout
};