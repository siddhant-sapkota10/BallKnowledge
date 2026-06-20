function getVerdict(match) {
  const { host_name, host_score, guest_name, guest_score } = match
  if (host_score > guest_score) {
    return {
      line: `${host_name} wins!`,
      gloat: `${host_name} had the faster finger.`,
    }
  }
  if (guest_score > host_score) {
    return {
      line: `${guest_name} wins!`,
      gloat: `${guest_name} buzzed the right ones.`,
    }
  }
  return { line: "It's a draw!", gloat: 'Neck and neck. Rematch?' }
}

export default function LiveResult({ match, isHost, onRematch, onLeave }) {
  const verdict = getVerdict(match)

  return (
    <div className="screen duel-screen">
      <p className="duel-label">Live Result</p>

      <div className="duel-scoreline">
        <div className="duel-player">
          <span className="duel-player-name">{match.host_name}</span>
          <span className="duel-player-score">{match.host_score}</span>
        </div>
        <span className="duel-dash">–</span>
        <div className="duel-player right">
          <span className="duel-player-score">{match.guest_score}</span>
          <span className="duel-player-name">{match.guest_name}</span>
        </div>
      </div>

      <p className="duel-verdict">{verdict.line}</p>
      <p className="duel-gloat">{verdict.gloat}</p>

      <div className="duel-actions">
        {isHost ? (
          <button className="btn-primary" onClick={onRematch}>Rematch</button>
        ) : (
          <p className="lobby-status-sub">Waiting for host to call rematch…</p>
        )}
        <button className="btn-secondary" onClick={onLeave}>Back to Menu</button>
      </div>
    </div>
  )
}
