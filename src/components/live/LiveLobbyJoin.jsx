import { useState } from 'react'
import { ArrowLeft, LogIn } from 'lucide-react'
import { BKBrand, BKButton, BKCard } from '../ui'

export default function LiveLobbyJoin({ onJoin, onBack }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState(null)
  const [joining, setJoining] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (trimmed.length !== 4 || joining) return
    setJoining(true)
    setError(null)
    try {
      await onJoin(trimmed)
    } catch {
      setError('Room not found or already started.')
      setJoining(false)
    }
  }

  return (
    <div className="screen name-screen">
      <BKBrand compact />
      <BKCard className="mt-6">
      <p className="challenge-badge">Live mode</p>
      <h2 className="name-screen-title">Enter the room code.</h2>
      <form onSubmit={handleSubmit} className="name-form">
        <input
          className="name-input room-code-input"
          type="text"
          placeholder="ABCD"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={4}
          autoFocus
          disabled={joining}
        />
        {error && <p className="form-error">{error}</p>}
        <BKButton icon={LogIn} type="submit" disabled={code.trim().length !== 4 || joining}>
          {joining ? 'Joining…' : 'Join Game'}
        </BKButton>
        <BKButton variant="secondary" icon={ArrowLeft} type="button" onClick={onBack} disabled={joining}>Back</BKButton>
      </form>
      </BKCard>
    </div>
  )
}
