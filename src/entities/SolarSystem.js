import * as THREE from 'three';
import { CelestialBody } from './CelestialBody.js';
import { createOrbitLine, DynamicTrail } from './OrbitTrail.js';
import { Comet, COMET_2 } from './Comet.js';
import { AsteroidField } from './AsteroidField.js';
import { SpaceStation } from './SpaceStation.js';
import { SOLAR_SYSTEM, COMET, ASTEROID_BELT, STATION } from '../config.js';

export class SolarSystem {
    constructor(scene) {
        this._scene    = scene;
        this._planets  = [];
        this._time     = 0;
        this._trails   = [];
        this._orbitLines = [];

        const sunPos = new THREE.Vector3(
            SOLAR_SYSTEM.sun.position.x,
            SOLAR_SYSTEM.sun.position.y,
            SOLAR_SYSTEM.sun.position.z,
        );

        //üstökösök
        this.comet = new Comet({
            ...COMET,
            orbitCenter: sunPos,
        });
        scene.add(this.comet.group);
        scene.add(this.comet.orbitLine);
        this.comet2 = new Comet({ ...COMET_2, orbitCenter: sunPos });
        scene.add(this.comet2.group);
        scene.add(this.comet2.orbitLine);

        //aszteroida öv
        this.asteroidBelt = new AsteroidField({ center: sunPos, ...ASTEROID_BELT });
        scene.add(this.asteroidBelt.group);

        //űrállomás
        this.station = new SpaceStation(STATION.position, STATION);
        scene.add(this.station.group);

        for (const bodyConfig of SOLAR_SYSTEM.bodies) {
            const planet = new CelestialBody({
                name:        bodyConfig.name,
                radius:      bodyConfig.radius,
                color:       bodyConfig.color,
                orbit:       bodyConfig.orbit,
                orbitCenter: sunPos,
            });

            scene.add(planet.group);

            const orbitLine = createOrbitLine(bodyConfig.orbit, sunPos, bodyConfig.color);
            scene.add(orbitLine);
            this._orbitLines.push(orbitLine);

            this._trails.push({
                trail: new DynamicTrail(scene, bodyConfig.color),
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
                    });

                    scene.add(moon.group);
                    planet.moons.push(moon);

                    this._trails.push({
                        trail: new DynamicTrail(scene, moonConfig.color),
                        body:  moon,
                    });
                }
            }

            this._planets.push(planet);
        }
    }

    update(cameraPosition) {
        this._time++;
        const now = performance.now() / 1000;

        for (const planet of this._planets) {
            planet.update(this._time, cameraPosition);
        }

        this.comet.update(this._time);
        this.comet2.update(this._time);
        this.asteroidBelt.update();
        this.station.update();
        for (const { trail, body } of this._trails) {
            trail.update(body.position, now);
        }
    }

    setOrbitLinesVisible(visible) {
        for (const line of this._orbitLines) {
            line.visible = visible;
        }
        this.comet.setOrbitLineVisible(visible);
        this.comet2.setOrbitLineVisible(visible);
    }

    getBodies() {
        return [...this._planets, this.comet, this.comet2, this.station];
    }
}