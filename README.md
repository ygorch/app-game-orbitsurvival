# SourLate – Roguelite Game (React + Vite + TypeScript)

---

## 📖 Visão Geral
Um Roguelite **modular**, desenhado com **Clean Architecture** (DDD) e pronto para evoluir para **Tauri** e publicação na Steam. O código está totalmente desacoplado: a *engine* (lógica de jogo) não conhece React ou o DOM, e a UI reage a eventos emitidos pela engine.

---

## 🏗️ Arquitetura e Decisões Técnicas
A base de código foi estruturada em 4 camadas principais:

### 1️⃣ `src/domain/`
* **Entidades puras** – `Player`, `Enemy`, `Weapon`, `Projectile`, `Orb`, `ConsumableOnGround`, `AreaEffect`.
* **Constantes / Types** – definições de armas, inimigos, consumíveis (`CONSUMABLE_DEFS`) e conquistas (`ACHIEVEMENT_DEFS`).
* Nenhuma dependência de React, Canvas ou Browser.

### 2️⃣ `src/application/`
* **GameEngine.ts** – loop principal (`requestAnimationFrame`), cálculo de colisões, gerenciamento de drops, buffs, área de efeito e nível‑up.
* **EventEmitter.ts** – Pub/Sub que permite que a UI (React) seja notificada sem acoplamento.
* **SaveService.ts** – persistência em `localStorage` (progressão, ouro, habilidades, achievements).

### 3️⃣ `src/infrastructure/`
* **InputManager.ts** – captura de teclado/mouse, incluindo suporte a **teclas 1‑5** para o inventário.
* **CanvasRenderer.ts** – renderiza todas as entidades (player, inimigos, projéteis, consumíveis, efeitos de área) no `<canvas>`.
* **Logger.ts** – log estruturado para debugging (agora com tratamento de exceções).

### 4️⃣ `src/ui/`
* **React** – gerencia menus, HUD, Modal de *Level‑Up*, *Pause*, *Game‑Over* e *AchievementToast*.
* Os componentes se inscrevem em `gameEvents` para atualizar seu estado automaticamente.

---

## 🚀 Como Rodar Localmente
```bash
# Instalar dependências
npm install

# Iniciar dev server
npm run dev
```
Acesse `http://localhost:5173/`.

---

## ✨ Funcionalidades Implementadas
| Feature | Descrição |
|---|---|
| **Inventário (5 slots)** | Barra de itens no rodapé; uso via teclas `1‑5`; **hold‑to‑drop** (3 s) para soltar no chão. |
| **Consumíveis** | Poções de cura (over‑time), escudos, aumento de velocidade, bombas explosivas, ácido, gás, piche, barreira de gelo e parede de gelo. |
| **Buff System** | Buffs ativos (`activeBuffs`) com timer, stacks de escudo, multiplicador de velocidade e cura periódica. |
| **Área de Efeito (AreaEffect)** | Terrenos que aplicam dano/slow/push‑back; suporte a rotacionamento (ice wall). |
| **Level‑Up (6 opções)** | Tela de escolha com 6 cartas: 1 upgrade de arma equipada, 1 arma nova (se houver espaço), atributos (STR/AGI/STA/INT/DEX/LUK), consumível, ouro (+100) e cura instantânea. |
| **Loot System** | Drop de orbs (1 % para inimigos comuns, 5 % para chefões); consumíveis podem dropar com chance escalável (1 %/5 %). |
| **Achievements** | 10 conquistas básicas (First Blood, Survivor 5 min, Rich 1000, Boss Slayer, Level 30/55, etc.) + métricas de dano e sobrevivência. |
| **Ice Barrier / Wall** | Gera parede de gelo atrás do jogador; empurra inimigos que colidem e aplica slow. |
| **HUD Dinâmico** | Exibe HP, XP, nível, ouro, kills, tempo de sobrevivência e slots de inventário. |
| **Logging** | `Logger.ts` captura exceções críticas do loop de jogo para facilitar debugging. |

---

