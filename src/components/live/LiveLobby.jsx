import { LogOut, Play, Users } from 'lucide-react'
import { BKBrand, BKButton } from '../ui'

export default function LiveLobby({ liveMatch, isHost, onStart, onLeave }) {
  const guestPresent = !!liveMatch.guest_id

  return (
    <div className="screen name-screen">
      <div className="live-lobby-top">
        <BKBrand compact />
        <button className="btn-text-muted" onClick={onLeave}><LogOut size={15} /> Leave</button>
      </div>

      <div className="room-code-wrap">
        <p className="room-code-label">Room code</p>
        <p className="room-code">{liveMatch.room_code}</p>
        <p className="room-code-hint">Share this with your opponent</p>
      </div>

      {!guestPresent ? (
        <p className="lobby-status"><Users size={20} className="mx-auto mb-3 text-bk-cyan" />Waiting for opponent to join…</p>
      ) : (
        <>
          <p className="lobby-status">
            <span className="lobby-joined-name">{liveMatch.guest_name}</span> has joined!
          </p>
          {isHost ? (
            <BKButton icon={Play} className="lobby-start-btn" onClick={onStart}>Both here. Start</BKButton>
          ) : (
            <p className="lobby-status-sub">Waiting for {liveMatch.host_name} to start…</p>
          )}
        </>
      )}
    </div>
  )
}
