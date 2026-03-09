// ─── Sound Manager (Web Audio API based) ──────────────────────────
// No external sound files needed - all sounds are synthesized

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

let masterVolume = 0.5;
let isMuted = false;
let bgmAudio: HTMLAudioElement | null = null;

function getVolume(): number {
    return isMuted ? 0 : masterVolume;
}

// ─── Sound Synthesis Functions ─────────────────────────────────────

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume * getVolume(), ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
}

function playNoise(duration: number, volume = 0.2) {
    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    source.buffer = buffer;
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    filter.Q.setValueAtTime(1, ctx.currentTime);

    gain.gain.setValueAtTime(volume * getVolume(), ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(ctx.currentTime);
}

// ─── Sound Effects ─────────────────────────────────────────────────

export const SoundManager = {
    // Click on piece - short bright tone
    playSelect() {
        playTone(880, 0.12, 'sine', 0.25);
        setTimeout(() => playTone(1320, 0.08, 'sine', 0.15), 50);
    },

    // Move piece - whoosh
    playMove() {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2 * getVolume(), ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);

        playNoise(0.12, 0.1);
    },

    // Capture piece - impact
    playCapture() {
        // Low impact thud
        playTone(120, 0.3, 'sine', 0.4);
        playTone(80, 0.4, 'triangle', 0.3);
        // Dramatic noise
        setTimeout(() => playNoise(0.25, 0.3), 50);
        // High sparkle
        setTimeout(() => {
            playTone(1200, 0.15, 'sine', 0.15);
            playTone(1600, 0.1, 'sine', 0.1);
        }, 100);
    },

    // Win - fanfare
    playWin() {
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            setTimeout(() => playTone(freq, 0.4, 'triangle', 0.3), i * 200);
        });
        // Final chord
        setTimeout(() => {
            playTone(523, 0.8, 'sine', 0.2);
            playTone(659, 0.8, 'sine', 0.15);
            playTone(784, 0.8, 'sine', 0.15);
            playTone(1047, 0.8, 'sine', 0.2);
        }, 800);
    },

    // Invalid move - buzzer
    playInvalid() {
        playTone(200, 0.2, 'square', 0.15);
        setTimeout(() => playTone(150, 0.2, 'square', 0.12), 100);
    },

    // Game start - ascending tones
    playGameStart() {
        const notes = [330, 440, 554, 660]; // E4, A4, C#5, E5
        notes.forEach((freq, i) => {
            setTimeout(() => playTone(freq, 0.25, 'triangle', 0.25), i * 120);
        });
    },

    // Turn change - subtle notification
    playTurnChange() {
        playTone(660, 0.1, 'sine', 0.12);
        setTimeout(() => playTone(880, 0.1, 'sine', 0.1), 80);
    },

    // ─── Background Music ──────────────────────────────────────────
    playBGM() {
        if (!bgmAudio) {
            bgmAudio = new Audio('/sounds/bgm.mp3');
            bgmAudio.loop = true;
            bgmAudio.volume = masterVolume * 0.4; // subtle background sound
        }
        bgmAudio.muted = isMuted;
        bgmAudio.play().catch((e) => console.warn('BGM autoplay prevented by browser', e));
    },

    stopBGM() {
        if (bgmAudio) {
            bgmAudio.pause();
            bgmAudio.currentTime = 0;
        }
    },

    // ─── Controls ──────────────────────────────────────────────────
    setVolume(vol: number) {
        masterVolume = Math.max(0, Math.min(1, vol));
        if (bgmAudio) bgmAudio.volume = masterVolume * 0.4;
    },

    getVolume(): number {
        return masterVolume;
    },

    setMuted(muted: boolean) {
        isMuted = muted;
        if (bgmAudio) bgmAudio.muted = muted;
    },

    isMuted(): boolean {
        return isMuted;
    },

    toggleMute(): boolean {
        isMuted = !isMuted;
        if (bgmAudio) bgmAudio.muted = isMuted;
        return isMuted;
    },

    // Initialize audio context (must be called from user interaction)
    init() {
        getAudioContext();
    },
};
