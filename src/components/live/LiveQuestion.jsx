import { useState, useEffect } from 'react'
import { Radio } from 'lucide-react'
import { BKBrand } from '../ui'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Remounts per question via key={liveMatch.current_index} in App.jsx
export default function LiveQuestion({
  question,
  questionIndex,
  totalQuestions,
  liveMatch,
  isHost,
  playerId,
  onClaim,
  onWrong,
  onExpire,
  onAdvance,
}) {
  const [options] = useState(() => shuffle([question.correctAnswer, ...question.distractors]))
  const [submitted, setSubmitted] = useState(false)
  const [selected, setSelected] = useState(null)
  const [timeLeft, setTimeLeft] = useState(10)
  const [feedbackMsg, setFeedbackMsg] = useState(null)

  const myAnswered = isHost ? liveMatch.host_answered : liveMatch.guest_answered
  const isResolved =
    liveMatch.current_claim !== null ||
    (liveMatch.host_answered && liveMatch.guest_answered)
  const locked = submitted || myAnswered || isResolved
  const opponentName = isHost ? liveMatch.guest_name : liveMatch.host_name

  // Timer — pauses once locked or feedback is showing
  useEffect(() => {
    if (locked || feedbackMsg) return
    if (timeLeft <= 0) {
      // Host drives expiry to avoid both clients firing it
      if (isHost) onExpire(questionIndex)
      return
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timeLeft, locked, feedbackMsg, isHost]) // eslint-disable-line

  // Detect resolution → show feedback → advance after 1.5 s
  // Both clients fire advanceQuestion; the conditional WHERE in the DB ensures idempotency
  useEffect(() => {
    if (!isResolved || feedbackMsg) return
    const msg =
      liveMatch.current_claim === playerId
        ? 'You got it!'
        : liveMatch.current_claim
          ? `${opponentName} got it!`
          : 'Nobody got it'
    setFeedbackMsg(msg)
    const id = setTimeout(() => onAdvance(questionIndex), 1500)
    return () => clearTimeout(id)
  }, [isResolved]) // eslint-disable-line

  const handleSelect = (option) => {
    if (locked) return
    setSubmitted(true)
    setSelected(option)
    if (option === question.correctAnswer) {
      onClaim(questionIndex)
    } else {
      onWrong(questionIndex)
    }
  }

  const optionClass = (opt) => {
    if (feedbackMsg) {
      if (opt === question.correctAnswer) return 'option correct'
      if (opt === selected) return 'option wrong'
      return 'option dim'
    }
    if (locked) return 'option dim'
    return 'option'
  }

  const pct = locked ? 0 : (timeLeft / 10) * 100
  const urgent = !locked && timeLeft <= 3

  return (
    <div className="screen">
      <div className="question-topline">
        <BKBrand compact />
        <span className="bk-badge bk-badge-cyan"><Radio size={12} /> Live</span>
      </div>
      <div className="live-scorebar">
        <div className="live-score-cell">
          <span className="live-score-name">{liveMatch.host_name}</span>
          <span className="live-score-num">{liveMatch.host_score}</span>
        </div>
        <span className="live-score-sep">|</span>
        <div className="live-score-cell right">
          <span className="live-score-num">{liveMatch.guest_score}</span>
          <span className="live-score-name">{liveMatch.guest_name}</span>
        </div>
      </div>

      <div className="question-header">
        <span className="question-count">Q{questionIndex + 1} of {totalQuestions}</span>
        <span className={`timer-label${urgent ? ' urgent' : ''}`}>
          {locked ? '–' : `${timeLeft}s`}
        </span>
      </div>

      <div className="timer-bar">
        <div
          className={`timer-fill${urgent ? ' urgent' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="question-text">{question.prompt}</p>

      <div className="options">
        {options.map((opt) => (
          <button key={opt} className={optionClass(opt)} onClick={() => handleSelect(opt)}>
            {opt}
          </button>
        ))}
      </div>

      {feedbackMsg && (
        <div className={`live-feedback${
          liveMatch.current_claim === playerId
            ? ' buzz-win'
            : liveMatch.current_claim
              ? ' buzz-lose'
              : ' buzz-none'
        }`}>
          {feedbackMsg}
        </div>
      )}
    </div>
  )
}
