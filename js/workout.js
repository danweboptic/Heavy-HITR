/**
 * HeavyHITR - Workout Module
 * Manages workout functionality and timing
 * @author danweboptic
 * @lastUpdated 2025-03-21 14:33:37
 */
import { workoutConfig, workoutState } from './settings.js';
import { startAudio, stopAudio } from './audio.js';
import { 
    showWorkoutOverlay, 
    closeWorkoutOverlay, 
    updateTimerDisplay, 
    updateRoundIndicators, 
    updateWorkoutFocus, 
    updateCoachMessage, 
    togglePauseUI, 
    showWorkoutComplete 
} from './ui.js';
import { workoutContent, coachMessages } from './data.js';
import { saveWorkoutHistory } from './history.js';
import { formatTime } from './utils.js';

// Set up workout event handlers
export function setupWorkoutHandlers() {
    // Everything is handled in UI module by attaching event listeners
}

// Start workout
export function startWorkout() {
    // Initialize workout state
    workoutState.isRunning = true;
    workoutState.isPaused = false;
    workoutState.currentRound = 1;
    workoutState.isBreak = false;
    workoutState.timeRemaining = workoutConfig.roundLength;
    workoutState.totalTime = 0;
    workoutState.startTime = new Date();
    
    // Set up UI for workout
    showWorkoutOverlay();
    
    // Set workout focus
    updateWorkoutFocus(workoutContent);
    
    // Set initial coach message
    updateCoachMessage('roundStart', coachMessages);
    
    // Update timer display
    updateTimerDisplay();
    
    // Start audio
    startAudio();
    
    // Start the timer interval
    workoutState.interval = setInterval(updateWorkoutTimer, 1000);
}

// Pause or resume workout
export function pauseWorkout() {
    workoutState.isPaused = !workoutState.isPaused;
    
    if (workoutState.isPaused) {
        stopAudio();
    } else {
        // Only restart audio if not in break
        if (!workoutState.isBreak) {
            startAudio();
        }
    }
    
    // Update UI to reflect pause state
    togglePauseUI(workoutState.isPaused);
}

// End workout early
export function endWorkout() {
    // Stop the timer
    clearInterval(workoutState.interval);
    workoutState.isRunning = false;
    
    // Stop audio
    stopAudio();
    
    // Calculate total time spent
    if (workoutState.startTime) {
        const endTime = new Date();
        workoutState.totalTime = Math.floor((endTime - workoutState.startTime) / 1000);
    }
    
    // Save workout history
    saveWorkoutHistory();
    
    // Update UI
    showWorkoutComplete();
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
            
            // Check if workout is complete
            if (workoutState.currentRound > workoutConfig.rounds) {
                completeWorkout();
                return;
            }
            
            // Setup for new round
            workoutState.timeRemaining = workoutConfig.roundLength;
            updateRoundIndicators();
            updateWorkoutFocus(workoutContent);
            updateCoachMessage('roundStart', coachMessages);
            
            // Start audio for new round
            startAudio();
        } else {
            // Round is over, start break (unless it's the last round)
            if (workoutState.currentRound === workoutConfig.rounds) {
                completeWorkout();
                return;
            }
            
            workoutState.isBreak = true;
            workoutState.timeRemaining = workoutConfig.breakLength;
            updateCoachMessage('roundEnd', coachMessages);
            
            // Stop audio during break
            stopAudio();
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
            updateCoachMessage('countdown', coachMessages);
        }
    }
}

// Complete workout
function completeWorkout() {
    // Stop the timer
    clearInterval(workoutState.interval);
    workoutState.isRunning = false;
    
    // Stop the audio
    stopAudio();
    
    // Save workout history
    saveWorkoutHistory();
    
    // Show completion message
    updateCoachMessage('workoutComplete', coachMessages);
    
    // Show workout complete screen after a short delay
    setTimeout(() => {
        showWorkoutComplete();
    }, 1500);
}