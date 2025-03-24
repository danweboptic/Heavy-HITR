/**
 * HeavyHITR - Main Application
 * Entry point for the application
 * @author danweboptic
 * @lastUpdated 2025-03-21 15:52:10
 */

import {
    workoutConfig,
    workoutState,
    musicSettings,
    voiceSettings,
    appSettings,
    loadSettings,
    saveWorkoutConfig,
    saveAppSettings,
    saveVoiceSettings
} from './settings.js';

import {
    initCalendar,
    updateWorkoutStats,
    saveWorkoutHistory,
    repeatWorkout
} from './history.js';

import { formatTime, capitalizeFirstLetter } from './utils.js';

import {
    initVoiceCoach,
    announceCountdown,
    announceRoundStart,
    announceRoundEnd,
    announceBreakEnd,
    announceEncouragement,
    testVoice
} from './voice.js';

// Import workout content data
import { workoutContent, coachMessages } from './data.js';

// Global variables
const elements = {};

// Initialize the application
function init() {
    console.log('HeavyHITR App Initializing...');

    // Get all DOM elements
    cacheElements();

    // Load saved settings
    loadSettings();

    // Initialize UI with loaded settings
    initUI();

    // Set up event listeners
    setupEventListeners();

    // Initialize voice coach
    initVoiceCoach();

    // Initialize history calendar
    initCalendar();

    // Update workout statistics
    updateWorkoutStats();

    console.log('HeavyHITR App Initialized');
}

// Cache DOM elements for better performance
function cacheElements() {
    // Tab navigation
    elements.tabButtons = document.querySelectorAll('.tab-btn');
    elements.tabContents = document.querySelectorAll('.tab-content');

    // Workout type selection
    elements.categoryCards = document.querySelectorAll('.category-card');

    // Configuration elements
    elements.roundsSlider = document.getElementById('rounds');
    elements.roundsValue = document.getElementById('rounds-value');
    elements.roundLengthSlider = document.getElementById('round-length');
    elements.roundLengthValue = document.getElementById('round-length-value');
    elements.breakLengthSlider = document.getElementById('break-length');
    elements.breakLengthValue = document.getElementById('break-length-value');
    elements.difficultyBtns = document.querySelectorAll('.difficulty-btn');

    // Music controls
    elements.toggleMusicBtn = document.getElementById('toggle-music');
    elements.musicStatus = document.getElementById('music-status');
    elements.musicVolumeSlider = document.getElementById('music-volume');

    // Custom workout elements
    elements.startCustomWorkoutBtn = document.getElementById('start-workout');

    // Active workout elements
    elements.workoutActiveOverlay = document.getElementById('workout-active');
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

    // Workout complete elements
    elements.workoutCompleteOverlay = document.getElementById('workout-complete');
    elements.summaryRounds = document.getElementById('summary-rounds');
    elements.summaryTime = document.getElementById('summary-time');
    elements.summaryLevel = document.getElementById('summary-level');
    elements.summaryType = document.getElementById('summary-type');
    elements.shareWorkoutBtn = document.getElementById('share-workout');
    elements.newWorkoutBtn = document.getElementById('new-workout');

    // Settings elements
    elements.soundEffectsToggle = document.getElementById('sound-toggle');
    elements.voiceCoachToggle = document.getElementById('voice-toggle');
    elements.voiceTypeSelect = document.getElementById('voice-type');
    elements.voiceVolumeSlider = document.getElementById('voice-volume');
    elements.voiceVolumeValue = document.getElementById('voice-volume-value');
    elements.voiceCountdownToggle = document.getElementById('voice-countdown-toggle');
    elements.voiceEncouragementToggle = document.getElementById('voice-encouragement-toggle');
    elements.voiceInstructionsToggle = document.getElementById('voice-instructions-toggle');
    elements.testVoiceBtn = document.getElementById('test-voice-btn');
    elements.countdownTimerToggle = document.getElementById('countdown-toggle');
    elements.screenLockToggle = document.getElementById('screenlock-toggle');
    elements.userWeightInput = document.getElementById('user-weight');
    elements.weightUnitSelect = document.getElementById('weight-unit');
    elements.clearHistoryBtn = document.getElementById('clear-history-btn');
    elements.resetSettingsBtn = document.getElementById('reset-settings-btn');
}

