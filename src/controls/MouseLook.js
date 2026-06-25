/**
 * Handles pointer-lock capture and raw mouse-delta accumulation.
 *
 * This module knows nothing about the ship's rotation math -- it only
 * produces yaw/pitch *input* values each frame. The Ship consumes
 * this input and decides how to turn it into rotation. Keeping these
 * concerns separate means the input scheme (mouse, gamepad, touch...)
 * can change later without touching the ship's rotation logic at all.
 */
export class MouseLook {
    constructor({ sensitivity = 0.0022, clickToStartEl, domElement } = {}) {
        this.sensitivity = sensitivity;
        this.isLocked = false;

        // Accumulated since the last time the consumer called consume().
        this._yawInput = 0;
        this._pitchInput = 0;

        this._scrollDelta = 0;

        this._clickToStartEl = clickToStartEl;
        this._domElement = domElement || document.body;

        this._onClickToStart = this._onClickToStart.bind(this);
        this._onPointerLockChange = this._onPointerLockChange.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);
        
        //wheel event listener for speed control
        this._onWheel = this._onWheel.bind(this);
        document.addEventListener('wheel', this._onWheel, { passive: true });

        if (this._clickToStartEl) {
            this._clickToStartEl.addEventListener('click', this._onClickToStart);
        }
        document.addEventListener('pointerlockchange', this._onPointerLockChange);
        document.addEventListener('mousemove', this._onMouseMove);
    }

    _onClickToStart() {
        this._domElement.requestPointerLock();
    }

    _onPointerLockChange() {
        this.isLocked = document.pointerLockElement === this._domElement;

        if (this._clickToStartEl) {
            this._clickToStartEl.style.display = this.isLocked ? 'none' : 'block';
        }
    }

    _onMouseMove(event) {
        if (!this.isLocked) return;

        const deltaX = event.movementX || 0;
        const deltaY = event.movementY || 0;

        this._yawInput -= deltaX * this.sensitivity;
        this._pitchInput -= deltaY * this.sensitivity;
    }

    //wheel event listener for speed control
    _onWheel(event) {
        if (!this.isLocked) return;
        this._scrollDelta += event.deltaY;
    }

    /**
     * Returns the accumulated { yaw, pitch } input since the last call,
     * and resets the accumulators. Call this once per frame.
     */
    consume() {

        const result = { yaw: this._yawInput, pitch: this._pitchInput, scroll: this._scrollDelta };
        this._yawInput = 0;
        this._pitchInput = 0;
        this._scrollDelta = 0;

        return result;
    }

    dispose() {
        if (this._clickToStartEl) {
            this._clickToStartEl.removeEventListener('click', this._onClickToStart);
        }
        document.removeEventListener('pointerlockchange', this._onPointerLockChange);
        document.removeEventListener('mousemove', this._onMouseMove);
        document.removeEventListener('wheel', this._onWheel);
    }
}
