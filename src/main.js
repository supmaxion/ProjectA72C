import * as THREE from 'three';
import { createScene } from './core/scene.js';
import { createCamera, updateCameraFollow, getCameraRollQuat } from './core/camera.js';
import { createRenderer, clock } from './core/renderer.js';
import { Ship } from './entities/Ship.js';
import { createSun } from './entities/Sun.js';
import { createDustField } from './entities/DustField.js';
import { MouseLook } from './controls/MouseLook.js';
import { getOverlayElements } from './ui/overlay.js';
import { spawnBackgroundObjects } from './entities/BackgroundObject.js';
import { DUST_FIELD, GAME_START, BACKGROUND_OBJECTS as CFG, SHIP, MOUSE_SENSITIVITY } from './config.js';
import { Blink } from './ui/Blink.js';
import { Hud } from './ui/Hud.js';
import { checkShipCollision } from './physics/CollisionSystem.js';
import { DeathSequence } from './ui/DeathSequence.js';
import { MilkyWayBandPoints } from './entities/MilkyWayBand.js';
// import { MilkyWayBandPanorama } from './entities/MilkyWayBand.js'; // ← váltáshoz kommenteld ki ezt és a fentit
import { NebulaFog } from './entities/NebulaFog.js';
import { MessageManager } from './ui/MessageManager.js';
import { RestApi } from './RestApi';
import { SystemManager } from './core/SystemManager.js';
import { JumpTransition } from './ui/JumpTransition.js';
import { SaveManager } from './core/SaveManager.js';

