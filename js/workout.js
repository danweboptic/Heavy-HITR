/**
 * HeavyHITR - Workout Module
 * Handles the active workout functionality
 */

import { workoutConfig, appSettings } from './settings.js';
import { workoutContent, coachMessages } from './data.js';
import { playSound, startMusic, pauseMusic, resumeMusic, stopMusic } from './audio.js';
import {
  announceRoundStart,
  announceRoundEnd,
  announceBreakEnd,
  announceCountdown,
  announceEncouragement
} from './voice.js';
import { formatTime, calculateCaloriesBurned, generateUUID } from './utils.js';
import { saveWorkoutHistory } from './history.js';

// Workout state
const workoutState = {
  isActive: false,
  isPaused: false,
  currentRound: 1,
  currentPhase: 'prepare', // prepare, active, break, complete
  timeRemaining: 0,
  totalTime: 0,
  intervalId: null,
  focusIndex: 0,
  musicPlayer: null,
  startTime: null,
  encouragementTimer: null
};

// DOM Elements
let timerValueEl;
let timerLabelEl;
let timerProgressEl;
let roundIndicatorsEl;
let focusTitleEl;
let focusInstructionEl;
let pauseNotificationEl;
let workoutActiveEl;
let workoutTitleEl;
let workoutTypeEl;
let coachMessageEl;

// Initialize workout module
export function initWorkout() {
  // Get DOM elements
  timerValueEl = document.getElementById('timer-value');
  timerLabelEl = document.getElementById('timer-label');
  timerProgressEl = document.getElementById('timer-progress');
  roundIndicatorsEl = document.getElementById('round-indicators');
  focusTitleEl = document.getElementById('focus-title');
  focusInstructionEl = document.getElementById('focus-instruction');
  pauseNotificationEl = document.getElementById('pause-notification');
  workoutActiveEl = document.getElementById('workout-active');
  workoutTitleEl = document.querySelector('.workout-title');
  workoutTypeEl = document.querySelector('.workout-type');
  coachMessageEl = document.getElementById('coach-message');

  // Add event listeners
  document.getElementById('start-workout').addEventListener('click', startWorkout);
  document.getElementById('pause-workout').addEventListener('click', pauseWorkout);
  document.getElementById('resume-workout').addEventListener('click', resumeWorkout);
  document.getElementById('workout-close').addEventListener('click', confirmEndWorkout);
  document.getElementById('end-workout').addEventListener('click', confirmEndWorkout);

  // Set up wake lock for screen
  if ('wakeLock' in navigator) {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }
}

// Start a new workout
export function startWorkout() {
  if (workoutState.isActive) return;

  console.log('Starting workout with config:', workoutConfig);

  // Reset workout state
  workoutState.isActive = true;
  workoutState.isPaused = false;
  workoutState.currentRound = 1;
  workoutState.currentPhase = 'prepare';
  workoutState.timeRemaining = 5; // 5-second countdown
  workoutState.totalTime = 0;
  workoutState.focusIndex = 0;
  workoutState.startTime = new Date();

  // Show the workout screen
  showWorkoutScreen();

  // Set up the workout title and type
  workoutTitleEl.textContent = `${workoutConfig.difficulty.charAt(0).toUpperCase() + workoutConfig.difficulty.slice(1)} ${workoutConfig.rounds}-Round Workout`;
  workoutTypeEl.textContent = workoutConfig.workoutType.charAt(0).toUpperCase() + workoutConfig.workoutType.slice(1);

  // Create round indicators
  createRoundIndicators();

  // Update focus content
  updateFocusContent();

  // Request wake lock to keep screen on
  if (appSettings.preventScreenSleep) {
    requestWakeLock();
  }

  // Start background music if enabled
  if (appSettings.music) {
    startWorkoutMusic();
  }

  // Play start sound
  playSound('start');

  // Start the timer
  workoutState.intervalId = setInterval(updateWorkoutTimer, 1000);

  // Acquire wake lock
  requestWakeLock();
}

