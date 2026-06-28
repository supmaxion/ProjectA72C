import { createScene } from './core/scene.js';
import { createCamera, updateCameraFollow } from './core/camera.js';
import { createRenderer, clock } from './core/renderer.js';
import { Ship } from './entities/Ship.js';
import { createSun } from './entities/Sun.js';
import { createDustField } from './entities/DustField.js';
import { SolarSystem } from './entities/SolarSystem.js';
import { MouseLook } from './controls/MouseLook.js';
import { getOverlayElements } from './ui/overlay.js';
import { SUN, DUST_FIELD } from './config.js';
import { spawnBackgroundObjects } from './entities/BackgroundObject.js';
import { createPlanet } from './entities/Planet.js';
import { createStarField } from './entities/StarField.js';
import { MouseLook } from './controls/MouseLook.js';
import { getOverlayElements } from './ui/overlay.js';
import { SUN, PLANET, STAR_FIELD } from './config.js';

// --- SCENE / CAMERA / RENDERER ---
const scene = createScene();
const camera = createCamera();
const renderer = createRenderer(camera);

// --- ENTITIES ---
const ship = new Ship();
scene.add(ship.group);

const { sprite: sunSprite, light: sunLight } = createSun(SUN);
scene.add(sunSprite);
scene.add(sunLight);
scene.add(sunLight.target);

const planet = createPlanet(PLANET);
scene.add(planet);

    const { mesh, glow, light } = createSun();
    scene.add(mesh);
    scene.add(glow);
    scene.add(light);
    scene.add(light.target); // DirectionalLight target kell a scene-be

    const dustField = createDustField(DUST_FIELD);
    scene.add(dustField);
const starField = createStarField(STAR_FIELD);
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

    const backgroundObjects = spawnBackgroundObjects(scene);

    // --- CONTROLS ---
    const { clickToStart } = getOverlayElements();
    const mouseLook = new MouseLook({
        clickToStartEl: clickToStart,
        domElement: renderer.domElement,
    });

    // --- toggle orbit lines ---
    let orbitLinesVisible = true;
    solarSystem.setOrbitLinesVisible(orbitLinesVisible);
    window.addEventListener('keydown', (e) => {
        if (e.key === 't' || e.key === 'T') {
            orbitLinesVisible = !orbitLinesVisible;
            solarSystem.setOrbitLinesVisible(orbitLinesVisible);
        }
    });
    

    // --- GAME LOOP ---
    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const input = mouseLook.consume();

        // 1. Ship rotation + thrust impulse → Rapier
        ship.update(input);

        // 2. Gravity from all celestial bodies → Rapier
        gravitySystem.applyTo(ship.getRigidBody());

        // 3. Advance planetary orbits
        solarSystem.update();

        // 4. Rapier physics step
        physicsWorld.step();

        // 5. Sync Three.js position from Rapier
        // ship.syncFromPhysics();

        // 6. Camera follow
        updateCameraFollow(camera, ship);

        
        backgroundObjects.forEach(obj => obj.update(delta, camera.position));

        renderer.render(scene, camera);
    }

    animate();
    console.log('🚀 Project-A72C started');
    ship.update(input);
    updateCameraFollow(camera, ship);

    renderer.render(scene, camera);

    requestAnimationFrame(animate);
}

animate();

console.log('🚀 3D spaceship started (mouse capture, gimbal-lock-free rotation)!');
