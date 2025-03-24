/**
 * HeavyHITR - History Module
 * Manages workout history, statistics, and calendar view
 * @author danweboptic
 * @lastUpdated 2025-03-24 15:17:07
 */

import { formatDate, formatTime, formatRelativeDate, calculateCaloriesBurned } from './utils.js';
import { workoutConfig, appSettings } from './settings.js';

// Constants
const HISTORY_STORAGE_KEY = 'heavyhitr-workout-history';

/**
 * Initialize the workout history calendar
 */
export function initCalendar() {
    const calendarEl = document.getElementById('calendar-container');
    if (!calendarEl) return;
    
    // Clear the calendar
    calendarEl.innerHTML = '';
    
    // Get workout history
    const workoutHistory = getWorkoutHistory();
    
    // Current date information
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Create the calendar
    renderCalendar(calendarEl, currentMonth, currentYear, workoutHistory);
    
    // Add month navigation
    setupCalendarNavigation(calendarEl, workoutHistory);
}

/**
 * Render the calendar for a specific month
 * @param {HTMLElement} container - The container element for the calendar
 * @param {number} month - The month to render (0-11)
 * @param {number} year - The year to render
 * @param {Array} workoutHistory - Array of workout history objects
 */
function renderCalendar(container, month, year, workoutHistory) {
    // Create month header
    const monthHeader = document.createElement('div');
    monthHeader.className = 'month-header';
    monthHeader.innerHTML = `
        <button class="month-nav prev" aria-label="Previous month">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
        </button>
        <span>${new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
        <button class="month-nav next" aria-label="Next month">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
        </button>
    `;
    container.appendChild(monthHeader);
    
    // Create weekday header
    const weekdaysEl = document.createElement('div');
    weekdaysEl.className = 'weekdays';
    const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    weekdays.forEach(day => {
        const dayEl = document.createElement('div');
        dayEl.textContent = day;
        weekdaysEl.appendChild(dayEl);
    });
    container.appendChild(weekdaysEl);
    
    // Create grid container
    const gridEl = document.createElement('div');
    gridEl.className = 'calendar-grid';
    container.appendChild(gridEl);
    
    // Calculate first day of month
    const firstDay = new Date(year, month, 1).getDay();
    
    // Calculate days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Create day cells
    for (let i = 0; i < firstDay; i++) {
        addDayCell(gridEl, '', false, false);
    }
    
    // Map workout dates for easy lookup
    const workoutDates = {};
    workoutHistory.forEach(workout => {
        const workoutDate = new Date(workout.date);
        const dateKey = `${workoutDate.getFullYear()}-${workoutDate.getMonth()}-${workoutDate.getDate()}`;
        if (!workoutDates[dateKey]) {
            workoutDates[dateKey] = [];
        }
        workoutDates[dateKey].push(workout);
    });
    
    const today = new Date();
    
    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const isToday = currentDate.getDate() === today.getDate() && 
                         currentDate.getMonth() === today.getMonth() && 
                         currentDate.getFullYear() === today.getFullYear();
        
        const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
        const hasWorkout = !!workoutDates[dateKey];
        
        addDayCell(gridEl, day, isToday, hasWorkout, workoutDates[dateKey]);
    }
}

/**
 * Add a day cell to the calendar grid
 * @param {HTMLElement} container - The grid container
 * @param {number|string} day - The day number or empty string for placeholder
 * @param {boolean} isToday - Whether this cell represents today
 * @param {boolean} hasWorkout - Whether a workout was completed on this day
 * @param {Array} workouts - Array of workouts for this day
 */
function addDayCell(container, day, isToday, hasWorkout, workouts = []) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day';
    
    if (day === '') {
        cell.classList.add('empty');
    } else {
        cell.textContent = day;
        
        if (isToday) {
            cell.classList.add('today');
        }
        
        if (hasWorkout) {
            cell.classList.add('workout-day');
            
            // Add workout indicator(s)
            const indicatorContainer = document.createElement('div');
            indicatorContainer.className = 'workout-indicators';
            
            // Add indicators based on workout types
            const workoutTypes = new Set();
            workouts.forEach(workout => {
                workoutTypes.add(workout.workoutType);
            });
            
            workoutTypes.forEach(type => {
                const indicator = document.createElement('div');
                indicator.className = `workout-indicator ${type}`;
                indicatorContainer.appendChild(indicator);
            });
            
            cell.appendChild(indicatorContainer);
            
            // Add click handler to show workout details
            cell.addEventListener('click', () => {
                showWorkoutDetails(workouts);
            });
            
            // Add aria labels for accessibility
            cell.setAttribute('role', 'button');
            cell.setAttribute('aria-label', `Day ${day}, ${workouts.length} workout${workouts.length > 1 ? 's' : ''} completed. Click for details.`);
            cell.setAttribute('tabindex', '0');
        }
    }
    
    container.appendChild(cell);
}

