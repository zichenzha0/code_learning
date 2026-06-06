import { useEffect, useRef, useState } from 'react'
import { usePyodide } from './usePyodide.js'
import { useProgress } from './useProgress.js'
import { CHAPTERS } from './lessons.js'
import LessonMap from './components/LessonMap.jsx'
import GameScreen from './components/GameScreen.jsx'
import KnowledgeBook from './components/KnowledgeBook.jsx'
import DailyDrill from './components/DailyDrill.jsx'

// ── TopBar ──────────────────────────────────────────────────────
function TopBar({ rank, progress, MAX_HP, onOpenBook, onDailyDrill }) {
  const musouPct = Math.min(100, Math.round(progress.musou))
  const todayPct = Math.min(100, Math.round((progress.todayMerit / (progress.dailyGoal || 30)) * 100))
  const dailyDone = progress.todayMerit >= (progress.dailyGoal || 30)
  const streak = progress.streak?.count ?? 0
  const freezes = progress.streak?.freezes ?? 0

  return (
    <div className="topbar">
      <div className="topbar-rank">
        <span className="topbar-rank-label">军衔</span>
        <span className="topbar-rank-name">{rank.name}</span>
      </div>
      <div className="topbar-merit">
        <span className="topbar-icon">⚔</span>
        <span className="topbar-val">{progress.merit}</span>
        <span className="topbar-sub">战功</span>
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
        <div className="topbar-streak" title={`连战 ${streak} 天${freezes > 0 ? `，${freezes} 面免战旗` : ''}`}>
          🔥{streak}
          {freezes > 0 && <span className="topbar-freeze">🏳×{freezes}</span>}
        </div>
      )}
      {/* Daily goal mini ring */}
      <div className="topbar-daily" title={`今日战功 ${progress.todayMerit}/${progress.dailyGoal}`}>
        <svg viewBox="0 0 28 28" width="28" height="28" className="topbar-daily-ring">
          <circle cx="14" cy="14" r="11" fill="none" stroke="rgba(199,160,74,0.2)" strokeWidth="3" />
          <circle cx="14" cy="14" r="11" fill="none"
            stroke={dailyDone ? '#C7A04A' : '#B0252A'} strokeWidth="3"
            strokeDasharray={`${todayPct * 0.691} 69.1`}
            strokeDashoffset="17.3" strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
        </svg>
        <span className="topbar-daily-label">{dailyDone ? '✓' : `${todayPct}%`}</span>
      </div>
      <button className="topbar-book-btn" onClick={onOpenBook}>📖</button>
    </div>
  )
}

// ── Musou Banner ────────────────────────────────────────────────
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

// ── Daily Goal Banner ───────────────────────────────────────────
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

// ── Main App ────────────────────────────────────────────────────
export default function App() {
  const { status, run } = usePyodide()
  const { progress, rank, completeStep, awardCorrect, penalizeWrong, reset, getWeakTopics, getSkillLevel, MAX_HP } = useProgress()

  const [view, setView] = useState('map')   // 'map' | 'game' | 'book' | 'drill'
  const [activeChapterId, setActiveChapterId] = useState(null)
  const [showMusouBanner, setShowMusouBanner] = useState(false)
  const [showDailyBanner, setShowDailyBanner] = useState(false)
  const prevTriggerRef = useRef(progress.musouTrigger)
  const prevDailyTrigger = useRef(progress.dailyGoalHitTrigger)

  useEffect(() => {
    if (progress.musouTrigger > prevTriggerRef.current) {
      setShowMusouBanner(true)
      const t = setTimeout(() => setShowMusouBanner(false), 2500)
      prevTriggerRef.current = progress.musouTrigger
      return () => clearTimeout(t)
    }
    prevTriggerRef.current = progress.musouTrigger
  }, [progress.musouTrigger])

  useEffect(() => {
    if (progress.dailyGoalHitTrigger > prevDailyTrigger.current) {
      setShowDailyBanner(true)
      const t = setTimeout(() => setShowDailyBanner(false), 2500)
      prevDailyTrigger.current = progress.dailyGoalHitTrigger
      return () => clearTimeout(t)
    }
    prevDailyTrigger.current = progress.dailyGoalHitTrigger
  }, [progress.dailyGoalHitTrigger])

  const chapter = CHAPTERS.find(c => c.id === activeChapterId) ?? null

  function openChapter(ch) {
    setActiveChapterId(ch.id)
    setView('game')
  }

  return (
    <div className="app">
      <TopBar
        rank={rank} progress={progress} MAX_HP={MAX_HP}
        onOpenBook={() => setView('book')}
        onDailyDrill={() => setView('drill')}
      />

      {showMusouBanner && <MusouBanner />}
      {showDailyBanner && <DailyGoalBanner />}

      {view === 'map' && (
        <LessonMap
          progress={progress} rank={rank}
          onPick={openChapter}
          onOpenBook={() => setView('book')}
          onDailyDrill={() => setView('drill')}
          onReset={() => { if (confirm('确定清除全部战功记录？此操作不可撤销。')) reset() }}
        />
      )}

      {view === 'game' && chapter && (
        <GameScreen
          chapter={chapter} pyStatus={status} run={run}
          progress={progress} rank={rank}
          onStepComplete={completeStep}
          onCorrect={awardCorrect}
          onWrong={penalizeWrong}
          onBack={() => setView('map')}
        />
      )}

      {view === 'book' && (
        <KnowledgeBook
          getSkillLevel={getSkillLevel}
          onBack={() => setView(chapter ? 'game' : 'map')}
          onRunTeach={null}
        />
      )}

      {view === 'drill' && (
        <DailyDrill
          weakTopics={getWeakTopics()}
          run={run} pyStatus={status}
          onStepDone={(topicId, correct) => correct ? awardCorrect(topicId) : penalizeWrong(topicId)}
          onBack={() => setView('map')}
        />
      )}
    </div>
  )
}
