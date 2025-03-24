/**
 * HeavyHITR - Workout Module
 * Manages workout functionality and timing
 * @author danweboptic
 * @lastUpdated 2025-03-24 13:13:24
 */
import { workoutConfig, workoutState } from './settings.js';
import {
    startAudio,
    stopAudio,
    playRoundStartSound,
    playRoundEndSound,
    playCountdownSound,
    playCompleteSound
} from './audio.js';
import {
    showWorkoutOverlay,
    closeWorkoutOverlay,
    updateTimerDisplay,
    updateRoundIndicators,
    updateWorkoutFocus,
    updateCoachMessage,
    togglePauseUI,
    showWorkoutComplete,
    getFocusForRound
} from './ui.js';
import { workoutContent, coachMessages } from './data.js';
import { saveWorkoutHistory } from './history.js';
import { formatTime } from './utils.js';
import {
    announceRoundStart,
    announceRoundEnd,
    announceBreakEnd,
    announceEncouragement,
    announceCountdown
} from './voice.js';

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

    // Directly get focus content for this round from workoutContent
    let focusContent = getFocusForRound(workoutContent, workoutConfig.workoutType, workoutState.currentRound);

    // Then update UI with this focus
    updateWorkoutFocus(focusContent);

    // Set initial coach message
    updateCoachMessage('roundStart', coachMessages);

    // Update timer display
    updateTimerDisplay();

    // Start audio
    startAudio();

    // Play round start sound
    playRoundStartSound();

    console.log('Workout starting with focus:', focusContent);

    // Wait a moment before announcing for better audio experience
    setTimeout(() => {
        if (focusContent) {
            console.log("Announcing round start with focus:", focusContent.focus);

            // Announce with focus text directly
            announceRoundStart(
                workoutState.currentRound,
                workoutConfig.rounds,
                workoutConfig.workoutType,
                focusContent.focus,
                focusContent.instruction
            );
        } else {
            console.log("Announcing without focus");

            // Fallback without focus content
            announceRoundStart(
                workoutState.currentRound,
                workoutConfig.rounds,
                workoutConfig.workoutType
            );
        }
    }, 1000);

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

    // Play complete sound
    playCompleteSound();

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

    // Final countdown sounds
    if (workoutState.timeRemaining <= 3 && workoutState.timeRemaining > 0) {
        playCountdownSound();
        announceCountdown(workoutState.timeRemaining);
    }

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

            // Directly get focus content for this round
            let focusContent = getFocusForRound(workoutContent, workoutConfig.workoutType, workoutState.currentRound);

            // Update UI with this focus
            updateWorkoutFocus(focusContent);

            updateCoachMessage('roundStart', coachMessages);

            // Play round start sound
            playRoundStartSound();

            console.log('New round with focus:', focusContent);

            // Announce break end first
            announceBreakEnd();

            // After a brief pause, announce the new round with focus
            setTimeout(() => {
                if (focusContent) {
                    console.log("Announcing round start with focus:", focusContent.focus);

                    // Announce with focus text directly
                    announceRoundStart(
                        workoutState.currentRound,
                        workoutConfig.rounds,
                        workoutConfig.workoutType,
                        focusContent.focus,
                        focusContent.instruction
                    );
                } else {
                    console.log("Announcing without focus");

                    // Fallback without focus content
                    announceRoundStart(
                        workoutState.currentRound,
                        workoutConfig.rounds,
                        workoutConfig.workoutType
                    );
                }
            }, 2000);

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

            // Play round end sound
            playRoundEndSound();

            // Announce round end
            announceRoundEnd(workoutState.currentRound === workoutConfig.rounds);

            // Stop audio during break
            stopAudio();
        }
    } else {
        // During workout, periodically update coach messages
        if (!workoutState.isBreak) {
            // Halfway point announcement
            if (workoutState.timeRemaining === Math.floor(workoutConfig.roundLength / 2)) {
                updateCoachMessage('encouragement', coachMessages);
                announceEncouragement(workoutConfig.workoutType);
            }

            // Regular encouragement
            else if (workoutState.timeRemaining % 30 === 0) {
                const messageType = Math.random() > 0.5 ? 'encouragement' : 'technique';
                updateCoachMessage(messageType, coachMessages);

                // For every minute, give voice encouragement
                if (workoutState.timeRemaining % 60 === 0) {
                    announceEncouragement(workoutConfig.workoutType);
                }
            }
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

    // Play completion sound
    playCompleteSound();

    // Save workout history
    saveWorkoutHistory();

    // Show completion message
    updateCoachMessage('workoutComplete', coachMessages);

    // Announce workout complete
    announceRoundEnd(true);
    
    // Show workout complete screen after a short delay
    setTimeout(() => {
        showWorkoutComplete();
    }, 1500);
}