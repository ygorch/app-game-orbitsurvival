export class AreaEffect {
    x: number; y: number; type: string; timer: number; r: number; w?: number; h?: number; ang?: number;
    
    constructor(type: string, x: number, y: number, r: number, timer: number, w?: number, h?: number, ang?: number) {
        this.type = type; this.x = x; this.y = y; this.r = r; this.timer = timer; this.w = w; this.h = h; this.ang = ang;
    }
}
