import { useState, useEffect } from 'react';
import { gameEvents } from '../../application/EventEmitter';

export default function HUD() {
    const [data, setData] = useState({ hp: 100, maxHp: 100, level: 1, xp: 0, xpNeeded: 1, gold: 0, kills: 0, timer: 0 });

    useEffect(() => {
        const handler = (d: any) => setData(d);
        gameEvents.on('HUD_UPDATE', handler);
        return () => { gameEvents.off('HUD_UPDATE', handler); };
    }, []);

    const m = Math.floor((data.timer/60)/60).toString().padStart(2,'0'); 
    const s = Math.floor((data.timer/60)%60).toString().padStart(2,'0');

    return (
        <section className="w-full h-full absolute inset-0 p-6 flex-col justify-between pointer-events-none-override flex">
            <div className="w-full flex flex-col gap-1 pointer-events-auto-override max-w-5xl mx-auto">
                <div className="w-full h-4 metal-frame relative flex items-center p-[1px]">
                    <div className="h-full bg-blue-600 border-r border-[#1A1A1A] transition-all duration-200" style={{ width: `${(data.xp/data.xpNeeded)*100}%` }}></div>
                    <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-12 h-12 bg-[#1A1A1A] rounded-full border-2 border-primary-container flex items-center justify-center">
                        <span className="font-stat-lg text-primary-fixed-dim">{data.level}</span>
                    </div>
                </div>
                <div className="w-full flex justify-between mt-2">
                    <div className="leather-inset px-4 py-1 font-headline-md text-on-surface-variant">{m}:{s}</div>
                    <div className="flex gap-2">
                        <div className="leather-inset px-3 py-1 flex gap-2"><span className="text-error">💀</span><span>{data.kills}</span></div>
                        <div className="leather-inset px-3 py-1 flex gap-2"><span className="text-primary">💰</span><span>{data.gold}</span></div>
                    </div>
                </div>
            </div>
            <div className="w-full flex flex-col items-center gap-2 pointer-events-auto-override mb-4 max-w-4xl mx-auto">
                <div className="w-full max-w-md metal-frame h-6 relative p-[2px] flex items-center justify-center">
                    <div className="absolute inset-0 bg-[#3E2723]"></div>
                    <div className="absolute left-0 top-0 bottom-0 bg-[#8B0000] border-r border-black transition-all" style={{ width: `${Math.max(0, data.hp)/data.maxHp*100}%` }}></div>
                    <span className="relative z-20 font-stat-sm text-white">{Math.ceil(Math.max(0, data.hp))} / {data.maxHp}</span>
                </div>
            </div>
        </section>
    );
}
