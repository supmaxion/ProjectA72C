import * as THREE from 'three';
import { MINING, MATERIALS } from '../config.js';

const STATE = {
    IDLE: 'IDLE',
    EXTENDING: 'EXTENDING',
    MINING: 'MINING',
    RETRACTING: 'RETRACTING',
};

function getMaterialColor(materialId) {
    const found = MATERIALS.types.find(t => t.id === materialId);
    return found?.color ?? 0xffffff;
}

export class MiningSystem {
    constructor(scene, camera, inventory, { onAsteroidMined } = {}) {
        this.scene = scene;
        this.camera = camera;
        this.inventory = inventory;
        this.onAsteroidMined = onAsteroidMined;

        this.state = STATE.IDLE;
        this.progress = 0;
        this.miningTime = 0;
        this.target = null;
        this._explosions = [];
        this._buildTentacle();
        this._buildMaterialChunk();
    }

    _buildTentacle() {
        const geo = new THREE.CylinderGeometry(1.2, 1.8, 1, 8);
        const mat = new THREE.MeshBasicMaterial({
            color: MINING.tentacleColor, transparent: true, opacity: 0.85,
        });
        this.tentacle = new THREE.Mesh(geo, mat);
        this.tentacle.visible = false;
        this.scene.add(this.tentacle);

        const tipGeo = new THREE.SphereGeometry(2.2, 8, 8);
        const tipMat = new THREE.MeshBasicMaterial({
            color: MINING.tipColor, transparent: true, opacity: 0.9,
        });
        this.tip = new THREE.Mesh(tipGeo, tipMat);
        this.tip.visible = false;
        this.scene.add(this.tip);
    }

    _buildMaterialChunk() {
        const geo = new THREE.IcosahedronGeometry(MINING.materialChunkRadius, 1.0); //a bányászott darabka jön a csövön
        const mat = new THREE.MeshBasicMaterial({
            color: 0xffffff, transparent: true, opacity: 0.95,
        });
        this.materialChunk = new THREE.Mesh(geo, mat);
        this.materialChunk.visible = false;
        this.scene.add(this.materialChunk);
    }

    _getStartWorldPoint() {
        return this.camera.localToWorld(MINING.tentacleStartLocalOffset.clone());
    }

    update(delta, ship, asteroidBelt) {
        this._updateExplosions(delta);

        const shipPosition = ship.position;
        const shipForward = new THREE.Vector3(0, 0, -1).applyQuaternion(ship.quaternion);

        if (this.state === STATE.IDLE) {
            const target = asteroidBelt.getMineableTarget(
                shipPosition, shipForward, MINING.range, MINING.viewAngleDeg
            );
            if (target) {
                this.target = target;
                this.state = STATE.EXTENDING;
                this.progress = 0;
                this.tentacle.visible = true;
                this.tip.visible = true;
            }
            return;
        }

        if (!this.target || !asteroidBelt.asteroids.includes(this.target)) {
            this._reset();
            return;
        }

        const toTarget = this.target.mesh.position.clone().sub(shipPosition);
        const dist = toTarget.length();
        const angle = shipForward.angleTo(toTarget.normalize());
        const outOfRange = dist > MINING.range || angle > THREE.MathUtils.degToRad(MINING.viewAngleDeg);

        if (this.state === STATE.EXTENDING) {
            if (outOfRange) {
                this.state = STATE.RETRACTING;
            } else {
                this.progress = Math.min(1, this.progress + delta / MINING.extendDuration);
                if (this.progress >= 1) {
                    this.state = STATE.MINING;
                    this.miningTime = 0;
                    this.materialChunk.material.color.setHex(getMaterialColor(this.target.materialType));
                    this.materialChunk.visible = true;
                }
            }
        } else if (this.state === STATE.MINING) {
            if (outOfRange) {
                this.state = STATE.RETRACTING;
                this.materialChunk.visible = false;
            } else {
                this.miningTime += delta;
                if (this.miningTime >= MINING.duration) {
                    const result = asteroidBelt.completeMining(this.target.id);
                    if (result) {
                        this.inventory[result.materialType] = (this.inventory[result.materialType] || 0) + result.amount;
                        this._spawnExplosion(result.position, result.materialType, result.velocity);
                        this.onAsteroidMined?.(result);
                    }
                    this._reset();
                    return;
                }
            }
        } else if (this.state === STATE.RETRACTING) {
            this.progress = Math.max(0, this.progress - delta / MINING.retractDuration);
            if (this.progress <= 0) {
                this._reset();
                return;
            }
        }

        this._updateVisual();
    }

