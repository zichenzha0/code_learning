import { useState, useMemo } from 'react'
import { getStepsByTopicId, TOPICS } from '../lessons.js'
import CodeEditor from './CodeEditor.jsx'

function DrillChallenge({ step, run, pyStatus, onPass, onFail }) {
  const [code, setCode] = useState(step.starter || '')
  const [output, setOutput] = useState(null)

  function execute() {
    if (pyStatus !== 'ready') return
    const res = run(code, step.test || '')
    let passed
    if (step.test) passed = res.passed === true
    else passed = !res.err && res.out.trim() === (step.expect || '').trim()
    setOutput({ text: res.out, error: res.err, passed })
    if (passed) onPass()
    else onFail()
  }

  return (
    <div className="drill-challenge">
      <div className="drill-task">{step.task}</div>
      {step.expect && (
        <div className="expected-out">
          <span className="expected-label">期望输出</span>
          <pre className="expected-pre">{step.expect}</pre>
        </div>
      )}
      <div className="workbench" style={{ marginTop: 12 }}>
        <div className="workbench-head">
          <span className="dot dot-r" /><span className="dot dot-y" /><span className="dot dot-g" />
          <span className="workbench-file">drill.py</span>
        </div>
        <CodeEditor value={code} onChange={setCode} />
        <div className="workbench-actions">
          <button className="btn-run" disabled={pyStatus !== 'ready'} onClick={execute}>✓ 验证</button>
        </div>
        <div className="console">
          <div className="console-head">输出</div>
          {pyStatus !== 'ready' && <p className="console-loading">引擎热身…</p>}
          {!output && pyStatus === 'ready' && <p className="console-empty">写好后点验证。</p>}
          {output && (
            <>
              {output.text && <pre className="console-out">{output.text}</pre>}
              {output.error && <pre className="console-err">⚠ {output.error}</pre>}
              {!output.passed && !output.error && <pre className="console-err">再战一合！</pre>}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DailyDrill({ weakTopics, run, pyStatus, onStepDone, onBack }) {
  // Pick up to 6 challenge/quiz steps from weak topics
  const drillSteps = useMemo(() => {
    const candidates = weakTopics.flatMap(tid =>
      getStepsByTopicId(tid).filter(s => s.type === 'challenge' || s.type === 'quiz')
    )
    // shuffle
    const shuffled = [...candidates].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 6)
  }, [weakTopics])

  const [idx, setIdx]       = useState(0)
  const [correct, setCorrect] = useState(0)
  const [done, setDone]     = useState(false)
  const [quizSel, setQuizSel] = useState(null)
  const [quizConfirmed, setQuizConfirmed] = useState(false)

  if (drillSteps.length === 0) {
    return (
      <div className="drill-container">
        <div className="drill-header">
          <button className="back-btn" onClick={onBack}>← 返回</button>
          <h2 className="drill-title">每日操练</h2>
        </div>
        <div className="drill-empty">
          <p>🎉 暂无生疏知识点！继续学习新章节，或等待技能自然衰减后再来复习。</p>
          <button className="btn-continue" onClick={onBack}>返回</button>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="drill-container">
        <div className="drill-header">
          <button className="back-btn" onClick={onBack}>← 返回</button>
          <h2 className="drill-title">每日操练</h2>
        </div>
        <div className="drill-done">
          <div className="drill-done-icon">🏆</div>
          <div className="drill-done-title">操练完毕！</div>
          <div className="drill-done-score">{correct} / {drillSteps.length} 题正确</div>
          <p className="drill-done-msg">回炉磨砺，技能强化！</p>
          <button className="btn-back-map" onClick={onBack}>返回战役地图</button>
        </div>
      </div>
    )
  }

  const step = drillSteps[idx]
  const topic = TOPICS[step.topicId]

  function advance() {
    if (idx < drillSteps.length - 1) {
      setIdx(i => i + 1)
      setQuizSel(null)
      setQuizConfirmed(false)
    } else {
      setDone(true)
    }
  }

  function handlePass() { setCorrect(c => c + 1); onStepDone && onStepDone(step.topicId, true) }
  function handleFail() { onStepDone && onStepDone(step.topicId, false) }

  return (
    <div className="drill-container">
      <div className="drill-header">
        <button className="back-btn" onClick={onBack}>← 返回</button>
        <h2 className="drill-title">每日操练</h2>
        <div className="drill-progress">
          <div className="drill-progress-track">
            <div className="drill-progress-fill" style={{ width: `${(idx / drillSteps.length) * 100}%` }} />
          </div>
          <span>{idx + 1}/{drillSteps.length}</span>
        </div>
      </div>

      {topic && (
        <div className="drill-topic-badge">🔄 复习：{topic.name}</div>
      )}

      {step.type === 'challenge' && (
        <>
          <DrillChallenge
            step={step} run={run} pyStatus={pyStatus}
            onPass={() => { handlePass(); setTimeout(advance, 1000) }}
            onFail={handleFail}
          />
          <div className="step-action-bar">
            <button className="btn-ghost-sm" onClick={advance}>跳过</button>
          </div>
        </>
      )}

      {step.type === 'quiz' && (
        <div className="step-quiz" style={{ maxWidth: '100%' }}>
          <div className="quiz-card">
            <p className="quiz-question">{step.question}</p>
            <div className="quiz-options">
              {step.options.map((opt, i) => {
                let cls = 'quiz-option'
                if (quizConfirmed) {
                  if (i === step.answer) cls += ' quiz-option--correct'
                  else if (i === quizSel) cls += ' quiz-option--wrong'
                } else if (i === quizSel) cls += ' quiz-option--selected'
                return (
                  <button key={i} className={cls} disabled={quizConfirmed}
                    onClick={() => setQuizSel(i)}>
                    <span className="quiz-option-idx">{['甲','乙','丙','丁'][i]}</span>{opt}
                  </button>
                )
              })}
            </div>
            {!quizConfirmed && (
              <button className="btn-quiz-confirm" disabled={quizSel === null}
                onClick={() => {
                  setQuizConfirmed(true)
                  if (quizSel === step.answer) handlePass()
                  else handleFail()
                }}>确认</button>
            )}
            {quizConfirmed && (
              <div className={`quiz-result ${quizSel===step.answer?'quiz-result--right':'quiz-result--wrong'}`}>
                <div className="quiz-result-icon">{quizSel===step.answer?'✓':'✗'}</div>
                <div className="quiz-result-explain">{step.explain}</div>
              </div>
            )}
            {quizConfirmed && (
              <div className="step-action-bar" style={{ marginTop: 12 }}>
                <button className="btn-continue" onClick={advance}>继续 →</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
