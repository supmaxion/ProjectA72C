import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { SHIP } from '../config.js';

const modelPath = import.meta.env.BASE_URL + 'models/ufo.obj';


/**
 * The player ship.
 *
 * Rotation architecture (important, do not "simplify" without re-reading):
 *
 * - `this.group` is the ship's TRUE position and movement orientation.
 *   It only ever receives pitch and yaw, applied as small per-frame
 *   deltas in the ship's OWN local space (`quaternion.multiply`, not
 *   premultiply). There is no stored Euler state and no clamping, so
 *   this can never enter gimbal lock, and the ship can pitch through
 *   a full loop without restriction.
 *
 * - `this.visualGroup` is a child of `this.group` and holds only the
 *   visible meshes. ONLY this group receives roll (banking into
 *   turns), applied as a simple, smoothed rotation.z. This is purely
 *   cosmetic -- it never affects movement direction or the camera,
 *   which is exactly why the camera in core/camera.js can stay simple
 *   and stable: it reads `this.group.quaternion`, which is guaranteed
 *   roll-free.
 *
 * This split (movement orientation vs. visual orientation) is what
 * fixes the "world tilts instead of the ship" and "camera flips at
 * 90 degrees" issues that a naive single-quaternion approach runs
 * into.
 */
export class Ship {
    constructor() {
        this.group = new THREE.Group();
        this.group.position.copy(SHIP.startPosition);

        this.visualGroup = new THREE.Group();
        this.group.add(this.visualGroup);

        this._buildMeshes();

        this.speed = SHIP.speed;
        this._minSpeed = SHIP.minSpeed;
        this._maxSpeed = SHIP.maxSpeed;
        this._scrollAcceleration = SHIP.scrollAcceleration;
        this._currentRoll = 0;
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

    get position() {
        return this.group.position;
    }

    get quaternion() {
        return this.group.quaternion;
    }

    /**
     * Advances the ship's rotation and position by one frame.
     *
     *   rotation input (e.g. from MouseLook.consume()).
     */
    update(input) {
        const { yaw, pitch, scroll } = input;

        // Scroll: positive deltaY = scroll down = decelerate
        if (scroll !== 0) {
            this.speed -= Math.sign(scroll) * this._scrollAcceleration;
        }
        this.speed = Math.max(this._minSpeed, Math.min(this._maxSpeed, this.speed));

        // --- TRUE movement orientation: pitch + yaw only, no roll ---

        const deltaEuler = new THREE.Euler(pitch, yaw, 0, 'XYZ');
        const deltaQuat = new THREE.Quaternion().setFromEuler(deltaEuler);
        this.group.quaternion.multiply(deltaQuat);
        this.group.quaternion.normalize();

        // --- Visual-only roll (banking), smoothed to avoid jitter ---
        // Raw per-frame mouse deltas are noisy; smoothing the roll
        // target (rather than deriving roll from a raw frame-to-frame
        // rate) avoids the shaking that a naive derivative produces.
        let targetRoll = yaw * 18;
        targetRoll = Math.max(-0.6, Math.min(0.6, targetRoll));
        this._currentRoll += (targetRoll - this._currentRoll) * 0.12;
        this.visualGroup.rotation.set(0, 0, this._currentRoll * 0.6);



        // --- Move forward along the ship's current facing direction ---
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.group.quaternion);
        this.group.position.addScaledVector(forward, this.speed);
    }
}

