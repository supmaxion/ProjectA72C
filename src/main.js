import { createScene } from './core/scene.js';
import { createCamera, updateCameraFollow, getCameraRollQuat } from './core/camera.js';
import { createRenderer, clock } from './core/renderer.js';
import { Ship } from './entities/Ship.js';
import { createSun } from './entities/Sun.js';
import { createDustField } from './entities/DustField.js';
import { SolarSystem } from './entities/SolarSystem.js';
import { MouseLook } from './controls/MouseLook.js';
import { getOverlayElements } from './ui/overlay.js';
import { spawnBackgroundObjects } from './entities/BackgroundObject.js';
import { DUST_FIELD, GAME_START, BACKGROUND_OBJECTS as CFG, SHIP, MOUSE_SENSITIVITY } from './config.js';
import { Blink } from './ui/Blink.js';
import { RippleOverlay } from './ui/RippleOverlay.js';
import { Hud } from './ui/Hud.js';
import { checkShipCollision } from './physics/CollisionSystem.js';
import { DeathSequence } from './ui/DeathSequence.js';
import { MilkyWayBandPoints } from './entities/MilkyWayBand.js';
// import { MilkyWayBandPanorama } from './entities/MilkyWayBand.js'; // ← váltáshoz kommenteld ki ezt és a fentit
import { NebulaFog } from './entities/NebulaFog.js';
import { MessageManager } from './ui/MessageManager.js';
import { RestApi } from './RestApi';
import { HologramViewer } from './ui/HologramViewer.js';

async function init() {
    // --- CORE ---
    const scene    = createScene();
    const camera   = createCamera();
    const renderer = createRenderer(camera);
    const hud = new Hud();
// hud.updateBox('tl-1', { label: 'SPEED', value: '0.4' });

    const hologram = new HologramViewer();
    const HOLOGRAM_BOX_ID = 'tc-2'; // melyik dobozban jelenjen meg a hologram

    let cameraRollAngle = 0;

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
        sensitivity: MOUSE_SENSITIVITY.value,
        clickToStartEl: clickToStart,
        domElement: renderer.domElement,
            onAction: (action) => {
        messages?.markDone(action);
    },
    });

    //rolling state for ship rotation
    const keyState = { rollLeft: false, rollRight: false };

    // --- TOGGLE ORBIT LINES ---
    let orbitLinesVisible = false;
    solarSystem.setOrbitLinesVisible(orbitLinesVisible);
    window.addEventListener('keydown', (e) => {
        if (e.key === 't' || e.key === 'T') {
            orbitLinesVisible = !orbitLinesVisible;
            solarSystem.setOrbitLinesVisible(orbitLinesVisible);
        }
        if (e.key === 'a' || e.key === 'A') keyState.rollLeft = true;
        if (e.key === 'd' || e.key === 'D') keyState.rollRight = true;

        if (e.key === 'Tab') {
            e.preventDefault();
            hud.cycleActiveBox(e.shiftKey ? -1 : 1);
            messages?.markDone('tabCycle');
        }
        if (e.key === 'Enter') {
            const rect = hud.getGameWindowRect();
            const clipPath = hud.getGameWindowClipPath();
            if (rect) hologram.toggle(rect, clipPath);
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.key === 'a' || e.key === 'A') keyState.rollLeft = false;
        if (e.key === 'd' || e.key === 'D') keyState.rollRight = false;
    });

    window.addEventListener('resize', () => {
        if (hologram.isVisible()) {
            const rect = hud.getBoxScreenRect(HOLOGRAM_BOX_ID);
            if (rect) hologram._resize(rect);
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
        input.roll = (keyState.rollLeft ? 1 : 0) - (keyState.rollRight ? 1 : 0);

        input.cameraRoll = cameraRollAngle;

        cameraRollAngle += input.roll * SHIP.rollSpeed;
        ship.update(input);
        solarSystem.update(camera.position);
        updateCameraFollow(camera, ship);

        // Roll utólag, a végső camera quaternion-ra
        cameraRollAngle += input.roll * SHIP.rollSpeed;
        const rollQuat = getCameraRollQuat(cameraRollAngle);
        camera.quaternion.multiply(rollQuat);

        // Counter: ship visualGroup-ban pontosan az inverze
        ship.counterRoll = +cameraRollAngle;
        

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

    RestApi('Indul');

}

init();