// Initialize UI with loaded settings
function initUI() {
    // Set initial values for sliders
    if (elements.roundsSlider && elements.roundsValue) {
        elements.roundsSlider.value = workoutConfig.rounds;
        elements.roundsValue.textContent = workoutConfig.rounds;
    }

    if (elements.roundLengthSlider && elements.roundLengthValue) {
        elements.roundLengthSlider.value = workoutConfig.roundLength;
        elements.roundLengthValue.textContent = formatTime(workoutConfig.roundLength);
    }

    if (elements.breakLengthSlider && elements.breakLengthValue) {
        elements.breakLengthSlider.value = workoutConfig.breakLength;
        elements.breakLengthValue.textContent = formatTime(workoutConfig.breakLength);
    }

    // Set active difficulty button
    if (elements.difficultyBtns) {
        elements.difficultyBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.level === workoutConfig.difficulty) {
                btn.classList.add('active');
            }
        });
    }

    // Set active workout type
    if (elements.categoryCards) {
        elements.categoryCards.forEach(card => {
            card.classList.remove('active');
            if (card.dataset.type === workoutConfig.workoutType) {
                card.classList.add('active');
            }
        });
    }

    // Initialize settings controls

    // Sound effects toggle
    if (elements.soundEffectsToggle) {
        elements.soundEffectsToggle.checked = appSettings.soundEffects;
    }

    // Voice coach settings
    if (elements.voiceCoachToggle) {
        elements.voiceCoachToggle.checked = voiceSettings.enabled;
    }

    if (elements.voiceTypeSelect) {
        elements.voiceTypeSelect.value = voiceSettings.voice;
    }

    if (elements.voiceVolumeSlider && elements.voiceVolumeValue) {
        elements.voiceVolumeSlider.value = voiceSettings.volume;
        elements.voiceVolumeValue.textContent = `${Math.round(voiceSettings.volume * 100)}%`;
    }

    if (elements.voiceCountdownToggle) {
        elements.voiceCountdownToggle.checked = voiceSettings.countdown;
    }

    if (elements.voiceEncouragementToggle) {
        elements.voiceEncouragementToggle.checked = voiceSettings.encouragement;
    }

    if (elements.voiceInstructionsToggle) {
        elements.voiceInstructionsToggle.checked = voiceSettings.instructions;
    }

    // Other workout settings
    if (elements.countdownTimerToggle) {
        elements.countdownTimerToggle.checked = appSettings.countdownTimer;
    }

    if (elements.screenLockToggle) {
        elements.screenLockToggle.checked = appSettings.screenLock;
    }

    if (elements.userWeightInput && elements.weightUnitSelect) {
        elements.userWeightInput.value = appSettings.weight || 70;
        elements.weightUnitSelect.value = appSettings.weightUnit || 'kg';
    }

    // Initialize music controls
    if (elements.musicStatus) {
        elements.musicStatus.textContent = musicSettings.enabled ? 'ON' : 'OFF';
    }

    if (elements.musicVolumeSlider) {
        elements.musicVolumeSlider.value = musicSettings.volume;
    }

    // Show/hide voice settings based on toggle state
    const voiceSettingsContainer = document.getElementById('voice-settings');
    if (voiceSettingsContainer) {
        voiceSettingsContainer.style.display = voiceSettings.enabled ? 'block' : 'none';
    }
}

