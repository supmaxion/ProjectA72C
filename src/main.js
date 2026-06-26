import { createScene } from './core/scene.js';
import { createCamera, updateCameraFollow } from './core/camera.js';
import { createRenderer, clock } from './core/renderer.js';
import { Ship } from './entities/Ship.js';
import { createSun } from './entities/Sun.js';
import { createDustField } from './entities/DustField.js';
import { SolarSystem } from './entities/SolarSystem.js';
import { PhysicsWorld } from './physics/PhysicsWorld.js';
import { GravitySystem } from './physics/GravitySystem.js';
import { MouseLook } from './controls/MouseLook.js';
import { getOverlayElements } from './ui/overlay.js';
import { SUN, DUST_FIELD } from './config.js';
import { spawnBackgroundObjects } from './entities/BackgroundObject.js';

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

    const { mesh, glow, light } = createSun();
    scene.add(mesh);
    scene.add(glow);
    scene.add(light);
    scene.add(light.target); // DirectionalLight target kell a scene-be

    const dustField = createDustField(DUST_FIELD);
    scene.add(dustField);

    // SolarSystem builds all planets + moons, registers gravity attractors
    const solarSystem = new SolarSystem(scene, physicsWorld, gravitySystem);

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

        
        backgroundObjects.forEach(obj => obj.update(delta));

        gravitySystem.applyToVelocity(ship);  // ← ez, nem applyTo()
        // gravitySystem.applyTo(ship.getRigidBody());  ← kommenteld ki
        
        
        renderer.render(scene, camera);
    }

    animate();
    console.log('🚀 Project-A72C started');
}

init().catch(console.error);