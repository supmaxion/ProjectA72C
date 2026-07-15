/**
 * SfxManager — procedurálisan generált rövid hangeffektek Web Audio API-val,
 * nincs szükség hangfájlra. Első hívás előtt (böngésző-korlátozás miatt)
 * a hangkontextus csak felhasználói interakció után indul el ténylegesen.
 */
export class SfxManager {
    constructor() {
        this._ctx = null;
        this._master = null;
    }

    _ensureContext() {
        if (!this._ctx) {
            this._ctx = new (window.AudioContext || window.webkitAudioContext)();

            // Master kompresszor — enged hangosabb/mélyebb hangokat torzítás nélkül
            this._master = this._ctx.createDynamicsCompressor();
            this._master.threshold.value = -18;
            this._master.knee.value = 12;
            this._master.ratio.value = 6;
            this._master.attack.value = 0.003;
            this._master.release.value = 0.25;
            this._master.connect(this._ctx.destination);
        }
        if (this._ctx.state === 'suspended') {
            this._ctx.resume();
        }
        return this._ctx;
    }

    /** Mély, súlyos "becsapódás" hang — aszteroida-ütközéshez. */
    hit() {
        const ctx = this._ensureContext();
        const now = ctx.currentTime;
        const out = this._master;

        // --- SUB layer: mély, lassan lecsengő "boom" (a hang "teste") ---
        const sub = ctx.createOscillator();
        const subGain = ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(75, now);
        sub.frequency.exponentialRampToValueAtTime(28, now + 0.35);
        subGain.gain.setValueAtTime(0.0001, now);
        subGain.gain.exponentialRampToValueAtTime(1.1, now + 0.012); // gyors attack a súlyért
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        sub.connect(subGain).connect(out);
        sub.start(now);
        sub.stop(now + 0.45);

        // --- BODY layer: alacsony fűrészhullám, ad egy kis "growl"-t/torzítást ---
        const body = ctx.createOscillator();
        const bodyGain = ctx.createGain();
        const bodyFilter = ctx.createBiquadFilter();
        body.type = 'sawtooth';
        body.frequency.setValueAtTime(55, now);
        body.frequency.exponentialRampToValueAtTime(22, now + 0.3);
        bodyFilter.type = 'lowpass';
        bodyFilter.frequency.value = 220;
        bodyGain.gain.setValueAtTime(0.0001, now);
        bodyGain.gain.exponentialRampToValueAtTime(0.5, now + 0.01);
        bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        body.connect(bodyFilter).connect(bodyGain).connect(out);
        body.start(now);
        body.stop(now + 0.3);

        // --- NOISE layer: tompa, mélyre szűrt "thud" a becsapódás zörejéhez ---
        const bufferSize = ctx.sampleRate * 0.25;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(500, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(120, now + 0.2);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.8, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        noise.connect(noiseFilter).connect(noiseGain).connect(out);
        noise.start(now);
        noise.stop(now + 0.25);
    }

    dispose() {
        this._ctx?.close();
    }
}
