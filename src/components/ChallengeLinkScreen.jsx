import { useState } from 'react'

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
      <p className="link-screen-label">Challenge created</p>
      <h2 className="link-screen-title">
        {match.challenger_name}, you scored {match.challenger_score}/10
      </h2>
      <p className="link-gloat">
        I scored {match.challenger_score}/10 on Ball Knowledge. Beat it.
      </p>
      <div className="link-box">
        <span className="link-url">{link}</span>
      </div>
      <button className="btn-primary" onClick={handleCopy}>
        {copied ? 'Copied!' : 'Copy Link'}
      </button>
      <button className="btn-secondary" onClick={onPlayAgain}>
        Play Again
      </button>
    </div>
  )
}
