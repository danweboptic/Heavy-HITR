/**
 * HeavyHITR - History Module
 * Handles workout history tracking and statistics
 * @author danweboptic
 * @lastUpdated 2025-03-21 15:30:45
 */

import { workoutConfig, workoutState } from './settings.js';
import { formatTime, formatDate, capitalizeFirstLetter } from './utils.js';

// Get workout history from localStorage
export function getWorkoutHistory() {
    const savedHistory = localStorage.getItem('heavyhitr-workout-history');
    return savedHistory ? JSON.parse(savedHistory) : [];
}

// Save current workout to history
export function saveWorkoutHistory() {
    // Get existing workout history
    const workoutHistory = getWorkoutHistory();

    // Create new workout entry with comprehensive data
    const newWorkout = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        type: workoutConfig.workoutType,
        difficulty: workoutConfig.difficulty,
        rounds: workoutState.currentRound,
        totalRounds: workoutConfig.rounds,
        totalTime: workoutState.totalTime,
        roundLength: workoutConfig.roundLength,
        breakLength: workoutConfig.breakLength,
        completionPercentage: Math.round((workoutState.currentRound / workoutConfig.rounds) * 100),
        caloriesBurned: calculateCaloriesBurned()
    };

    // Add to history
    workoutHistory.push(newWorkout);

    // Save to localStorage (limit to last 100 workouts to save space)
    if (workoutHistory.length > 100) {
        workoutHistory.shift(); // Remove oldest workout
    }

    localStorage.setItem('heavyhitr-workout-history', JSON.stringify(workoutHistory));

    console.log('Workout saved to history:', newWorkout);
    return newWorkout;
}

// Calculate estimated calories burned based on workout parameters
function calculateCaloriesBurned() {
    // Boxing MET value ranges from 7-9 depending on intensity
    let metValue;

    switch (workoutConfig.difficulty) {
        case 'beginner':
            metValue = 7;
            break;
        case 'intermediate':
            metValue = 8;
            break;
        case 'advanced':
            metValue = 9;
            break;
        default:
            metValue = 8;
    }

    // Calories = MET × weight (kg) × duration (hours)
    // Using average weight of 70kg if not specified in settings
    const weightKg = 70;

    // Convert seconds to hours
    const durationHours = workoutState.totalTime / 3600;

    // Calculate and round to nearest integer
    return Math.round(metValue * weightKg * durationHours);
}

// Initialize calendar with workout history
export function initCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    if (!calendarGrid) return;

    // Clear existing calendar
    calendarGrid.innerHTML = '';

    // Get current date info
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Update month header
    const monthHeader = document.querySelector('.month-header');
    if (monthHeader) {
        monthHeader.textContent = new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });
    }

    // Number of days in current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // First day of month (0 = Sunday, 1 = Monday, etc.)
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();

    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day';
        calendarGrid.appendChild(emptyCell);
    }

    // Get workout history from localStorage
    const workoutHistory = getWorkoutHistory();

    // Get workout dates in this month (for highlighting)
    const workoutDatesThisMonth = new Map();

    workoutHistory.forEach(workout => {
        const workoutDate = new Date(workout.date);
        if (workoutDate.getMonth() === currentMonth &&
            workoutDate.getFullYear() === currentYear) {

            const day = workoutDate.getDate();

            // If we already have a workout for this day, increment the count
            if (workoutDatesThisMonth.has(day)) {
                workoutDatesThisMonth.set(day, workoutDatesThisMonth.get(day) + 1);
            } else {
                workoutDatesThisMonth.set(day, 1);
            }
        }
    });

    // Add calendar days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.textContent = day;

        // Highlight today
        if (day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear()) {
            dayCell.classList.add('today');
        }

        // Highlight days with workouts
        if (workoutDatesThisMonth.has(day)) {
            dayCell.classList.add('has-workout');

            // Add count indicator for multiple workouts
            const workoutCount = workoutDatesThisMonth.get(day);
            if (workoutCount > 1) {
                const countBadge = document.createElement('span');
                countBadge.className = 'workout-count';
                countBadge.textContent = workoutCount;
                dayCell.appendChild(countBadge);
            }

            // Add click handler to show workouts for that day
            dayCell.addEventListener('click', () => {
                showWorkoutsForDay(currentYear, currentMonth, day);
            });
        }

        calendarGrid.appendChild(dayCell);
    }

    // Update workout history list
    updateWorkoutHistoryList(workoutHistory);
}

