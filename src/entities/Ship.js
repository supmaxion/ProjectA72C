import * as THREE from 'three';

/**
 * The player ship.
 *
 * Rotation architecture (important, do not "simplify" without re-reading):
 *
 * - `this.group` is the ship's TRUE position and movement orientation.
 *   It only ever receives pitch and yaw, applied as small per-frame
 *   deltas in the ship's OWN local space (`quaternion.multiply`, not
 *   premultiply). There is no stored Euler state and no clamping, so
 *   this can never enter gimbal lock, and the ship can pitch through
 *   a full loop without restriction.
 *
 * - `this.visualGroup` is a child of `this.group` and holds only the
 *   visible meshes. ONLY this group receives roll (banking into
 *   turns), applied as a simple, smoothed rotation.z. This is purely
 *   cosmetic -- it never affects movement direction or the camera,
 *   which is exactly why the camera in core/camera.js can stay simple
 *   and stable: it reads `this.group.quaternion`, which is guaranteed
 *   roll-free.
 *
 * This split (movement orientation vs. visual orientation) is what
 * fixes the "world tilts instead of the ship" and "camera flips at
 * 90 degrees" issues that a naive single-quaternion approach runs
 * into.
 */
export class Ship {
    constructor() {
        this.group = new THREE.Group();
        this.group.position.set(0, 0, -10);

        this.visualGroup = new THREE.Group();
        this.group.add(this.visualGroup);

        this._buildMeshes();

        this.speed = 0.045;
        this._currentRoll = 0;
    }

    _buildMeshes() {
        // 1. HULL (a flat box)
        const hullGeometry = new THREE.BoxGeometry(0.6, 0.3, 1.5);
        const hullMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ccff,
            emissive: 0x004466,
            emissiveIntensity: 0.3,
        });
        const hull = new THREE.Mesh(hullGeometry, hullMaterial);
        hull.position.z = -0.2;
        this.visualGroup.add(hull);

        // 2. COCKPIT (a small sphere at the nose)
        const cockpitGeometry = new THREE.SphereGeometry(0.25, 8, 8);
        const cockpitMaterial = new THREE.MeshStandardMaterial({
            color: 0x88ddff,
            emissive: 0x224466,
            emissiveIntensity: 0.5,
        });
        const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
        cockpit.position.set(0, 0.1, -0.8);
        this.visualGroup.add(cockpit);

        // 3. RIGHT WING (a long box)
        const wingGeometry = new THREE.BoxGeometry(0.15, 0.05, 0.8);
        const wingMaterial = new THREE.MeshStandardMaterial({
            color: 0xff6644,
            emissive: 0x442211,
            emissiveIntensity: 0.2,
        });
        const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
        rightWing.position.set(0.8, 0, 0.2);
        this.visualGroup.add(rightWing);

        // 4. LEFT WING
        const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        leftWing.position.set(-0.8, 0, 0.2);
        this.visualGroup.add(leftWing);

        // 5. RIGHT WINGTIP (a small cube at the wing's end - emphasizes banking)
        const wingtipGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const wingtipMaterial = new THREE.MeshStandardMaterial({
            color: 0xff4444,
            emissive: 0x662222,
            emissiveIntensity: 0.5,
        });
        const rightWingtip = new THREE.Mesh(wingtipGeometry, wingtipMaterial);
        rightWingtip.position.set(1.2, 0, 0.2);
        this.visualGroup.add(rightWingtip);

        // 6. LEFT WINGTIP
        const leftWingtip = new THREE.Mesh(wingtipGeometry, wingtipMaterial);
        leftWingtip.position.set(-1.2, 0, 0.2);
        this.visualGroup.add(leftWingtip);

        // 7. TAIL (a small cylinder)
        const tailGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.5, 6);
        const tailMaterial = new THREE.MeshStandardMaterial({
            color: 0x006688,
            emissive: 0x002233,
            emissiveIntensity: 0.2,
        });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.rotation.x = Math.PI / 2;
        tail.position.set(0, 0, 1.0);
        this.visualGroup.add(tail);

        // 8. ENGINE (a small glowing light at the tail)
        const engineGeometry = new THREE.SphereGeometry(0.15, 6, 6);
        const engineMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 1.0,
        });
        const engine = new THREE.Mesh(engineGeometry, engineMaterial);
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
     * Advances the ship's rotation and position by one frame.
     *
     * @param {{ yaw: number, pitch: number }} input - raw per-frame
     *   rotation input (e.g. from MouseLook.consume()).
     */
    update(input) {
        const { yaw, pitch } = input;

        // --- TRUE movement orientation: pitch + yaw only, no roll ---
        const deltaEuler = new THREE.Euler(pitch, yaw, 0, 'XYZ');
        const deltaQuat = new THREE.Quaternion().setFromEuler(deltaEuler);
        this.group.quaternion.multiply(deltaQuat);
        this.group.quaternion.normalize();

        // --- Visual-only roll (banking), smoothed to avoid jitter ---
        // Raw per-frame mouse deltas are noisy; smoothing the roll
        // target (rather than deriving roll from a raw frame-to-frame
        // rate) avoids the shaking that a naive derivative produces.
        let targetRoll = yaw * 18;
        targetRoll = Math.max(-0.6, Math.min(0.6, targetRoll));
        this._currentRoll += (targetRoll - this._currentRoll) * 0.12;
        this.visualGroup.rotation.set(0, 0, this._currentRoll * 0.6);

        // --- Move forward along the ship's current facing direction ---
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.group.quaternion);
        this.group.position.addScaledVector(forward, this.speed);
    }
}
