import { ArrowLeft, LogIn, Radio } from 'lucide-react'
import { BKBrand, BKButton, BKCard } from '../ui'

export default function LiveOptions({ onCreate, onJoin, onBack }) {
  return (
    <div className="screen name-screen">
      <BKBrand compact />
      <BKCard className="mt-6">
        <p className="challenge-badge">Live mode</p>
        <h2 className="challenge-title">Same question.<br />Fastest finger.</h2>
        <p className="challenge-sub">Two phones. One room. First correct answer takes the point.</p>
        <div className="name-form">
          <BKButton icon={Radio} onClick={onCreate}>Create room</BKButton>
          <BKButton variant="secondary" icon={LogIn} onClick={onJoin}>Join room</BKButton>
          <BKButton variant="secondary" icon={ArrowLeft} onClick={onBack}>Back</BKButton>
        </div>
      </BKCard>
    </div>
  )
}
