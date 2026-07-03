

const SAVE_KEY = 'project-a72c-save';
const SAVE_VERSION = 1;

export class SaveManager {
    save({ systemManager, ship, orbitLinesVisible }) {
        const data = {
            version: SAVE_VERSION,
            ...systemManager.getSaveData(),
            ship: {
                position: ship.position.toArray(),
                quaternion: ship.quaternion.toArray(),
                speed: ship.speed,
            },
            inventory: this._existingInventory ?? {},
            shipUpgrades: this._existingUpgrades ?? {},
            systemState: this._existingSystemState ?? {},
            settings: {
                orbitLinesVisible,
            },
            savedAt: Date.now(),
        };

        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        } catch (err) {
            console.warn('Mentés sikertelen:', err);
        }
    }

    load() {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return null;

        try {
            const data = JSON.parse(raw);
            if (data.version !== SAVE_VERSION) {
                console.warn('Régi mentési verzió, kihagyva.');
                return null;
            }
            return data;
        } catch {
            return null;
        }
    }

    clear() {
        localStorage.removeItem(SAVE_KEY);
    }
}
