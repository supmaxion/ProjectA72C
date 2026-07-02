import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const modelPath = import.meta.env.BASE_URL + 'models/ship.glb';
const HOLOGRAM_ROTATE = false; // true = folyamatosan forog, false = statikus, előre néz

export class HologramViewer {
    constructor() {
        this._visible = false;
        this._model = null;
        this._time = 0;

        this._scene = new THREE.Scene();
        this._camera = new THREE.PerspectiveCamera(35, 1, 0.1, 1000);
        this._camera.position.set(0, 0, 6);

        const light1 = new THREE.DirectionalLight(0x66ccff, 1.2);
        light1.position.set(2, 3, 4);
        this._scene.add(light1);
        this._scene.add(new THREE.AmbientLight(0x224466, 0.8));

        this._renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this._renderer.setClearColor(0x000000, 0);

        this._buildDom();
        this._loadModel();
        this._loop();
    }

    _buildDom() {
        this._container = document.createElement('div');
        Object.assign(this._container.style, {
            position: 'fixed',
            pointerEvents: 'none',
            zIndex: '150',
            opacity: '0',
            transition: 'opacity 0.25s ease',
            overflow: 'hidden',
        });

        this._renderer.domElement.style.width = '100%';
        this._renderer.domElement.style.height = '100%';
        this._container.appendChild(this._renderer.domElement);

        // Scanline / flicker réteg
        this._scanlines = document.createElement('div');
        Object.assign(this._scanlines.style, {
            position: 'absolute',
            inset: '0',
            background: `repeating-linear-gradient(
                0deg,
                rgba(120,220,255,0.08) 0px,
                rgba(120,220,255,0.08) 1px,
                transparent 2px,
                transparent 4px
            )`,
            mixBlendMode: 'screen',
            pointerEvents: 'none',
        });
        this._container.appendChild(this._scanlines);

        // Halvány kék "üveg" keret-glow
        this._glowRing = document.createElement('div');
        Object.assign(this._glowRing.style, {
            position: 'absolute',
            inset: '0',
            boxShadow: 'inset 0 0 18px rgba(100,200,255,0.5)',
            pointerEvents: 'none',
        });
        this._container.appendChild(this._glowRing);

        document.body.appendChild(this._container);
    }

    _loadModel() {
        const loader = new GLTFLoader();
        loader.load(modelPath, (gltf) => {
            const model = gltf.scene;

            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3()).length();
            const scale = 2.5 / size;
            model.scale.setScalar(scale);

            const center = box.getCenter(new THREE.Vector3()).multiplyScalar(scale);
            model.position.sub(center);

            // Hologram anyag: áttetsző, kékes, wireframe-es hatás
            model.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshBasicMaterial({
                        color: 0x66ccff,
                        transparent: true,
                        opacity: 0.55,
                        wireframe: false,
                    });
                }
            });

            this._modelGroup = new THREE.Group();
            this._modelGroup.add(model);
            this._scene.add(this._modelGroup);
            this._model = model;
        });
    }

    /**
     * Megjeleníti a hologramot a megadott képernyő-rect (DOMRect) helyén.
     */
    show(rect, clipPath) {
        this._visible = true;
        this._resize(rect, clipPath);
        this._container.style.opacity = '1';
    }

    hide() {
        this._visible = false;
        this._container.style.opacity = '0';
    }

    toggle(rect, clipPath) {
        if (this._visible) {
            this.hide();
        } else {
            this.show(rect, clipPath);
        }
    }

    isVisible() {
        return this._visible;
    }

    _resize(rect, clipPath) {
        const w = Math.max(1, Math.round(rect.width));
        const h = Math.max(1, Math.round(rect.height));

        Object.assign(this._container.style, {
            left: `${rect.left}px`,
            top: `${rect.top}px`,
            width: `${w}px`,
            height: `${h}px`,
            clipPath: clipPath || 'none',
        });

        this._renderer.setSize(w, h, false);
        this._camera.aspect = w / h;
        this._camera.updateProjectionMatrix();
    }

    _loop() {
        requestAnimationFrame(() => this._loop());

        if (!this._visible || !this._modelGroup) return;

        this._time += 0.016;

        // Folyamatos lassú forgás
        if (HOLOGRAM_ROTATE) {
            this._modelGroup.rotation.y += 0.012;
            this._modelGroup.rotation.x = Math.sin(this._time * 0.5) * 0.08;
        }

        // Enyhe flicker az opacitásban
        const flicker = 0.85 + Math.random() * 0.15;
        this._container.style.filter = `brightness(${flicker})`;

        this._renderer.render(this._scene, this._camera);
    }

    dispose() {
        document.body.removeChild(this._container);
        this._renderer.dispose();
    }
}