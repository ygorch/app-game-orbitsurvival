import { Player } from '../domain/entities/Player';
import { Enemy } from '../domain/entities/Enemy';
import { Weapon } from '../domain/entities/Weapon';
import { Projectile } from '../domain/entities/Projectile';
import { Orb } from '../domain/entities/Orb';
import { ENEMY_DEFS, WEAPONS_INFO } from '../domain/constants/GameData';
import { gameEvents } from './EventEmitter';
import { inputManager } from '../infrastructure/input/InputManager';
import { saveService } from './SaveService';
import { Logger } from '../infrastructure/logging/Logger';

export class GameEngine {
    player!: Player;
    weapons: Weapon[] = [];
    projectiles: Projectile[] = [];
    enemies: Enemy[] = [];
    orbs: Orb[] = [];
    floatingTexts: {x: number, y: number, t: string, c: string, life: number}[] = [];
    
    frames = 0; survivalFrames = 0; kills = 0; runGold = 0;
    playerLevel = 1; playerXp = 0; xpNeeded = 5; killStats: Record<string, number> = {};
    levelRerolled = false;
    gameState: 'PLAYING' | 'PAUSED' | 'LEVEL_UP' | 'GAMEOVER' = 'PLAYING';
    MAP_SIZE = 2000;
    animationFrameId = 0;

    start(heroId: string, weaponId: string) {
        this.player = new Player(heroId);
        this.weapons = [new Weapon(weaponId)];
        this.frames = 0; this.survivalFrames = 0; this.kills = 0; this.runGold = 0;
        this.playerLevel = 1; this.playerXp = 0; this.xpNeeded = 5; this.killStats = {};
        this.levelRerolled = false;
        this.enemies = []; this.orbs = []; this.projectiles = []; this.floatingTexts = [];
        this.gameState = 'PLAYING';
        this.updateHUD();
        this.loop();
    }

    pause() {
        this.gameState = 'PAUSED';
        gameEvents.emit('PAUSE_DATA', {
            survivalFrames: this.survivalFrames, runGold: this.runGold, playerXp: this.playerXp,
            player: this.player, weapons: this.weapons, killStats: this.killStats
        });
    }

    resume() {
        this.gameState = 'PLAYING';
        this.loop();
    }

    stop() {
        cancelAnimationFrame(this.animationFrameId);
    }

    updateHUD() {
        gameEvents.emit('HUD_UPDATE', {
            hp: this.player.hp, maxHp: this.player.maxHp,
            level: this.playerLevel, xp: this.playerXp, xpNeeded: this.xpNeeded,
            gold: this.runGold, kills: this.kills, timer: this.survivalFrames
        });
    }

    collectOrb(orb: Orb) {
        let xpGain = orb.v * (1 + (saveService.data.skills.xp * 0.05));
        this.playerXp += xpGain;
        if (this.playerXp >= this.xpNeeded) this.levelUp();
        this.updateHUD();
    }

    levelUp(isReroll = false) {
        if(!isReroll) {
            this.gameState = 'LEVEL_UP'; this.playerXp -= this.xpNeeded;
            this.playerLevel++; this.xpNeeded = this.playerLevel * 10;
            this.levelRerolled = false;
        }
        this.updateHUD();
        
        let pool: any[] = [];
        Object.keys(WEAPONS_INFO).forEach(id => {
            if(!this.weapons.some(w => w.id === id) && this.weapons.length < 4) {
                let info = WEAPONS_INFO[id];
                pool.push({ t:'new', id:id, n:`Nova Arma: ${info.name}`, d:`<span class="text-primary-fixed-dim text-xs uppercase">${info.type}</span><br>${info.desc}`, i: info.icon });
            }
        });
        this.weapons.forEach(w => {
            if(w.level < w.maxLevel) pool.push({t:'upg', ref:w, n:`Evoluir ${w.name}`, d:`<span class="text-green-400 font-bold">Nível ${w.level+1}</span><br>Aumenta o Dano Bruto e a Área de Impacto/Velocidade.`, i:w.icon});
        });
        pool.push({t:'stat', s:'str', n:'Força Titânica', d:'<span class="text-green-400 font-bold">+5 STR</span><br>Aumenta muito o dano de Machado, Espada e Facas.', i:'⚔️'});
        pool.push({t:'stat', s:'agi', n:'Agilidade Felina', d:'<span class="text-green-400 font-bold">+5 AGI</span><br>Reduz o Tempo de Recarga (Cooldown) de TODAS as armas.', i:'⚡'});
        pool.push({t:'stat', s:'sta', n:'Estamina Inabalável', d:'<span class="text-green-400 font-bold">+5 STA</span><br>Aumenta muito a Vida Máxima, Armadura e o dano da Aura Mágica.', i:'🛡️'});
        pool.push({t:'stat', s:'int', n:'Conhecimento Arcano', d:'<span class="text-green-400 font-bold">+5 INT</span><br>Aumenta drasticamente o dano da Varinha Teleguiada e Aura.', i:'🧠'});
        pool.push({t:'stat', s:'dex', n:'Destreza Certeira', d:'<span class="text-green-400 font-bold">+5 DEX</span><br>Aumenta muito o dano de Armas de Fogo e concede bônus parcial a Espadas.', i:'🎯'});
        pool.push({t:'stat', s:'luk', n:'Sorte do Tolo', d:'<span class="text-green-400 font-bold">+5 LUK</span><br>Aumenta a chance global de Acerto Crítico (2x Dano) e Esquiva de golpes.', i:'🍀'});
        pool.push({t:'heal', n:'Benção de Sangue', d:'Milagre das ruínas. Restaura instantaneamente 100% da sua Vida.', i:'❤️'});

        pool.sort(() => Math.random() - 0.5);
        let choices = pool.slice(0,3);
        gameEvents.emit('STATE_CHANGE', 'LEVEL_UP');
        gameEvents.emit('LEVEL_UP', { choices, rerolled: this.levelRerolled, hp: this.player.hp, gold: this.runGold });
    }

