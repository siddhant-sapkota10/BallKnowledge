import { supabase } from './supabase'

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ' // no I or O

export function generateRoomCode() {
  return Array.from({ length: 4 }, () =>
    CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  ).join('')
}

export async function createLiveMatch({ hostId, hostName, questionIds }) {
  const roomCode = generateRoomCode()
  const { data, error } = await supabase
    .from('live_matches')
    .insert({
      room_code: roomCode,
      question_ids: questionIds,
      host_id: hostId,
      host_name: hostName,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function joinLiveMatch({ roomCode, guestId, guestName }) {
  const { data: match, error: findErr } = await supabase
    .from('live_matches')
    .select('*')
    .eq('room_code', roomCode.toUpperCase())
    .eq('status', 'waiting')
    .is('guest_id', null)
    .maybeSingle()
  if (findErr || !match) throw new Error('Room not found or already started')

  const { data, error } = await supabase
    .from('live_matches')
    .update({ guest_id: guestId, guest_name: guestName, updated_at: new Date().toISOString() })
    .eq('id', match.id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function startLiveMatch(matchId) {
  const { data, error } = await supabase
    .from('live_matches')
    .update({ current_index: 0, status: 'active', updated_at: new Date().toISOString() })
    .eq('id', matchId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function claimQuestion({ matchId, playerId, isHost, currentIndex }) {
  // Conditional: only succeeds if no one has claimed this question yet
  const { data: claimed } = await supabase
    .from('live_matches')
    .update({ current_claim: playerId, updated_at: new Date().toISOString() })
    .eq('id', matchId)
    .eq('current_index', currentIndex)
    .is('current_claim', null)
    .select('host_score, guest_score')

  if (!claimed?.length) return // lost the race

  // Won the claim — increment score
  const scoreField = isHost ? 'host_score' : 'guest_score'
  const currentScore = claimed[0][scoreField]
  await supabase
    .from('live_matches')
    .update({ [scoreField]: currentScore + 1, updated_at: new Date().toISOString() })
    .eq('id', matchId)
}

export async function markAnswered({ matchId, isHost, currentIndex }) {
  const field = isHost ? 'host_answered' : 'guest_answered'
  await supabase
    .from('live_matches')
    .update({ [field]: true, updated_at: new Date().toISOString() })
    .eq('id', matchId)
    .eq('current_index', currentIndex)
}

// Called by host when 10s expires with no claim and neither player answered
export async function expireQuestion({ matchId, currentIndex }) {
  await supabase
    .from('live_matches')
    .update({
      host_answered: true,
      guest_answered: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', matchId)
    .eq('current_index', currentIndex)
}

// Conditional advance: WHERE current_index = fromIndex prevents double-advance
export async function advanceQuestion({ matchId, fromIndex }) {
  const isLast = fromIndex >= 9
  await supabase
    .from('live_matches')
    .update({
      current_index: fromIndex + 1,
      current_claim: null,
      host_answered: false,
      guest_answered: false,
      status: isLast ? 'complete' : 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', matchId)
    .eq('current_index', fromIndex)
}

export async function rematchLiveMatch({ matchId, questionIds }) {
  const { data, error } = await supabase
    .from('live_matches')
    .update({
      question_ids: questionIds,
      host_score: 0,
      guest_score: 0,
      current_index: -1,
      current_claim: null,
      host_answered: false,
      guest_answered: false,
      status: 'waiting',
      updated_at: new Date().toISOString(),
    })
    .eq('id', matchId)
    .select()
    .single()
  if (error) throw error
  return data
}

export function subscribeToLiveMatch(matchId, onUpdate) {
  return supabase
    .channel(`live-match-${matchId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'live_matches',
        filter: `id=eq.${matchId}`,
      },
      (payload) => onUpdate(payload.new),
    )
    .subscribe()
}

export function unsubscribeFromLiveMatch(channel) {
  if (channel) supabase.removeChannel(channel)
}
