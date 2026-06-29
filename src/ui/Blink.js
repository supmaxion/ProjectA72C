/**
 * Blink effect — két ívelt szemhéj fentről és lentről záródik össze.
 * hívás: blink.play();
 * const blink = new Blink({ delay: 500 }); 
 */
export class Blink {
    constructor({
        delay    = 5000,
        autoPlay = true,
    } = {}) {
        this._playing = false;
        this._buildDOM();
        if (autoPlay) {
            setTimeout(() => this.play(), delay);
        }
    }

    _buildDOM() {
        this._wrapper = document.createElement('div');
        Object.assign(this._wrapper.style, {
            position:      'fixed',
            inset:         '0',
            pointerEvents: 'none',
            zIndex:        '9999',
            overflow:      'hidden',
        });

        // SVG defs: gradientek
        this._svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        Object.assign(this._svg.style, {
            position: 'absolute',
            inset:    '0',
            width:    '100%',
            height:   '100%',
        });
        this._svg.setAttribute('preserveAspectRatio', 'none');
        this._svg.setAttribute('viewBox', '0 0 100 100');

        // Gradiens definíciók
        this._svg.innerHTML = `
            <defs>
                <linearGradient id="blinkGradTop" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stop-color="#000000"/>
                    <stop offset="60%"  stop-color="#0a0807"/>
                    <stop offset="100%" stop-color="#0c0705" stop-opacity="0.85"/>
                </linearGradient>
                <linearGradient id="blinkGradBot" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%"   stop-color="#000000"/>
                    <stop offset="60%"  stop-color="#0a0807"/>
                    <stop offset="100%" stop-color="#0c0705" stop-opacity="0.85"/>
                </linearGradient>
                <filter id="blinkBlur">
                    <feGaussianBlur stdDeviation="0.8"/>
                </filter>
            </defs>
        `;

        this._top = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this._top.setAttribute('fill', 'url(#blinkGradTop)');
        this._top.setAttribute('filter', 'url(#blinkBlur)');

        this._bot = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this._bot.setAttribute('fill', 'url(#blinkGradBot)');
        this._bot.setAttribute('filter', 'url(#blinkBlur)');

        this._svg.appendChild(this._top);
        this._svg.appendChild(this._bot);
        this._wrapper.appendChild(this._svg);
        document.body.appendChild(this._wrapper);

        this._setProgress(0);
    }

    _setProgress(p) {
        const topY = -25 + p * 75;
        const botY = 125 - p * 75;

        this._top.setAttribute('d',
            `M -10 ${topY} Q 50 ${topY + 8} 110 ${topY} L 110 -30 L -10 -30 Z`
        );
        this._bot.setAttribute('d',
            `M -10 ${botY} Q 50 ${botY - 8} 110 ${botY} L 110 130 L -10 130 Z`
        );
    }

    _animate(from, to, duration) {
        return new Promise(resolve => {
            const start = performance.now();
            const tick = (now) => {
                const t = Math.min((now - start) / duration, 1);
                const ease = t < 0.5
                    ? 4 * t * t * t
                    : 1 - Math.pow(-2 * t + 2, 3) / 2;
                this._setProgress(from + (to - from) * ease);
                if (t < 1) requestAnimationFrame(tick);
                else resolve();
            };
            requestAnimationFrame(tick);
        });
    }

    _wait(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    async _oneBlink(closeSpeed, openSpeed) {
        await this._animate(0, 1, closeSpeed);
        await this._animate(1, 0, openSpeed);
    }

    async play() {
        if (this._playing) return;
        this._playing = true;

        await this._oneBlink(700, 500);
        await this._wait(180);
        await this._oneBlink(180, 140);
        await this._wait(120);
        await this._oneBlink(180, 140);

        this._playing = false;
    }

    dispose() {
        document.body.removeChild(this._wrapper);
    }
}