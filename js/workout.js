/**
 * HeavyHITR - Workout Module
 * Manages workout functionality and timing
 * @author danweboptic
 * @lastUpdated 2025-03-21 11:48:06
 */
import { workoutConfig, workoutState } from './settings.js';
import { startAudio, stopAudio } from './audio.js';
import { updateCoachMessage, updateWorkoutFocus, updateRoundIndicators, updateTimerDisplay, elements } from './ui.js';
import { workoutContent, coachMessages } from './data.js';

// Format time (seconds) to MM:SS
export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Start the workout timer
export function startWorkout(elements) {
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
    updateWorkoutFocus(workoutContent);
    
    // Set initial coach message
    updateCoachMessage('roundStart', coachMessages);
    
    // Update timer display
    updateTimerDisplay();
    
    // Start the audio
    startAudio();
    
    // Start interval
    workoutState.interval = setInterval(updateWorkoutTimer, 1000);
}

// Pause or resume workout
export function pauseWorkout(elements) {
    workoutState.isPaused = !workoutState.isPaused;
    
    if (workoutState.isPaused) {
        elements.pauseWorkoutBtn.textContent = 'RESUME';
        elements.pauseWorkoutBtn.classList.add('gradient-bg');
        stopAudio(elements);
    } else {
        elements.pauseWorkoutBtn.textContent = 'PAUSE';
        elements.pauseWorkoutBtn.classList.remove('gradient-bg');
        if (!workoutState.isBreak) {
            startAudio();
        }
    }
}

// End workout early
export function endWorkout() {
    // Confirm before ending
    if (confirm('Are you sure you want to end this workout?')) {
        completeWorkout();
    }
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
            updateWorkoutFocus(workoutContent);
            updateCoachMessage('roundStart', coachMessages);
            
            // Start audio for round
            startAudio();
        } else {
            // Round is over, start break (unless it's the last round)
            if (workoutState.currentRound === workoutConfig.rounds) {
                completeWorkout();
                return;
            }
            
            workoutState.isBreak = true;
            workoutState.timeRemaining = workoutConfig.breakLength;
            elements.currentStatus.textContent = 'Break';
            updateCoachMessage('roundEnd', coachMessages);
            
            // Stop audio during break
            stopAudio(elements);
        }
    } else {
        // During workout, periodically update coach messages
        if (!workoutState.isBreak && workoutState.timeRemaining % 15 === 0) {
            const messageType = Math.random() > 0.5 ? 'encouragement' : 'technique';
            updateCoachMessage(messageType, coachMessages);
        }
        
        // During break, update break messages
        if (workoutState.isBreak && workoutState.timeRemaining % 10 === 0) {
            updateCoachMessage('breakTime', coachMessages);
        }
        
        // Last 3 seconds of break, countdown
        if (workoutState.isBreak && workoutState.timeRemaining <= 3) {
            elements.coachMessage.textContent = `Get ready! ${workoutState.timeRemaining}...`;
        }
    }
}

// Complete workout
function completeWorkout() {
    // Stop the timer
    clearInterval(workoutState.interval);
    workoutState.isRunning = false;
    
    // Stop the audio
    stopAudio(elements);
    
    // Show completion message
    updateCoachMessage('workoutComplete', coachMessages);
    
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