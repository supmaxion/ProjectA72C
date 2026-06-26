import * as THREE from 'three';

export function buildShipMeshes(visualGroup) {
    // --- Anyagok (új színvilág: ezüst-kékes-fekete sci-fi) ---
    const primaryMetal = new THREE.MeshStandardMaterial({
        color: 0x7799bb,
        metalness: 0.95,
        roughness: 0.1,
        envMapIntensity: 2.2,
    });

    const darkMetal = new THREE.MeshStandardMaterial({
        color: 0x1f2a3a,
        metalness: 0.9,
        roughness: 0.25,
        envMapIntensity: 1.6,
    });

    const accentMetal = new THREE.MeshStandardMaterial({
        color: 0x00ddff,
        metalness: 0.8,
        roughness: 0.15,
        envMapIntensity: 2.0,
    });

    const glowMaterial = new THREE.MeshStandardMaterial({
        color: 0x44ffff,
        emissive: 0x44ffff,
        emissiveIntensity: 0.7,
        metalness: 0.4,
        roughness: 0.3,
    });

    const wingMaterial = new THREE.MeshStandardMaterial({
        color: 0x5588aa,
        metalness: 0.85,
        roughness: 0.2,
        envMapIntensity: 1.8,
    });

    // Fő csoport
    const shipGroup = new THREE.Group();
    shipGroup.rotation.x = 8 * Math.PI / 180;

    // --- 1. FŐ TÖRZS (hosszú, elegáns kapszula) ---
    const bodyGeo = new THREE.CylinderGeometry(0.45, 0.55, 3.2, 24, 1, false);
    const body = new THREE.Mesh(bodyGeo, primaryMetal);
    body.rotation.x = Math.PI / 2;
    body.position.z = 0.1;
    shipGroup.add(body);

    // Törzs kiemelések (középső vastagabb rész)
    const midRingGeo = new THREE.CylinderGeometry(0.58, 0.58, 0.6, 24);
    const midRing = new THREE.Mesh(midRingGeo, darkMetal);
    midRing.rotation.x = Math.PI / 2;
    midRing.position.z = 0.3;
    shipGroup.add(midRing);

    // --- 2. ORR (áramvonalas, több szegmenses) ---
    const noseGeo = new THREE.ConeGeometry(0.42, 1.1, 24);
    const nose = new THREE.Mesh(noseGeo, darkMetal);
    nose.position.set(0, 0, -1.95);
    nose.rotation.x = -Math.PI / 2;
    shipGroup.add(nose);

    // Orr finomítás
    const noseTipGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const noseTip = new THREE.Mesh(noseTipGeo, accentMetal);
    noseTip.position.set(0, 0, -2.45);
    shipGroup.add(noseTip);

    // --- 3. FAR (erősebb, több hajtóműves) ---
    const tailBaseGeo = new THREE.CylinderGeometry(0.5, 0.65, 0.8, 20);
    const tailBase = new THREE.Mesh(tailBaseGeo, darkMetal);
    tailBase.rotation.x = Math.PI / 2;
    tailBase.position.z = 1.8;
    shipGroup.add(tailBase);

    // --- 4. NAGY OLDALSÓ NACELLES (hajtómű gondola stílus) ---
    const nacelleGeo = new THREE.CylinderGeometry(0.18, 0.22, 2.4, 16);
    
    const nacelleLeft = new THREE.Mesh(nacelleGeo, wingMaterial);
    nacelleLeft.rotation.x = Math.PI / 2;
    nacelleLeft.position.set(-1.1, 0, 0.4);
    nacelleLeft.rotation.z = 0.12;
    shipGroup.add(nacelleLeft);

    const nacelleRight = nacelleLeft.clone();
    nacelleRight.position.x = 1.1;
    nacelleRight.rotation.z = -0.12;
    shipGroup.add(nacelleRight);

    // Nacelle vége (fényesebb)
    const nacelleEndGeo = new THREE.CylinderGeometry(0.24, 0.19, 0.4, 16);
    const nacelleEndMat = new THREE.MeshStandardMaterial({
        color: 0x112244,
        metalness: 0.9,
        roughness: 0.1,
    });

    const nacelleEndL = new THREE.Mesh(nacelleEndGeo, nacelleEndMat);
    nacelleEndL.rotation.x = Math.PI / 2;
    nacelleEndL.position.set(-1.1, 0, 1.65);
    shipGroup.add(nacelleEndL);

    const nacelleEndR = nacelleEndL.clone();
    nacelleEndR.position.x = 1.1;
    shipGroup.add(nacelleEndR);

    // --- 5. HÁTSÓ HAJTÓMŰVEK (3 darab) ---
    const engineGeo = new THREE.CylinderGeometry(0.22, 0.28, 0.45, 16);
    const engineMat = new THREE.MeshStandardMaterial({
        color: 0x0a1a2a,
        metalness: 0.95,
        roughness: 0.08,
    });

    const mainEngine = new THREE.Mesh(engineGeo, engineMat);
    mainEngine.rotation.x = Math.PI / 2;
    mainEngine.position.set(0, 0, 2.1);
    shipGroup.add(mainEngine);

    const sideEngineL = new THREE.Mesh(engineGeo, engineMat);
    sideEngineL.rotation.x = Math.PI / 2;
    sideEngineL.position.set(-0.55, 0, 1.95);
    shipGroup.add(sideEngineL);

    const sideEngineR = sideEngineL.clone();
    sideEngineR.position.x = 0.55;
    shipGroup.add(sideEngineR);

    // --- 6. KABIN / HID (felül) ---
    const cabinGeo = new THREE.SphereGeometry(0.38, 20, 20);
    const cabinMat = new THREE.MeshStandardMaterial({
        color: 0xaaddff,
        metalness: 0.2,
        roughness: 0.1,
        transparent: true,
        opacity: 0.65,
        envMapIntensity: 0.8,
    });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.scale.set(1, 0.45, 0.85);
    cabin.position.set(0, 0.45, -0.4);
    shipGroup.add(cabin);

    // --- 7. SZÁRNYAK (keskenyebb, elegánsabb, hátrafelé suhanó) ---
    const wingGeo = new THREE.BoxGeometry(2.8, 0.08, 1.1);
    const wing = new THREE.Mesh(wingGeo, wingMaterial);
    wing.position.set(0, 0, 0.6);
    wing.rotation.x = -0.15;
    shipGroup.add(wing);

    // Szárny élek
    const wingEdgeGeo = new THREE.BoxGeometry(2.9, 0.04, 0.3);
    const wingEdge = new THREE.Mesh(wingEdgeGeo, accentMetal);
    wingEdge.position.set(0, 0.08, 0.4);
    wingEdge.rotation.x = -0.15;
    shipGroup.add(wingEdge);

    // --- 8. ELÜLSŐ KIS SZÁRNYAK (canard) ---
    const canardGeo = new THREE.BoxGeometry(0.9, 0.06, 0.45);
    
    const canardL = new THREE.Mesh(canardGeo, accentMetal);
    canardL.position.set(-0.9, 0.25, -1.1);
    canardL.rotation.x = -0.3;
    canardL.rotation.z = 0.4;
    shipGroup.add(canardL);

    const canardR = canardL.clone();
    canardR.position.x = 0.9;
    canardR.rotation.z = -0.4;
    shipGroup.add(canardR);

    // --- 9. FÉNYEK ---
    // Orr jelzőfény
    const noseLight = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 8, 8),
        glowMaterial
    );
    noseLight.position.set(0, 0, -2.6);
    shipGroup.add(noseLight);

    // Nacelle fények
    const nacelleGlowMat = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 1.2,
    });

    const glowL = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), nacelleGlowMat);
    glowL.position.set(-1.1, 0, 1.95);
    shipGroup.add(glowL);

    const glowR = glowL.clone();
    glowR.position.x = 1.1;
    shipGroup.add(glowR);

    // --- 10. ANTENNÁK + DEKOR ---
    const antenna = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.9, 6),
        accentMetal
    );
    antenna.position.set(0, 0.6, -0.8);
    antenna.rotation.z = Math.PI / 6;
    shipGroup.add(antenna);

    // Kis panelek a törzsön
    const panelMat = new THREE.MeshStandardMaterial({
        color: 0x334455,
        metalness: 0.7,
        roughness: 0.4,
    });

    for (let i = -1; i <= 1; i += 1) {
        const panel = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.02, 0.8),
            panelMat
        );
        panel.position.set(i * 0.4, 0.52, 0.2);
        shipGroup.add(panel);
    }

    // Hozzáadás a visualGroup-hoz
    visualGroup.add(shipGroup);
}