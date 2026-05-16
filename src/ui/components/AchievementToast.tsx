import { useState, useEffect } from 'react';
import { gameEvents } from '../../application/EventEmitter';

export default function AchievementToast() {
    const [achievements, setAchievements] = useState<any[]>([]);

    useEffect(() => {
        const handler = (ach: any) => {
            setAchievements(prev => [...prev, ach]);
            setTimeout(() => {
                setAchievements(prev => prev.filter(a => a.id !== ach.id));
            }, 5000);
        };
        gameEvents.on('ACHIEVEMENT_UNLOCKED', handler);
        return () => { gameEvents.off('ACHIEVEMENT_UNLOCKED', handler); };
    }, []);

    if (achievements.length === 0) return null;

    return (
        <div className="fixed top-24 right-6 z-[100] flex flex-col gap-4 pointer-events-none-override">
            {achievements.map(a => (
                <div key={a.id} className="metal-frame border-2 border-primary p-4 animate-[slideInRight_0.3s_ease-out] bg-[#1e1e1e] flex items-center gap-4 w-80 shadow-[0_0_15px_rgba(255,215,0,0.3)] transition-all">
                    <div className="text-4xl">{a.icon}</div>
                    <div className="flex-1">
                        <h4 className="text-primary font-headline-md text-[10px] uppercase tracking-widest leading-none mb-1">Conquista Desbloqueada</h4>
                        <p className="font-bold text-white text-base leading-tight drop-shadow-md">{a.name}</p>
                        <p className="text-xs text-gray-400 mt-1 leading-tight">{a.desc}</p>
                    </div>
                </div>
            ))}
            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(120%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
