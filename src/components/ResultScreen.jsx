function getMessage(score) {
  if (score === 10) return "Perfect score! You're a true football genius."
  if (score >= 8) return "Excellent! You really know your Premier League."
  if (score >= 6) return "Solid effort. Keep watching the matches!"
  if (score >= 4) return "Not bad, but there's room to improve."
  return "Better luck next time. Keep learning!"
}

export default function ResultScreen({ score, onPlayAgain, onChallenge }) {
  return (
    <div className="screen result-screen">
      <p className="result-label">Final Score</p>
      <div className="result-score-wrap">
        <span className="result-score">{score}</span>
        <span className="result-denom"> / 10</span>
      </div>
      <p className="result-message">{getMessage(score)}</p>
      <div className="result-actions">
        <button className="btn-primary" onClick={onChallenge}>
          Challenge a Mate
        </button>
        <button className="btn-secondary" onClick={onPlayAgain}>
          Play Again
        </button>
      </div>
    </div>
  )
}
