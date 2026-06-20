# Ball Knowledge

Premier League quiz app — Vite + React SPA, Supabase backend.

## Stack
- Vite + React (no router, no state library)
- Supabase (supabase-js client only — no SSR helpers)
- Mobile-first CSS in src/index.css (no design system, no component library)

## Architecture
- All game state lives in React useState
- localStorage is used ONLY for the anonymous player id and display name. All match, score, and rating state lives in Supabase.
- No real auth — players identified by a UUID generated client-side on first visit
- No server-side code — trust-based; Elo is computed on the opponent's client

## Supabase tables
- matches — one row per duel; challenger creates it, opponent completes it
- players — display name keyed by client-generated UUID
- ratings — Elo per (player_id, league); upserted by opponent's client on match completion
- live_matches — one row per live buzzer room; host creates, guest joins, Realtime drives gameplay

## HARD RULES
- Power-ups must hit the opponent and must be shown on the result card. Each player gets exactly 2 power-up uses per match: one freeze, one steal. No purchasing, no refills.
- Live buzzer mode is additive. Banked async duel remains the default and must keep working. Live mode does not use power-ups or affect Elo yet.

## Build slices completed
- Slice 1: solo quiz game (15 hardcoded EPL questions, 10 per game, 10 s timer)
- Slice 2: async duel flow (challenge link, opponent plays same questions, duel result card)
- Slice 3: anonymous identity, Elo ratings (K=32, starting 1200)
- Slice 4: power-ups — freeze (4 s timer) and steal (retroactive +1)
- Slice 5: live buzzer race — Supabase Realtime, room codes, host/guest lobby, idempotent advance
