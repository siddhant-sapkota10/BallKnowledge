import { useState } from 'react'
import { Send } from 'lucide-react'
import { BKBrand, BKButton, BKCard } from './ui'

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
      <BKBrand compact />
      <BKCard className="mt-6">
        <p className="name-screen-score">You put up <strong>{score}/10</strong></p>
        <h2 className="name-screen-title">Who’s talking in the group chat?</h2>
        <form onSubmit={handleSubmit} className="name-form">
          <input className="name-input" type="text" placeholder="Your name" value={name}
            onChange={(e) => setName(e.target.value)} maxLength={30} autoFocus disabled={busy} />
          <BKButton icon={Send} type="submit" disabled={!name.trim() || busy}>
            {busy ? 'Creating…' : 'Create challenge'}
          </BKButton>
        </form>
      </BKCard>
    </div>
  )
}
