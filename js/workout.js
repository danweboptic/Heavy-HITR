/**
 * HeavyHITR - Workout Module
 * Manages workout functionality and timing
 * @author danweboptic
 * @lastUpdated 2025-03-24 14:35:57
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
// Import workout content and coach messages
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

    console.log('Starting workout with type:', workoutConfig.workoutType);
    console.log('Workout content available:', !!workoutContent);
    console.log('Workout content types:', workoutContent ? Object.keys(workoutContent) : 'N/A');

    // Set up UI for workout
    showWorkoutOverlay();

    // Directly get focus content for this round - IMPORTANT
    const currentType = workoutConfig.workoutType;
    const currentRound = workoutState.currentRound;

    // Debug data availability
    console.log(`Retrieving focus for ${currentType}, round ${currentRound}`);
    if (workoutContent && workoutContent[currentType]) {
        const availableItems = workoutContent[currentType].length;
        console.log(`Available focus items for ${currentType}: ${availableItems}`);

        // Calculate the index that will be used
        const roundIndex = (currentRound - 1) % availableItems;
        console.log(`Using index ${roundIndex} for round ${currentRound}`);

        // Log the actual focus content that should be used
        const expectedFocus = workoutContent[currentType][roundIndex];
        console.log('Expected focus content:', expectedFocus);
    }

    // Get the actual focus content
    let focusContent = null;
    if (workoutContent && workoutContent[currentType]) {
        const roundIndex = (currentRound - 1) % workoutContent[currentType].length;
        focusContent = workoutContent[currentType][roundIndex];
    }

    console.log('Focus content to be used:', focusContent);

    // Update UI with focus content
    updateWorkoutFocus(focusContent);

    // Set initial coach message
    updateCoachMessage('roundStart', coachMessages);

    // Update timer display
    updateTimerDisplay();

    // Start audio
    startAudio();

    // Play round start sound
    playRoundStartSound();

    // Wait a moment before announcing for better audio experience
    setTimeout(() => {
        // Make sure we have valid focus data before passing to voice announcement
        if (focusContent && typeof focusContent === 'object' && focusContent.focus) {
            console.log("Announcing with specific focus:", focusContent.focus);

            // Direct announcement with focus text - pass the string focus, not the object
            announceRoundStart(
                workoutState.currentRound,
                workoutConfig.rounds,
                workoutConfig.workoutType,
                focusContent.focus,
                focusContent.instruction
            );
        } else {
            console.log("Announcing without specific focus");

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
            const currentType = workoutConfig.workoutType;
            const currentRound = workoutState.currentRound;

            // Get the focus content directly
            let focusContent = null;
            if (workoutContent && workoutContent[currentType]) {
                const roundIndex = (currentRound - 1) % workoutContent[currentType].length;
                focusContent = workoutContent[currentType][roundIndex];
            }

            console.log('New round focus content:', focusContent);

            // Update UI with this focus
            updateWorkoutFocus(focusContent);

            updateCoachMessage('roundStart', coachMessages);

            // Play round start sound
            playRoundStartSound();

            // Announce break end first
            announceBreakEnd();

            // After a brief pause, announce the new round with focus
            setTimeout(() => {
                // Make sure we have valid focus data
                if (focusContent && typeof focusContent === 'object' && focusContent.focus) {
                    console.log("Announcing with specific focus:", focusContent.focus);

                    // Direct announcement with focus text
                    announceRoundStart(
                        workoutState.currentRound,
                        workoutConfig.rounds,
                        workoutConfig.workoutType,
                        focusContent.focus,
                        focusContent.instruction
                    );
                } else {
                    console.log("Announcing without specific focus");

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