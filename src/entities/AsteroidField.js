import * as THREE from 'three';
import { SYSTEM_VISIBILITY } from '../config.js';


export class AsteroidField {
    constructor({ center, innerRadius, outerRadius, count, minSize, maxSize, color }) {
        this.center = center;
        this.asteroids = [];

        const geoVariants = [];
        for (let i = 0; i < 4; i++) {
            const geo = new THREE.IcosahedronGeometry(1, 0);
            // szabálytalanítás: vertexek random eltolása
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

            this.asteroids.push({ mesh, angle, radius, height, orbitSpeed, spinSpeed, size });
            this.group.add(mesh);
        }
    }

    update(shipPosition) {
        for (const a of this.asteroids) {
            a.angle += a.orbitSpeed;
            a.mesh.position.set(
                this.center.x + Math.cos(a.angle) * a.radius,
                this.center.y + a.height,
                this.center.z + Math.sin(a.angle) * a.radius
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
}