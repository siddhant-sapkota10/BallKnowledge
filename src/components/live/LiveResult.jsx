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
      <BKBrand compact />
      <div className="duel-card" style={{ marginTop: '24px' }}>
      <p className="duel-label"><Radio size={12} /> Live result</p>
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
      </div>
      <div className="duel-actions">
        {isHost ? (
          <BKButton icon={RotateCcw} onClick={onRematch}>Rematch</BKButton>
        ) : (
          <p className="lobby-status-sub">Waiting for host to call rematch…</p>
        )}
        <BKButton variant="secondary" icon={ArrowLeft} onClick={onLeave}>Back to menu</BKButton>
      </div>
    </div>
  )
}
import { ArrowLeft, Radio, RotateCcw } from 'lucide-react'
import { BKBrand, BKButton } from '../ui'
