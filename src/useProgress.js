import { useState } from 'react'
import { rankOf, isChapterComplete, CHAPTERS } from './lessons.js'

const KEY = 'zhao_yun_progress_v2'
const MAX_HP = 5
const MUSOU_PER_CORRECT = 15
const MUSOU_MAX = 100
const SKILL_MAX = 5
const SKILL_DECAY_DAYS = 7   // days before strength decays
const SKILL_WEAK_THRESHOLD = 2

const DEFAULT = {
  completedSteps: {},
  merit: 0,
  hp: MAX_HP,
  musou: 0,
  musouTrigger: 0,
  streak: { count: 0, lastActive: null, freezes: 2 },
  dailyGoal: 30,
  todayMerit: 0,
  lastMeritDate: null,
  dailyGoalHitTrigger: 0,  // increments when daily goal is first hit
  skillStrength: {},  // { [topicId]: { strength:0-5, lastPracticed:'YYYY-MM-DD' } }
  crowns: {},
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function daysBetween(a, b) {
  if (!a || !b) return Infinity
  return Math.round((new Date(b) - new Date(a)) / 86400000)
}

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY))
    if (!raw) return DEFAULT
    return { ...DEFAULT, ...raw, streak: { ...DEFAULT.streak, ...(raw.streak || {}) } }
  } catch {
    return DEFAULT
  }
}

function save(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {}
}

function applyDailyReset(prev) {
  const today = todayStr()
  if (prev.lastMeritDate === today) return prev

  // New day — reset todayMerit, check streak continuity
  const days = daysBetween(prev.streak.lastActive, today)
  let streak = { ...prev.streak }

  if (prev.lastMeritDate && days > 1) {
    // Missed at least one day
    if (streak.freezes > 0) {
      streak = { ...streak, freezes: streak.freezes - 1 }  // freeze consumed, streak held
    } else {
      streak = { ...streak, count: 0 }  // streak broken
    }
  }

  // Decay skill strength for unused topics
  const newSkill = {}
  for (const [tid, val] of Object.entries(prev.skillStrength || {})) {
    const d = daysBetween(val.lastPracticed, today)
    const decay = Math.floor(d / SKILL_DECAY_DAYS)
    newSkill[tid] = { ...val, strength: Math.max(0, val.strength - decay) }
  }

  return {
    ...prev,
    todayMerit: 0,
    lastMeritDate: today,
    streak,
    skillStrength: newSkill,
    dailyGoalHitTrigger: prev.dailyGoalHitTrigger,  // preserve
  }
}

export const MERIT_BY_TYPE = {
  teach:     10,
  challenge: 30,
  quiz:      20,
  project:   50,
  boss:      60,
}

