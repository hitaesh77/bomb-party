"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Bomb from './Bomb';
import { type Mode, type Prompt, prompts } from '@/data/prompts';
import { duration, PromptDeck } from '@/lib/game';
import { GameAudio } from '@/lib/audio';

type Phase = 'menu' | 'playing' | 'exploded';
function subscribePreferences(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('party-preferences', callback);
  return () => { window.removeEventListener('storage', callback); window.removeEventListener('party-preferences', callback); };
}
function readPreference(key: string) { try { return localStorage.getItem(key); } catch { return null; } }
function savePreference(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch {}
  window.dispatchEvent(new Event('party-preferences'));
}

export default function PartyGame() {
  const [phase, setPhase] = useState<Phase>('menu');
  const mode: Mode = useSyncExternalStore(subscribePreferences, () => readPreference('bomb-party-mode') === 'adult' ? 'adult' : 'normal', () => 'normal');
  const muted = useSyncExternalStore(subscribePreferences, () => readPreference('bomb-party-muted') === 'true', () => false);
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [round, setRound] = useState(0);
  const [tense, setTense] = useState(false);
  const phaseRef = useRef<Phase>('menu');
  const deck = useRef(new PromptDeck());
  const audio = useRef<GameAudio | null>(null);
  const deadline = useRef(0);
  const generation = useRef(0);
  const lastSkip = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearTimers = useCallback(() => {
    generation.current++;
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => {
    audio.current = new GameAudio();
    audio.current.enabled = readPreference('bomb-party-muted') !== 'true';
    return () => { clearTimers(); audio.current?.close(); };
  }, [clearTimers]);
  useEffect(() => { if (audio.current) audio.current.enabled = !muted; }, [muted]);

  const explode = useCallback(() => {
    if (phaseRef.current !== 'playing') return;
    clearTimers();
    phaseRef.current = 'exploded';
    setPhase('exploded');
    setTense(false);
    audio.current?.play('boom');
  }, [clearTimers]);

  const beginRound = useCallback(() => {
    clearTimers();
    audio.current?.unlock();
    setPrompt(deck.current.next(mode));
    setRound(r => r + 1);
    setTense(false);
    phaseRef.current = 'playing';
    setPhase('playing');
    const time = duration();
    deadline.current = Date.now() + time;
    const id = generation.current;
    timers.current.push(setTimeout(() => { if (id === generation.current) explode(); }, time));
    // Tension uses elapsed time, never a percentage of the secret deadline.
    timers.current.push(setTimeout(() => { if (id === generation.current) setTense(true); }, 15000));
  }, [clearTimers, explode, mode]);

  const start = useCallback(() => {
    if (phaseRef.current === 'playing') return;
    lastSkip.current = 0;
    beginRound();
  }, [beginRound]);

  const skip = useCallback(() => {
    if (phaseRef.current !== 'playing') return;
    if (Date.now() >= deadline.current) { explode(); return; }
    if (Date.now() - lastSkip.current < 600) return;
    lastSkip.current = Date.now();
    // Kill this round completely before drawing a fresh prompt and timer.
    beginRound();
  }, [beginRound, explode]);

  const home = useCallback(() => {
    clearTimers();
    phaseRef.current = 'menu';
    setPhase('menu');
    setRound(0);
    setTense(false);
  }, [clearTimers]);

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'Escape') { event.preventDefault(); home(); }
      if (event.key.toLowerCase() === 's' && phaseRef.current === 'playing') { event.preventDefault(); skip(); }
      if (event.key.toLowerCase() === 'n' && phaseRef.current === 'exploded') { event.preventDefault(); start(); }
    };
    const wake = () => { if (phaseRef.current === 'playing' && Date.now() >= deadline.current) explode(); };
    window.addEventListener('keydown', keydown);
    window.addEventListener('focus', wake);
    document.addEventListener('visibilitychange', wake);
    return () => {
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('focus', wake);
      document.removeEventListener('visibilitychange', wake);
    };
  }, [home, skip, start, explode]);

  function toggleSound() {
    const next = !muted;
    if (audio.current) { audio.current.enabled = !next; if (!next) audio.current.unlock(); }
    savePreference('bomb-party-muted', String(next));
  }

  return <main className={`shell ${phase === 'exploded' ? 'exploded' : ''} ${mode === 'adult' ? 'after-hours' : ''}`}>
    <header className="header">
      <button className="wordmark" onClick={home} aria-label="Bomb Party home"><span className="brand-logo" aria-hidden="true"><Image src="/logo.png" alt="" width={56} height={56} /></span> BOMB PARTY</button>
      <button className="sound-button" onClick={toggleSound} aria-label={muted ? 'Unmute sound' : 'Mute sound'} aria-pressed={muted}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/>{muted ? <path d="m16 9 6 6m0-6-6 6"/> : <><path d="M15 8a6 6 0 0 1 0 8"/><path d="M18 5a10 10 0 0 1 0 14"/></>}</svg>
      </button>
    </header>
    {phase === 'menu' ? <section className="menu-content">
      <div className="menu-heading"><h1>THINK FAST.<br/><span>PASS FASTER.</span></h1></div>
      <div className="hero-art"><Bomb/><span className="danger-sticker">NO TIMER.<br/>NO MERCY.</span><span className="hero-star" aria-hidden="true">✦</span></div>
      <p className="intro-copy">Say a new answer. Pass the phone.<br/>Holding it when it blows? You lose.</p>
      <div className="mode-area"><div className="mode-toggle" role="group" aria-label="Game mode">
        <button aria-pressed={mode === 'normal'} className={mode === 'normal' ? 'selected' : ''} onClick={() => savePreference('bomb-party-mode', 'normal')}>Normal</button>
        <button aria-pressed={mode === 'adult'} className={mode === 'adult' ? 'selected' : ''} onClick={() => savePreference('bomb-party-mode', 'adult')}>21+</button>
      </div></div>
      <button className="action" onClick={start}>START GAME <span aria-hidden="true">↗</span></button>
    </section> : <section className={`game-content ${tense ? 'tense' : ''}`}>
      <div className="game-top"><button className="back-button" onClick={home}>← HOME</button><span className="round-label">ROUND {String(round).padStart(2, '0')} <span> / {mode === 'normal' ? 'NORMAL' : '21+'}</span></span></div>
      <div className="game-layout" key={round}>
        <div className="prompt-area"><span className="eyebrow">{phase === 'exploded' ? 'CAUGHT YOU.' : prompt?.category.toUpperCase()}</span>
          <h1 className="prompt" aria-live="assertive">{phase === 'exploded' ? <>BOOM<span>!</span></> : <>{prompt?.text}<span>.</span></>}</h1>
          <p className="round-copy">{phase === 'exploded' ? 'Holding the phone? This one is on you.' : 'Answer out loud. No repeats.'}</p>
        </div>
        <div className="game-bomb"><Bomb lit={phase === 'playing'} exploded={phase === 'exploded'}/></div>
        <div className="turn-label" role="status">{phase === 'exploded' ? 'TAKE THE L. RUN IT BACK.' : 'ANSWER → PASS THE PHONE'}</div>
      </div>
      <div className="round-controls">{phase === 'exploded' ? <button className="action" onClick={start}>NEXT ROUND <span aria-hidden="true">↻</span></button> : <><p className="hands-note">No tapping needed. Just keep passing.</p><button className="skip-button" onClick={skip}><span aria-hidden="true">↻</span> SKIP QUESTION</button><p className="skip-note">Kills this round. New prompt, fresh fuse.</p></>}</div>
    </section>}
    <div className="footer-space" aria-hidden="true" />
  </main>;
}
