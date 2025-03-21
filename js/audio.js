/**
 * HeavyHITR - Audio Module
 * Handles audio generation and playback
 * @author danweboptic
 * @lastUpdated 2025-03-21 11:48:06
 */
import { workoutConfig, musicSettings, workoutState, musicTracks } from './settings.js';
import { saveMusicSettings } from './config.js';

// Background music using Howler.js
let backgroundMusic = null;
let currentMusicTrack = null;
let audioInitialized = false;

// Initialize Audio
export function initAudio(elements) {
    if (audioInitialized) return;
    
    try {
        // No longer creating audio context since we're removing beat generation
        audioInitialized = true;
        
        // Just for visual feedback that audio is enabled
        if (elements && elements.audioIndicator) {
            elements.audioIndicator.classList.remove('hidden');
        }
    } catch (e) {
        console.error('Audio initialization failed:', e);
    }
}

// Start music if enabled
export function startAudio() {
    // Start background music if enabled
    if (musicSettings.enabled) {
        startBackgroundMusic();
    }
}

// Stop all audio
export function stopAudio(elements) {
    // Stop background music
    stopBackgroundMusic();
    
    // Hide audio indicator
    if (elements && elements.audioIndicator) {
        elements.audioIndicator.classList.add('hidden');
    }
}

// Start background music
function startBackgroundMusic() {
    // Stop any existing music
    stopBackgroundMusic();
    
    // Select a track based on difficulty or workout type
    let category = musicSettings.category;
    
    // Match music to workout difficulty
    if (workoutConfig.difficulty === 'beginner') {
        category = 'relaxed';
    } else if (workoutConfig.difficulty === 'advanced') {
        category = 'intense';
    } else {
        category = 'energetic';
    }
    
    // Get available tracks in the selected category
    const availableTracks = musicTracks[category] || musicTracks.energetic;
    
    // Randomly select a track
    const selectedTrack = availableTracks[Math.floor(Math.random() * availableTracks.length)];
    
    // Create a new Howl instance for the background music
    backgroundMusic = new Howl({
        src: [selectedTrack.src],
        loop: true,
        volume: musicSettings.volume,
        html5: true, // Better for longer files
        onload: function() {
            console.log(`Loaded music track: ${selectedTrack.title}`);
        },
        onplay: function() {
            currentMusicTrack = selectedTrack;
            console.log(`Playing: ${selectedTrack.title}`);
            
            // Update music track display
            updateMusicTrackDisplay();
        },
        onloaderror: function(id, err) {
            console.error('Music loading error:', err);
        }
    });
    
    // Start playing
    backgroundMusic.play();
}

// Update music track display
function updateMusicTrackDisplay() {
    const musicTrackInfoDiv = document.getElementById('music-track-info');
    const currentTrackNameSpan = document.getElementById('current-track-name');
    
    if (musicTrackInfoDiv && currentTrackNameSpan) {
        // Always show the music controls during workout
        musicTrackInfoDiv.classList.remove('hidden');
        
        // Update track name if we have a track, otherwise show status
        if (currentMusicTrack) {
            currentTrackNameSpan.textContent = currentMusicTrack.title;
        } else {
            currentTrackNameSpan.textContent = musicSettings.enabled ? "Ready to play" : "Music off";
        }
    }
}

// Stop background music
function stopBackgroundMusic() {
    if (backgroundMusic) {
        backgroundMusic.stop();
        backgroundMusic.unload();
        backgroundMusic = null;
        currentMusicTrack = null;
        
        // Update the music track info to show status rather than hiding it
        updateMusicTrackDisplay();
    }
}

// Toggle background music
export function toggleBackgroundMusic() {
    musicSettings.enabled = !musicSettings.enabled;
    
    if (musicSettings.enabled && workoutState.isRunning && !workoutState.isPaused) {
        startBackgroundMusic();
    } else if (!musicSettings.enabled) {
        stopBackgroundMusic();
    }
    
    // Always update the music track display, even if music is off
    updateMusicTrackDisplay();
    
    // Save the new setting
    saveMusicSettings();
    
    return musicSettings.enabled;
}

// Set music volume
export function setMusicVolume(volume) {
    musicSettings.volume = volume;
    
    if (backgroundMusic) {
        backgroundMusic.volume(volume);
    }
    
    // Save the new setting
    saveMusicSettings();
}

// Get current music info
export function getCurrentMusicInfo() {
    return {
        playing: !!backgroundMusic && !backgroundMusic.paused(),
        track: currentMusicTrack,
        settings: { ...musicSettings }
    };
}

// Set up music controls
export function setupMusicControls() {
    // Music control elements
    const musicToggleBtn = document.getElementById('toggle-music');
    const musicStatusText = document.getElementById('music-status');
    const musicVolumeSlider = document.getElementById('music-volume');
    const workoutMusicToggleBtn = document.getElementById('workout-toggle-music');
    const workoutMusicStatusText = document.getElementById('workout-music-status');
    
    // Load music settings
    const musicInfo = getCurrentMusicInfo();
    
    // Set initial music control states
    if (musicVolumeSlider) {
        musicVolumeSlider.value = musicInfo.settings.volume;
    }
    
    if (musicStatusText) {
        musicStatusText.textContent = musicInfo.settings.enabled ? 'ON' : 'OFF';
    }
    
    if (workoutMusicStatusText) {
        workoutMusicStatusText.textContent = musicInfo.settings.enabled ? 'ON' : 'OFF';
    }
    
    // Music toggle event on setup screen
    if (musicToggleBtn) {
        musicToggleBtn.addEventListener('click', function() {
            const isEnabled = toggleBackgroundMusic();
            musicStatusText.textContent = isEnabled ? 'ON' : 'OFF';
            
            if (workoutMusicStatusText) {
                workoutMusicStatusText.textContent = isEnabled ? 'ON' : 'OFF';
            }
        });
    }
    
    // Music toggle during workout
    if (workoutMusicToggleBtn) {
        workoutMusicToggleBtn.addEventListener('click', function() {
            const isEnabled = toggleBackgroundMusic();
            workoutMusicStatusText.textContent = isEnabled ? 'ON' : 'OFF';
            
            if (musicStatusText) {
                musicStatusText.textContent = isEnabled ? 'ON' : 'OFF';
            }
        });
    }
    
    // Music volume event
    if (musicVolumeSlider) {
        musicVolumeSlider.addEventListener('input', function() {
            setMusicVolume(parseFloat(this.value));
        });
    }
    
    // Ensure music track info is visible during workout if we're in workout mode
    if (workoutState && workoutState.isRunning) {
        updateMusicTrackDisplay();
    }
}