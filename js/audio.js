/**
 * HeavyHITR - Audio Module
 * Handles audio playback
 * @author danweboptic
 * @lastUpdated 2025-03-21 14:33:37
 */
import { workoutConfig, musicSettings, workoutState } from './settings.js';
import { saveMusicSettings } from './config.js';

// Background music using Howler.js
let backgroundMusic = null;
let currentMusicTrack = null;
let audioInitialized = false;

// Music tracks collection - would be populated from settings.js
const musicTracks = {
    energetic: [
        { src: 'audio/energetic_beat_1.mp3', title: 'Energetic Beat 1' },
        { src: 'audio/energetic_beat_2.mp3', title: 'Energetic Beat 2' }
    ],
    relaxed: [
        { src: 'audio/relaxed_beat_1.mp3', title: 'Relaxed Beat 1' },
        { src: 'audio/relaxed_beat_2.mp3', title: 'Relaxed Beat 2' }
    ],
    intense: [
        { src: 'audio/intense_beat_1.mp3', title: 'Intense Beat 1' },
        { src: 'audio/intense_beat_2.mp3', title: 'Intense Beat 2' }
    ]
};

// Initialize Audio
export function initAudio() {
    if (audioInitialized) return;
    
    try {
        // Initialize audio system (no Web Audio API needed since we removed beat generation)
        audioInitialized = true;
        
        console.log('Audio system initialized');
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
export function stopAudio() {
    // Stop background music
    stopBackgroundMusic();
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
    const trackNameElement = document.getElementById('current-track-name');
    
    if (trackNameElement) {
        // Update track name if we have a track, otherwise show status
        if (currentMusicTrack) {
            trackNameElement.textContent = currentMusicTrack.title;
        } else {
            trackNameElement.textContent = musicSettings.enabled ? "Ready to play" : "Music off";
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
        
        // Update the music track info
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
    
    // Update music status text
    const musicStatus = document.getElementById('music-status');
    if (musicStatus) {
        musicStatus.textContent = musicSettings.enabled ? 'ON' : 'OFF';
    }
    
    const workoutMusicStatus = document.getElementById('workout-music-status');
    if (workoutMusicStatus) {
        workoutMusicStatus.textContent = musicSettings.enabled ? 'ON' : 'OFF';
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
    
    // Load music settings
    const musicInfo = getCurrentMusicInfo();
    
    // Set initial music control states
    if (musicVolumeSlider) {
        musicVolumeSlider.value = musicInfo.settings.volume;
    }
    
    if (musicStatusText) {
        musicStatusText.textContent = musicInfo.settings.enabled ? 'ON' : 'OFF';
    }
    
    // Music toggle event
    if (musicToggleBtn) {
        musicToggleBtn.addEventListener('click', function() {
            const isEnabled = toggleBackgroundMusic();
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
}