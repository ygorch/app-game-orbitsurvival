import EventEmitter from 'eventemitter3';

export const gameEvents = new EventEmitter();

// Events:
// 'STATE_CHANGE' (newState: GameState)
// 'HUD_UPDATE' (hudData)
// 'SAVE_UPDATED' (saveData)
// 'LEVEL_UP' (choices)
// 'GAME_OVER' (stats)
// 'PAUSE_DATA' (stats)
