import { SolarSystem } from '../entities/SolarSystem.js';
import { generateSystemConfig } from '../physics/SystemGenerator.js';
import { HOME_SYSTEM } from '../config.js';

// Ideiglenes placeholder — később lecserélve a valódi SystemGenerator.js-re
//~ function generatePlaceholderSystem(seed) {
    //~ return {
        //~ ...HOME_SYSTEM,
        //~ seed,
        //~ station: {
            //~ ...HOME_SYSTEM.station,
            //~ destinationSeed: 'home', // egyelőre minden generált rendszer visszavezet a home-ba
        //~ },
    //~ };
//~ }

export class SystemManager {
    constructor(scene) {
        this._scene = scene;
        this._cache = new Map(); // seed -> SolarSystem instance
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
            const config = seed === 'home'
                ? HOME_SYSTEM
                : generateSystemConfig(seed, { returnSeed: cameFrom });

            system = new SolarSystem(this._scene, config);
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
}
