import * as THREE from 'three';

export function buildShipMeshes(visualGroup) {
    // --- Anyagok ---
    const primaryMetal = new THREE.MeshStandardMaterial({
        color: 0x4a7c9e,
        metalness: 0.9,
        roughness: 0.15,
        envMapIntensity: 2.0,
    });

    const darkMetal = new THREE.MeshStandardMaterial({
        color: 0x2a3a4a,
        metalness: 0.85,
        roughness: 0.3,
        envMapIntensity: 1.5,
    });

    const accentMetal = new THREE.MeshStandardMaterial({
        color: 0xc8a84a,
        metalness: 0.7,
        roughness: 0.2,
        envMapIntensity: 1.8,
    });

    const glowMaterial = new THREE.MeshStandardMaterial({
        color: 0x4af0ff,
        emissive: 0x4af0ff,
        emissiveIntensity: 0.5,
        metalness: 0.3,
        roughness: 0.4,
    });

    const wingMaterial = new THREE.MeshStandardMaterial({
        color: 0x6a9ac8,
        metalness: 0.8,
        roughness: 0.2,
        envMapIntensity: 1.7,
    });

    // Fő csoport
    const shipGroup = new THREE.Group();
    shipGroup.rotation.x = 10 * Math.PI / 180;

    // --- 1. FŐ TÖRZS (ellipszoid alakú) ---
    const bodyGeo = new THREE.SphereGeometry(0.6, 24, 24);
    const body = new THREE.Mesh(bodyGeo, primaryMetal);
    body.scale.set(1, 0.6, 1.8);
    body.position.z = -0.1;
    shipGroup.add(body);

    // --- 2. ORR (kúp) ---
    const noseGeo = new THREE.ConeGeometry(0.45, 0.8, 20);
    const nose = new THREE.Mesh(noseGeo, darkMetal);
    nose.position.set(0, 0, -0.9);
    nose.rotation.x = -Math.PI / 2;
    shipGroup.add(nose);

    // --- 3. FAR (kúp) ---
    const tailGeo = new THREE.ConeGeometry(0.4, 0.6, 20);
    const tail = new THREE.Mesh(tailGeo, darkMetal);
    tail.position.set(0, 0, 0.8);
    tail.rotation.x = Math.PI / 2;
    shipGroup.add(tail);

    // --- 4. NAGY SZÁRNYAK (V alakú, hátrafelé) ---
    // Jobb szárny
    const wingGroupRight = new THREE.Group();
    const wingGeo = new THREE.BoxGeometry(0.05, 0.7, 1.6);
    const wingRight = new THREE.Mesh(wingGeo, wingMaterial);
    wingRight.position.set(0, 0, -0.3);
    wingRight.rotation.z = -0.2;
    wingGroupRight.add(wingRight);
    
    // Szárnyvégi vezérsík
    const tipGeo = new THREE.BoxGeometry(0.05, 0.3, 0.4);
    const tipRight = new THREE.Mesh(tipGeo, accentMetal);
    tipRight.position.set(0, -0.5, -0.7);
    tipRight.rotation.z = -0.3;
    wingGroupRight.add(tipRight);
    
    wingGroupRight.position.set(1.0, 0, 0.2);
    wingGroupRight.rotation.z = -0.4;
    shipGroup.add(wingGroupRight);

    // Bal szárny
    const wingGroupLeft = wingGroupRight.clone();
    wingGroupLeft.position.set(-1.0, 0, 0.2);
    wingGroupLeft.rotation.z = 0.4;
    wingGroupLeft.scale.x = -1;
    shipGroup.add(wingGroupLeft);

    // --- 5. KIS SZÁRNYAK (elöl) ---
    const canardGeo = new THREE.BoxGeometry(0.04, 0.3, 0.6);
    
    const canardRight = new THREE.Mesh(canardGeo, accentMetal);
    canardRight.position.set(0.5, 0.15, -0.8);
    canardRight.rotation.z = -0.5;
    canardRight.rotation.x = -0.2;
    shipGroup.add(canardRight);
    
    const canardLeft = canardRight.clone();
    canardLeft.position.set(-0.5, 0.15, -0.8);
    canardLeft.rotation.z = 0.5;
    canardLeft.rotation.x = -0.2;
    shipGroup.add(canardLeft);

    // --- 6. FAROK VEZÉRSÍK (függőleges) ---
    const finGeo = new THREE.BoxGeometry(0.04, 0.5, 0.5);
    const fin = new THREE.Mesh(finGeo, darkMetal);
    fin.position.set(0, 0.4, 0.6);
    fin.rotation.x = 0.2;
    shipGroup.add(fin);

    // --- 7. HAJTÓMŰVEK (cső alakúak) ---
    const engineGeo = new THREE.CylinderGeometry(0.15, 0.2, 0.3, 12);
    const engineMat = new THREE.MeshStandardMaterial({
        color: 0x1a2a3a,
        metalness: 0.9,
        roughness: 0.1,
    });

    // Fő hajtómű
    const mainEngine = new THREE.Mesh(engineGeo, engineMat);
    mainEngine.position.set(0, -0.1, 1.1);
    mainEngine.rotation.x = Math.PI / 2;
    shipGroup.add(mainEngine);

    // Két oldalsó hajtómű
    const sideEngineGeo = new THREE.CylinderGeometry(0.1, 0.15, 0.25, 10);
    const sideEngineMat = new THREE.MeshStandardMaterial({
        color: 0x2a3a4a,
        metalness: 0.85,
        roughness: 0.15,
    });

    const engineLeft = new THREE.Mesh(sideEngineGeo, sideEngineMat);
    engineLeft.position.set(-0.5, -0.1, 1.0);
    engineLeft.rotation.x = Math.PI / 2;
    shipGroup.add(engineLeft);

    const engineRight = new THREE.Mesh(sideEngineGeo, sideEngineMat);
    engineRight.position.set(0.5, -0.1, 1.0);
    engineRight.rotation.x = Math.PI / 2;
    shipGroup.add(engineRight);

    // --- 8. FÉNYEK (glow) ---
    // Orr fény
    const lightGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const light = new THREE.Mesh(lightGeo, glowMaterial);
    light.position.set(0, 0, -1.3);
    shipGroup.add(light);

    // Szárnyvégi fények
    const wingLightGeo = new THREE.SphereGeometry(0.04, 6, 6);
    const wingLightMat = new THREE.MeshStandardMaterial({
        color: 0xff4a4a,
        emissive: 0xff4a4a,
        emissiveIntensity: 0.8,
    });
    
    const wingLightRight = new THREE.Mesh(wingLightGeo, wingLightMat);
    wingLightRight.position.set(1.5, -0.45, -0.1);
    shipGroup.add(wingLightRight);

    const wingLightMatLeft = new THREE.MeshStandardMaterial({
        color: 0x4aff4a,
        emissive: 0x4aff4a,
        emissiveIntensity: 0.8,
    });
    
    const wingLightLeft = new THREE.Mesh(wingLightGeo, wingLightMatLeft);
    wingLightLeft.position.set(-1.5, -0.45, -0.1);
    shipGroup.add(wingLightLeft);

    // --- 9. KABIN (pilótafülke) ---
    const cabinMat = new THREE.MeshStandardMaterial({
        color: 0x88ccff,
        metalness: 0.1,
        roughness: 0.05,
        transparent: true,
        opacity: 0.6,
        envMapIntensity: 0.5,
    });

    const cabinGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.scale.set(0.8, 0.5, 0.7);
    cabin.position.set(0, 0.2, -0.5);
    shipGroup.add(cabin);

    // --- 10. DEKORÁCIÓK (panelvonalak) ---
    const panelMat = new THREE.MeshStandardMaterial({
        color: 0x3a5a7a,
        metalness: 0.7,
        roughness: 0.3,
    });

    for (let i = -0.4; i <= 0.4; i += 0.4) {
        const panelGeo = new THREE.BoxGeometry(0.02, 0.02, 0.6);
        const panel = new THREE.Mesh(panelGeo, panelMat);
        panel.position.set(i, 0, 0.1);
        shipGroup.add(panel);
    }

    // --- 11. ANTENNA ---
    const antennaMat = new THREE.MeshStandardMaterial({
        color: 0xc8a84a,
        metalness: 0.6,
        roughness: 0.3,
    });

    const antennaBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.03, 0.15, 6),
        antennaMat
    );
    antennaBase.position.set(0, 0.4, -0.4);
    shipGroup.add(antennaBase);

    const antennaTip = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 6, 6),
        new THREE.MeshStandardMaterial({
            color: 0xff6a4a,
            emissive: 0xff6a4a,
            emissiveIntensity: 0.3,
        })
    );
    antennaTip.position.set(0, 0.5, -0.4);
    shipGroup.add(antennaTip);

    // Hozzáadás a visualGroup-hoz
    visualGroup.add(shipGroup);
}