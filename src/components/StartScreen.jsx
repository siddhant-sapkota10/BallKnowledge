export default function StartScreen({ onPlay, onLive, rating }) {
  return (
    <div className="screen start-screen">
      <div className="logo-badge">⚽</div>
      <h1 className="game-title">Ball Knowledge</h1>
      <p className="game-subtitle">Premier League Quiz</p>
      {rating != null && (
        <p className="start-rating">Your ball knowledge: {rating}</p>
      )}
      <button className="btn-primary" onClick={onPlay}>Play</button>
      <button className="btn-secondary start-live-btn" onClick={onLive}>Live Game</button>
      <p className="start-meta">10 questions · 10 seconds each</p>
    </div>
  )
}
