import type { CSSProperties } from 'react';
export default function Bomb({ lit = false, exploded = false }: {
    lit?: boolean;
    exploded?: boolean;
}) {
    return <div className={`bomb-art ${lit ? 'lit' : ''} ${exploded ? 'detonated' : ''}`} aria-hidden="true"><svg viewBox="0 0 360 340" fill="none"><ellipse cx="179" cy="305" rx="100" ry="12" fill="currentColor" opacity=".12"/><g className="bomb-body"><path d="M210 102C210 66 253 83 251 47C249 29 267 24 279 30" stroke="#242822" strokeWidth="10" strokeLinecap="round"/><path d="M209 102C209 67 251 84 249 48" stroke="#F1B772" strokeWidth="4" strokeDasharray="5 7"/><path d="m185 100 29-6 8 33-30 7z" fill="#242822"/><circle cx="179" cy="205" r="94" fill="#242822"/><path d="M106 186c4-24 22-43 45-49M104 207v5" stroke="#FFF9ED" strokeWidth="9" strokeLinecap="round" opacity=".88"/><path d="M216 260c16-9 29-23 34-40" stroke="#3B4037" strokeWidth="12" strokeLinecap="round"/><g className="spark" stroke="#F4512C" strokeWidth="6" strokeLinecap="round"><path d="m281 14 2-11M296 24l13-5M296 40l10 8M270 18l-9-8M269 41l-9 7"/></g><path className="spark-core" d="m281 21 5 7 9 2-7 6-2 10-6-8-9-2 7-6z" fill="#F4512C"/></g></svg>{exploded && <div className="blast">{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ '--angle': `${i * 30}deg` } as CSSProperties}/>)}</div>}</div>;
}
