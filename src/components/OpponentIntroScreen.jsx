import { useState } from 'react'
import { Swords } from 'lucide-react'
import { BKBrand, BKButton, BKCard } from './ui'

export default function OpponentIntroScreen({ match, knownName, onPlay }) {
  const [name, setName] = useState('')

  if (knownName) {
    return (
      <div className="screen name-screen">
        <BKBrand compact />
        <BKCard className="mt-6">
          <p className="challenge-badge">You’ve been called out</p>
          <h2 className="challenge-title">{match.challenger_name} dropped {match.challenger_score}/10.</h2>
          <p className="challenge-sub">Beat the score or prepare a convincing excuse.</p>
          <div className="name-form">
            <p className="known-name">Playing as <strong>{knownName}</strong></p>
            <BKButton icon={Swords} onClick={() => onPlay(knownName)}>Take them on</BKButton>
          </div>
        </BKCard>
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
      <BKBrand compact />
      <BKCard className="mt-6">
        <p className="challenge-badge">You’ve been called out</p>
        <h2 className="challenge-title">{match.challenger_name} dropped {match.challenger_score}/10.</h2>
        <p className="challenge-sub">Beat the score or prepare a convincing excuse.</p>
        <form onSubmit={handleSubmit} className="name-form">
          <input className="name-input" type="text" placeholder="Your name" value={name}
            onChange={(e) => setName(e.target.value)} maxLength={30} autoFocus />
          <BKButton icon={Swords} type="submit" disabled={!name.trim()}>Take them on</BKButton>
        </form>
      </BKCard>
    </div>
  )
}
