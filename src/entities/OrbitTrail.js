import * as THREE from 'three';
import { keplerPosition } from '../physics/OrbitalMechanics.js';
import { ORBIT_TRAIL } from '../config.js';

// ─── Statikus ellipszis pontsor ───────────────────────────────────────────────

export function createOrbitLine(orbit, center, color) {
    const points = [];
    const steps = ORBIT_TRAIL.ellipsePoints;

    for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * (Math.PI * 2 / orbit.speed); // egy teljes kör
        const pos = keplerPosition(orbit, t, center);
        points.push(pos.clone());
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: ORBIT_TRAIL.ellipseOpacity,
        depthWrite: false,
    });

    const line = new THREE.Line(geometry, material);
    line.visible = false; // toggle-lhető
    return line;
}

// ─── Dinamikus trail ──────────────────────────────────────────────────────────

export class DynamicTrail {
    /**
     * @param {THREE.Scene} scene
     * @param {THREE.Color|number} color
     */
    constructor(scene, color) {
        this.scene = scene;
        this.color = new THREE.Color(color);
        this._duration = ORBIT_TRAIL.trailDuration; // másodperc
        this._maxPoints = ORBIT_TRAIL.trailMaxPoints;

        // Circular buffer: pozíció + timestamp
        this._buffer = []; // { pos: THREE.Vector3, time: number }

        // Geometry — pre-allokált
        this._positions = new Float32Array(this._maxPoints * 3);
        this._alphas = new Float32Array(this._maxPoints);

        this._geometry = new THREE.BufferGeometry();
        this._geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(this._positions, 3)
        );
        this._geometry.setAttribute(
            'alpha',
            new THREE.BufferAttribute(this._alphas, 1)
        );
        this._geometry.setDrawRange(0, 0);

        this._material = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: this.color },
            },
            vertexShader: `
                attribute float alpha;
                varying float vAlpha;
                void main() {
                    vAlpha = alpha;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                varying float vAlpha;
                void main() {
                    gl_FragColor = vec4(color, vAlpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });

        this._line = new THREE.Line(this._geometry, this._material);
        this._line.frustumCulled = false;
        scene.add(this._line);
    }

    /**
     * Hívd minden frame-ben a bolygó aktuális pozíciójával.
     * @param {THREE.Vector3} position
     * @param {number} now  performance.now() / 1000 (másodperc)
     * @param {number} delta
     */
    update(position, now, delta) {
        // Új pont hozzáadása (csak ha eleget mozdult)
        const last = this._buffer[this._buffer.length - 1];
        if (!last || position.distanceTo(last.pos) > ORBIT_TRAIL.minDistance) {
            this._buffer.push({ pos: position.clone(), time: now });
        }

        // Lejárt pontok törlése
        const cutoff = now - this._duration;
        while (this._buffer.length > 0 && this._buffer[0].time < cutoff) {
            this._buffer.shift();
        }

        // Max pont limit
        while (this._buffer.length > this._maxPoints) {
            this._buffer.shift();
        }

        const count = this._buffer.length;
        if (count < 2) {
            this._geometry.setDrawRange(0, 0);
            return;
        }

        // Buffer feltöltése
        for (let i = 0; i < count; i++) {
            const { pos, time } = this._buffer[i];
            const age = now - time;                          // 0..duration
            const alpha = Math.max(0, 1 - age / this._duration);

            this._positions[i * 3]     = pos.x;
            this._positions[i * 3 + 1] = pos.y;
            this._positions[i * 3 + 2] = pos.z;
            this._alphas[i] = alpha * ORBIT_TRAIL.trailMaxOpacity;
        }

        this._geometry.attributes.position.needsUpdate = true;
        this._geometry.attributes.alpha.needsUpdate = true;
        this._geometry.setDrawRange(0, count);
    }

    dispose() {
        this._geometry.dispose();
        this._material.dispose();
        this.scene.remove(this._line);
    }
}