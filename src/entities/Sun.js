import * as THREE from 'three';

/**
 * Creates the Sun: a glowing sphere combined with a real PointLight
 * positioned at the same place, so it actually illuminates the scene
 * (the planet, the ship) rather than being a purely decorative mesh.
 *
 * Returns a THREE.Group containing both the visible mesh and the
 * light, so moving/positioning the sun only requires repositioning
 * one object.
 */
export function createSun({
    position = new THREE.Vector3(-300, 150, -2000),
    radius = 80,
    color = 0xffddaa,
    lightIntensity = 2.5,
    lightDistance = 0, // 0 = no falloff limit
} = {}) {
    const group = new THREE.Group();
    group.position.copy(position);

    const sunGeometry = new THREE.SphereGeometry(radius, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({
        color,
    });
    const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
    group.add(sunMesh);

    // Soft outer glow, similar in spirit to the planet's glow shell.
    const glowGeometry = new THREE.SphereGeometry(radius * 1.15, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.25,
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    group.add(glowMesh);

    const light = new THREE.PointLight(color, lightIntensity, lightDistance);
    group.add(light);

    return group;
}
