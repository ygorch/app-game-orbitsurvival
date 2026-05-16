export class ConsumableOnGround {
    x: number; y: number; id: string; despawnTimer: number; r: number = 15;

    constructor(x: number, y: number, id: string) {
        this.x = x; this.y = y; this.id = id;
        this.despawnTimer = 1800; // 30s at 60fps
    }
}
