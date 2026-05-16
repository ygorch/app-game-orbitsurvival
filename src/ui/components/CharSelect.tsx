import { useState } from 'react';
import { GameState } from '../../domain/types';

export default function CharSelect({ onChangeState, onStart }: { onChangeState: (s: GameState) => void, onStart: (h: string, w: string) => void }) {
    const [hero, setHero] = useState<string | null>(null);
    const [weapon, setWeapon] = useState<string | null>(null);

    return (
        <section className="w-full h-full flex flex-col items-center justify-start gap-6 pointer-events-auto-override overflow-y-auto pb-20 pt-6">
            <h2 className="font-headline-xl text-4xl text-primary tracking-widest uppercase embossed-text">Preparação</h2>
            
            <div className="flex flex-col md:flex-row gap-6 w-full justify-center px-4">
                <div onClick={() => setHero('fugitivo')} className={`metal-frame border-4 p-1 w-full max-w-[280px] cursor-pointer transition-transform hover:scale-105 ${hero === 'fugitivo' ? 'glow-border border-primary' : 'border-surface-variant opacity-80'}`}>
                    <div className="leather-inset p-4 h-full flex flex-col items-center gap-2"><div className="w-full aspect-square bg-surface-highest border border-outline flex items-center justify-center text-[70px]">🥷</div><h3 className="font-headline-lg text-on-surface border-b border-outline w-full text-center pb-1">The Fugitive</h3><p className="text-sm text-secondary text-center">Ágil e Furtivo. Inicia com bônus enormes de Destreza e Agilidade.</p></div>
                </div>
                <div onClick={() => setHero('escudeiro')} className={`metal-frame border-4 p-1 w-full max-w-[280px] cursor-pointer transition-transform hover:scale-105 ${hero === 'escudeiro' ? 'glow-border border-primary' : 'border-surface-variant opacity-80'}`}>
                    <div className="leather-inset p-4 h-full flex flex-col items-center gap-2"><div className="w-full aspect-square bg-surface-highest border border-outline flex items-center justify-center text-[70px]">🛡️</div><h3 className="font-headline-lg text-on-surface border-b border-outline w-full text-center pb-1">The Squire</h3><p className="text-sm text-secondary text-center">Forte como um touro. Inicia com Força bruta, muito HP e armadura natural.</p></div>
                </div>
            </div>

            <h3 className="font-headline-lg text-secondary mt-2">Relíquia Inicial</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full justify-center px-4 max-w-4xl">
                {[
                    { id: 'axe', icon: '🪓', name: 'Machado', sub: 'Giro 360º (Auto)' },
                    { id: 'wand', icon: '🪄', name: 'Varinha', sub: 'Teleguiada (Auto)' },
                    { id: 'aura', icon: '✨', name: 'Aura', sub: 'Área (Auto)' },
                    { id: 'sword', icon: '⚔️', name: 'Espada', sub: 'Corte Frontal (Clique)' },
                    { id: 'bow', icon: '🏹', name: 'Arco', sub: 'Tiro Longo (Clique)' },
                    { id: 'pistol', icon: '🔫', name: 'Pistola', sub: 'Rajada Veloz (Clique)' },
                    { id: 'knife', icon: '🔪', name: 'Facas', sub: 'Curto & Rápido (Clique)' }
                ].map(w => (
                    <div key={w.id} onClick={() => setWeapon(w.id)} className={`metal-frame border-2 p-2 cursor-pointer hover:opacity-100 ${weapon === w.id ? 'glow-border border-primary' : 'border-surface-variant opacity-80'}`}>
                        <div className="leather-inset p-2 flex flex-col items-center text-center h-full"><span className="text-4xl">{w.icon}</span><h4 className="text-primary mt-1 font-bold text-sm">{w.name}</h4><span className="text-xs text-gray-400">{w.sub}</span></div>
                    </div>
                ))}
            </div>

            <div className="flex gap-4 mt-2 w-full max-w-md">
                <button className="metal-button flex-1 font-headline-md py-3 uppercase" onClick={() => onChangeState('TITLE')}>Voltar</button>
                {hero && weapon && <button className="metal-button flex-1 font-headline-md py-3 uppercase" onClick={() => onStart(hero, weapon)}>Explorar Ruínas</button>}
            </div>
        </section>
    );
}
