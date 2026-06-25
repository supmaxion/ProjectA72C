import RAPIER from '@dimforge/rapier3d-compat';

/**
 * Wraps Rapier initialization and the physics world.
 * Must be initialized with await before the game loop starts,
 * because Rapier loads a WASM binary asynchronously.
 */
export class PhysicsWorld {
    constructor() {
        this.world = null;
        this.RAPIER = null;
    }

    async init() {
        await RAPIER.init();
        this.RAPIER = RAPIER;

        // Zero gravity -- we handle all gravitational forces manually
        // in GravitySystem.js so multiple bodies can attract the ship.
        this.world = new RAPIER.World({ x: 0, y: 0, z: 0 });

        // Fixed timestep: 60 Hz regardless of frame rate.
        // The game loop calls step() once per frame and handles
        // interpolation if needed later.
        this.world.timestep = 1 / 60;
    }

    /**
     * Creates a dynamic RigidBody for the ship.
     * Dynamic = affected by forces and impulses.
     */
    createShipBody(position) {
        const bodyDesc = this.RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(position.x, position.y, position.z)
            .setLinearDamping(0.0)   // no drag in space
            .setAngularDamping(1.0); // we control rotation manually

        const body = this.world.createRigidBody(bodyDesc);

        // Collider: a simple box approximating the ship's hull.
        // The exact shape matters for collision response later (asteroids).
        const colliderDesc = this.RAPIER.ColliderDesc.cuboid(1.2, 0.3, 1.5)
            .setMass(1.0);

        this.world.createCollider(colliderDesc, body);

        return body;
    }

    /**
     * Creates a fixed (non-moving) collider for a celestial body.
     * Fixed = not affected by forces, but the ship can collide with it.
     * The Kepleri orbit system moves the Three.js mesh; we sync
     * this collider's position manually each frame in SolarSystem.js.
     */
    createCelestialCollider(radius) {
        const bodyDesc = this.RAPIER.RigidBodyDesc.kinematicPositionBased();
        const body = this.world.createRigidBody(bodyDesc);

        const colliderDesc = this.RAPIER.ColliderDesc.ball(radius)
            .setMass(0);

        this.world.createCollider(colliderDesc, body);

        return body;
    }

    step() {
        this.world.step();
    }
}