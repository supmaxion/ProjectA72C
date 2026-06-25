import { createScene } from './core/scene.js';
import { createCamera, updateCameraFollow } from './core/camera.js';
import { createRenderer } from './core/renderer.js';
import { Ship } from './entities/Ship.js';
import { createSun } from './entities/Sun.js';
import { createStarField } from './entities/StarField.js';
import { SolarSystem } from './entities/SolarSystem.js';
import { PhysicsWorld } from './physics/PhysicsWorld.js';
import { GravitySystem } from './physics/GravitySystem.js';
import { MouseLook } from './controls/MouseLook.js';
import { getOverlayElements } from './ui/overlay.js';
import { SUN, STAR_FIELD } from './config.js';

async function init() {
    // --- CORE ---
    const scene = createScene();
    const camera = createCamera();
    const renderer = createRenderer(camera);

    // --- PHYSICS (must init before any entity that needs it) ---
    const physicsWorld = new PhysicsWorld();
    await physicsWorld.init();

    const gravitySystem = new GravitySystem(physicsWorld);

    // --- ENTITIES ---
    const ship = new Ship(physicsWorld);
    scene.add(ship.group);

    const { sprite: sunSprite, light: sunLight } = createSun(SUN);
    scene.add(sunSprite);
    scene.add(sunLight);
    scene.add(sunLight.target);

    const starField = createStarField(STAR_FIELD);
    scene.add(starField);

    // SolarSystem builds all planets + moons, registers gravity attractors
    const solarSystem = new SolarSystem(scene, physicsWorld, gravitySystem);

    // --- CONTROLS ---
    const { clickToStart } = getOverlayElements();
    const mouseLook = new MouseLook({
        clickToStartEl: clickToStart,
        domElement: renderer.domElement,
    });

    // --- GAME LOOP ---
    function animate() {
        requestAnimationFrame(animate);

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
        ship.syncFromPhysics();

        // 6. Camera follow
        updateCameraFollow(camera, ship);

        // 7. Render
        renderer.render(scene, camera);
    }

    animate();
    console.log('🚀 Project-A72C started');
}

init().catch(console.error);