## 🎮 Mecânicas do Jogo
### Loop Básico
1. **Input** – `InputManager` coleta movimento e teclas de inventário.
2. **Update** – `GameEngine.loop` incrementa frames, processa:
   * **Inventário** (uso, hold‑to‑drop,
   * **Buffs** (tempo, curas, escudos, velocidade),
   * **AreaEffects** (dano periódico, slow, push‑back),
   * **Entidades** (player, inimigos, projéteis, orbs),
   * **Colisões** (dano, bloqueio por escudo, remoção de inimigos).
3. **Render** – `CanvasRenderer` escuta `RENDER_TICK` e desenha tudo.
4. **Events** – EventEmitter propaga `HUD_UPDATE`, `LEVEL_UP`, `ACHIEVEMENT_UNLOCKED`, etc.

### Inventário & Consumíveis
* Cada slot armazena o **id** do consumível (`string`).
* Pressionar a tecla correspondente **usa** o item imediatamente.
* Segurar a tecla por **180 frames (≈3 s)** **solta** o item no chão (`ConsumableOnGround`).
* Itens no chão são coletados automaticamente ao tocar, desde que haja espaço no inventário.

### Consumíveis (Resumo)
| ID | Nome | Tipo | Valor | Duração (s) |
|---|---|---|---|---|
| `red_heal` | Poção de Cura Vermelha | `heal_over_time` | +5 HP | 30 |
| `yellow_heal` | Poção de Cura Amarela | `heal_over_time` | +10 HP | 30 |
| `white_heal` | Poção de Cura Branca | `heal_over_time` | +15 HP | 30 |
| `green_shield` | Poção de Proteção Verde | `shield` | 1 bloqueio | — |
| `blue_shield` | Poção de Proteção Azul | `shield` | 3 bloqueios | — |
| `orange_speed` | Poção de Agilidade Laranja | `speed` | 1.3× | 5 |
| `purple_speed` | Poção de Agilidade Roxa | `speed` | 1.3× | 10 |
| `bomb` | Bomba Explosiva | `instant_aoe` | 35 dmg | — |
| `acid` | Ácido Volátil | `field_dmg` | 10 dmg/seg | 7 |
| `gas` | Gás (slow dmg) | `field_slow_dmg` | 5 dmg/seg | 7 |
| `pitch` | Piche (slow) | `field_trap` | — | 7 |
| `ice_wall` | Barreira de Gelo | `wall` | — | 5 |

### Buffs & Shields
* **Shield Stack** – bloqueia um ataque e diminui o stack; se acabar, o buff é removido.
* **Speed Buff** – multiplica o vetor de movimento (`currentSpeedMult`).
* **Heal‑over‑time** – restaura HP a cada 5 s enquanto ativo.

### Level‑Up (6‑card Grid)
* **Garantido** – 1 *upgrade* da arma equipada (se houver nível disponível).
* **Garantido** – 1 *nova arma* (se o jogador possuir menos de 3 armas).
* **Restante** – pode ser atributo, consumível, ouro (+100) ou cura total.
* O jogador seleciona uma carta; as demais são descartadas.

### Drop / Loot
* **Orbs** – dão XP; chance 50 % de spawn ao matar inimigo.
* **Consumíveis** – chance de drop baseada na vida máxima do inimigo (`1 %` comum, `5 %` chefão).  Quando o inventário está cheio, o item permanece no chão.
* **Gold** – incrementado por skill `greed`; ao alcançar 1000 gold, desbloqueia a Achievement `rich_1000`.

### Achievements
| ID | Nome | Condição |
|---|---|---|
| `first_blood` | 🩸 First Blood | Primeiro inimigo morto |
| `survivor_5` | ⏱️ Survivor | Sobrevivência de 5 min |
| `rich_1000` | 🪙 Treasure Hunter | 1000 gold acumulados |
| `boss_slayer` | 👑 Boss Slayer | Derrotar o chefe final |
| `level_30` | ⭐ Rising Hero | Alcance nível 30 |
| `level_55` | 🌟 Veteran | Alcance nível 55 |
| `gladiator` | 🏛️ Gladiator | Dano total ≥ 1000 |
| `slayer` | ⚔️ Slayer | 100 inimigos mortos |
| `untouchable` | 🙅‍♂️ Untouchable | Run sem receber dano |
| `ghost` | 👻 Ghost | 5 min sem receber dano |

---

## 🛠️ Próximos Passos (Roadmap Tauri)
1. **Configurar Tauri** – `npm i -D @tauri-apps/cli` e ajustar `tauri.conf.json`.
2. **Implementar Backend de Saves** – usar API de arquivos Tauri para persitir `SaveService` fora do `localStorage`.
3. **Empacotar** – `tauri build` para gerar instalador Windows.
4. **Steam Integration** – adicionar suporte a achievements da Steam e Steamworks SDK.

---

## 📄 Licença
MIT © 2026 **SourLate** – Todos os direitos reservados.

---

*Este README foi gerado seguindo o template de documentação da skill `documentation-templates` e reflete o estado atual do projeto.*
