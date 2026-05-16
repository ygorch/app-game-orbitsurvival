import { gameEvents } from '../../application/EventEmitter';
import { GameEngine } from '../../application/GameEngine';
import { inputManager } from '../input/InputManager';

export class CanvasRenderer {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        window.addEventListener('resize', this.resize);
        this.resize();

        gameEvents.on('RENDER_TICK', this.render);
    }

    resize = () => {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        inputManager.canvasWidth = window.innerWidth;
        inputManager.canvasHeight = window.innerHeight;
    }

    render = (engine: GameEngine) => {
        const { ctx, canvas } = this;
        ctx.fillStyle='#111'; ctx.fillRect(0,0,canvas.width,canvas.height);

        ctx.save();
        ctx.translate(-engine.player.x + canvas.width/2, -engine.player.y + canvas.height/2);

        let MAP_SIZE = engine.MAP_SIZE;
        ctx.fillStyle='#0a0a0f'; ctx.fillRect(-MAP_SIZE,-MAP_SIZE,MAP_SIZE*2,MAP_SIZE*2);
        ctx.strokeStyle='#e74c3c'; ctx.lineWidth=10; ctx.strokeRect(-MAP_SIZE,-MAP_SIZE,MAP_SIZE*2,MAP_SIZE*2);
        ctx.strokeStyle='#222'; ctx.lineWidth=2; ctx.beginPath();
        for(let x=-MAP_SIZE; x<=MAP_SIZE; x+=200) { ctx.moveTo(x,-MAP_SIZE); ctx.lineTo(x,MAP_SIZE); ctx.moveTo(-MAP_SIZE,x); ctx.lineTo(MAP_SIZE,x); } ctx.stroke();

        engine.weapons.forEach(w => {
            if(w.id==='aura') { ctx.fillStyle='rgba(241,196,15,0.1)'; ctx.beginPath(); ctx.arc(engine.player.x,engine.player.y,(w.r||80)+(w.level*15),0,Math.PI*2); ctx.fill(); }
        });

        engine.orbs.forEach(o => { ctx.fillStyle=o.c; ctx.beginPath(); ctx.arc(o.x,o.y,o.r,0,Math.PI*2); ctx.fill(); });

        engine.projectiles.forEach(p => {
            if(p.isSlash) {
                ctx.save(); ctx.translate(p.x, p.y);
                if(!p.full) { ctx.rotate(p.ang||0); ctx.beginPath(); ctx.arc(0,0,p.r||0,-Math.PI/4,Math.PI/4); }
                else { ctx.beginPath(); ctx.arc(0,0,p.r||0,0,Math.PI*2); }
                ctx.strokeStyle=`rgba(255,255,255,${p.life/10})`; ctx.lineWidth=10; ctx.stroke(); ctx.restore();
            } else {
                ctx.fillStyle=p.c; ctx.beginPath(); ctx.arc(p.x,p.y,p.crit?10:6,0,Math.PI*2); ctx.fill();
            }
        });

        engine.enemies.forEach(e => {
            ctx.fillStyle='rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.arc(e.x,e.y,e.r,0,Math.PI*2); ctx.fill();
            ctx.font='24px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(e.emoji, e.x, e.y+2);
        });

        if(engine.player.invuln === 0 || engine.frames%8 < 4) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.arc(engine.player.x, engine.player.y, engine.player.radius, 0, Math.PI*2); ctx.fill();
            ctx.font = '28px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(engine.player.emoji, engine.player.x, engine.player.y+2);
        }

        engine.floatingTexts.forEach(ft => { ctx.fillStyle=ft.c; ctx.font='bold 16px Arial'; ctx.fillText(ft.t, ft.x, ft.y); });
        
        ctx.restore();
    }
}
