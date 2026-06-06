import { CHAPTERS, isChapterComplete, isChapterUnlocked, getAllSteps } from '../lessons.js'

function MissionDots({ chapter, completedSteps }) {
  const missions = chapter.missions || []
  if (!missions.length) return null
  return (
    <div className="mission-dots">
      {missions.map(m => {
        const mSteps = chapter.steps.filter(s => s.missionId === m.id)
        const allDone = mSteps.length > 0 && mSteps.every(s => completedSteps[s.id])
        const anyDone = mSteps.some(s => completedSteps[s.id])
        return (
          <div key={m.id} className={`mission-dot ${allDone ? 'mission-dot--done' : anyDone ? 'mission-dot--partial' : ''}`}
            title={m.title}>
            <span>{m.emoji || '◈'}</span>
          </div>
        )
      })}
    </div>
  )
}

function ChapterNode({ chapter, status, completedSteps, onClick }) {
  const isDone = status === 'done'
  const isCurrent = status === 'current'
  const isLocked = status === 'locked'
  const steps = chapter.steps || []
  const doneCount = steps.filter(s => completedSteps[s.id]).length

  return (
    <button
      className={`chapter-node chapter-node--${status}`}
      style={{ '--ch-color': chapter.color }}
      disabled={isLocked}
      onClick={onClick}
    >
      <div className="chapter-node-flag">
        <span className="chapter-node-emoji">{isDone ? '🏆' : isLocked ? '🔒' : chapter.emoji}</span>
      </div>
      <div className="chapter-node-body">
        <div className="chapter-node-name">{chapter.name}</div>
        <div className="chapter-node-sub">{chapter.subtitle}</div>
        <MissionDots chapter={chapter} completedSteps={completedSteps} />
        {!isLocked && (
          <div className="chapter-node-progress-bar">
            <div className="chapter-node-progress-fill"
              style={{ width: `${steps.length > 0 ? (doneCount / steps.length) * 100 : 0}%` }} />
          </div>
        )}
      </div>
      <div className="chapter-node-action">
        {isDone && <span className="chapter-seal">印</span>}
        {isCurrent && <span className="chapter-start-btn">出战 →</span>}
        {isLocked && <span className="chapter-locked-txt">未解锁</span>}
      </div>
    </button>
  )
}

export default function LessonMap({ progress, rank, onPick, onOpenBook, onDailyDrill, onReset }) {
  const allSteps = getAllSteps()
  const doneCount = allSteps.filter(s => progress.completedSteps[s.id]).length
  const total = allSteps.length
  const pct = Math.round((doneCount / total) * 100)
  const streak = progress.streak?.count ?? 0
  const freezes = progress.streak?.freezes ?? 0
  const todayMerit = progress.todayMerit ?? 0
  const dailyGoal = progress.dailyGoal ?? 30
  const dailyPct = Math.min(100, Math.round((todayMerit / dailyGoal) * 100))
  const dailyDone = todayMerit >= dailyGoal
  const weakCount = Object.values(progress.skillStrength || {}).filter(v => v.strength < 2).length

  function getStatus(chapter) {
    if (isChapterComplete(chapter.id, progress.completedSteps)) return 'done'
    if (isChapterUnlocked(chapter.id, progress.completedSteps)) return 'current'
    return 'locked'
  }

  return (
    <div className="map">
      <header className="map-header">
        <div className="map-title-area">
          <div className="map-logo">⚔</div>
          <div>
            <h1 className="map-h1">常山赵子龙</h1>
            <p className="map-sub">Python 兵法 · 一骑当千</p>
          </div>
        </div>

        <div className="map-stats">
          <div className="stat-item">
            <span className="stat-label">军衔</span>
            <span className="stat-val stat-rank">{rank.name}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">战功</span>
            <span className="stat-val">{progress.merit}</span>
          </div>
          {streak > 0 && (
            <div className="stat-item">
              <span className="stat-label">🔥连战</span>
              <span className="stat-val">{streak}天</span>
            </div>
          )}
          {freezes > 0 && (
            <div className="stat-item" title="免战旗：断连战时自动消耗一面保住连战">
              <span className="stat-label">🏳免战旗</span>
              <span className="stat-val">{freezes}</span>
            </div>
          )}
        </div>

        {/* Daily goal ring */}
        <div className="map-daily-goal">
          <div className="daily-ring-wrap">
            <svg className="daily-ring" viewBox="0 0 44 44" width="44" height="44">
              <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(199,160,74,0.15)" strokeWidth="4" />
              <circle cx="22" cy="22" r="18" fill="none" stroke={dailyDone ? '#C7A04A' : '#B0252A'}
                strokeWidth="4" strokeDasharray={`${dailyPct * 1.131} 113.1`}
                strokeDashoffset="28.3" strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
            </svg>
            <span className="daily-ring-label">{dailyDone ? '✓' : `${dailyPct}%`}</span>
          </div>
          <div className="daily-ring-text">
            <span className="daily-ring-main">{dailyDone ? '今日已操练！' : '每日目标'}</span>
            <span className="daily-ring-sub">{todayMerit}/{dailyGoal} 战功</span>
          </div>
        </div>

        <div className="map-progress">
          <div className="map-progress-track">
            <div className="map-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="map-progress-label">已通 {doneCount} / {total} 步</span>
        </div>

        {/* Quick actions */}
        <div className="map-quick-actions">
          <button className="map-action-btn" onClick={onOpenBook}>📖 兵法全书</button>
          <button className="map-action-btn map-action-btn--drill" onClick={onDailyDrill}>
            🔄 每日操练{weakCount > 0 && <span className="drill-badge">{weakCount}</span>}
          </button>
        </div>
      </header>

      {/* Campaign road */}
      <div className="campaign-road">
        <div className="road-line" aria-hidden="true" />
        {CHAPTERS.map((ch, idx) => {
          const status = getStatus(ch)
          return (
            <div key={ch.id} className={`road-node road-node--${idx % 2 === 0 ? 'left' : 'right'}`}>
              <div className="road-node-index">
                {idx === 0 ? '序幕' : idx === CHAPTERS.length - 1 ? '终幕' : `第${['一','二','三','四','五','六','七','八','九','十'][idx - 1]}幕`}
              </div>
              <ChapterNode
                chapter={ch} status={status}
                completedSteps={progress.completedSteps}
                onClick={() => status !== 'locked' && onPick(ch)}
              />
            </div>
          )
        })}
      </div>

      <footer className="map-footer">
        <p className="map-footer-text">修习兵法，精进 Python——子龙之路，始于此处。</p>
        <button className="link-btn" onClick={onReset}>重置所有进度</button>
      </footer>
    </div>
  )
}
