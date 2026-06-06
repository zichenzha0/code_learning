import { useEffect, useRef, useState } from 'react'

// Python "裁判"：在干净的命名空间里运行学习者的代码，捕获输出和错误，
// 如果有测试代码就跑断言。每次运行互不污染。
const HARNESS = `
import io, contextlib, traceback

def _judge(user_code, test_code):
    ns = {}
    buf = io.StringIO()
    res = {"out": "", "err": "", "passed": None}
    # 1) 跑学习者的代码
    try:
        with contextlib.redirect_stdout(buf):
            exec(user_code, ns)
    except Exception:
        res["out"] = buf.getvalue()
        lines = traceback.format_exc().strip().splitlines()
        res["err"] = lines[-1] if lines else "出错了"
        return res
    res["out"] = buf.getvalue()
    # 2) 如果有测试，跑断言
    if test_code:
        try:
            with contextlib.redirect_stdout(io.StringIO()):
                exec(test_code, ns)
            res["passed"] = True
        except AssertionError as e:
            res["passed"] = False
            res["err"] = "差一点点：" + (str(e) if str(e) else "结果还不太对，再看看提示吧")
        except Exception:
            res["passed"] = False
            lines = traceback.format_exc().strip().splitlines()
            res["err"] = lines[-1] if lines else "出错了"
    return res

_judge
`

export function usePyodide() {
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'
  const judgeRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    let timer = null

    async function init() {
      try {
        const py = await window.loadPyodide()
        const judge = py.runPython(HARNESS)
        if (cancelled) return
        judgeRef.current = judge
        setStatus('ready')
      } catch (e) {
        console.error('Pyodide 加载失败：', e)
        if (!cancelled) setStatus('error')
      }
    }

    if (window.loadPyodide) {
      init()
    } else {
      // 等 index.html 里的 Pyodide 脚本加载完
      timer = setInterval(() => {
        if (window.loadPyodide) {
          clearInterval(timer)
          init()
        }
      }, 150)
    }
    return () => {
      cancelled = true
      if (timer) clearInterval(timer)
    }
  }, [])

  function run(code, testCode = '') {
    if (!judgeRef.current) return { out: '', err: '引擎还在热身，请稍候…', passed: false }
    const proxy = judgeRef.current(code, testCode)
    const obj = proxy.toJs({ dict_converter: Object.fromEntries })
    proxy.destroy()
    return { out: obj.out || '', err: obj.err || '', passed: obj.passed }
  }

  return { status, run }
}
