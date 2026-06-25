import * as THREE from 'three';

export function buildShipMeshes(visualGroup) {


    // --- FÉM ANYAG (egységes, csillogó) ---
    const metalMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,           // világos ezüstös fémszín
        metalness: 0.85,            // erősen fémes
        roughness: 0.2,            // sima, tükröződő felület
        emissive: 0x000000,
        emissiveIntensity: 0,
        envMapIntensity: 1.9,
    });



    // Hozz létre egy csoportot a hajó alkatrészeinek
    const shipGroup = new THREE.Group();
    
    // Az egész hajó megdöntése 15 fokkal X tengely körül
    shipGroup.rotation.x = 15 * Math.PI / 180;


    // 1. HULL (törzs - henger alakú, vékonyabb)
    const hullGeo = new THREE.CylinderGeometry(0.3, 0.3, 2, 16);
    const hull = new THREE.Mesh(hullGeo, metalMaterial);
    hull.position.z = -0.2;
    hull.rotation.x = Math.PI / 2;  // henger vízszintesbe forgatása
    shipGroup.add(hull);

    // 2. COCKPIT (pilótafülke - kúp alakú, hosszúkásabb előre)
    const cockpitGeo = new THREE.ConeGeometry(0.3, 1.0, 16);
    const cockpit = new THREE.Mesh(cockpitGeo, metalMaterial);
    cockpit.position.set(0, 0, -0.1);
    cockpit.rotation.x = -Math.PI / 2;
    shipGroup.add(cockpit);

    // 3. RIGHT WING (jobb szárny - laposabb csonkagúla)
    const rightWingGeo = new THREE.CylinderGeometry(0.05, 0.25, 1.5, 4); // sugarak felezve
    const rightWing = new THREE.Mesh(rightWingGeo, metalMaterial);
    rightWing.position.set(1.1, 0, 0.3);
    rightWing.rotation.z = -Math.PI / 2;
    shipGroup.add(rightWing);

    // 4. LEFT WING (bal szárny - laposabb csonkagúla)
    const leftWingGeo = new THREE.CylinderGeometry(0.01, 0.25, 1.5, 4);
    const leftWing = new THREE.Mesh(leftWingGeo, metalMaterial);
    leftWing.position.set(-1.1, 0, 0.3);
    leftWing.rotation.z = Math.PI / 2;
    shipGroup.add(leftWing);

    // Add hozzá a csoportot a visualGroup-hoz
    visualGroup.add(shipGroup);

}