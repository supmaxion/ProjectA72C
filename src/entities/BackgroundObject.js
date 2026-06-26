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

function makeGalaxyTexture(size = 256) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const cx = size / 2, cy = size / 2;

    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.15);
    core.addColorStop(0, 'rgba(255,240,200,0.7)');
    core.addColorStop(1, 'transparent');
    ctx.fillStyle = core;
    ctx.fillRect(0, 0, size, size);

    ctx.save();
    for (let arm = 0; arm < 3; arm++) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((arm / 3) * Math.PI * 2);
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
            ctx.fillStyle = `rgba(200,210,255,${alpha})`;
            ctx.fill();
        }
        ctx.restore();
    }
    ctx.restore();

    const outer = ctx.createRadialGradient(cx, cy, size * 0.1, cx, cy, size * 0.5);
    outer.addColorStop(0,   'transparent');
    outer.addColorStop(0.6, 'rgba(150,160,255,0.06)');
    outer.addColorStop(1,   'transparent');
    ctx.fillStyle = outer;
    ctx.fillRect(0, 0, size, size);

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
        makeTexture: () => makeGalaxyTexture(256),
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
};

// ─── BackgroundObject osztály ─────────────────────────────────────────────────

export class BackgroundObject {
    /**
     * @param {THREE.Camera} camera  - a sprite a kamera gyereke lesz → mindig háttérben marad
     * @param {THREE.Vector3} direction  - egységvektor: merre legyen a kamerától
     * @param {'nebula'|'galaxy'|'starCluster'|'pulsar'} type
     */
    constructor(scene, direction, type = 'nebula') {
        this._scene = scene;
        this._direction = direction.clone().normalize();
        this.type    = type;
        this._time   = Math.random() * Math.PI * 2;

        const def        = TYPES[type];
        const [minS, maxS] = def.sizeRange;
        this._size       = minS + Math.random() * (maxS - minS);

        const texture  = def.makeTexture();
        const material = new THREE.SpriteMaterial({
            map:         texture,
            transparent: true,
            depthWrite:  false,
            blending:    THREE.AdditiveBlending,
        });

        this.sprite = new THREE.Sprite(material);

        // A pozíció a kamera saját koordinátarendszerében értendő.
        // CFG.skyDistance egységre tesszük a kamerától a megadott irányba.
        // Mivel a kamera gyereke, mozgásával együtt mozog → soha nem lehet "mögé" menni.
        this.sprite.position.copy(direction.clone().multiplyScalar(CFG.skyDistance));
        this.sprite.scale.set(this._size, this._size, 1);
        this.sprite.renderOrder = -1;

        camera.add(this.sprite);
    }

    /**
     * @param {number} delta
     * @param {THREE.Vector3} cameraPosition  - minden frame-ben szinkronizál
     */
    update(delta, cameraPosition) {
        // Mindig a kamera mellé mozgatjuk a megadott irányba
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
        this._camera.remove(this.sprite);
    }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

/**
 * Létrehoz N darab BackgroundObject-et random irányban, a kamerához kötve.
 * @param {THREE.Camera} camera
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
        // Random irány a gömb felületén
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.acos(2 * Math.random() - 1);

        const dir = new THREE.Vector3(
            Math.sin(phi) * Math.cos(theta),
            Math.sin(phi) * Math.sin(theta),
            Math.cos(phi)
        );

        objects.push(new BackgroundObject(camera, dir, type));
    }

    return objects;
}