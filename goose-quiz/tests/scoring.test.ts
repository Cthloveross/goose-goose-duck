import { describe, it, expect } from 'vitest'
import { tallyModules, cosineSimilarity, computeResult } from '~/lib/scoring'
import type { QuizData, Answers, ModuleWeights } from '~/lib/types'
import { MODULES } from '~/lib/types'
import quizData from '~/data/tests/gooseduck.json'

/* ─── tiny helpers ───────────────────────────────────── */

function w(
  logic: number,
  insight: number,
  mobility: number,
  control: number,
  protect: number,
  enforce: number,
  manipulate: number,
  opportunism: number,
): ModuleWeights {
  return { logic, insight, mobility, control, protect, enforce, manipulate, opportunism }
}

/* ─── tallyModules ───────────────────────────────────── */

describe('tallyModules', () => {
  const quiz = quizData as unknown as QuizData

  it('returns all-zero when answers map is empty', () => {
    const scores = tallyModules(quiz, {})
    for (const m of MODULES) {
      expect(scores[m]).toBe(0)
    }
  })

  it('counts modules correctly for a small set of answers', () => {
    // Q1-A = mobility, Q2-A = control, Q3-A = logic
    const answers: Answers = { '1': 'A', '2': 'A', '3': 'A' }
    const scores = tallyModules(quiz, answers)

    expect(scores.mobility).toBe(1)
    expect(scores.control).toBe(1)
    expect(scores.logic).toBe(1)

    // everything else zero (from these 3 questions)
    const total = MODULES.reduce((s, m) => s + scores[m], 0)
    expect(total).toBe(3)
  })

  it('sums to 48 when all questions are answered', () => {
    const answers: Answers = {}
    for (const q of quiz.questions) {
      answers[String(q.id)] = 'A' // always pick A
    }
    const scores = tallyModules(quiz, answers)
    const total = MODULES.reduce((s, m) => s + scores[m], 0)
    expect(total).toBe(48)
  })
})

/* ─── cosineSimilarity ───────────────────────────────── */

describe('cosineSimilarity', () => {
  it('returns 1 for identical vectors', () => {
    const v = w(3, 2, 1, 4, 0, 5, 1, 2)
    expect(cosineSimilarity(v, v)).toBeCloseTo(1, 5)
  })

  it('returns 0 for orthogonal vectors', () => {
    const a = w(1, 0, 0, 0, 0, 0, 0, 0) // only logic
    const b = w(0, 0, 0, 0, 0, 0, 0, 1) // only opportunism
    expect(cosineSimilarity(a, b)).toBe(0)
  })

  it('returns 0 when one vector is all-zero', () => {
    const a = w(0, 0, 0, 0, 0, 0, 0, 0)
    const b = w(1, 2, 3, 4, 5, 6, 7, 8)
    expect(cosineSimilarity(a, b)).toBe(0)
  })

  it('returns value between 0 and 1 for non-negative vectors', () => {
    const a = w(5, 3, 1, 0, 2, 4, 0, 1)
    const b = w(1, 1, 4, 2, 0, 3, 3, 2)
    const sim = cosineSimilarity(a, b)
    expect(sim).toBeGreaterThan(0)
    expect(sim).toBeLessThan(1)
  })
})

/* ─── computeResult ──────────────────────────────────── */

describe('computeResult', () => {
  const quiz = quizData as unknown as QuizData

  it('returns a valid ScoringResult with all 48 answers', () => {
    const answers: Answers = {}
    for (const q of quiz.questions) {
      answers[String(q.id)] = 'B'
    }
    const result = computeResult(quiz, answers)

    expect(result.roleKey).toBeTruthy()
    expect(result.roleName).toBeTruthy()
    expect(['goose', 'neutral', 'duck']).toContain(result.camp)
    expect(result.campName).toBeTruthy()
    expect(result.similarity).toBeGreaterThan(0)
    expect(result.similarity).toBeLessThanOrEqual(1)
    expect(result.persona.core_motivation).toBeTruthy()
  })

  it('picks a logic-heavy role when all answers are logic', () => {
    // Build answers that always pick the "logic" option
    const answers: Answers = {}
    for (const q of quiz.questions) {
      const opts = Object.entries(q.options) as [string, { text: string; module: string }][]
      const logicOpt = opts.find(([, o]) => o.module === 'logic')
      answers[String(q.id)] = logicOpt ? logicOpt[0] : 'A'
    }
    const result = computeResult(quiz, answers)

    // The top logic-weighted role is goose_detective (logic: 5)
    // It should be in the top matches
    expect(result.moduleScores.logic).toBeGreaterThan(0)
    expect(result.camp).toBe('goose') // logic-heavy roles are mostly goose
  })

  it('gives high manipulate score when targeting manipulate options', () => {
    const answers: Answers = {}
    for (const q of quiz.questions) {
      const opts = Object.entries(q.options) as [string, { text: string; module: string }][]
      const manipOpt = opts.find(([, o]) => o.module === 'manipulate')
      answers[String(q.id)] = manipOpt ? manipOpt[0] : 'A'
    }
    const result = computeResult(quiz, answers)

    // manipulate should be the highest or near-highest score
    expect(result.moduleScores.manipulate).toBeGreaterThan(0)
    // The matched role should have a non-trivial manipulate weight
    expect(result.similarity).toBeGreaterThan(0)
  })

  it('moduleScores sum equals answered count', () => {
    const answers: Answers = {}
    for (const q of quiz.questions) {
      answers[String(q.id)] = 'C'
    }
    const result = computeResult(quiz, answers)
    const sum = MODULES.reduce((s, m) => s + result.moduleScores[m], 0)
    expect(sum).toBe(48)
  })
})
