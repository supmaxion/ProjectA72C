import * as THREE from 'three';
import { SUN } from './../config.js';

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
    direction = SUN.direction,
    distance = SUN.distance,
    size = SUN.size,
    color = SUN.color,
    lightIntensity = SUN.lightIntensity,
} = {}) {

    // --- SPRITE (billboard disc) ---
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = canvas.width / 2;

    // Soft radial gradient: bright white core fading to the sun color
    // and then to transparent at the edges for a natural glow look.
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    gradient.addColorStop(0.0, 'rgba(255, 255, 220, 1.0)');  // white-hot core
    gradient.addColorStop(0.9, 'rgba(255, 220, 100, 0.9)');  // yellow
    gradient.addColorStop(0.9, 'rgba(255, 160, 40,  2.9)');  // orange
    gradient.addColorStop(1.0, 'rgba(255, 100, 0,   0.0)');  // transparent edge

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
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