// Update the workout timer
function updateWorkoutTimer() {
  if (workoutState.isPaused) return;

  // Update the time remaining
  workoutState.timeRemaining--;

  // Update total workout time
  workoutState.totalTime++;

  // Update the timer display
  updateTimerDisplay();

  // Check if time is up for the current phase
  if (workoutState.timeRemaining <= 0) {
    handlePhaseEnd();
  }

  // Handle countdown announcements
  if (workoutState.timeRemaining <= 3 && workoutState.timeRemaining > 0 && appSettings.voiceSettings.countdown) {
    announceCountdown(workoutState.timeRemaining);
    playSound('countdown');
  }

  // Random encouragement during active phase
  if (workoutState.currentPhase === 'active' && !workoutState.isPaused) {
    handleRandomEncouragement();
  }
}

// Handle the end of a workout phase
function handlePhaseEnd() {
  switch (workoutState.currentPhase) {
    case 'prepare':
      // Start the first round
      workoutState.currentPhase = 'active';
      workoutState.timeRemaining = workoutConfig.roundLength;

      // Play round start sound
      playSound('roundStart');

      // Announce round start
      const focusContent = workoutContent[workoutConfig.workoutType][workoutState.focusIndex];
      announceRoundStart(
        workoutState.currentRound,
        workoutConfig.rounds,
        workoutConfig.workoutType,
        focusContent.focus,
        focusContent.instruction
      );

      updateTimerLabel(`ROUND ${workoutState.currentRound}`);
      break;

    case 'active':
      // Mark the current round as complete
      updateRoundIndicator(workoutState.currentRound, 'completed');

      // Play round end sound
      playSound('roundEnd');

      // Check if this was the last round
      if (workoutState.currentRound >= workoutConfig.rounds) {
        completeWorkout();
      } else {
        // Start break
        workoutState.currentPhase = 'break';
        workoutState.timeRemaining = workoutConfig.breakLength;

        // Announce round end
        announceRoundEnd(false);

        // Update focus for next round
        workoutState.currentRound++;
        workoutState.focusIndex = (workoutState.focusIndex + 1) % workoutContent[workoutConfig.workoutType].length;
        updateFocusContent();

        updateTimerLabel('BREAK');
      }
      break;

    case 'break':
      // Start the next round
      workoutState.currentPhase = 'active';
      workoutState.timeRemaining = workoutConfig.roundLength;

      // Update the active round indicator
      updateRoundIndicator(workoutState.currentRound, 'active');

      // Play round start sound
      playSound('roundStart');

      // Announce break end and round start
      announceBreakEnd();

      const nextFocusContent = workoutContent[workoutConfig.workoutType][workoutState.focusIndex];
      announceRoundStart(
        workoutState.currentRound,
        workoutConfig.rounds,
        workoutConfig.workoutType,
        nextFocusContent.focus,
        nextFocusContent.instruction
      );

      updateTimerLabel(`ROUND ${workoutState.currentRound}`);
      break;
  }
}

// Update the timer display
function updateTimerDisplay() {
  // Update timer value
  timerValueEl.textContent = formatTime(workoutState.timeRemaining);

  // Update progress circle
  let totalTime;
  switch (workoutState.currentPhase) {
    case 'prepare':
      totalTime = 5; // 5-second countdown
      break;
    case 'active':
      totalTime = workoutConfig.roundLength;
      break;
    case 'break':
      totalTime = workoutConfig.breakLength;
      break;
    default:
      totalTime = 0;
  }

  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (workoutState.timeRemaining / totalTime) * circumference;
  timerProgressEl.style.strokeDashoffset = offset;
  timerProgressEl.style.strokeDasharray = `${circumference} ${circumference}`;

  // Flash timer when time is running low
  if (workoutState.timeRemaining <= 3 && !timerValueEl.classList.contains('pulse-animation')) {
    timerValueEl.classList.add('pulse-animation');
  } else if (workoutState.timeRemaining > 3 && timerValueEl.classList.contains('pulse-animation')) {
    timerValueEl.classList.remove('pulse-animation');
  }

  // Update timer color based on phase
  if (workoutState.currentPhase === 'active') {
    timerProgressEl.style.stroke = 'var(--primary-color)';
  } else if (workoutState.currentPhase === 'break') {
    timerProgressEl.style.stroke = 'var(--secondary-color)';
  }
}

// Update the timer label
function updateTimerLabel(label) {
  timerLabelEl.textContent = label;
}

// Create round indicators
function createRoundIndicators() {
  roundIndicatorsEl.innerHTML = '';

  for (let i = 1; i <= workoutConfig.rounds; i++) {
    const indicator = document.createElement('div');
    indicator.className = 'indicator-dot';
    indicator.dataset.round = i;

    if (i === 1) {
      indicator.classList.add('active');
    }

    roundIndicatorsEl.appendChild(indicator);
  }
}

