const PLAYER_ID_KEY = 'bk_player_id'
const DISPLAY_NAME_KEY = 'bk_display_name'

export function getOrCreatePlayerId() {
  let id = localStorage.getItem(PLAYER_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(PLAYER_ID_KEY, id)
  }
  return id
}

export function getStoredDisplayName() {
  return localStorage.getItem(DISPLAY_NAME_KEY) || null
}

export function saveDisplayName(name) {
  localStorage.setItem(DISPLAY_NAME_KEY, name)
}
