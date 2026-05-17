import { GameState } from '../../domain/types';
import { AudioManager } from '../../application/AudioManager';

export default function MainMenu({ onChangeState }: { onChangeState: (s: GameState) => void }) {
    const handleSelect = (s: GameState) => {
        AudioManager.play('ui', 'select');
        onChangeState(s);
    };

    return (
        <section className="w-full h-full flex flex-col items-center justify-center gap-8 pointer-events-auto-override transition-opacity duration-300">
            <h1 className="font-headline-xl text-[80px] text-primary tracking-widest uppercase embossed-text mb-2 text-center leading-none">SourLate</h1>
            <p className="font-headline-md text-secondary mb-8">Sobreviva. Evolua. Construa sua Build.</p>
            <div className="flex flex-col gap-4 w-full max-w-sm">
                <button className="metal-button font-headline-lg px-8 py-4 uppercase tracking-widest" onClick={() => handleSelect('CHAR_SELECT')}>Jogar</button>
                <button className="metal-button font-headline-lg px-8 py-4 uppercase tracking-widest" onClick={() => handleSelect('SKILL_TREE')}>Cofre Ancestral (Skills)</button>
            </div>
        </section>
    );
}