// Update a round indicator
function updateRoundIndicator(round, status) {
  const indicators = roundIndicatorsEl.querySelectorAll('.indicator-dot');

  indicators.forEach(indicator => {
    if (parseInt(indicator.dataset.round) === round) {
      indicator.classList.remove('active', 'completed');
      indicator.classList.add(status);
    }
  });
}

// Update the focus content
function updateFocusContent() {
  const focusContent = workoutContent[workoutConfig.workoutType][workoutState.focusIndex];

  if (focusContent) {
    focusTitleEl.textContent = focusContent.focus;
    focusInstructionEl.textContent = focusContent.instruction || '';
  }
}

// Complete the workout
function completeWorkout() {
  // Stop the timer
  clearInterval(workoutState.intervalId);

  // Play complete sound
  playSound('complete');

  // Announce workout complete
  announceRoundEnd(true);

  // Stop music if playing
  if (workoutState.musicPlayer) {
    stopMusic();
    workoutState.musicPlayer = null;
  }

  // Release wake lock
  releaseWakeLock();

  // Save workout history
  const workout = saveWorkoutToHistory();

  // Hide the workout screen
  hideWorkoutScreen();

  // Show the completion screen
  showCompletionScreen(workout);

  // Reset workout state
  workoutState.isActive = false;
  workoutState.currentPhase = 'complete';
}

// Save workout to history
function saveWorkoutToHistory() {
  return saveWorkoutHistory();
}

// Show the workout screen
function showWorkoutScreen() {
  workoutActiveEl.classList.add('active');
  workoutActiveEl.setAttribute('aria-hidden', 'false');

  // Focus on a button in the workout screen for better accessibility
  setTimeout(() => {
    const pauseBtn = document.getElementById('pause-workout');
    if (pauseBtn) pauseBtn.focus();
  }, 300);
}

// Hide the workout screen
function hideWorkoutScreen() {
  workoutActiveEl.classList.remove('active');
  workoutActiveEl.setAttribute('aria-hidden', 'true');
}

// Show the completion screen
function showCompletionScreen(workout) {
  const completionScreen = document.getElementById('workout-complete');

  // Update summary values
  document.getElementById('summary-rounds').textContent = workoutState.currentRound;
  document.getElementById('summary-time').textContent = formatTime(workoutState.totalTime);
  document.getElementById('summary-level').textContent = workoutConfig.difficulty.charAt(0).toUpperCase() + workoutConfig.difficulty.slice(1);
  document.getElementById('summary-type').textContent = workoutConfig.workoutType.charAt(0).toUpperCase() + workoutConfig.workoutType.slice(1);

  // Show the screen
  completionScreen.classList.add('active');
  completionScreen.setAttribute('aria-hidden', 'false');

  // Add event listeners to the completion buttons
  document.getElementById('new-workout').addEventListener('click', () => {
    completionScreen.classList.remove('active');
    completionScreen.setAttribute('aria-hidden', 'true');
  });

  document.getElementById('share-workout').addEventListener('click', () => {
    shareWorkout(workout);
  });

  // Focus on a button in the completion screen for better accessibility
  setTimeout(() => {
    const newWorkoutBtn = document.getElementById('new-workout');
    if (newWorkoutBtn) newWorkoutBtn.focus();
  }, 300);
}

// Share workout
function shareWorkout(workout) {
  const shareText = `Just completed a ${workout.difficulty} ${workout.workoutType} boxing workout on HeavyHITR! ${workout.rounds} rounds in ${formatTime(workout.duration)}.`;

  if (navigator.share) {
    navigator.share({
      title: 'HeavyHITR Workout',
      text: shareText,
    }).catch(console.error);
  } else {
    // Fallback - copy to clipboard
    navigator.clipboard.writeText(shareText).then(() => {
      alert('Workout details copied to clipboard!');
    }).catch(console.error);
  }
}

// Pause the workout
function pauseWorkout() {
  if (!workoutState.isActive || workoutState.isPaused) return;

  workoutState.isPaused = true;

  // Show pause notification
  pauseNotificationEl.classList.add('visible');

  // Play pause sound
  playSound('pause');

  // Pause music if playing
  if (workoutState.musicPlayer) {
    pauseMusic();
  }

  // Focus on resume button for accessibility
  setTimeout(() => {
    const resumeBtn = document.getElementById('resume-workout');
    if (resumeBtn) resumeBtn.focus();
  }, 100);
}

