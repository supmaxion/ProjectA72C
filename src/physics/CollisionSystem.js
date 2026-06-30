// Egyszerű gömb-gömb ütközésvizsgálat: hajó pozíció (pont) vs bolygó/hold radius.
// Rekurzívan bejárja a holdakat is.
export function checkShipCollision(shipPosition, bodies) {
    for (const body of bodies) {
        const dist = shipPosition.distanceTo(body.position);
        if (dist < body.radius) {
            return body;
        }
        if (body.moons && body.moons.length > 0) {
            const moonHit = checkShipCollision(shipPosition, body.moons);
            if (moonHit) return moonHit;
        }
    }
    return null;
}