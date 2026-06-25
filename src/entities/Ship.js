import * as THREE from 'three';
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
    }

    _buildMeshes() {
        const hullGeo = new THREE.BoxGeometry(0.6, 0.3, 1.5);
        const hullMat = new THREE.MeshStandardMaterial({
            color: 0x00ccff,
            emissive: 0x004466,
            emissiveIntensity: 0.3,
        });
        const hull = new THREE.Mesh(hullGeo, hullMat);
        hull.position.z = -0.2;
        this.visualGroup.add(hull);

        const cockpitGeo = new THREE.SphereGeometry(0.25, 8, 8);
        const cockpitMat = new THREE.MeshStandardMaterial({
            color: 0x88ddff,
            emissive: 0x224466,
            emissiveIntensity: 0.5,
        });
        const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
        cockpit.position.set(0, 0.1, -0.8);
        this.visualGroup.add(cockpit);

        const wingGeo = new THREE.BoxGeometry(0.15, 0.05, 0.8);
        const wingMat = new THREE.MeshStandardMaterial({
            color: 0xff6644,
            emissive: 0x442211,
            emissiveIntensity: 0.2,
        });
        const rightWing = new THREE.Mesh(wingGeo, wingMat);
        rightWing.position.set(0.8, 0, 0.2);
        this.visualGroup.add(rightWing);

        const leftWing = new THREE.Mesh(wingGeo, wingMat);
        leftWing.position.set(-0.8, 0, 0.2);
        this.visualGroup.add(leftWing);

        const wingtipGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const wingtipMat = new THREE.MeshStandardMaterial({
            color: 0xff4444,
            emissive: 0x662222,
            emissiveIntensity: 0.5,
        });
        const rightTip = new THREE.Mesh(wingtipGeo, wingtipMat);
        rightTip.position.set(1.2, 0, 0.2);
        this.visualGroup.add(rightTip);

        const leftTip = new THREE.Mesh(wingtipGeo, wingtipMat);
        leftTip.position.set(-1.2, 0, 0.2);
        this.visualGroup.add(leftTip);

        const tailGeo = new THREE.CylinderGeometry(0.2, 0.3, 0.5, 6);
        const tailMat = new THREE.MeshStandardMaterial({
            color: 0x006688,
            emissive: 0x002233,
            emissiveIntensity: 0.2,
        });
        const tail = new THREE.Mesh(tailGeo, tailMat);
        tail.rotation.x = Math.PI / 2;
        tail.position.set(0, 0, 1.0);
        this.visualGroup.add(tail);

        const engineGeo = new THREE.SphereGeometry(0.15, 6, 6);
        const engineMat = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 1.0,
        });
        const engine = new THREE.Mesh(engineGeo, engineMat);
        engine.position.set(0, 0, 1.3);
        this.visualGroup.add(engine);
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

        // --- ROTATION: unchanged, kvaternió-delta alapú ---
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

        // --- THRUST IMPULSE in the ship's forward direction ---
        const forward = new THREE.Vector3(0, 0, -1)
            .applyQuaternion(this.group.quaternion);

        const thrust = forward.multiplyScalar(
            this._thrustLevel * SHIP.thrustForce
        );

        this._body.applyImpulse(
            { x: thrust.x, y: thrust.y, z: thrust.z },
            true
        );
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