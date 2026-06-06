import { useEffect, useRef, useState } from 'react'
import { usePyodide }   from './usePyodide.js'
import { useProgress }  from './useProgress.js'
import { useAudio }     from './useAudio.js'
import { CHAPTERS }     from './lessons.js'
import HomeScreen       from './components/HomeScreen.jsx'
import CampaignSelect   from './components/CampaignSelect.jsx'
import GameScreen       from './components/GameScreen.jsx'
import KnowledgeBook    from './components/KnowledgeBook.jsx'
import DailyDrill       from './components/DailyDrill.jsx'

// ── Persistent top bar (shown on select / mission / book / drill) ─────────────
function TopBar({ rank, progress, MAX_HP, muted, toggleMute, onHome }) {
  const musouPct   = Math.min(100, Math.round(progress.musou))
  const todayPct   = Math.min(100, Math.round((progress.todayMerit / (progress.dailyGoal || 30)) * 100))
  const dailyDone  = progress.todayMerit >= (progress.dailyGoal || 30)
  const streak     = progress.streak?.count ?? 0

  return (
    <div className="topbar">
      <button className="topbar-home-btn" onClick={onHome} title="返回主页">⚔</button>
      <div className="topbar-rank">
        <span className="topbar-rank-label">军衔</span>
        <span className="topbar-rank-name">{rank.name}</span>
      </div>
      <div className="topbar-merit">
        <span className="topbar-icon">⚔</span>
        <span className="topbar-val">{progress.merit}</span>
      </div>
      <div className="topbar-hp">
        {Array.from({ length: MAX_HP }, (_, i) => (
          <span key={i} className={i < progress.hp ? 'hp-full' : 'hp-empty'}>
            {i < progress.hp ? '❤' : '🖤'}
          </span>
        ))}
      </div>
      <div className="topbar-musou">
        <span className="topbar-musou-label">无双</span>
        <div className="musou-track">
          <div className="musou-fill" style={{ width: `${musouPct}%` }} />
        </div>
      </div>
      {streak > 0 && (
        <div className="topbar-streak">🔥{streak}</div>
      )}
      {/* Daily goal mini ring */}
      <div className="topbar-daily" title={`今日 ${progress.todayMerit}/${progress.dailyGoal} 战功`}>
        <svg viewBox="0 0 28 28" width="24" height="24" className="topbar-daily-ring">
          <circle cx="14" cy="14" r="11" fill="none" stroke="rgba(176,37,42,0.2)" strokeWidth="3" />
          <circle cx="14" cy="14" r="11" fill="none"
            stroke={dailyDone ? '#B0252A' : '#C7A04A'} strokeWidth="3"
            strokeDasharray={`${todayPct * 0.691} 69.1`}
            strokeDashoffset="17.3" strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
        </svg>
        <span className="topbar-daily-label">{dailyDone ? '✓' : `${todayPct}%`}</span>
      </div>
      <button className="topbar-audio-btn" onClick={toggleMute} title={muted ? '开音乐' : '静音'}>
        {muted ? '🔇' : '🎵'}
      </button>
    </div>
  )
}

function MusouBanner() {
  return (
    <div className="musou-banner" aria-live="assertive">
      <div className="musou-banner-inner">
        <div className="musou-banner-text">无双乱舞！</div>
        <div className="musou-banner-sub">赵云一身是胆——无双槽爆发！</div>
      </div>
    </div>
  )
}

