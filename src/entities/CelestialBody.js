import * as THREE from 'three';
import { keplerPosition } from '../physics/OrbitalMechanics.js';

export class CelestialBody {
    constructor({
        name,
        mass,
        radius,
        color,
        orbit,
        orbitCenter,
    }) {
        this.name = name;
        this.mass = mass;
        this.orbit = orbit;
        this.orbitCenter = orbitCenter;
        this.position = new THREE.Vector3();
        this.moons = [];

        // --- THREE.JS MESH ---
        this.group = new THREE.Group();

        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 0.05,
        });
        this.group.add(new THREE.Mesh(geometry, material));

        const glowGeo = new THREE.SphereGeometry(radius * 1.04, 32, 32);
        const glowMat = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.1,
            wireframe: true,
        });
        this.group.add(new THREE.Mesh(glowGeo, glowMat));

        this._phaseOffset = orbit.phaseOffset ?? (Math.random() * Math.PI * 2 / orbit.speed);
    }

    update(time) {
        keplerPosition(this.orbit, time + this._phaseOffset, this.orbitCenter, this.position);

        this.group.position.copy(this.position);

        for (const moon of this.moons) {
            moon.update(time);
        }
    }
}