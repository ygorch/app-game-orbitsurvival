import { useState, useEffect } from 'react';
import { gameEvents } from '../../application/EventEmitter';
import { CONSUMABLE_DEFS } from '../../domain/constants/GameData';
import { GameEngine } from '../../application/GameEngine';

export default function InventoryBar() {
    const [inventory, setInventory] = useState<string[]>([]);
    const [timers, setTimers] = useState<number[]>([0,0,0,0,0]);

    useEffect(() => {
        const handler = (engine: GameEngine) => {
            setInventory([...engine.inventory]);
            setTimers([...engine.keyHoldTimers]);
        };
        gameEvents.on('RENDER_TICK', handler);
        return () => { gameEvents.off('RENDER_TICK', handler); };
    }, []);

    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[80] flex gap-2">
            {[0, 1, 2, 3, 4].map(idx => {
                const itemId = inventory[idx];
                const def = itemId ? CONSUMABLE_DEFS[itemId] : null;
                const progress = Math.min(100, (timers[idx] / 180) * 100);

                return (
                    <div key={idx} className="relative w-16 h-16 metal-frame border-2 border-primary bg-[#1e1e1e] flex flex-col items-center justify-center shadow-lg pointer-events-none-override">
                        <div className="absolute top-1 left-1 text-[10px] text-primary font-bold">{idx + 1}</div>
                        
                        {def ? (
                            <>
                                <div className="text-3xl">{def.icon}</div>
                                {progress > 0 && (
                                    <div className="absolute bottom-0 left-0 h-1 bg-red-500 transition-all duration-75" style={{width: `${progress}%`}}></div>
                                )}
                            </>
                        ) : (
                            <div className="text-gray-600 text-xs uppercase opacity-30 tracking-widest">vazio</div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
