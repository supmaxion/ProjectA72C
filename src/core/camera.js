import * as THREE from 'three';
import { CAMERA } from './../config.js';

/**
 * Creates the main perspective camera with its initial position.
 */
export function createCamera() {
    const camera = new THREE.PerspectiveCamera(
        CAMERA.fov,
        window.innerWidth / window.innerHeight,
        CAMERA.near,
        CAMERA.far  // far plane: keep well beyond the star field spread
    );
    // camera.position.set(0, 3, 15);
    // camera.rotation.x = CAMERA.rotationX;
    // camera.lookAt(0, 0, 0);
    return camera;
}

// Local-space offset of the camera relative to the ship: a bit above,
// and behind it (the ship's forward is -Z, so a positive Z offset
// puts the camera behind it).
const CAMERA_OFFSET_LOCAL = CAMERA.offsetLocal;

/**
 * Updates the camera position and orientation to follow the ship.
 *
 * Deliberately does NOT use camera.lookAt(), because lookAt() builds
 * its orientation assuming a fixed world up-vector. When the look
 * direction becomes nearly parallel to that up-vector (i.e. the ship
 * pitches close to 90 degrees up or down), that computation becomes
 * singular and the camera snaps/flips -- a gimbal-lock-like artifact
 * in the camera itself, independent of the ship's own rotation.
 *
 * Instead, both the camera's position offset and its orientation are
 * derived directly from the ship's quaternion (which is itself
 * guaranteed gimbal-lock-free, see Ship.js). Since the camera should
 * look the same direction the ship is facing, its orientation is
 * simply a copy of the ship's quaternion -- no extra rotation needed.
 */
export function updateCameraFollow(camera, ship) {
    const offsetWorld = CAMERA_OFFSET_LOCAL.clone().applyQuaternion(ship.quaternion);

    camera.position.copy(ship.position).add(offsetWorld);
    camera.quaternion.copy(ship.quaternion);

    // plusz kamera pitch
    const pitchQuat = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(1, 0, 0),
        CAMERA.rotationX
    );

    camera.quaternion.multiply(pitchQuat);
}
