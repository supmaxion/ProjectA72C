import * as THREE from 'three';

export class NebulaFog {
    constructor(scene, distance, color = '#1a1030') {
        this._scene = scene;

        const geo = new THREE.SphereGeometry(distance * 1.5, 24, 24);
        const mat = new THREE.MeshBasicMaterial({
            color,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.4,
            depthWrite: false,
            depthTest: false,
        });
        this.mesh = new THREE.Mesh(geo, mat);
        this.mesh.renderOrder = -10; // mindig legelőször, leghátrébb rajzolódjon
        scene.add(this.mesh);
    }

    update(cameraPosition) {
        this.mesh.position.copy(cameraPosition);
    }
}