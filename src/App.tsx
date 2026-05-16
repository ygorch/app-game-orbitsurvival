import { useEffect, useState, useRef } from 'react';
import { gameEvents } from './application/EventEmitter';
import { GameState } from './domain/types';
import { engine } from './application/GameEngine';
import { CanvasRenderer } from './infrastructure/rendering/CanvasRenderer';
import { saveService } from './application/SaveService';

import MainMenu from './ui/components/MainMenu';
import CharSelect from './ui/components/CharSelect';
import SkillTree from './ui/components/SkillTree';
import HUD from './ui/components/HUD';
import LevelUpModal from './ui/components/LevelUpModal';
import PauseModal from './ui/components/PauseModal';
import GameOverModal from './ui/components/GameOverModal';
import AchievementToast from './ui/components/AchievementToast';

export default function App() {
    const [gameState, setGameState] = useState<GameState>('TITLE');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gold, setGold] = useState(saveService.data.gold);

    useEffect(() => {
        if (canvasRef.current && !window.rendererInit) {
            window.rendererInit = true;
            new CanvasRenderer(canvasRef.current);
        }
    }, []);

    useEffect(() => {
        const onStateChange = (state: GameState) => setGameState(state);
        const onSaveUpdated = (data: any) => setGold(data.gold);

        gameEvents.on('STATE_CHANGE', onStateChange);
        gameEvents.on('SAVE_UPDATED', onSaveUpdated);
        
        const keyHandler = (e: KeyboardEvent) => {
            if(e.code === 'Escape' || e.key.toLowerCase() === 'p') { 
                if(engine.gameState === 'PLAYING') {
                    engine.pause();
                    changeState('PAUSED');
                } else if(engine.gameState === 'PAUSED') {
                    engine.resume();
                    changeState('PLAYING');
                }
            }
        };
        window.addEventListener('keydown', keyHandler);
        
        return () => {
            gameEvents.off('STATE_CHANGE', onStateChange);
            gameEvents.off('SAVE_UPDATED', onSaveUpdated);
            window.removeEventListener('keydown', keyHandler);
        };
    }, []);

    const changeState = (s: GameState) => {
        setGameState(s);
        gameEvents.emit('STATE_CHANGE', s);
    };

    return (
        <>
            <canvas ref={canvasRef} style={{ display: gameState === 'PLAYING' || gameState === 'PAUSED' || gameState === 'LEVEL_UP' ? 'block' : 'none' }}></canvas>
            
            {(gameState !== 'PLAYING' && gameState !== 'GAMEOVER') && (
                <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-20 bg-surface-container-highest border-b-4 border-primary-container shadow-[0_4px_0_0_rgba(0,0,0,0.5)] pointer-events-auto-override">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-3xl cursor-pointer" onClick={() => changeState('TITLE')}>menu</span>
                        <h1 className="font-headline-xl text-4xl text-primary drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">SourLate</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 leather-inset px-3 py-1 rounded-sm">
                            <span className="material-symbols-outlined text-primary-fixed-dim" style={{fontVariationSettings: "'FILL' 1"}}>monetization_on</span>
                            <span className="font-stat-lg text-primary-fixed-dim">{gold}</span>
                        </div>
                    </div>
                </header>
            )}

            <main className={`flex-1 ${gameState !== 'PLAYING' && gameState !== 'GAMEOVER' ? 'mt-20' : ''} relative w-full h-full flex flex-col z-10 pointer-events-none-override`}>
                {gameState === 'TITLE' && <MainMenu onChangeState={changeState} />}
                {gameState === 'SKILL_TREE' && <SkillTree onChangeState={changeState} />}
                {gameState === 'CHAR_SELECT' && <CharSelect onChangeState={changeState} onStart={(h, w) => { changeState('PLAYING'); engine.start(h, w); }} />}
                
                {gameState === 'PLAYING' && <HUD />}
                {gameState === 'LEVEL_UP' && <LevelUpModal />}
                {gameState === 'PAUSED' && <PauseModal onResume={() => { engine.resume(); changeState('PLAYING'); }} />}
                {gameState === 'GAMEOVER' && <GameOverModal />}
                
                <AchievementToast />
            </main>
        </>
    );
}

declare global {
    interface Window { rendererInit?: boolean; }
}
