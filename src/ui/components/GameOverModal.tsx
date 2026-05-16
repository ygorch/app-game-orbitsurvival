import { useState, useEffect } from 'react';
import { gameEvents } from '../../application/EventEmitter';
import { engine } from '../../application/GameEngine';

export default function GameOverModal() {
    const [data, setData] = useState<any>(engine.gameOverData);

    useEffect(() => {
        const handler = (d: any) => setData(d);
        gameEvents.on('GAME_OVER', handler);
        return () => { gameEvents.off('GAME_OVER', handler); };
    }, []);

    if (!data) return null;

    const m = Math.floor((data.survivalFrames/60)/60).toString().padStart(2,'0'); 
    const s = Math.floor((data.survivalFrames/60)%60).toString().padStart(2,'0');
    const prog = Math.min(100, (data.survivalFrames / data.maxFrames) * 100).toFixed(1);

    return (
        <section className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-90 p-4 pointer-events-auto-override overflow-y-auto">
            <div className={`w-full max-w-4xl metal-frame border-2 p-6 bg-[#1e1e1e] text-center ${data.vic ? 'border-green-500' : 'border-error'}`}>
                <h1 className={`font-headline-xl text-5xl uppercase embossed-text mb-2 ${data.vic ? 'text-green-500' : 'text-error'}`}>{data.vic ? 'VITÓRIA' : 'MORTE INEVITÁVEL'}</h1>
                <p className="text-sm text-gray-400 mb-6 uppercase tracking-widest border-b border-[#333] pb-2">Seus espólios foram guardados no cofre</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="leather-inset p-4 flex flex-col gap-2 text-left text-sm">
                        <h3 className="text-primary font-headline-md border-b border-outline pb-1 mb-2">Estatísticas da Run</h3>
                        <div className="flex justify-between border-b border-[#333] pb-1"><span>Nível Alcançado:</span> <span className="text-primary font-bold">{data.level}</span></div>
                        <div className="flex justify-between border-b border-[#333] pb-1"><span>Tempo de Sobrevivência:</span> <span className="text-primary font-bold">{m}:{s}</span></div>
                        <div className="flex justify-between border-b border-[#333] pb-1"><span>Progressão (Fase 15min):</span> <span className="text-blue-400 font-bold">{prog}%</span></div>
                        <div className="flex justify-between border-b border-[#333] pb-1"><span>Monstros Abatidos:</span> <span className="text-error font-bold">{data.kills}</span></div>
                        <div className="flex justify-between"><span>Ouro Coletado:</span> <span className="text-primary-fixed-dim font-bold">{data.gold} 💰</span></div>
                    </div>
                    
                    <div className="leather-inset p-4 flex flex-col gap-2 text-left text-sm">
                        <h3 className="text-primary font-headline-md border-b border-outline pb-1 mb-2">Atributos Finais</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            <div>STR: <span className="text-error font-bold">{data.player.str}</span></div>
                            <div>AGI: <span className="text-primary-fixed-dim font-bold">{data.player.agi}</span></div>
                            <div>STA: <span className="text-green-500 font-bold">{data.player.sta}</span></div>
                            <div>INT: <span className="text-blue-400 font-bold">{data.player.int}</span></div>
                            <div>DEX: <span className="text-purple-400 font-bold">{data.player.dex}</span></div>
                            <div>LUK: <span className="text-yellow-400 font-bold">{data.player.luk}</span></div>
                        </div>
                    </div>
                </div>

                <div className="leather-inset p-4 mb-6 text-left">
                    <h3 className="text-primary font-headline-md border-b border-outline pb-1 mb-3">Relíquias Adquiridas</h3>
                    <div className="flex flex-wrap gap-2">
                        {data.weapons.length === 0 ? <span className="text-sm text-gray-500">Nenhuma relíquia equipada.</span> : data.weapons.map((w: any) => (
                            <div key={w.id} className="flex items-center gap-2 bg-[#111] p-2 border border-[#333] rounded w-[48%] max-w-[200px]">
                                <span className="text-2xl">{w.icon}</span>
                                <span className="text-xs leading-tight"><span className="font-bold text-primary">{w.name}</span> <br/><span className="text-gray-400">Nível {w.level}</span></span>
                            </div>
                        ))}
                    </div>
                </div>

                <button className="metal-button w-full py-4 font-headline-md uppercase tracking-widest" onClick={() => location.reload()}>Retornar ao Vazio</button>
            </div>
        </section>
    );
}
