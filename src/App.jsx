import { useState, useCallback, useEffect, useRef } from 'react'
import StartScreen from './components/StartScreen'
import QuestionScreen from './components/QuestionScreen'
import ResultScreen from './components/ResultScreen'
import ChallengeNameScreen from './components/ChallengeNameScreen'
import ChallengeLinkScreen from './components/ChallengeLinkScreen'
import OpponentIntroScreen from './components/OpponentIntroScreen'
import DuelResultScreen from './components/DuelResultScreen'
import LiveOptions from './components/live/LiveOptions'
import LiveLobby from './components/live/LiveLobby'
import LiveLobbyJoin from './components/live/LiveLobbyJoin'
import LiveQuestion from './components/live/LiveQuestion'
import LiveResult from './components/live/LiveResult'
import { sampleQuestions } from './data/sampleQuestions'
import { createMatch, fetchMatch, completeMatch } from './lib/matches'
import { getOrCreatePlayerId, getStoredDisplayName, saveDisplayName } from './lib/identity'
import { upsertPlayer, fetchRating, applyElo } from './lib/players'
import {
  createLiveMatch,
  joinLiveMatch,
  startLiveMatch,
  claimQuestion,
  markAnswered,
  expireQuestion,
  advanceQuestion,
  rematchLiveMatch,
  subscribeToLiveMatch,
  unsubscribeFromLiveMatch,
} from './lib/liveMatches'

const QUESTIONS_PER_GAME = 10
const MATCH_ID_FROM_URL = new URLSearchParams(window.location.search).get('match')

function pickGameQuestions() {
  return [...sampleQuestions].sort(() => Math.random() - 0.5).slice(0, QUESTIONS_PER_GAME)
}

function clearUrlParam() {
  window.history.replaceState({}, '', window.location.pathname)
}

function resetPowerUpState(setPowerUps, setPowerUpsUsed, setActiveStolenBy, answerLog) {
  setPowerUps({ freeze: null, steal: null })
  setPowerUpsUsed({ freeze: false, steal: false })
  setActiveStolenBy(null)
  answerLog.current = []
}

