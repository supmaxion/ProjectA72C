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
};

export const CAMERA = {
    fov: 60,
    near: 10,
    far: 1000000,
    offsetLocal: new THREE.Vector3(0, 5, 18),
};