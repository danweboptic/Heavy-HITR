/**
 * HeavyHITR - Utilities Module
 * Common utility functions used throughout the app
 */

/**
 * Format seconds into MM:SS display format
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time string (MM:SS)
 */
export function formatTime(seconds) {
  if (typeof seconds !== 'number' || seconds < 0) {
    return '0:00';
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format a date in YYYY-MM-DD format
 * @param {Date} date - The date to format
 * @returns {string} - Formatted date string
 */
export function formatDate(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Format relative date (Today, Yesterday, or formatted date)
 * @param {Date} date - The date to format
 * @returns {string} - Formatted relative date
 */
export function formatRelativeDate(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (formatDate(date) === formatDate(today)) {
    return 'Today';
  } else if (formatDate(date) === formatDate(yesterday)) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
}

/**
 * Calculate estimated calories burned based on duration and intensity
 * @param {number} durationSeconds - Duration in seconds
 * @param {number} weight - User's weight in kg
 * @param {string} difficulty - Workout difficulty level
 * @returns {number} - Estimated calories burned
 */
export function calculateCaloriesBurned(durationSeconds, weight, difficulty) {
  // Convert weight from kg to lbs if necessary
  const weightInKg = weight;

  // MET values for boxing activities by difficulty
  // MET = Metabolic Equivalent of Task
  const metValues = {
    beginner: 6.5,
    intermediate: 8.5,
    advanced: 10.5
  };

  // Default to intermediate if difficulty not specified
  const met = metValues[difficulty] || metValues.intermediate;

  // Calories burned = MET * weight in kg * duration in hours
  const durationHours = durationSeconds / 3600;
  const calories = Math.round(met * weightInKg * durationHours);

  return calories;
}

/**
 * Generate a UUID (v4) for uniquely identifying workouts
 * @returns {string} - UUID string
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - The function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait) {
  let timeout;

  return function() {
    const context = this;
    const args = arguments;

    clearTimeout(timeout);

    timeout = setTimeout(function() {
      func.apply(context, args);
    }, wait);
  };
}

/**
 * Capitalize the first letter of a string
 * @param {string} string - The string to capitalize
 * @returns {string} - The capitalized string
 */
export function capitalizeFirstLetter(string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Get browser language preference
 * @returns {string} - Language code (e.g., 'en-US')
 */
export function getBrowserLanguage() {
  return navigator.language || navigator.userLanguage || 'en-US';
}

/**
 * Check if the device is in portrait or landscape mode
 * @returns {boolean} - True if in portrait mode
 */
export function isPortraitMode() {
  return window.innerHeight > window.innerWidth;
}

/**
 * Safely parse JSON with error handling
 * @param {string} json - The JSON string to parse
 * @param {any} fallback - Fallback value if parsing fails
 * @returns {any} - Parsed object or fallback value
 */
export function safeJsonParse(json, fallback = {}) {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return fallback;
  }
}

/**
 * Format a number with thousand separators
 * @param {number} num - The number to format
 * @returns {string} - Formatted number string
 */
export function formatNumber(num) {
  return new Intl.NumberFormat().format(num);
}

export default {
  formatTime,
  formatDate,
  formatRelativeDate,
  calculateCaloriesBurned,
  generateUUID,
  debounce,
  capitalizeFirstLetter,
  getBrowserLanguage,
  isPortraitMode,
  safeJsonParse,
  formatNumber
};