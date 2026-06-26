import * as THREE from 'three';

export const SUN = {
    direction: new THREE.Vector3(0,0,0),
    distance: 0,
    size: 900,
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
    spread: 600000,
    centerZ: 0,
};

export const SHIP = {
    startPosition: new THREE.Vector3(0, 3000, 10000),
    speed: 0.045,
    minSpeed: 0.000001,
    maxSpeed: 9999,
    scrollAcceleration: 0.5,  // sebesség-változás görgőegységenként 0,005
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
        {
            name: 'planet-gamma',
            mass: 6,
            radius: 28,
            color: 0x66ccff,
            orbit: {
                semiMajorAxis: 3200,
                eccentricity: 0.05,
                inclination: 0.08,
                speed: 0.00014,
            },
            moons: [
                {
                    name: 'gamma-moon-1',
                    mass: 1,
                    radius: 12,
                    color: 0xb0b0b0,
                    orbit: {
                        semiMajorAxis: 180,
                        eccentricity: 0.03,
                        inclination: 0.04,
                        speed: 0.0021,
                    },
                },
            ],
        },
        {
            name: 'planet-delta',
            mass: 10,
            radius: 42,
            color: 0xaaff66,
            orbit: {
                semiMajorAxis: 4200,
                eccentricity: 0.18,
                inclination: 0.03,
                speed: 0.00012,
            },
            moons: [
                {
                    name: 'delta-moon-1',
                    mass: 1,
                    radius: 10,
                    color: 0x9a9a9a,
                    orbit: {
                        semiMajorAxis: 200,
                        eccentricity: 0.01,
                        inclination: 0.02,
                        speed: 0.0023,
                    },
                },
                {
                    name: 'delta-moon-2',
                    mass: 2,
                    radius: 14,
                    color: 0xc0c0c0,
                    orbit: {
                        semiMajorAxis: 280,
                        eccentricity: 0.05,
                        inclination: 0.06,
                        speed: 0.0018,
                    },
                },
            ],
        },
        {
            name: 'planet-epsilon',
            mass: 4,
            radius: 22,
            color: 0xffcc00,
            orbit: {
                semiMajorAxis: 5200,
                eccentricity: 0.22,
                inclination: 0.11,
                speed: 0.00011,
            },
            moons: [],
        },
        {
            name: 'planet-zeta',
            mass: 9,
            radius: 38,
            color: 0xcc66ff,
            orbit: {
                semiMajorAxis: 6500,
                eccentricity: 0.1,
                inclination: 0.06,
                speed: 0.000095,
            },
            moons: [
                {
                    name: 'zeta-moon-1',
                    mass: 1,
                    radius: 11,
                    color: 0xaaaaaa,
                    orbit: {
                        semiMajorAxis: 190,
                        eccentricity: 0.02,
                        inclination: 0.03,
                        speed: 0.0020,
                    },
                },
            ],
        },
        {
            name: 'planet-eta',
            mass: 7,
            radius: 33,
            color: 0xff3366,
            orbit: {
                semiMajorAxis: 8200,
                eccentricity: 0.15,
                inclination: 0.09,
                speed: 0.000085,
            },
            moons: [
                {
                    name: 'eta-moon-1',
                    mass: 1,
                    radius: 9,
                    color: 0x8f8f8f,
                    orbit: {
                        semiMajorAxis: 170,
                        eccentricity: 0.04,
                        inclination: 0.05,
                        speed: 0.0024,
                    },
                },
                {
                    name: 'eta-moon-2',
                    mass: 1,
                    radius: 13,
                    color: 0xbdbdbd,
                    orbit: {
                        semiMajorAxis: 230,
                        eccentricity: 0.02,
                        inclination: 0.07,
                        speed: 0.0019,
                    },
                },
                {
                    name: 'eta-moon-3',
                    mass: 2,
                    radius: 16,
                    color: 0xd0d0d0,
                    orbit: {
                        semiMajorAxis: 320,
                        eccentricity: 0.06,
                        inclination: 0.02,
                        speed: 0.0016,
                    },
                },
            ],
        },
        {
            name: 'planet-theta',
            mass: 12,
            radius: 50,
            color: 0x33ffee,
            orbit: {
                semiMajorAxis: 10500,
                eccentricity: 0.07,
                inclination: 0.04,
                speed: 0.000075,
            },
            moons: [],
        },
        {
            name: 'planet-iota',
            mass: 5,
            radius: 26,
            color: 0xff8844,
            orbit: {
                semiMajorAxis: 13000,
                eccentricity: 0.2,
                inclination: 0.13,
                speed: 0.000065,
            },
            moons: [
                {
                    name: 'iota-moon-1',
                    mass: 1,
                    radius: 10,
                    color: 0xa0a0a0,
                    orbit: {
                        semiMajorAxis: 190,
                        eccentricity: 0.03,
                        inclination: 0.04,
                        speed: 0.0022,
                    },
                },
            ],
        },
        {
            name: 'planet-kappa',
            mass: 11,
            radius: 46,
            color: 0x4488ff,
            orbit: {
                semiMajorAxis: 16000,
                eccentricity: 0.12,
                inclination: 0.02,
                speed: 0.000055,
            },
            moons: [
                {
                    name: 'kappa-moon-1',
                    mass: 2,
                    radius: 14,
                    color: 0xb5b5b5,
                    orbit: {
                        semiMajorAxis: 220,
                        eccentricity: 0.01,
                        inclination: 0.03,
                        speed: 0.0019,
                    },
                },
                {
                    name: 'kappa-moon-2',
                    mass: 1,
                    radius: 11,
                    color: 0xdcdcdc,
                    orbit: {
                        semiMajorAxis: 300,
                        eccentricity: 0.05,
                        inclination: 0.06,
                        speed: 0.0015,
                    },
                },
            ],
        },
    ],
};

export const BACKGROUND_OBJECTS = {
    skyDistance: 9000, // kamerától való távolság — a far plane alatt kell legyen
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

export const ORBIT_TRAIL = {
    ellipsePoints:    180,     // statikus ellipszis pontjainak száma
    ellipseOpacity:   0.18,    // halvány
    trailDuration:    10.0,     // másodperc
    trailMaxPoints:   300,     // max tárolt pont
    trailMaxOpacity:  1.5,     // trail legfényesebb pontja
    minDistance:      5,       // minimum elmozdulás új pont felvételéhez
};