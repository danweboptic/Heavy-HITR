/**
 * HeavyHITR - Workout Module
 * Handles workout logic and timer functionality
 */

// Start the workout timer
function startWorkout() {
    // Initialize workout state
    workoutState.isRunning = true;
    workoutState.isPaused = false;
    workoutState.currentRound = 1;
    workoutState.isBreak = false;
    workoutState.timeRemaining = workoutConfig.roundLength;
    workoutState.totalTime = 0;
    
    // Setup UI
    elements.configSection.classList.add('hidden');
    elements.workoutSection.classList.remove('hidden');
    elements.completedSection.classList.add('hidden');
    
    // Update round display
    elements.currentRound.textContent = `${workoutState.currentRound}/${workoutConfig.rounds}`;
    elements.currentStatus.textContent = 'Round';
    elements.difficultyDisplay.textContent = workoutConfig.difficulty.charAt(0).toUpperCase() + workoutConfig.difficulty.slice(1);
    
    // Setup round indicators
    updateRoundIndicators();
    
    // Set workout focus
    updateWorkoutFocus();
    
    // Set initial coach message
    updateCoachMessage('roundStart');
    
    // Start the timer
    updateTimerDisplay();
    
    // Initialize audio
    initAudio();
    startBeat();
    
    // Start interval
    workoutState.interval = setInterval(updateWorkoutTimer, 1000);
}

// Update the workout timer
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
            
            // Check if workout is complete
            if (workoutState.currentRound > workoutConfig.rounds) {
                completeWorkout();
                return;
            }
            
            // Setup for new round
            workoutState.timeRemaining = workoutConfig.roundLength;
            elements.currentStatus.textContent = 'Round';
            elements.currentRound.textContent = `${workoutState.currentRound}/${workoutConfig.rounds}`;
            updateRoundIndicators();
            updateWorkoutFocus();
            updateCoachMessage('roundStart');
            
            // Start beat for round
            startBeat();
        } else {
            // Round is over, start break (unless it's the last round)
            if (workoutState.currentRound === workoutConfig.rounds) {
                completeWorkout();
                return;
            }
            
            workoutState.isBreak = true;
            workoutState.timeRemaining = workoutConfig.breakLength;
            elements.currentStatus.textContent = 'Break';
            updateCoachMessage('roundEnd');
            
            // Stop beat during break
            stopBeat();
        }
    } else {
        // During workout, periodically update coach messages
        if (!workoutState.isBreak && workoutState.timeRemaining % 15 === 0) {
            const messageType = Math.random() > 0.5 ? 'encouragement' : 'technique';
            updateCoachMessage(messageType);
        }
        
        // During break, update break messages
        if (workoutState.isBreak && workoutState.timeRemaining % 10 === 0) {
            updateCoachMessage('breakTime');
        }
        
        // Last 3 seconds of break, countdown
        if (workoutState.isBreak && workoutState.timeRemaining <= 3) {
            elements.coachMessage.textContent = `Get ready! ${workoutState.timeRemaining}...`;
        }
    }
}

// Pause or resume workout
function togglePauseWorkout() {
    workoutState.isPaused = !workoutState.isPaused;
    
    if (workoutState.isPaused) {
        elements.pauseWorkoutBtn.textContent = 'RESUME';
        elements.pauseWorkoutBtn.classList.add('gradient-bg');
        stopBeat();
    } else {
        elements.pauseWorkoutBtn.textContent = 'PAUSE';
        elements.pauseWorkoutBtn.classList.remove('gradient-bg');
        if (!workoutState.isBreak) {
            startBeat();
        }
    }
}

// End workout early
function endWorkout() {
    // Confirm before ending
    if (confirm('Are you sure you want to end this workout?')) {
        completeWorkout();
    }
}

// Complete workout
function completeWorkout() {
    // Stop the timer
    clearInterval(workoutState.interval);
    workoutState.isRunning = false;
    
    // Stop the beat
    stopBeat();
    
    // Show completion message
    updateCoachMessage('workoutComplete');
    
    // Switch to completed section
    setTimeout(() => {
        elements.workoutSection.classList.add('hidden');
        elements.completedSection.classList.remove('hidden');
        
        // Update summary
        elements.summaryRounds.textContent = workoutState.currentRound;
        elements.summaryTime.textContent = formatTime(workoutState.totalTime);
        elements.summaryLevel.textContent = workoutConfig.difficulty.charAt(0).toUpperCase() + workoutConfig.difficulty.slice(1);
        elements.summaryType.textContent = workoutConfig.workoutType.charAt(0).toUpperCase() + workoutConfig.workoutType.slice(1);
    }, 2000);
}

// Start a new workout
function newWorkout() {
    elements.completedSection.classList.add('hidden');
    elements.configSection.classList.remove('hidden');
}

// Export module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        startWorkout,
        updateWorkoutTimer,
        togglePauseWorkout,
        endWorkout,
        completeWorkout,
        newWorkout
    };
}