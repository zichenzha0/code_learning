// BGM manager — local files in public/audio/, silent degradation if missing
export const BGM_MAP = {
  home:  '/audio/theme.mp3',
  ch0:   '/audio/prologue.mp3',
  ch1:   '/audio/yujun.mp3',
  ch2:   '/audio/junling.mp3',
  ch3:   '/audio/liangcao.mp3',
  ch4:   '/audio/changbanpo.mp3',
  ch5:   '/audio/jiejiang.mp3',
  ch6:   '/audio/guiyang.mp3',
  ch7:   '/audio/ruchuan.mp3',
  ch8:   '/audio/hanshui.mp3',
  ch9:   '/audio/jigu.mp3',
  ch10:  '/audio/shunping.mp3',
  ch11:  '/audio/shunping.mp3',
}

const PREF_KEY = 'zhao_yun_audio_v1'

function loadPrefs() {
  try { return { muted: false, volume: 0.35, ...JSON.parse(localStorage.getItem(PREF_KEY) || '{}') } }
  catch { return { muted: false, volume: 0.35 } }
}
function savePrefs(p) {
  try { localStorage.setItem(PREF_KEY, JSON.stringify(p)) } catch {}
}

// ─── Simple global audio state (not React — avoids stale closure hell) ────────
const state = {
  el: null,
  muted: false,
  volume: 0.35,
  unlocked: false,
  curKey: null,
  fadeTimer: null,
}

function init() {
  if (state.el) return
  const prefs = loadPrefs()
  state.muted = prefs.muted
  state.volume = prefs.volume
  const el = new Audio()
  el.loop = true
  el.volume = state.muted ? 0 : state.volume
  state.el = el
}

function effectiveVol() { return state.muted ? 0 : state.volume }

function fadeTo(target, onDone) {
  clearInterval(state.fadeTimer)
  const el = state.el
  if (!el) { onDone?.(); return }
  const step = target > el.volume ? 0.05 : -0.05
  state.fadeTimer = setInterval(() => {
    const nv = Math.max(0, Math.min(1, el.volume + step))
    el.volume = nv
    if ((step > 0 && nv >= target) || (step < 0 && nv <= target)) {
      el.volume = target
      clearInterval(state.fadeTimer)
      onDone?.()
    }
  }, 25)
}

function switchTo(src) {
  const el = state.el
  if (!el) return
  el.volume = 0
  el.src = src
  el.play()
    .then(() => fadeTo(effectiveVol()))
    .catch(() => {}) // file not found — silent
}

// ─── Public API ───────────────────────────────────────────────────────────────
export const audio = {
  unlock() {
    init()
    state.unlocked = true
  },

  playBgm(key) {
    if (!state.unlocked) return
    const src = BGM_MAP[key]
    if (!src) return
    init()
    const el = state.el
    if (!el) return
    if (key === state.curKey && !el.paused) return
    state.curKey = key
    if (!el.paused && el.currentSrc) {
      fadeTo(0, () => switchTo(src))
    } else {
      switchTo(src)
    }
  },

  toggleMute() {
    init()
    state.muted = !state.muted
    if (state.el) state.el.volume = effectiveVol()
    savePrefs({ muted: state.muted, volume: state.volume })
    return state.muted
  },

  setVolume(v) {
    init()
    state.volume = v
    if (state.el && !state.muted) state.el.volume = v
    savePrefs({ muted: state.muted, volume: v })
  },

  get muted() { return state.muted },
  get volume() { return state.volume },
}

// ─── React hook wrapper ───────────────────────────────────────────────────────
import { useState, useCallback } from 'react'

export function useAudio() {
  const [muted,  setMuted]  = useState(loadPrefs().muted)
  const [volume, setVolume] = useState(loadPrefs().volume)

  const playBgm = useCallback((key) => { audio.playBgm(key) }, [])

  function toggleMute() {
    const next = audio.toggleMute()
    setMuted(next)
  }

  function changeVolume(v) {
    audio.setVolume(v)
    setVolume(v)
  }

  function unlock() {
    audio.unlock()
  }

  return { muted, volume, playBgm, toggleMute, changeVolume, unlock }
}