// Set up all event listeners
function setupEventListeners() {
    // Tab navigation
    if (elements.tabButtons) {
        elements.tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.id.replace('tab-', '');
                activateTab(tabId);
            });
        });
    }

    // Workout category selection
    if (elements.categoryCards) {
        elements.categoryCards.forEach(card => {
            card.addEventListener('click', () => {
                elements.categoryCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                workoutConfig.workoutType = card.dataset.type;
                saveWorkoutConfig();
            });
        });
    }

    // Workout configuration sliders
    if (elements.roundsSlider && elements.roundsValue) {
        elements.roundsSlider.addEventListener('input', function() {
            workoutConfig.rounds = parseInt(this.value);
            elements.roundsValue.textContent = this.value;
            saveWorkoutConfig();
        });
    }

    if (elements.roundLengthSlider && elements.roundLengthValue) {
        elements.roundLengthSlider.addEventListener('input', function() {
            workoutConfig.roundLength = parseInt(this.value);
            elements.roundLengthValue.textContent = formatTime(this.value);
            saveWorkoutConfig();
        });
    }

    if (elements.breakLengthSlider && elements.breakLengthValue) {
        elements.breakLengthSlider.addEventListener('input', function() {
            workoutConfig.breakLength = parseInt(this.value);
            elements.breakLengthValue.textContent = formatTime(this.value);
            saveWorkoutConfig();
        });
    }

    // Difficulty buttons
    if (elements.difficultyBtns) {
        elements.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                elements.difficultyBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                workoutConfig.difficulty = this.dataset.level;
                saveWorkoutConfig();
            });
        });
    }

    // Voice coach settings
    if (elements.voiceCoachToggle) {
        elements.voiceCoachToggle.addEventListener('change', function() {
            voiceSettings.enabled = this.checked;
            saveVoiceSettings();

            // Show/hide voice settings
            const voiceSettingsContainer = document.getElementById('voice-settings');
            if (voiceSettingsContainer) {
                voiceSettingsContainer.style.display = this.checked ? 'block' : 'none';
            }
        });
    }

    if (elements.voiceTypeSelect) {
        elements.voiceTypeSelect.addEventListener('change', function() {
            voiceSettings.voice = this.value;
            saveVoiceSettings();
        });
    }

    if (elements.voiceVolumeSlider && elements.voiceVolumeValue) {
        elements.voiceVolumeSlider.addEventListener('input', function() {
            voiceSettings.volume = parseFloat(this.value);
            elements.voiceVolumeValue.textContent = `${Math.round(voiceSettings.volume * 100)}%`;
            saveVoiceSettings();
        });
    }

    if (elements.voiceCountdownToggle) {
        elements.voiceCountdownToggle.addEventListener('change', function() {
            voiceSettings.countdown = this.checked;
            saveVoiceSettings();
        });
    }

    if (elements.voiceEncouragementToggle) {
        elements.voiceEncouragementToggle.addEventListener('change', function() {
            voiceSettings.encouragement = this.checked;
            saveVoiceSettings();
        });
    }

    if (elements.voiceInstructionsToggle) {
        elements.voiceInstructionsToggle.addEventListener('change', function() {
            voiceSettings.instructions = this.checked;
            saveVoiceSettings();
        });
    }

    if (elements.testVoiceBtn) {
        elements.testVoiceBtn.addEventListener('click', testVoice);
    }

    // Other settings
    if (elements.soundEffectsToggle) {
        elements.soundEffectsToggle.addEventListener('change', function() {
            appSettings.soundEffects = this.checked;
            saveAppSettings();
        });
    }

    if (elements.countdownTimerToggle) {
        elements.countdownTimerToggle.addEventListener('change', function() {
            appSettings.countdownTimer = this.checked;
            saveAppSettings();
        });
    }

    if (elements.screenLockToggle) {
        elements.screenLockToggle.addEventListener('change', function() {
            appSettings.screenLock = this.checked;
            saveAppSettings();

            if (this.checked) {
                // Request wake lock to prevent screen from turning off
                requestWakeLock();
            } else {
                // Release wake lock if it exists
                releaseWakeLock();
            }
        });
    }

    if (elements.userWeightInput) {
        elements.userWeightInput.addEventListener('change', function() {
            appSettings.weight = parseInt(this.value) || 70;
            saveAppSettings();
        });
    }

    if (elements.weightUnitSelect) {
        elements.weightUnitSelect.addEventListener('change', function() {
            appSettings.weightUnit = this.value;
            saveAppSettings();
        });
    }

    if (elements.clearHistoryBtn) {
        elements.clearHistoryBtn.addEventListener('click', function() {
            if (confirm("Are you sure you want to clear all workout history? This action cannot be undone.")) {
                localStorage.removeItem('heavyhitr-workout-history');
                initCalendar();
                updateWorkoutStats();
                alert("Workout history cleared.");
            }
        });
    }

    if (elements.resetSettingsBtn) {
        elements.resetSettingsBtn.addEventListener('click', function() {
            if (confirm("Are you sure you want to reset all settings to default values? This will not affect workout history.")) {
                // Reset settings
                localStorage.removeItem('heavyhitr-config');
                localStorage.removeItem('heavyhitr-music');
                localStorage.removeItem('heavyhitr-voice');
                localStorage.removeItem('heavyhitr-app');

                // Reload the page to apply defaults
                location.reload();
            }
        });
    }

    // Music controls
    if (elements.toggleMusicBtn && elements.musicStatus) {
        elements.toggleMusicBtn.addEventListener('click', () => {
            musicSettings.enabled = !musicSettings.enabled;
            elements.musicStatus.textContent = musicSettings.enabled ? 'ON' : 'OFF';
        });
    }

    if (elements.musicVolumeSlider) {
        elements.musicVolumeSlider.addEventListener('input', function() {
            musicSettings.volume = parseFloat(this.value);
        });
    }

    // Start workout button
    if (elements.startCustomWorkoutBtn) {
        elements.startCustomWorkoutBtn.addEventListener('click', startWorkout);
    }

    // Workout control buttons
    if (elements.pauseWorkoutBtn) {
        elements.pauseWorkoutBtn.addEventListener('click', pauseWorkout);
    }

    if (elements.endWorkoutBtn) {
        elements.endWorkoutBtn.addEventListener('click', endWorkout);
    }

    if (elements.workoutCloseBtn) {
        elements.workoutCloseBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to end this workout?')) {
                endWorkout();
            }
        });
    }

    // Share workout button
    if (elements.shareWorkoutBtn) {
        elements.shareWorkoutBtn.addEventListener('click', shareWorkout);
    }

    // New workout button
    if (elements.newWorkoutBtn) {
        elements.newWorkoutBtn.addEventListener('click', () => {
            elements.workoutCompleteOverlay.classList.remove('active');
            activateTab('workouts');
        });
    }
}

