import * as THREE from 'three';

/**
 * Creates and returns the main scene with its background color.
 * Lighting is added separately by each entity that needs it
 * (e.g. the Sun adds its own PointLight), plus a small amount
 * of ambient light here so nothing is ever fully black.
 */
export function createScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);

    const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
    scene.add(ambientLight);

    return scene;
}
