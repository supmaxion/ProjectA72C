import * as THREE from 'three';
import { BACKGROUND_OBJECTS as CFG } from '../config.js';

// ─── Canvas textúra gyárak ───────────────────────────────────────────────────

function makeNebulaTexture(color1 = '#4466ff', color2 = '#aa00ff', size = 256) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');

    const layers = [
        { x: 0.5,  y: 0.5,  r: 0.5,  a: 0.55 },
        { x: 0.35, y: 0.4,  r: 0.3,  a: 0.35 },
        { x: 0.65, y: 0.6,  r: 0.25, a: 0.3  },
        { x: 0.5,  y: 0.3,  r: 0.2,  a: 0.2  },
    ];

    layers.forEach(({ x, y, r, a }) => {
        const grd = ctx.createRadialGradient(
            x * size, y * size, 0,
            x * size, y * size, r * size
        );
        grd.addColorStop(0,   hexAlpha(color1, a));
        grd.addColorStop(0.5, hexAlpha(color2, a * 0.5));
        grd.addColorStop(1,   'transparent');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, size, size);
    });

    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    for (let i = 0; i < 40; i++) {
        const px = Math.random() * size;
        const py = Math.random() * size;
        const pr = Math.random() * 1.2;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
}

function makeSpiralGalaxyTexture(size = 256, tint = '#c8d2ff') {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const cx = size / 2, cy = size / 2;

    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.15);
    core.addColorStop(0, 'rgba(255,240,200,0.7)');
    core.addColorStop(1, 'transparent');
    ctx.fillStyle = core;
    ctx.fillRect(0, 0, size, size);

    const armCount = 2 + Math.floor(Math.random() * 2); // 2-3 kar
    for (let arm = 0; arm < armCount; arm++) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((arm / armCount) * Math.PI * 2);
        for (let i = 0; i < 120; i++) {
            const t      = i / 120;
            const angle  = t * Math.PI * 2.5;
            const radius = t * size * 0.42;
            const px     = Math.cos(angle) * radius;
            const py     = Math.sin(angle) * radius * 0.45;
            const alpha  = (1 - t) * 0.35;
            const r      = (1 - t) * 2.5 + 0.5;
            ctx.beginPath();
            ctx.arc(px, py, r, 0, Math.PI * 2);
            ctx.fillStyle = hexAlpha(tint, alpha);
            ctx.fill();
        }
        ctx.restore();
    }

    const outer = ctx.createRadialGradient(cx, cy, size * 0.1, cx, cy, size * 0.5);
    outer.addColorStop(0,   'transparent');
    outer.addColorStop(0.6, hexAlpha(tint, 0.06));
    outer.addColorStop(1,   'transparent');
    ctx.fillStyle = outer;
    ctx.fillRect(0, 0, size, size);

    return new THREE.CanvasTexture(canvas);
}

function makeEllipticalGalaxyTexture(size = 256, tint = '#ffe9c2') {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const cx = size / 2, cy = size / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, 0.62 + Math.random() * 0.3); // ovális lapultság
    const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.45);
    grd.addColorStop(0,    'rgba(255,250,235,0.85)');
    grd.addColorStop(0.35, hexAlpha(tint, 0.45));
    grd.addColorStop(0.7,  hexAlpha(tint, 0.12));
    grd.addColorStop(1,    'transparent');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    return new THREE.CanvasTexture(canvas);
}

function makeEdgeOnGalaxyTexture(size = 256, tint = '#a8c0ff') {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const cx = size / 2, cy = size / 2;

    // vékony, lapos korong
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, 0.12);
    const disk = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.46);
    disk.addColorStop(0,   hexAlpha(tint, 0.7));
    disk.addColorStop(0.6, hexAlpha(tint, 0.25));
    disk.addColorStop(1,   'transparent');
    ctx.fillStyle = disk;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.46, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // kidudorodó középső mag
    const bulge = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.14);
    bulge.addColorStop(0, 'rgba(255,245,225,0.9)');
    bulge.addColorStop(1, 'transparent');
    ctx.fillStyle = bulge;
    ctx.fillRect(0, 0, size, size);

    // por sáv a középen (sötét csík)
    ctx.fillStyle = 'rgba(10,5,15,0.35)';
    ctx.fillRect(0, cy - 1.5, size, 3);

    return new THREE.CanvasTexture(canvas);
}

