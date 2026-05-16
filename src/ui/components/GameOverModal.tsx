import { useState, useEffect } from 'react';
import { gameEvents } from '../../application/EventEmitter';

export default function GameOverModal() {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const handler = (d: any) => setData(d);
        gameEvents.on('GAME_OVER', handler);
        return () => { gameEvents.off('GAME_OVER', handler); };
    }, []);

    if (!data) return null;

    const m = Math.floor((data.survivalFrames/60)/60).toString().padStart(2,'0'); 
    const s = Math.floor((data.survivalFrames/60)%60).toString().padStart(2,'0');

    return (
        <section className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-90 p-4 pointer-events-auto-override">
            <div className={`w-full max-w-md metal-frame border-2 p-8 bg-[#1e1e1e] text-center ${data.vic ? 'border-green-500' : 'border-error'}`}>
                <h1 className={`font-headline-xl uppercase embossed-text mb-6 ${data.vic ? 'text-green-500' : 'text-error'}`}>{data.vic ? 'VITÓRIA' : 'MORTE INEVITÁVEL'}</h1>
                <div className="leather-inset p-4 space-y-2 mb-6 text-left text-lg">
                    <div className="flex justify-between border-b border-[#333] pb-1"><span>Nível Alcançado:</span> <span className="text-primary">{data.level}</span></div>
                    <div className="flex justify-between border-b border-[#333] pb-1"><span>Minutos Vivos:</span> <span className="text-primary">{m}:{s}</span></div>
                    <div className="flex justify-between border-b border-[#333] pb-1"><span>Monstros Mortos:</span> <span className="text-error">{data.kills}</span></div>
                    <div className="flex justify-between border-b border-[#333] pb-1"><span>Ouro Poupado:</span> <span className="text-primary-fixed-dim">{data.gold}</span></div>
                </div>
                <button className="metal-button w-full py-4 font-headline-md uppercase tracking-widest" onClick={() => location.reload()}>Aceitar o Destino</button>
            </div>
        </section>
    );
}
