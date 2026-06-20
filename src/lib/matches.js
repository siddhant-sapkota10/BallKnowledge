import { supabase } from './supabase'

export async function createMatch({
  challengerName,
  challengerScore,
  questionIds,
  challengerId,
  challengerPowerUps,
}) {
  const { data, error } = await supabase
    .from('matches')
    .insert({
      challenger_name: challengerName,
      challenger_score: challengerScore,
      question_ids: questionIds,
      challenger_id: challengerId,
      challenger_powerups: challengerPowerUps ?? null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function fetchMatch(matchId) {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .single()
  if (error) throw error
  return data
}

export async function completeMatch(matchId, {
  opponentName,
  opponentId,
  opponentScore,
  opponentPowerUps,
  newChallengerScore,
}) {
  const { data, error } = await supabase
    .from('matches')
    .update({
      opponent_name: opponentName,
      opponent_score: opponentScore,
      opponent_id: opponentId,
      opponent_powerups: opponentPowerUps ?? null,
      challenger_score: newChallengerScore,
      status: 'complete',
    })
    .eq('id', matchId)
    .select()
    .single()
  if (error) throw error
  return data
}
