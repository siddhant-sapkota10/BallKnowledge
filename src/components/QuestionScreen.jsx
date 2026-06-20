import { useState, useEffect } from 'react'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const FROZEN_TIME = 4

export default function QuestionScreen({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onNext,
  powerUpsUsed,   // { freeze: bool, steal: bool }
  powerUps,       // { freeze: idx|null, steal: idx|null } — to show armed index on button
  onArmPowerUp,   // (type: 'freeze'|'steal') => void
  frozenBy,       // string|null — challenger's freeze applies to opponent
  stolenBy,       // string|null — shown in feedback when challenger's steal triggers
}) {
  const [options] = useState(() =>
    shuffle([question.correctAnswer, ...question.distractors])
  )
  const [selected, setSelected] = useState(null)
  const maxTime = frozenBy ? FROZEN_TIME : 10
  const [timeLeft, setTimeLeft] = useState(maxTime)

  const locked = selected !== null || timeLeft === 0

  // Countdown — steps down every second while unlocked
  useEffect(() => {
    if (locked) return
    if (timeLeft <= 0) return
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timeLeft, locked])

  // Timeout with no selection = wrong
  useEffect(() => {
    if (timeLeft === 0 && selected === null) {
      onAnswer(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft])

  // Auto-advance 1.2 s after locking
  useEffect(() => {
    if (!locked) return
    const id = setTimeout(onNext, 1200)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked])

  const handleSelect = (option) => {
    if (locked) return
    setSelected(option)
    onAnswer(option === question.correctAnswer)
  }

  const optionClass = (option) => {
    if (!locked) return 'option'
    if (option === question.correctAnswer) return 'option correct'
    if (option === selected) return 'option wrong'
    return 'option dim'
  }

  const pct = (timeLeft / maxTime) * 100
  const urgent = timeLeft <= 3

  const freezeLabel = powerUpsUsed?.freeze
    ? `Freeze (Q${(powerUps?.freeze ?? 0) + 1})`
    : 'Freeze'
  const stealLabel = powerUpsUsed?.steal
    ? `Steal (Q${(powerUps?.steal ?? 0) + 1})`
    : 'Steal'

  return (
    <div className="screen">
      {frozenBy && (
        <div className="frozen-banner">Frozen by {frozenBy}</div>
      )}

      <div className="question-header">
        <span className="question-count">
          Question {questionNumber} of {totalQuestions}
        </span>
        <span className={`timer-label${urgent ? ' urgent' : ''}`}>{timeLeft}s</span>
      </div>

      <div className="timer-bar">
        <div
          className={`timer-fill${urgent ? ' urgent' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="question-text">{question.prompt}</p>

      <div className="powerup-bar">
        <button
          className={`powerup-btn${powerUpsUsed?.freeze ? ' used' : ' available'}`}
          onClick={() => !powerUpsUsed?.freeze && onArmPowerUp?.('freeze')}
          disabled={!!powerUpsUsed?.freeze}
        >
          {freezeLabel}
        </button>
        <button
          className={`powerup-btn${powerUpsUsed?.steal ? ' used' : ' available'}`}
          onClick={() => !powerUpsUsed?.steal && onArmPowerUp?.('steal')}
          disabled={!!powerUpsUsed?.steal}
        >
          {stealLabel}
        </button>
      </div>

      <div className="options">
        {options.map(opt => (
          <button key={opt} className={optionClass(opt)} onClick={() => handleSelect(opt)}>
            {opt}
          </button>
        ))}
      </div>

      {stolenBy && locked && (
        <div className="stolen-banner">Stolen by {stolenBy} (+1 to them)</div>
      )}
    </div>
  )
}
