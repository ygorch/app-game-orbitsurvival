export class Enemy {
    x: number; y: number; r: number = 16; emoji: string;
    maxHp: number; hp: number; speed: number; dmg: number; despawned: boolean = false;

    constructor(x: number, y: number, def: any, playerLevel: number, survivalFrames: number) {
        this.x = x; this.y = y; this.emoji = def.emoji;
        let scale = 1 + (playerLevel*0.1) + (survivalFrames/(60*60*5));
        this.maxHp = Math.ceil(def.hp * scale); this.hp = this.maxHp;
        this.speed = def.spd + (Math.random()*0.2);
        this.dmg = Math.ceil(def.dmg * (1+(scale*0.2)));
    }

    update(px: number, py: number, viewDist: number) {
        let dx = px - this.x; let dy = py - this.y; let dist = Math.hypot(dx,dy);
        if(dist < viewDist * 0.9) {
            if(dist > 0) { this.x += (dx/dist)*this.speed; this.y += (dy/dist)*this.speed; }
        } else {
            this.x += (Math.random()-0.5)*this.speed; this.y += (Math.random()-0.5)*this.speed;
        }
        if(dist > viewDist * 1.3) { this.hp = 0; this.despawned = true; }
        return dist;
    }
}
