/**
 * HUD — pilótafülke keret SVG overlay.
 *
 * 8 szögletű "játékablak" középen, egyenes szögletű külső kerettel
 * (mint egy TV-bezel). Reszponzív: a viewBox az ablak tényleges
 * méretarányát követi.
 *
 * Boxok perspektíva-dőlése a középponttól való vízszintes
 * távolsággal arányos — minél kijjebb van egy box, annál jobban
 * dől a képernyő közepe felé (mint egy "/" a jobb oldalon,
 * "\" a bal oldalon). A 3 középső boxnak nincs dőlése.
 *
 * Tab navigációhoz előkészítve: setActiveBox(id) kiemeli a megadott
 * boxot, cycleActiveBox(dir) körkörösen lépked rajtuk.
 *
 * Használat:
 *   const hud = new Hud();
 *   hud.updateBox('tl-1', { label: 'SPEED', value: '0.4' });
 *   hud.setActiveBox('tc-2');
 */
export class Hud {
    constructor() {
        this._activeId = null;
        this._boxOrder = [
            'tl-1', 'tl-2', 'tl-3', 'tc-1', 'tc-2', 'tc-3', 'tr-1', 'tr-2', 'tr-3',
            'br-3', 'br-2', 'br-1', 'bc-3', 'bc-2', 'bc-1', 'bl-3', 'bl-2', 'bl-1',
        ];

        this._buildDOM();
        this._updateViewBox();
        this._buildSVG();

        window.addEventListener('resize', () => {
            this._updateViewBox();
            this._svg.innerHTML = '';
            this._buildSVG();
        });

        this.setActiveBox('tc-1');
    }

    _buildDOM() {
        this._wrapper = document.createElement('div');
        Object.assign(this._wrapper.style, {
            position:      'fixed',
            inset:         '0',
            pointerEvents: 'none',
            zIndex:        '100',
            overflow:      'hidden',
        });

        this._svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        Object.assign(this._svg.style, {
            position: 'absolute',
            inset:    '0',
            width:    '100%',
            height:   '100%',
        });
        this._svg.setAttribute('preserveAspectRatio', 'none');

        this._wrapper.appendChild(this._svg);
        document.body.appendChild(this._wrapper);
    }

