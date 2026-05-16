export class InputManager {
    keys: Record<string, boolean> = { w: false, a: false, s: false, d: false, '1': false, '2': false, '3': false, '4': false, '5': false };
    mouseX: number = 0; mouseY: number = 0;
    isMouseDown: boolean = false;
    canvasWidth: number = 1920; canvasHeight: number = 1080;

    constructor() {
        window.addEventListener('mousemove', e => {
            this.mouseX = e.clientX - this.canvasWidth/2;
            this.mouseY = e.clientY - this.canvasHeight/2;
        });
        window.addEventListener('mousedown', () => this.isMouseDown = true);
        window.addEventListener('mouseup', () => this.isMouseDown = false);
        window.addEventListener('keydown', e => {
            let k = e.key.toLowerCase(); if(this.keys.hasOwnProperty(k)) this.keys[k] = true;
        });
        window.addEventListener('keyup', e => {
            let k = e.key.toLowerCase(); if(this.keys.hasOwnProperty(k)) this.keys[k] = false;
        });
    }

    getMovement() {
        let dx = 0, dy = 0;
        if(this.keys.w) dy -= 1; if(this.keys.s) dy += 1;
        if(this.keys.a) dx -= 1; if(this.keys.d) dx += 1;
        return { dx, dy };
    }
}

export const inputManager = new InputManager();
