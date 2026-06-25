import * as THREE from 'three';

export const SUN = {
    direction: new THREE.Vector3(-0.4, 0.25, -1).normalize(),
    distance: 80000,
    size: 12000,
    color: 0xffddaa,
    lightIntensity: 2.0,
};

export const PLANET = {
    position: new THREE.Vector3(5, 0, -1100),
    radius: 200,
    color: 0x44dd88,
};

export const STAR_FIELD = {
    count: 3000,
    spread: 600,
    centerZ: -100,
};

export const SHIP = {
    startPosition: new THREE.Vector3(0, 0, -10),
    speed: 0.045,
    minSpeed: 0.005,
    maxSpeed: 0.9,
    scrollAcceleration: 0.005,  // sebesség-változás görgőegységenként
    thrustForce: 0.8,      // hajtóerő nagysága impulzusban
    mass: 1.0,
};

export const CAMERA = {
    fov: 60,
    near: 10,
    far: 1000000,
    offsetLocal: new THREE.Vector3(0, 5, 18),
};
export const GRAVITY = {
    G: 0.5,
    scale: 1.0,
};

export const SOLAR_SYSTEM = {
    sun: {
        mass: 2000,
        position: new THREE.Vector3(0, 0, 0),
    },
    bodies: [
        {
            name: 'planet-alpha',
            mass: 15,
            radius: 60,
            color: 0x44dd88,
            orbit: {
                semiMajorAxis: 1200,
                eccentricity: 0.1,
                inclination: 0.05,
                speed: 0.0003,
            },
            moons: [
                {
                    name: 'moon-alpha-1',
                    mass: 1,
                    radius: 15,
                    color: 0xaaaaaa,
                    orbit: {
                        semiMajorAxis: 150,
                        eccentricity: 0.02,
                        inclination: 0.03,
                        speed: 0.002,
                    },
                },
            ],
        },
        {
            name: 'planet-beta',
            mass: 8,
            radius: 35,
            color: 0xff6644,
            orbit: {
                semiMajorAxis: 2200,
                eccentricity: 0.2,
                inclination: 0.12,
                speed: 0.00015,
            },
            moons: [],
        },
    ],
};