function DailyGoalBanner() {
  return (
    <div className="daily-goal-banner" aria-live="assertive">
      <div className="daily-goal-inner">
        <div className="daily-goal-text">今日已操练！</div>
        <div className="daily-goal-sub">每日目标达成 🎉</div>
      </div>
    </div>
  )
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const { status, run }      = usePyodide()
  const { progress, rank, completeStep, awardCorrect, penalizeWrong, awardStar,
          reset, getWeakTopics, getSkillLevel, MAX_HP } = useProgress()
  const { muted, toggleMute, playBgm, unlock } = useAudio()

  const [view, setView]                   = useState('home')
  const [activeChapterId, setActiveChapterId] = useState(null)
  const [showMusouBanner, setMusouBanner] = useState(false)
  const [showDailyBanner, setDailyBanner] = useState(false)

  const prevMusouTrigger = useRef(progress.musouTrigger)
  const prevDailyTrigger = useRef(progress.dailyGoalHitTrigger)

  useEffect(() => {
    if (progress.musouTrigger > prevMusouTrigger.current) {
      setMusouBanner(true)
      const t = setTimeout(() => setMusouBanner(false), 2500)
      prevMusouTrigger.current = progress.musouTrigger
      return () => clearTimeout(t)
    }
    prevMusouTrigger.current = progress.musouTrigger
  }, [progress.musouTrigger])

  useEffect(() => {
    if (progress.dailyGoalHitTrigger > prevDailyTrigger.current) {
      setDailyBanner(true)
      const t = setTimeout(() => setDailyBanner(false), 2500)
      prevDailyTrigger.current = progress.dailyGoalHitTrigger
      return () => clearTimeout(t)
    }
    prevDailyTrigger.current = progress.dailyGoalHitTrigger
  }, [progress.dailyGoalHitTrigger])

  const chapter = CHAPTERS.find(c => c.id === activeChapterId) ?? null

  function goHome() {
    playBgm('home')
    setView('home')
  }

  function handleStart() {
    unlock()           // satisfy browser autoplay policy
    playBgm('home')
    setView('select')
  }

  function handlePlay(ch) {
    setActiveChapterId(ch.id)
    playBgm(ch.id)
    setView('mission')
  }

  function handleSessionEnd({ chapterId, flawless }) {
    if (flawless) awardStar(chapterId, 'flawless')
  }

  function handleExtraComplete(chapterId) {
    awardStar(chapterId, 'extra')
  }

  const stars = progress.stars || {}

  const showTopBar = view !== 'home'

  return (
    <div className="app">
      {showTopBar && (
        <TopBar
          rank={rank} progress={progress} MAX_HP={MAX_HP}
          muted={muted} toggleMute={toggleMute}
          onHome={goHome}
        />
      )}

      {showMusouBanner && <MusouBanner />}
      {showDailyBanner && <DailyGoalBanner />}

      {view === 'home' && (
        <HomeScreen
          progress={progress} rank={rank}
          muted={muted} toggleMute={toggleMute}
          onStart={handleStart}
          onBook={() => { unlock(); setView('book') }}
        />
      )}

      {view === 'select' && (
        <CampaignSelect
          progress={progress} stars={stars}
          run={run} pyStatus={status}
          playBgm={playBgm}
          onPlay={handlePlay}
          onBack={goHome}
          onBook={() => setView('book')}
          onDrill={() => setView('drill')}
          onExtraComplete={handleExtraComplete}
        />
      )}

      {view === 'mission' && chapter && (
        <GameScreen
          chapter={chapter} pyStatus={status} run={run}
          progress={progress} rank={rank}
          onStepComplete={completeStep}
          onCorrect={awardCorrect}
          onWrong={penalizeWrong}
          onSessionEnd={handleSessionEnd}
          onBack={() => setView('select')}
        />
      )}

      {view === 'book' && (
        <KnowledgeBook
          getSkillLevel={getSkillLevel}
          onBack={() => setView(view === 'book' && chapter ? 'mission' : 'select')}
        />
      )}

      {view === 'drill' && (
        <DailyDrill
          weakTopics={getWeakTopics()}
          run={run} pyStatus={status}
          onStepDone={(topicId, correct) =>
            correct ? awardCorrect(topicId) : penalizeWrong(topicId)}
          onBack={() => setView('select')}
        />
      )}
    </div>
  )
}
