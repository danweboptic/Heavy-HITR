/**
 * HeavyHITR - Audio Module
 * Handles audio playback
 * @author danweboptic
 * @lastUpdated 2025-03-24 12:01:35
 */
import { workoutConfig, musicSettings, workoutState, appSettings } from './settings.js';
import { saveMusicSettings } from './config.js';

// Background music using Howler.js
let backgroundMusic = null;
let currentMusicTrack = null;
let audioInitialized = false;

// For iOS compatibility
let soundsInitialized = false;
let soundsQueue = [];

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

// Sound effects mapping
const soundEffects = {
    start: 'audio/workout-start.mp3',
    roundStart: 'audio/round-start.mp3',
    roundEnd: 'audio/round-end.mp3',
    countdown: 'audio/countdown-beep.mp3',
    pause: 'audio/pause.mp3',
    resume: 'audio/resume.mp3',
    complete: 'audio/workout-complete.mp3',
    tap: 'audio/tap.mp3' // New small sound for UI interactions
};

// Sound effect instances for caching
const soundInstances = {};

// Initialize Audio
export function initAudio() {
    if (audioInitialized) return true;

    try {
        // Ensure Howler is available
        if (typeof window.Howl !== 'function') {
            console.error('Howler.js not loaded!');
            return false;
        }

        // Set up Howler.js global settings for iOS
        Howler.autoUnlock = true; // Enable auto-unlock for mobile
        Howler.html5PoolSize = 10; // Increase html5 pool size for better reliability

        // Force unlock audio context if suspended
        if (Howler.ctx && Howler.ctx.state === 'suspended') {
            Howler.ctx.resume().then(() => {
                console.log('Howler audio context resumed on init');
            });
        }

        // Initialize sound effects for iOS
        initSoundEffects();

        // Play a silent sound to unlock audio on iOS
        const silentSound = new Howl({
            src: ['audio/tap.mp3'],
            volume: 0.01,
            autoplay: true,
            onend: function() {
                console.log('Silent sound played successfully');
            },
            onloaderror: function() {
                console.warn('Silent sound load error');
            }
        });

        audioInitialized = true;
        console.log('Audio system initialized');

        // Enable iOS workaround for audio unlocking
        setupiOSAudioUnlock();

        return true;
    } catch (e) {
        console.error('Audio initialization failed:', e);
        return false;
    }
}

// Initialize sound effects for iOS compatibility
function initSoundEffects() {
    // Preload common sound effects as Howl instances
    Object.entries(soundEffects).forEach(([type, src]) => {
        soundInstances[type] = new Howl({
            src: [src],
            volume: 0.7,
            html5: false, // Use Web Audio API for sound effects
            preload: true,
            onload: () => console.log(`Sound ${type} loaded`),
            onloaderror: (id, err) => console.error(`Sound ${type} loading error:`, err)
        });
    });

    soundsInitialized = true;

    // Process any queued sounds
    processSoundQueue();
}

// For iOS compatibility - unlock audio on first tap
function setupiOSAudioUnlock() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (isIOS) {
        console.log('iOS device detected, setting up audio unlock');

        // Use multiple events for iOS
        const unlockEvents = ['touchend', 'touchstart', 'click', 'mousedown'];
        unlockEvents.forEach(event => {
            document.addEventListener(event, unlockAudio, {once: true});
        });

        // Also add a tiny tap sound to ensure unlock works
        const unlockElement = document.getElementById('audio-unlock');
        if (!unlockElement) {
            const audio = new Audio('audio/tap.mp3');
            audio.id = 'audio-unlock';
            audio.volume = 0.01;
            document.body.appendChild(audio);
        }
    }
}

// Unlock audio function for iOS
function unlockAudio() {
    console.log('Attempting to unlock audio...');

    // Try to play a short sound
    playSound('tap', 0.01);

    // Also try to unlock directly with Howler
    if (Howler.ctx && Howler.ctx.state === 'suspended') {
        Howler.ctx.resume().then(() => {
            console.log('Howler audio context resumed successfully');

            // Process any sound queue that built up
            processSoundQueue();
        });
    }

    // Try to play the unlock element directly
    const unlockElement = document.getElementById('audio-unlock');
    if (unlockElement) {
        unlockElement.play().catch(err =>
            console.log('Expected audio unlock element error:', err)
        );
    }
}

// Start music if enabled
export function startAudio() {
    // Initialize audio if not already initialized
    if (!audioInitialized) {
        initAudio();
    }

    // Play workout start sound
    playSound('start');

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

    // Play a UI sound for iOS compatibility
    playSound('tap');

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

// Play sound with iOS compatibility
export function playSound(type, customVolume) {
    if (!appSettings.soundEffects && type !== 'tap') return;

    // Initialize audio if not already initialized
    if (!audioInitialized) {
        initAudio();
    }

    // Volume can be customized or default to 0.7 (70%)
    const volume = customVolume !== undefined ? customVolume : 0.7;

    // If not initialized or still initializing, queue the sound
    if (!soundsInitialized) {
        soundsQueue.push({ type, volume, timestamp: Date.now() });
        return;
    }

    // Get the sound instance
    const sound = soundInstances[type];

    if (sound) {
        // Set volume and play
        sound.volume(volume);
        const id = sound.play();
        console.log(`Playing sound: ${type} with ID: ${id}`);
    } else {
        // Fallback to HTML5 Audio if the sound wasn't preloaded
        const soundFile = soundEffects[type];
        if (!soundFile) return;

        try {
            const audio = new Audio(soundFile);
            audio.volume = volume;
            const playPromise = audio.play();

            // Handle promise to catch errors (important for iOS)
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn('HTML5 Audio play failed:', error);
                });
            }
        } catch (error) {
            console.warn('HTML5 Audio error:', error);
        }
    }
}

// Process any queued sounds
function processSoundQueue() {
    if (!soundsInitialized || soundsQueue.length === 0) return;

    console.log(`Processing ${soundsQueue.length} queued sounds`);

    // Filter out old sounds (older than 3 seconds)
    const freshSounds = soundsQueue.filter(item =>
        (Date.now() - item.timestamp) < 3000
    );

    // Play the most recent sounds (max 3)
    freshSounds.slice(-3).forEach(item => {
        playSound(item.type, item.volume);
    });

    // Clear the queue
    soundsQueue = [];
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

// Play specific sound at the start/end of each round
export function playRoundStartSound() {
    playSound('roundStart');
}

export function playRoundEndSound() {
    playSound('roundEnd');
}

export function playCountdownSound() {
    playSound('countdown');
}

export function playCompleteSound() {
    playSound('complete');
}