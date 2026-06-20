export default function LiveOptions({ onCreate, onJoin, onBack }) {
  return (
    <div className="screen name-screen">
      <p className="challenge-badge">Live Game</p>
      <h2 className="challenge-title">Real-time Buzzer</h2>
      <p className="challenge-sub">Two phones, same question — first correct answer wins</p>
      <div className="name-form">
        <button className="btn-primary" onClick={onCreate}>Create Game</button>
        <button className="btn-secondary" onClick={onJoin}>Join Game</button>
        <button className="btn-secondary" onClick={onBack}>Back</button>
      </div>
    </div>
  )
}
