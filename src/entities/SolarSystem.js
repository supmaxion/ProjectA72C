import * as THREE from 'three';
import { CelestialBody } from './CelestialBody.js';
import { createOrbitLine, DynamicTrail } from './OrbitTrail.js';
import { Comet } from './Comet.js';
import { AsteroidField } from './AsteroidField.js';
import { SpaceStation } from './SpaceStation.js';
import { SYSTEM_VISIBILITY } from '../config.js';

export class SolarSystem {
    constructor(scene, systemConfig) {
        this._scene    = scene;
        this.seed      = systemConfig.seed;
        this._planets  = [];
        this._time     = 0;
        this._trails   = [];
        this._trailsVisible = true;
        this._orbitLines = [];
        this._orbitLinesVisible = true;

        // Minden ehhez a rendszerhez tartozó objektum egy közös root alá kerül,
        // így ugráskor egyetlen scene.add()/scene.remove() elég.
        this.root = new THREE.Group();
        scene.add(this.root);

        const sunPos = new THREE.Vector3(
            systemConfig.sun.position.x,
            systemConfig.sun.position.y,
            systemConfig.sun.position.z,
        );

        //üstökösök
        this.comet = new Comet({
            ...systemConfig.comet,
            orbitCenter: sunPos,
        });
        this.root.add(this.comet.group);
        this.root.add(this.comet.orbitLine);

        this.comet2 = new Comet({ ...systemConfig.comet2, orbitCenter: sunPos });
        this.root.add(this.comet2.group);
        this.root.add(this.comet2.orbitLine);

        //aszteroida öv
        this.asteroidBelt = new AsteroidField({
			center: sunPos,
			...systemConfig.asteroidBelt,
			seed: systemConfig.seed,
			beltId: 'main',
		});
        this.root.add(this.asteroidBelt.group);

        //űrállomás
        this.station = new SpaceStation(systemConfig.station.position, systemConfig.station);
        this.station.destinationSeed = systemConfig.station.destinationSeed;
        this.root.add(this.station.group);

        for (const bodyConfig of systemConfig.bodies) {
            const planet = new CelestialBody({
                name:        bodyConfig.name,
                radius:      bodyConfig.radius,
                color:       bodyConfig.color,
                orbit:       bodyConfig.orbit,
                orbitCenter: sunPos,
            });

            this.root.add(planet.group);

            const orbitLine = createOrbitLine(bodyConfig.orbit, sunPos, bodyConfig.color);
            this.root.add(orbitLine);
            this._orbitLines.push(orbitLine);

            this._trails.push({
                trail: new DynamicTrail(this.root, bodyConfig.color),
                body:  planet,
            });

            if (bodyConfig.moons) {
                for (const moonConfig of bodyConfig.moons) {
                    const moon = new CelestialBody({
                        name:        moonConfig.name,
                        radius:      moonConfig.radius,
                        color:       moonConfig.color,
                        orbit:       moonConfig.orbit,
                        orbitCenter: planet.position,
                        isMoon: true,
                    });

                    this.root.add(moon.group);
                    planet.moons.push(moon);

                    this._trails.push({
                        trail: new DynamicTrail(this.root, moonConfig.color),
                        body:  moon,
                    });
                }
            }

            this._planets.push(planet);
        }
    }

    // --- Ugráskor a SystemManager ezt hívja ---
    attach() {
        this._scene.add(this.root);
    }

    detach() {
        this._scene.remove(this.root);
    }

    update(cameraPosition) {
        this._time++;
        const now = performance.now() / 1000;

        for (let i = 0; i < this._planets.length; i++) {
            const planet = this._planets[i];
            planet.update(this._time, cameraPosition);

            if (this._orbitLines[i] && this._orbitLinesVisible) {
                const dist = planet.position.distanceTo(cameraPosition);
                this._orbitLines[i].visible = dist < SYSTEM_VISIBILITY.systemRevealDistance;
            }
        }

        for (const { trail, body } of this._trails) {
            trail.update(body.position, now);

            if (this._trailsVisible) {
                const dist = body.position.distanceTo(cameraPosition);
                trail.visible = dist < SYSTEM_VISIBILITY.systemRevealDistance;
            }
        }

        this.comet?.update(this._time);
        this.comet2?.update(this._time);

        this.asteroidBelt.update(cameraPosition);
        this.station.update(cameraPosition);
    }

    setOrbitLinesVisible(visible) {
        this._orbitLinesVisible = visible;
        if (!visible) {
            for (const line of this._orbitLines) {
                line.visible = false;
            }
        }
        this.comet?.setOrbitLineVisible(visible);
        this.comet2?.setOrbitLineVisible(visible);
    }

    setTrailLinesVisible(visible) {
        this._trailsVisible = visible;
        if (!visible) {
            for (const { trail } of this._trails) {
                trail.visible = false;
            }
        }
    }

    getBodies() {
        return [...this._planets, this.comet, this.comet2, this.station];
    }
    
    getCollidableBodies() {
		return [...this._planets, this.comet, this.comet2];
	}
}
