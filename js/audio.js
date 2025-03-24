/**
 * HeavyHITR - Audio Module
 * Handles audio playback
 * @author danweboptic
 * @lastUpdated 2025-03-24 13:13:24
 */
import { workoutConfig, musicSettings, workoutState, appSettings } from './settings.js';

// Background music using Howler.js
let backgroundMusic = null;
let currentMusicTrack = null;
let audioInitialized = false;

// For iOS compatibility
let soundsInitialized = false;
let soundsQueue = [];
let unlockAttempted = false;

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

// Initialize Audio - directly called when module loads to ensure early setup
(function immediateInit() {
    try {
        // Create an AudioContext to help iOS Safari
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        if (window.AudioContext) {
            const context = new AudioContext();
            console.log('AudioContext created with state:', context.state);

            // Try to resume if suspended
            if (context.state === 'suspended') {
                context.resume().then(() => {
                    console.log('AudioContext resumed successfully');
                }).catch(err => {
                    console.warn('AudioContext resume failed:', err);
                });
            }
        }

        // Set up event listeners for user interaction
        ['touchstart', 'touchend', 'mousedown', 'keydown'].forEach(event => {
            document.addEventListener(event, unlockAudio, { once: false });
        });

        console.log('Audio immediate setup complete');
    } catch (e) {
        console.error('Audio immediate setup failed:', e);
    }
})();

// Initialize Audio
export function initAudio() {
    if (audioInitialized) return true;

    try {
        // Ensure Howler is available
        if (typeof window.Howl !== 'function') {
            console.error('Howler.js not loaded!');
            return false;
        }

        console.log('Initializing audio system...');

        // Set up Howler.js global settings for iOS
        Howler.autoUnlock = true; // Enable auto-unlock for mobile
        Howler.html5PoolSize = 10; // Increase html5 pool size for better reliability

        // Force unlock audio context if suspended
        if (Howler.ctx && Howler.ctx.state === 'suspended') {
            console.log('Resuming Howler audio context on init...');
            Howler.ctx.resume().then(() => {
                console.log('Howler audio context resumed on init');
            }).catch(err => {
                console.warn('Howler context resume failed:', err);
            });
        }

        // Initialize sound effects for iOS
        initSoundEffects();

        // Play a silent sound to unlock audio (HTML5 Audio method)
        const silentSound = new Audio('audio/tap.mp3');
        silentSound.volume = 0.01;
        silentSound.play().then(() => {
            console.log('Silent sound played using HTML5 Audio');
        }).catch(err => {
            console.warn('Expected silent sound play error:', err);
        });

        // Also try with Howler
        const silentHowl = new Howl({
            src: ['audio/tap.mp3'],
            volume: 0.01,
            html5: true,
            onend: function() {
                console.log('Silent Howl sound played successfully');
            },
            onloaderror: function() {
                console.warn('Silent Howl sound load error');
            }
        });

        silentHowl.play();

        audioInitialized = true;
        console.log('Audio system initialized successfully');

        // Setup iOS audio unlocking
        setupiOSAudioUnlock();

        return true;
    } catch (e) {
        console.error('Audio initialization failed:', e);
        return false;
    }
}

// Initialize sound effects for iOS compatibility
function initSoundEffects() {
    console.log('Initializing sound effects...');

    // Preload common sound effects as Howl instances
    Object.entries(soundEffects).forEach(([type, src]) => {
        console.log(`Loading sound: ${type} from ${src}`);

        soundInstances[type] = new Howl({
            src: [src],
            volume: 0.7,
            html5: false, // Use Web Audio API for sound effects
            preload: true,
            onload: () => console.log(`Sound ${type} loaded successfully`),
            onloaderror: (id, err) => console.error(`Sound ${type} loading error:`, err)
        });
    });

    soundsInitialized = true;
    console.log('Sound effects initialized successfully');

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
            document.addEventListener(event, unlockAudio, {once: false});
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
    // Don't attempt too frequently
    if (unlockAttempted && Date.now() - unlockAttempted < 1000) {
        return;
    }

    unlockAttempted = Date.now();
    console.log('Attempting to unlock audio...');

    // Try to play a short sound
    playSound('tap', 0.01);

    // Try to unlock any Web Audio context
    if (window.AudioContext || window.webkitAudioContext) {
        try {
            const tempContext = new (window.AudioContext || window.webkitAudioContext)();
            tempContext.resume().then(() => {
                console.log('AudioContext unlocked on user interaction');
            }).catch(err => {
                console.warn('AudioContext resume failed:', err);
            });
        } catch (e) {
            console.warn('AudioContext creation failed:', e);
        }
    }

    // Also try to unlock directly with Howler
    if (Howler.ctx && Howler.ctx.state === 'suspended') {
        Howler.ctx.resume().then(() => {
            console.log('Howler audio context resumed successfully');

            // Process any sound queue that built up
            processSoundQueue();
        }).catch(err => {
            console.warn('Howler context resume failed:', err);
        });
    }

    // Try to play the unlock element directly
    const unlockElement = document.getElementById('audio-unlock');
    if (unlockElement) {
        unlockElement.play().catch(err =>
            console.log('Expected audio unlock element error:', err)
        );
    }

    // Start background music if enabled and we're in a workout
    if (musicSettings.enabled && workoutState.isRunning && !workoutState.isPaused && !workoutState.isBreak) {
        if (!backgroundMusic || (backgroundMusic && backgroundMusic.state() === 'loaded' && backgroundMusic.playing() === false)) {
            console.log('Attempting to start background music from unlock event');
            startBackgroundMusic();
        }
    }
}

