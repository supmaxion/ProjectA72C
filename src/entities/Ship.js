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
        this._thrustState = 'IDLE';
		this._thrustHoldTime = 0;
        this._currentRoll = 0;
        this.counterRoll = 0;
        // this.visualGroup.quaternion.identity();

        //hologram
        const light1 = new THREE.DirectionalLight(0x66ccff, 1.2);
        light1.position.set(2, 3, 4);
        this.group.add(light1);

        this._holoMaterials = [];
        this._holoBaseOpacity = 0.7;
        this._flickerTime = 0;
        this._modelLoaded = false;
        this._pendingHoloVisible = null; // ha visible-t állítunk betöltés előtt, ide kerül, amíg a modell meg nem érkezik

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

                // Kékes hologram-anyag, az eredeti GLB szín helyett
                model.traverse((child) => {
                    if (child.isMesh) {
                        const holoMat = new THREE.MeshBasicMaterial({
                            color: 0x66ccff,
                            transparent: true,
                            opacity: this._holoBaseOpacity,
                            wireframe: false,
                        });
                        child.material = holoMat;
                        this._holoMaterials.push(holoMat);
                    }
                });

                // Automatikus méretezés
                const box = new THREE.Box3().setFromObject(model);
                const size = box.getSize(new THREE.Vector3()).length();
                const scale = SHIP.modelSize / size;
                model.scale.setScalar(scale);

                this.visualGroup.add(model);

                this._modelLoaded = true;
                this._modelSource = model; // ebből klónozunk a hologramnak
                this.visualGroup.visible = this._pendingHoloVisible ?? false;
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
        //holo
        const mat = new THREE.MeshBasicMaterial({
            color: 0x66ccff,
            transparent: true,
            opacity: this._holoBaseOpacity,
        });
        const body = new THREE.Mesh(
            new THREE.ConeGeometry(2, 6, 8),
            mat
        ); //holo

        body.rotation.x = Math.PI / 2;
        this.visualGroup.add(body);

        body.rotation.x = Math.PI / 2;
        this.visualGroup.add(body);

        this._modelSource = body;
    }

    get position() {
        return this.group.position;
    }

    get quaternion() {
        return this.group.quaternion;
    }
    
    get heading() {
		const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.group.quaternion);
		let heading = Math.atan2(forward.x, -forward.z) * (180 / Math.PI);
		if (heading < 0) heading += 360;
		return heading;
	}

    toggle() {
        if (!this.visualGroup) return;
        if (!this._modelLoaded) return; // ha még nem töltött be, ne csináljon semmit
        this.visualGroup.visible = !this.visualGroup.visible;
    }

	/** Determinisztikusan beállítja a hologram láthatóságát (nem kapcsol, hanem állít). */
    setHoloVisible(visible) {
        if (this._modelLoaded) {
            this.visualGroup.visible = visible;
        } else {
            this._pendingHoloVisible = visible; // alkalmazzuk, amint a modell betöltött
        }
    }
    
    update(input) {
        const { yaw, pitch, scroll, cameraRoll = 0 } = input;

        if (scroll !== 0) {
            this.speed -= Math.sign(scroll) * this._scrollAcceleration;
            this._thrustState = scroll < 0 ? 'ACCEL' : 'DECEL';
            this._thrustHoldTime = performance.now();
        } else if (performance.now() - this._thrustHoldTime > 1000) {
			this._thrustState = 'IDLE';
		}
        this.speed = Math.max(this._minSpeed, Math.min(this._maxSpeed, this.speed));

        // Kamera valódi lokális tengelyei ship-lokális térben
        const camPitchQuat = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(1, 0, 0), CAMERA.rotationX
        );
        const camRollQuat = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 0, 1), cameraRoll
        );
        const camRel = new THREE.Quaternion().multiplyQuaternions(camPitchQuat, camRollQuat);

        // Yaw: kamera lokális Y tengelye körül
        const yawAxis = new THREE.Vector3(0, 1, 0).applyQuaternion(camRel);
        // Pitch: kamera lokális X tengelye körül
        const pitchAxis = new THREE.Vector3(1, 0, 0).applyQuaternion(camRel);

        const yawQuat = new THREE.Quaternion().setFromAxisAngle(yawAxis, yaw);
        const pitchQuat2 = new THREE.Quaternion().setFromAxisAngle(pitchAxis, pitch);

        this.group.quaternion.multiply(yawQuat);
        this.group.quaternion.multiply(pitchQuat2);


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

        // Hologram flicker
        this._flickerTime += 0.016;
        const flicker = 0.85 + Math.random() * 0.15;
        for (const mat of this._holoMaterials) {
            mat.opacity = this._holoBaseOpacity * flicker;
        }

    }
}
