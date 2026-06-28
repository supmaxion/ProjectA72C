import * as THREE from 'three';
import { SUN } from './../config.js';

export function createSun({
    direction = SUN.direction,
    distance = SUN.distance,
    size = SUN.size,
    color = SUN.color,
    lightIntensity = SUN.lightIntensity,
    ambientColor = SUN.ambientColor,
    ambientIntensity = SUN.ambientIntensity,
} = {}) {

    // --- GÖMB MESH (körbehajózható, depth-helyes) ---
    const geometry = new THREE.SphereGeometry(size * 0.5, 32, 32);

    const sunColor = new THREE.Color(color);

    const material = new THREE.ShaderMaterial({
        uniforms: {
            sunColor:  { value: sunColor },
            glowColor: { value: new THREE.Color(0xff6600) },
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 sunColor;
            uniform vec3 glowColor;
            varying vec3 vNormal;

            void main() {
                // Limb darkening: középen fehér, szélen narancs
                float fresnel = dot(vNormal, vec3(0.0, 0.0, 1.0));
                fresnel = clamp(fresnel, 0.0, 1.0);

                vec3 core  = vec3(1.0, 1.0, 0.95);   // fehér mag
                vec3 col   = mix(glowColor, mix(sunColor, core, fresnel), fresnel);

                // Halvány átmenet a szélen
                float alpha = smoothstep(0.0, 0.15, fresnel) * 0.97 + 0.03;

                gl_FragColor = vec4(col, alpha);
            }
        `,
        transparent: true,
        depthWrite: true,   // ← ez teszi körbehajózhatóvá
        side: THREE.FrontSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0,0,0);

    // --- KÜLSŐ GLOW sprite (csak dekoráció, depth nélkül) ---
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const cx = 128, cy = 128;

    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 128);
    gradient.addColorStop(0.0, 'rgba(255, 240, 180, 0.0)');  // középen átlátszó (a mesh takarja)
    gradient.addColorStop(0.4, 'rgba(255, 200, 80,  0.0)');
    gradient.addColorStop(0.6, 'rgba(255, 140, 20,  0.15)');
    gradient.addColorStop(0.8, 'rgba(255, 80,  0,   0.08)');
    gradient.addColorStop(1.0, 'rgba(255, 40,  0,   0.0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    const glowTexture = new THREE.CanvasTexture(canvas);
    const glowMaterial = new THREE.SpriteMaterial({
        map: glowTexture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });

    const glow = new THREE.Sprite(glowMaterial);
    glow.position.copy(mesh.position);
    glow.scale.set(size * 2.2, size * 2.2, 1);  // nagyobb mint a mesh

    // --- DIRECTIONAL LIGHT ---
    const light = new THREE.DirectionalLight(color, lightIntensity);
    light.position.set(0, 0, 1);
    light.target.position.set(0, 0, 0);

    const ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity);

    return { mesh, glow, light, ambientLight };
}