/**
 * Setup calendar navigation (prev/next month buttons)
 * @param {HTMLElement} container - The calendar container
 * @param {Array} workoutHistory - Array of workout history objects
 */
function setupCalendarNavigation(container, workoutHistory) {
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    
    // Get the navigation buttons
    const prevButton = container.querySelector('.month-nav.prev');
    const nextButton = container.querySelector('.month-nav.next');
    
    if (prevButton && nextButton) {
        // Previous month
        prevButton.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            
            // Clear and re-render
            const calendarGrid = container.querySelector('.calendar-grid');
            const monthHeader = container.querySelector('.month-header span');
            
            if (calendarGrid && monthHeader) {
                calendarGrid.innerHTML = '';
                monthHeader.textContent = new Date(currentYear, currentMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                
                // Calculate first day of month
                const firstDay = new Date(currentYear, currentMonth, 1).getDay();
                
                // Calculate days in month
                const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                
                // Create day cells (reusing existing code logic)
                const workoutDates = {};
                workoutHistory.forEach(workout => {
                    const workoutDate = new Date(workout.date);
                    const dateKey = `${workoutDate.getFullYear()}-${workoutDate.getMonth()}-${workoutDate.getDate()}`;
                    if (!workoutDates[dateKey]) {
                        workoutDates[dateKey] = [];
                    }
                    workoutDates[dateKey].push(workout);
                });
                
                const today = new Date();
                
                // Add empty cells for days before the 1st
                for (let i = 0; i < firstDay; i++) {
                    addDayCell(calendarGrid, '', false, false);
                }
                
                // Add cells for days in the month
                for (let day = 1; day <= daysInMonth; day++) {
                    const currentDate = new Date(currentYear, currentMonth, day);
                    const isToday = currentDate.getDate() === today.getDate() && 
                                   currentDate.getMonth() === today.getMonth() && 
                                   currentDate.getFullYear() === today.getFullYear();
                    
                    const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
                    const hasWorkout = !!workoutDates[dateKey];
                    
                    addDayCell(calendarGrid, day, isToday, hasWorkout, workoutDates[dateKey]);
                }
            }
        });
        
        // Next month (similar logic to previous month)
        nextButton.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            
            // Clear and re-render (same code as above)
            const calendarGrid = container.querySelector('.calendar-grid');
            const monthHeader = container.querySelector('.month-header span');
            
            if (calendarGrid && monthHeader) {
                calendarGrid.innerHTML = '';
                monthHeader.textContent = new Date(currentYear, currentMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                
                // Calculate first day of month
                const firstDay = new Date(currentYear, currentMonth, 1).getDay();
                
                // Calculate days in month
                const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                
                // Create day cells (reusing existing code logic)
                const workoutDates = {};
                workoutHistory.forEach(workout => {
                    const workoutDate = new Date(workout.date);
                    const dateKey = `${workoutDate.getFullYear()}-${workoutDate.getMonth()}-${workoutDate.getDate()}`;
                    if (!workoutDates[dateKey]) {
                        workoutDates[dateKey] = [];
                    }
                    workoutDates[dateKey].push(workout);
                });
                
                const today = new Date();
                
                // Add empty cells for days before the 1st
                for (let i = 0; i < firstDay; i++) {
                    addDayCell(calendarGrid, '', false, false);
                }
                
                // Add cells for days in the month
                for (let day = 1; day <= daysInMonth; day++) {
                    const currentDate = new Date(currentYear, currentMonth, day);
                    const isToday = currentDate.getDate() === today.getDate() && 
                                   currentDate.getMonth() === today.getMonth() && 
                                   currentDate.getFullYear() === today.getFullYear();
                    
                    const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
                    const hasWorkout = !!workoutDates[dateKey];
                    
                    addDayCell(calendarGrid, day, isToday, hasWorkout, workoutDates[dateKey]);
                }
            }
        });
    }
}

/**
 * Show workout details for a specific day
 * @param {Array} workouts - Array of workouts for the selected day
 */
