import * as THREE from 'three';


export const GAME_START = {
    blink: false, // true: a játék indításakor villogjon a képernyő, false: azonnal induljon
};

export const CELESTIAL = {
    wireShellVisibleDistanceMultiplier: 100,
};

// export const SYSTEM_VISIBILITY = {
//     systemVisibleDistance : 20000,
// };

export const SUN = {
    direction: new THREE.Vector3(0,0,0),
    distance: 0,
    size: 900,
    color: 0xffddaa,
    lightIntensity: 2.0,
    ambientColor: 0x334466,
    ambientIntensity: 1.5,
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
    startPosition: new THREE.Vector3(0, 3000, 7000),//0,3000,700000
    speed: 0.45,
    minSpeed: 0.0000001,
    maxSpeed: 9999,
    scrollAcceleration: 0.5,  // sebesség-változás görgőegységenként
    modelSize: 15, 
    modelRotationX: 0.15, 
    rollSpeed: 0.025,       // roll szögsebesség A/D gombonként, radián/frame
    driftFollow: 0.00001,      // mennyire "lassan" éri utol a drift a tényleges yaw-t (kisebb = lustább, nagyobb csúszás)
    driftStrength: 0.000030,     // a csúszás mértéke (yaw-különbség szorzója)
};

export const CAMERA = {
    fov: 60,
    near: 1,
    far: 1000000,
    offsetLocal: new THREE.Vector3(0, 0, 30),//0,5,18
    rotationX: THREE.MathUtils.degToRad(0),
};

export const SOLAR_SYSTEM = {
    sun: {
        position: new THREE.Vector3(0, 0, 0),
    },
    bodies: [
        {
            name: 'planet-alpha',
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
    nebula:      3,
    galaxy:      3,
    starCluster: 3,
    pulsar:      3,
    supernova: 3,
    blackHole: 3,
  },
  nebula: {
    minSize: 800,
    maxSize: 1000,
  },
  galaxy: {
    minSize: 600,
    maxSize: 1000,
  },
  starCluster: {
    minSize: 400,
    maxSize: 700,
  },
  pulsar: {
    minSize: 800,
    maxSize: 1000,
    pulseSpeed: 4.0,  // rad/s
  },
  supernova: {
    minSize: 300,
    maxSize: 450,
  },
  blackHole: {
    minSize: 200,
    maxSize: 300,
  },
};

export const COMET = {
    name: 'Comet',
    radius: 15,
    color: 0xcfe8ff,
    tailColor: 0xaad4ff,
    tailLength: 600,
    tailWidth: 40,
    orbit: {
        semiMajorAxis: 9000,
        eccentricity: 0.85,
        inclination: THREE.MathUtils.degToRad(20),
        speed: 0.0002,
        phaseOffset: 0,
    },
};

export const STATION = {
    position: new THREE.Vector3(4000, 200, -6000),
    ringRadius: 220,
};

export const MILKY_WAY = {
    starCount: 8000,
    starSize: 0.3,
    bandThickness: 0.04,        // mennyire "vastag" a sáv (gauss szórás)
    bandTilt: THREE.MathUtils.degToRad(5),
    skyDistance: BACKGROUND_OBJECTS.skyDistance, // ugyanaz, mint a többi háttérobjektumnál
};

export const ASTEROID_BELT = {
    innerRadius: 25000,
    outerRadius: 30000,
    count: 500,
    minSize: 10,
    maxSize: 60,
    color: 0x8a7d6e,
};

export const ORBIT_TRAIL = {
    ellipsePoints:    180,     // statikus ellipszis pontjainak száma
    ellipseOpacity:   0.18,    // halvány
    trailDuration:    10.0,     // másodperc
    trailMaxPoints:   300,     // max tárolt pont
    trailMaxOpacity:  1.5,     // trail legfényesebb pontja
    minDistance:      5,       // minimum elmozdulás új pont felvételéhez
    offsetLocal: new THREE.Vector3(0, 5, 18),
};
