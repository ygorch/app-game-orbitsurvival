import { WeaponInfo } from '../types';

export const WEAPONS_INFO: Record<string, WeaponInfo> = {
    'axe': { name: 'Machado', icon: '🪓', type: 'Curto Alcance (Auto)', desc: 'Giro letal de 360º ao seu redor. Escala muito bem com Força.' },
    'sword': { name: 'Espada', icon: '⚔️', type: 'Curto Alcance (Clique)', desc: 'Corte frontal rápido em área. Escala com Força e Destreza.' },
    'knife': { name: 'Facas', icon: '🔪', type: 'Curto Alcance (Clique)', desc: 'Ataques super rápidos e colados. Escala com Força e Agilidade.' },
    'wand': { name: 'Varinha', icon: '🪄', type: 'Mágico (Auto-Aim)', desc: 'Dispara mísseis mágicos teleguiados. Escala com Inteligência.' },
    'bow': { name: 'Arco', icon: '🏹', type: 'Longo Alcance (Clique)', desc: 'Dispara flechas velozes e perfurantes na mira. Escala muito com Destreza.' },
    'pistol': { name: 'Pistola', icon: '🔫', type: 'Longo Alcance (Clique)', desc: 'Rajadas rápidas e precisas. Escala muito com Destreza e Agilidade.' },
    'aura': { name: 'Aura', icon: '✨', type: 'Mágico (Passiva)', desc: 'Campo de força contínuo e mortífero. Escala com Inteligência e Estamina.' }
};

export const SKILL_DEFS: Record<string, any> = {
    str: { name: 'Força Titânica', desc: 'Aumenta o ataque de armas de curto alcance (Machado, Espada, Faca). Fortalece golpes físicos devastadores.', cost: 150, max: 5, icon: '⚔️', attr: '+2 STR' },
    agi: { name: 'Agilidade Felina', desc: 'Reduz o tempo de recarga (Cooldown) de todas as armas. Ataques tornam-se borrões mortais.', cost: 150, max: 5, icon: '⚡', attr: '+2 AGI' },
    sta: { name: 'Estamina Inabalável', desc: 'Aumenta o HP Máximo, a Armadura passiva, e a velocidade de movimento. Fortalece o dano base da Aura.', cost: 150, max: 5, icon: '🛡️', attr: '+2 STA' },
    int: { name: 'Conhecimento Arcano', desc: 'Aumenta o multiplicador de dano de armas puramente mágicas como a Varinha Teleguiada e a Aura de Força.', cost: 150, max: 5, icon: '🧠', attr: '+2 INT' },
    dex: { name: 'Destreza Certeira', desc: 'Aumenta muito o dano de armas de longo alcance (Arco, Pistola) e concede um bônus moderado para as de corpo-a-corpo.', cost: 150, max: 5, icon: '🎯', attr: '+2 DEX' },
    luk: { name: 'Sorte do Tolo', desc: 'Aumenta a chance de Acerto Crítico (2x Dano) em todos os ataques e fornece chance passiva de Esquiva.', cost: 200, max: 5, icon: '🍀', attr: '+2 LUK' },
    speed: { name: 'Passos Leves', desc: 'Aumenta a Velocidade Base de caminhada em 5% por nível.', cost: 100, max: 5, icon: '👟', attr: '+5% SPD' },
    damage: { name: 'Brutalidade', desc: 'Aumenta o dano final global de todas as fontes de ataque em 10% por nível.', cost: 250, max: 5, icon: '💪', attr: '+10% DMG' },
    hp: { name: 'Coração de Dragão', desc: 'Reforça o recipiente vital do herói, concedendo mais vida máxima base.', cost: 100, max: 5, icon: '❤️', attr: '+15 HP' },
    xp: { name: 'Sábio', desc: 'Aumenta a quantidade de experiência absorvida em 5% por nível, garantindo evolução acelerada.', cost: 150, max: 5, icon: '📜', attr: '+5% XP Gain' },
    greed: { name: 'Avareza', desc: 'Aumenta a chance dos monstros largarem Ouro Brilhante direto em suas mãos sem precisar coletar.', cost: 300, max: 5, icon: '💰', attr: '+2% Gold Drop' },
    magnet: { name: 'Ímã de Almas', desc: 'Orbes de XP voarão até você de distâncias maiores.', cost: 150, max: 5, icon: '🧲', attr: '+20px Área' }
};

export const ENEMY_DEFS = [
    { emoji: '💀', hp: 30, spd: 1.5, dmg: 10 }, { emoji: '👾', hp: 50, spd: 1.8, dmg: 20 }, { emoji: '👻', hp: 80, spd: 1.2, dmg: 30 },
    { emoji: '👽', hp: 60, spd: 2.8, dmg: 45 }, { emoji: '👺', hp: 150, spd: 2.0, dmg: 65 }, { emoji: '👹', hp: 500, spd: 0.9, dmg: 100 }
];

export const ACHIEVEMENT_DEFS: Record<string, {name: string, desc: string, icon: string}> = {
    first_blood: { name: 'First Blood', desc: 'Abata o seu primeiro inimigo.', icon: '🩸' },
    survivor_5: { name: 'Sobrevivente', desc: 'Sobreviva por 5 minutos em uma única run.', icon: '⏱️' },
    rich_1000: { name: 'Caçador de Tesouros', desc: 'Acumule 1000 moedas de ouro no cofre.', icon: '🪙' },
    boss_slayer: { name: 'Matador de Chefes', desc: 'Derrote o Oni Ancestral (Chefe Final).', icon: '👑' },
    level_30: { name: 'Herói em Ascensão', desc: 'Alcance o nível 30 em uma única run.', icon: '⭐' },
    level_55: { name: 'Veterano', desc: 'Alcance o nível 55 em uma única run.', icon: '🌟' },
    untouchable: { name: 'Intocável', desc: 'Vença o jogo sem sofrer NENHUM dano.', icon: '🛡️' },
    ghost: { name: 'Fantasma', desc: 'Sobreviva 5 minutos sem sofrer dano.', icon: '👻' },
    slayer: { name: 'Carrasco', desc: 'Abata 100 inimigos em uma run.', icon: '⚔️' },
    gladiator: { name: 'Gladiador', desc: 'Cause um total de 1.000 de dano em uma run.', icon: '💥' }
};
