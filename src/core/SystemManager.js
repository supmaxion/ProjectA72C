import { SolarSystem } from '../entities/SolarSystem.js';
import { generateSystemConfig } from '../physics/SystemGenerator.js';
import { HOME_SYSTEM } from '../config.js';

export class SystemManager {
    constructor(scene) {
        this._scene = scene;
        this._cache = new Map();
        this._links = new Map();       // seed -> returnSeed (station célpontja)
        this._pendingTimes = new Map(); // betöltéskor: seed -> mentett _time, amíg a rendszer még nem jött létre
        this.current = null;
        this.orbitLinesVisible = false;
    }

    jumpTo(seed) {
        const cameFrom = this.current ? this.current.seed : null;

        if (this.current) {
            this.current.detach();
        }

        let system = this._cache.get(seed);
        if (!system) {
            const returnSeed = this._links.get(seed) ?? cameFrom;

            const config = seed === 'home'
                ? HOME_SYSTEM
                : generateSystemConfig(seed, { returnSeed });

            system = new SolarSystem(this._scene, config);

            if (returnSeed) {
                this._links.set(seed, returnSeed);
            }

            if (this._pendingTimes.has(seed)) {
                system._time = this._pendingTimes.get(seed);
                this._pendingTimes.delete(seed);
            }

            this._cache.set(seed, system);
        } else {
            system.attach();
        }

        system.setOrbitLinesVisible(this.orbitLinesVisible);

        this.current = system;
        return system;
    }

    setOrbitLinesVisible(visible) {
        this.orbitLinesVisible = visible;
        this.current?.setOrbitLinesVisible(visible);
    }

    // --- Mentés/betöltés támogatás ---

    getSaveData() {
        const systemTimes = {};
        const systemLinks = {};

        for (const [seed, system] of this._cache) {
            systemTimes[seed] = system._time;
        }
        for (const [seed, returnSeed] of this._links) {
            systemLinks[seed] = returnSeed;
        }

        return {
            currentSeed: this.current?.seed ?? 'home',
            visitedSeeds: [...this._cache.keys()],
            systemTimes,
            systemLinks,
        };
    }

    restoreFromSave(data) {
        this._links = new Map(Object.entries(data.systemLinks ?? {}));
        this._pendingTimes = new Map(Object.entries(data.systemTimes ?? {}));
        this.jumpTo(data.currentSeed ?? 'home');
    }
}
