import { RippleOverlay } from './RippleOverlay.js';

/**
 * Akció-vezérelt tutorial üzenetkezelő.
 * Minden szabály: { id, action, delay, x, y, text }
 *   - action: egy egyedi azonosító, amit markDone(action)-nel jelölünk készre
 *   - delay:  ennyi másodperc elteltével jelenjen meg, HA addig nem történt meg az action
 * Ha az action közben megtörténik, a szabály véglegesen törlődik (sosem jelenik meg többé).
 */
export class MessageManager {
    constructor() {
        this._ripple = new RippleOverlay();
        this._done = new Set();
        this._startTime = performance.now();
        this._intervalId = null;

        this._rules = [
            { action: 'click',    delay: 6,  x: 70, y: 30, text: 'I should click' },
            { action: 'esc',      delay: 16, x: 50, y: 30, text: 'I can use "esc"' },
            { action: 'wheel',    delay: 24, x: 50, y: 40, text: 'I could scroll to change speed' },
            { action: 'tabCycle', delay: 32, x: 50, y: 60, text: 'I could tab through the HUD... space toggles them' },
            { action: 'roll',     delay: 52, x: 50, y: 60, text: 'Maybe A and D let me roll' },
            { action: 'checkAsteroids', delay: 82, x: 50, y: 60, text: 'I feel like checking out that asteroid belt' },
        ];
    }

    start() {
        this._intervalId = setInterval(() => this._tick(), 500);
    }

    stop() {
        clearInterval(this._intervalId);
    }

    
    /**
     * Jelöld meg, hogy a játékos végrehajtott egy adott akciót.
     * Ettől kezdve az ehhez az action-höz tartozó még meg nem jelent
     * üzenetek véglegesen ki vannak zárva.
     */
    markDone(action) {
        this._done.add(action);
    }

/**
     * Azoknak a szabályoknak az action-jeit adja vissza, amik már
     * megjelentek a játékosnak (mentéshez).
     */
    getShownState() {
        return this._rules.filter(r => r._shown).map(r => r.action);
    }

    /**
     * Betöltéskor visszaállítja, mely üzenetek jelentek már meg korábban —
     * ezeket többé nem mutatja meg újra.
     */
    restoreShownState(actions = []) {
        const shown = new Set(actions);
        for (const rule of this._rules) {
            if (shown.has(rule.action)) rule._shown = true;
        }
    }
    
    _tick() {
        const elapsed = (performance.now() - this._startTime) / 1000;
        for (const rule of this._rules) {
            if (rule._shown) continue;
            if (this._done.has(rule.action)) continue;
            if (elapsed < rule.delay) continue;
            rule._shown = true;
            this._ripple.ripple({ x: rule.x, y: rule.y, text: rule.text });
        }
    }
}
