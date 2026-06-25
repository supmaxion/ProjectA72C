import * as THREE from 'three';
import { keplerPosition } from '../physics/OrbitalMechanics.js';

/**
 * A planet or moon: a Three.js mesh that moves along a Keplerian
 * orbit, plus a Rapier kinematic collider that follows it.
 * The gravitational influence is registered separately in GravitySystem.
 */
export class CelestialBody {
    constructor({
        name,
        mass,
        radius,
        color,
        orbit,
        orbitCenter,      // THREE.Vector3 -- the body being orbited
        physicsWorld,
        gravitySystem,
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
        const mesh = new THREE.Mesh(geometry, material);
        this.group.add(mesh);

        // Subtle wireframe glow shell
        const glowGeo = new THREE.SphereGeometry(radius * 1.04, 32, 32);
        const glowMat = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.1,
            wireframe: true,
        });
        this.group.add(new THREE.Mesh(glowGeo, glowMat));

        // --- RAPIER KINEMATIC COLLIDER ---
        // Kinematic = we set its position manually each frame to follow
        // the Keplerian orbit. The ship can collide with it, but it
        // is not affected by forces itself.
        this._rigidBody = physicsWorld.createCelestialCollider(radius);

        // --- GRAVITY REGISTRATION ---
        this._gravityIndex = gravitySystem.addBody(this.position, mass);
        this._gravitySystem = gravitySystem;
    }

    /**
     * Advance the orbit by one frame.
     * @param {number} time  monotonic frame counter
     */
    update(time) {
        // Compute new position from Keplerian formula
        keplerPosition(this.orbit, time, this.orbitCenter, this.position);

        // Sync Three.js mesh
        this.group.position.copy(this.position);

        // Sync Rapier collider
        this._rigidBody.setNextKinematicTranslation({
            x: this.position.x,
            y: this.position.y,
            z: this.position.z,
        });

        // Sync gravity attractor position
        this._gravitySystem.updateBodyPosition(this._gravityIndex, this.position);

        // Update moons -- they orbit this body's current position
        for (const moon of this.moons) {
            moon.update(time);
        }
    }
}