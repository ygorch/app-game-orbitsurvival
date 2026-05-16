export type GameState = 'TITLE' | 'SKILL_TREE' | 'CHAR_SELECT' | 'PLAYING' | 'PAUSED' | 'LEVEL_UP' | 'GAMEOVER';

export interface SaveData {
  gold: number;
  skills: {
    speed: number; damage: number; hp: number; magnet: number;
    str: number; agi: number; sta: number; int: number; dex: number; luk: number;
    greed: number; xp: number;
  };
}

export interface WeaponInfo {
  name: string; icon: string; type: string; desc: string;
}
