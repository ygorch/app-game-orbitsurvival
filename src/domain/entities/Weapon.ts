import { WEAPONS_INFO } from '../constants/GameData';
import { Player } from './Player';
import { saveService } from '../../application/SaveService';

export class Weapon {
    id: string; level: number = 1; maxLevel: number = 5; timer: number = 0;
    name: string; icon: string; type: string;
    baseDmg!: number; baseCd!: number; dmgType!: string; r?: number;

    constructor(id: string) {
        this.id = id;
        let i = WEAPONS_INFO[id];
        this.name = i.name; this.icon = i.icon;
        this.type = i.type.includes('Auto') || i.type.includes('Passiva') ? 'auto' : 'manual';

        if(id==='axe') { this.baseDmg=15; this.baseCd=72; this.dmgType='melee'; }
        else if(id==='sword') { this.baseDmg=10; this.baseCd=42; this.dmgType='melee'; }
        else if(id==='knife') { this.baseDmg=6; this.baseCd=20; this.dmgType='melee'; }
        else if(id==='wand') { this.baseDmg=10; this.baseCd=48; this.dmgType='magic'; }
        else if(id==='bow') { this.baseDmg=13; this.baseCd=48; this.dmgType='ranged'; }
        else if(id==='pistol') { this.baseDmg=8; this.baseCd=20; this.dmgType='ranged'; }
        else if(id==='aura') { this.baseDmg=5; this.baseCd=60; this.dmgType='aura'; this.r=80; }
    }

    getDamage(player: Player) {
        let base = this.baseDmg + (this.level*2); let mult = 1;
        if(this.dmgType==='melee') mult += (player.str*0.02) + (player.dex*0.01);
        else if(this.dmgType==='ranged') mult += (player.dex*0.02) + (player.agi*0.01);
        else if(this.dmgType==='magic') mult += (player.int*0.02) + (player.dex*0.01);
        else if(this.dmgType==='aura') mult += (player.int*0.01) + (player.sta*0.01);
        return base * mult * (1 + saveService.data.skills.damage*0.1);
    }

    getCooldown(player: Player) { return Math.max(10, this.baseCd / (1 + player.agi*0.015)); }
}
