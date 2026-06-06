// 常山赵子龙 · Python 兵法 —— 主数据入口
import { ACT0 }     from './content/act0.js'
import { ACT1 }     from './content/act1.js'
import { ACT2 }     from './content/act2.js'
import { ACT3 }     from './content/act3.js'
import { ACT4 }     from './content/act4.js'
import { ACT5 }     from './content/act5.js'
import { ACT6 }     from './content/act6.js'
import { ACT7 }     from './content/act7.js'
import { ACT8 }     from './content/act8.js'
import { ACT9 }     from './content/act9.js'
import { ACT10 }    from './content/act10.js'
import { ACT_FINAL } from './content/actFinal.js'

// ─── 军衔体系 ────────────────────────────────────────────────
export const RANKS = [
  { name: '白身',     min: 0,    title: '初出茅庐' },
  { name: '牙门将军', min: 200,  title: '长坂威名' },
  { name: '翊军将军', min: 500,  title: '入川功勋' },
  { name: '虎威将军', min: 900,  title: '汉水胆魄' },
  { name: '镇东将军', min: 1400, title: '北伐忠义' },
  { name: '顺平侯',   min: 2000, title: '功名永垂' },
]

export function rankOf(merit) {
  let r = RANKS[0]
  for (const rank of RANKS) {
    if (merit >= rank.min) r = rank
  }
  return r
}

// ─── 章节 / 幕 列表 ──────────────────────────────────────────
export const CHAPTERS = [
  ACT0, ACT1, ACT2, ACT3, ACT4, ACT5,
  ACT6, ACT7, ACT8, ACT9, ACT10, ACT_FINAL,
]

// ─── 工具函数 ─────────────────────────────────────────────────
export function getAllSteps() {
  return CHAPTERS.flatMap((ch) => ch.steps)
}

export function getChapterSteps(chapterId) {
  return CHAPTERS.find((ch) => ch.id === chapterId)?.steps ?? []
}

export function isChapterComplete(chapterId, completedSteps) {
  const steps = getChapterSteps(chapterId)
  return steps.length > 0 && steps.every((s) => completedSteps[s.id])
}

export function isChapterUnlocked(chapterId, completedSteps) {
  const idx = CHAPTERS.findIndex((c) => c.id === chapterId)
  if (idx === 0) return true
  return isChapterComplete(CHAPTERS[idx - 1].id, completedSteps)
}

export function getStepsByTopicId(topicId) {
  return getAllSteps().filter((s) => s.topicId === topicId)
}

