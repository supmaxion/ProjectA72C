import { MUSIC } from '../config.js';

/**
 * Egyszerre egy HTMLAudioElement szól (streamelt lejátszás — nincs teljes
 * PCM-dekódolás memóriában). A track-ek lusta módon töltődnek: az <audio>
 * elem és a src csak az első play() híváskor jön létre.
 *
 * Minden trackId-hez külön fade-állapotot (generation számlálóval) tartunk,
 * hogy egy gyors ki-be lépés esetén egy elavult fade-out "onDone" (pause)
 * ne tudja lenémítani egy közben újraindult fade-int.
 */
export class MusicManager {
    constructor() {
        this._elements = new Map();  // trackId -> HTMLAudioElement (lusta cache)
        this._fadeState = new Map(); // trackId -> { raf, generation }
        this._activeId = null;
    }

    _getOrCreate(trackId) {
        let audio = this._elements.get(trackId);
        if (!audio) {
            const url = MUSIC.tracks[trackId];
            if (!url) {
                console.warn(`MusicManager: ismeretlen track id: "${trackId}"`);
                return null;
            }
            audio = new Audio();
            audio.preload = 'none';
            audio.src = url; // itt indul a lusta betöltés
            audio.loop = true;
            audio.volume = 0;
            this._elements.set(trackId, audio);
        }
        return audio;
    }

    // Leállítja a track futó fade-jét, és "elavulttá" teszi (generation++),
    // hogy a korábbi fade step/onDone hívásai felismerjék magukat réginek és no-op-ok legyenek.
    _cancelFade(trackId) {
        const state = this._fadeState.get(trackId);
        if (state?.raf != null) cancelAnimationFrame(state.raf);
        const generation = (state?.generation ?? 0) + 1;
        this._fadeState.set(trackId, { raf: null, generation });
        return generation;
    }

    _fade(trackId, audio, from, to, duration, onDone) {
        const generation = this._cancelFade(trackId);
        const start = performance.now();
        const step = (now) => {
            const state = this._fadeState.get(trackId);
            if (!state || state.generation !== generation) return; // elavult — kilépünk

            const t = Math.min((now - start) / (duration * 1000), 1);
			const volume = from + (to - from) * t;
			audio.volume = Math.max(0, Math.min(1, volume));
            if (t < 1) {
                const raf = requestAnimationFrame(step);
                this._fadeState.set(trackId, { raf, generation });
            } else {
                this._fadeState.set(trackId, { raf: null, generation });
                onDone?.();
            }
        };
        const raf = requestAnimationFrame(step);
        this._fadeState.set(trackId, { raf, generation });
    }

    play(trackId) {
        if (this._activeId === trackId) return;

        const prevId = this._activeId;
        this._activeId = trackId;

        if (prevId != null && prevId !== trackId) {
            const prevAudio = this._elements.get(prevId);
            if (prevAudio) {
                this._fade(prevId, prevAudio, prevAudio.volume, 0, MUSIC.fadeOutDuration, () => {
                    prevAudio.pause();
                    prevAudio.currentTime = 0;
                });
            }
        }

        const audio = this._getOrCreate(trackId);
        if (!audio) return;

        this._cancelFade(trackId); // egy esetleg még futó kilépő fade-out eltüntetése

        // Ha a track még ténylegesen szól (gyors visszalépés a zónába, mielőtt
        // a kilépő fade-out végzett volna), a JELENLEGI hangerőről indulunk
        // vissza felfelé, és NEM állítjuk vissza a track elejére.
        if (!audio.paused) {
            this._fade(trackId, audio, audio.volume, MUSIC.targetVolume, MUSIC.fadeInDuration);
            return;
        }

        audio.volume = 0;
        audio.currentTime = 0;
        audio.play().then(() => {
            this._fade(trackId, audio, 0, MUSIC.targetVolume, MUSIC.fadeInDuration);
        }).catch(() => {
            // autoplay-korlátozás — az első user-interakció után már engedélyezett
        });
    }

    stop() {
        if (this._activeId == null) return;
        const trackId = this._activeId;
        const audio = this._elements.get(trackId);
        this._activeId = null;
        if (!audio) return;

        this._fade(trackId, audio, audio.volume, 0, MUSIC.fadeOutDuration, () => {
            audio.pause();
            audio.currentTime = 0;
        });
    }

    get activeTrackId() {
        return this._activeId;
    }
}
