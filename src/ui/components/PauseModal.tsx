import { useState, useEffect } from 'react';
import { gameEvents } from '../../application/EventEmitter';

export default function PauseModal({ onResume }: { onResume: () => void }) {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const handler = (d: any) => setData(d);
        gameEvents.on('PAUSE_DATA', handler);
        return () => { gameEvents.off('PAUSE_DATA', handler); };
    }, []);

    if (!data) return null;

    const m = Math.floor((data.survivalFrames/60)/60).toString().padStart(2,'0'); 
    const s = Math.floor((data.survivalFrames/60)%60).toString().padStart(2,'0');

    return (
        <section className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-90 p-4 pointer-events-auto-override overflow-y-auto">
            <div className="w-full max-w-5xl metal-frame border-2 border-primary-container p-6 bg-[#1e1e1e]">
                <h1 className="font-headline-xl text-4xl text-primary text-center embossed-text mb-6">MUNDO PAUSADO</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="leather-inset p-4">
                        <h3 className="text-primary border-b border-outline mb-2 font-headline-md flex items-center gap-2"><span className="text-2xl">👤</span> Atributos Físicos</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="col-span-2 text-center text-primary border-b border-[#333] pb-1 mb-1">Status Atuais na Run</div>
                            <div>STR: <span className="text-error font-bold">{data.player.str}</span></div>
                            <div>AGI: <span className="text-primary-fixed-dim font-bold">{data.player.agi}</span></div>
                            <div>STA: <span className="text-green-500 font-bold">{data.player.sta}</span></div>
                            <div>INT: <span className="text-blue-400 font-bold">{data.player.int}</span></div>
                            <div>DEX: <span className="text-purple-400 font-bold">{data.player.dex}</span></div>
                            <div>LUK: <span className="text-yellow-400 font-bold">{data.player.luk}</span></div>
                            <div className="col-span-2 text-xs border-t border-[#333] pt-2 mt-1">Crítico: {(data.player.critChance*100).toFixed(1)}% | Esquiva: {(data.player.dodgeChance*100).toFixed(1)}% | Defesa: {data.player.armor}</div>
                        </div>
                    </div>
                    <div className="leather-inset p-4">
                        <h3 className="text-primary border-b border-outline mb-2 font-headline-md flex items-center gap-2"><span className="text-2xl">🎒</span> Inventário</h3>
                        <div className="flex flex-col gap-2">
                            {data.weapons.length === 0 ? 'Nenhuma' : data.weapons.map((w: any) => (
                                <div key={w.id} className="flex items-center gap-3 bg-[#111] p-2 border border-[#333] rounded">
                                    <span className="text-3xl">{w.icon}</span> <span><span className="font-bold text-primary">{w.name}</span> <br/><span className="text-xs text-gray-400">Nível {w.level}</span></span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="leather-inset p-4">
                        <h3 className="text-primary border-b border-outline mb-2 font-headline-md flex items-center gap-2"><span className="text-2xl">📜</span> Registro de Batalha</h3>
                        <p className="text-sm">Tempo de Vida: <span className="text-secondary font-bold">{m}:{s}</span></p>
                        <p className="text-sm">Ouro Poupado: <span className="text-primary font-bold">{data.runGold}</span></p>
                        <p className="text-sm">XP Absorvida: <span className="text-blue-400 font-bold">{Math.floor(data.playerXp)}</span></p>
                        <h4 className="mt-4 text-xs text-gray-400 uppercase tracking-widest border-b border-[#333] pb-1">Bestiário Caçado</h4>
                        <div className="mt-2 text-xs text-on-surface-variant grid grid-cols-3 gap-1">
                            {Object.keys(data.killStats).length === 0 ? 'Nenhum' : Object.keys(data.killStats).map(k => (
                                <div key={k} className="bg-[#111] border border-[#333] px-2 py-2 rounded text-center flex flex-col"><span className="text-2xl">{k}</span> <span className="font-bold">{data.killStats[k]}</span></div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex justify-center gap-4">
                    <button className="metal-button py-3 px-8 font-headline-md uppercase tracking-widest" onClick={onResume}>Retornar ao Caos</button>
                    <button className="metal-button py-3 px-8 font-headline-md uppercase tracking-widest" style={{filter: 'hue-rotate(150deg)'}} onClick={() => location.reload()}>Abandonar Luta</button>
                </div>
            </div>
        </section>
    );
}
