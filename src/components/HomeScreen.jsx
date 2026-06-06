import { useState } from 'react'

export default function HomeScreen({ progress, rank, muted, toggleMute, onStart, onBook }) {
  const [heroErr, setHeroErr]   = useState(false)
  const [portErr, setPortErr]   = useState(false)
  const streak = progress.streak?.count ?? 0

  function handleStart() {
    onStart()
  }

  return (
    <div className="home">
      {/* Full-screen background */}
      {!heroErr
        ? <img className="home-bg-img" src="/images/hero.jpg" alt="" onError={() => setHeroErr(true)} />
        : <div className="home-bg-fallback" />
      }
      {/* Gradient overlay — heavier on left for legibility, lighter on right */}
      <div className="home-bg-overlay" />

      {/* Thin status bar */}
      <div className="home-topbar">
        <span className="home-tb-rank">{rank.name}</span>
        <span className="home-tb-sep">·</span>
        <span className="home-tb-merit">⚔ {progress.merit}</span>
        {streak > 0 && (
          <>
            <span className="home-tb-sep">·</span>
            <span className="home-tb-streak">🔥 {streak}天连战</span>
          </>
        )}
        <span className="home-tb-spacer" />
        <button className="home-audio-btn" onClick={toggleMute} title={muted ? '开启音乐' : '静音'}>
          {muted ? '🔇' : '🎵'}
        </button>
      </div>

      {/* Main content row */}
      <div className="home-content">
        {/* Left: text + buttons */}
        <div className="home-left">
          <p className="home-eyebrow">Dynasty Warriors · Python 兵法</p>
          <h1 className="home-title">常山赵子龙</h1>
          <p className="home-tagline">一骑当千，在沙场上学会 Python。</p>

          <button className="home-start-btn" onClick={handleStart}>
            开始征战 →
          </button>

          <div className="home-sub-actions">
            <button className="home-sub-btn" onClick={onBook}>📖 兵法全书</button>
          </div>

          <div className="home-lore">
            「以忠贞之性，吐诚之行，感动华夷，著于来世。」
          </div>
        </div>

        {/* Right: portrait */}
        <div className="home-right">
          {!portErr
            ? <img className="home-portrait" src="/images/zhaoyun.jpg" alt="赵云"
                onError={() => setPortErr(true)} />
            : <div className="home-portrait-fallback">⚔</div>
          }
        </div>
      </div>
    </div>
  )
}