// Resume the workout
function resumeWorkout() {
  if (!workoutState.isActive || !workoutState.isPaused) return;

  workoutState.isPaused = false;

  // Hide pause notification
  pauseNotificationEl.classList.remove('visible');

  // Play resume sound
  playSound('resume');

  // Resume music if it was playing
  if (workoutState.musicPlayer) {
    resumeMusic();
  }

  // Focus on pause button for accessibility
  setTimeout(() => {
    const pauseBtn = document.getElementById('pause-workout');
    if (pauseBtn) pauseBtn.focus();
  }, 100);
}

// Confirm end workout
function confirmEndWorkout() {
  if (!workoutState.isActive) return;

  if (confirm('Are you sure you want to end the workout?')) {
    endWorkout();
  }
}

// End the workout
function endWorkout() {
  if (!workoutState.isActive) return;

  // Stop the timer
  clearInterval(workoutState.intervalId);

  // Stop music if playing
  if (workoutState.musicPlayer) {
    stopMusic();
    workoutState.musicPlayer = null;
  }

  // Release wake lock
  releaseWakeLock();

  // Hide the workout screen
  hideWorkoutScreen();

  // Reset workout state
  workoutState.isActive = false;
  workoutState.currentPhase = 'complete';
}

// Handle random encouragement
function handleRandomEncouragement() {
  if (!appSettings.voiceSettings.encouragement) return;

  // Only show encouragement messages randomly during the middle of rounds
  const roundProgress = (workoutConfig.roundLength - workoutState.timeRemaining) / workoutConfig.roundLength;

  if (roundProgress > 0.3 && roundProgress < 0.8) {
    // Random chance to show encouragement (about once per round)
    const chancePerSecond = 1 / (workoutConfig.roundLength * 0.5);

    if (Math.random() < chancePerSecond) {
      announceEncouragement(workoutConfig.workoutType);
      showCoachMessage();
    }
  }
}

// Show a coach message
function showCoachMessage() {
  // Get random message for workout type
  const typeMessages = coachMessages[workoutConfig.workoutType] || coachMessages.general;
  const randomMessage = typeMessages[Math.floor(Math.random() * typeMessages.length)];

  // Update message text
  coachMessageEl.querySelector('.focus-instruction').textContent = randomMessage;

  // Show the message
  coachMessageEl.style.display = 'block';
  coachMessageEl.classList.add('slide-in');

  // Hide after a few seconds
  setTimeout(() => {
    coachMessageEl.classList.remove('slide-in');
    setTimeout(() => {
      coachMessageEl.style.display = 'none';
    }, 300);
  }, 4000);
}

// Start workout music
function startWorkoutMusic() {
  let musicCategory;

  // Select music category based on workout type
  switch (workoutConfig.workoutType) {
    case 'striking':
    case 'conditioning':
      musicCategory = 'intense';
      break;
    case 'footwork':
      musicCategory = 'energetic';
      break;
    case 'defense':
      musicCategory = 'relaxed';
      break;
    default:
      musicCategory = 'energetic';
  }

  // Start music with appropriate volume
  startMusic(musicCategory, appSettings.musicVolume)
    .then(player => {
      workoutState.musicPlayer = player;
    })
    .catch(err => {
      console.error('Failed to start music:', err);
    });
}

// Handle visibility change for wake lock
function handleVisibilityChange() {
  if (document.visibilityState === 'visible' && workoutState.isActive && appSettings.preventScreenSleep) {
    requestWakeLock();
  }
}

// Wake lock to prevent screen from sleeping
let wakeLock = null;

async function requestWakeLock() {
  if ('wakeLock' in navigator && appSettings.preventScreenSleep) {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      console.log('Wake lock is active');

      wakeLock.addEventListener('release', () => {
        console.log('Wake lock was released');
      });
    } catch (err) {
      console.error('Failed to get wake lock:', err);
    }
  }
}

function releaseWakeLock() {
  if (wakeLock !== null) {
    wakeLock.release()
      .then(() => {
        wakeLock = null;
      })
      .catch(err => {
        console.error('Error releasing wake lock:', err);
      });
  }
}

export default {
  initWorkout,
  startWorkout,
  workoutState
};