import * as THREE from 'three';
import { MILKY_WAY as CFG } from '../config.js';

// ─── VERZIÓ 1: Points felhő (sok ezer apró pont, sávban szórva) ──────────────

export class MilkyWayBandPoints {
    constructor(scene) {
        this._scene = scene;

        const count = CFG.starCount;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        // A sáv egy nagy körív mentén fut, kis szórással "kifelé/keresztben"
        const tiltAxis = new THREE.Vector3(10, 0, 0); // X tengely körül döntjük meg a sávot
        const tiltQuat = new THREE.Quaternion().setFromAxisAngle(tiltAxis, CFG.bandTilt);

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const spread = gaussRand() * CFG.bandThickness; // mennyire "vastag" a sáv

            const dir = new THREE.Vector3(
                Math.cos(theta),
                spread,
                Math.sin(theta)
            ).normalize();
            dir.applyQuaternion(tiltQuat);

            positions[i * 3]     = dir.x * CFG.skyDistance;
            positions[i * 3 + 1] = dir.y * CFG.skyDistance;
            positions[i * 3 + 2] = dir.z * CFG.skyDistance;

            const b = 0.5 + Math.random() * 0.5;
            colors[i * 3]     = b;
            colors[i * 3 + 1] = b * (0.9 + Math.random() * 0.1);
            colors[i * 3 + 2] = b * (0.85 + Math.random() * 0.15);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: CFG.starSize,
            vertexColors: true,
            transparent: true,
            opacity: 0.85,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: false,
        });

        this.points = new THREE.Points(geometry, material);
        this.points.renderOrder = -2;
        scene.add(this.points);
    }

    update(cameraPosition) {
        this.points.position.copy(cameraPosition);
    }

    dispose() {
        this.points.geometry.dispose();
        this.points.material.dispose();
        this._scene.remove(this.points);
    }
}

function gaussRand() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/*
// ─── VERZIÓ 2: Panoráma-textúrás sáv (egy nagy, elnyúlt sprite/sík) ──────────
//
// Könnyebb, kevésbé részletes, de olcsóbb draw call-ban. Egy hosszú,
// vízszintes canvas-textúrát rajzolunk csillagpöttyökkel és halvány köddel,
// majd egy nagy, gyűrű/henger-szerű geometriára (vagy egyetlen nagy síkra)
// tesszük, ami a kamera körül forog vele.

export class MilkyWayBandPanorama {
    constructor(scene) {
        this._scene = scene;

        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        const grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grd.addColorStop(0,   'transparent');
        grd.addColorStop(0.5, 'rgba(180,190,255,0.18)');
        grd.addColorStop(1,   'transparent');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        for (let i = 0; i < 3000; i++) {
            const x = Math.random() * canvas.width;
            const y = canvas.height / 2 + gaussRand() * canvas.height * 0.18;
            const r = Math.random() * 1.2;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;

        // Henger belső oldalára tesszük, a kamerát körülölelve
        const geometry = new THREE.CylinderGeometry(
            CFG.skyDistance, CFG.skyDistance, CFG.skyDistance * 0.6,
            64, 1, true
        );
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.rotation.z = CFG.bandTilt;
        scene.add(this.mesh);
    }

    update(cameraPosition) {
        this.mesh.position.copy(cameraPosition);
    }

    dispose() {
        this.mesh.geometry.dispose();
        this.mesh.material.map?.dispose();
        this.mesh.material.dispose();
        this._scene.remove(this.mesh);
    }
}
*/