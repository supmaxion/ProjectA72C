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
import { MiningSystem } from './physics/MiningSystem.js';
import { HitFlash } from './ui/HitFlash.js';
import { SfxManager } from './ui/SfxManager.js';

async function init() {
    // --- CORE ---
    const scene    = createScene();
    const camera   = createCamera();
    const renderer = createRenderer(camera);
    let hologramOn = false;
    const hud = new Hud({
        controls: [
            {
                id: 'bl-1',
                label: 'ORBIT',
                initial: false,
                onToggle: (state) => {
                    orbitLinesVisible = state;
                    systemManager.setOrbitLinesVisible(orbitLinesVisible);
                },
            },
            {
                id: 'bl-2',
                label: 'HOLO',
                initial: false,
                onToggle: (state) => {
					hologramOn = state;
                    ship.toggle();
                },
            },
        ],
    });
    
    const hitFlash = new HitFlash();
    let shakeTime = 0;
    const shakeDuration = 0.25;
    const shakeMagnitude = 6;
    const sfx = new SfxManager();
    
    const saveManager = new SaveManager();
    const savedState = saveManager.load();
    const systemManager = new SystemManager(scene);
	//~ systemManager.jumpTo('home');
	const jumpTransition = new JumpTransition();

    let cameraRollAngle = 0;
    let jumpCooldown = 0;
    let orbitLinesVisible = false;
    let shield = savedState?.shield ?? SHIP.shield.max;
    let shieldHitCooldown = 0;
    
    let suppressSaveOnUnload = false; //fejlesztői törléshez ctrl+shift+del
    
    // --- ENTITIES ---
    const ship = new Ship();
    
    // mentett állapot betöltése
	if (savedState) {
		systemManager.restoreFromSave(savedState);

		ship.position.fromArray(savedState.ship.position);
		ship.quaternion.fromArray(savedState.ship.quaternion);
		ship.speed = savedState.ship.speed;

		orbitLinesVisible = savedState.settings?.orbitLinesVisible ?? false;
        systemManager.setOrbitLinesVisible(orbitLinesVisible);
        hud.setControlState('bl-1', orbitLinesVisible);
        
		hologramOn = savedState.settings?.holoVisible ?? false;
        hud.setControlState('bl-2', hologramOn);
        if (hologramOn) ship.toggle();
        
	} else {
		systemManager.jumpTo('home');
	}
	
	let lastMinedMessage = null;
	let lastMinedMessageTime = 0;

	const inventory = savedState?.inventory ?? {};
	const miningSystem = new MiningSystem(scene, camera, inventory, {
		onAsteroidMined: (result) => {
			messages?.markDone('firstMining'); // opcionális, ha van ilyen üzenet-lépés
			lastMinedMessage = `+${result.amount} ${result.materialType.toUpperCase()}`;
			lastMinedMessageTime = performance.now();
		},
	});

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
    const deathSequence = new DeathSequence({
		onRestart: () => {
			//~ saveManager.clear(); // ne töltődjön be a halál-pozíció
		},
	});
    let isGameOver = false;

    const backgroundObjects = spawnBackgroundObjects(scene);

    //pislogás és hullám animáció
    let blinkShown = savedState?.settings?.blinkShown ?? false;
    let messages = null;
    if (GAME_START.blink) {
        if (!blinkShown) {
            new Blink({ delay: 500 });
            blinkShown = true;
        }
        messages = new MessageManager();
        messages.restoreShownState(savedState?.shownMessages ?? []);
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
        if (e.key === 'a' || e.key === 'A') {
			keyState.rollLeft = true;
			messages?.markDone('roll');
		}
        if (e.key === 'd' || e.key === 'D') {
			keyState.rollRight = true;
			messages?.markDone('roll');
		}

        if (e.key === 'Tab') {
            e.preventDefault();
            hud.cycleActiveBox(e.shiftKey ? -1 : 1);
            messages?.markDone('tabCycle');
        }
		if (e.code === 'Space') {
            e.preventDefault();
            hud.toggleActiveControl();
        }
        //fejlesztői local storage törlés
        if (e.ctrlKey && e.shiftKey && e.key === 'Delete') {
            e.preventDefault();
            suppressSaveOnUnload = true;
            saveManager.hardReset();
            window.location.reload();
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
        
        //aszteroida ütközés animáció
		if (shakeTime > 0) {
            shakeTime -= delta;
            const s = shakeMagnitude * Math.max(shakeTime / shakeDuration, 0);
            camera.position.x += (Math.random() - 0.5) * s;
            camera.position.y += (Math.random() - 0.5) * s;
            
            // todo Ha később hangeffektet is akarsz a találathoz (pl. Web Audio API-val egy rövid "clank"), az is könnyen bekapcsolható ugyanide — szólj, ha odáig eljutsz.
        }
        
		//*** HUD boxok frissítése
        const throttle = ((ship.speed - SHIP.minSpeed) / (SHIP.maxSpeed - SHIP.minSpeed)) * 100;
        hud.updateBox('tl-3', { value: `${throttle.toFixed(0)}% ${ship._thrustState}` });
        hud.updateBox('tc-1', { value: ship.speed.toFixed(2) });
        hud.updateBox('tc-3', { value: `${ship.heading.toFixed(0)}°` });
        hud.updateBox('tr-2', { value: `${Math.round(shield)}%` });
        const nearestPlanet = getNearestPlanetAltitude(ship.position, systemManager.current);
        if (nearestPlanet) {
            hud.updateBox('tc-2', { value: formatAltitude(nearestPlanet.altitude) });
        }
        const stationDist = ship.position.distanceTo(systemManager.current.station.position) - systemManager.current.station.radius;
        hud.updateBox('tl-1', { value: formatDistance(stationDist) });
		
		//bányászat
		miningSystem.update(delta, ship, systemManager.current.asteroidBelt);
		// Bányászat-státusz és inventory a status stripre
		const miningInfo = miningSystem.getProgressInfo();
		hud.updateStatusLine('center', miningInfo
			? `MINING ${((miningInfo.time / miningInfo.duration) * 100).toFixed(0)}%`
			: 'IDLE'
		);
		hud.updateInventoryLine(`REGOLIT: ${inventory.regolit ?? 0}`);
		// kibányászva:
		if (lastMinedMessage && performance.now() - lastMinedMessageTime < 3000) {
			hud.updateStatusLine('left', lastMinedMessage);
			RestApi('mined');
		} else {
			hud.updateStatusLine('left', '');
			lastMinedMessage = null;
		}
		//*** HUD boxok frissítése
		
		
        // Roll utólag, a végső camera quaternion-ra
        // cameraRollAngle += input.roll * SHIP.rollSpeed; // ez törölve lett
        const rollQuat = getCameraRollQuat(cameraRollAngle);
        camera.quaternion.multiply(rollQuat);

        // Counter: ship visualGroup-ban pontosan az inverze
        ship.counterRoll = +cameraRollAngle;
        

        backgroundObjects.forEach(obj => obj.update(delta, camera.position));
        milkyWay.update(camera.position);
        fog.update(camera.position);

		// Ütközésvizsgálat: bolygó/nap = azonnali halál, aszteroida = pajzs-sebzés
        if (shieldHitCooldown > 0) shieldHitCooldown -= delta;

        const bodyHit = checkShipCollision(ship.position, [...systemManager.current.getCollidableBodies(), sunCollider]);
        if (bodyHit) {
            triggerDeath();
        } else {
            const asteroidHit = systemManager.current.asteroidBelt.checkCollision(ship.position, SHIP.collisionRadius);
            if (asteroidHit && shieldHitCooldown <= 0) {
                shield = Math.max(0, shield - SHIP.shield.hitDamage);
                shieldHitCooldown = SHIP.shield.hitCooldown;
                
				hitFlash.flash();
				sfx.hit();
                shakeTime = shakeDuration;
                hud.flashBox('tr-2');
                
                if (shield <= 0) {
                    triggerDeath();
                }
            }
        }


		// Station megközelítése
		if (jumpCooldown > 0) {
			jumpCooldown -= delta; 
		}

        const station = systemManager.current.station;
		const distToStation = ship.position.distanceTo(station.position);

		if (jumpCooldown <= 0 && distToStation < station.radius * 0.8) {
			const nextSeed = station.destinationSeed;
			
			jumpTransition.show('JUMPING');
			
			RestApi('jump');
			
			systemManager.jumpTo(nextSeed);
			saveManager.save({ systemManager, ship, ...getSaveExtras() });
			
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
	
	
	function triggerDeath() {
        if (isGameOver) return; // ne fusson le kétszer
        isGameOver = true;

        // A halál pillanatában is mentsünk — inventory/systemState ne vesszen el —,
        // de a pozíciót biztonságos pontra írjuk (station mellé), és a pajzsot
        // teljes értékre állítjuk vissza, nehogy a következő induláskor 0-ról
        // kezdődjön (végtelen halál-ciklus).
        const safePosition = systemManager.current.station.position.clone()
            .add(new THREE.Vector3(0, 0, systemManager.current.station.radius * 3));

        saveManager.save({
            systemManager,
            ship: {
                position: safePosition,
                quaternion: ship.quaternion.clone(),
                speed: SHIP.speed,
            },
            ...getSaveExtras(),
            shield: SHIP.shield.max,
        });

		RestApi('death');
        deathSequence.trigger();
    }
    
	function getSaveExtras() {
        return {
            orbitLinesVisible,
            holoVisible: hologramOn,
            blinkShown,
            inventory,
            shownMessages: messages?.getShownState() ?? [],
            shield,
        };
    }
	
	//auto mentések
	setInterval(() => {
		if (isGameOver) return; // ne mentsen halott állapotot
		saveManager.save({ systemManager, ship, ...getSaveExtras() });
	}, 10000);
	// bezáráskor/frissítéskor:
	window.addEventListener('beforeunload', () => {
		if (isGameOver || suppressSaveOnUnload) return;//  gameover vagy fejlesztői törlés van, akkor ne mentsen
		saveManager.save({ systemManager, ship, ...getSaveExtras() });
	});
	
    RestApi('Indul');

}

init();