// ─── 知识点体系（兵法全书） ───────────────────────────────────
export const TOPICS = {
  // 基础入门
  'py-print':           { name: 'print() 函数',           cat: 'basic' },
  'py-comments':        { name: '注释 #',                  cat: 'basic' },
  'py-print-sep-end':   { name: 'print sep / end',         cat: 'basic' },
  // 变量与类型
  'py-variables':       { name: '变量',                    cat: 'variables' },
  'py-multi-assign':    { name: '多重赋值',                cat: 'variables' },
  'py-data-types':      { name: '数据类型 type()',          cat: 'variables' },
  'py-casting':         { name: '类型转换 Casting',        cat: 'variables' },
  'py-numbers':         { name: '数字 int/float',          cat: 'variables' },
  'py-bool':            { name: '布尔 bool',               cat: 'variables' },
  // 字符串
  'py-str-basic':       { name: '字符串基础',              cat: 'strings' },
  'py-str-slice':       { name: '索引与切片',              cat: 'strings' },
  'py-str-methods':     { name: '字符串方法',              cat: 'strings' },
  'py-str-split-join':  { name: 'split / join',            cat: 'strings' },
  'py-str-fstring':     { name: 'f-string / format()',     cat: 'strings' },
  'py-str-escape':      { name: '转义字符',                cat: 'strings' },
  'py-str-membership':  { name: 'in / len()',              cat: 'strings' },
  // 运算符
  'py-arithmetic':      { name: '算术运算符',              cat: 'operators' },
  'py-assignment-ops':  { name: '赋值运算符',              cat: 'operators' },
  'py-comparison':      { name: '比较运算符',              cat: 'operators' },
  'py-logical':         { name: '逻辑运算符 and/or/not',  cat: 'operators' },
  'py-identity-is':     { name: '身份运算符 is',           cat: 'operators' },
  'py-membership-in':   { name: '成员运算符 in',           cat: 'operators' },
  'py-precedence':      { name: '运算符优先级',            cat: 'operators' },
  // 条件
  'py-if-else':         { name: 'if / else',               cat: 'control' },
  'py-elif':            { name: 'elif 多路分支',           cat: 'control' },
  'py-nested-if':       { name: '嵌套 if',                 cat: 'control' },
  'py-ternary':         { name: '三元表达式',              cat: 'control' },
  // 循环
  'py-while':           { name: 'while 循环',              cat: 'loops' },
  'py-for-range':       { name: 'for / range()',            cat: 'loops' },
  'py-break-continue':  { name: 'break / continue',        cat: 'loops' },
  'py-enumerate-zip':   { name: 'enumerate / zip',         cat: 'loops' },
  'py-loop-else':       { name: 'loop else / pass',        cat: 'loops' },
  'py-nested-loops':    { name: '嵌套循环',                cat: 'loops' },
  // 数据结构
  'py-list-basics':     { name: '列表基础',                cat: 'data' },
  'py-list-methods':    { name: '列表方法 append/remove', cat: 'data' },
  'py-list-sort':       { name: '列表排序与遍历',          cat: 'data' },
  'py-tuple':           { name: '元组 tuple',              cat: 'data' },
  'py-set':             { name: '集合 set',                cat: 'data' },
  'py-dict-basics':     { name: '字典 dict',               cat: 'data' },
  'py-dict-methods':    { name: '字典遍历与嵌套',          cat: 'data' },
  'py-dict-comprehension': { name: '推导式',              cat: 'data' },
  // 函数
  'py-def':             { name: 'def / return',            cat: 'functions' },
  'py-params':          { name: '参数与默认参数',          cat: 'functions' },
  'py-keyword-args':    { name: '关键字参数',              cat: 'functions' },
  'py-args-kwargs':     { name: '*args / **kwargs',        cat: 'functions' },
  'py-scope':           { name: '作用域 local/global',     cat: 'functions' },
  'py-lambda':          { name: 'lambda',                  cat: 'functions' },
  'py-map-filter':      { name: 'map / filter',            cat: 'functions' },
  'py-recursion':       { name: '递归（选）',              cat: 'functions' },
  // 模块与异常
  'py-import-math':     { name: 'import math',             cat: 'modules' },
  'py-import-random':   { name: 'import random',           cat: 'modules' },
  'py-import-datetime': { name: 'import datetime',         cat: 'modules' },
  'py-try-except':      { name: 'try / except',            cat: 'modules' },
  'py-try-else-finally':{ name: 'else / finally',          cat: 'modules' },
  'py-json':            { name: 'json 模块',               cat: 'modules' },
  // 面向对象
  'py-class':           { name: 'class / __init__',        cat: 'oop' },
  'py-class-methods':   { name: '属性与方法',              cat: 'oop' },
  'py-inheritance':     { name: '继承 / super()',          cat: 'oop' },
  'py-polymorphism':    { name: '多态 / __str__',          cat: 'oop' },
  'py-iterator':        { name: '迭代器（选）',            cat: 'oop' },
  // 进阶
  'py-regex':           { name: '正则 re（简介）',         cat: 'advanced' },
  'py-str-format-advanced': { name: '格式化进阶',         cat: 'advanced' },
  'py-pep8':            { name: 'PEP8 风格',              cat: 'advanced' },
}

export const TOPIC_CATEGORIES = [
  { id: 'basic',     name: '基础入门',   emoji: '🚀' },
  { id: 'variables', name: '变量与类型', emoji: '📦' },
  { id: 'strings',   name: '字符串',     emoji: '📝' },
  { id: 'operators', name: '运算符',     emoji: '⚖️' },
  { id: 'control',   name: '条件判断',   emoji: '🔀' },
  { id: 'loops',     name: '循环',       emoji: '🔄' },
  { id: 'data',      name: '数据结构',   emoji: '📦' },
  { id: 'functions', name: '函数',       emoji: '⚙️' },
  { id: 'modules',   name: '模块与异常', emoji: '🛡️' },
  { id: 'oop',       name: '面向对象',   emoji: '🏛️' },
  { id: 'advanced',  name: '进阶补遗',   emoji: '📚' },
]