// Start music if enabled
export function startAudio() {
    console.log('Starting audio...');

    // Initialize audio if not already initialized
    if (!audioInitialized) {
        initAudio();
    }

    // Play workout start sound
    playSound('start');

    // Start background music if enabled
    if (musicSettings.enabled) {
        console.log('Music is enabled, starting background music');
        startBackgroundMusic();
    } else {
        console.log('Music is disabled, skipping background music');
    }
}

// Stop all audio
export function stopAudio() {
    console.log('Stopping audio...');

    // Stop background music
    stopBackgroundMusic();
}

// Start background music
function startBackgroundMusic() {
    console.log('Starting background music...');

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

    console.log(`Using music category: ${category}, ${availableTracks.length} tracks available`);

    // Randomly select a track
    const selectedTrack = availableTracks[Math.floor(Math.random() * availableTracks.length)];
    console.log(`Selected music track: ${selectedTrack.title} from ${selectedTrack.src}`);

    // Try to unlock audio context first
    if (Howler.ctx && Howler.ctx.state === 'suspended') {
        console.log('Attempting to resume audio context before playing music');
        Howler.ctx.resume().catch(err => {
            console.warn('Error resuming audio context:', err);
        });
    }

    // Create a new Howl instance for the background music - use HTML5 Audio as fallback
    backgroundMusic = new Howl({
        src: [selectedTrack.src],
        loop: true,
        volume: musicSettings.volume,
        html5: true, // Better for longer files and avoid Web Audio API issues
        format: ['mp3'],
        autoplay: false, // Don't auto-play, we'll handle this manually
        preload: true, // Preload the audio
        onload: function() {
            console.log(`Loaded music track: ${selectedTrack.title}`);

            // Once loaded, try to play
            this.play();
        },
        onplay: function() {
            currentMusicTrack = selectedTrack;
            console.log(`Now playing: ${selectedTrack.title}`);

            // Update music track display
            updateMusicTrackDisplay();
        },
        onloaderror: function(id, err) {
            console.error('Music loading error:', err);

            // Try a fallback approach with HTML5 Audio
            try {
                const audioElement = new Audio(selectedTrack.src);
                audioElement.loop = true;
                audioElement.volume = musicSettings.volume;

                audioElement.oncanplaythrough = () => {
                    console.log('Music loaded via HTML5 Audio, attempting to play');
                    audioElement.play().catch(err => {
                        console.error('HTML5 Audio play error:', err);
                    });
                };

                audioElement.onplay = () => {
                    currentMusicTrack = selectedTrack;
                    console.log(`Now playing via HTML5 Audio: ${selectedTrack.title}`);
                    updateMusicTrackDisplay();
                };

                audioElement.load();
            } catch (e) {
                console.error('HTML5 Audio fallback failed:', e);
            }
        },
        onplayerror: function(id, err) {
            console.error('Music play error:', err, 'for ID:', id);
        }
    });

    // Try playing
    console.log('Attempting to play background music...');
    const playId = backgroundMusic.play();
    console.log('Play ID:', playId);
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
        console.log('Stopping background music');
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
    console.log(`Music ${musicSettings.enabled ? 'enabled' : 'disabled'}`);

    if (musicSettings.enabled && workoutState.isRunning && !workoutState.isPaused && !workoutState.isBreak) {
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

    // Save music settings to localStorage
    saveToLocalStorage('musicSettings', musicSettings);

    // Play a UI sound for iOS compatibility
    playSound('tap');

    return musicSettings.enabled;
}

// Set music volume
export function setMusicVolume(volume) {
    musicSettings.volume = volume;
    console.log(`Setting music volume to ${volume}`);

    if (backgroundMusic) {
        backgroundMusic.volume(volume);
    }

    // Save music settings to localStorage
    saveToLocalStorage('musicSettings', musicSettings);
}

// Save settings to localStorage
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error(`Error saving ${key} to localStorage:`, e);
    }
}

// Get current music info
export function getCurrentMusicInfo() {
    const isPlaying = !!backgroundMusic &&
                     backgroundMusic.state() === 'loaded' &&
                     backgroundMusic.playing();

    return {
        playing: isPlaying,
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
        console.log(`Sound ${type} queued (not initialized yet)`);
        soundsQueue.push({ type, volume, timestamp: Date.now() });
        return;
    }

    // Get the sound instance
    const sound = soundInstances[type];

    if (sound) {
        // Try to unlock audio context first if suspended
        if (Howler.ctx && Howler.ctx.state === 'suspended') {
            Howler.ctx.resume().then(() => {
                console.log('Audio context resumed before playing sound');
            }).catch(err => {
                console.warn('Audio context resume failed:', err);
            });
        }

        // Set volume and play
        sound.volume(volume);
        const id = sound.play();
        console.log(`Playing sound: ${type} with ID: ${id}`);
    } else {
        // Fallback to HTML5 Audio if the sound wasn't preloaded
        const soundFile = soundEffects[type];
        if (!soundFile) return;

        console.log(`Using HTML5 Audio fallback for ${type}`);
        try {
            const audio = new Audio(soundFile);
            audio.volume = volume;
            const playPromise = audio.play();

            // Handle promise to catch errors (important for iOS)
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log(`HTML5 Audio playing ${type}`);
                }).catch(error => {
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
    playSound('roundStart', 0.8);
}

export function playRoundEndSound() {
    playSound('roundEnd', 0.8);
}

export function playCountdownSound() {
    playSound('countdown', 0.6);
}

export function playCompleteSound() {
    playSound('complete', 0.8);
}