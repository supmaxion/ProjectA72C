import * as THREE from 'three';
import { SYSTEM_VISIBILITY } from '../config.js';

export class SpaceStation {
    constructor(position, { ringRadius = 200, ringThickness = 12, color = 0x66ccff } = {}) {
        this.group = new THREE.Group();
        this.group.position.copy(position);

        const ringGeo = new THREE.TorusGeometry(ringRadius, ringThickness, 12, 48);
        const ringMat = new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 0.3,
            metalness: 0.6,
            roughness: 0.3,
        });
        this.ring = new THREE.Mesh(ringGeo, ringMat);
        this.group.add(this.ring);

        const coreGeo = new THREE.CylinderGeometry(ringThickness * 1.5, ringThickness * 1.5, ringRadius * 0.4, 12);
        const coreMat = new THREE.MeshStandardMaterial({ color: 0x445566, metalness: 0.7, roughness: 0.4 });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.rotation.x = Math.PI / 2;
        this.group.add(core);

        this.position = this.group.position;
        this.radius = ringRadius + ringThickness;
    }

    update(cameraPosition) {
        this.ring.rotation.z += 0.0015;

        if (cameraPosition) {
            const dist = this.position.distanceTo(cameraPosition);
            this.visible = dist < SYSTEM_VISIBILITY.stationRevealDsitance;
        }
    }

    get visible() {
        return this.group.visible;
    }

    set visible(value) {
        this.group.visible = value;
    }
}
