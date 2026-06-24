import * as THREE from 'three';

/**
 * Creates the target planet: a solid sphere plus a slightly larger,
 * transparent wireframe shell for a soft glow effect.
 *
 * Returns a THREE.Group so the planet and its glow always move
 * together as one unit.
 */
export function createPlanet({
    position = new THREE.Vector3(5, 0, -1100),
    radius = 200,
    color = 0x44dd88,
} = {}) {
    const group = new THREE.Group();
    group.position.copy(position);

    const planetGeometry = new THREE.SphereGeometry(radius, 32, 32);
    const planetMaterial = new THREE.MeshStandardMaterial({
        color,
        emissive: 0x224422,
        emissiveIntensity: 0.3,
    });
    const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
    group.add(planetMesh);

    const glowGeometry = new THREE.SphereGeometry(radius * 1.05, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.15,
        wireframe: true,
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    group.add(glowMesh);

    return group;
}
