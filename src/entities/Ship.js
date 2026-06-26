import * as THREE from 'three';
import { buildShipMeshes } from './Ship.shape.js';
import { SHIP } from '../config.js';

export class Ship {
    constructor(physicsWorld) {
        // --- THREE.JS GROUPS (rotation architecture unchanged) ---
        this.group = new THREE.Group();
        this.group.position.copy(SHIP.startPosition);

        this.visualGroup = new THREE.Group();
        this.group.add(this.visualGroup);

        this._buildMeshes();
        this._currentRoll = 0;

        // --- RAPIER RIGID BODY ---
        this._body = physicsWorld.createShipBody(SHIP.startPosition);

        // Scroll-based thrust level (replaces old speed variable)
        this._thrustLevel = SHIP.speed;

        this._velocity = new THREE.Vector3();
    }

    _buildMeshes() {
        buildShipMeshes(this.visualGroup);
    }

    get position() {
        return this.group.position;
    }

    get quaternion() {
        return this.group.quaternion;
    }

    /**
     * Called every frame BEFORE physicsWorld.step().
     * Handles rotation (unchanged from before) and applies
     * thrust as a Rapier impulse in the ship's forward direction.
     */
    update(input) {
        const { yaw, pitch, scroll } = input;

        // --- ROTATION ---
        const deltaEuler = new THREE.Euler(pitch, yaw, 0, 'XYZ');
        const deltaQuat = new THREE.Quaternion().setFromEuler(deltaEuler);
        this.group.quaternion.multiply(deltaQuat);
        this.group.quaternion.normalize();

        // Visual roll
        let targetRoll = yaw * 18;
        targetRoll = Math.max(-0.6, Math.min(0.6, targetRoll));
        this._currentRoll += (targetRoll - this._currentRoll) * 0.12;
        this.visualGroup.rotation.set(0, 0, this._currentRoll * 0.6);

        // --- THRUST LEVEL (scroll) ---
        if (scroll !== 0) {
            this._thrustLevel -= Math.sign(scroll) * SHIP.scrollAcceleration;
            this._thrustLevel = Math.max(
                SHIP.minSpeed,
                Math.min(SHIP.maxSpeed, this._thrustLevel)
            );
        }

        // --- MOZGÁS ---
        const forward = new THREE.Vector3(0, 0, -1)
            .applyQuaternion(this.group.quaternion);

        // A velocity-ből kivonjuk a forward komponenst,
        // megtartjuk csak a gravitációs sodródást
        const forwardSpeed = this._velocity.dot(forward);
        const gravityDrift = this._velocity.clone()
            .addScaledVector(forward, -forwardSpeed);

        // Forward sebesség = pontosan thrustLevel, nem halmozódik
        // Így a scroll azonnal hat mindkét irányban
        this._velocity.copy(gravityDrift)
            .addScaledVector(forward, this._thrustLevel);

        this.group.position.add(this._velocity);
    }
            
    applyGravityForce(force) {
        this._velocity.add(force);
    }

    /**
     * Called every frame AFTER physicsWorld.step().
     * Copies the Rapier RigidBody's position back to the Three.js group.
     * Rotation stays kvaternió-vezérelt (we don't read rotation from Rapier).
     */
    syncFromPhysics() {
        const pos = this._body.translation();
        this.group.position.set(pos.x, pos.y, pos.z);
    }

    getRigidBody() {
        return this._body;
    }
}