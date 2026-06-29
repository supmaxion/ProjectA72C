/**
 * RippleOverlay — képernyő feletti SVG réteg.
 *
 * - ripple({ x, y, text })  kavics-hullám + szöveg animáció együtt
 *
 * Pozíció: x, y értékek 0-100 között (képernyő %-a)
 *
 * Használat:
 *   const overlay = new RippleOverlay();
 *   overlay.ripple({ x: 50, y: 50, text: 'Valami szöveg' });
 */

// Font betöltése egyszer, globálisan
const _fontFace = new FontFace('OverlayFont', 'url(/fonts/font1.ttf)');
_fontFace.load().then(f => {
    document.fonts.add(f);
    console.log('Overlay font betöltve.');
}).catch(e => {
    console.warn('Font betöltés sikertelen:', e);
});

export class RippleOverlay {
    constructor() {
        this._buildDOM();
    }

    _buildDOM() {
        this._wrapper = document.createElement('div');
        Object.assign(this._wrapper.style, {
            position:      'fixed',
            inset:         '0',
            pointerEvents: 'none',
            zIndex:        '9998',
            overflow:      'hidden',
        });

        this._svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        Object.assign(this._svg.style, {
            position: 'absolute',
            inset:    '0',
            width:    '100%',
            height:   '100%',
        });
        this._svg.setAttribute('viewBox', '0 0 100 100');
        this._svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

        this._wrapper.appendChild(this._svg);
        document.body.appendChild(this._wrapper);
    }

    _octagonPoints(cx, cy, r) {
        const sides = 8;
        const points = [];
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2 - Math.PI / 8;
            points.push(
                `${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`
            );
        }
        return points.join(' ');
    }

    _animateRing(cx, cy, delay, startR, endR, duration) {
        return new Promise(resolve => {
            setTimeout(() => {
                const ring = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                ring.setAttribute('fill', 'none');
                ring.setAttribute('stroke', '#c8d8e8');
                ring.setAttribute('stroke-width', '0.4');
                ring.setAttribute('opacity', '0');
                ring.setAttribute('points', this._octagonPoints(cx, cy, startR));
                this._svg.appendChild(ring);

                const start = performance.now();
                const tick = (now) => {
                    const t    = Math.min((now - start) / duration, 1);
                    const ease = 1 - Math.pow(1 - t, 3);
                    const r    = startR + (endR - startR) * ease;

                    ring.setAttribute('points', this._octagonPoints(cx, cy, r));
                    ring.setAttribute('opacity', ((1 - t) * 0.7).toFixed(3));
                    ring.setAttribute('stroke-width', (0.4 - t * 0.25).toFixed(3));

                    if (t < 1) {
                        requestAnimationFrame(tick);
                    } else {
                        this._svg.removeChild(ring);
                        resolve();
                    }
                };
                requestAnimationFrame(tick);
            }, delay);
        });
    }

    /**
     * Szöveg animáció: megjelenik kicsiben → felnő → szétszéled és eltűnik.
     * @param {string} text   megjelenítendő szöveg
     * @param {number} cx     középpont x (0-100)
     * @param {number} cy     középpont y (0-100)
     */
    _animateText(text, cx, cy) {
        return new Promise(resolve => {
            const el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            el.textContent = text;
            el.setAttribute('x', cx);
            el.setAttribute('y', cy);
            el.setAttribute('text-anchor', 'middle');
            el.setAttribute('dominant-baseline', 'middle');
            el.setAttribute('font-family', 'OverlayFont, serif');
            el.setAttribute('fill', '#ddeeff');
            el.setAttribute('opacity', '0');

            // transform-origin a szöveg közepére
            el.setAttribute('transform-origin', `${cx} ${cy}`);

            this._svg.appendChild(el);

            const totalDuration = 3200; // ms, teljes animáció
            const peakAt        = 0.35; // mikor éri el a csúcs opacity-t (35%-nál)
            const startScale    = 0.4;
            const endScale      = 2.2;  // szétszéledés végső méret

            const start = performance.now();
            const tick = (now) => {
                const t = Math.min((now - start) / totalDuration, 1);

                // Skála: lineárisan nő startScale-ről endScale-re
                const scale = startScale + (endScale - startScale) * t;

                // Opacity: gyorsan feljön, majd lassan eltűnik
                let opacity;
                if (t < peakAt) {
                    // Fade in
                    opacity = t / peakAt;
                } else {
                    // Fade out — ease in (gyorsul az eltűnés)
                    const fadeT = (t - peakAt) / (1 - peakAt);
                    opacity = 1 - Math.pow(fadeT, 1.5);
                }

                el.setAttribute('font-size', (4 * scale).toFixed(3));
                el.setAttribute('opacity', Math.max(0, opacity).toFixed(3));

                // Letter spacing növekszik → szétszéled hatás
                const spacing = (scale - startScale) * 0.8;
                el.setAttribute('letter-spacing', spacing.toFixed(3));

                if (t < 1) {
                    requestAnimationFrame(tick);
                } else {
                    this._svg.removeChild(el);
                    resolve();
                }
            };
            requestAnimationFrame(tick);
        });
    }

    /**
     * Kavics-hullám + szöveg együtt.
     * @param {{ x: number, y: number, text: string }} params
     */
    async ripple({ x = 50, y = 50, text = '' } = {}) {
        const waves = [
            { delay: 0,   startR: 3, endR: 9,  duration: 1800 },
            { delay: 300, startR: 3, endR: 11, duration: 2000 },
            { delay: 600, startR: 3, endR: 13, duration: 2200 },
            { delay: 900, startR: 3, endR: 15, duration: 2400 },
        ];

        const animations = waves.map(w =>
            this._animateRing(x, y, w.delay, w.startR, w.endR, w.duration)
        );

        if (text) {
            animations.push(this._animateText(text, x, y));
        }

        await Promise.all(animations);
    }

    dispose() {
        document.body.removeChild(this._wrapper);
    }
}