import * as THREE from 'three';
import { CelestialBody } from './CelestialBody.js';
import { createOrbitLine, DynamicTrail } from './OrbitTrail.js';
import { SOLAR_SYSTEM } from '../config.js';

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

        for (const { trail, body } of this._trails) {
            trail.update(body.position, now);
        }
    }

    setOrbitLinesVisible(visible) {
        for (const line of this._orbitLines) {
            line.visible = visible;
        }
    }

    getBodies() {
        return this._planets;
    }
}