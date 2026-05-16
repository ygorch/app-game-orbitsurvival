import { saveService } from '../../application/SaveService';

export class Player {
    x: number = 0; y: number = 0; radius: number = 16; emoji: string;
    str: number; agi: number; sta: number; int: number; dex: number; luk: number;
    baseHp: number; baseArmor: number; baseSpeed: number;
    maxHp!: number; hp!: number; armor!: number; speed!: number;
    critChance!: number; dodgeChance!: number; magnet!: number;
    invuln: number = 0;

    constructor(type: string) {
        this.emoji = type === 'fugitivo' ? '🥷' : '🛡️';
        const skills = saveService.data.skills;
        this.str = skills.str * 2; this.agi = skills.agi * 2; this.sta = skills.sta * 2;
        this.int = skills.int * 2; this.dex = skills.dex * 2; this.luk = skills.luk * 2;

        if (type === 'fugitivo') {
            this.str+=5; this.agi+=15; this.sta+=5; this.int+=5; this.dex+=15; this.luk+=10;
            this.baseHp = 90; this.baseArmor = 0; this.baseSpeed = 4.0;
        } else {
            this.str+=15; this.agi+=5; this.sta+=15; this.int+=5; this.dex+=5; this.luk+=5;
            this.baseHp = 120; this.baseArmor = 1; this.baseSpeed = 3.0;
        }

        this.calcDerivedStats();
        this.hp = this.maxHp;
    }

    calcDerivedStats() {
        const skills = saveService.data.skills;
        let oldMax = this.maxHp || 0;
        this.maxHp = this.baseHp + (this.sta * 5) + (skills.hp * 15);
        if(this.maxHp > oldMax && oldMax > 0) this.hp += (this.maxHp - oldMax);

        this.armor = this.baseArmor + Math.floor(this.sta / 10);
        this.speed = this.baseSpeed * (1 + this.sta * 0.005) * (1 + skills.speed * 0.05);
        this.critChance = this.luk * 0.001;
        this.dodgeChance = this.luk * 0.001;
        this.magnet = 60 + (skills.magnet * 20);
    }

    takeDamage(amt: number): { dmg: number, dodged: boolean } {
        if(this.invuln > 0) return { dmg: 0, dodged: false };
        if(Math.random() < this.dodgeChance) {
            this.invuln = 20;
            return { dmg: 0, dodged: true };
        }
        let dmg = Math.max(1, amt - this.armor);
        this.hp -= dmg;
        this.invuln = 30;
        return { dmg, dodged: false };
    }

    update(dx: number, dy: number, MAP_SIZE: number) {
        if(dx !== 0 || dy !== 0) {
            let l = Math.sqrt(dx*dx + dy*dy);
            this.x += (dx/l) * this.speed;
            this.y += (dy/l) * this.speed;
        }
        this.x = Math.max(-MAP_SIZE, Math.min(MAP_SIZE, this.x));
        this.y = Math.max(-MAP_SIZE, Math.min(MAP_SIZE, this.y));
        if(this.invuln > 0) this.invuln--;
    }
}
