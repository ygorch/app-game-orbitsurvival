export class Orb {
    x: number; y: number; v: number; r: number; c: string; p: boolean = false;
    constructor(x: number, y: number, val: number) {
        this.x = x; this.y = y; this.v = val;
        this.r = val === 1 ? 6 : (val === 10 ? 10 : 14);
        this.c = val === 1 ? '#3498db' : (val === 10 ? '#f1c40f' : '#e74c3c');
    }

    update(px: number, py: number, magnetSq: number) {
        let dx = px - this.x; let dy = py - this.y; let dSq = dx*dx + dy*dy;
        if(this.p || dSq < magnetSq) {
            this.p = true; let d = Math.sqrt(dSq);
            if(d > 0) { this.x += (dx/d)*15; this.y += (dy/d)*15; }
        }
    }
}