// Show workouts for a specific day in a modal
function showWorkoutsForDay(year, month, day) {
    // Get workout history
    const workoutHistory = getWorkoutHistory();

    // Filter workouts for the specified day
    const selectedDate = new Date(year, month, day);
    const workoutsOnDay = workoutHistory.filter(workout => {
        const workoutDate = new Date(workout.date);
        return workoutDate.getFullYear() === year &&
               workoutDate.getMonth() === month &&
               workoutDate.getDate() === day;
    });

    if (workoutsOnDay.length === 0) return;

    // Create modal content
    const dateString = selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    let modalContent = `
        <div class="modal-header">
            <h2>${dateString}</h2>
            <p>${workoutsOnDay.length} workout${workoutsOnDay.length > 1 ? 's' : ''}</p>
        </div>
        <div class="modal-body">
    `;

    // Add each workout
    workoutsOnDay.forEach(workout => {
        const time = new Date(workout.date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        modalContent += `
            <div class="modal-workout-item">
                <div class="modal-workout-header">
                    <h3>${capitalizeFirstLetter(workout.difficulty)} ${capitalizeFirstLetter(workout.type)}</h3>
                    <span>${time}</span>
                </div>
                <div class="modal-workout-details">
                    <div class="modal-workout-stat">
                        <span class="stat-label">Rounds</span>
                        <span class="stat-value">${workout.rounds}/${workout.totalRounds}</span>
                    </div>
                    <div class="modal-workout-stat">
                        <span class="stat-label">Time</span>
                        <span class="stat-value">${formatTime(workout.totalTime)}</span>
                    </div>
                    <div class="modal-workout-stat">
                        <span class="stat-label">Calories</span>
                        <span class="stat-value">${workout.caloriesBurned || '-'}</span>
                    </div>
                </div>
                <div class="modal-workout-actions">
                    <button class="repeat-workout-btn" data-workout-id="${workout.id}">Repeat</button>
                </div>
            </div>
        `;
    });

    modalContent += `
        </div>
        <div class="modal-footer">
            <button id="close-modal-btn">Close</button>
        </div>
    `;

    // Show the modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            ${modalContent}
        </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);

    const closeBtn = modal.querySelector('#close-modal-btn');
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    });

    const repeatBtns = modal.querySelectorAll('.repeat-workout-btn');
    repeatBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const workoutId = btn.dataset.workoutId;
            repeatWorkout(workoutId);
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        });
    });
}

