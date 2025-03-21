/**
 * HeavyHITR - Main Application
 * Entry point for the application
 */

// Initialize the application
function init() {
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
}

// Run initialization when DOM is ready
document.addEventListener('DOMContentLoaded', init);