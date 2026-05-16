import { Player } from '../domain/entities/Player';
import { Enemy } from '../domain/entities/Enemy';
import { Weapon } from '../domain/entities/Weapon';
import { Projectile } from '../domain/entities/Projectile';
import { Orb } from '../domain/entities/Orb';
import { ConsumableOnGround } from '../domain/entities/ConsumableOnGround';
import { AreaEffect } from '../domain/entities/AreaEffect';
import { ENEMY_DEFS, WEAPONS_INFO, ACHIEVEMENT_DEFS, CONSUMABLE_DEFS } from '../domain/constants/GameData';
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
    levelUpData: {choices: any[], rerolled: boolean, hp: number, gold: number} | null = null;
    gameOverData: any = null;
    gameState: 'PLAYING' | 'PAUSED' | 'LEVEL_UP' | 'GAMEOVER' = 'PLAYING';
    MAP_SIZE = 2000;
    animationFrameId = 0;
    
    inventory: string[] = [];
    consumablesOnGround: any[] = [];
    areaEffects: any[] = [];
    activeBuffs: {id: string, type: string, val: number, timer: number, tickCounter: number}[] = [];
    keyHoldTimers: number[] = [0,0,0,0,0];
    
    playerTakenDamage = false;
    totalDamageDealt = 0;

    checkAchievement(id: string) {
        if (!saveService.data.achievements[id]) {
            saveService.data.achievements[id] = true;
            saveService.save();
            gameEvents.emit('ACHIEVEMENT_UNLOCKED', { id, ...ACHIEVEMENT_DEFS[id] });
        }
    }

    dealDamageToEnemy(e: Enemy, dmg: number, isCrit: boolean) {
        e.hp -= dmg;
        this.totalDamageDealt += dmg;
        if(this.totalDamageDealt >= 1000 && this.totalDamageDealt - dmg < 1000) this.checkAchievement('gladiator');
        this.createFloatingText(e.x, e.y-20, Math.ceil(dmg)+(isCrit?'!':''), isCrit?'#f1c40f':'#fff');
    }

    start(heroId: string, weaponId: string) {
        this.player = new Player(heroId);
        this.weapons = [new Weapon(weaponId)];
        this.frames = 0; this.survivalFrames = 0; this.kills = 0; this.runGold = 0;
        this.playerTakenDamage = false; this.totalDamageDealt = 0;
        this.playerLevel = 1; this.playerXp = 0; this.xpNeeded = 5; this.killStats = {};
        this.levelRerolled = false;
        this.enemies = []; this.orbs = []; this.projectiles = []; this.floatingTexts = [];
        this.inventory = []; this.consumablesOnGround = []; this.areaEffects = []; this.activeBuffs = []; this.keyHoldTimers = [0,0,0,0,0];
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
            if(this.playerLevel === 30) this.checkAchievement('level_30');
            if(this.playerLevel === 55) this.checkAchievement('level_55');
        }
        this.updateHUD();
        
        let choices: any[] = [];
        
        // 1x Garantido: Upgrade
        let upgWeapons = this.weapons.filter(w => w.level < w.maxLevel);
        if(upgWeapons.length > 0) {
            let w = upgWeapons[Math.floor(Math.random()*upgWeapons.length)];
            choices.push({t:'upg', ref:w, n:`Evoluir ${w.name}`, d:`<span class="text-green-400 font-bold">Nível ${w.level+1}</span><br>Aumenta o Dano Bruto e a Área de Impacto/Velocidade.`, i:w.icon});
        }
        
        // 1x Garantido: Nova Arma
        if(this.weapons.length < 3) {
            let newWs = Object.keys(WEAPONS_INFO).filter(id => !this.weapons.some(w => w.id === id));
            if(newWs.length > 0) {
                let id = newWs[Math.floor(Math.random()*newWs.length)];
                let info = WEAPONS_INFO[id];
                choices.push({ t:'new', id:id, n:`Nova Arma: ${info.name}`, d:`<span class="text-primary-fixed-dim text-xs uppercase">${info.type}</span><br>${info.desc}`, i: info.icon });
            }
        }
        
        let pool: any[] = [];
        pool.push({t:'stat', s:'str', n:'Força Titânica', d:'<span class="text-green-400 font-bold">+5 STR</span><br>Aumenta dano físico.', i:'⚔️'});
        pool.push({t:'stat', s:'agi', n:'Agilidade Felina', d:'<span class="text-green-400 font-bold">+5 AGI</span><br>Reduz Cooldown.', i:'⚡'});
        pool.push({t:'stat', s:'sta', n:'Estamina Inabalável', d:'<span class="text-green-400 font-bold">+5 STA</span><br>Aumenta HP Max e Armadura.', i:'🛡️'});
        pool.push({t:'stat', s:'int', n:'Conhecimento Arcano', d:'<span class="text-green-400 font-bold">+5 INT</span><br>Aumenta dano mágico.', i:'🧠'});
        pool.push({t:'stat', s:'dex', n:'Destreza Certeira', d:'<span class="text-green-400 font-bold">+5 DEX</span><br>Aumenta dano à distância.', i:'🎯'});
        pool.push({t:'stat', s:'luk', n:'Sorte do Tolo', d:'<span class="text-green-400 font-bold">+5 LUK</span><br>Chance de Crítico e Esquiva.', i:'🍀'});
        
        Object.keys(CONSUMABLE_DEFS).forEach(k => {
            let def = CONSUMABLE_DEFS[k];
            pool.push({t:'consumable', id: k, n: def.name, d: `<span class="text-primary-fixed-dim text-xs uppercase">Consumível</span><br>${def.desc}`, i: def.icon});
        });
        
        pool.push({t:'heal', n:'Benção de Sangue', d:'Milagre das ruínas. Restaura instantaneamente 100% da sua Vida.', i:'❤️'});
        pool.push({t:'gold', n:'Bolsa de Ouro', d:'Adquire 100 moedas de ouro.', i:'💰'});

        pool.sort(() => Math.random() - 0.5);

        while(choices.length < 6 && pool.length > 0) {
            choices.push(pool.pop());
        }

        this.levelUpData = { choices, rerolled: this.levelRerolled, hp: this.player.hp, gold: this.runGold };
        gameEvents.emit('STATE_CHANGE', 'LEVEL_UP');
        gameEvents.emit('LEVEL_UP', this.levelUpData);
    }

    applyChoice(c: any) {
        if(c.t === 'new') this.weapons.push(new Weapon(c.id));
        else if(c.t === 'upg') c.ref.level++;
        else if(c.t === 'stat') { (this.player as any)[c.s] += 5; this.player.calcDerivedStats(); }
        else if(c.t === 'consumable') {
            if(this.inventory.length < 5) this.inventory.push(c.id);
            else this.consumablesOnGround.push(new ConsumableOnGround(this.player.x, this.player.y, c.id));
        }
        else if(c.t === 'heal') this.player.hp = this.player.maxHp;
        else if(c.t === 'gold') { this.runGold += 100; saveService.data.gold += 100; saveService.save(); }
        this.levelUpData = null;
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
        if(vic && !this.playerTakenDamage) this.checkAchievement('untouchable');
        this.gameState = 'GAMEOVER';
        saveService.data.gold += this.runGold;
        saveService.save();
        this.gameOverData = { 
            vic, 
            level: this.playerLevel, 
            kills: this.kills, 
            gold: this.runGold, 
            survivalFrames: this.survivalFrames,
            player: this.player,
            weapons: this.weapons,
            maxFrames: 15 * 60 * 60
        };
        gameEvents.emit('STATE_CHANGE', 'GAMEOVER');
        gameEvents.emit('GAME_OVER', this.gameOverData);
    }

    createFloatingText(x: number, y: number, t: string, c: string) {
        this.floatingTexts.push({x, y, t, c, life: 45});
    }

    useConsumable(idx: number) {
        let id = this.inventory[idx];
        if(!id) return;
        let def = CONSUMABLE_DEFS[id];
        if(!def) return;
        
        if(def.type === 'heal_over_time') {
            this.activeBuffs.push({id, type: def.type, val: def.val, timer: def.duration*60, tickCounter: 5*60});
        } else if(def.type === 'shield') {
            let sIdx = this.activeBuffs.findIndex(b => b.type === 'shield');
            if(sIdx >= 0) this.activeBuffs[sIdx].val = Math.max(this.activeBuffs[sIdx].val, def.val);
            else this.activeBuffs.push({id, type: def.type, val: def.val, timer: 99999, tickCounter: 0});
        } else if(def.type === 'speed') {
            this.activeBuffs.push({id, type: def.type, val: def.val, timer: def.duration*60, tickCounter: 0});
        } else if(def.type === 'instant_aoe') {
            this.areaEffects.push(new AreaEffect('bomb', this.player.x, this.player.y, this.player.radius*10, 5));
            this.enemies.forEach(e => {
                if(Math.hypot(e.x-this.player.x, e.y-this.player.y) < this.player.radius*10) {
                    this.dealDamageToEnemy(e, def.val, false);
                }
            });
        } else if(def.type === 'field_dmg') {
            this.areaEffects.push(new AreaEffect('acid', this.player.x, this.player.y, this.player.radius*7, def.duration*60));
        } else if(def.type === 'field_slow_dmg') {
            this.areaEffects.push(new AreaEffect('gas', this.player.x, this.player.y, this.player.radius*8, def.duration*60));
        } else if(def.type === 'field_trap') {
            this.areaEffects.push(new AreaEffect('pitch', this.player.x, this.player.y, 80, def.duration*60));
        } else if(def.type === 'wall') {
            let move = inputManager.getMovement();
            let ang = Math.atan2(move.dy, move.dx);
            if(move.dx===0 && move.dy===0) ang = Math.PI/2;
            let px = this.player.x - Math.cos(ang)*50;
            let py = this.player.y - Math.sin(ang)*50;
            this.areaEffects.push(new AreaEffect('ice', px, py, 0, def.duration*60, 50, 200, ang + Math.PI/2));
        }
        
        this.inventory.splice(idx, 1);
        this.updateHUD();
    }

    loop = () => {
        if(this.gameState !== 'PLAYING') return;
        try {
            this.frames++; this.survivalFrames++;
            
            // Inventory input
            ['1','2','3','4','5'].forEach((k, idx) => {
                if(inputManager.keys[k]) {
                    if(this.inventory[idx]) {
                        this.keyHoldTimers[idx]++;
                        if(this.keyHoldTimers[idx] === 180) { // drop
                            this.consumablesOnGround.push(new ConsumableOnGround(this.player.x, this.player.y, this.inventory[idx]));
                            this.inventory.splice(idx, 1);
                            this.keyHoldTimers[idx] = 0;
                            inputManager.keys[k] = false;
                            this.updateHUD();
                        }
                    }
                } else {
                    if(this.keyHoldTimers[idx] > 0 && this.keyHoldTimers[idx] < 180) {
                        this.useConsumable(idx);
                    }
                    this.keyHoldTimers[idx] = 0;
                }
            });
            
            // Active Buffs
            let currentSpeedMult = 1;
            let shieldStacks = 0;
            for(let i=this.activeBuffs.length-1; i>=0; i--) {
                let b = this.activeBuffs[i];
                if(b.type === 'shield') {
                    shieldStacks += b.val;
                } else if(b.type === 'speed') {
                    currentSpeedMult = Math.max(currentSpeedMult, b.val);
                    b.timer--;
                } else if(b.type === 'heal_over_time') {
                    b.timer--;
                    b.tickCounter--;
                    if(b.tickCounter <= 0) {
                        this.player.hp = Math.min(this.player.maxHp, this.player.hp + b.val);
                        this.createFloatingText(this.player.x, this.player.y-20, `+${b.val}`, '#2ecc71');
                        b.tickCounter = 5*60;
                    }
                }
                if(b.type !== 'shield' && b.timer <= 0) this.activeBuffs.splice(i,1);
            }

            let move = inputManager.getMovement();
            this.player.update(move.dx * currentSpeedMult, move.dy * currentSpeedMult, this.MAP_SIZE);
        
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
                    this.dealDamageToEnemy(e, dmg, isCrit); e.x += (e.x-this.player.x)*0.1; 
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
                            this.dealDamageToEnemy(e, dmg, isCrit); 
                            e.x += Math.cos(ang)*(w.id==='sword'?20:5); e.y += Math.sin(ang)*(w.id==='sword'?20:5); 
                        }
                    }
                });
                w.timer = w.getCooldown(this.player);
            } else if(w.id === 'wand') {
                let target: Enemy | null = null; let min = 999999;
                for (const e of this.enemies) { let d=(e.x-this.player.x)**2 + (e.y-this.player.y)**2; if(d<min){min=d;target=e;} }
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
                    this.dealDamageToEnemy(e, dmg, isCrit);
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
                        this.dealDamageToEnemy(e, p.dmg, p.crit);
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
                let sIdx = this.activeBuffs.findIndex(b => b.type === 'shield');
                if(sIdx >= 0) {
                    this.createFloatingText(this.player.x, this.player.y-20, "BLOCKED!", '#3498db');
                    this.activeBuffs[sIdx].val--;
                    if(this.activeBuffs[sIdx].val <= 0) this.activeBuffs.splice(sIdx, 1);
                    e.x += (e.x - this.player.x) * 0.5; e.y += (e.y - this.player.y) * 0.5;
                } else {
                    let hit = this.player.takeDamage(e.dmg);
                    if(hit.dmg > 0) { this.createFloatingText(this.player.x, this.player.y-20, `-${hit.dmg}`, '#e74c3c'); this.playerTakenDamage = true; }
                    else if(hit.dodged) this.createFloatingText(this.player.x, this.player.y-20, "DODGE!", '#3498db');
                    if(this.player.hp <= 0) this.gameOver(false);
                }
            }

            if(e.hp <= 0) {
                if(!e.despawned) {
                    this.kills++; this.killStats[e.emoji] = (this.killStats[e.emoji]||0)+1;
                    if(this.kills === 1) this.checkAchievement('first_blood');
                    if(this.kills === 100) this.checkAchievement('slayer');
                    if(e.emoji === '👹') this.checkAchievement('boss_slayer');
                    
                    let v = 1; if(e.maxHp>100) v=10; if(e.maxHp>400) v=50;
                    if(Math.random() < 0.5) this.orbs.push(new Orb(e.x, e.y, v));
                    if(Math.random() < (saveService.data.skills.greed * 0.02)) { this.runGold++; saveService.data.gold++; if(saveService.data.gold >= 1000) this.checkAchievement('rich_1000'); }
                    
                    let dropChance = e.maxHp > 100 ? 0.05 : 0.01;
                    if(Math.random() < dropChance) {
                        let cKeys = Object.keys(CONSUMABLE_DEFS).filter(k => k !== 'gold_coin');
                        let randomCons = cKeys[Math.floor(Math.random()*cKeys.length)];
                        this.consumablesOnGround.push(new ConsumableOnGround(e.x, e.y, randomCons));
                    }
                    if (this.survivalFrames >= 2 * 60 * 60) {
                        if (Math.random() < 0.005) {
                            this.consumablesOnGround.push(new ConsumableOnGround(e.x, e.y, 'gold_coin'));
                        }
                    }
                }
                this.enemies.splice(i,1);
            }
        }

        for(let i=this.floatingTexts.length-1; i>=0; i--) { 
            let ft=this.floatingTexts[i]; ft.y-=1; ft.life--; if(ft.life<=0) this.floatingTexts.splice(i,1); 
        }

        if(this.frames % 30 === 0) this.updateHUD();
        
        // Consumables on ground update
        for(let i=this.consumablesOnGround.length-1; i>=0; i--) {
            let c = this.consumablesOnGround[i];
            c.despawnTimer--;
            if(c.despawnTimer <= 0) { this.consumablesOnGround.splice(i,1); continue; }
            
            if(Math.hypot(this.player.x-c.x, this.player.y-c.y) < this.player.radius+c.r) {
                if (c.id === 'gold_coin') {
                    this.runGold++; saveService.data.gold++; saveService.save();
                    this.consumablesOnGround.splice(i,1);
                    this.updateHUD();
                } else if(this.inventory.length < 5) {
                    this.inventory.push(c.id);
                    this.consumablesOnGround.splice(i,1);
                    this.updateHUD();
                }
            }
        }

        // Area Effects
        for(let i=this.areaEffects.length-1; i>=0; i--) {
            let a = this.areaEffects[i];
            a.timer--;
            
            if(a.type === 'acid' || a.type === 'gas' || a.type === 'pitch') {
                if(this.frames % 60 === 0) {
                    let def = a.type === 'acid' ? CONSUMABLE_DEFS['acid'] : (a.type==='gas' ? CONSUMABLE_DEFS['gas'] : null);
                    this.enemies.forEach(e => {
                        if(Math.hypot(e.x-a.x, e.y-a.y) < a.r) {
                            if(a.type === 'acid') this.dealDamageToEnemy(e, def!.val, false);
                            if(a.type === 'gas') { this.dealDamageToEnemy(e, def!.val, false); }
                        }
                    });
                }
            }
            if(a.timer <= 0) this.areaEffects.splice(i,1);
        }
        
        // Ice Barrier pushback and Trap slow
        this.enemies.forEach(e => {
            let inSlow = false;
            this.areaEffects.forEach(a => {
                if((a.type === 'gas' || a.type === 'pitch') && Math.hypot(e.x-a.x, e.y-a.y) < a.r) {
                    inSlow = true;
                    e.speedModifier = a.type === 'pitch' ? 0.2 : 0.5;
                }
                if(a.type === 'ice') {
                    let dx = e.x - a.x; let dy = e.y - a.y;
                    let rotDx = dx * Math.cos(-a.ang!) - dy * Math.sin(-a.ang!);
                    let rotDy = dx * Math.sin(-a.ang!) + dy * Math.cos(-a.ang!);
                    let hw = a.w!/2, hh = a.h!/2;
                    let cx = Math.max(-hw, Math.min(hw, rotDx));
                    let cy = Math.max(-hh, Math.min(hh, rotDy));
                    let px = rotDx - cx; let py = rotDy - cy;
                    if(px*px + py*py < e.r*e.r) {
                        e.x += Math.cos(a.ang!)*px; e.y += Math.sin(a.ang!)*py;
                    }
                }
            });
            if(!inSlow) e.speedModifier = 1;
        });

        gameEvents.emit('RENDER_TICK', this);
        
        if (this.gameState === 'PLAYING') {
            if(this.survivalFrames === 5 * 60 * 60) {
                this.checkAchievement('survivor_5');
                if(!this.playerTakenDamage) this.checkAchievement('ghost');
            }
            if(saveService.data.gold >= 1000) this.checkAchievement('rich_1000');
            this.animationFrameId = requestAnimationFrame(this.loop);
        }
        } catch (error) {
            Logger.error('GameLoop Crash', error);
            this.gameState = 'PAUSED'; // Safety stop to prevent infinite error loops
        }
    }
}

export const engine = new GameEngine();