// Update workout history list in UI
export function updateWorkoutHistoryList(workoutHistory = null) {
    const historyContainer = document.querySelector('.workout-history');
    if (!historyContainer) return;

    // Get history if not provided
    if (!workoutHistory) {
        workoutHistory = getWorkoutHistory();
    }

    // Clear existing history
    historyContainer.innerHTML = '';

    // Get latest 5 workouts
    const recentWorkouts = workoutHistory
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    // If no workouts yet
    if (recentWorkouts.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'text-center text-gray-400 py-4';
        emptyMessage.textContent = 'No workout history yet. Complete your first workout!';
        historyContainer.appendChild(emptyMessage);
        return;
    }

    // Add workout history items
    recentWorkouts.forEach(workout => {
        // Format date for display
        const displayDate = getRelativeDateDisplay(new Date(workout.date));

        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-date">${displayDate}</div>
            <div class="history-workout">
                <div class="history-workout-title">${capitalizeFirstLetter(workout.difficulty)} ${capitalizeFirstLetter(workout.type)}</div>
                <div class="history-workout-details">
                    <span class="detail-chip">${workout.rounds} rounds</span>
                    <span class="detail-chip">${formatTime(workout.totalTime)}</span>
                    ${workout.caloriesBurned ? `<span class="detail-chip">${workout.caloriesBurned} cal</span>` : ''}
                </div>
            </div>
            <div class="history-action">
                <button class="icon-btn" data-workout-id="${workout.id}" title="Repeat this workout">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>
        `;

        // Add repeat workout capability
        const repeatBtn = historyItem.querySelector('.icon-btn');
        repeatBtn.addEventListener('click', () => {
            repeatWorkout(workout.id);
        });

        historyContainer.appendChild(historyItem);
    });

    // Update workout stats
    updateWorkoutStats(workoutHistory);
}

// Helper function to get relative date display
function getRelativeDateDisplay(date) {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }
}

// Update workout statistics
export function updateWorkoutStats(workoutHistory = null) {
    // Find stat elements
    const workoutCountElement = document.querySelector('.stats-summary .stat-item:nth-child(1) .stat-value');
    const totalMinutesElement = document.querySelector('.stats-summary .stat-item:nth-child(2) .stat-value');
    const totalRoundsElement = document.querySelector('.stats-summary .stat-item:nth-child(3) .stat-value');

    if (!workoutCountElement || !totalMinutesElement || !totalRoundsElement) return;

    // Get history if not provided
    if (!workoutHistory) {
        workoutHistory = getWorkoutHistory();
    }

    // Calculate stats
    const workoutCount = workoutHistory.length;
    const totalMinutes = Math.floor(workoutHistory.reduce((total, workout) => total + (workout.totalTime || 0), 0) / 60);
    const totalRounds = workoutHistory.reduce((total, workout) => total + (workout.rounds || 0), 0);

    // Update UI
    workoutCountElement.textContent = workoutCount;
    totalMinutesElement.textContent = totalMinutes;
    totalRoundsElement.textContent = totalRounds;

    // Initialize stats charts
    initStatsCharts(workoutHistory);
}

// Repeat a previous workout
export function repeatWorkout(workoutId) {
    // Get workout history
    const workoutHistory = getWorkoutHistory();

    // Find the selected workout
    const workout = workoutHistory.find(w => w.id === workoutId);

    if (workout) {
        // Update workout config with the settings from this workout
        Object.assign(workoutConfig, {
            workoutType: workout.type,
            difficulty: workout.difficulty,
            rounds: workout.totalRounds,
            roundLength: workout.roundLength,
            breakLength: workout.breakLength
        });

        // Save these settings
        import('./settings.js').then(module => {
            module.saveWorkoutConfig();
        });

        // Navigate to workouts tab and update UI
        const workoutsTab = document.getElementById('tab-workouts');
        if (workoutsTab) {
            workoutsTab.click();

            // Also update the UI to reflect these changes
            document.querySelectorAll('.category-card').forEach(card => {
                card.classList.remove('active');
                if (card.dataset.type === workout.type) {
                    card.classList.add('active');
                }
            });

            document.querySelectorAll('.difficulty-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.level === workout.difficulty) {
                    btn.classList.add('active');
                }
            });

            const roundsSlider = document.getElementById('rounds');
            const roundsValue = document.getElementById('rounds-value');
            if (roundsSlider && roundsValue) {
                roundsSlider.value = workout.totalRounds;
                roundsValue.textContent = workout.totalRounds;
            }

            const roundLengthSlider = document.getElementById('round-length');
            const roundLengthValue = document.getElementById('round-length-value');
            if (roundLengthSlider && roundLengthValue) {
                roundLengthSlider.value = workout.roundLength;
                roundLengthValue.textContent = formatTime(workout.roundLength);
            }

            const breakLengthSlider = document.getElementById('break-length');
            const breakLengthValue = document.getElementById('break-length-value');
            if (breakLengthSlider && breakLengthValue) {
                breakLengthSlider.value = workout.breakLength;
                breakLengthValue.textContent = formatTime(workout.breakLength);
            }
        }

        alert(`Workout loaded: ${capitalizeFirstLetter(workout.difficulty)} ${capitalizeFirstLetter(workout.type)}`);
    }
}

// Initialize statistics charts
export function initStatsCharts(workoutHistory = null) {
    // Get the charts container
    const statsContainer = document.getElementById('stats-charts');
    if (!statsContainer) return;

    // Get history if not provided
    if (!workoutHistory) {
        workoutHistory = getWorkoutHistory();
    }

    // If not enough data, show message
    if (workoutHistory.length < 2) {
        statsContainer.innerHTML = '<div class="text-center text-gray-400 py-4">Complete more workouts to see detailed statistics</div>';
        return;
    }

    // Prepare data for charts
    const last14Days = [];
    const today = new Date();

    // Create array of last 14 days
    for (let i = 13; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        date.setHours(0, 0, 0, 0);
        last14Days.push({
            date: date,
            workouts: 0,
            time: 0,
            rounds: 0
        });
    }

    // Fill in workout data
    workoutHistory.forEach(workout => {
        const workoutDate = new Date(workout.date);
        workoutDate.setHours(0, 0, 0, 0);

        for (let i = 0; i < last14Days.length; i++) {
            if (workoutDate.getTime() === last14Days[i].date.getTime()) {
                last14Days[i].workouts++;
                last14Days[i].time += workout.totalTime || 0;
                last14Days[i].rounds += workout.rounds || 0;
                break;
            }
        }
    });

    // Format data for Chart.js
    const labels = last14Days.map(day =>
        day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );

    const workoutsData = last14Days.map(day => day.workouts);
    const timeData = last14Days.map(day => Math.floor(day.time / 60)); // Convert seconds to minutes
    const roundsData = last14Days.map(day => day.rounds);

    // Create the charts container HTML
    statsContainer.innerHTML = `
        <div class="chart-header">Activity Over Last 14 Days</div>
        <canvas id="activity-chart" height="200"></canvas>
        <div class="chart-header mt-4">Workout Type Distribution</div>
        <canvas id="types-chart" height="200"></canvas>
    `;

    // Wait for next tick to ensure canvas is in the DOM
    setTimeout(() => {
        // Create the activity chart using Chart.js global object
        const activityCtx = document.getElementById('activity-chart').getContext('2d');

        new Chart(activityCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Workout Minutes',
                    data: timeData,
                    backgroundColor: 'rgba(117, 250, 194, 0.7)',
                    borderColor: 'rgba(117, 250, 194, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#8B97A8'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#8B97A8'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#E1E1E1'
                        }
                    }
                }
            }
        });

        // Workout type distribution chart
        const workoutTypes = {};
        workoutHistory.forEach(workout => {
            const type = workout.type || 'unknown';
            workoutTypes[type] = (workoutTypes[type] || 0) + 1;
        });

        const typesCtx = document.getElementById('types-chart').getContext('2d');

        new Chart(typesCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(workoutTypes).map(capitalizeFirstLetter),
                datasets: [{
                    data: Object.values(workoutTypes),
                    backgroundColor: [
                        'rgba(117, 250, 194, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(153, 102, 255, 0.7)'
                    ],
                    borderColor: 'rgba(10, 21, 40, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#E1E1E1'
                        }
                    }
                }
            }
        });
    }, 0);
}

// Export all functions we need
export default {
    getWorkoutHistory,
    saveWorkoutHistory,
    initCalendar,
    updateWorkoutHistoryList,
    updateWorkoutStats,
    repeatWorkout,
    initStatsCharts
};