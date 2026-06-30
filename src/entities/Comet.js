import * as THREE from 'three';
import { keplerPosition } from '../physics/OrbitalMechanics.js';
import { createOrbitLine } from './OrbitTrail.js';

export class Comet {
    constructor({ name, radius, color, tailColor, tailLength, tailWidth, orbit, orbitCenter }) {
        this.name = name;
        this.orbit = orbit;
        this.orbitCenter = orbitCenter;
        this.position = new THREE.Vector3();
        this.radius = radius;

        this.group = new THREE.Group();

        // --- MAG ---
        const coreGeo = new THREE.SphereGeometry(radius, 16, 16);
        const coreMat = new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 0.4,
        });
        this.group.add(new THREE.Mesh(coreGeo, coreMat));

        // --- CSÓVA ---
        // Kúp geometria, csúcsa a magnál, szélesedik kifelé.
        // Alapból +Z irányba mutat, minden frame-ben ráforgatjuk a Naptól-elfelé irányra.
        const tailGeo = new THREE.ConeGeometry(tailWidth, tailLength, 12, 1, true);
        tailGeo.translate(0, tailLength / 2, 0); // a csúcs kerüljön az origóba
        tailGeo.rotateX(Math.PI / 2);            // fekvő kúp: hossztengely +Z

        const tailMat = new THREE.MeshBasicMaterial({
            color: tailColor,
            transparent: true,
            opacity: 0.35,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });
        this.tail = new THREE.Mesh(tailGeo, tailMat);
        this.group.add(this.tail);

        // --- ORBIT VONAL ---
        this.orbitLine = createOrbitLine(orbit, orbitCenter, color);

        this._phaseOffset = orbit.phaseOffset ?? 0;
    }

    update(time) {
        keplerPosition(this.orbit, time + this._phaseOffset, this.orbitCenter, this.position);
        this.group.position.copy(this.position);

        // A csóva mindig a Naptól elfelé mutasson
        const awayFromSun = new THREE.Vector3()
            .subVectors(this.position, this.orbitCenter)
            .normalize();

        if (awayFromSun.lengthSq() > 0) {
            const defaultDir = new THREE.Vector3(0, 0, 1);
            this.tail.quaternion.setFromUnitVectors(defaultDir, awayFromSun);
        }
    }

    setOrbitLineVisible(visible) {
        this.orbitLine.visible = visible;
    }
    
}


export const COMET_2 = {
    name: 'Comet-Retro',
    radius: 10,
    color: 0xffd9aa,
    tailColor: 0xffcc88,
    tailLength: 450,
    tailWidth: 30,
    orbit: {
        semiMajorAxis: 13000,
        eccentricity: 0.78,
        inclination: THREE.MathUtils.degToRad(-35),
        speed: -0.0014, // negatív = retrográd
        phaseOffset: Math.PI,
    },
};