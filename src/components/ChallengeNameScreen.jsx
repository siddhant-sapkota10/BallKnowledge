import { useState } from 'react'

export default function ChallengeNameScreen({ score, onSubmit }) {
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || busy) return
    setBusy(true)
    await onSubmit(trimmed)
    setBusy(false)
  }

  return (
    <div className="screen name-screen">
      <p className="name-screen-score">
        You scored <strong>{score}/10</strong>
      </p>
      <h2 className="name-screen-title">Enter your name to challenge a mate</h2>
      <form onSubmit={handleSubmit} className="name-form">
        <input
          className="name-input"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={30}
          autoFocus
          disabled={busy}
        />
        <button className="btn-primary" type="submit" disabled={!name.trim() || busy}>
          {busy ? 'Creating…' : 'Create Challenge'}
        </button>
      </form>
    </div>
  )
}