function makeIrregularGalaxyTexture(size = 256, tint = '#cfd8ff') {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const cx = size / 2, cy = size / 2;

    const blobCount = 5 + Math.floor(Math.random() * 4);
    for (let i = 0; i < blobCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist  = Math.random() * size * 0.25;
        const bx = cx + Math.cos(angle) * dist;
        const by = cy + Math.sin(angle) * dist;
        const br = size * (0.12 + Math.random() * 0.16);

        const grd = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        grd.addColorStop(0, hexAlpha(tint, 0.4 + Math.random() * 0.3));
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    for (let i = 0; i < 25; i++) {
        const px = cx + (Math.random() - 0.5) * size * 0.5;
        const py = cy + (Math.random() - 0.5) * size * 0.5;
        ctx.beginPath();
        ctx.arc(px, py, Math.random() * 1.1, 0, Math.PI * 2);
        ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
}

function makeStarClusterTexture(size = 256) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const cx = size / 2, cy = size / 2;

    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.4);
    glow.addColorStop(0, 'rgba(255,250,200,0.25)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 200; i++) {
        const angle      = Math.random() * Math.PI * 2;
        const dist       = Math.abs(gaussRand()) * size * 0.22;
        const px         = cx + Math.cos(angle) * dist;
        const py         = cy + Math.sin(angle) * dist;
        const brightness = Math.random();
        const r          = Math.random() * 1.5 + 0.3;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,${220 + Math.floor(brightness * 35)},${150 + Math.floor(brightness * 100)},${0.5 + brightness * 0.5})`;
        ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
}

function makePulsarTexture(size = 128) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const cx = size / 2, cy = size / 2;

    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.08);
    core.addColorStop(0,   'rgba(255,255,255,1)');
    core.addColorStop(0.5, 'rgba(180,220,255,0.9)');
    core.addColorStop(1,   'transparent');
    ctx.fillStyle = core;
    ctx.fillRect(0, 0, size, size);

    const outerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.35);
    outerGlow.addColorStop(0, 'rgba(100,180,255,0.4)');
    outerGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = outerGlow;
    ctx.fillRect(0, 0, size, size);

    [[cx, 0, cx, size], [0, cy, size, cy]].forEach(([x1, y1, x2, y2]) => {
        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0,   'transparent');
        grad.addColorStop(0.5, 'rgba(200,235,255,0.6)');
        grad.addColorStop(1,   'transparent');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    });

    return new THREE.CanvasTexture(canvas);
}

function makeSupernovaTexture(size = 256, tint = '#ff6644') {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const cx = size / 2, cy = size / 2;

    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.1);
    core.addColorStop(0, 'rgba(255,255,240,0.9)');
    core.addColorStop(1, 'transparent');
    ctx.fillStyle = core;
    ctx.fillRect(0, 0, size, size);

    // rostos gyűrű
    const filaments = 80;
    for (let i = 0; i < filaments; i++) {
        const angle = (i / filaments) * Math.PI * 2 + Math.random() * 0.1;
        const rBase = size * (0.22 + Math.random() * 0.12);
        const len = size * (0.06 + Math.random() * 0.08);
        const x1 = cx + Math.cos(angle) * rBase;
        const y1 = cy + Math.sin(angle) * rBase;
        const x2 = cx + Math.cos(angle) * (rBase + len);
        const y2 = cy + Math.sin(angle) * (rBase + len);

        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, hexAlpha(tint, 0.5));
        grad.addColorStop(1, 'transparent');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5 + Math.random();
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    const ring = ctx.createRadialGradient(cx, cy, size * 0.18, cx, cy, size * 0.36);
    ring.addColorStop(0, 'transparent');
    ring.addColorStop(0.5, hexAlpha(tint, 0.18));
    ring.addColorStop(1, 'transparent');
    ctx.fillStyle = ring;
    ctx.fillRect(0, 0, size, size);

    return new THREE.CanvasTexture(canvas);
}

function makeBlackHoleTexture(size = 256) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const cx = size / 2, cy = size / 2;

    // akkréciós gyűrű
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, 0.35);
    const disk = ctx.createRadialGradient(0, 0, size * 0.1, 0, 0, size * 0.42);
    disk.addColorStop(0,    'rgba(255,200,120,0.95)');
    disk.addColorStop(0.35, 'rgba(255,120,60,0.6)');
    disk.addColorStop(0.7,  'rgba(120,40,160,0.25)');
    disk.addColorStop(1,    'transparent');
    ctx.fillStyle = disk;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // sötét esemény-horizont középen, felülírja a korongot
    const hole = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.13);
    hole.addColorStop(0, 'rgba(0,0,0,1)');
    hole.addColorStop(0.85, 'rgba(0,0,0,1)');
    hole.addColorStop(1, 'transparent');
    ctx.fillStyle = hole;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.13, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
}



// ─── Segédfüggvények ─────────────────────────────────────────────────────────

function hexAlpha(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

function gaussRand() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// ─── Típus definíciók ─────────────────────────────────────────────────────────

const TYPES = {
    nebula: {
        makeTexture: () => {
            const palettes = [
                ['#3355ff', '#cc00ff'],
                ['#ff3300', '#ff9900'],
                ['#00ccff', '#0033ff'],
                ['#ff0066', '#9900cc'],
            ];
            const [c1, c2] = palettes[Math.floor(Math.random() * palettes.length)];
            return makeNebulaTexture(c1, c2, 256);
        },
        sizeRange: [CFG.nebula.minSize, CFG.nebula.maxSize],
    },
    galaxy: {
        makeTexture: () => {
            const tints = ['#c8d2ff', '#ffe9c2', '#a8c0ff', '#ffd0e0', '#c2ffe9'];
            const tint = tints[Math.floor(Math.random() * tints.length)];
            const variant = Math.random();
            if (variant < 0.4)  return makeSpiralGalaxyTexture(256, tint);
            if (variant < 0.65) return makeEllipticalGalaxyTexture(256, tint);
            if (variant < 0.85) return makeEdgeOnGalaxyTexture(256, tint);
            return makeIrregularGalaxyTexture(256, tint);
        },
        sizeRange: [CFG.galaxy.minSize, CFG.galaxy.maxSize],
    },
    starCluster: {
        makeTexture: () => makeStarClusterTexture(256),
        sizeRange: [CFG.starCluster.minSize, CFG.starCluster.maxSize],
    },
    pulsar: {
        makeTexture: () => makePulsarTexture(128),
        sizeRange: [CFG.pulsar.minSize, CFG.pulsar.maxSize],
    },
    supernova: {
    makeTexture: () => makeSupernovaTexture(256),
    sizeRange: [CFG.supernova.minSize, CFG.supernova.maxSize],
    },
    blackHole: {
        makeTexture: () => makeBlackHoleTexture(256),
        sizeRange: [CFG.blackHole.minSize, CFG.blackHole.maxSize],
    },
};

// ─── BackgroundObject osztály ─────────────────────────────────────────────────

export class BackgroundObject {
    /**
     * @param {THREE.Scene} scene
     * @param {THREE.Vector3} direction  - egységvektor: merre legyen a kamerától
     * @param {'nebula'|'galaxy'|'starCluster'|'pulsar'} type
     */
    constructor(scene, direction, type = 'nebula') {
        this._scene     = scene;
        this._direction = direction.clone().normalize();
        this.type       = type;
        this._time      = Math.random() * Math.PI * 2;

        const def          = TYPES[type];
        const [minS, maxS] = def.sizeRange;
        this._size         = minS + Math.random() * (maxS - minS);

        const texture  = def.makeTexture();
        const material = new THREE.SpriteMaterial({
            map:         texture,
            transparent: true,
            depthWrite:  false,
            blending:    THREE.AdditiveBlending,
        });

        this.sprite = new THREE.Sprite(material);
        this.sprite.scale.set(this._size, this._size, 1);
        this.sprite.renderOrder = -1;

        scene.add(this.sprite);
    }

    /**
     * Minden frame-ben a kamera pozíciójához igazítja a sprite-ot.
     * Így mindig skyDistance távolságra lesz a kamerától → nem lehet mögé menni.
     * @param {number} delta
     * @param {THREE.Vector3} cameraPosition
     */
    update(delta, cameraPosition) {
        this.sprite.position
            .copy(this._direction)
            .multiplyScalar(CFG.skyDistance)
            .add(cameraPosition);

        if (this.type === 'pulsar') {
            this._time += delta * CFG.pulsar.pulseSpeed;
            const pulse = 0.85 + 0.15 * Math.sin(this._time);
            this.sprite.scale.set(this._size * pulse, this._size * pulse, 1);
            this.sprite.material.opacity = 0.7 + 0.3 * Math.sin(this._time * 1.3);
        }
    }

    dispose() {
        this.sprite.material.map?.dispose();
        this.sprite.material.dispose();
        this._scene.remove(this.sprite);
    }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

/**
 * Létrehoz N darab BackgroundObject-et random irányban.
 * @param {THREE.Scene} scene
 * @returns {BackgroundObject[]}
 */
export function spawnBackgroundObjects(scene) {
    const objects = [];

    const typeList = [
        ...Array(CFG.counts.nebula).fill('nebula'),
        ...Array(CFG.counts.galaxy).fill('galaxy'),
        ...Array(CFG.counts.starCluster).fill('starCluster'),
        ...Array(CFG.counts.pulsar).fill('pulsar'),
    ];

    for (const type of typeList) {
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.acos(2 * Math.random() - 1);

        const dir = new THREE.Vector3(
            Math.sin(phi) * Math.cos(theta),
            Math.sin(phi) * Math.sin(theta),
            Math.cos(phi)
        );

        objects.push(new BackgroundObject(scene, dir, type));
    }

    return objects;
}