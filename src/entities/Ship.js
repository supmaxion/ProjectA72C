import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { SHIP } from '../config.js';

const modelPath = import.meta.env.BASE_URL + 'models/ufo.obj';

export class Ship {
    constructor() {
        this.group = new THREE.Group();
        this.group.position.copy(SHIP.startPosition);

        this.visualGroup = new THREE.Group();
        this.group.add(this.visualGroup);

        this.speed = SHIP.speed;
        this._minSpeed = SHIP.minSpeed;
        this._maxSpeed = SHIP.maxSpeed;
        this._scrollAcceleration = SHIP.scrollAcceleration;
        this._currentRoll = 0;

        // OBJ betöltése, fallback ha nem sikerül
        this._loadModel();
    }

    _loadModel() {
        const loader = new OBJLoader();
        loader.load(
            modelPath,
            (obj) => {
                obj.scale.set(1, 1, 1);
                obj.position.set(0, 0, 0);

                obj.traverse((child) => {
                    if (child.isMesh && !child.material) {
                        child.material = new THREE.MeshStandardMaterial({
                            color: 0x888888,
                            metalness: 0.5,
                            roughness: 0.3,
                        });
                    }
                });

                this.visualGroup.add(obj);
                console.log('OBJ modell betöltve!');
            },
            (xhr) => {
                if (xhr.total > 0) {
                    console.log(`OBJ betöltés: ${Math.round((xhr.loaded / xhr.total) * 100)}%`);
                }
            },
            (error) => {
                console.warn('OBJ betöltés sikertelen, fallback geometria:', error);
                this._buildFallback();
            }
        );
    }

    _buildFallback() {
        const body = new THREE.Mesh(
            new THREE.ConeGeometry(2, 6, 8),
            new THREE.MeshStandardMaterial({ color: 0x88aacc, metalness: 0.4, roughness: 0.4 })
        );
        body.rotation.x = Math.PI / 2;
        this.visualGroup.add(body);
    }

    get position() {
        return this.group.position;
    }

    get quaternion() {
        return this.group.quaternion;
    }

    update(input) {
        const { yaw, pitch, scroll } = input;

        if (scroll !== 0) {
            this.speed -= Math.sign(scroll) * this._scrollAcceleration;
        }
        this.speed = Math.max(this._minSpeed, Math.min(this._maxSpeed, this.speed));

        // Rotáció: pitch + yaw a hajó saját lokális terében
        const deltaQuat = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(pitch, yaw, 0, 'XYZ')
        );
        this.group.quaternion.multiply(deltaQuat);
        this.group.quaternion.normalize();

        // Vizuális roll (csak kozmetikai, nem hat a mozgásra)
        let targetRoll = yaw * 18;
        targetRoll = Math.max(-0.6, Math.min(0.6, targetRoll));
        this._currentRoll += (targetRoll - this._currentRoll) * 0.12;
        this.visualGroup.rotation.set(0, 0, this._currentRoll * 0.6);

        // Előre mozgás
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.group.quaternion);
        this.group.position.addScaledVector(forward, this.speed);
    }
}