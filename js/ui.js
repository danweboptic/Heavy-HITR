/**
 * HeavyHITR - UI Module
 * Handles UI updates and interactions
 * @author danweboptic
 * @lastUpdated 2025-03-24 12:01:35
 */
import { workoutConfig, workoutState } from './settings.js';
import { saveSettings } from './config.js';
import { initAudio, playSound } from './audio.js';
import { startWorkout, pauseWorkout, endWorkout } from './workout.js';
import { formatTime } from './utils.js';

// UI Elements collection
export const elements = {
    // Tab navigation
    tabButtons: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),

    // Workout type selection
    categoryCards: document.querySelectorAll('.category-card'),

    // Configuration elements
    roundsSlider: document.getElementById('rounds'),
    roundsValue: document.getElementById('rounds-value'),
    roundLengthSlider: document.getElementById('round-length'),
    roundLengthValue: document.getElementById('round-length-value'),
    breakLengthSlider: document.getElementById('break-length'),
    breakLengthValue: document.getElementById('break-length-value'),
    difficultyBtns: document.querySelectorAll('.difficulty-btn'),

    // Preset workout elements
    presetCards: document.querySelectorAll('.preset-card'),
    presetStartBtns: document.querySelectorAll('.preset-start-btn'),

    // Music controls
    toggleMusicBtn: document.getElementById('toggle-music'),
    musicStatus: document.getElementById('music-status'),
    musicVolumeSlider: document.getElementById('music-volume'),

    // Custom workout elements
    startCustomWorkoutBtn: document.getElementById('start-workout'),

    // Active workout elements
    workoutActiveOverlay: document.getElementById('workout-active'),
    workoutTitle: document.querySelector('.workout-title'),
    workoutType: document.querySelector('.workout-type'),
    timerValue: document.getElementById('timer-value'),
    timerLabel: document.getElementById('timer-label'),
    timerProgress: document.getElementById('timer-progress'),
    roundIndicators: document.getElementById('round-indicators'),
    focusTitle: document.getElementById('focus-title'),
    focusInstruction: document.getElementById('focus-instruction'),
    coachMessage: document.getElementById('coach-message'),
    pauseWorkoutBtn: document.getElementById('pause-workout'),
    endWorkoutBtn: document.getElementById('end-workout'),
    workoutCloseBtn: document.getElementById('workout-close'),

    // Workout complete elements
    workoutCompleteOverlay: document.getElementById('workout-complete'),
    summaryRounds: document.getElementById('summary-rounds'),
    summaryTime: document.getElementById('summary-time'),
    summaryLevel: document.getElementById('summary-level'),
    summaryType: document.getElementById('summary-type'),
    shareWorkoutBtn: document.getElementById('share-workout'),
    newWorkoutBtn: document.getElementById('new-workout')
};

// Initialize UI elements with settings values
export function initUI() {
    // Set initial values for sliders
    elements.roundsSlider.value = workoutConfig.rounds;
    elements.roundsValue.textContent = workoutConfig.rounds;

    elements.roundLengthSlider.value = workoutConfig.roundLength;
    elements.roundLengthValue.textContent = formatTime(workoutConfig.roundLength);

    elements.breakLengthSlider.value = workoutConfig.breakLength;
    elements.breakLengthValue.textContent = formatTime(workoutConfig.breakLength);

    // Set active difficulty button
    elements.difficultyBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.level === workoutConfig.difficulty) {
            btn.classList.add('active');
        }
    });

    // Set active workout type
    elements.categoryCards.forEach(card => {
        card.classList.remove('active');
        if (card.dataset.type === workoutConfig.workoutType) {
            card.classList.add('active');
        }
    });
}

