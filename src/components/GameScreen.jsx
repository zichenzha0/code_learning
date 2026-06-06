import { useEffect, useRef, useState } from 'react'
import CodeEditor from './CodeEditor.jsx'
import Confetti from './Confetti.jsx'
import { MERIT_BY_TYPE } from '../useProgress.js'

// ─────────────────────────────────────────────
//  Teach step (W3-style)
// ─────────────────────────────────────────────
function TeachStep({ step, run, pyStatus, onNext }) {
  const [exOutput, setExOutput] = useState(null)
  const [loreOpen, setLoreOpen] = useState(false)
  const [running, setRunning] = useState(false)

  function runExample() {
    if (!step.example) return
    setRunning(true)
    const res = run(step.example, '')
    setExOutput({ text: res.out, error: res.err })
    setRunning(false)
  }

  return (
    <div className="step-teach">
      <div className="teach-scroll">
        <div className="teach-scroll-inner">
          {/* Story scene (short!) */}
          {step.story && (
            <div className="teach-scene">
              <span className="scene-icon">⚔</span>
              <p className="scene-text">{step.story}</p>
              {step.lore && (
                <button className="lore-toggle" onClick={() => setLoreOpen(o => !o)}>
                  {loreOpen ? '▲ 收起战记' : '▼ 展开战记'}
                </button>
              )}
            </div>
          )}
          {loreOpen && step.lore && (
            <div className="teach-lore">{step.lore}</div>
          )}

          {/* W3 card: blurb */}
          <div className="w3-blurb">{step.blurb}</div>

          {/* Syntax */}
          {step.syntax && (
            <div className="w3-block w3-block--syntax">
              <div className="w3-block-label">语法</div>
              <pre className="w3-code syntax-code">{step.syntax}</pre>
            </div>
          )}

          {/* Example + run */}
          {step.example && (
            <div className="w3-block w3-block--example">
              <div className="w3-block-label w3-block-label--example">
                示例代码
                <button
                  className="btn-trystrike"
                  disabled={pyStatus !== 'ready' || running}
                  onClick={runExample}
                >
                  {pyStatus !== 'ready' ? '引擎加载…' : '试招 ▶'}
                </button>
              </div>
              <pre className="w3-code example-code">{step.example}</pre>
              {step.output && !exOutput && (
                <div className="w3-expected-output">
                  <span className="w3-output-label">预期输出：</span>
                  <pre className="w3-output-pre">{step.output}</pre>
                </div>
              )}
              {exOutput && (
                <div className="w3-actual-output">
                  <span className="w3-output-label">运行输出：</span>
                  {exOutput.text && <pre className="ex-out-text">{exOutput.text}</pre>}
                  {exOutput.error && <pre className="ex-out-err">{exOutput.error}</pre>}
                  {!exOutput.text && !exOutput.error && <pre className="ex-out-empty">（无输出）</pre>}
                </div>
              )}
            </div>
          )}

          {/* Note callout */}
          {step.note && (
            <div className="w3-note">
              <span className="w3-note-icon">※</span>
              <pre className="w3-note-text">{step.note}</pre>
            </div>
          )}

          {/* Related topics */}
          {step.related && step.related.length > 0 && (
            <div className="w3-related">
              <span className="w3-related-label">延伸：</span>
              {step.related.map((id) => (
                <span key={id} className="w3-related-chip">{id.replace('py-', '')}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="step-action-bar">
        <button className="btn-continue" onClick={onNext}>习得此招，继续 →</button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  Challenge / Project step
// ─────────────────────────────────────────────
function ChallengeStep({ step, run, pyStatus, onPass, onFail, shake }) {
  const [code, setCode] = useState(step.starter || '')
  const [output, setOutput] = useState(null)
  const [hintLevel, setHintLevel] = useState(0)
  const [loreOpen, setLoreOpen] = useState(false)
  const consoleRef = useRef(null)

  useEffect(() => {
    setCode(step.starter || '')
    setOutput(null)
    setHintLevel(0)
  }, [step.id])

  const ready = pyStatus === 'ready'
  const isProject = step.type === 'project'

  function execute(check) {
    if (!ready) return
    const testCode = check ? (step.test || '') : ''
    const res = run(code, testCode)
    let passed
    if (step.test) {
      passed = res.passed === true
    } else {
      passed = !res.err && res.out.trim() === (step.expect || '').trim()
    }
    setOutput({ text: res.out, error: res.err, checked: check, passed })
    if (check) {
      if (passed) onPass()
      else onFail()
    }
    requestAnimationFrame(() => {
      if (consoleRef.current) consoleRef.current.scrollTop = consoleRef.current.scrollHeight
    })
  }

  return (
    <div className={`step-challenge${shake ? ' shake' : ''}`}>
      <div className="brief">
        {/* Story / scene */}
        {step.story && (
          <div className="brief-card story-card">
            <div className="scene-line">
              <span className="scene-icon">⚔</span>
              <p className="brief-story">{step.story}</p>
            </div>
            {step.lore && (
              <>
                <button className="lore-toggle" onClick={() => setLoreOpen(o => !o)}>
                  {loreOpen ? '▲ 收起战记' : '▼ 展开战记'}
                </button>
                {loreOpen && <p className="brief-lore">{step.lore}</p>}
              </>
            )}
          </div>
        )}

        {/* Task / requirements */}
        {isProject ? (
          step.requirements && (
            <div className="brief-card req-card">
              <div className="section-tag req-tag">任务要求</div>
              <ul className="req-list">
                {step.requirements.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )
        ) : (
          step.task && (
            <div className="brief-card goal-card">
              <div className="section-tag goal-tag">出战目标</div>
              <pre className="brief-task">{step.task}</pre>
              {step.expect != null && (
                <div className="expected-out">
                  <span className="expected-label">期望输出</span>
                  <pre className="expected-pre">{step.expect}</pre>
                </div>
              )}
            </div>
          )
        )}

        {/* Hints */}
        {step.hints && step.hints.length > 0 && (
          <div className="hints-panel">
            {hintLevel > 0 && step.hints.slice(0, hintLevel).map((h, i) => (
              <div className="hint-item" key={i}>
                <span className="hint-num">提示 {i + 1}</span>
                <span className="hint-text">{h}</span>
              </div>
            ))}
            {hintLevel < step.hints.length && (
              <button className="btn-hint" onClick={() => setHintLevel(n => n + 1)}>
                {hintLevel === 0 ? '🆘 卡住了？看提示' : '再来一个提示'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Workbench */}
      <div className="workbench">
        <div className="workbench-head">
          <span className="dot dot-r" /><span className="dot dot-y" /><span className="dot dot-g" />
          <span className="workbench-file">main.py</span>
        </div>
        <CodeEditor value={code} onChange={setCode} />
        <div className="workbench-actions">
          <button className="btn-run" disabled={!ready} onClick={() => execute(false)}>▶ 运行</button>
          <button className="btn-check" disabled={!ready} onClick={() => execute(true)}>✓ 提交检查</button>
        </div>
        <div className="console" ref={consoleRef}>
          <div className="console-head">输出</div>
          {!ready && <p className="console-loading">🐍 正在启动 Python 引擎…</p>}
          {ready && output == null && <p className="console-empty">点「运行」查看输出，点「提交检查」验证答案。</p>}
          {output && (
            <>
              {output.text && <pre className="console-out">{output.text}</pre>}
              {output.error && <pre className="console-err">⚠ {output.error}</pre>}
              {output.checked && !output.passed && !output.error && (
                <pre className="console-err">还差一点点——再调调看 💪</pre>
              )}
              {!output.text && !output.error && !output.checked && <p className="console-empty">（无输出）</p>}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  Boss step
// ─────────────────────────────────────────────
function BossStep({ step, run, pyStatus, onPass, onHit, onDefend }) {
  const total = step.bossHp ?? step.challenges?.length ?? 3
  const [currentIdx, setCurrentIdx] = useState(0)
  const [bossHpLeft, setBossHpLeft] = useState(total)
  const [defeated, setDefeated] = useState(false)
  const [code, setCode] = useState(step.challenges?.[0]?.starter || '')
  const [output, setOutput] = useState(null)
  const [loreOpen, setLoreOpen] = useState(false)
  const consoleRef = useRef(null)
  const challenges = step.challenges || []

  useEffect(() => {
    setCode(challenges[currentIdx]?.starter || '')
    setOutput(null)
  }, [currentIdx])

  const cur = challenges[currentIdx]
  const ready = pyStatus === 'ready'

  function execute(check) {
    if (!ready || !cur) return
    const testCode = check ? (cur.test || '') : ''
    const res = run(code, testCode)
    let passed
    if (cur.test) {
      passed = res.passed === true
    } else {
      passed = !res.err && res.out.trim() === (cur.expect || '').trim()
    }
    setOutput({ text: res.out, error: res.err, checked: check, passed })
    if (check) {
      if (passed) {
        onHit()
        const newHp = bossHpLeft - 1
        setBossHpLeft(newHp)
        if (newHp <= 0) {
          setDefeated(true)
          onPass()
        } else {
          setTimeout(() => {
            setCurrentIdx(i => i + 1)
            setOutput(null)
          }, 800)
        }
      } else {
        onDefend()
      }
    }
    requestAnimationFrame(() => {
      if (consoleRef.current) consoleRef.current.scrollTop = consoleRef.current.scrollHeight
    })
  }

  return (
    <div className="step-boss">
      {/* Boss header */}
      <div className="boss-header">
        <div className="boss-name-area">
          <span className="boss-skull">💀</span>
          <div>
            <div className="boss-name">{step.bossName}</div>
            <div className="boss-taunt">「{step.bossTaunt}」</div>
          </div>
        </div>
        <div className="boss-hp-bar">
          {Array.from({ length: total }, (_, i) => (
            <div key={i} className={`boss-hp-seg${i < bossHpLeft ? ' boss-hp-seg--full' : ''}`} />
          ))}
          <span className="boss-hp-label">{bossHpLeft}/{total}</span>
        </div>
      </div>

      {/* Story */}
      {step.story && (
        <div className="boss-story">
          <span className="scene-icon">⚔</span> {step.story}
          {step.lore && (
            <>
              <button className="lore-toggle" onClick={() => setLoreOpen(o => !o)} style={{marginLeft:8}}>
                {loreOpen ? '▲ 战记' : '▼ 战记'}
              </button>
              {loreOpen && <div className="brief-lore" style={{marginTop:8}}>{step.lore}</div>}
            </>
          )}
        </div>
      )}

      {defeated ? (
        <div className="boss-defeated">
          <div className="boss-def-icon">🏆</div>
          <div className="boss-def-title">BOSS 击破！</div>
        </div>
      ) : cur && (
        <div className="boss-challenge">
          <div className="boss-round-badge">第 {currentIdx + 1} 回合 / {total}</div>
          <div className="boss-task">{cur.task}</div>
          {cur.hint && output?.checked && !output?.passed && (
            <div className="boss-hint">💡 提示：{cur.hint}</div>
          )}

          <div className="workbench" style={{marginTop:12}}>
            <div className="workbench-head">
              <span className="dot dot-r" /><span className="dot dot-y" /><span className="dot dot-g" />
              <span className="workbench-file">boss_{currentIdx + 1}.py</span>
            </div>
            <CodeEditor value={code} onChange={setCode} />
            <div className="workbench-actions">
              <button className="btn-run" disabled={!ready} onClick={() => execute(false)}>▶ 运行</button>
              <button className="btn-check" disabled={!ready} onClick={() => execute(true)}>⚔ 斩！</button>
            </div>
            <div className="console" ref={consoleRef}>
              <div className="console-head">输出</div>
              {!ready && <p className="console-loading">🐍 引擎热身中…</p>}
              {ready && !output && <p className="console-empty">出招！</p>}
              {output && (
                <>
                  {output.text && <pre className="console-out">{output.text}</pre>}
                  {output.error && <pre className="console-err">⚠ {output.error}</pre>}
                  {output.checked && !output.passed && !output.error && (
                    <pre className="console-err">再战一合！</pre>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
//  Quiz step
// ─────────────────────────────────────────────
function QuizStep({ step, onCorrect, onWrong, onNext }) {
  const [selected, setSelected] = useState(null)
  const [confirmed, setConfirmed] = useState(false)

  function handleConfirm() {
    if (selected === null) return
    setConfirmed(true)
    if (selected === step.answer) onCorrect()
    else onWrong()
  }

  const isRight = confirmed && selected === step.answer

  return (
    <div className="step-quiz">
      <div className="quiz-card">
        <div className="section-tag quiz-tag">兵法问答</div>
        <p className="quiz-question">{step.question}</p>
        <div className="quiz-options">
          {step.options.map((opt, i) => {
            let cls = 'quiz-option'
            if (confirmed) {
              if (i === step.answer) cls += ' quiz-option--correct'
              else if (i === selected) cls += ' quiz-option--wrong'
            } else if (i === selected) cls += ' quiz-option--selected'
            return (
              <button key={i} className={cls} disabled={confirmed} onClick={() => setSelected(i)}>
                <span className="quiz-option-idx">{['甲','乙','丙','丁'][i]}</span>{opt}
              </button>
            )
          })}
        </div>
        {!confirmed && (
          <button className="btn-quiz-confirm" disabled={selected === null} onClick={handleConfirm}>
            确认作答
          </button>
        )}
        {confirmed && (
          <>
            <div className={`quiz-result ${isRight ? 'quiz-result--right' : 'quiz-result--wrong'}`}>
              <div className="quiz-result-icon">{isRight ? '✓' : '✗'}</div>
              <div className="quiz-result-explain">{step.explain}</div>
            </div>
            <div className="step-action-bar" style={{ marginTop: 16 }}>
              <button className="btn-continue" onClick={onNext}>继续 →</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  Session complete overlay
// ─────────────────────────────────────────────
function SessionComplete({ chapter, meritGained, prevRankName, currentRankName, onBack }) {
  const rankUp = prevRankName !== currentRankName
  return (
    <div className="session-complete">
      <Confetti />
      <div className="session-complete-card">
        <div className="session-complete-emoji">{chapter.emoji}</div>
        <h2 className="session-complete-title">战役完毕！</h2>
        <p className="session-complete-chapter">{chapter.name}</p>
        <div className="session-merit-gain">
          <span className="session-merit-icon">⚔</span>
          <span className="session-merit-num">+{meritGained} 战功</span>
        </div>
        {rankUp && (
          <div className="session-rankup">
            <div className="rankup-label">军衔晋升</div>
            <div className="rankup-names">{prevRankName} → <strong>{currentRankName}</strong></div>
          </div>
        )}
        <div className="session-seal">印</div>
        <button className="btn-back-map" onClick={onBack}>返回战役地图</button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  Main GameScreen
// ─────────────────────────────────────────────
export default function GameScreen({
  chapter, pyStatus, run, progress, rank,
  onStepComplete, onCorrect, onWrong, onBack, onSessionEnd,
}) {
  const steps = chapter.steps
  const firstIncomplete = steps.findIndex((s) => !progress.completedSteps[s.id])
  const startIdx = firstIncomplete === -1 ? 0 : firstIncomplete

  const [stepIdx, setStepIdx]             = useState(startIdx)
  const [sessionMerit, setSessionMerit]   = useState(0)
  const [sessionDone, setSessionDone]     = useState(firstIncomplete === -1)
  const [sessionFlawless, setFlawless]    = useState(true)
  const [prevRankName]                    = useState(rank.name)
  const [combo, setCombo]                 = useState(0)
  const [zanFlash, setZanFlash]           = useState(false)
  const [shake, setShake]                 = useState(false)
  const [wonStep, setWonStep]             = useState(false)

  const step = steps[Math.min(stepIdx, steps.length - 1)]

  function triggerZan() { setZanFlash(true); setTimeout(() => setZanFlash(false), 700) }
  function triggerShake() { setShake(true); setTimeout(() => setShake(false), 500) }

  function advanceStep() {
    setWonStep(false)
    if (stepIdx < steps.length - 1) {
      setStepIdx(i => i + 1)
    } else {
      onSessionEnd?.({ chapterId: chapter.id, flawless: sessionFlawless, merit: sessionMerit })
      setSessionDone(true)
    }
  }

  function handleTeachNext() {
    const s = steps[stepIdx]
    if (!progress.completedSteps[s.id]) {
      setSessionMerit(m => m + 10)
      onStepComplete(s.id, 'teach', s.topicId)
    }
    advanceStep()
  }

  function handleChallengePass() {
    const s = steps[stepIdx]
    if (!progress.completedSteps[s.id]) {
      const gain = s.type === 'project' ? 50 : 30
      setSessionMerit(m => m + gain)
      onStepComplete(s.id, s.type, s.topicId)
    }
    setCombo(c => c + 1)
    triggerZan()
    onCorrect(step.topicId)
    setWonStep(true)
  }

  function handleChallengeFail() {
    setCombo(0); triggerShake(); onWrong(step.topicId); setFlawless(false)
  }

  function handleBossPass() {
    const s = steps[stepIdx]
    if (!progress.completedSteps[s.id]) {
      setSessionMerit(m => m + 60)
      onStepComplete(s.id, 'boss', null)
    }
    setCombo(c => c + 3)
    triggerZan()
    setWonStep(true)
  }

  function handleBossHit() { triggerZan(); onCorrect(null) }
  function handleBossDefend() { triggerShake(); onWrong(null); setFlawless(false) }

  function handleQuizCorrect() {
    const s = steps[stepIdx]
    if (!progress.completedSteps[s.id]) {
      setSessionMerit(m => m + 20)
      onStepComplete(s.id, 'quiz', null)
    }
    setCombo(c => c + 1)
    triggerZan()
    onCorrect(null)
  }

  function handleQuizWrong() { setCombo(0); triggerShake(); onWrong(null) }
  function handleQuizNext() { advanceStep() }

  if (sessionDone) {
    return (
      <SessionComplete
        chapter={chapter} meritGained={sessionMerit}
        prevRankName={prevRankName} currentRankName={rank.name}
        onBack={onBack}
      />
    )
  }

  const progressPct = Math.round((stepIdx / steps.length) * 100)
  const typeLabel = { teach: '📖 兵法讲解', challenge: '⚔ 实战出击', quiz: '🎯 问答', project: '🏆 综合项目', boss: '💀 BOSS战' }

  return (
    <div className="game">
      {zanFlash && <div className="zan-overlay" aria-hidden="true"><span className="zan-text">斩！</span></div>}
      {combo >= 2 && !zanFlash && (
        <div className="combo-badge" aria-live="polite">連 ×{combo}!</div>
      )}

      <div className="game-bar">
        <button className="back-btn" onClick={onBack}>← 战役地图</button>
        <div className="game-chapter-info">
          <span className="game-chapter-emoji">{chapter.emoji}</span>
          <span className="game-chapter-name">{chapter.name}</span>
        </div>
        <div className="session-progress-wrap">
          <div className="session-progress-track">
            <div className="session-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="session-progress-label">{stepIdx}/{steps.length}</span>
        </div>
      </div>

      {/* Mission label */}
      {step.missionTitle && (
        <div className="mission-label">◈ {step.missionTitle}</div>
      )}

      <div className="step-header">
        <div className={`step-type-tag step-type-tag--${step.type}`}>{typeLabel[step.type]}</div>
        <h2 className="step-title">{step.title}</h2>
      </div>

      {step.type === 'teach' && (
        <TeachStep key={step.id} step={step} run={run} pyStatus={pyStatus} onNext={handleTeachNext} />
      )}

      {(step.type === 'challenge' || step.type === 'project') && !wonStep && (
        <ChallengeStep
          key={step.id} step={step} run={run} pyStatus={pyStatus}
          onPass={handleChallengePass} onFail={handleChallengeFail} shake={shake}
        />
      )}
      {(step.type === 'challenge' || step.type === 'project') && wonStep && (
        <div className="win-card-inline">
          <div className="win-icon">🎉</div>
          <h3 className="win-title">出色！</h3>
          <p className="win-reward">{step.reward}</p>
          <div className="win-merit">+{step.type === 'project' ? 50 : 30} 战功</div>
          <button className="btn-continue" onClick={advanceStep}>继续前进 →</button>
        </div>
      )}

      {step.type === 'boss' && !wonStep && (
        <BossStep
          key={step.id} step={step} run={run} pyStatus={pyStatus}
          onPass={handleBossPass} onHit={handleBossHit} onDefend={handleBossDefend}
        />
      )}
      {step.type === 'boss' && wonStep && (
        <div className="win-card-inline boss-victory">
          <div className="win-icon">🏆</div>
          <h3 className="win-title boss-victory-title">BOSS 击破！</h3>
          <p className="win-reward">{step.reward}</p>
          <div className="win-merit">+60 战功 · COMBO ×{combo}</div>
          <button className="btn-continue" onClick={advanceStep}>凯旋 →</button>
        </div>
      )}

      {step.type === 'quiz' && (
        <QuizStep
          key={step.id} step={step}
          onCorrect={handleQuizCorrect} onWrong={handleQuizWrong} onNext={handleQuizNext}
        />
      )}
    </div>
  )
}
