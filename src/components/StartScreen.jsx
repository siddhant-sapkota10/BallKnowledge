import { Radio, Sparkles, Trophy } from 'lucide-react'
import { BKBrand, BKButton } from './ui'

export default function StartScreen({ onPlay, onLive, rating }) {
  return (
    <div className="screen start-screen">
      <div className="start-top">
        <BKBrand compact />
        {rating != null && <p className="start-rating"><Trophy size={12} /> {rating} Elo</p>}
      </div>
      <div className="start-hero">
        <p className="hero-kicker"><Sparkles size={15} /> Premier League duels</p>
        <h1 className="game-title">Know ball.<br /><span>Prove it.</span></h1>
        <p className="game-subtitle">Settle who in the group chat actually knows ball, then rub it in their face.</p>
      </div>
      <div className="start-actions">
        <BKButton onClick={onPlay}>Start a duel</BKButton>
        <BKButton variant="secondary" icon={Radio} onClick={onLive}>Play live</BKButton>
        <p className="start-meta">10 questions · 10 seconds · no excuses</p>
      </div>
    </div>
  )
}
