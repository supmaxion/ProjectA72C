import * as THREE from 'three';

/**
 * Computes a position on a Keplerian orbit given elapsed time.
 *
 * We use a simplified elliptical orbit formula -- no full Kepler
 * equation solving (no eccentric anomaly iteration), which is fine
 * for a game where visual plausibility matters more than sub-arcsecond
 * accuracy.
 *
 * @param {object} orbit
 *   - semiMajorAxis   {number}  average orbital radius
 *   - eccentricity    {number}  0 = circle, <1 = ellipse
 *   - inclination     {number}  tilt of orbit plane in radians
 *   - speed           {number}  angular velocity in radians per frame
 * @param {number} time  elapsed frames (or any monotonic counter)
 * @param {THREE.Vector3} center  the body being orbited
 * @returns {THREE.Vector3}
 */
export function keplerPosition(
    orbit,
    time,
    center = new THREE.Vector3(),
    target = new THREE.Vector3()  // ← ÚJ: opcionális target, elkerüli az allokációt
) {
    const { semiMajorAxis, eccentricity, inclination, speed } = orbit;

    const angle = time * speed;
    const semiMinorAxis = semiMajorAxis * Math.sqrt(1 - eccentricity * eccentricity);

    const x = semiMajorAxis * Math.cos(angle);
    const z = semiMinorAxis * Math.sin(angle);

    const y = z * Math.sin(inclination);
    const zTilted = z * Math.cos(inclination);

    return target.set(          // ← volt: new THREE.Vector3(...)
        center.x + x,
        center.y + y,
        center.z + zTilted
    );
}