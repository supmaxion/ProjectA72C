import * as THREE from 'three';

/**
 * Creates a static field of distant background stars as a THREE.Points
 * cloud. Deliberately static (no rotation applied anywhere) -- these
 * represent a far-away backdrop, not nearby objects the ship is
 * moving relative to. Asteroids (which DO need to be nearby, moving,
 * collidable objects) are a separate, future entity.
 */
export function createStarField({
    count = 3000,
    spread = 600,
    centerZ = -100,
} = {}) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * spread;
        positions[i + 1] = (Math.random() - 0.5) * spread;
        positions[i + 2] = (Math.random() - 0.5) * spread + centerZ;

        const colorVal = 0.5 + Math.random() * 0.5;
        colors[i] = colorVal * (0.8 + Math.random() * 0.2);
        colors[i + 1] = colorVal * (0.7 + Math.random() * 0.3);
        colors[i + 2] = colorVal * (0.6 + Math.random() * 0.4);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.5,
        transparent: true,
        opacity: 0.8,
        vertexColors: true,
    });

    return new THREE.Points(geometry, material);
}
