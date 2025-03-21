/**
 * HeavyHITR - UI Module
 * Handles user interface interactions and updates
 */

// DOM Elements
const elements = {
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

// Format time (seconds) to MM:SS
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Update workout focus for current round
function updateWorkoutFocus() {
    const content = workoutContent[workoutConfig.workoutType];
    const roundIndex = (workoutState.currentRound - 1) % content.length;
    const focus = content[roundIndex];
    
    elements.workoutFocus.textContent = focus.focus;
    elements.workoutInstruction.textContent = focus.instruction;
}

// Update round indicators
function updateRoundIndicators() {
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

// Update coach message
function updateCoachMessage(messageType) {
    const message = getRandomItem(coachMessages[messageType]);
    elements.coachMessage.textContent = message;
    elements.coachMessage.classList.add('slide-in');
    setTimeout(() => elements.coachMessage.classList.remove('slide-in'), 500);
}

// Update timer display
function updateTimerDisplay() {
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
function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Initialize UI configuration
function initUIConfig() {
    // Apply settings to UI
    elements.roundsSlider.value = workoutConfig.rounds;
    elements.roundsValue.textContent = workoutConfig.rounds;
    
    elements.roundLengthSlider.value = workoutConfig.roundLength;
    elements.roundLengthValue.textContent = formatTime(workoutConfig.roundLength);
    
    elements.breakLengthSlider.value = workoutConfig.breakLength;
    elements.breakLengthValue.textContent = formatTime(workoutConfig.breakLength);
    
    // Set active buttons
    document.querySelector(`.difficulty-btn[data-level="${workoutConfig.difficulty}"]`).classList.add('active', 'gradient-bg');
    document.querySelector(`.workout-type-btn[data-type="${workoutConfig.workoutType}"]`).classList.add('active', 'gradient-bg');
}

// Setup UI event listeners
function setupUIEventListeners() {
    // Round slider
    elements.roundsSlider.addEventListener('input', function() {
        workoutConfig.rounds = parseInt(this.value);
        elements.roundsValue.textContent = this.value;
        saveSettings();
    });
    
    // Round length slider
    elements.roundLengthSlider.addEventListener('input', function() {
        workoutConfig.roundLength = parseInt(this.value);
        elements.roundLengthValue.textContent = formatTime(this.value);
        saveSettings();
    });
    
    // Break length slider
    elements.breakLengthSlider.addEventListener('input', function() {
        workoutConfig.breakLength = parseInt(this.value);
        elements.breakLengthValue.textContent = formatTime(this.value);
        saveSettings();
    });
    
    // Difficulty buttons
    elements.difficultyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            elements.difficultyBtns.forEach(b => b.classList.remove('active', 'gradient-bg'));
            this.classList.add('active', 'gradient-bg');
            workoutConfig.difficulty = this.dataset.level;
            saveSettings();
        });
    });
    
    // Workout type buttons
    elements.workoutTypeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            elements.workoutTypeBtns.forEach(b => b.classList.remove('active', 'gradient-bg'));
            this.classList.add('active', 'gradient-bg');
            workoutConfig.workoutType = this.dataset.type;
            saveSettings();
        });
    });
    
    // Main app buttons
    elements.startWorkoutBtn.addEventListener('click', startWorkout);
    elements.pauseWorkoutBtn.addEventListener('click', togglePauseWorkout);
    elements.endWorkoutBtn.addEventListener('click', endWorkout);
    elements.newWorkoutBtn.addEventListener('click', newWorkout);
}

// Export module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        elements,
        formatTime,
        updateWorkoutFocus,
        updateRoundIndicators,
        updateCoachMessage,
        updateTimerDisplay,
        getRandomItem,
        initUIConfig,
        setupUIEventListeners
    };
}