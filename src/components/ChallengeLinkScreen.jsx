import { useState } from 'react'
import { Check, Copy, RotateCcw } from 'lucide-react'
import { BKBrand, BKButton, BKCard } from './ui'

export default function ChallengeLinkScreen({ match, onPlayAgain }) {
  const [copied, setCopied] = useState(false)

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
    <div className="screen link-screen">
      <BKBrand compact />
      <BKCard className="mt-6">
        <p className="link-screen-label">Challenge ready</p>
        <h2 className="link-screen-title">{match.challenger_name} set the bar at {match.challenger_score}/10.</h2>
        <p className="link-gloat">Send it. Apply pressure. Await excuses.</p>
        <div className="link-box"><span className="link-url">{link}</span></div>
        <BKButton icon={copied ? Check : Copy} onClick={handleCopy}>{copied ? 'Copied' : 'Copy challenge link'}</BKButton>
        <BKButton variant="secondary" icon={RotateCcw} className="mt-3" onClick={onPlayAgain}>Play again</BKButton>
      </BKCard>
    </div>
  )
}