// Set up all UI event listeners
export function setupUIEventListeners() {
    // Tab buttons
    elements.tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Play UI sound
            playSound('tap');

            const tabId = button.id.replace('tab-', '');
            activateTab(tabId);
        });
    });

    // Workout category selection
    elements.categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            // Play UI sound
            playSound('tap');

            // Remove active class from all cards
            elements.categoryCards.forEach(c => c.classList.remove('active'));

            // Add active class to clicked card
            card.classList.add('active');

            // Update workout config
            workoutConfig.workoutType = card.dataset.type;
            saveSettings();
        });
    });

    // Preset workout start buttons
    elements.presetStartBtns.forEach(button => {
        button.addEventListener('click', () => {
            // Play UI sound
            playSound('tap');

            const preset = button.parentElement.dataset.preset;

            switch(preset) {
                case 'quick':
                    workoutConfig.rounds = 3;
                    workoutConfig.roundLength = 60;
                    workoutConfig.breakLength = 15;
                    break;
                case 'standard':
                    workoutConfig.rounds = 6;
                    workoutConfig.roundLength = 90;
                    workoutConfig.breakLength = 30;
                    break;
                case 'full':
                    workoutConfig.rounds = 12;
                    workoutConfig.roundLength = 120;
                    workoutConfig.breakLength = 30;
                    break;
            }

            saveSettings();
            initAudio();
            startWorkout();
        });
    });

    // Custom workout sliders
    elements.roundsSlider.addEventListener('input', function() {
        // Play UI sound (throttled)
        if (parseInt(this.value) % 2 === 0) {
            playSound('tap', 0.3);
        }

        workoutConfig.rounds = parseInt(this.value);
        elements.roundsValue.textContent = this.value;
        saveSettings();
    });

    elements.roundLengthSlider.addEventListener('input', function() {
        // Play UI sound (throttled)
        if (parseInt(this.value) % 30 === 0) {
            playSound('tap', 0.3);
        }

        workoutConfig.roundLength = parseInt(this.value);
        elements.roundLengthValue.textContent = formatTime(this.value);
        saveSettings();
    });

    elements.breakLengthSlider.addEventListener('input', function() {
        // Play UI sound (throttled)
        if (parseInt(this.value) % 15 === 0) {
            playSound('tap', 0.3);
        }

        workoutConfig.breakLength = parseInt(this.value);
        elements.breakLengthValue.textContent = formatTime(this.value);
        saveSettings();
    });

    // Difficulty buttons
    elements.difficultyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Play UI sound
            playSound('tap');

            elements.difficultyBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            workoutConfig.difficulty = this.dataset.level;
            saveSettings();
        });
    });

    // Start custom workout
    elements.startCustomWorkoutBtn.addEventListener('click', () => {
        // Play UI sound
        playSound('tap');

        initAudio();
        startWorkout();
    });

    // Workout control buttons
    if (elements.pauseWorkoutBtn) {
        elements.pauseWorkoutBtn.addEventListener('click', () => {
            // Play UI sound
            playSound(workoutState.isPaused ? 'resume' : 'pause');
            pauseWorkout();
        });
    }

    if (elements.endWorkoutBtn) {
        elements.endWorkoutBtn.addEventListener('click', () => {
            // Play UI sound
            playSound('tap');
            endWorkout();
        });
    }

    // Close workout button (with confirmation)
    if (elements.workoutCloseBtn) {
        elements.workoutCloseBtn.addEventListener('click', () => {
            // Play UI sound
            playSound('tap');

            if (confirm('Are you sure you want to end this workout?')) {
                endWorkout();
            }
        });
    }

    // Share workout button
    if (elements.shareWorkoutBtn) {
        elements.shareWorkoutBtn.addEventListener('click', () => {
            // Play UI sound
            playSound('tap');
            shareWorkout();
        });
    }

    // New workout button
    if (elements.newWorkoutBtn) {
        elements.newWorkoutBtn.addEventListener('click', () => {
            // Play UI sound
            playSound('tap');
            closeWorkoutComplete();
            activateTab('workouts');
        });
    }
}

