import { createScene } from './core/scene.js';
import { createCamera, updateCameraFollow } from './core/camera.js';
import { createRenderer, clock } from './core/renderer.js';
import { Ship } from './entities/Ship.js';
import { createSun } from './entities/Sun.js';
import { createDustField } from './entities/DustField.js';
import { SolarSystem } from './entities/SolarSystem.js';
import { MouseLook } from './controls/MouseLook.js';
import { getOverlayElements } from './ui/overlay.js';
import { spawnBackgroundObjects } from './entities/BackgroundObject.js';
import { DUST_FIELD } from './config.js';

async function init() {
    // --- CORE ---
    const scene    = createScene();
    const camera   = createCamera();
    const renderer = createRenderer(camera);

    // --- ENTITIES ---
    const ship = new Ship();
    scene.add(ship.group);

    const { mesh, glow, light } = createSun();
    scene.add(mesh);
    scene.add(glow);
    scene.add(light);
    scene.add(light.target);

    const dustField = createDustField(DUST_FIELD);
    scene.add(dustField);

    const solarSystem = new SolarSystem(scene);

    const backgroundObjects = spawnBackgroundObjects(scene);

    // --- CONTROLS ---
    const { clickToStart } = getOverlayElements();
    const mouseLook = new MouseLook({
        clickToStartEl: clickToStart,
        domElement: renderer.domElement,
    });

    // --- TOGGLE ORBIT LINES ---
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

        ship.update(input);
        solarSystem.update();
        updateCameraFollow(camera, ship);

        backgroundObjects.forEach(obj => obj.update(delta, camera.position));

        renderer.render(scene, camera);
    }

    animate();
    console.log('🚀 Project-A72C started');
}

init();