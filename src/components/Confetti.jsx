const PIECES = Array.from({ length: 40 })
const EMOJIS = ['⚔️', '🏹', '🔥', '✨', '🌟', '💥', '🐉', '🏆', '⚡', '🎊']

export default function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      {PIECES.map((_, i) => {
        const left = Math.random() * 100
        const delay = Math.random() * 0.5
        const dur = 1.4 + Math.random() * 1.4
        const emoji = EMOJIS[i % EMOJIS.length]
        const rot = (Math.random() * 2 - 1) * 540
        return (
          <span
            key={i}
            className="confetti-piece"
            style={{
              left: `${left}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${dur}s`,
              '--rot': `${rot}deg`,
            }}
          >
            {emoji}
          </span>
        )
      })}
    </div>
  )
}
