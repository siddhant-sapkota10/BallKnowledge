export default function LiveLobby({ liveMatch, isHost, onStart, onLeave }) {
  const guestPresent = !!liveMatch.guest_id

  return (
    <div className="screen name-screen">
      <div className="live-lobby-top">
        <p className="challenge-badge" style={{ marginBottom: 0 }}>Live Game</p>
        <button className="btn-text-muted" onClick={onLeave}>Leave</button>
      </div>

      <div className="room-code-wrap">
        <p className="room-code-label">Room Code</p>
        <p className="room-code">{liveMatch.room_code}</p>
        <p className="room-code-hint">Share this with your opponent</p>
      </div>

      {!guestPresent ? (
        <p className="lobby-status">Waiting for opponent to join…</p>
      ) : (
        <>
          <p className="lobby-status">
            <span className="lobby-joined-name">{liveMatch.guest_name}</span> has joined!
          </p>
          {isHost ? (
            <button className="btn-primary lobby-start-btn" onClick={onStart}>
              Both here. Start
            </button>
          ) : (
            <p className="lobby-status-sub">Waiting for {liveMatch.host_name} to start…</p>
          )}
        </>
      )}
    </div>
  )
}