// Tab navigation
function activateTab(tabId) {
    // Update tab buttons
    elements.tabButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.id === `tab-${tabId}`) {
            btn.classList.add('active');
        }
    });

    // Update tab content
    elements.tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${tabId}-content`) {
            content.classList.add('active');
        }
    });
}

// Start workout
function startWorkout() {
    // Initialize workout state
    workoutState.isRunning = true;
    workoutState.isPaused = false;
    workoutState.currentRound = 1;
    workoutState.isBreak = false;
    workoutState.timeRemaining = workoutConfig.roundLength;
    workoutState.totalTime = 0;
    workoutState.startTime = new Date();
    workoutState.exerciseIndex = 0;

    // Show workout overlay
    if (elements.workoutActiveOverlay) {
        if (elements.workoutTitle) {
            elements.workoutTitle.textContent = capitalizeFirstLetter(workoutConfig.difficulty);
        }

        if (elements.workoutType) {
            elements.workoutType.textContent = capitalizeFirstLetter(workoutConfig.workoutType);
        }

        // Show the overlay
        elements.workoutActiveOverlay.classList.add('active');

        // Create round indicators
        updateRoundIndicators();
    }

    // Start workout timer
    updateTimerDisplay();

    // Update workout focus
    updateWorkoutFocus();

    // Hide the coach message
    if (elements.coachMessage) {
        elements.coachMessage.style.display = 'none';
    }

    // If enabled, request wake lock to prevent screen from turning off
    if (appSettings.screenLock) {
        requestWakeLock();
    }

    // Play start sound
    if (appSettings.soundEffects) {
        playSound('start');
    }

    // Announce round start with voice coach
    announceRoundStart(workoutState.currentRound, workoutConfig.rounds, workoutConfig.workoutType);

    // Start the timer interval
    workoutState.interval = setInterval(updateWorkoutTimer, 1000);
}

// Update round indicators
function updateRoundIndicators() {
    if (!elements.roundIndicators) return;

    // Clear existing indicators
    elements.roundIndicators.innerHTML = '';

    // Create new indicators
    for (let i = 1; i <= workoutConfig.rounds; i++) {
        const dot = document.createElement('div');
        dot.className = 'indicator-dot';

        if (i < workoutState.currentRound) {
            dot.classList.add('completed');
        } else if (i === workoutState.currentRound) {
            dot.classList.add('active');
        }

        elements.roundIndicators.appendChild(dot);
    }
}

// Update workout focus for current round
function updateWorkoutFocus() {
    if (!elements.focusTitle || !elements.focusInstruction) return;

    const workoutType = workoutConfig.workoutType;

    // Check if we have content for this workout type
    if (workoutContent[workoutType]) {
        // Get content for current exercise index
        const exercises = workoutContent[workoutType];
        const index = workoutState.exerciseIndex % exercises.length;
        const exercise = exercises[index];

        elements.focusTitle.textContent = exercise.focus;
        elements.focusInstruction.textContent = exercise.instruction;
    } else {
        // Fallback if no content is available
        elements.focusTitle.textContent = capitalizeFirstLetter(workoutType) + " Training";
        elements.focusInstruction.textContent = "Focus on proper form and intensity";
    }
}

// Update coach message
function updateCoachMessage(message) {
    if (!elements.coachMessage) return;

    if (!message) {
        elements.coachMessage.style.display = 'none';
        return;
    }

    // Show and update the coach message
    elements.coachMessage.style.display = 'block';
    elements.coachMessage.innerHTML = `<div class="focus-instruction">${message}</div>`;

    // Auto-hide after 3 seconds
    setTimeout(() => {
        if (elements.coachMessage) {
            elements.coachMessage.style.display = 'none';
        }
    }, 3000);
}

// Update timer display
function updateTimerDisplay() {
    if (!elements.timerValue || !elements.timerLabel) return;

    // Update the time value
    elements.timerValue.textContent = formatTime(workoutState.timeRemaining);

    // Update the label
    if (workoutState.isBreak) {
        elements.timerLabel.textContent = 'REST';
    } else {
        elements.timerLabel.textContent = `ROUND ${workoutState.currentRound}`;
    }

    // Update circular progress
    if (elements.timerProgress) {
        const totalTime = workoutState.isBreak ? workoutConfig.breakLength : workoutConfig.roundLength;
        const progress = (totalTime - workoutState.timeRemaining) / totalTime;

        const circumference = 2 * Math.PI * 45; // 45 is the radius of our circle
        const dashOffset = circumference - (progress * circumference);
        elements.timerProgress.style.strokeDasharray = circumference;
        elements.timerProgress.style.strokeDashoffset = dashOffset;
    }

    // Add pulse animation for last few seconds
    if (workoutState.timeRemaining <= 5) {
        elements.timerValue.classList.add('pulse-animation');
    } else {
        elements.timerValue.classList.remove('pulse-animation');
    }
}

// Update workout timer
function updateWorkoutTimer() {
    if (workoutState.isPaused) return;

    workoutState.timeRemaining--;
    workoutState.totalTime++;

    // Update timer display
    updateTimerDisplay();

    // Check if time is up for current round or break
    if (workoutState.timeRemaining <= 0) {
        if (workoutState.isBreak) {
            // Break is over, start new round
            workoutState.isBreak = false;
            workoutState.currentRound++;

            // Increment exercise index for workout focus
            workoutState.exerciseIndex++;

            // Check if workout is complete
            if (workoutState.currentRound > workoutConfig.rounds) {
                completeWorkout();
                return;
            }

            // Setup for new round
            workoutState.timeRemaining = workoutConfig.roundLength;

            // Update UI
            updateRoundIndicators();
            updateWorkoutFocus();

            // Show coach message
            updateCoachMessage(`Round ${workoutState.currentRound} - Let's go!`);

            // Play round start sound
            if (appSettings.soundEffects) {
                playSound('roundStart');
            }

            // Announce round start with voice coach
            announceRoundStart(workoutState.currentRound, workoutConfig.rounds, workoutConfig.workoutType);
        } else {
            // Round is over, start break (unless it's the last round)
            if (workoutState.currentRound === workoutConfig.rounds) {
                completeWorkout();
                return;
            }

            workoutState.isBreak = true;
            workoutState.timeRemaining = workoutConfig.breakLength;

            // Show coach message
            updateCoachMessage('Rest and recover. Next round coming up.');

            // Play round end sound
            if (appSettings.soundEffects) {
                playSound('roundEnd');
            }

            // Announce round end with voice coach
            announceRoundEnd(false);
        }
    } else {
        // For countdown timer in last seconds of round or break
        if (appSettings.countdownTimer && workoutState.timeRemaining <= 3) {
            // Play countdown sound
            if (appSettings.soundEffects) {
                playSound('countdown');
            }

            // Announce countdown
            announceCountdown(workoutState.timeRemaining);

            // Show countdown in coach message
            updateCoachMessage(`${workoutState.timeRemaining}...`);
        }

        // Encourage during workout with voice coach (approximately every 20 seconds)
        if (!workoutState.isBreak &&
            workoutState.timeRemaining % 20 === 0 &&
            workoutState.timeRemaining > 5 &&
            workoutState.timeRemaining < workoutConfig.roundLength - 5) {

            // Get a random encouragement message
            const encouragementMessages = coachMessages.encouragement || [
                "Keep it up! You're doing great!",
                "Stay strong! Push through!",
                "That's it! Keep that energy!"
            ];

            const message = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];

            // Show coach message
            updateCoachMessage(message);

            // Announce with voice coach
            announceEncouragement(workoutConfig.workoutType);
        }

        // Announce halfway through long rounds
        if (!workoutState.isBreak &&
            workoutConfig.roundLength >= 60 &&
            workoutState.timeRemaining === Math.floor(workoutConfig.roundLength / 2)) {
            updateCoachMessage('Halfway there!');
        }

        // Announce when break is almost over
        if (workoutState.isBreak && workoutState.timeRemaining === 5) {
            updateCoachMessage('Get ready, next round starting soon.');
            announceBreakEnd();
        }
    }
}

