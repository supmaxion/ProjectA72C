/**
 * HitFlash — pillanatnyi piros vinyetta-felvillanás találatkor.
 * hívás: hitFlash.flash();
 */
export class HitFlash {
    constructor() {
        this._buildDOM();
    }

    _buildDOM() {
        this._el = document.createElement('div');
        Object.assign(this._el.style, {
            position:      'fixed',
            inset:         '0',
            pointerEvents: 'none',
            zIndex:        '9998',
            background:    'radial-gradient(circle, rgba(255,40,40,0) 40%, rgba(255,20,20,0.55) 100%)',
            opacity:       '0',
        });
        document.body.appendChild(this._el);
    }

    flash() {
        this._el.style.transition = 'opacity 60ms ease-out';
        this._el.style.opacity = '1';
        setTimeout(() => {
            this._el.style.transition = 'opacity 350ms ease-in';
            this._el.style.opacity = '0';
        }, 60);
    }

    dispose() {
        document.body.removeChild(this._el);
    }
}
