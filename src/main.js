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
import { DUST_FIELD, GAME_START, BACKGROUND_OBJECTS as CFG } from './config.js';
import { Blink } from './ui/Blink.js';
import { RippleOverlay } from './ui/RippleOverlay.js';
import { Hud } from './ui/Hud.js';
import { checkShipCollision } from './physics/CollisionSystem.js';
import { DeathSequence } from './ui/DeathSequence.js';
import { MilkyWayBandPoints } from './entities/MilkyWayBand.js';
// import { MilkyWayBandPanorama } from './entities/MilkyWayBand.js'; // ← váltáshoz kommenteld ki ezt és a fentit
import { NebulaFog } from './entities/NebulaFog.js';
import { MessageManager } from './ui/MessageManager.js';

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

    const { mesh, glow, light, ambientLight, collider: sunCollider } = createSun();
    scene.add(mesh);
    scene.add(glow);
    scene.add(light);
    scene.add(light.target);
    scene.add(ambientLight);

    const dustField = createDustField(DUST_FIELD);
    scene.add(dustField);

    const milkyWay = new MilkyWayBandPoints(scene);
    // const milkyWay = new MilkyWayBandPanorama(scene);

    const fog = new NebulaFog(scene, CFG.skyDistance, '#1a1030');

    const solarSystem = new SolarSystem(scene);
    
    // --- DEATH SEQUENCE ---
    const deathSequence = new DeathSequence();
    let isGameOver = false;

    const backgroundObjects = spawnBackgroundObjects(scene);


    //pislogás és hullám animáció
    let messages = null;
    if (GAME_START.blink) {
        const blink = new Blink({ delay: 500 });
        messages = new MessageManager();
        messages.start();
    }
    // --- CONTROLS ---
    const { clickToStart } = getOverlayElements();
    const mouseLook = new MouseLook({
        clickToStartEl: clickToStart,
        domElement: renderer.domElement,
            onAction: (action) => {
        messages?.markDone(action);
    },
    });

    // --- TOGGLE ORBIT LINES ---
    let orbitLinesVisible = false;
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
            messages?.markDone('tabCycle');
        }
    });

    // --- GAME LOOP ---
    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();

        if (isGameOver) {
            renderer.render(scene, camera);
            return;
        }

        const input = mouseLook.consume();

        ship.update(input);
        solarSystem.update(camera.position);
        updateCameraFollow(camera, ship);

        backgroundObjects.forEach(obj => obj.update(delta, camera.position));
        milkyWay.update(camera.position);
        fog.update(camera.position);

        // Ütközésvizsgálat a hajó és a bolygók/holdak között
        const asteroidHit = solarSystem.asteroidBelt.checkCollision(ship.position);
        const hitBody = asteroidHit || checkShipCollision(ship.position, [...solarSystem.getBodies(), sunCollider]);
        if (hitBody) {
            isGameOver = true;
            deathSequence.trigger();
        }

        renderer.render(scene, camera);
    }

    animate();


}

init();