    applyChoice(c: any) {
        if(c.t === 'new') this.weapons.push(new Weapon(c.id));
        else if(c.t === 'upg') c.ref.level++;
        else if(c.t === 'stat') { (this.player as any)[c.s] += 5; this.player.calcDerivedStats(); }
        else if(c.t === 'heal') this.player.hp = this.player.maxHp;
        this.gameState = 'PLAYING';
        this.updateHUD();
        gameEvents.emit('STATE_CHANGE', 'PLAYING');
        this.loop();
    }

    reroll() {
        if(this.levelRerolled) return;
        if(this.runGold >= 3) { this.runGold -= 3; }
        else if(this.player.hp > 15) { this.player.hp -= 10; }
        else return;
        this.levelRerolled = true;
        this.levelUp(true);
    }

    gameOver(vic: boolean) {
        this.gameState = 'GAMEOVER';
        saveService.data.gold += this.runGold;
        saveService.save();
        gameEvents.emit('GAME_OVER', { vic, level: this.playerLevel, kills: this.kills, gold: this.runGold, survivalFrames: this.survivalFrames });
        gameEvents.emit('STATE_CHANGE', 'GAMEOVER');
    }

    createFloatingText(x: number, y: number, t: string, c: string) {
        this.floatingTexts.push({x, y, t, c, life: 45});
    }

