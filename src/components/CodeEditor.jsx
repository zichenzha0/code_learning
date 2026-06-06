import { useRef } from 'react'

export default function CodeEditor({ value, onChange }) {
  const taRef = useRef(null)

  function handleKeyDown(e) {
    // Tab 键插入 4 个空格，而不是跳出编辑框
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = taRef.current
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const next = value.slice(0, start) + '    ' + value.slice(end)
      onChange(next)
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4
      })
    }
    // 回车后自动保留上一行的缩进
    if (e.key === 'Enter') {
      const ta = taRef.current
      const start = ta.selectionStart
      const lineStart = value.lastIndexOf('\n', start - 1) + 1
      const prevLine = value.slice(lineStart, start)
      const indentMatch = prevLine.match(/^[ ]*/)
      let indent = indentMatch ? indentMatch[0] : ''
      if (prevLine.trim().endsWith(':')) indent += '    '
      if (indent) {
        e.preventDefault()
        const next = value.slice(0, start) + '\n' + indent + value.slice(ta.selectionEnd)
        onChange(next)
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + 1 + indent.length
        })
      }
    }
  }

  const lineCount = value.split('\n').length

  return (
    <div className="editor">
      <div className="editor-gutter" aria-hidden="true">
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <textarea
        ref={taRef}
        className="editor-area"
        value={value}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  )
}
