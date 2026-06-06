import { useEffect, useRef, useState } from 'react'
import { CHAPTERS, isChapterComplete, isChapterUnlocked } from '../lessons.js'
import CodeEditor from './CodeEditor.jsx'

const ACT_LABELS = ['序幕','第一幕','第二幕','第三幕','第四幕','第五幕',
                    '第六幕','第七幕','第八幕','第九幕','第十幕','终幕']

// ── Stars display ────────────────────────────────────────────────
function Stars({ crowns, stars, chId, size = 'md' }) {
  const main     = !!crowns?.[chId]
  const flawless = !!stars?.[chId]?.flawless
  const extra    = !!stars?.[chId]?.extra
  return (
    <div className={`stars stars--${size}`}>
      <span className={`star ${main     ? 'star--lit' : ''}`} title="主线通关">★</span>
      <span className={`star ${flawless ? 'star--lit' : ''}`} title="全胜（无失误）">★</span>
      <span className={`star star--ex ${extra ? 'star--gold' : ''}`} title="额外任务">★</span>
    </div>
  )
}

// ── Inline extra-task mini challenge ─────────────────────────────
function ExtraTaskPanel({ tasks, chapterId, run, pyStatus, onComplete }) {
  const [idx, setIdx] = useState(0)
  const [code, setCode] = useState(tasks[0]?.starter || '')
  const [output, setOutput] = useState(null)
  const [done, setDone] = useState(false)
  const [hint, setHint] = useState(0)
  const task = tasks[idx]
  const ready = pyStatus === 'ready'

  function check() {
    if (!ready || !task) return
    const res = run(code, task.test || '')
    let passed = task.test
      ? res.passed === true
      : !res.err && res.out.trim() === (task.expect || '').trim()
    setOutput({ text: res.out, err: res.err, passed })
    if (passed) {
      setTimeout(() => {
        if (idx < tasks.length - 1) {
          setIdx(i => i + 1)
          setCode(tasks[idx + 1]?.starter || '')
          setOutput(null)
          setHint(0)
        } else {
          setDone(true)
          onComplete?.(chapterId)
        }
      }, 700)
    }
  }

  if (done) return (
    <div className="extra-done">🏆 额外任务完成！金星点亮！</div>
  )
  if (!task) return null

  return (
    <div className="extra-panel">
      <div className="extra-panel-title">⭐ {task.title}</div>
      <pre className="extra-panel-task">{task.task}</pre>

      {task.hints && hint > 0 && task.hints.slice(0, hint).map((h, i) => (
        <div key={i} className="extra-hint">💡 {h}</div>
      ))}
      {task.hints && hint < task.hints.length && (
        <button className="btn-hint" style={{marginBottom:8}} onClick={() => setHint(n => n + 1)}>
          {hint === 0 ? '看提示' : '再来一条'}
        </button>
      )}

      <div className="workbench" style={{ marginTop: 8 }}>
        <div className="workbench-head">
          <span className="dot dot-r"/><span className="dot dot-y"/><span className="dot dot-g"/>
          <span className="workbench-file">extra.py</span>
        </div>
        <CodeEditor value={code} onChange={setCode} />
        <div className="workbench-actions">
          <button className="btn-check" disabled={!ready} onClick={check}>✓ 验证</button>
        </div>
        <div className="console" style={{ minHeight: 60 }}>
          <div className="console-head">输出</div>
          {!ready && <p className="console-loading">引擎热身中…</p>}
          {!output && ready && <p className="console-empty">写好后验证。</p>}
          {output && (
            <>
              {output.text && <pre className="console-out">{output.text}</pre>}
              {output.err  && <pre className="console-err">⚠ {output.err}</pre>}
              {output.passed === false && !output.err && <pre className="console-err">再战！</pre>}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────
export default function CampaignSelect({
  progress, stars, run, pyStatus,
  onPlay, onBack, onBook, onDrill,
  playBgm, onExtraComplete,
}) {
  const firstInc = CHAPTERS.findIndex(ch => !isChapterComplete(ch.id, progress.completedSteps))
  const [selIdx, setSelIdx]     = useState(Math.max(0, firstInc === -1 ? 0 : firstInc))
  const [dispIdx, setDispIdx]   = useState(Math.max(0, firstInc === -1 ? 0 : firstInc))
  const [fading, setFading]     = useState(false)
  const [lockedMsg, setLockedMsg] = useState(false)
  const [portErr, setPortErr]   = useState(false)
  const [showExtra, setShowExtra] = useState(false)
  const listRef = useRef(null)

  const ch       = CHAPTERS[dispIdx]
  const unlocked = isChapterUnlocked(ch.id, progress.completedSteps)
  const completed = isChapterComplete(ch.id, progress.completedSteps)
  const chSteps  = ch.steps || []
  const doneCount = chSteps.filter(s => progress.completedSteps[s.id]).length
  const topics   = [...new Set(chSteps.filter(s => s.topicId).map(s => s.topicId))].length

  function changeChapter(idx) {
    if (idx === selIdx || fading) return
    setSelIdx(idx)
    setShowExtra(false)
    setFading(true)
    // Scroll list item into view
    listRef.current?.children[idx]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    setTimeout(() => {
      setDispIdx(idx)
      setFading(false)
      playBgm?.(CHAPTERS[idx].id)
    }, 160)
  }

  // BGM on mount
  useEffect(() => { playBgm?.(ch.id) }, [])

  // Keyboard navigation
  useEffect(() => {
    function onKey(e) {
      if (['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) return
      if (e.key === 'ArrowUp'   && selIdx > 0)               { e.preventDefault(); changeChapter(selIdx - 1) }
      if (e.key === 'ArrowDown' && selIdx < CHAPTERS.length - 1) { e.preventDefault(); changeChapter(selIdx + 1) }
      if ((e.key === 'Enter' || e.key === ' ') && !e.repeat)  { e.preventDefault(); handlePlay() }
      if (e.key === 'Escape')                                   { onBack() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selIdx, unlocked])

  function handlePlay() {
    if (!unlocked) {
      setLockedMsg(true)
      setTimeout(() => setLockedMsg(false), 2200)
      return
    }
    onPlay(ch)
  }

  return (
    <div className="cs-wrap">
      {/* Header */}
      <div className="cs-header">
        <button className="back-btn" onClick={onBack}>← 主页</button>
        <h2 className="cs-title">选择战役</h2>
        <div className="cs-header-right">
          <button className="cs-hdr-btn" onClick={onBook}>📖 兵法全书</button>
          <button className="cs-hdr-btn" onClick={onDrill}>🔄 每日操练</button>
        </div>
      </div>

      <div className="cs-body">
        {/* ── Left: chapter list ── */}
        <nav className="cs-list" ref={listRef}>
          {CHAPTERS.map((c, i) => {
            const done  = isChapterComplete(c.id, progress.completedSteps)
            const lock  = !isChapterUnlocked(c.id, progress.completedSteps)
            const active = i === selIdx
            const sc = [
              !!progress.crowns?.[c.id],
              !!stars?.[c.id]?.flawless,
              !!stars?.[c.id]?.extra,
            ].filter(Boolean).length

            return (
              <button
                key={c.id}
                className={[
                  'cs-list-item',
                  active ? 'cs-list-item--active' : '',
                  done   ? 'cs-list-item--done'   : '',
                  lock   ? 'cs-list-item--locked'  : '',
                ].join(' ')}
                onClick={() => changeChapter(i)}
              >
                <span className="cs-list-act">{ACT_LABELS[i]}</span>
                <span className="cs-list-emoji">{done ? '🏆' : lock ? '🔒' : c.emoji}</span>
                <span className="cs-list-name">{c.name}</span>
                <span className="cs-list-stars">
                  {[0,1,2].map(j => (
                    <span key={j} className={`star-sm ${j < sc ? (j===2&&stars?.[c.id]?.extra ? 'star-sm--gold' : 'star-sm--lit') : ''}`}>★</span>
                  ))}
                </span>
              </button>
            )
          })}
        </nav>

        {/* ── Right: campaign detail card ── */}
        <div className={`cs-card-wrap${fading ? ' cs-card-wrap--fade' : ''}`}>
          <div className="cs-card" key={dispIdx} style={{ '--ch-color': ch.color }}>
            {/* Color accent bar */}
            <div className="cs-card-accent" style={{ background: ch.color }} />

            {/* Portrait */}
            {!portErr && (
              <img className="cs-portrait" src="/images/zhaoyun.jpg" alt="赵云"
                onError={() => setPortErr(true)} />
            )}

            <div className="cs-card-body">
              <div className="cs-card-act">{ACT_LABELS[dispIdx]}</div>
              <h2 className="cs-card-name">{ch.name}</h2>
              <p className="cs-card-sub">{ch.subtitle}</p>
              <p className="cs-card-blurb">{ch.blurb}</p>

              {/* Stars */}
              <Stars crowns={progress.crowns} stars={stars} chId={ch.id} size="lg" />

              {/* Stats row */}
              <div className="cs-stats">
                <div className="cs-stat-item">
                  <span className="cs-stat-val">{doneCount}/{chSteps.length}</span>
                  <span className="cs-stat-label">步骤</span>
                </div>
                <div className="cs-stat-item">
                  <span className="cs-stat-val">{topics}</span>
                  <span className="cs-stat-label">知识点</span>
                </div>
                {ch.missions && (
                  <div className="cs-stat-item">
                    <span className="cs-stat-val">{ch.missions.length}</span>
                    <span className="cs-stat-label">任务</span>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="cs-prog-track">
                <div className="cs-prog-fill"
                  style={{ width: chSteps.length > 0 ? `${(doneCount/chSteps.length)*100}%` : '0%',
                           background: ch.color }} />
              </div>

              {/* Locked message */}
              {lockedMsg && (
                <div className="cs-locked-msg">🔒 需先完成前一战役才能解锁</div>
              )}

              {/* Action buttons */}
              <div className="cs-actions">
                <button className="cs-play-btn" onClick={handlePlay}
                  style={{ background: unlocked ? ch.color : undefined }}
                  disabled={!unlocked}>
                  {completed ? '⟳ 重温战役' : unlocked ? '出战！' : '🔒 未解锁'}
                </button>
                {ch.extraTasks?.length > 0 && (
                  <button
                    className={`cs-extra-btn ${stars?.[ch.id]?.extra ? 'cs-extra-btn--done' : ''}`}
                    onClick={() => setShowExtra(e => !e)}>
                    ★ 额外任务{stars?.[ch.id]?.extra ? ' ✓' : ''}
                  </button>
                )}
              </div>

              {/* Extra task panel */}
              {showExtra && ch.extraTasks?.length > 0 && (
                <ExtraTaskPanel
                  tasks={ch.extraTasks}
                  chapterId={ch.id}
                  run={run}
                  pyStatus={pyStatus}
                  onComplete={onExtraComplete}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
