import * as THREE from 'three';
import { SYSTEM_VISIBILITY, MATERIALS, MINING } from '../config.js';
import { createRng } from '../utils/seededRandom.js';

function pickMaterial(rng) {
    const types = MATERIALS.types;
    const totalWeight = types.reduce((s, t) => s + t.weight, 0);
    let r = rng() * totalWeight;
    for (const t of types) {
        if (r < t.weight) return t.id;
        r -= t.weight;
    }
    return types[types.length - 1].id;
}

export class AsteroidField {
    constructor({
        center, innerRadius, outerRadius, count, minSize, maxSize, color,
        seed = 'default', beltId = 'main', minedIds = [],
    }) {
        this.center = center;
        this.seed = seed;
        this.beltId = beltId;
        this.minedIds = new Set(minedIds);
        this.asteroids = [];

        const geoVariants = [];
        for (let i = 0; i < 4; i++) {
            const geo = new THREE.IcosahedronGeometry(1, 0);
            const pos = geo.attributes.position;
            for (let v = 0; v < pos.count; v++) {
                const jitter = 0.7 + Math.random() * 0.6;
                pos.setXYZ(v, pos.getX(v) * jitter, pos.getY(v) * jitter, pos.getZ(v) * jitter);
            }
            geo.computeVertexNormals();
            geoVariants.push(geo);
        }

        const material = new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0.1 });

        this.group = new THREE.Group();

        for (let i = 0; i < count; i++) {
            const id = `${beltId}-${i}`;
            if (this.minedIds.has(id)) continue; // már kibányászott — ki se rakjuk

            const angle = Math.random() * Math.PI * 2;
            const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
            const height = (Math.random() - 0.5) * (outerRadius - innerRadius) * 0.15;
            const size = minSize + Math.random() * (maxSize - minSize);

            const geo = geoVariants[Math.floor(Math.random() * geoVariants.length)];
            const mesh = new THREE.Mesh(geo, material);
            mesh.scale.setScalar(size);
            mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

            const orbitSpeed = 0.0003 + Math.random() * 0.0004;
            const spinSpeed = (Math.random() - 0.5) * 0.02;

            // Determinisztikus anyag/mennyiség — ugyanaz a seed+id mindig ugyanazt adja
            const rng = createRng(`${seed}:${beltId}:${id}`);
            const materialType = pickMaterial(rng);
            const amount = Math.round(
                MINING.yieldAmount.min + rng() * (MINING.yieldAmount.max - MINING.yieldAmount.min)
            );

            this.asteroids.push({
                id, mesh, angle, radius, height, orbitSpeed, spinSpeed, size,
                materialType, amount,
                velocity: new THREE.Vector3(), // a szétrobbanó darabkákhoz tároljuk a sebességvektort
            });
            this.group.add(mesh);
        }
    }

	update(shipPosition) {
		const now = performance.now();
		const dt = this._lastUpdateTime != null
			? Math.max((now - this._lastUpdateTime) / 1000, 0.0001)
			: 1 / 60;
		this._lastUpdateTime = now;

		for (const a of this.asteroids) {
			const prevX = a.mesh.position.x;
			const prevY = a.mesh.position.y;
			const prevZ = a.mesh.position.z;

			a.angle += a.orbitSpeed;
			a.mesh.position.set(
				this.center.x + Math.cos(a.angle) * a.radius,
				this.center.y + a.height,
				this.center.z + Math.sin(a.angle) * a.radius
			);

			// tényleges sebesség (világ-egység/mp) finite difference-szel
			a.velocity.set(
				(a.mesh.position.x - prevX) / dt,
				(a.mesh.position.y - prevY) / dt,
				(a.mesh.position.z - prevZ) / dt
			);

			a.mesh.rotation.x += a.spinSpeed;
			a.mesh.rotation.y += a.spinSpeed * 0.7;

			if (shipPosition) {
				const dist = a.mesh.position.distanceTo(shipPosition);
				a.mesh.visible = dist < SYSTEM_VISIBILITY.systemRevealDistance;
			}
		}
	}

    // Ütközésvizsgálathoz: visszaadja a legközelebbi találatot, vagy null-t
    checkCollision(shipPosition) {
        for (const a of this.asteroids) {
            const dist = shipPosition.distanceTo(a.mesh.position);
            if (dist < a.size) {
                return { name: 'Asteroid', position: a.mesh.position, radius: a.size };
            }
        }
        return null;
    }

    // Bányászathoz: legközelebbi célpont a hajó orra előtti kúpban, range-en belül
    getMineableTarget(shipPosition, shipForward, range, viewAngleDeg) {
        const maxAngle = THREE.MathUtils.degToRad(viewAngleDeg);
        let best = null;
        let bestDist = Infinity;

        for (const a of this.asteroids) {
            const toAsteroid = a.mesh.position.clone().sub(shipPosition);
            const dist = toAsteroid.length();
            if (dist > range || dist >= bestDist) continue;

            toAsteroid.normalize();
            const angle = shipForward.angleTo(toAsteroid);
            if (angle > maxAngle) continue;

            best = a;
            bestDist = dist;
        }
        return best;
    }

    // Bányászat lezárása: eltávolítja az aszteroidát, visszaadja az anyagot
    completeMining(asteroidId) {
        const idx = this.asteroids.findIndex(a => a.id === asteroidId);
        if (idx === -1) return null;

        const a = this.asteroids[idx];
        this.group.remove(a.mesh);
        this.asteroids.splice(idx, 1);
        this.minedIds.add(asteroidId);

		return {
			materialType: a.materialType,
			amount: a.amount,
			position: a.mesh.position.clone(),
			velocity: a.velocity.clone(),
		};
    }
}