    loop = () => {
        if(this.gameState !== 'PLAYING') return;
        try {
            this.frames++; this.survivalFrames++;
            
            let move = inputManager.getMovement();
            this.player.update(move.dx, move.dy, this.MAP_SIZE);
        
        let mins = this.survivalFrames / 3600;
        let maxIdx = Math.min(5, Math.floor(mins));
        let spawnRate = Math.floor(Math.max(5, 60 - (mins * 5)));
        if(this.enemies.length < 300 && this.frames % spawnRate === 0) {
            let count = this.frames < 100 ? 3 : 1;
            let view = Math.max(inputManager.canvasWidth, inputManager.canvasHeight) / 2;
            for(let i=0; i<count; i++) {
                let ang = Math.random() * Math.PI * 2; let r = view + 100;
                this.enemies.push(new Enemy(this.player.x + Math.cos(ang)*r, this.player.y + Math.sin(ang)*r, ENEMY_DEFS[Math.floor(Math.random()*(maxIdx+1))], this.playerLevel, this.survivalFrames));
            }
        }

        this.weapons.forEach(w => {
            w.timer--;
            if(w.timer > 0) return;
            if(w.type === 'manual' && !inputManager.isMouseDown) return;
            let dmg = w.getDamage(this.player);
            let isCrit = Math.random() < this.player.critChance;
            if(isCrit) dmg *= 2;

            if(w.id === 'axe') {
                let r = 100 + (w.level*10);
                this.projectiles.push(Projectile.createSlash(this.player.x, this.player.y, r, 10, '#ecf0f1', true));
                this.enemies.forEach(e => { if(Math.hypot(e.x-this.player.x, e.y-this.player.y) < r) { 
                    e.hp -= dmg; this.createFloatingText(e.x, e.y-20, Math.ceil(dmg)+(isCrit?'!':''), isCrit?'#f1c40f':'#fff'); e.x += (e.x-this.player.x)*0.1; 
                }});
                w.timer = w.getCooldown(this.player);
            } else if(w.id === 'sword' || w.id === 'knife') {
                let r = w.id === 'sword' ? 80+(w.level*10) : 50+(w.level*5);
                let ang = Math.atan2(inputManager.mouseY, inputManager.mouseX);
                this.projectiles.push(Projectile.createSlash(this.player.x, this.player.y, r, 8, '#bdc3c7', false, ang));
                this.enemies.forEach(e => {
                    let d = Math.hypot(e.x-this.player.x, e.y-this.player.y);
                    if(d < r) {
                        let eAng = Math.atan2(e.y-this.player.y, e.x-this.player.x);
                        let diff = Math.abs(eAng - ang); if(diff>Math.PI) diff = 2*Math.PI - diff;
                        if(diff < Math.PI/3) { 
                            e.hp -= dmg; this.createFloatingText(e.x, e.y-20, Math.ceil(dmg)+(isCrit?'!':''), isCrit?'#f1c40f':'#fff'); 
                            e.x += Math.cos(ang)*(w.id==='sword'?20:5); e.y += Math.sin(ang)*(w.id==='sword'?20:5); 
                        }
                    }
                });
                w.timer = w.getCooldown(this.player);
            } else if(w.id === 'wand') {
                let target: Enemy | null = null; let min = 999999;
                this.enemies.forEach(e => { let d=(e.x-this.player.x)**2 + (e.y-this.player.y)**2; if(d<min){min=d;target=e;} });
                if(target) {
                    let ang = Math.atan2(target.y-this.player.y, target.x-this.player.x);
                    this.projectiles.push(new Projectile(this.player.x, this.player.y, Math.cos(ang)*10, Math.sin(ang)*10, dmg, 1, '#f1c40f', isCrit));
                    w.timer = w.getCooldown(this.player);
                }
            } else if(w.id === 'bow' || w.id === 'pistol') {
                let ang = Math.atan2(inputManager.mouseY, inputManager.mouseX); let spd = w.id==='bow'?15:25;
                this.projectiles.push(new Projectile(this.player.x, this.player.y, Math.cos(ang)*spd, Math.sin(ang)*spd, dmg, w.id==='bow'?2:1, '#e67e22', isCrit));
                w.timer = w.getCooldown(this.player);
            } else if(w.id === 'aura') {
                let r = (w.r || 80) + (w.level*15);
                this.enemies.forEach(e => { if(Math.hypot(e.x-this.player.x, e.y-this.player.y) < r) {
                    e.hp -= dmg; this.createFloatingText(e.x, e.y-20, Math.ceil(dmg)+(isCrit?'!':''), isCrit?'#f1c40f':'#fff');
                }});
                w.timer = w.getCooldown(this.player);
            }
        });

        for(let i=this.orbs.length-1; i>=0; i--) { 
            let o=this.orbs[i]; o.update(this.player.x, this.player.y, this.player.magnet**2);
            if(Math.hypot(this.player.x-o.x, this.player.y-o.y) < this.player.radius+o.r) { this.collectOrb(o); this.orbs.splice(i,1); } 
        }

        for(let i=this.projectiles.length-1; i>=0; i--) {
            let p=this.projectiles[i];
            p.update();
            if(!p.isSlash) {
                for(let j=this.enemies.length-1; j>=0; j--) { 
                    let e=this.enemies[j]; 
                    if(Math.hypot(e.x-p.x, e.y-p.y) < e.r+8) { 
                        e.hp -= p.dmg; this.createFloatingText(e.x, e.y-20, Math.ceil(p.dmg)+(p.crit?'!':''), p.crit?'#f1c40f':'#fff');
                        p.p--; if(p.p<=0){p.life=0;break;} 
                    } 
                }
            }
            if(p.life<=0) this.projectiles.splice(i,1);
        }

        let viewDist = Math.max(inputManager.canvasWidth, inputManager.canvasHeight);
        for(let i=this.enemies.length-1; i>=0; i--) {
            let e = this.enemies[i]; 
            let dist = e.update(this.player.x, this.player.y, viewDist);
            if(dist < e.r + this.player.radius) {
                let hit = this.player.takeDamage(e.dmg);
                if(hit.dmg > 0) this.createFloatingText(this.player.x, this.player.y-20, `-${hit.dmg}`, '#e74c3c');
                else if(hit.dodged) this.createFloatingText(this.player.x, this.player.y-20, "DODGE!", '#3498db');
                if(this.player.hp <= 0) this.gameOver(false);
            }

            if(e.hp <= 0) {
                if(!e.despawned) {
                    this.kills++; this.killStats[e.emoji] = (this.killStats[e.emoji]||0)+1;
                    let v = 1; if(e.maxHp>100) v=10; if(e.maxHp>400) v=50;
                    if(Math.random() < 0.5) this.orbs.push(new Orb(e.x, e.y, v));
                    if(Math.random() < (saveService.data.skills.greed * 0.02)) { this.runGold++; saveService.data.gold++; }
                }
                this.enemies.splice(i,1);
            }
        }

        for(let i=this.floatingTexts.length-1; i>=0; i--) { 
            let ft=this.floatingTexts[i]; ft.y-=1; ft.life--; if(ft.life<=0) this.floatingTexts.splice(i,1); 
        }

        if(this.frames % 30 === 0) this.updateHUD();
        
        gameEvents.emit('RENDER_TICK', this);
        
        if (this.gameState === 'PLAYING') {
            this.animationFrameId = requestAnimationFrame(this.loop);
        }
        } catch (error) {
            Logger.error('GameLoop Crash', error);
            this.gameState = 'PAUSED'; // Safety stop to prevent infinite error loops
        }
    }
}

export const engine = new GameEngine();
