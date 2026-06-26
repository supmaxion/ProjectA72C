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

export const DUST_FIELD = {
    count: 3000,
    spread: 60000,
    centerZ: 0,
};

export const SHIP = {
    startPosition: new THREE.Vector3(0, 0, 0),//nem itt hanem a camera offsetjében, de a ship rigid body-nak kell egy kezdő pozíció
    speed: 0.045,
    minSpeed: 0.005,
    maxSpeed: 0.9,
    scrollAcceleration: 0.005,  // sebesség-változás görgőegységenként
    thrustForce: 2,      // hajtóerő nagysága impulzusban
    mass: 1.0,
};

export const CAMERA = {
    fov: 60,
    near: 1,
    far: 1000000,
    offsetLocal: new THREE.Vector3(0, 1, 11),//0,5,18
};
export const GRAVITY = {
    G: 0.5,
    scale: 1,
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

export const BACKGROUND_OBJECTS = {
  spawnRadius: {
    min: 8000,   // ne legyen túl közel az origóhoz
    max: 20000,
  },
  counts: {
    nebula:      6,
    galaxy:      4,
    starCluster: 5,
    pulsar:      3,
  },
  nebula: {
    minSize: 800,
    maxSize: 2500,
  },
  galaxy: {
    minSize: 600,
    maxSize: 1800,
  },
  starCluster: {
    minSize: 400,
    maxSize: 1200,
  },
  pulsar: {
    minSize: 80,
    maxSize: 200,
    pulseSpeed: 4.0,  // rad/s
  },
};