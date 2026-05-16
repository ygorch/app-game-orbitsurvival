import { SaveData } from '../domain/types';
import { gameEvents } from './EventEmitter';

const SAVE_KEY = 'sourlate_react_v1';

const defaultData: SaveData = {
    gold: 50,
    skills: { speed: 0, damage: 0, hp: 0, magnet: 0, str: 0, agi: 0, sta: 0, int: 0, dex: 0, luk: 0, greed: 0, xp: 0 }
};

class SaveService {
    public data: SaveData = JSON.parse(JSON.stringify(defaultData));

    constructor() {
        this.load();
    }

    load() {
        try {
            const savedRaw = localStorage.getItem(SAVE_KEY);
            if (savedRaw) {
                const parsed = JSON.parse(savedRaw);
                if (parsed.skills) {
                    this.data.gold = parsed.gold || 0;
                    for (let key in defaultData.skills) {
                        (this.data.skills as any)[key] = parsed.skills[key] !== undefined ? parsed.skills[key] : 0;
                    }
                }
            }
        } catch (e) {
            console.warn("Save incompatível ou ausente.");
            this.data = JSON.parse(JSON.stringify(defaultData));
        }
        gameEvents.emit('SAVE_UPDATED', this.data);
    }

    save() {
        localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
        gameEvents.emit('SAVE_UPDATED', this.data);
    }
}

export const saveService = new SaveService();
