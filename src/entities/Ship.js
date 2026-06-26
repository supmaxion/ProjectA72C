import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { SHIP } from '../config.js';

const modelPath = import.meta.env.BASE_URL + 'models/ufo.obj';

export class Ship {
    constructor(physicsWorld) {
        // --- THREE.JS GROUPS ---
        this.group = new THREE.Group();
        this.group.position.copy(SHIP.startPosition);

        this.visualGroup = new THREE.Group();
        this.group.add(this.visualGroup);

        // Modell betöltése
        this._modelLoaded = false;
        this._loadModel();

        this._currentRoll = 0;

        // --- RAPIER RIGID BODY ---
        this._body = physicsWorld.createShipBody(SHIP.startPosition);

        // Scroll-based thrust level
        this._thrustLevel = SHIP.speed;

        this._velocity = new THREE.Vector3();
    }

    /**
     * OBJ modell betöltése
     */
    _loadModel() {
        const loader = new OBJLoader();
        
        // Opcionális: ha van anyag fájl (mtl)
        // const mtlLoader = new MTLLoader();
        // mtlLoader.load(modelPath.replace('.obj', '.mtl'), (materials) => {
        //     materials.preload();
        //     loader.setMaterials(materials);
        //     this._loadOBJ(loader);
        // });
        // Ha nincs mtl, közvetlenül betöltjük:
        this._loadOBJ(loader);
    }

    _loadOBJ(loader) {
        loader.load(
            modelPath,
            (obj) => {
                // Sikeres betöltés
                console.log('OBJ modell betöltve!');
                this._onModelLoaded(obj);
            },
            (xhr) => {
                // Betöltés folyamata
                const percent = (xhr.loaded / xhr.total) * 100;
                console.log(`OBJ betöltés: ${Math.round(percent)}%`);
            },
            (error) => {
                // Hiba esetén - ha nincs OBJ, használjuk a geometriai hajót
                console.warn('OBJ betöltés sikertelen, geometriai hajó használata:', error);
                this._buildMeshes();
            }
        );
    }

    _onModelLoaded(model) {
        // Modell skálázása, ha szükséges
        const scale = 1.0; // Állítsd be a megfelelő méretre
        model.scale.set(scale, scale, scale);
        
        // Modell pozicionálása (ha szükséges)
        model.position.set(0, 0, 0);
        
        // Modell forgatása (ha szükséges)
        // model.rotation.set(0, 0, 0);
        
        // Anyagok beállítása (ha szükséges)
        model.traverse((child) => {
            if (child.isMesh) {
                // Ha nincs anyag, vagy szeretnéd módosítani
                if (!child.material) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0x888888,
                        metalness: 0.5,
                        roughness: 0.3,
                    });
                }
                
                // Opcionális: árnyék beállítása
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        this.visualGroup.add(model);
        this._modelLoaded = true;
        console.log('OBJ modell hozzáadva a hajóhoz!');
    }

    /**
     * Tartalék geometriai hajó, ha az OBJ nem tölthető be
     */
    _buildMeshes() {
        // Itt hozd létre a saját geometriai hajódat
        // Vagy meghívhatod a régi buildShipMeshes-t
        import('./Ship.shape.js').then(module => {
            module.buildShipMeshes(this.visualGroup);
        });
    }

    get position() {
        return this.group.position;
    }

    get quaternion() {
        return this.group.quaternion;
    }

    /**
     * Called every frame BEFORE physicsWorld.step().
     */
    update(input) {
        const { yaw, pitch, scroll } = input;

        // --- ROTATION ---
        const deltaEuler = new THREE.Euler(pitch, yaw, 0, 'XYZ');
        const deltaQuat = new THREE.Quaternion().setFromEuler(deltaEuler);
        this.group.quaternion.multiply(deltaQuat);
        this.group.quaternion.normalize();

        // Visual roll
        let targetRoll = yaw * 18;
        targetRoll = Math.max(-0.6, Math.min(0.6, targetRoll));
        this._currentRoll += (targetRoll - this._currentRoll) * 0.12;
        this.visualGroup.rotation.set(0, 0, this._currentRoll * 0.6);

        // --- THRUST LEVEL (scroll) ---
        if (scroll !== 0) {
            this._thrustLevel -= Math.sign(scroll) * SHIP.scrollAcceleration;
            this._thrustLevel = Math.max(
                SHIP.minSpeed,
                Math.min(SHIP.maxSpeed, this._thrustLevel)
            );
        }

        // --- MOZGÁS ---
        const forward = new THREE.Vector3(0, 0, -1)
            .applyQuaternion(this.group.quaternion);

        const forwardSpeed = this._velocity.dot(forward);
        const gravityDrift = this._velocity.clone()
            .addScaledVector(forward, -forwardSpeed);

        this._velocity.copy(gravityDrift)
            .addScaledVector(forward, this._thrustLevel);

        this.group.position.add(this._velocity);
    }
            
    applyGravityForce(force) {
        this._velocity.add(force);
    }

    /**
     * Called every frame AFTER physicsWorld.step().
     */
    syncFromPhysics() {
        const pos = this._body.translation();
        this.group.position.set(pos.x, pos.y, pos.z);
    }

    getRigidBody() {
        return this._body;
    }
}