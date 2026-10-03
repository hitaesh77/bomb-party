export class GameAudio {
    private context: AudioContext | null = null;
    enabled = true;
    unlock() { if (!this.enabled)
        return; try {
        this.context ??= new AudioContext();
        void this.context.resume().catch(() => { });
    }
    catch { } }
    play(kind: 'pass' | 'boom') {
        const ctx = this.context;
        if (!this.enabled || !ctx || ctx.state !== 'running')
            return;
        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        const now = ctx.currentTime;
        if (kind === 'pass') {
            const oscillator = ctx.createOscillator();
            oscillator.frequency.setValueAtTime(480, now);
            oscillator.frequency.exponentialRampToValueAtTime(780, now + .08);
            gain.gain.setValueAtTime(.12, now);
            gain.gain.exponentialRampToValueAtTime(.001, now + .12);
            oscillator.connect(gain);
            oscillator.start();
            oscillator.stop(now + .13);
            oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
        }
        else {
            const buffer = ctx.createBuffer(1, ctx.sampleRate * .7, ctx.sampleRate);
            const channel = buffer.getChannelData(0);
            for (let i = 0; i < channel.length; i++)
                channel[i] = Math.random() * 2 - 1;
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1500, now);
            filter.frequency.exponentialRampToValueAtTime(70, now + .65);
            gain.gain.setValueAtTime(.5, now);
            gain.gain.exponentialRampToValueAtTime(.001, now + .7);
            source.connect(filter);
            filter.connect(gain);
            source.start();
            source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
        }
    }
    close() { void this.context?.close().catch(() => { }); this.context = null; }
}
