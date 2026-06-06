import { useState, useMemo } from 'react'
import { TOPICS, TOPIC_CATEGORIES, getStepsByTopicId } from '../lessons.js'

function SkillDot({ level }) {
  const cls = { mastered: 'skill-dot--gold', learned: 'skill-dot--green', weak: 'skill-dot--red', unknown: 'skill-dot--gray' }
  const label = { mastered: '精熟', learned: '已学', weak: '生疏', unknown: '未学' }
  return <span className={`skill-dot ${cls[level] || 'skill-dot--gray'}`} title={label[level]} />
}

export default function KnowledgeBook({ getSkillLevel, onBack, onRunTeach }) {
  const [activeCat, setActiveCat] = useState('basic')
  const [search, setSearch] = useState('')
  const [expandedTopic, setExpandedTopic] = useState(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return Object.entries(TOPICS).filter(([id, t]) => {
      const matchCat = !search && t.cat === activeCat
      const matchSearch = search && (t.name.toLowerCase().includes(q) || id.includes(q))
      return matchCat || matchSearch
    })
  }, [activeCat, search])

  function handleTopicClick(id) {
    setExpandedTopic(expandedTopic === id ? null : id)
  }

  const steps = expandedTopic ? getStepsByTopicId(expandedTopic) : []
  const teachStep = steps.find(s => s.type === 'teach')

  return (
    <div className="kb-container">
      <div className="kb-header">
        <button className="back-btn" onClick={onBack}>← 地图</button>
        <h2 className="kb-title">📖 兵法全书</h2>
        <input
          className="kb-search"
          type="text"
          placeholder="搜索知识点…"
          value={search}
          onChange={e => { setSearch(e.target.value); setExpandedTopic(null) }}
        />
      </div>

      <div className="kb-body">
        {/* Left nav */}
        {!search && (
          <nav className="kb-nav">
            {TOPIC_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className={`kb-nav-item${activeCat === cat.id ? ' kb-nav-item--active' : ''}`}
                onClick={() => { setActiveCat(cat.id); setExpandedTopic(null) }}
              >
                <span>{cat.emoji}</span> {cat.name}
              </button>
            ))}
          </nav>
        )}

        {/* Topic list */}
        <div className="kb-main">
          {search && filtered.length === 0 && (
            <p className="kb-empty">未找到匹配的知识点。</p>
          )}
          <div className="kb-topic-list">
            {filtered.map(([id, topic]) => {
              const level = getSkillLevel(id)
              const isOpen = expandedTopic === id
              return (
                <div key={id} className={`kb-topic${isOpen ? ' kb-topic--open' : ''}`}>
                  <button className="kb-topic-header" onClick={() => handleTopicClick(id)}>
                    <SkillDot level={level} />
                    <span className="kb-topic-name">{topic.name}</span>
                    <span className="kb-topic-arrow">{isOpen ? '▲' : '▼'}</span>
                  </button>

                  {isOpen && teachStep && (
                    <div className="kb-topic-body">
                      <p className="kb-blurb">{teachStep.blurb}</p>
                      {teachStep.syntax && (
                        <pre className="kb-syntax">{teachStep.syntax}</pre>
                      )}
                      {teachStep.note && (
                        <div className="kb-note">
                          <span>※ </span>{teachStep.note}
                        </div>
                      )}
                      {onRunTeach && (
                        <button className="kb-go-btn" onClick={() => onRunTeach(id)}>
                          前往练习 →
                        </button>
                      )}
                    </div>
                  )}
                  {isOpen && !teachStep && (
                    <div className="kb-topic-body">
                      <p className="kb-empty">（尚无详情）</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="kb-legend">
            <span><span className="skill-dot skill-dot--gold" />精熟</span>
            <span><span className="skill-dot skill-dot--green" />已学</span>
            <span><span className="skill-dot skill-dot--red" />生疏（建议复习）</span>
            <span><span className="skill-dot skill-dot--gray" />未学</span>
          </div>
        </div>
      </div>
    </div>
  )
}
