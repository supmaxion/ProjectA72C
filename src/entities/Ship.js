import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { SHIP, CAMERA } from '../config.js';

const modelPath = import.meta.env.BASE_URL + 'models/ship.glb';

export class Ship {
    constructor() {
        this.group = new THREE.Group();
        this.group.position.copy(SHIP.startPosition);

        // Kezdő irány: a hajó nézzen a Nap (origó) felé, ne pusztán -Z irányba
        const target = new THREE.Vector3(0, 0, 0);
        const forward = new THREE.Vector3().subVectors(target, this.group.position).normalize();
        const defaultForward = new THREE.Vector3(0, 0, -1);
        this.group.quaternion.setFromUnitVectors(defaultForward, forward);

        this.visualGroup = new THREE.Group();
        this.group.add(this.visualGroup);

        this.speed = SHIP.speed;
        this._minSpeed = SHIP.minSpeed;
        this._maxSpeed = SHIP.maxSpeed;
        this._scrollAcceleration = SHIP.scrollAcceleration;
        this._currentRoll = 0;
        this.counterRoll = 0;
        // this.visualGroup.quaternion.identity();
        this._loadModel();
    }

    _loadModel() {
        const loader = new GLTFLoader();
        loader.load(
            modelPath,
            (gltf) => {
                const model = gltf.scene;
                model.rotation.y = Math.PI;
                model.rotation.x = SHIP.modelRotationX;

                // Automatikus méretezés
                const box = new THREE.Box3().setFromObject(model);
                const size = box.getSize(new THREE.Vector3()).length();
                const scale = SHIP.modelSize / size;
                model.scale.setScalar(scale);

                this.visualGroup.add(model);
            },
            (xhr) => {
                if (xhr.total > 0) {
                    console.log(`GLB betöltés: ${Math.round((xhr.loaded / xhr.total) * 100)}%`);
                }
            },
            (error) => {
                console.warn('GLB betöltés sikertelen, fallback geometria:', error);
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

        const deltaQuat = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(pitch, yaw, 0, 'XYZ')
        );
        this.group.quaternion.multiply(deltaQuat);
        this.group.quaternion.normalize();

        let targetRoll = yaw * 18;
        targetRoll = Math.max(-0.6, Math.min(0.6, targetRoll));
        this._currentRoll += (targetRoll - this._currentRoll) * 0.12;
        

        
        const pitchQuat = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(1, 0, 0),
            CAMERA.rotationX
        );
        const rollQuat = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 0, 1),
            this.counterRoll
        );
        const bankQuat = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 0, 1),
            this._currentRoll * 0.6
        );
        const pq = new THREE.Quaternion().multiplyQuaternions(pitchQuat, rollQuat);
        this.visualGroup.quaternion.multiplyQuaternions(pq, bankQuat);





        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.group.quaternion);
        this.group.position.addScaledVector(forward, this.speed);
    }
}