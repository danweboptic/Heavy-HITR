/**
 * HeavyHITR - UI Module
 * Handles UI updates and interactions
 * @author danweboptic
 * @lastUpdated 2025-03-21 11:48:06
 */
import { workoutConfig, workoutState } from './settings.js';
import { saveSettings } from './config.js';
import { initAudio } from './audio.js';
import { startWorkout, pauseWorkout, endWorkout, formatTime } from './workout.js';

// DOM Elements collection
export const elements = {
    // Configuration elements
    configSection: document.getElementById('config-section'),
    roundsSlider: document.getElementById('rounds'),
    roundsValue: document.getElementById('rounds-value'),
    roundLengthSlider: document.getElementById('round-length'),
    roundLengthValue: document.getElementById('round-length-value'),
    breakLengthSlider: document.getElementById('break-length'),
    breakLengthValue: document.getElementById('break-length-value'),
    difficultyBtns: document.querySelectorAll('.difficulty-btn'),
    workoutTypeBtns: document.querySelectorAll('.workout-type-btn'),
    startWorkoutBtn: document.getElementById('start-workout'),
    
    // Workout display elements
    workoutSection: document.getElementById('workout-section'),
    currentStatus: document.getElementById('current-status'),
    currentRound: document.getElementById('current-round'),
    timerDisplay: document.getElementById('timer-display'),
    progressBar: document.getElementById('progress-fill'),
    roundIndicators: document.getElementById('round-indicators'),
    workoutFocus: document.getElementById('workout-focus'),
    workoutInstruction: document.getElementById('workout-instruction'),
    coachMessage: document.getElementById('coach-message'),
    pauseWorkoutBtn: document.getElementById('pause-workout'),
    endWorkoutBtn: document.getElementById('end-workout'),
    difficultyDisplay: document.getElementById('difficulty-display'),
    audioIndicator: document.getElementById('audio-indicator'),
    
    // Completed section elements
    completedSection: document.getElementById('completed-section'),
    summaryRounds: document.getElementById('summary-rounds'),
    summaryTime: document.getElementById('summary-time'),
    summaryLevel: document.getElementById('summary-level'),
    summaryType: document.getElementById('summary-type'),
    newWorkoutBtn: document.getElementById('new-workout')
};

// Initialize UI configuration
export function initUIConfig() {
    // Set initial values based on loaded settings
    elements.roundsSlider.value = workoutConfig.rounds;
    elements.roundsValue.textContent = workoutConfig.rounds;
    
    elements.roundLengthSlider.value = workoutConfig.roundLength;
    elements.roundLengthValue.textContent = formatTime(workoutConfig.roundLength);
    
    elements.breakLengthSlider.value = workoutConfig.breakLength;
    elements.breakLengthValue.textContent = formatTime(workoutConfig.breakLength);
    
    // Set active buttons
    elements.difficultyBtns.forEach(btn => {
        btn.classList.remove('active', 'gradient-bg');
        if (btn.dataset.level === workoutConfig.difficulty) {
            btn.classList.add('active', 'gradient-bg');
        }
    });
    
    elements.workoutTypeBtns.forEach(btn => {
        btn.classList.remove('active', 'gradient-bg');
        if (btn.dataset.type === workoutConfig.workoutType) {
            btn.classList.add('active', 'gradient-bg');
        }
    });
}

// Set up UI event listeners
export function setupUIEventListeners() {
    // Set up configuration sliders
    elements.roundsSlider.addEventListener('input', function() {
        workoutConfig.rounds = parseInt(this.value);
        elements.roundsValue.textContent = this.value;
        saveSettings();
    });
    
    elements.roundLengthSlider.addEventListener('input', function() {
        workoutConfig.roundLength = parseInt(this.value);
        elements.roundLengthValue.textContent = formatTime(this.value);
        saveSettings();
    });
    
    elements.breakLengthSlider.addEventListener('input', function() {
        workoutConfig.breakLength = parseInt(this.value);
        elements.breakLengthValue.textContent = formatTime(this.value);
        saveSettings();
    });
    
    // Set up difficulty buttons
    elements.difficultyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            elements.difficultyBtns.forEach(b => b.classList.remove('active', 'gradient-bg'));
            this.classList.add('active', 'gradient-bg');
            workoutConfig.difficulty = this.dataset.level;
            saveSettings();
        });
    });
    
    // Set up workout type buttons
    elements.workoutTypeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            elements.workoutTypeBtns.forEach(b => b.classList.remove('active', 'gradient-bg'));
            this.classList.add('active', 'gradient-bg');
            workoutConfig.workoutType = this.dataset.type;
            saveSettings();
        });
    });
    
    // Set up button event listeners
    elements.startWorkoutBtn.addEventListener('click', () => {
        // Initialize audio on user gesture
        initAudio(elements);
        startWorkout(elements);
    });
    
    elements.pauseWorkoutBtn.addEventListener('click', () => pauseWorkout(elements));
    elements.endWorkoutBtn.addEventListener('click', endWorkout);
    elements.newWorkoutBtn.addEventListener('click', () => {
        elements.completedSection.classList.add('hidden');
        elements.configSection.classList.remove('hidden');
    });
}

// Update coach message
export function updateCoachMessage(messageType, coachMessages) {
    const message = getRandomItem(coachMessages[messageType]);
    elements.coachMessage.textContent = message;
    elements.coachMessage.classList.add('slide-in');
    setTimeout(() => elements.coachMessage.classList.remove('slide-in'), 500);
}

// Update workout focus for current round
export function updateWorkoutFocus(workoutContent) {
    const content = workoutContent[workoutConfig.workoutType];
    const roundIndex = (workoutState.currentRound - 1) % content.length;
    const focus = content[roundIndex];
    
    elements.workoutFocus.textContent = focus.focus;
    elements.workoutInstruction.textContent = focus.instruction;
}

// Update round indicators
export function updateRoundIndicators() {
    elements.roundIndicators.innerHTML = '';
    
    for (let i = 1; i <= workoutConfig.rounds; i++) {
        const dot = document.createElement('div');
        dot.className = 'round-dot';
        
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
    elements.timerDisplay.textContent = formatTime(workoutState.timeRemaining);
    
    // Update progress bar
    const totalTime = workoutState.isBreak ? workoutConfig.breakLength : workoutConfig.roundLength;
    const progressPercentage = ((totalTime - workoutState.timeRemaining) / totalTime) * 100;
    elements.progressBar.style.width = `${progressPercentage}%`;
    
    // Add pulse animation for last 10 seconds
    if (workoutState.timeRemaining <= 10) {
        elements.timerDisplay.classList.add('pulse-animation');
    } else {
        elements.timerDisplay.classList.remove('pulse-animation');
    }
}

// Get random item from array
export function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}