// Pause or resume workout
function pauseWorkout() {
    workoutState.isPaused = !workoutState.isPaused;

    // Play pause/resume sound
    if (appSettings.soundEffects) {
        playSound(workoutState.isPaused ? 'pause' : 'resume');
    }

    // Update coach message
    if (workoutState.isPaused) {
        updateCoachMessage('Workout paused. Resume when ready.');
    } else {
        updateCoachMessage('Workout resumed. Keep going!');
    }

    // Update pause button text
    if (elements.pauseWorkoutBtn) {
        if (workoutState.isPaused) {
            elements.pauseWorkoutBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                RESUME
            `;
        } else {
            elements.pauseWorkoutBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                PAUSE
            `;
        }
    }
}

// Complete workout
function completeWorkout() {
    // Stop the timer
    clearInterval(workoutState.interval);
    workoutState.isRunning = false;

    // Play workout complete sound
    if (appSettings.soundEffects) {
        playSound('complete');
    }

    // Announce workout completion with voice coach
    announceRoundEnd(true);

    // Save workout to history
    const workoutSummary = saveWorkoutHistory();

    // Show workout completion screen
    showWorkoutComplete(workoutSummary);

    // Release wake lock if it was requested
    releaseWakeLock();
}

// End workout early
function endWorkout() {
    // Stop the timer
    clearInterval(workoutState.interval);
    workoutState.isRunning = false;

    // Calculate total time spent
    if (workoutState.startTime) {
        const endTime = new Date();
        workoutState.totalTime = Math.floor((endTime - workoutState.startTime) / 1000);
    }

    // Save workout to history
    const workoutSummary = saveWorkoutHistory();

    // Show workout completion screen
    showWorkoutComplete(workoutSummary);

    // Release wake lock if it was requested
    releaseWakeLock();
}

