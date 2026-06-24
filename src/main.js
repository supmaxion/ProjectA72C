import { createScene } from './core/scene.js';
import { createCamera, updateCameraFollow } from './core/camera.js';
import { createRenderer } from './core/renderer.js';
import { Ship } from './entities/Ship.js';
import { createSun } from './entities/Sun.js';
import { createPlanet } from './entities/Planet.js';
import { createStarField } from './entities/StarField.js';
import { MouseLook } from './controls/MouseLook.js';
import { getOverlayElements } from './ui/overlay.js';

// --- SCENE / CAMERA / RENDERER ---
const scene = createScene();
const camera = createCamera();
const renderer = createRenderer(camera);

// --- ENTITIES ---
const ship = new Ship();
scene.add(ship.group);

const sun = createSun();
scene.add(sun);

const planet = createPlanet();
scene.add(planet);

const starField = createStarField();
scene.add(starField);

// --- CONTROLS ---
const { clickToStart } = getOverlayElements();
const mouseLook = new MouseLook({
    clickToStartEl: clickToStart,
    domElement: renderer.domElement,
});

// --- ANIMATION LOOP ---
function animate() {
    const input = mouseLook.consume();

    ship.update(input);
    updateCameraFollow(camera, ship);

    renderer.render(scene, camera);

    requestAnimationFrame(animate);
}

animate();

console.log('🚀 3D spaceship started (mouse capture, gimbal-lock-free rotation)!');
