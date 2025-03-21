/**
 * HeavyHITR - Audio Module
 * Handles audio generation and playback
 */

// Audio Context for workout sounds
let audioContext;
let audioInitialized = false;
let beatInterval;
let oscillator;
let gainNode;

// Background music using Howler.js
let backgroundMusic = null;
let currentMusicTrack = null;

// Music tracks collection
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

// Default music settings
const musicSettings = {
    volume: 0.4,
    enabled: true,
    category: 'energetic'
};

// Initialize Audio Context
function initAudio() {
    if (audioInitialized) return;

    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        gainNode = audioContext.createGain();
        gainNode.gain.value = 0.3;
        gainNode.connect(audioContext.destination);
        audioInitialized = true;
        elements.audioIndicator.classList.remove('hidden');

        // Load user music preferences if available
        loadMusicSettings();
    } catch (e) {
        console.error('Web Audio API not supported:', e);
    }
}

// Generate beat sound
function startBeat() {
    if (!audioInitialized) return;

    const bpmRange = workoutConfig.bpmRanges[workoutConfig.difficulty];
    const bpm = Math.floor(Math.random() * (bpmRange.max - bpmRange.min + 1)) + bpmRange.min;
    const beatMs = 60000 / bpm;  // Use a different variable name to avoid conflict

    let lastBeatTime = 0;

    // Clear existing interval if any
    if (beatInterval) {
        clearInterval(beatInterval);
    }

    // Set new beat interval
    beatInterval = setInterval(() => {
        const now = audioContext.currentTime;

        // Only play if enough time has passed (avoiding rapid-fire beats)
        if (now - lastBeatTime > 0.1) {
            // Create and configure oscillator
            oscillator = audioContext.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.value = 330;

            // Create and configure gain node for this beat
            const beatGain = audioContext.createGain();
            beatGain.gain.value = 0.2;

            // Connect nodes
            oscillator.connect(beatGain);
            beatGain.connect(gainNode);

            // Schedule envelope
            const startTime = now;
            const stopTime = startTime + 0.1;

            beatGain.gain.setValueAtTime(0.2, startTime);
            beatGain.gain.exponentialRampToValueAtTime(0.001, stopTime);

            // Start and stop oscillator
            oscillator.start(startTime);
            oscillator.stop(stopTime);

            lastBeatTime = now;
        }
    }, beatMs);

    // Start background music if enabled
    if (musicSettings.enabled) {
        startBackgroundMusic();
    }
}

// Stop beat sound
function stopBeat() {
    if (beatInterval) {
        clearInterval(beatInterval);
        beatInterval = null;
    }

    if (oscillator) {
        try {
            oscillator.stop();
            oscillator.disconnect();
        } catch (e) {
            // Handle potential errors when stopping oscillator
        }
        oscillator = null;
    }

    // Stop background music
    stopBackgroundMusic();

    elements.audioIndicator.classList.add('hidden');
}

// Start background music
function startBackgroundMusic() {
    // Stop any existing music
    stopBackgroundMusic();

    // Select a track based on difficulty or workout type
    let category = musicSettings.category;

    // Alternatively, match music to workout difficulty
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

    if (musicTrackInfoDiv && currentTrackNameSpan && currentMusicTrack) {
        musicTrackInfoDiv.classList.remove('hidden');
        currentTrackNameSpan.textContent = currentMusicTrack.title;
    }
}

// Stop background music
function stopBackgroundMusic() {
    if (backgroundMusic) {
        backgroundMusic.stop();
        backgroundMusic.unload();
        backgroundMusic = null;
        currentMusicTrack = null;

        // Hide music track info
        const musicTrackInfoDiv = document.getElementById('music-track-info');
        if (musicTrackInfoDiv) {
            musicTrackInfoDiv.classList.add('hidden');
        }
    }
}

// Toggle background music
function toggleBackgroundMusic() {
    musicSettings.enabled = !musicSettings.enabled;

    if (musicSettings.enabled && workoutState.isRunning && !workoutState.isPaused) {
        startBackgroundMusic();
    } else if (!musicSettings.enabled) {
        stopBackgroundMusic();
    }

    // Save the new setting
    saveMusicSettings();

    return musicSettings.enabled;
}

// Set music volume
function setMusicVolume(volume) {
    musicSettings.volume = volume;

    if (backgroundMusic) {
        backgroundMusic.volume(volume);
    }

    // Save the new setting
    saveMusicSettings();
}

// Save music settings to localStorage
function saveMusicSettings() {
    try {
        localStorage.setItem('heavyhitr-music-settings', JSON.stringify(musicSettings));
    } catch (e) {
        console.error('Could not save music settings:', e);
    }
}

// Load music settings from localStorage
function loadMusicSettings() {
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

// Get current music info
function getCurrentMusicInfo() {
    return {
        playing: !!backgroundMusic && !backgroundMusic.paused(),
        track: currentMusicTrack,
        settings: { ...musicSettings }
    };
}

// Set up music controls
function setupMusicControls() {
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
}

// Export module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initAudio,
        startBeat,
        stopBeat,
        toggleBackgroundMusic,
        setMusicVolume,
        getCurrentMusicInfo,
        setupMusicControls
    };
}