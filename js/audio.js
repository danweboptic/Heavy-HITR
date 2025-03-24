/**
 * HeavyHITR - Audio Module
 * Handles sound effects and background music
 * @author danweboptic
 */

// Using Howler.js for audio handling (referenced in index.html)
// https://github.com/goldfire/howler.js

// Sound effect cache
const soundCache = new Map();
let currentMusic = null;

// Audio tracks configuration
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
    start: 'audio/workout_start.mp3',
    roundStart: 'audio/round_start.mp3',
    roundEnd: 'audio/round_end.mp3',
    countdown: 'audio/countdown_beep.mp3',
    pause: 'audio/pause.mp3',
    resume: 'audio/resume.mp3',
    complete: 'audio/workout_complete.mp3',
    tap: 'audio/tap.mp3' // New small sound for UI interactions
};

/**
 * Play sound effect
 * @param {string} type - The type of sound effect to play
 */
export function playSound(type) {
    // Check if sound effect exists
    if (!soundEffects[type]) {
        console.warn(`Sound effect ${type} not found`);
        return;
    }

    try {
        // Check if the sound is already cached
        if (!soundCache.has(type)) {
            // Create and cache the sound
            const sound = new Howl({
                src: [soundEffects[type]],
                html5: true,
                preload: true,
                volume: 0.5
            });
            soundCache.set(type, sound);
        }

        // Play the sound
        const sound = soundCache.get(type);
        sound.play();
    } catch (error) {
        console.error('Error playing sound:', error);
    }
}

/**
 * Play countdown sound (separate function for specific timing requirements)
 */
export function playCountdownSound() {
    playSound('countdown');
}

/**
 * Start background music
 * @param {string} category - The music category to play (energetic, relaxed, intense)
 * @param {number} volume - The volume level (0-1)
 * @returns {Promise<Object>} - Promise resolving to the music player
 */
export function startMusic(category = 'energetic', volume = 0.5) {
    return new Promise((resolve, reject) => {
        try {
            // Stop any currently playing music
            if (currentMusic) {
                currentMusic.stop();
            }

            // Get tracks for the selected category
            const tracks = musicTracks[category] || musicTracks.energetic;

            // Pick a random track
            const track = tracks[Math.floor(Math.random() * tracks.length)];

            // Create new Howl for music
            currentMusic = new Howl({
                src: [track.src],
                html5: true,
                volume: volume,
                loop: true,
                onplay: () => {
                    console.log(`Now playing: ${track.title}`);
                },
                onloaderror: (id, error) => {
                    console.error(`Error loading music: ${error}`);
                    reject(error);
                },
                onplayerror: (id, error) => {
                    console.error(`Error playing music: ${error}`);

                    // Try to recover by unlocking audio
                    if (Howler.ctx && Howler.ctx.state === 'suspended') {
                        Howler.ctx.resume().then(() => {
                            currentMusic.play();
                        });
                    }
                }
            });

            // Start playing and resolve promise
            currentMusic.play();

            // Add useful methods to the player
            const player = {
                volume: (vol) => {
                    if (currentMusic && typeof vol === 'number') {
                        currentMusic.volume(vol);
                    }
                    return player;
                },
                getCurrentTrackName: () => track.title,
                getTrack: () => track,
                pause: () => {
                    if (currentMusic) {
                        currentMusic.pause();
                    }
                    return player;
                },
                resume: () => {
                    if (currentMusic) {
                        currentMusic.play();
                    }
                    return player;
                }
            };

            resolve(player);
        } catch (error) {
            console.error('Error starting music:', error);
            reject(error);
        }
    });
}

/**
 * Stop background music
 */
export function stopMusic() {
    if (currentMusic) {
        currentMusic.stop();
        currentMusic = null;
    }
}

/**
 * Pause background music
 */
export function pauseMusic() {
    if (currentMusic) {
        currentMusic.pause();
    }
}

/**
 * Resume background music
 */
export function resumeMusic() {
    if (currentMusic) {
        currentMusic.play();
    }
}

/**
 * Play UI tap sound for better feedback
 */
export function playTapSound() {
    playSound('tap');
}

/**
 * Preload sound effects for faster playback
 */
export function preloadSounds() {
    try {
        // Preload all sound effects
        Object.entries(soundEffects).forEach(([type, path]) => {
            if (!soundCache.has(type)) {
                const sound = new Howl({
                    src: [path],
                    html5: true,
                    preload: true
                });
                soundCache.set(type, sound);
            }
        });
    } catch (error) {
        console.error('Error preloading sounds:', error);
    }
}

// Initialize when module is loaded
preloadSounds();

export default {
    playSound,
    playCountdownSound,
    startMusic,
    stopMusic,
    pauseMusic,
    resumeMusic,
    playTapSound
};