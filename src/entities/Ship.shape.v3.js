import * as THREE from 'three';

export function buildShipMeshes(visualGroup) {
    // --- Anyagok (Anyagok a kép alapján: mélykék, sötét váz és élénk kék fények) ---
    const primaryBlue = new THREE.MeshStandardMaterial({
        color: 0x1b365d, // Mélykék páncélzat
        metalness: 0.7,
        roughness: 0.3,
        envMapIntensity: 1.5,
    });

    const frameMetal = new THREE.MeshStandardMaterial({
        color: 0x2b2e33, // Sötétszürke/fekete rácsszerkezet és belső váz
        metalness: 0.9,
        roughness: 0.4,
    });

    const copperAccent = new THREE.MeshStandardMaterial({
        color: 0xb87333, // Réz/bronz szegélyek az orron és részleteknél
        metalness: 0.8,
        roughness: 0.2,
    });

    const solarMaterial = new THREE.MeshStandardMaterial({
        color: 0x152215, // Nagyon sötét zöldes-fekete napelem textúra hatás
        metalness: 0.9,
        roughness: 0.1,
    });

    const energyGlow = new THREE.MeshStandardMaterial({
        color: 0x00d2ff, // Élénk, neonkék belső energiafény
        emissive: 0x00d2ff,
        emissiveIntensity: 1.2,
    });

    const engineCoreGlow = new THREE.MeshStandardMaterial({
        color: 0x66ffff, // Még világosabb kék a hajtóművek belsejébe
        emissive: 0x66ffff,
        emissiveIntensity: 1.5,
    });

    const glassMat = new THREE.MeshStandardMaterial({
        color: 0x111111,
        metalness: 0.9,
        roughness: 0.05,
        transparent: true,
        opacity: 0.6
    });

    // Fő csoport
    const shipGroup = new THREE.Group();
    shipGroup.rotation.x = 5 * Math.PI / 180; 

    // --- 1. DUPLA IKER-ORR (Két előrenyúló csőr) ---
    const noseLength = 1.4;
    const noseGeo = new THREE.BoxGeometry(0.25, 0.2, noseLength);
    
    // Bal oldali orr-ág
    const noseLeft = new THREE.Mesh(noseGeo, primaryBlue);
    noseLeft.position.set(-0.35, -0.1, -0.8);
    // Réz elülső végződés
    const noseTipLeft = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.21, 0.1), copperAccent);
    noseTipLeft.position.set(0, 0, -noseLength/2);
    noseLeft.add(noseTipLeft);
    shipGroup.add(noseLeft);

    // Jobb oldali orr-ág
    const noseRight = noseLeft.clone();
    noseRight.position.x = 0.35;
    shipGroup.add(noseRight);

    // Belső neonkéken világító mag az orrok között
    const coreGeo = new THREE.BoxGeometry(0.4, 0.1, 0.8);
    const energyCore = new THREE.Mesh(coreGeo, energyGlow);
    energyCore.position.set(0, -0.1, -0.4);
    shipGroup.add(energyCore);


    // --- 2. KÖZÉPSŐ TÖRZS ÉS RÁCSOS VÁZ ---
    const bodyGeo = new THREE.BoxGeometry(0.8, 0.4, 1.2);
    const body = new THREE.Mesh(bodyGeo, frameMetal);
    body.position.set(0, 0, 0.2);
    shipGroup.add(body);

    // Külső kék burkolóelemek a törzs oldalára
    const sideArmorGeo = new THREE.BoxGeometry(0.1, 0.35, 1.0);
    const sideArmorLeft = new THREE.Mesh(sideArmorGeo, primaryBlue);
    sideArmorLeft.position.set(-0.45, 0, 0.2);
    shipGroup.add(sideArmorLeft);

    const sideArmorRight = sideArmorLeft.clone();
    sideArmorRight.position.x = 0.45;
    shipGroup.add(sideArmorRight);


    // --- 3. PILÓTAFÜLKE (Kupolás, sötétített üveg, fent középen) ---
    const cabinGeo = new THREE.SphereGeometry(0.25, 16, 12);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.scale.set(1, 0.8, 1.3);
    cabin.position.set(0, 0.25, 0.1);
    shipGroup.add(cabin);

    // Gyűrű/keret a fülke köré
    const cabinFrameGeo = new THREE.TorusGeometry(0.26, 0.03, 8, 24);
    const cabinFrame = new THREE.Mesh(cabinFrameGeo, copperAccent);
    cabinFrame.position.set(0, 0.22, 0.1);
    cabinFrame.rotation.x = Math.PI / 2;
    shipGroup.add(cabinFrame);


    // --- 4. HATALMAS OLDALSÓ HAJTÓMŰVEK (Hengeres turbinák) ---
    const mainEngineGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.8, 16);
    const innerGlowGeo = new THREE.CylinderGeometry(0.23, 0.23, 0.05, 12);

    // Bal oldali nagy hajtómű pod
    const enginePodLeft = new THREE.Group();
    const engineOuterLeft = new THREE.Mesh(mainEngineGeo, primaryBlue);
    engineOuterLeft.rotation.x = Math.PI / 2;
    enginePodLeft.add(engineOuterLeft);

    // Réz gyűrűk a hajtómű elején és hátulján
    const ringGeo = new THREE.TorusGeometry(0.28, 0.02, 8, 16);
    const ringFrontLeft = new THREE.Mesh(ringGeo, copperAccent);
    ringFrontLeft.position.z = -0.4;
    enginePodLeft.add(ringFrontLeft);

    // Világító belső rész (előre és hátra is)
    const glowFrontLeft = new THREE.Mesh(innerGlowGeo, engineCoreGlow);
    glowFrontLeft.position.z = -0.38;
    glowFrontLeft.rotation.x = Math.PI / 2;
    enginePodLeft.add(glowFrontLeft);

    const glowBackLeft = glowFrontLeft.clone();
    glowBackLeft.position.z = 0.38;
    enginePodLeft.add(glowBackLeft);

    enginePodLeft.position.set(-0.8, 0, 0.3);
    shipGroup.add(enginePodLeft);

    // Jobb oldali nagy hajtómű pod
    const enginePodRight = enginePodLeft.clone();
    enginePodRight.position.x = 0.8;
    shipGroup.add(enginePodRight);


    // --- 5. DUPLA MEGNÖVELT SZÁRNYAK ÉS FEGYVERZET ---
    // Jobb szárnycsoport (Méretek és eltolások megduplázva/növelve az extra fesztávért)
    const wingGroupRight = new THREE.Group();
    
    // Szárnytő rácsos szerkezet (Megnyújtva 0.6-ról 1.2-re)
    const strut1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.04), frameMetal);
    strut1.position.set(0.6, 0, 0);
    strut1.rotation.y = -0.2;
    wingGroupRight.add(strut1);

    const strut2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.04), frameMetal);
    strut2.position.set(0.6, 0, 0.3);
    strut2.rotation.y = 0.4;
    wingGroupRight.add(strut2);

    // Külső fegyver/antenna gondola (Kijebb tolva 0.6-ról 1.2-re)
    const wingTipWeapon = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8), frameMetal);
    wingTipWeapon.rotation.x = Math.PI / 2;
    wingTipWeapon.position.set(1.2, 0, 0.1);
    wingGroupRight.add(wingTipWeapon);

    // Hosszú tű-ágyúcsövek előre (Kijebb tolva 1.2-re)
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.02, 0.6, 6), copperAccent);
    barrel.rotation.x = -Math.PI / 2;
    barrel.position.set(1.2, 0, -0.6);
    wingGroupRight.add(barrel);

    wingGroupRight.position.set(0.9, 0, 0.2);
    shipGroup.add(wingGroupRight);

    // Bal szárnycsoport
    const wingGroupLeft = wingGroupRight.clone();
    wingGroupLeft.position.x = -0.9;
    wingGroupLeft.scale.x = -1; // Tükrözés
    shipGroup.add(wingGroupLeft);


    // --- 6. NAPELEM PANELEK (Módosítva: ZÖLD ÉLVILÁGÍTÁS ELTÁVOLÍTVA) ---
    const panelWingGeo = new THREE.BoxGeometry(0.4, 0.02, 0.7);
    
    // Jobb felső napelem panel (Csak a tiszta panel, zöld glow mesh nélkül)
    const solarRight = new THREE.Mesh(panelWingGeo, solarMaterial);
    solarRight.position.set(0.5, 0.4, 0.4);
    solarRight.rotation.z = -0.5; // Kifelé dől
    solarRight.rotation.y = 0.2;  // Kissé elfordítva
    shipGroup.add(solarRight);

    // Bal felső napelem panel
    const solarLeft = solarRight.clone();
    solarLeft.position.x = -0.5;
    solarLeft.rotation.z = 0.5;
    solarLeft.rotation.y = -0.2;
    shipGroup.add(solarLeft);


    // --- 7. FELSŐ ANTENNA / JELZŐFÉNY ---
    const antennaMast = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.02, 0.3, 6), frameMetal);
    antennaMast.position.set(0, 0.45, 0.4);
    shipGroup.add(antennaMast);

    const beaconLight = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), new THREE.MeshStandardMaterial({
        color: 0xffaa00, emissive: 0xffaa00, emissiveIntensity: 1.5
    }));
    beaconLight.position.set(0, 0.6, 0.4);
    shipGroup.add(beaconLight);


    // Hozzáadás a jelenetcsoporthoz
    visualGroup.add(shipGroup);
}