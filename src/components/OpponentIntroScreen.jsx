import { useState } from 'react'

export default function OpponentIntroScreen({ match, knownName, onPlay }) {
  const [name, setName] = useState('')

  if (knownName) {
    return (
      <div className="screen name-screen">
        <p className="challenge-badge">Challenge</p>
        <h2 className="challenge-title">
          {match.challenger_name} scored {match.challenger_score}/10
        </h2>
        <p className="challenge-sub">on Premier League. Can you beat it?</p>
        <div className="name-form">
          <p className="known-name">Playing as <strong>{knownName}</strong></p>
          <button className="btn-primary" onClick={() => onPlay(knownName)}>
            Play
          </button>
        </div>
      </div>
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed) onPlay(trimmed)
  }

  return (
    <div className="screen name-screen">
      <p className="challenge-badge">Challenge</p>
      <h2 className="challenge-title">
        {match.challenger_name} scored {match.challenger_score}/10
      </h2>
      <p className="challenge-sub">on Premier League. Can you beat it?</p>
      <form onSubmit={handleSubmit} className="name-form">
        <input
          className="name-input"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={30}
          autoFocus
        />
        <button className="btn-primary" type="submit" disabled={!name.trim()}>
          Play
        </button>
      </form>
    </div>
  )
}
