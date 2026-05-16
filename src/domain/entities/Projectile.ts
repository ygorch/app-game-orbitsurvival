export class Projectile {
    x: number; y: number; vx: number; vy: number;
    dmg: number; p: number; c: string; crit: boolean; life: number;
    isSlash?: boolean; r?: number; full?: boolean; ang?: number;

    constructor(x: number, y: number, vx: number, vy: number, dmg: number, p: number, c: string, crit: boolean) {
        this.x = x; this.y = y; this.vx = vx; this.vy = vy;
        this.dmg = dmg; this.p = p; this.c = c; this.crit = crit; this.life = 60;
    }

    static createSlash(x: number, y: number, r: number, life: number, c: string, full: boolean, ang?: number) {
        const proj = new Projectile(x, y, 0, 0, 0, 0, c, false);
        proj.isSlash = true; proj.r = r; proj.life = life; proj.full = full; proj.ang = ang;
        return proj;
    }

    update() {
        if (!this.isSlash) {
            this.x += this.vx; this.y += this.vy;
        }
        this.life--;
    }
}