export function useProgress() {
  const [progress, setProgress] = useState(() => applyDailyReset(load()))

  function updateAndSave(updater) {
    setProgress((prev) => {
      const next = updater(applyDailyReset(prev))
      save(next)
      return next
    })
  }

  function completeStep(stepId, stepType, topicId) {
    updateAndSave((prev) => {
      if (prev.completedSteps[stepId]) return prev
      const meritGain = MERIT_BY_TYPE[stepType] ?? 30
      const newMerit = prev.merit + meritGain
      const newTodayMerit = prev.todayMerit + meritGain
      const today = todayStr()

      // Streak update
      const streak = prev.streak.lastActive === today
        ? prev.streak
        : {
            count: prev.streak.lastActive
              ? (daysBetween(prev.streak.lastActive, today) === 1 ? prev.streak.count + 1 : 1)
              : 1,
            lastActive: today,
            freezes: prev.streak.freezes,
          }

      // Streak milestone: award freeze every 7 days
      const newFreezes = streak.count > 0 && streak.count % 7 === 0
        ? Math.min(5, streak.freezes + 1)
        : streak.freezes
      const updatedStreak = { ...streak, freezes: newFreezes }

      // Completed steps
      const newCompleted = { ...prev.completedSteps, [stepId]: true }

      // Crowns
      const newCrowns = { ...prev.crowns }
      for (const ch of CHAPTERS) {
        if (!newCrowns[ch.id] && isChapterComplete(ch.id, newCompleted)) {
          newCrowns[ch.id] = true
        }
      }

      // Skill strength
      const newSkill = { ...prev.skillStrength }
      if (topicId) {
        const cur = newSkill[topicId] || { strength: 0, lastPracticed: null }
        newSkill[topicId] = { strength: Math.min(SKILL_MAX, cur.strength + 1), lastPracticed: today }
      }

      // Daily goal hit trigger
      const hitGoal = prev.todayMerit < prev.dailyGoal && newTodayMerit >= prev.dailyGoal
      const dailyGoalHitTrigger = hitGoal ? prev.dailyGoalHitTrigger + 1 : prev.dailyGoalHitTrigger

      return {
        ...prev,
        completedSteps: newCompleted,
        merit: newMerit,
        todayMerit: newTodayMerit,
        lastMeritDate: today,
        streak: updatedStreak,
        crowns: newCrowns,
        skillStrength: newSkill,
        dailyGoalHitTrigger,
      }
    })
  }

  function awardCorrect(topicId) {
    updateAndSave((prev) => {
      const newMusou = prev.musou + MUSOU_PER_CORRECT
      const triggered = newMusou >= MUSOU_MAX
      const newSkill = { ...prev.skillStrength }
      if (topicId) {
        const cur = newSkill[topicId] || { strength: 0, lastPracticed: null }
        newSkill[topicId] = {
          strength: Math.min(SKILL_MAX, cur.strength + 0.5),  // partial gain for non-completion
          lastPracticed: todayStr(),
        }
      }
      return {
        ...prev,
        musou: triggered ? 0 : newMusou,
        musouTrigger: triggered ? prev.musouTrigger + 1 : prev.musouTrigger,
        skillStrength: newSkill,
      }
    })
  }

  function penalizeWrong(topicId) {
    updateAndSave((prev) => {
      const newSkill = { ...prev.skillStrength }
      if (topicId) {
        const cur = newSkill[topicId] || { strength: 0, lastPracticed: null }
        newSkill[topicId] = {
          strength: Math.max(0, cur.strength - 0.5),
          lastPracticed: todayStr(),
        }
      }
      return {
        ...prev,
        hp: Math.max(0, prev.hp - 1),
        musou: 0,
        skillStrength: newSkill,
      }
    })
  }

  function useFreeze() {
    updateAndSave((prev) => {
      if (prev.streak.freezes <= 0) return prev
      return {
        ...prev,
        streak: { ...prev.streak, freezes: prev.streak.freezes - 1 },
      }
    })
  }

  function setDailyGoal(n) {
    updateAndSave((prev) => ({ ...prev, dailyGoal: n }))
  }

  function recoverHp() {
    updateAndSave((prev) => ({ ...prev, hp: Math.min(MAX_HP, prev.hp + 1) }))
  }

  function reset() {
    const fresh = { ...DEFAULT }
    save(fresh)
    setProgress(fresh)
  }

  // Derived
  const rank = rankOf(progress.merit)

  function getWeakTopics() {
    return Object.entries(progress.skillStrength || {})
      .filter(([, v]) => v.strength < SKILL_WEAK_THRESHOLD)
      .map(([id]) => id)
  }

  function getSkillLevel(topicId) {
    const s = progress.skillStrength?.[topicId]
    if (!s) return 'unknown'
    if (s.strength >= 4) return 'mastered'
    if (s.strength >= SKILL_WEAK_THRESHOLD) return 'learned'
    return 'weak'
  }

  return {
    progress,
    rank,
    completeStep,
    awardCorrect,
    penalizeWrong,
    useFreeze,
    setDailyGoal,
    recoverHp,
    reset,
    getWeakTopics,
    getSkillLevel,
    MAX_HP,
    SKILL_WEAK_THRESHOLD,
  }
}
