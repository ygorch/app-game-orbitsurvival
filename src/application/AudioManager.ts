export const AudioManager = {
    play: (category: string, id: string) => {
        try {
            const a = new Audio(`assets/sounds/${category}/${id}.mp3`);
            a.volume = 0.5;
            a.play().catch(() => {}); // ignore errors if file doesn't exist yet
        } catch (e) {
            // silent fail
        }
    }
};
