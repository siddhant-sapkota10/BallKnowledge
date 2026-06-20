# BALL KNOWLEDGE — project context

WHAT IT IS
A web-based football duel. Answer multiple-choice football questions,
your score banks, challenge a mate via a link, they answer the same
questions, winner gloats in the group chat. The argument is the product.

POSITIONING
"Settle who in the group chat actually knows ball, then rub it in their face."
Every feature is tested against this. If it doesn't make settling sharper
or the gloat better, it's not in v1.

HARD RULES (do not violate)
- Web app, mobile-first, no install. A challenge is a shareable link.
- Async-first. Both players answer the SAME fixed question set. Nobody
  has to be online at once. Live duels are v1.5, not now.
- No stranger matchmaking. The unit is "you vs a specific friend."
  Never build a global random queue.
- Multiple choice only in v1 (4 options).
- Backend holds match state and ratings. The link carries only a match
  id, never the questions or answers (anti-cheat).
- Football API key is backend-only. Pull and cache into our own DB on a
  schedule; never hit the API live per request.
- No monetization in v1. The KPI is how many new players each player
  drags in, not revenue.

STACK
Vite + React frontend, Supabase (Postgres + auth + realtime) backend.

DATA MODEL
questions(id, league, difficulty, prompt, correct_answer, distractors,
          source_ref, created_at)
players(id, display_name, created_at)
ratings(player_id, league, rating, games_played)  // Elo, starts 1200
matches(id, challenger_id, opponent_id, league, question_ids,
        challenger_score, opponent_score, powerups_used, status, created_at)

BUILD ORDER
1. Solo core loop (fun-first, seeded questions)
2. Challenge link + async duel + result card  <- the whole hook
3. Identity + per-league Elo
4. Power-ups (freeze, steal)
5. API question-bank loader  <- last, it's infra