    _updateVisual() {
        const start = this._getStartWorldPoint();
        const end = this.target.mesh.position;
        const currentEnd = start.clone().lerp(end, this.progress);

        const dir = new THREE.Vector3().subVectors(currentEnd, start);
        const length = Math.max(dir.length(), 0.001);

        this.tentacle.position.copy(start).addScaledVector(dir, 0.5);
        this.tentacle.scale.set(1, length, 1);
        this.tentacle.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());

        this.tip.position.copy(currentEnd);
        this.tip.scale.setScalar(
            this.state === STATE.MINING ? 1 + Math.sin(performance.now() * 0.02) * 0.15 : 1
        );

        if (this.state === STATE.MINING) {
            // az anyag-darab a % szerint halad az aszteroidától (t=0) a hajó felé (t=1)
            const t = this.miningTime / MINING.duration;
            const chunkPos = end.clone().lerp(start, t);
            this.materialChunk.position.copy(chunkPos);
            this.materialChunk.scale.setScalar(1 + Math.sin(performance.now() * 0.03) * 0.12);
        }
    }

    _reset() {
        this.state = STATE.IDLE;
        this.progress = 0;
        this.miningTime = 0;
        this.target = null;
        this.tentacle.visible = false;
        this.tip.visible = false;
        this.materialChunk.visible = false;
    }

	_spawnExplosion(position, materialType, asteroidVelocity = new THREE.Vector3()) {
		const color = getMaterialColor(materialType);
		const count = MINING.explosionChunkCount;

		const baseVelocity = asteroidVelocity.clone();

		// A kirepülési irány merőleges legyen az aszteroida mozgásirányára,
		// hogy ténylegesen OLDALRA repüljenek szét, ne a mozgás vonalában
		const travelDir = baseVelocity.lengthSq() > 0.0001
			? baseVelocity.clone().normalize()
			: new THREE.Vector3(0, 1, 0); // ha áll az aszteroida, essen vissza egy tetszőleges tengelyre

		// egy tetszőleges, travelDir-re merőleges bázis-sík (up/right)
		const arbitrary = Math.abs(travelDir.y) < 0.9
			? new THREE.Vector3(0, 1, 0)
			: new THREE.Vector3(1, 0, 0);
		const right = new THREE.Vector3().crossVectors(travelDir, arbitrary).normalize();
		const up = new THREE.Vector3().crossVectors(right, travelDir).normalize();

		for (let i = 0; i < count; i++) {
			const geo = new THREE.IcosahedronGeometry(MINING.materialChunkRadius, 0);
			const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 });
			const mesh = new THREE.Mesh(geo, mat);
			mesh.position.copy(position);
			this.scene.add(mesh);

			// 120°-onként szétosztva a travelDir-re merőleges síkban (right/up bázison)
			const theta = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
			const lateralDir = right.clone().multiplyScalar(Math.cos(theta))
				.add(up.clone().multiplyScalar(Math.sin(theta)))
				.normalize();

			const kickSpeed = MINING.explosionKickSpeed.min
				+ Math.random() * (MINING.explosionKickSpeed.max - MINING.explosionKickSpeed.min);
			const velocity = baseVelocity.clone().addScaledVector(lateralDir, kickSpeed);

			const spin = new THREE.Vector3(
				Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5
			).multiplyScalar(1.5);

			this._explosions.push({ mesh, velocity, spin, age: 0, life: MINING.explosionDuration });
		}
	}
	
	_updateExplosions(delta) {
		for (let i = this._explosions.length - 1; i >= 0; i--) {
			const ex = this._explosions[i];
			ex.age += delta;

			ex.mesh.position.addScaledVector(ex.velocity, delta);
			ex.mesh.rotation.x += ex.spin.x * delta;
			ex.mesh.rotation.y += ex.spin.y * delta;
			ex.mesh.rotation.z += ex.spin.z * delta;

			// az élettartam utolsó 40%-ában kezd halványulni
			const fadeStart = ex.life * 0.6;
			if (ex.age > fadeStart) {
				const t = (ex.age - fadeStart) / (ex.life - fadeStart);
				ex.mesh.material.opacity = Math.max(0, 0.95 * (1 - t));
			}

			if (ex.age >= ex.life) {
				this.scene.remove(ex.mesh);
				ex.mesh.geometry.dispose();
				ex.mesh.material.dispose();
				this._explosions.splice(i, 1);
			}
		}
	}

    getProgressInfo() {
        if (this.state !== STATE.MINING) return null;
        return { time: this.miningTime, duration: MINING.duration };
    }
}