async function init() {
    // --- CORE ---
    const scene    = createScene();
    const camera   = createCamera();
    const renderer = createRenderer(camera);
    const hud = new Hud();
    const saveManager = new SaveManager();
    const savedState = saveManager.load();
    const systemManager = new SystemManager(scene);
	systemManager.jumpTo('home');
	const jumpTransition = new JumpTransition();

    let cameraRollAngle = 0;
    let jumpCooldown = 0;
    let orbitLinesVisible = false;
    
    // --- ENTITIES ---
    const ship = new Ship();
    
	if (savedState) {
		systemManager.restoreFromSave(savedState);

		ship.position.fromArray(savedState.ship.position);
		ship.quaternion.fromArray(savedState.ship.quaternion);
		ship.speed = savedState.ship.speed;

		orbitLinesVisible = savedState.settings?.orbitLinesVisible ?? false;
		systemManager.setOrbitLinesVisible(orbitLinesVisible);
	} else {
		systemManager.jumpTo('home');
	}


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

    
    // --- DEATH SEQUENCE ---
    const deathSequence = new DeathSequence();
    let isGameOver = false;

    const backgroundObjects = spawnBackgroundObjects(scene);

    //pislogás és hullám animáció
    let messages = null;
    if (GAME_START.blink) {
        new Blink({ delay: 500 });
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
    systemManager.current.setOrbitLinesVisible(orbitLinesVisible);
    window.addEventListener('keydown', (e) => {
        if (e.key === 't' || e.key === 'T') {
            orbitLinesVisible = !orbitLinesVisible;
            systemManager.setOrbitLinesVisible(orbitLinesVisible);
        }
        if (e.key === 'a' || e.key === 'A') keyState.rollLeft = true;
        if (e.key === 'd' || e.key === 'D') keyState.rollRight = true;

        if (e.key === 'Tab') {
            e.preventDefault();
            hud.cycleActiveBox(e.shiftKey ? -1 : 1);
            messages?.markDone('tabCycle');
        }
        if (e.key === 'Enter') {
            ship.toggle();
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.key === 'a' || e.key === 'A') keyState.rollLeft = false;
        if (e.key === 'd' || e.key === 'D') keyState.rollRight = false;
    });
    
    function getNearestPlanetAltitude(shipPosition, solarSystem) {
		let nearest = null;
		let minAlt = Infinity;

		for (const body of solarSystem.getBodies()) {
			const alt = shipPosition.distanceTo(body.position) - body.radius;
			if (alt < minAlt) {
				minAlt = alt;
				nearest = body;
			}
		}
		return nearest ? { name: nearest.name, altitude: minAlt } : null;
	}


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
        systemManager.current.update(camera.position);
        updateCameraFollow(camera, ship);

		// HUD boxok frissítése
		const throttle = ((ship.speed - SHIP.minSpeed) / (SHIP.maxSpeed - SHIP.minSpeed)) * 100;
		hud.updateBox('bl-3', { value: `${throttle.toFixed(0)}% ${ship._thrustState}` });
		hud.updateBox('bc-1', { value: ship.speed.toFixed(2) });
		hud.updateBox('bc-3', { value: `${ship.heading.toFixed(0)}°` });
		const nearestPlanet = getNearestPlanetAltitude(ship.position, systemManager.current);
		if (nearestPlanet) {
			hud.updateBox('bc-2', { value: formatAltitude(nearestPlanet.altitude) });
		}
		const stationDist = ship.position.distanceTo(systemManager.current.station.position) - systemManager.current.station.radius;
		hud.updateBox('tc-2', { value: formatDistance(stationDist) });
		
        // Roll utólag, a végső camera quaternion-ra
        // cameraRollAngle += input.roll * SHIP.rollSpeed; // ez törölve lett
        const rollQuat = getCameraRollQuat(cameraRollAngle);
        camera.quaternion.multiply(rollQuat);

        // Counter: ship visualGroup-ban pontosan az inverze
        ship.counterRoll = +cameraRollAngle;
        

        backgroundObjects.forEach(obj => obj.update(delta, camera.position));
        milkyWay.update(camera.position);
        fog.update(camera.position);

        // Ütközésvizsgálat a hajó és a bolygók/holdak között
        const asteroidHit = systemManager.current.asteroidBelt.checkCollision(ship.position);
        const hitBody = asteroidHit || checkShipCollision(ship.position, [...systemManager.current.getCollidableBodies(), sunCollider]);
        if (hitBody) {
            isGameOver = true;
            deathSequence.trigger();
        }

		// Station megközelítése
		if (jumpCooldown > 0) {
			jumpCooldown -= delta; 
		}

        const station = systemManager.current.station;
		const distToStation = ship.position.distanceTo(station.position);

		if (jumpCooldown <= 0 && distToStation < station.radius * 1.5) {
			const nextSeed = station.destinationSeed;
			
			jumpTransition.show('JUMPING');
			
			systemManager.jumpTo(nextSeed);
			saveManager.save({ systemManager, ship, orbitLinesVisible });
			
			// hajó pozicionálása az új rendszer station-je mellé
			const newStation = systemManager.current.station;
			ship.position.copy(newStation.position).add(new THREE.Vector3(0, 0, newStation.radius * 3));
			
			jumpCooldown = 3; // másodperc
			setTimeout(() => jumpTransition.hide(), 800); // az overlay 0.8 mp-ig látszik

		}


        renderer.render(scene, camera);
    }

    animate();

	function formatAltitude(alt) {
		if (alt < 0) return 'CONTACT';
		if (alt < 1000) return alt.toFixed(0);
		return `${(alt / 1000).toFixed(1)}k`;
	}
	
	function formatDistance(dist) {
		if (dist < 0) return 'CONTACT';
		if (dist < 1000) return dist.toFixed(0);
		return `${(dist / 1000).toFixed(1)}k`;
	}
	
	//auto mentések
	setInterval(() => {
		saveManager.save({ systemManager, ship, orbitLinesVisible });
	}, 10000);
	// bezáráskor/frissítéskor:
	window.addEventListener('beforeunload', () => {
		saveManager.save({ systemManager, ship, orbitLinesVisible });
	});
	
    RestApi('Indul');

}

init();