    _updateViewBox() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const vbH = 600;
        const vbW = (w / h) * vbH;
        this._svg.setAttribute('viewBox', `0 0 ${vbW} ${vbH}`);
        this._vbW = vbW;
        this._vbH = vbH;
    }

    _buildSVG() {
        const W = this._vbW;
        const H = this._vbH;

        const T = 34;  // top/bottom keret vastagság
        const S = 22;  // oldal keret vastagság
        const CI = 50; // belső (játékablak) 8 szögű sarokvágás

        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `
            <linearGradient id="hudFrameGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stop-color="#1a2030" stop-opacity="0.92"/>
                <stop offset="100%" stop-color="#0a0f1a" stop-opacity="0.96"/>
            </linearGradient>
            <linearGradient id="hudBoxGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stop-color="#1e2a3a" stop-opacity="0.85"/>
                <stop offset="100%" stop-color="#0d1520" stop-opacity="0.90"/>
            </linearGradient>
            <linearGradient id="hudBoxGradActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stop-color="#2a5a7a" stop-opacity="0.95"/>
                <stop offset="100%" stop-color="#143048" stop-opacity="0.95"/>
            </linearGradient>
            <filter id="hudGlow">
                <feGaussianBlur stdDeviation="1.2" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="hudGlowStrong">
                <feGaussianBlur stdDeviation="2.2" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
        `;
        this._svg.appendChild(defs);

        // ─── KERET: egyenes szögletű külső, 8 szögletű belső "játékablak" ──
        const outerPath = `M 0 0 L ${W} 0 L ${W} ${H} L 0 ${H} Z`;

        const innerPath = `
            M ${S + CI} ${T} L ${W - S - CI} ${T}
            L ${W - S} ${T + CI} L ${W - S} ${H - T - CI}
            L ${W - S - CI} ${H - T} L ${S + CI} ${H - T}
            L ${S} ${H - T - CI} L ${S} ${T + CI} Z
        `;

        const frame = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        frame.setAttribute('d', outerPath + ' ' + innerPath);
        frame.setAttribute('fill', 'url(#hudFrameGrad)');
        frame.setAttribute('fill-rule', 'evenodd');
        this._svg.appendChild(frame);

        const innerEdge = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        innerEdge.setAttribute('d', innerPath);
        innerEdge.setAttribute('fill', 'none');
        innerEdge.setAttribute('stroke', '#3a6a9a');
        innerEdge.setAttribute('stroke-width', '1.2');
        innerEdge.setAttribute('opacity', '0.8');
        innerEdge.setAttribute('filter', 'url(#hudGlow)');
        this._svg.appendChild(innerEdge);

        // referencia a nagy játékablakhoz (hologram stb. ehhez pozicionálható)
        this._gameWindowEl = innerEdge;
        this._gameWindowMetrics = { W, H, T, S, CI };

        // ─── BOXOK ────────────────────────────────────────────────────────
        this._boxes = {};
        this._buildTopRow(W, T, S, CI);
        this._buildBottomRow(W, H, T, S, CI);
        this._buildCornerAccents(W, H, S, T, CI);

        // Ha volt aktív box, állítsuk vissza kiemelését újraépítés után
        if (this._activeId) this._applyActiveStyle(this._activeId);
    }

    /**
     * Perspektíva-dőlés mértéke a box középpontjának a képernyő
     * vízszintes középvonalától mért távolsága alapján.
     * Jobb oldalon pozitív (a doboz teteje jobbra dől → "/" karakter
     * iránya), bal oldalon negatív (tükrözött, "\" irány), 0 középen.
     * @param {number} boxCenterX
     * @param {number} W  teljes szélesség
     */
    _skewForX(boxCenterX, W) {
        const center = W / 2;
        const normalized = (boxCenterX - center) / center; // -1..1
        const maxSkew = 4.5;
        return normalized * maxSkew;
    }

    _makeBox(id, x, y, w, h, skewX, label, value) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('data-hud-box', id);

        const sk = skewX;
        const points = [
            [x + sk,     y + 1],
            [x + w + sk, y + 1],
            [x + w - sk, y + h - 1],
            [x - sk,     y + h - 1],
        ].map(p => p.join(',')).join(' ');

        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        bg.setAttribute('points', points);
        bg.setAttribute('fill', 'url(#hudBoxGrad)');
        bg.setAttribute('stroke', '#2a4a6a');
        bg.setAttribute('stroke-width', '0.7');
        g.appendChild(bg);

        const innerPoints = [
            [x + sk * 0.8 + 2.4,     y + 3.6],
            [x + w + sk * 0.8 - 2.4, y + 3.6],
            [x + w - sk * 0.8 - 1.2, y + h - 3.6],
            [x - sk * 0.8 + 1.2,     y + h - 3.6],
        ].map(p => p.join(',')).join(' ');

        const inner = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        inner.setAttribute('points', innerPoints);
        inner.setAttribute('fill', 'none');
        inner.setAttribute('stroke', '#1a3a5a');
        inner.setAttribute('stroke-width', '0.35');
        g.appendChild(inner);

        const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        lbl.setAttribute('x', x + w / 2);
        lbl.setAttribute('y', y + 7.5);
        lbl.setAttribute('text-anchor', 'middle');
        lbl.setAttribute('font-family', 'Courier New, monospace');
        lbl.setAttribute('font-size', '7.6');
        lbl.setAttribute('fill', '#4a8aaa');
        lbl.setAttribute('letter-spacing', '0.6');
        lbl.textContent = label;
        g.appendChild(lbl);

        const val = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        val.setAttribute('x', x + w / 2);
        val.setAttribute('y', y + h - 3.5);
        val.setAttribute('text-anchor', 'middle');
        val.setAttribute('font-family', 'Courier New, monospace');
        val.setAttribute('font-size', '10.8');
        val.setAttribute('fill', '#88ccee');
        val.setAttribute('filter', 'url(#hudGlow)');
        val.textContent = value;
        g.appendChild(val);

        this._svg.appendChild(g);
        this._boxes[id] = { g, bg, lbl, val };
    }

    _buildTopRow(W, T, S, CI) {
        const y   = 2.4;
        const h   = T - 4.8;
        const bw  = 70;
        const gap = 3.6;

        const leftStart = S + CI + 5;
        ['tl-1', 'tl-2', 'tl-3'].forEach((id, i) => {
            const x = leftStart + i * (bw + gap);
            const skew = this._skewForX(x + bw / 2, W);
            this._makeBox(id, x, y, bw, h, skew, this._defaultLabel(id), this._defaultValue(id));
        });

        const midStart = W / 2 - (bw * 1.5 + gap);
        ['tc-1', 'tc-2', 'tc-3'].forEach((id, i) => {
            const x = midStart + i * (bw + gap);
            this._makeBox(id, x, y, bw, h, 0, this._defaultLabel(id), this._defaultValue(id));
        });

        const rightEnd = W - S - CI - 5;
        ['tr-1', 'tr-2', 'tr-3'].forEach((id, i) => {
            const x = rightEnd - (3 - i) * (bw + gap);
            const skew = this._skewForX(x + bw / 2, W);
            this._makeBox(id, x, y, bw, h, skew, this._defaultLabel(id), this._defaultValue(id));
        });
    }

    _buildBottomRow(W, H, T, S, CI) {
        const h   = T - 4.8;
        const y   = H - h - 2.4;
        const bw  = 70;
        const gap = 3.6;

        const leftStart = S + CI + 5;
        ['bl-1', 'bl-2', 'bl-3'].forEach((id, i) => {
            const x = leftStart + i * (bw + gap);
            const skew = -this._skewForX(x + bw / 2, W);
            this._makeBox(id, x, y, bw, h, skew, this._defaultLabel(id), this._defaultValue(id));
        });

        const midStart = W / 2 - (bw * 1.5 + gap);
        ['bc-1', 'bc-2', 'bc-3'].forEach((id, i) => {
            const x = midStart + i * (bw + gap);
            this._makeBox(id, x, y, bw, h, 0, this._defaultLabel(id), this._defaultValue(id));
        });

        const rightEnd = W - S - CI - 5;
        ['br-1', 'br-2', 'br-3'].forEach((id, i) => {
            const x = rightEnd - (3 - i) * (bw + gap);
            const skew = -this._skewForX(x + bw / 2, W);
            this._makeBox(id, x, y, bw, h, skew, this._defaultLabel(id), this._defaultValue(id));
        });
    }

    _buildCornerAccents(W, H, S, T, CI) {
        const corners = [
            [S + CI + 4, T],
            [W - S - CI - 4, T],
            [S + CI + 4, H - T],
            [W - S - CI - 4, H - T],
        ];

        corners.forEach(([cx, cy]) => {
            const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dot.setAttribute('cx', cx);
            dot.setAttribute('cy', cy);
            dot.setAttribute('r', '2.4');
            dot.setAttribute('fill', '#2a5a7a');
            dot.setAttribute('filter', 'url(#hudGlow)');
            this._svg.appendChild(dot);

            [[cx - 5, cy, cx - 1.2, cy], [cx, cy - 5, cx, cy - 1.2]].forEach(([x1, y1, x2, y2]) => {
                const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                l.setAttribute('x1', x1); l.setAttribute('y1', y1);
                l.setAttribute('x2', x2); l.setAttribute('y2', y2);
                l.setAttribute('stroke', '#2a5a7a');
                l.setAttribute('stroke-width', '0.7');
                this._svg.appendChild(l);
            });
        });
    }

    _defaultLabel(id) {
        const labels = {
            'tl-1': 'SHIELD', 'tl-2': 'HULL', 'tl-3': 'POWER',
            'tc-1': 'TARGET', 'tc-2': 'DIST',  'tc-3': 'BEARING',
            'tr-1': 'RADAR',  'tr-2': 'COMM',  'tr-3': 'NAV',
            'bl-1': 'FUEL',   'bl-2': 'TEMP',  'bl-3': 'THRUST',
            'bc-1': 'SPEED',  'bc-2': 'ALT',   'bc-3': 'HEADING',
            'br-1': 'CARGO',  'br-2': 'CREW',  'br-3': 'SYS',
        };
        return labels[id] ?? id.toUpperCase();
    }

    _defaultValue(id) {
        const values = {
            'tl-1': '100%',  'tl-2': '98%',   'tl-3': 'OK',
            'tc-1': '---',   'tc-2': '1.2 AU', 'tc-3': '047°',
            'tr-1': 'ON',    'tr-2': 'CLEAR',  'tr-3': 'AUTO',
            'bl-1': '87%',   'bl-2': '312K',   'bl-3': '0.04',
            'bc-1': '0.04',  'bc-2': '3.1 AU', 'bc-3': 'N 047',
            'br-1': 'EMPTY', 'br-2': '1/1',    'br-3': 'NOMINAL',
        };
        return values[id] ?? '---';
    }

    updateBox(id, { label, value } = {}) {
        const box = this._boxes[id];
        if (!box) return;
        if (label !== undefined) box.lbl.textContent = label;
        if (value !== undefined) box.val.textContent = value;
    }

    /**
     * Egy adott box aktuális képernyő-koordinátáit adja vissza (pixelben),
     * hogy egy külső DOM elemet (pl. hologram canvas) rá lehessen pozicionálni.
     */
    getBoxScreenRect(id) {
        const box = this._boxes[id];
        if (!box) return null;
        return box.bg.getBoundingClientRect();
    }

    /**
     * A nagy középső "játékablak" (oktogon) képernyő-koordinátáit adja vissza
     * (a bounding boxát), hogy külső DOM elemet (pl. hologram canvas) rá lehessen
     * pozicionálni.
     */
    getGameWindowRect() {
        if (!this._gameWindowEl) return null;
        return this._gameWindowEl.getBoundingClientRect();
    }

    /**
     * CSS clip-path polygon string, ami a nagy ablak oktogon alakjához igazítja
     * a rá pozicionált külső elemet (pl. hologram), hogy ne lógjon ki a sarkokon.
     */
    getGameWindowClipPath() {
        const m = this._gameWindowMetrics;
        if (!m) return null;
        const { W, H, T, S, CI } = m;
        const width = W - 2 * S;
        const height = H - 2 * T;
        const cx = (CI / width) * 100;
        const cy = (CI / height) * 100;
        return `polygon(${cx}% 0%, ${100 - cx}% 0%, 100% ${cy}%, 100% ${100 - cy}%, ${100 - cx}% 100%, ${cx}% 100%, 0% ${100 - cy}%, 0% ${cy}%)`;
    }
    
    // ─── AKTÍV BOX / TAB NAVIGÁCIÓ ──────────────────────────────────────

    /**
     * Vizuálisan kiemeli a megadott boxot (világosabb háttér, erősebb
     * glow, fényesebb szöveg), és visszaállítja az előzőt alapállapotba.
     * @param {string|null} id  box azonosító, vagy null a kijelölés törléséhez
     */
    setActiveBox(id) {
        if (this._activeId && this._boxes[this._activeId]) {
            this._resetBoxStyle(this._activeId);
        }
        this._activeId = id;
        if (id && this._boxes[id]) {
            this._applyActiveStyle(id);
        }
    }

    _applyActiveStyle(id) {
        const box = this._boxes[id];
        if (!box) return;
        box.bg.setAttribute('fill', 'url(#hudBoxGradActive)');
        box.bg.setAttribute('stroke', '#6ab8ff');
        box.bg.setAttribute('stroke-width', '1.1');
        box.lbl.setAttribute('fill', '#aee0ff');
        box.val.setAttribute('fill', '#ffffff');
        box.val.setAttribute('filter', 'url(#hudGlowStrong)');
        box.g.setAttribute('filter', 'url(#hudGlowStrong)');
    }

    _resetBoxStyle(id) {
        const box = this._boxes[id];
        if (!box) return;
        box.bg.setAttribute('fill', 'url(#hudBoxGrad)');
        box.bg.setAttribute('stroke', '#2a4a6a');
        box.bg.setAttribute('stroke-width', '0.7');
        box.lbl.setAttribute('fill', '#4a8aaa');
        box.val.setAttribute('fill', '#88ccee');
        box.val.setAttribute('filter', 'url(#hudGlow)');
        box.g.removeAttribute('filter');
    }

    /**
     * Tab navigációhoz: a következő/előző boxra lép körkörösen.
     * @param {1|-1} dir  1 = következő, -1 = előző
     */
    cycleActiveBox(dir = 1) {
        const order = this._boxOrder;
        let idx = order.indexOf(this._activeId);
        idx = (idx + dir + order.length) % order.length;
        this.setActiveBox(order[idx]);
    }
    

    getActiveBoxId() {
        return this._activeId;
    }

    dispose() {
        document.body.removeChild(this._wrapper);
    }
}