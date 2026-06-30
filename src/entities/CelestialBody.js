import * as THREE from 'three';
import { keplerPosition } from '../physics/OrbitalMechanics.js';
import { CELESTIAL } from '../config.js';

export class CelestialBody {
    constructor({
        name,
        radius,
        color,
        orbit,
        orbitCenter,
    }) {
        this.name = name;
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

        this.wireShells = this.createWireShells(radius, 4);
        this.group.add(this.wireShells);

        // A shell-ek csak ennyi távolságon belül legyenek láthatóak (kamerától mérve)
        this.shellVisibleDistance = CELESTIAL.wireShellVisibleDistanceMultiplier * radius;

        this._phaseOffset = orbit.phaseOffset ?? (Math.random() * Math.PI * 2 / orbit.speed);


    }

    update(time, cameraPosition) {
        keplerPosition(this.orbit, time + this._phaseOffset, this.orbitCenter, this.position);

        this.group.position.copy(this.position);

        if (cameraPosition && this.wireShells) {
            const dist = this.position.distanceTo(cameraPosition);
            this.wireShells.visible = dist < this.shellVisibleDistance;
        }

        for (const moon of this.moons) {
            moon.update(time, cameraPosition);
        }
    }


    // Creates a set of wireframe shells around the celestial body to give it a glowing effect.
    createWireShells(radius, layers = 4) {
        const group = new THREE.Group();

        for (let i = 1; i <= layers; i++) {
            const scale = 2 + i * 0.8; // rétegek távolsága
            const geo = new THREE.SphereGeometry(radius * scale, 16, 16);

            const wire = new THREE.WireframeGeometry(geo);

            const line = new THREE.LineSegments(
                wire,
                new THREE.LineBasicMaterial({
                    color: 0x88ccff,
                    transparent: true,
                    opacity: 0.1 / i, // kifelé halványabb
                })
            );

            group.add(line);
        }

        return group;
    }
}