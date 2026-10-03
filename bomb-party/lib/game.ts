import { prompts, type Mode, type Prompt } from '@/data/prompts';
export function duration(random = Math.random) { return 20000 + (random() + random() + random()) / 3 * 55000; }
export function shuffle<T>(items: readonly T[], random = Math.random): T[] {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}
export class PromptDeck {
    private queue: Prompt[] = [];
    private mode: Mode | null = null;
    private previous = '';
    next(mode: Mode): Prompt {
        if (mode !== this.mode || !this.queue.length) {
            this.mode = mode;
            this.queue = shuffle(prompts.filter(p => p.adult === (mode === 'adult')));
            if (this.queue.at(-1)?.text === this.previous)
                this.queue.reverse();
        }
        const prompt = this.queue.pop()!;
        this.previous = prompt.text;
        return prompt;
    }
}