function showWorkoutDetails(workouts) {
    if (!workouts || workouts.length === 0) return;
    
    // Create modal for workout details
    const modal = document.createElement('div');
    modal.className = 'workout-details-modal';
    
    // Get the date for the header
    const workoutDate = new Date(workouts[0].date);
    const formattedDate = formatRelativeDate(workoutDate);
    
    // Create modal content
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${formattedDate} Workouts</h2>
                <button class="close-modal" aria-label="Close workout details">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div class="workouts-list">
                    ${workouts.map((workout, index) => `
                        <div class="workout-item ${workout.workoutType}">
                            <div class="workout-header">
                                <h3>${capitalizeFirstLetter(workout.workoutType)} Workout</h3>
                                <span class="workout-time">${new Date(workout.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div class="workout-details">
                                <div class="detail-item">
                                    <span class="detail-label">Difficulty</span>
                                    <span class="detail-value">${capitalizeFirstLetter(workout.difficulty)}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Duration</span>
                                    <span class="detail-value">${formatTime(workout.duration)}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Rounds</span>
                                    <span class="detail-value">${workout.rounds} rounds</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Calories</span>
                                    <span class="detail-value">${workout.calories || '---'} kcal</span>
                                </div>
                            </div>
                            <div class="workout-actions">
                                <button class="repeat-workout-btn" data-index="${index}">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Repeat Workout
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    // Add modal to the body
    document.body.appendChild(modal);
    
    // Add event listener to close button
    const closeBtn = modal.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        });
    }
    
    // Add event listeners to repeat workout buttons
    const repeatBtns = modal.querySelectorAll('.repeat-workout-btn');
    repeatBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const index = btn.dataset.index;
            repeatWorkout(workouts[index]);
            // Close the modal
            modal.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        });
    });
    
    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Close when clicking outside the modal content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        }
    });
    
    // Close with ESC key
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape' && document.body.contains(modal)) {
            modal.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
            document.removeEventListener('keydown', escHandler);
        }
    });
}

/**
 * Save the current workout to history
 * @returns {Object} The saved workout summary
 */
export function saveWorkoutHistory() {
    // Get workout details
    const workoutSummary = {
        date: new Date().toISOString(),
        workoutType: workoutConfig.workoutType,
        difficulty: workoutConfig.difficulty,
        rounds: workoutState.currentRound,
        duration: workoutState.totalTime,
        roundLength: workoutConfig.roundLength,
        breakLength: workoutConfig.breakLength,
        calories: calculateCaloriesBurned(workoutState.totalTime, appSettings.weight, workoutConfig.difficulty),
        synced: false
    };
    
    // Get existing history
    const history = getWorkoutHistory();
    
    // Add new workout to the beginning of the array
    history.unshift(workoutSummary);
    
    // Save to localStorage
    try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
        
        // Schedule background sync if supported
        scheduleBackgroundSync();
    } catch (error) {
        console.error('Error saving workout history:', error);
    }
    
    // Update stats after saving
    updateWorkoutStats();
    
    return workoutSummary;
}

/**
 * Get the workout history array
 * @returns {Array} Array of workout history objects
 */
export function getWorkoutHistory() {
    try {
        const history = localStorage.getItem(HISTORY_STORAGE_KEY);
        return history ? JSON.parse(history) : [];
    } catch (error) {
        console.error('Error getting workout history:', error);
        return [];
    }
}

/**
 * Schedule background sync for workout data
 */
function scheduleBackgroundSync() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then(registration => {
            registration.sync.register('sync-workout-data')
                .catch(err => {
                    console.error('Background sync registration failed:', err);
                });
        });
    }
}

/**
 * Update workout statistics display
 */
export function updateWorkoutStats() {
    const totalWorkoutsEl = document.getElementById('total-workouts');
    const weekWorkoutsEl = document.getElementById('week-workouts');
    const streakCountEl = document.getElementById('streak-count');
    
    if (!totalWorkoutsEl || !weekWorkoutsEl || !streakCountEl) return;
    
    // Get workout history
    const history = getWorkoutHistory();
    
    // Calculate total workouts
    const totalWorkouts = history.length;
    
    // Calculate workouts this week
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday as first day
    startOfWeek.setHours(0, 0, 0, 0);
    
    const weekWorkouts = history.filter(workout => {
        const workoutDate = new Date(workout.date);
        return workoutDate >= startOfWeek;
    }).length;
    
    // Calculate streak
    const streak = calculateStreak(history);
    
    // Update elements
    totalWorkoutsEl.textContent = totalWorkouts;
    weekWorkoutsEl.textContent = weekWorkouts;
    streakCountEl.textContent = streak;
}

/**
 * Calculate the current streak of consecutive workout days
 * @param {Array} history - Array of workout history objects
 * @returns {number} The current streak count
 */
function calculateStreak(history) {
    if (history.length === 0) return 0;
    
    // Sort history by date (newest first)
    const sortedHistory = [...history].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    
    // Initialize variables
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    // Check if there's a workout today
    const todayWorkout = sortedHistory.find(workout => {
        const workoutDate = new Date(workout.date);
        workoutDate.setHours(0, 0, 0, 0);
        return workoutDate.getTime() === currentDate.getTime();
    });
    
    // If no workout today, check yesterday
    if (!todayWorkout) {
        const yesterday = new Date(currentDate);
        yesterday.setDate(currentDate.getDate() - 1);
        
        const yesterdayWorkout = sortedHistory.find(workout => {
            const workoutDate = new Date(workout.date);
            workoutDate.setHours(0, 0, 0, 0);
            return workoutDate.getTime() === yesterday.getTime();
        });
        
        // If no workout yesterday either, streak is 0
        if (!yesterdayWorkout) return 0;
        
        // Start counting from yesterday
        currentDate = yesterday;
    }
    
    // Create a map of dates with workouts
    const workoutDates = {};
    sortedHistory.forEach(workout => {
        const workoutDate = new Date(workout.date);
        workoutDate.setHours(0, 0, 0, 0);
        const dateKey = workoutDate.getTime();
        workoutDates[dateKey] = true;
    });
    
    // Count streak days
    let checkDate = new Date(currentDate);
    
    while (true) {
        const checkKey = checkDate.getTime();
        
        if (workoutDates[checkKey]) {
            streak++;
            
            // Move to previous day
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }
    
    return streak;
}

/**
 * Repeat a previous workout
 * @param {Object} workout - The workout object to repeat
 */
export function repeatWorkout(workout) {
    if (!workout) return;
    
    // Update workout config with the saved workout settings
    workoutConfig.workoutType = workout.workoutType;
    workoutConfig.difficulty = workout.difficulty;
    workoutConfig.rounds = workout.rounds;
    workoutConfig.roundLength = workout.roundLength;
    workoutConfig.breakLength = workout.breakLength;
    
    // Save the updated config
    saveWorkoutConfig();
    
    // Activate the workouts tab
    window.HeavyHITR.activateTab('workouts');
    
    // Update UI to reflect the loaded workout
    setTimeout(() => {
        // Get elements
        const categoryCards = document.querySelectorAll('.category-card');
        const difficultyBtns = document.querySelectorAll('.difficulty-btn');
        const roundsSlider = document.getElementById('rounds');
        const roundsValue = document.getElementById('rounds-value');
        const roundLengthSlider = document.getElementById('round-length');
        const roundLengthValue = document.getElementById('round-length-value');
        const breakLengthSlider = document.getElementById('break-length');
        const breakLengthValue = document.getElementById('break-length-value');
        
        // Update category selection
        categoryCards.forEach(card => {
            card.classList.remove('active');
            if (card.dataset.type === workout.workoutType) {
                card.classList.add('active');
            }
        });
        
        // Update difficulty selection
        difficultyBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.level === workout.difficulty) {
                btn.classList.add('active');
            }
        });
        
        // Update slider values
        if (roundsSlider && roundsValue) {
            roundsSlider.value = workout.rounds;
            roundsValue.textContent = workout.rounds;
        }
        
        if (roundLengthSlider && roundLengthValue) {
            roundLengthSlider.value = workout.roundLength;
            roundLengthValue.textContent = formatTime(workout.roundLength);
        }
        
        if (breakLengthSlider && breakLengthValue) {
            breakLengthSlider.value = workout.breakLength;
            breakLengthValue.textContent = formatTime(workout.breakLength);
        }
        
        // Show notification
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div class="notification-message">
                    Previous ${capitalizeFirstLetter(workout.workoutType)} workout loaded
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }, 100);
}

/**
 * Helper function to capitalize first letter (imported from utils.js)
 * Duplicated here to avoid circular imports
 * @param {string} string - The string to capitalize
 * @returns {string} The capitalized string
 */
function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export default {
    initCalendar,
    updateWorkoutStats,
    saveWorkoutHistory,
    getWorkoutHistory,
    repeatWorkout
};