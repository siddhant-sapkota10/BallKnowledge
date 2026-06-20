import { supabase } from './supabase'

const K = 32
const DEFAULT_RATING = 1200

export async function upsertPlayer(playerId, displayName) {
  const { error } = await supabase
    .from('players')
    .upsert({ id: playerId, display_name: displayName }, { onConflict: 'id' })
  if (error) throw error
}

export async function fetchRating(playerId, league = 'epl') {
  const { data, error } = await supabase
    .from('ratings')
    .select('rating, games_played')
    .eq('player_id', playerId)
    .eq('league', league)
    .maybeSingle()
  if (error) throw error
  return data // null if no row yet
}

export async function applyElo({
  challengerId,
  challengerScore,
  opponentId,
  opponentScore,
  league = 'epl',
}) {
  const [cRow, oRow] = await Promise.all([
    fetchRating(challengerId, league),
    fetchRating(opponentId, league),
  ])

  const ra = cRow?.rating ?? DEFAULT_RATING
  const rb = oRow?.rating ?? DEFAULT_RATING

  // Quiz score comparison → Elo outcome (1 win, 0.5 draw, 0 loss)
  const sa =
    challengerScore > opponentScore ? 1 : challengerScore === opponentScore ? 0.5 : 0
  const sb = 1 - sa

  const ea = 1 / (1 + Math.pow(10, (rb - ra) / 400))
  const eb = 1 - ea

  const newRa = Math.round(ra + K * (sa - ea))
  const newRb = Math.round(rb + K * (sb - eb))

  await Promise.all([
    supabase.from('ratings').upsert(
      { player_id: challengerId, league, rating: newRa, games_played: (cRow?.games_played ?? 0) + 1 },
      { onConflict: 'player_id,league' },
    ),
    supabase.from('ratings').upsert(
      { player_id: opponentId, league, rating: newRb, games_played: (oRow?.games_played ?? 0) + 1 },
      { onConflict: 'player_id,league' },
    ),
  ])

  return {
    challenger: { delta: newRa - ra, newRating: newRa },
    opponent: { delta: newRb - rb, newRating: newRb },
  }
}
