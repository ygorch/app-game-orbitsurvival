import { useState } from 'react';
import { GameState } from '../../domain/types';
import { SKILL_DEFS } from '../../domain/constants/GameData';
import { saveService } from '../../application/SaveService';

export default function SkillTree({ onChangeState }: { onChangeState: (s: GameState) => void }) {
    const [selected, setSelected] = useState<string | null>(null);
    const gold = saveService.data.gold;

    const buy = () => {
        if (!selected) return;
        const s = SKILL_DEFS[selected];
        const cur = (saveService.data.skills as any)[selected];
        const cost = s.cost * (cur + 1);
        if (cur < s.max && gold >= cost) {
            saveService.data.gold -= cost;
            (saveService.data.skills as any)[selected]++;
            saveService.save();
            setSelected(selected); // force re-render
        }
    };

    const renderPreview = () => {
        if (!selected) {
            return (
                <div className="metal-frame p-6 flex-1 flex flex-col gap-4">
                    <div className="flex items-center gap-4 border-b border-[#333] pb-4">
                        <div className="text-5xl">❓</div>
                        <div><h3 className="text-xl text-primary font-bold">Selecione uma Arte</h3><p className="text-secondary text-sm">Nível --/--</p></div>
                    </div>
                    <p className="text-sm text-gray-300 min-h-[80px] leading-relaxed">Clique em uma habilidade ao lado para ler os pergaminhos antigos e entender seu poder.</p>
                    <div className="bg-[#111] p-4 border border-[#333] mb-2 flex-1"><h4 className="text-primary-fixed-dim text-xs mb-2 uppercase tracking-widest">Efeito da Melhoria</h4><div className="text-sm text-on-surface-variant">Nenhum atributo selecionado.</div></div>
                    <button className="metal-button py-4 font-bold uppercase w-full mt-auto tracking-widest" disabled>Confirmar (0 💰)</button>
                </div>
            );
        }

        const s = SKILL_DEFS[selected];
        const cur = (saveService.data.skills as any)[selected];
        const cost = s.cost * (cur + 1);
        const isMax = cur >= s.max;

        return (
            <div className="metal-frame p-6 flex-1 flex flex-col gap-4">
                <div className="flex items-center gap-4 border-b border-[#333] pb-4">
                    <div className="text-5xl">{s.icon}</div>
                    <div><h3 className="text-xl text-primary font-bold">{s.name}</h3><p className="text-secondary text-sm">Nível Atual: {cur} de {s.max}</p></div>
                </div>
                <p className="text-sm text-gray-300 min-h-[80px] leading-relaxed">{s.desc}</p>
                <div className="bg-[#111] p-4 border border-[#333] mb-2 flex-1">
                    <h4 className="text-primary-fixed-dim text-xs mb-2 uppercase tracking-widest">Efeito da Melhoria</h4>
                    {isMax ? (
                        <div className="text-sm text-secondary">Poder Extremo Alcançado. ({s.attr})</div>
                    ) : (
                        <div className="text-sm">Evolução ao comprar: <span className="text-error font-bold">{cur}</span> ➡️ <span className="text-green-500 font-bold">{cur+1}</span> <br/> Bônus Passivo: <span className="text-primary">{s.attr}</span> por nível.</div>
                    )}
                </div>
                <button className="metal-button py-4 font-bold uppercase w-full mt-auto tracking-widest" disabled={isMax || gold < cost} onClick={buy}>
                    {isMax ? 'MÁXIMO ALCANÇADO' : (gold < cost ? `Ouro Insuficiente (${cost} 💰)` : `Aprender Habilidade (${cost} 💰)`)}
                </button>
            </div>
        );
    };

    return (
        <section className="w-full h-full flex flex-col items-center justify-start gap-4 pointer-events-auto-override overflow-y-auto pb-20 pt-6">
            <h2 className="font-headline-xl text-4xl text-primary uppercase embossed-text">Cofre de Metaprogresso</h2>
            <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl px-4 mt-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-[2] overflow-y-auto max-h-[60vh] pr-2">
                    {Object.keys(SKILL_DEFS).map(key => {
                        const s = SKILL_DEFS[key];
                        const cur = (saveService.data.skills as any)[key];
                        return (
                            <div key={key} onClick={() => setSelected(key)} className={`leather-inset p-3 flex flex-col items-center text-center cursor-pointer border-2 transition-colors hover:border-primary ${selected === key ? 'border-primary bg-[#4a322d]' : 'border-transparent'}`}>
                                <div className="text-4xl mb-2">{s.icon}</div>
                                <h3 className="text-primary font-bold leading-tight text-sm">{s.name} <br/><span className="text-xs text-gray-400">(Nv {cur}/{s.max})</span></h3>
                            </div>
                        )
                    })}
                </div>
                {renderPreview()}
            </div>
            <button className="metal-button mt-4 font-headline-md px-12 py-3 uppercase tracking-widest" onClick={() => onChangeState('TITLE')}>Voltar ao Menu</button>
        </section>
    );
}
