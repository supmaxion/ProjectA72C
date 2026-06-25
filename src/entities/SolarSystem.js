import * as THREE from 'three';
import { CelestialBody } from './CelestialBody.js';
import { SOLAR_SYSTEM, GRAVITY } from '../config.js';

/**
 * Builds and manages the entire solar system:
 * - The Sun (static, just a gravitational attractor + the existing sprite)
 * - Planets on Keplerian orbits around the Sun
 * - Moons on Keplerian orbits around their parent planet
 *
 * All bodies register themselves with the GravitySystem so they
 * automatically attract the ship each frame.
 */
export class SolarSystem {
    constructor(scene, physicsWorld, gravitySystem) {
        this._scene = scene;
        this._planets = [];
        this._time = 0;

        // Register the Sun as a gravitational attractor.
        // It has no orbit (it's at the origin) so no CelestialBody needed --
        // just a gravity registration.
        const sunPos = new THREE.Vector3(
            SOLAR_SYSTEM.sun.position.x,
            SOLAR_SYSTEM.sun.position.y,
            SOLAR_SYSTEM.sun.position.z,
        );
        gravitySystem.addBody(sunPos, SOLAR_SYSTEM.sun.mass);

        // Build planets and their moons from config
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

            // Build moons
            if (bodyConfig.moons) {
                for (const moonConfig of bodyConfig.moons) {
                    const moon = new CelestialBody({
                        name: moonConfig.name,
                        mass: moonConfig.mass,
                        radius: moonConfig.radius,
                        color: moonConfig.color,
                        orbit: moonConfig.orbit,
                        orbitCenter: planet.position, // orbits the planet
                        physicsWorld,
                        gravitySystem,
                    });

                    scene.add(moon.group);
                    planet.moons.push(moon);
                }
            }

            this._planets.push(planet);
        }
    }

    update() {
        this._time++;
        for (const planet of this._planets) {
            planet.update(this._time);
        }
    }
}