import { useState } from 'react'

// ── Verdict ────────────────────────────────────────────────────────────────

function getVerdict(match) {
  const { challenger_name, challenger_score, opponent_name, opponent_score } = match
  if (opponent_score > challenger_score) {
    return { winner: opponent_name, line: `${opponent_name} wins!` }
  }
  if (challenger_score > opponent_score) {
    return { winner: challenger_name, line: `${challenger_name} wins!` }
  }
  return { winner: null, line: "It's a draw!" }
}

function getGloat(match, verdict) {
  const cp = match.challenger_powerups ?? {}
  const op = match.opponent_powerups ?? {}
  const { winner } = verdict

  if (winner && op.c_steal_hit && verdict.winner === match.challenger_name) {
    return `${match.challenger_name} won it — and stole a point.`
  }
  if (winner && op.o_steal_hit && verdict.winner === match.opponent_name) {
    return `The steal swung it. ${match.opponent_name} takes it.`
  }
  if (cp.freeze != null && winner === match.challenger_name) {
    return `${match.challenger_name} froze the competition.`
  }
  if (!winner && (op.c_steal_hit || op.o_steal_hit)) {
    return 'Power-ups and all — still a draw!'
  }
  if (!winner) return 'Perfectly matched. Dare to rematch?'
  return `${winner} set the bar too high.`
}

// ── Sub-components ─────────────────────────────────────────────────────────

function RatingBadge({ delta, newRating }) {
  const sign = delta >= 0 ? '+' : ''
  const color = delta >= 0 ? 'var(--accent)' : 'var(--wrong)'
  return (
    <span className="rating-badge" style={{ color }}>
      {sign}{delta} → {newRating}
    </span>
  )
}

function PowerUpSummary({ match }) {
  const cp = match.challenger_powerups ?? {}
  const op = match.opponent_powerups ?? {}

  const lines = []

  // Challenger's freeze
  if (cp.freeze != null) {
    lines.push({
      key: 'cf',
      text: `${match.challenger_name} froze ${match.opponent_name} on Q${cp.freeze + 1}`,
      cls: 'neutral',
    })
  }

  // Challenger's steal
  if (cp.steal != null) {
    if (op.c_steal_hit) {
      lines.push({
        key: 'cs',
        text: `${match.challenger_name}'s steal on Q${cp.steal + 1} landed (+1)`,
        cls: 'hit',
      })
    } else {
      lines.push({
        key: 'cs',
        text: `${match.challenger_name}'s steal on Q${cp.steal + 1} missed`,
        cls: 'missed',
      })
    }
  }

  // Opponent's freeze (no live effect since challenger played first; record it faithfully)
  if (op.freeze != null) {
    lines.push({
      key: 'of',
      text: `${match.opponent_name} armed freeze on Q${op.freeze + 1}`,
      cls: 'neutral',
    })
  }

  // Opponent's steal
  if (op.steal != null) {
    if (op.o_steal_hit) {
      lines.push({
        key: 'os',
        text: `${match.opponent_name}'s steal on Q${op.steal + 1} landed (+1)`,
        cls: 'hit',
      })
    } else {
      lines.push({
        key: 'os',
        text: `${match.opponent_name}'s steal on Q${op.steal + 1} missed`,
        cls: 'missed',
      })
    }
  }

  if (lines.length === 0) return null

  return (
    <div className="powerup-summary">
      <p className="powerup-summary-title">Power-ups</p>
      {lines.map((l) => (
        <p key={l.key} className={`powerup-line ${l.cls}`}>{l.text}</p>
      ))}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export default function DuelResultScreen({ match, eloResult, onRematch }) {
  const [copied, setCopied] = useState(false)
  const verdict = getVerdict(match)
  const gloat = getGloat(match, verdict)
  const link = `${window.location.origin}/?match=${match.id}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this link:', link)
    }
  }

  return (
    <div className="screen duel-screen">
      <p className="duel-label">Head to Head</p>

      <div className="duel-scoreline">
        <div className="duel-player">
          <span className="duel-player-name">{match.opponent_name}</span>
          <span className="duel-player-score">{match.opponent_score}</span>
          {eloResult && (
            <RatingBadge
              delta={eloResult.opponent.delta}
              newRating={eloResult.opponent.newRating}
            />
          )}
        </div>
        <span className="duel-dash">–</span>
        <div className="duel-player right">
          {eloResult && (
            <RatingBadge
              delta={eloResult.challenger.delta}
              newRating={eloResult.challenger.newRating}
            />
          )}
          <span className="duel-player-score">{match.challenger_score}</span>
          <span className="duel-player-name">{match.challenger_name}</span>
        </div>
      </div>

      <p className="duel-verdict">{verdict.line}</p>
      <p className="duel-gloat">{gloat}</p>

      <PowerUpSummary match={match} />

      <div className="duel-actions">
        <button className="btn-primary" onClick={onRematch}>Rematch</button>
        <button className="btn-secondary" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>
    </div>
  )
}
