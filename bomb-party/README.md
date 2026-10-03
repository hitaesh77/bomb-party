# Bomb Party

An in-person, frontend-only party game built with Next.js, React, TypeScript, and Tailwind CSS. No accounts, API keys, database, or runtime services required.

## Run locally

From this directory:

```sh
npm install
npm run dev
```

Open http://localhost:3000. For production, run `npm run build` and `npm start`.

The interface is designed as a portrait phone game, including safe-area spacing for notches and short-screen adjustments. On desktop, it stays in a centered phone-width frame.

## Play

Choose Normal or 21+ After Hours, then start. Give a fresh answer out loud and pass the phone by hand. There is no pass button. Whoever holds it when the bomb explodes loses. Start the next round immediately.

- S: skip a question during play (cancels the current round and starts a new prompt with a fresh timer)
- N: next round after an explosion
- Escape: return home

Mode and mute preferences persist locally. Normal contains 180 prompts; After Hours draws exclusively from 240 adult prompts. The two decks have zero overlap, for 420 total. Adult topics include booty calls, dirty-talk disasters, horny texts, bedroom mishaps, hookups, and messy college nights. A shuffled deck avoids repeats until the complete pool is exhausted. Hidden timers range from 20–75 seconds with a center-weighted distribution. Passing by hand requires no screen interaction and never resets the timer. The Skip Question kill switch cancels the current round, consumes the prompt, and lights a fresh randomized fuse. Backgrounding the page does not pause a round; it checks the deadline when resumed.

Audio is synthesized after user interaction; mute is available at any time. Reduced-motion preferences disable animations. All fonts and artwork are local/system resources.

## Verification

```sh
npm run build
npm run lint
node verify.cjs
```

The verification script checks distinct prompts, mode pools, deck non-repetition, shuffle integrity, timer distribution, skip restarts, stale timer protection, repeated rounds, cleanup, and mode persistence. Lifecycle checks use a deterministic hook/timer harness; they do not replace real-device browser testing.

## Vercel

Import the repository and select **bomb-party** as the Root Directory (the app lives in this nested folder). Use the Next.js preset with the default build command. No environment variables are needed.
