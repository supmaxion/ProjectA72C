import * as THREE from 'three';

/**
 * Creates the WebGLRenderer, attaches it to the DOM, and wires up
 * automatic resizing for both the renderer and the given camera.
 */
export function createRenderer(camera) {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return renderer;
}


export const clock = new THREE.Clock();