export default function App() {
  // ── Identity ───────────────────────────────────────────────────────────────
  const [playerId, setPlayerId] = useState(null)
  const [displayName, setDisplayName] = useState(null)
  const [myRating, setMyRating] = useState(null)

  // ── Game state ─────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState(MATCH_ID_FROM_URL ? 'opponent-loading' : 'start')
  const [questions, setQuestions] = useState([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [isOpponentGame, setIsOpponentGame] = useState(false)
  const [matchData, setMatchData] = useState(null)
  const [opponentName, setOpponentName] = useState('')
  const [eloResult, setEloResult] = useState(null)

  // ── Power-up state ─────────────────────────────────────────────────────────
  const [powerUps, setPowerUps] = useState({ freeze: null, steal: null })
  const [powerUpsUsed, setPowerUpsUsed] = useState({ freeze: false, steal: false })
  const [activeStolenBy, setActiveStolenBy] = useState(null)
  const answerLog = useRef([])

  // ── Live mode state ────────────────────────────────────────────────────────
  const [liveMatch, setLiveMatch] = useState(null)
  const [isLiveHost, setIsLiveHost] = useState(false)
  const liveChannelRef = useRef(null)

  // ── Bootstrap: identity + rating + optional match fetch ───────────────────
  useEffect(() => {
    const id = getOrCreatePlayerId()
    setPlayerId(id)
    const name = getStoredDisplayName()
    setDisplayName(name)
    fetchRating(id).then((row) => setMyRating(row?.rating ?? null)).catch(() => {})

    if (!MATCH_ID_FROM_URL) return
    fetchMatch(MATCH_ID_FROM_URL)
      .then((match) => {
        setMatchData(match)
        setPhase(match.status === 'complete' ? 'duel-result' : 'opponent-intro')
      })
      .catch(() => setPhase('opponent-error'))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Create challenge when name is already known (skip name prompt) ─────────
  useEffect(() => {
    if (phase !== 'challenge-creating') return
    const run = async () => {
      try {
        const match = await createMatch({
          challengerName: displayName,
          challengerScore: score,
          questionIds: questions.map((q) => q.id),
          challengerId: playerId,
          challengerPowerUps: {
            freeze: powerUps.freeze,
            steal: powerUps.steal,
            answers: answerLog.current.map((b) => (b ? 1 : 0)),
          },
        })
        setMatchData(match)
        setPhase('challenge-link')
      } catch {
        alert('Could not create challenge. Check your connection and try again.')
        setPhase('result')
      }
    }
    run()
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Complete match + Elo when opponent finishes ───────────────────────────
  useEffect(() => {
    if (phase !== 'opponent-submitting') return
    const run = async () => {
      const cp = matchData?.challenger_powerups ?? {}
      const cAnswers = cp.answers ?? []
      const oLog = answerLog.current

      const cStealIdx = cp.steal ?? -1
      const cStealHit =
        cStealIdx >= 0 &&
        cAnswers[cStealIdx] === 1 &&
        oLog[cStealIdx] === false

      const oStealIdx = powerUps.steal ?? -1
      const oStealHit =
        oStealIdx >= 0 &&
        oLog[oStealIdx] === true &&
        (cAnswers[oStealIdx] ?? 1) === 0

      const opponentFinalScore = score + (oStealHit ? 1 : 0)
      const newChallengerScore = (matchData?.challenger_score ?? 0) + (cStealHit ? 1 : 0)

      const opponentPowerUps = {
        freeze: powerUps.freeze,
        steal: powerUps.steal,
        c_steal_hit: cStealHit,
        o_steal_hit: oStealHit,
      }

      try {
        const updated = await completeMatch(matchData.id, {
          opponentName,
          opponentId: playerId,
          opponentScore: opponentFinalScore,
          opponentPowerUps,
          newChallengerScore,
        })
        setMatchData(updated)

        if (updated.challenger_id && playerId) {
          try {
            const elo = await applyElo({
              challengerId: updated.challenger_id,
              challengerScore: updated.challenger_score,
              opponentId: playerId,
              opponentScore: opponentFinalScore,
            })
            setEloResult(elo)
            setMyRating(elo.opponent.newRating)
          } catch {
            // Elo failure is non-fatal
          }
        }

        setPhase('duel-result')
      } catch {
        setMatchData((m) => ({
          ...m,
          opponent_name: opponentName,
          opponent_score: opponentFinalScore,
          opponent_powerups: opponentPowerUps,
          challenger_score: newChallengerScore,
          status: 'complete',
        }))
        setPhase('duel-result')
      }
    }
    run()
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Live mode: react to status changes from Realtime ──────────────────────
  useEffect(() => {
    if (!liveMatch) return
    if (liveMatch.status === 'active' && phase === 'live-lobby') {
      setPhase('live-playing')
    } else if (liveMatch.status === 'complete' && phase === 'live-playing') {
      setPhase('live-result')
    } else if (liveMatch.status === 'waiting' && phase === 'live-result') {
      // Rematch: host reset the room; guest follows back to lobby
      setPhase('live-lobby')
    }
  }, [liveMatch?.status, phase]) // eslint-disable-line

  // ── Clean up Realtime subscription on unmount ─────────────────────────────
  useEffect(() => {
    return () => {
      if (liveChannelRef.current) {
        unsubscribeFromLiveMatch(liveChannelRef.current)
      }
    }
  }, [])

  // ── Helpers ────────────────────────────────────────────────────────────────

  const persistName = useCallback(
    async (name) => {
      saveDisplayName(name)
      setDisplayName(name)
      try { await upsertPlayer(playerId, name) } catch { /* non-fatal */ }
    },
    [playerId],
  )

  // ── Banked duel callbacks ──────────────────────────────────────────────────

  const handleSoloPlay = useCallback(() => {
    clearUrlParam()
    setQuestions(pickGameQuestions())
    setQuestionIndex(0)
    setScore(0)
    setIsOpponentGame(false)
    setMatchData(null)
    setEloResult(null)
    resetPowerUpState(setPowerUps, setPowerUpsUsed, setActiveStolenBy, answerLog)
    setPhase('playing')
  }, [])

  const handleAnswer = useCallback(
    (isCorrect) => {
      if (isCorrect) setScore((s) => s + 1)
      answerLog.current[questionIndex] = isCorrect

      if (isOpponentGame && !isCorrect && matchData) {
        const cp = matchData.challenger_powerups ?? {}
        const cStealIdx = cp.steal ?? -1
        if (cStealIdx === questionIndex && (cp.answers?.[cStealIdx] ?? 0) === 1) {
          setActiveStolenBy(matchData.challenger_name)
        }
      }
    },
    [questionIndex, isOpponentGame, matchData],
  )

  const handleNext = useCallback(() => {
    setActiveStolenBy(null)
    setQuestionIndex((i) => {
      const next = i + 1
      if (next >= questions.length) {
        setPhase(isOpponentGame ? 'opponent-submitting' : 'result')
        return i
      }
      return next
    })
  }, [isOpponentGame, questions.length])

  const handleArmPowerUp = useCallback(
    (type) => {
      setPowerUps((prev) => ({ ...prev, [type]: questionIndex }))
      setPowerUpsUsed((prev) => ({ ...prev, [type]: true }))
    },
    [questionIndex],
  )

  const handleCreateChallenge = useCallback(
    async (enteredName) => {
      await persistName(enteredName)
      try {
        const match = await createMatch({
          challengerName: enteredName,
          challengerScore: score,
          questionIds: questions.map((q) => q.id),
          challengerId: playerId,
          challengerPowerUps: {
            freeze: powerUps.freeze,
            steal: powerUps.steal,
            answers: answerLog.current.map((b) => (b ? 1 : 0)),
          },
        })
        setMatchData(match)
        setPhase('challenge-link')
      } catch {
        alert('Could not create challenge. Check your connection and try again.')
      }
    },
    [score, questions, playerId, persistName, powerUps],
  )

  const handleChallengeClick = useCallback(() => {
    if (displayName) {
      setPhase('challenge-creating')
    } else {
      setPhase('challenge-name')
    }
  }, [displayName])

  const handleOpponentPlay = useCallback(
    async (name) => {
      if (!displayName) await persistName(name)
      const qs = matchData.question_ids
        .map((id) => sampleQuestions.find((q) => q.id === id))
        .filter(Boolean)
      setOpponentName(name)
      setQuestions(qs)
      setQuestionIndex(0)
      setScore(0)
      setIsOpponentGame(true)
      resetPowerUpState(setPowerUps, setPowerUpsUsed, setActiveStolenBy, answerLog)
      setPhase('playing')
    },
    [matchData, displayName, persistName],
  )

  const handleRematch = useCallback(() => {
    clearUrlParam()
    setMatchData(null)
    setOpponentName('')
    setIsOpponentGame(false)
    setEloResult(null)
    resetPowerUpState(setPowerUps, setPowerUpsUsed, setActiveStolenBy, answerLog)
    setPhase('start')
  }, [])

  // ── Live mode callbacks ────────────────────────────────────────────────────

  const handleCreateLive = useCallback(async () => {
    const questionIds = pickGameQuestions().map((q) => q.id)
    try {
      const match = await createLiveMatch({
        hostId: playerId,
        hostName: displayName ?? 'Host',
        questionIds,
      })
      setLiveMatch(match)
      setIsLiveHost(true)
      liveChannelRef.current = subscribeToLiveMatch(match.id, (updated) => {
        setLiveMatch(updated)
      })
      setPhase('live-lobby')
    } catch {
      alert('Could not create live game. Check your connection.')
    }
  }, [playerId, displayName])

  const handleJoinLive = useCallback(async (roomCode) => {
    // Errors propagate to LiveLobbyJoin for inline display
    const match = await joinLiveMatch({
      roomCode,
      guestId: playerId,
      guestName: displayName ?? 'Guest',
    })
    setLiveMatch(match)
    setIsLiveHost(false)
    liveChannelRef.current = subscribeToLiveMatch(match.id, (updated) => {
      setLiveMatch(updated)
    })
    setPhase('live-lobby')
  }, [playerId, displayName])

  const handleStartLive = useCallback(async () => {
    try {
      const updated = await startLiveMatch(liveMatch.id)
      setLiveMatch(updated)
      setPhase('live-playing')
    } catch {
      alert('Could not start game. Try again.')
    }
  }, [liveMatch?.id])

  const handleLiveClaim = useCallback((questionIndex) => {
    claimQuestion({
      matchId: liveMatch.id,
      playerId,
      isHost: isLiveHost,
      currentIndex: questionIndex,
    })
  }, [liveMatch?.id, playerId, isLiveHost])

  const handleLiveWrong = useCallback((questionIndex) => {
    markAnswered({ matchId: liveMatch.id, isHost: isLiveHost, currentIndex: questionIndex })
  }, [liveMatch?.id, isLiveHost])

  // Only host fires expiry to avoid both clients acting on timer=0
  const handleLiveExpire = useCallback((questionIndex) => {
    expireQuestion({ matchId: liveMatch.id, currentIndex: questionIndex })
  }, [liveMatch?.id])

  // Both clients fire advance; conditional WHERE in DB ensures idempotency
  const handleLiveAdvance = useCallback((fromIndex) => {
    advanceQuestion({ matchId: liveMatch.id, fromIndex })
  }, [liveMatch?.id])

  const handleLiveRematch = useCallback(async () => {
    const questionIds = pickGameQuestions().map((q) => q.id)
    try {
      const updated = await rematchLiveMatch({ matchId: liveMatch.id, questionIds })
      setLiveMatch(updated)
      setPhase('live-lobby') // host goes back to lobby explicitly
    } catch {
      alert('Could not start rematch.')
    }
  }, [liveMatch?.id])

  const handleLiveLeave = useCallback(() => {
    unsubscribeFromLiveMatch(liveChannelRef.current)
    liveChannelRef.current = null
    setLiveMatch(null)
    setIsLiveHost(false)
    setPhase('start')
  }, [])

  // ── Derived values for QuestionScreen ─────────────────────────────────────

  const frozenBy =
    isOpponentGame && matchData?.challenger_powerups?.freeze === questionIndex
      ? matchData.challenger_name
      : null

  // ── Live questions (looked up from sample data by stored IDs) ─────────────
  const liveQuestions = liveMatch
    ? liveMatch.question_ids
        .map((id) => sampleQuestions.find((q) => q.id === id))
        .filter(Boolean)
    : []

  // ── Render ─────────────────────────────────────────────────────────────────

  if (phase === 'start') {
    return (
      <StartScreen
        onPlay={handleSoloPlay}
        onLive={() => setPhase('live-options')}
        rating={myRating}
      />
    )
  }

  if (phase === 'playing') {
    return (
      <QuestionScreen
        key={questionIndex}
        question={questions[questionIndex]}
        questionNumber={questionIndex + 1}
        totalQuestions={questions.length}
        onAnswer={handleAnswer}
        onNext={handleNext}
        powerUpsUsed={powerUpsUsed}
        powerUps={powerUps}
        onArmPowerUp={handleArmPowerUp}
        frozenBy={frozenBy}
        stolenBy={activeStolenBy}
      />
    )
  }

  if (phase === 'result') {
    return (
      <ResultScreen
        score={score}
        onPlayAgain={handleSoloPlay}
        onChallenge={handleChallengeClick}
      />
    )
  }

  if (phase === 'challenge-name') {
    return <ChallengeNameScreen score={score} onSubmit={handleCreateChallenge} />
  }

  if (phase === 'challenge-link') {
    return <ChallengeLinkScreen match={matchData} onPlayAgain={handleSoloPlay} />
  }

  if (
    phase === 'opponent-loading' ||
    phase === 'opponent-submitting' ||
    phase === 'challenge-creating'
  ) {
    const msg =
      phase === 'opponent-submitting'
        ? 'Saving your result…'
        : phase === 'challenge-creating'
          ? 'Creating challenge…'
          : 'Loading challenge…'
    return (
      <div className="screen loading-screen">
        <div className="loading-spinner" aria-hidden="true" />
        <p className="loading-text">{msg}</p>
      </div>
    )
  }

  if (phase === 'opponent-error') {
    return (
      <div className="screen error-screen">
        <p className="error-title">Challenge not found</p>
        <p className="error-sub">This link may be invalid or the match no longer exists.</p>
        <button className="btn-primary" onClick={handleSoloPlay}>Play Solo</button>
      </div>
    )
  }

  if (phase === 'opponent-intro') {
    return (
      <OpponentIntroScreen
        match={matchData}
        knownName={displayName}
        onPlay={handleOpponentPlay}
      />
    )
  }

  if (phase === 'duel-result') {
    return (
      <DuelResultScreen
        match={matchData}
        eloResult={eloResult}
        onRematch={handleRematch}
      />
    )
  }

  // ── Live mode phases ───────────────────────────────────────────────────────

  if (phase === 'live-options') {
    return (
      <LiveOptions
        onCreate={handleCreateLive}
        onJoin={() => setPhase('live-lobby-join')}
        onBack={() => setPhase('start')}
      />
    )
  }

  if (phase === 'live-lobby-join') {
    return (
      <LiveLobbyJoin
        onJoin={handleJoinLive}
        onBack={() => setPhase('live-options')}
      />
    )
  }

  if (phase === 'live-lobby' && liveMatch) {
    return (
      <LiveLobby
        liveMatch={liveMatch}
        isHost={isLiveHost}
        onStart={handleStartLive}
        onLeave={handleLiveLeave}
      />
    )
  }

  if (phase === 'live-playing' && liveMatch) {
    const currentQuestion = liveQuestions[liveMatch.current_index]
    if (!currentQuestion) {
      return (
        <div className="screen loading-screen">
          <div className="loading-spinner" aria-hidden="true" />
          <p className="loading-text">Finishing…</p>
        </div>
      )
    }
    return (
      <LiveQuestion
        key={liveMatch.current_index}
        question={currentQuestion}
        questionIndex={liveMatch.current_index}
        totalQuestions={QUESTIONS_PER_GAME}
        liveMatch={liveMatch}
        isHost={isLiveHost}
        playerId={playerId}
        onClaim={handleLiveClaim}
        onWrong={handleLiveWrong}
        onExpire={handleLiveExpire}
        onAdvance={handleLiveAdvance}
      />
    )
  }

  if (phase === 'live-result' && liveMatch) {
    return (
      <LiveResult
        match={liveMatch}
        isHost={isLiveHost}
        onRematch={handleLiveRematch}
        onLeave={handleLiveLeave}
      />
    )
  }

  return null
}
