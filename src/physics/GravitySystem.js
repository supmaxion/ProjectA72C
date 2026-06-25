import * as THREE from 'three';
import { GRAVITY } from '../config.js';

const _toBody = new THREE.Vector3();

/**
 * Computes and applies gravitational attraction from all celestial
 * bodies (sun, planets, moons) onto the ship's Rapier RigidBody.
 *
 * Uses Newton's law: F = G * M * m / r^2, directed toward the body.
 * Since Rapier works with forces and the ship mass is 1.0, we can
 * apply acceleration directly as an impulse scaled by the timestep.
 *
 * Softening factor: we add a small epsilon to r^2 to prevent the
 * force from exploding to infinity if the ship gets very close to
 * a body's center (before the collision response kicks in).
 */
export class GravitySystem {
    constructor(physicsWorld) {
        this._world = physicsWorld;
        this._bodies = []; // { position: THREE.Vector3, mass: number }
    }

    /**
     * Register a gravitational attractor (sun, planet, moon).
     * Call this once during setup for each celestial body.
     * Returns the index so SolarSystem can update the position each frame.
     */
    addBody(position, mass) {
        this._bodies.push({ position, mass });
        return this._bodies.length - 1;
    }

    updateBodyPosition(index, position) {
        this._bodies[index].position.copy(position);
    }

    /**
     * Apply gravitational forces to the ship's RigidBody.
     * Call this every frame BEFORE physicsWorld.step().
     */
    applyTo(shipRigidBody) {
        const shipPos = shipRigidBody.translation();
        const shipVec = new THREE.Vector3(shipPos.x, shipPos.y, shipPos.z);

        const totalForce = new THREE.Vector3();

        for (const body of this._bodies) {
            _toBody.copy(body.position).sub(shipVec);

            const distSq = _toBody.lengthSq();
            const softened = distSq + 100; // softening to avoid singularity

            const forceMag = (GRAVITY.G * body.mass * GRAVITY.scale) / softened;

            totalForce.addScaledVector(_toBody.normalize(), forceMag);
        }

        shipRigidBody.applyImpulse(
            { x: totalForce.x, y: totalForce.y, z: totalForce.z },
            true
        );
    }

    applyToVelocity(ship) {
        const shipPos = ship.position;
        const force = new THREE.Vector3();

        for (const body of this._bodies) {
            const toBody = body.position.clone().sub(shipPos);
            const distSq = toBody.lengthSq();
            const softened = distSq + 100;
            const forceMag = (GRAVITY.G * body.mass * GRAVITY.scale) / softened;
            force.addScaledVector(toBody.normalize(), forceMag);
        }

        // Skálázzuk le hogy ne legyen túl erős
        force.multiplyScalar(0.0001);
        ship.applyGravityForce(force);
    }


}