// Show workout completion screen
function showWorkoutComplete(workoutSummary) {
    if (!elements.workoutCompleteOverlay) return;

    // Hide workout active overlay
    if (elements.workoutActiveOverlay) {
        elements.workoutActiveOverlay.classList.remove('active');
    }

    // Show completion overlay
    elements.workoutCompleteOverlay.classList.add('active');

    // Update summary stats
    if (elements.summaryRounds) {
        elements.summaryRounds.textContent = workoutState.currentRound;
    }

    if (elements.summaryTime) {
        elements.summaryTime.textContent = formatTime(workoutState.totalTime);
    }

    if (elements.summaryLevel) {
        elements.summaryLevel.textContent = capitalizeFirstLetter(workoutConfig.difficulty);
    }

    if (elements.summaryType) {
        elements.summaryType.textContent = capitalizeFirstLetter(workoutConfig.workoutType);
    }
}

// Share workout functionality
function shareWorkout() {
    // Check if Web Share API is available
    if (navigator.share) {
        const shareData = {
            title: 'HeavyHITR Workout',
            text: `Just completed a ${capitalizeFirstLetter(workoutConfig.difficulty)} ${capitalizeFirstLetter(workoutConfig.workoutType)} workout with ${workoutState.currentRound} rounds in ${formatTime(workoutState.totalTime)}!`,
            url: window.location.href
        };

        navigator.share(shareData)
            .then(() => console.log('Successful share'))
            .catch((error) => console.error('Error sharing:', error));
    } else {
        // Fallback for browsers that don't support the Web Share API
        alert('Share feature is not supported in your browser. Try copying this link manually:\n\n' + window.location.href);
    }
}

// Sound effects
function playSound(type) {
    // Import directly to avoid circular dependencies
    import('./audio.js').then(audio => {
        audio.playSound(type);
    });
}

// Screen Wake Lock API
let wakeLock = null;

// Request a wake lock to prevent the screen from turning off
async function requestWakeLock() {
    if ('wakeLock' in navigator) {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Wake Lock is active');

            wakeLock.addEventListener('release', () => {
                console.log('Wake Lock was released');
            });
        } catch (error) {
            console.error('Could not obtain Wake Lock:', error);
        }
    } else {
        console.warn('Wake Lock API is not supported in this browser');
    }
}

// Release the wake lock
function releaseWakeLock() {
    if (wakeLock !== null) {
        wakeLock.release()
            .then(() => {
                wakeLock = null;
                console.log('Wake Lock released');
            })
            .catch((error) => {
                console.error('Error releasing Wake Lock:', error);
            });
    }
}

// Run initialization when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM already loaded
    init();
}

// Expose functions that need to be accessed globally
window.HeavyHITR = {
    startWorkout,
    pauseWorkout,
    endWorkout,
    repeatWorkout,
    activateTab
};