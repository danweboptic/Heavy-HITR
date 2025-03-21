/**
 * HeavyHITR - Main Application
 * Entry point for the application
 * @author danweboptic
 * @lastUpdated 2025-03-21 11:51:25
 */
import { loadSettings, initTheme } from './config.js';
import { setupMusicControls } from './audio.js';
import { initUIConfig, setupUIEventListeners } from './ui.js';

// Initialize the application
function init() {
    console.log('HeavyHITR App Initializing...');

    // Initialize theme
    initTheme();

    // Load saved settings
    loadSettings();

    // Setup UI with loaded settings
    initUIConfig();

    // Setup event listeners
    setupUIEventListeners();

    // Setup music controls
    setupMusicControls();

    console.log('HeavyHITR App Initialized');
}

// Run initialization when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Add fade-in animation to main container
window.addEventListener('load', () => {
    document.querySelector('.container').classList.add('fade-enter-active');
});