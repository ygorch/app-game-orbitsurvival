import { useState, useEffect } from 'react';
import { gameEvents } from '../../application/EventEmitter';
import { engine } from '../../application/GameEngine';
import { AudioManager } from '../../application/AudioManager';

export default function LevelUpModal() {
    const [data, setData] = useState<{choices: any[], rerolled: boolean, hp: number, gold: number} | null>(engine.levelUpData);

    useEffect(() => {
        const handler = (d: any) => setData(d);
        gameEvents.on('LEVEL_UP', handler);
        return () => { gameEvents.off('LEVEL_UP', handler); };
    }, []);

    if (!data) return null;

    const reroll = () => {
        AudioManager.play('ui', 'select');
        engine.reroll();
    };

    const select = (c: any) => {
        AudioManager.play('ui', 'select');
        engine.applyChoice(c);
        setData(null);
    };

    return (
        <section className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4 pointer-events-auto-override">
            <div className="w-full max-w-5xl metal-frame border-2 border-primary-container relative p-8 bg-[#2a2422]">
                <h2 className="font-headline-xl text-4xl text-primary text-center mb-6 embossed-text">Poder Ancestral</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {data.choices.map((c, i) => (
                        <div key={i} onClick={() => select(c)} className="leather-inset p-3 flex flex-col items-center gap-1 border border-[#1A1A1A] hover:border-primary cursor-pointer text-center min-h-[160px]">
                            <div className="text-4xl mb-1">{c.i}</div>
                            <h4 className="text-primary font-bold text-sm leading-tight">{c.n}</h4>
                            <p className="text-xs text-gray-400 mb-2 flex-1 leading-tight" dangerouslySetInnerHTML={{ __html: c.d }}></p>
                            <button className="metal-button w-full py-1 text-xs font-bold pointer-events-none mt-auto uppercase tracking-widest">Selecionar</button>
                        </div>
                    ))}
                </div>
                <div className="text-center w-full flex justify-center">
                    <button className="metal-button py-2 px-8 font-headline-md flex items-center gap-2" disabled={data.rerolled || (data.gold < 3 && data.hp <= 15)} onClick={reroll}>
                        <span className="material-symbols-outlined">casino</span> {data.rerolled ? 'Destino Selado' : 'Rerolar Destino (3 💰 ou 10 ❤️)'}
                    </button>
                </div>
            </div>
        </section>
    );
}
