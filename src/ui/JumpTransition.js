


export class JumpTransition {
    constructor() {
        this._visible = false;
        this._time = 0;
        this._rafId = null;

        this._buildDom();
    }

    _buildDom() {
        this._container = document.createElement('div');
        Object.assign(this._container.style, {
            position: 'fixed',
            inset: '0',
            pointerEvents: 'none',
            zIndex: '200',
            opacity: '0',
            transition: 'opacity 0.3s ease',
            overflow: 'hidden',
            background: 'radial-gradient(ellipse at center, rgba(20,60,90,0.35) 0%, rgba(0,10,20,0.75) 100%)',
        });

        // Scanline réteg
        this._scanlines = document.createElement('div');
        Object.assign(this._scanlines.style, {
            position: 'absolute',
            inset: '0',
            background: `repeating-linear-gradient(
                0deg,
                rgba(120,220,255,0.08) 0px,
                rgba(120,220,255,0.08) 1px,
                transparent 2px,
                transparent 4px
            )`,
            mixBlendMode: 'screen',
            pointerEvents: 'none',
        });
        this._container.appendChild(this._scanlines);

        // Halvány kék "üveg" keret-glow
        this._glowRing = document.createElement('div');
        Object.assign(this._glowRing.style, {
            position: 'absolute',
            inset: '0',
            boxShadow: 'inset 0 0 80px rgba(100,200,255,0.5)',
            pointerEvents: 'none',
        });
        this._container.appendChild(this._glowRing);

        // Opcionális szöveg középen (pl. "JUMPING..." vagy később a rendszerválasztó helye)
        this._label = document.createElement('div');
        Object.assign(this._label.style, {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'rgba(150,220,255,0.9)',
            fontFamily: 'monospace',
            fontSize: '18px',
            letterSpacing: '4px',
            textShadow: '0 0 8px rgba(100,200,255,0.8)',
        });
        this._label.textContent = 'JUMPING';
        this._container.appendChild(this._label);

        document.body.appendChild(this._container);
    }

    show(text = 'JUMPING') {
        this._visible = true;
        this._label.textContent = text;
        this._container.style.opacity = '1';
        if (!this._rafId) this._loop();
    }

    hide() {
        this._visible = false;
        this._container.style.opacity = '0';
    }

    _loop() {
        this._rafId = requestAnimationFrame(() => this._loop());

        if (!this._visible) {
            this._rafId = null;
            return;
        }

        this._time += 0.016;

        const flicker = 0.85 + Math.random() * 0.15;
        this._container.style.filter = `brightness(${flicker})`;
    }

    dispose() {
        cancelAnimationFrame(this._rafId);
        document.body.removeChild(this._container);
    }
}
