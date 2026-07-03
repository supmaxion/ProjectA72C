

import * as THREE from 'three';
import { createRng } from '../utils/seededRandom.js';
import { HOME_SYSTEM } from '../config.js';

function randomColor(rng) {
    const hue = Math.floor(rng() * 360);
    const sat = 55 + rng() * 30;
    const light = 45 + rng() * 15;
    return new THREE.Color(`hsl(${hue}, ${sat}%, ${light}%)`).getHex();
}

function generateBodies(rng) {
    const bodyCount = 3 + Math.floor(rng() * 5); // 3–7 bolygó
    const bodies = [];
    let orbitRadius = 800 + rng() * 400;

    for (let i = 0; i < bodyCount; i++) {
        orbitRadius += 600 + rng() * 900;

        const body = {
            name: `planet-${i}`,
            radius: 30 + rng() * 90,
            color: randomColor(rng),
            orbit: {
                semiMajorAxis: orbitRadius,
                eccentricity: rng() * 0.2,
                inclination: (rng() - 0.5) * 0.2,
                speed: 0.0002 + rng() * 0.0006,
                phaseOffset: rng() * Math.PI * 2,
            },
        };

        // ~40% eséllyel legyen 1-2 holdja
        if (rng() < 0.4) {
            const moonCount = 1 + Math.floor(rng() * 2);
            body.moons = [];
            for (let m = 0; m < moonCount; m++) {
                body.moons.push({
                    name: `moon-${i}-${m}`,
                    radius: 8 + rng() * 15,
                    color: randomColor(rng),
                    orbit: {
                        semiMajorAxis: body.radius * (3 + rng() * 3),
                        eccentricity: rng() * 0.1,
                        inclination: (rng() - 0.5) * 0.3,
                        speed: 0.002 + rng() * 0.004,
                        phaseOffset: rng() * Math.PI * 2,
                    },
                });
            }
        }

        bodies.push(body);
    }

    return { bodies, outerRadius: orbitRadius };
}

export function generateSystemConfig(seed, { returnSeed } = {}) {
    const rng = createRng(seed);
    const { bodies, outerRadius } = generateBodies(rng);

    const comet = {
        ...HOME_SYSTEM.comet,
        orbit: {
            ...HOME_SYSTEM.comet.orbit,
            semiMajorAxis: outerRadius * (1.2 + rng() * 0.6),
            eccentricity: 0.7 + rng() * 0.2,
            phaseOffset: rng() * Math.PI * 2,
        },
    };

    const comet2 = {
        ...HOME_SYSTEM.comet2,
        orbit: {
            ...HOME_SYSTEM.comet2.orbit,
            semiMajorAxis: outerRadius * (1.4 + rng() * 0.6),
            eccentricity: 0.6 + rng() * 0.25,
            phaseOffset: rng() * Math.PI * 2,
        },
    };

    const beltInner = outerRadius * (0.5 + rng() * 0.2);
    const beltOuter = beltInner + 400 + rng() * 600;
    const asteroidBelt = {
        ...HOME_SYSTEM.asteroidBelt,
        innerRadius: beltInner,
        outerRadius: beltOuter,
        count: 150 + Math.floor(rng() * 200),
    };

    const stationAngle = rng() * Math.PI * 2;
    const stationDist = outerRadius + 800 + rng() * 400;
    const station = {
        ...HOME_SYSTEM.station,
        position: new THREE.Vector3(
            Math.cos(stationAngle) * stationDist,
            (rng() - 0.5) * 200,
            Math.sin(stationAngle) * stationDist,
        ),
        destinationSeed: returnSeed ?? 'home',
    };

    return {
        seed,
        sun: HOME_SYSTEM.sun,
        bodies,
        comet,
        comet2,
        asteroidBelt,
        station,
    };
}
