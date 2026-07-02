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

        //hologram
        const light1 = new THREE.DirectionalLight(0x66ccff, 1.2);
        light1.position.set(2, 3, 4);
        this.group.add(light1);

        this._holoMaterials = [];
        this._holoBaseOpacity = 0.7;
        this._flickerTime = 0;
        this._modelLoaded = false;

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

                // Vetítősugár, mint egy mozivetítő fénykúpja
                const beamGroup = this._buildProjectorBeam(SHIP.modelSize);
                this.visualGroup.add(beamGroup);

                this.visualGroup.visible = false; // alapból rejtve, csak hologramban látszik
                this._modelLoaded = true;
                this._modelSource = model; // ebből klónozunk a hologramnak
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

    _buildProjectorBeam(modelWidth) {
        const beamGroup = new THREE.Group();

        // Kúp: keskeny csúcs (jobb-fent) → széles alap (a hajó szélessége)
        const height = 14;
        const radiusTop = 0.15;
        const radiusBottom = Math.max(modelWidth * 0.9, 3);

        const coneGeo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 24, 1, true);
        const coneMat = new THREE.MeshBasicMaterial({
            color: 0x99ddff,
            transparent: true,
            opacity: 0.08,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide,
        });

        const beam = new THREE.Mesh(coneGeo, coneMat);

        // Alapból a henger/kúp lokálisan Y tengely mentén áll (csúcs fent, alap lent).
        // Irányítsuk: csúcs = jobb-fent-hátul, alap = a hajó közepe.
        const apex = new THREE.Vector3(11, 16, -1);
        const base = new THREE.Vector3(30, 50, 80);
        const dir = new THREE.Vector3().subVectors(base, apex);
        const dist = dir.length();
        dir.normalize();

        beam.geometry.translate(0, -height / 2, 0); // csúcs kerüljön origóba
        beam.scale.set(1, dist / height, 1);
        beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        beam.position.copy(apex);

        beamGroup.add(beam);

        this._beamMaterial = coneMat;
        this._beamMesh = beam;

        return beamGroup;
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

        // const body = new THREE.Mesh(
        //     new THREE.ConeGeometry(2, 6, 8),
        //     new THREE.MeshStandardMaterial({ color: 0x88aacc, metalness: 0.4, roughness: 0.4 })
        // );
        body.rotation.x = Math.PI / 2;
        this.visualGroup.add(body);

        body.rotation.x = Math.PI / 2;
        this.visualGroup.add(body);

        const beamGroup = this._buildProjectorBeam(6);
        this.visualGroup.add(beamGroup);

        this._modelSource = body;
    }

    get position() {
        return this.group.position;
    }

    get quaternion() {
        return this.group.quaternion;
    }

    toggle() {
        if (!this.visualGroup) return;
        if (!this._modelLoaded) return; // ha még nem töltött be, ne csináljon semmit
        this.visualGroup.visible = !this.visualGroup.visible;
    }

    update(input) {
        const { yaw, pitch, scroll, cameraRoll = 0 } = input;

        if (scroll !== 0) {
            this.speed -= Math.sign(scroll) * this._scrollAcceleration;
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

        // Vetítősugár halvány, pulzáló flicker-je
        if (this._beamMaterial) {
            const beamFlicker = 0.6 + Math.random() * 0.4;
            this._beamMaterial.opacity = 0.08 * beamFlicker;
        }

    }
}