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
import { DUST_FIELD, GAME_START } from './config.js';
import { Blink } from './ui/Blink.js';
import { RippleOverlay } from './ui/RippleOverlay.js';
import { Hud } from './ui/Hud.js';

async function init() {
    // --- CORE ---
    const scene    = createScene();
    const camera   = createCamera();
    const renderer = createRenderer(camera);
    const hud = new Hud();
// hud.updateBox('tl-1', { label: 'SPEED', value: '0.4' });

    // --- ENTITIES ---
    const ship = new Ship();
    scene.add(ship.group);

    const { mesh, glow, light, ambientLight } = createSun();
    scene.add(mesh);
    scene.add(glow);
    scene.add(light);
    scene.add(light.target);
    scene.add(ambientLight);

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

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            hud.cycleActiveBox(e.shiftKey ? -1 : 1);
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

        //todo ezen miért kell framenként menni?
        backgroundObjects.forEach(obj => obj.update(delta, camera.position));

        renderer.render(scene, camera);
    }

    animate();

    //pislogás és hullám animáció
    if (GAME_START.blink) {
        const blink = new Blink({ delay: 500 });
        const rippleOverlay = new RippleOverlay();
        setTimeout(() => {
            rippleOverlay.ripple({ x: 70, y: 30, text: 'I should click' });
        }, 6000);
        setTimeout(() => {
            rippleOverlay.ripple({ x: 50, y: 30, text: 'I can use "esc"' });
        }, 16000);
    }

    console.log('🚀 Project-A72C started');
}

init();