// Activate a specific tab
export function activateTab(tabId) {
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

// Show workout overlay
export function showWorkoutOverlay() {
    // Update workout details
    elements.workoutTitle.textContent = workoutConfig.difficulty.charAt(0).toUpperCase() + workoutConfig.difficulty.slice(1);
    elements.workoutType.textContent = workoutConfig.workoutType.charAt(0).toUpperCase() + workoutConfig.workoutType.slice(1);

    // Show the overlay
    elements.workoutActiveOverlay.classList.add('active');

    // Create round indicators
    updateRoundIndicators();
}

// Close workout overlay
export function closeWorkoutOverlay() {
    elements.workoutActiveOverlay.classList.remove('active');
}

// Update round indicators
export function updateRoundIndicators() {
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

// Update timer display
export function updateTimerDisplay() {
    // Update the time value
    elements.timerValue.textContent = formatTime(workoutState.timeRemaining);

    // Update the label
    if (workoutState.isBreak) {
        elements.timerLabel.textContent = 'REST';
    } else {
        elements.timerLabel.textContent = `ROUND ${workoutState.currentRound}`;
    }

    // Calculate progress for circular timer
    const totalTime = workoutState.isBreak ? workoutConfig.breakLength : workoutConfig.roundLength;
    const progress = (totalTime - workoutState.timeRemaining) / totalTime;

    // Update circular progress
    const circumference = 2 * Math.PI * 45; // 45 is the radius of our circle
    const dashOffset = circumference - (progress * circumference);
    elements.timerProgress.style.strokeDasharray = circumference;
    elements.timerProgress.style.strokeDashoffset = dashOffset;

    // Add pulse animation for last few seconds
    if (workoutState.timeRemaining <= 5) {
        elements.timerValue.classList.add('pulse-animation');
    } else {
        elements.timerValue.classList.remove('pulse-animation');
    }
}

// Update workout focus for current round
export function updateWorkoutFocus(workoutContent) {
    // Make sure we have the workout content
    if (!workoutContent) {
        console.error('No workout content provided');
        return null;
    }

    // Get the content for the current workout type
    const content = workoutContent[workoutConfig.workoutType];
    if (!content || !Array.isArray(content) || content.length === 0) {
        console.error(`No content found for workout type: ${workoutConfig.workoutType}`);

        // Return a default focus object to prevent undefined errors
        const defaultFocus = {
            focus: `${workoutConfig.workoutType.charAt(0).toUpperCase() + workoutConfig.workoutType.slice(1)} training`,
            instruction: "Focus on proper form and technique"
        };

        // Update UI with default values
        if (elements.focusTitle && elements.focusInstruction) {
            elements.focusTitle.textContent = defaultFocus.focus;
            elements.focusInstruction.textContent = defaultFocus.instruction;
        }

        return defaultFocus;
    }

    // Calculate the correct focus based on round number
    const roundIndex = (workoutState.currentRound - 1) % content.length;
    const focus = content[roundIndex];

    // Debug log - this is crucial for troubleshooting
    console.log(`Focus for round ${workoutState.currentRound} (${workoutConfig.workoutType}):`, focus);

    // Update UI elements if they exist
    if (elements.focusTitle && elements.focusInstruction && focus) {
        elements.focusTitle.textContent = focus.focus;
        elements.focusInstruction.textContent = focus.instruction;
    }

    // Return the focus for voice announcements
    return focus;
}

// Update coach message
export function updateCoachMessage(messageType, coachMessages) {
    // Special handling for striking technique
    if (messageType === 'technique' && workoutConfig.workoutType === 'striking' && coachMessages.strikingTechnique) {
        const message = getRandomItem(coachMessages.strikingTechnique);
        elements.coachMessage.textContent = message;
    }
    // Special handling for footwork technique
    else if (messageType === 'technique' && workoutConfig.workoutType === 'footwork' && coachMessages.footworkTechnique) {
        const message = getRandomItem(coachMessages.footworkTechnique);
        elements.coachMessage.textContent = message;
    }
    // Special handling for defense technique
    else if (messageType === 'technique' && workoutConfig.workoutType === 'defense' && coachMessages.defenseTechnique) {
        const message = getRandomItem(coachMessages.defenseTechnique);
        elements.coachMessage.textContent = message;
    }
    // Special handling for conditioning technique
    else if (messageType === 'technique' && workoutConfig.workoutType === 'conditioning' && coachMessages.conditioningTechnique) {
        const message = getRandomItem(coachMessages.conditioningTechnique);
        elements.coachMessage.textContent = message;
    }
    // Default messages
    else if (coachMessages[messageType]) {
        const message = getRandomItem(coachMessages[messageType]);
        elements.coachMessage.textContent = message;
    }

    // Add animation
    elements.coachMessage.classList.add('slide-in');
    setTimeout(() => elements.coachMessage.classList.remove('slide-in'), 500);
}

// Toggle workout pause UI
export function togglePauseUI(isPaused) {
    const pauseBtn = elements.pauseWorkoutBtn;
    
    if (isPaused) {
        pauseBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            RESUME
        `;
    } else {
        pauseBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            PAUSE
        `;
    }
}

// Show workout completion screen
export function showWorkoutComplete() {
    elements.workoutActiveOverlay.classList.remove('active');
    elements.workoutCompleteOverlay.classList.add('active');
    
    // Update summary stats
    elements.summaryRounds.textContent = workoutState.currentRound;
    elements.summaryTime.textContent = formatTime(workoutState.totalTime);
    elements.summaryLevel.textContent = workoutConfig.difficulty.charAt(0).toUpperCase() + workoutConfig.difficulty.slice(1);
    elements.summaryType.textContent = workoutConfig.workoutType.charAt(0).toUpperCase() + workoutConfig.workoutType.slice(1);
}

// Close workout completion screen
export function closeWorkoutComplete() {
    elements.workoutCompleteOverlay.classList.remove('active');
}

// Share workout functionality
function shareWorkout() {
    // Check if Web Share API is available
    if (navigator.share) {
        navigator.share({
            title: 'HeavyHITR Workout',
            text: `Just completed a ${workoutConfig.difficulty} ${workoutConfig.workoutType} workout with ${workoutState.currentRound} rounds in ${formatTime(workoutState.totalTime)}!`,
            url: window.location.href
        })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing:', error));
    } else {
        alert('Share feature is not supported in your browser.');
    }
}

// Utility function to get random item from array
export function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}