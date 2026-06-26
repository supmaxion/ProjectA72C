import * as THREE from 'three';
import { CelestialBody } from './CelestialBody.js';
import { createOrbitLine, DynamicTrail } from './OrbitTrail.js'; // ← ÚJ
import { SOLAR_SYSTEM, GRAVITY } from '../config.js';

export class SolarSystem {
    constructor(scene, physicsWorld, gravitySystem) {
        this._scene = scene;
        this._planets = [];
        this._time = 0;
        this._trails = []; // ← ÚJ: minden trail (bolygó + hold)
        this._orbitLines = []; // ← ÚJ: csak bolygók ellipszise

        const sunPos = new THREE.Vector3(
            SOLAR_SYSTEM.sun.position.x,
            SOLAR_SYSTEM.sun.position.y,
            SOLAR_SYSTEM.sun.position.z,
        );
        gravitySystem.addBody(sunPos, SOLAR_SYSTEM.sun.mass);

        for (const bodyConfig of SOLAR_SYSTEM.bodies) {
            const planet = new CelestialBody({
                name: bodyConfig.name,
                mass: bodyConfig.mass,
                radius: bodyConfig.radius,
                color: bodyConfig.color,
                orbit: bodyConfig.orbit,
                orbitCenter: sunPos,
                physicsWorld,
                gravitySystem,
            });

            scene.add(planet.group);

            // ← ÚJ: statikus orbit ellipszis
            const orbitLine = createOrbitLine(bodyConfig.orbit, sunPos, bodyConfig.color);
            scene.add(orbitLine);
            this._orbitLines.push(orbitLine);

            // ← ÚJ: dinamikus trail a bolygónak
            this._trails.push({
                trail: new DynamicTrail(scene, bodyConfig.color),
                body: planet,
            });

            if (bodyConfig.moons) {
                for (const moonConfig of bodyConfig.moons) {
                    const moon = new CelestialBody({
                        name: moonConfig.name,
                        mass: moonConfig.mass,
                        radius: moonConfig.radius,
                        color: moonConfig.color,
                        orbit: moonConfig.orbit,
                        orbitCenter: planet.position,
                        physicsWorld,
                        gravitySystem,
                    });

                    scene.add(moon.group);
                    planet.moons.push(moon);

                    // ← ÚJ: dinamikus trail a holdnak (ellipszis nélkül)
                    this._trails.push({
                        trail: new DynamicTrail(scene, moonConfig.color),
                        body: moon,
                    });
                }
            }

            this._planets.push(planet);
        }
    }

    update() {
        this._time++;
        const now = performance.now() / 1000;

        for (const planet of this._planets) {
            planet.update(this._time);
        }

        // ← ÚJ: trail frissítése minden testnek
        for (const { trail, body } of this._trails) {
            trail.update(body.position, now);
        }
    }

    // ← ÚJ: T billentyűre hívható
    setOrbitLinesVisible(visible) {
        for (const line of this._orbitLines) {
            line.visible = visible;
        }
    }
}