/**
 * HeavyHITR - Configuration Module
 * Utilities for managing app settings and preferences
 * @author danweboptic
 * @lastUpdated 2025-03-21 11:51:25
 */
import { workoutConfig, musicSettings } from './settings.js';

// Save settings to localStorage
export function saveSettings() {
    const settings = {
        rounds: workoutConfig.rounds,
        roundLength: workoutConfig.roundLength,
        breakLength: workoutConfig.breakLength,
        difficulty: workoutConfig.difficulty,
        workoutType: workoutConfig.workoutType
    };

    localStorage.setItem('heavyhitr-settings', JSON.stringify(settings));
}

// Load settings from localStorage
export function loadSettings() {
    const savedSettings = localStorage.getItem('heavyhitr-settings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);

        // Apply saved settings
        workoutConfig.rounds = settings.rounds || 6;
        workoutConfig.roundLength = settings.roundLength || 60;
        workoutConfig.breakLength = settings.breakLength || 20;
        workoutConfig.difficulty = settings.difficulty || 'intermediate';
        workoutConfig.workoutType = settings.workoutType || 'punching';
    }

    // Also load music settings and theme settings
    loadMusicSettings();
    loadThemeSettings();
}

// Save music settings to localStorage
export function saveMusicSettings() {
    try {
        localStorage.setItem('heavyhitr-music-settings', JSON.stringify(musicSettings));
    } catch (e) {
        console.error('Could not save music settings:', e);
    }
}

// Load music settings from localStorage
export function loadMusicSettings() {
    try {
        const saved = localStorage.getItem('heavyhitr-music-settings');
        if (saved) {
            const parsed = JSON.parse(saved);
            musicSettings.volume = parsed.volume !== undefined ? parsed.volume : 0.4;
            musicSettings.enabled = parsed.enabled !== undefined ? parsed.enabled : true;
            musicSettings.category = parsed.category || 'energetic';
        }
    } catch (e) {
        console.error('Could not load music settings:', e);
    }
}

// Save theme setting
export function saveThemeSettings(isDarkMode) {
    try {
        localStorage.setItem('heavyhitr-theme', isDarkMode ? 'dark' : 'light');
    } catch (e) {
        console.error('Could not save theme settings:', e);
    }
}

// Load theme settings
export function loadThemeSettings() {
    try {
        const savedTheme = localStorage.getItem('heavyhitr-theme');

        if (savedTheme) {
            // Apply saved theme
            if (savedTheme === 'light') {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
                document.getElementById('theme-toggle').checked = false;
            } else {
                document.documentElement.classList.add('dark');
                document.documentElement.classList.remove('light');
                document.getElementById('theme-toggle').checked = true;
            }
        } else {
            // Use system preference as default
            initTheme();
        }
    } catch (e) {
        console.error('Could not load theme settings:', e);

        // Fallback to system preference
        initTheme();
    }
}

// Check for dark mode preference and set appropriate class
export function initTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');

        if (document.getElementById('theme-toggle')) {
            document.getElementById('theme-toggle').checked = true;
        }
    } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');

        if (document.getElementById('theme-toggle')) {
            document.getElementById('theme-toggle').checked = false;
        }
    }

    // Listen for theme changes
    setupThemeToggle();
}

// Set up theme toggle
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');

    if (themeToggle) {
        themeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.documentElement.classList.add('dark');
                document.documentElement.classList.remove('light');
                saveThemeSettings(true);
            } else {
                document.documentElement.classList.add('light');
                document.documentElement.classList.remove('dark');
                saveThemeSettings(false);
            }
        });
    }
}