import * as THREE from 'three';

/**
 * The Sun as a background billboard: a THREE.Sprite that always faces
 * the camera automatically, so it looks like a flat disc on the
 * backdrop regardless of where the ship flies. No geometry to
 * navigate around, no far-plane issues.
 *
 * The light is a DirectionalLight positioned in the sun's direction
 * (not at the sprite itself, which could be close to the camera) so
 * it illuminates the planet and ship convincingly from the right angle.
 *
 * Returns { sprite, light } so main.js can add both to the scene
 * independently (the sprite goes into the scene normally; the light
 * does too, but keeping them separate makes it easy to adjust each).
 */
export function createSun({
    // Direction from the origin toward the sun (will be normalized).
    // The sprite is placed along this direction at `distance` units.
    direction = new THREE.Vector3(-0.4, 0.25, -1).normalize(),
    distance = 800,
    size = 120,          // visual radius of the sprite in world units
    color = 0xffddaa,
    lightIntensity = 2.0,
} = {}) {

    // --- SPRITE (billboard disc) ---
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Soft radial gradient: bright white core fading to the sun color
    // and then to transparent at the edges for a natural glow look.
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0.0, 'rgba(255, 255, 220, 1.0)');  // white-hot core
    gradient.addColorStop(0.3, 'rgba(255, 220, 100, 0.9)');  // yellow
    gradient.addColorStop(0.6, 'rgba(255, 160, 40,  0.5)');  // orange
    gradient.addColorStop(1.0, 'rgba(255, 100, 0,   0.0)');  // transparent edge

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(128, 128, 128, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        color,
        transparent: true,
        depthWrite: false,   // always render behind everything else
        blending: THREE.AdditiveBlending,
    });

    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.copy(direction.clone().multiplyScalar(distance));
    sprite.scale.set(size, size, 1);

    // --- DIRECTIONAL LIGHT from the sun's direction ---
    const light = new THREE.DirectionalLight(color, lightIntensity);
    light.position.copy(direction);   // DirectionalLight uses position as direction
    light.target.position.set(0, 0, 0);

    return { sprite, light };
}
