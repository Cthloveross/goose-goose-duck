import { defineStore } from 'pinia'
import type { Answers, ScoringResult } from '~/lib/types'

interface QuizState {
  testId: string | null
  currentIndex: number
  answers: Answers
  startedAt: string | null
  completedAt: string | null
  result: ScoringResult | null
  accessCodeVerified: boolean
}

const STORAGE_KEY = 'goose-quiz-state'

function loadFromStorage(): Partial<QuizState> | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveToStorage(state: QuizState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // quota exceeded or private mode — silently fail
  }
}

export const useQuizStore = defineStore('quiz', {
  state: (): QuizState => ({
    testId: null,
    currentIndex: 0,
    answers: {},
    startedAt: null,
    completedAt: null,
    result: null,
    accessCodeVerified: false,
  }),

  getters: {
    answeredCount: (state): number => Object.keys(state.answers).length,
    isComplete:
      (state) =>
      (totalQuestions: number): boolean =>
        Object.keys(state.answers).length >= totalQuestions,
  },

  actions: {
    /** Initialize or resume a quiz */
    initQuiz(testId: string) {
      const saved = loadFromStorage()

      if (
        saved &&
        saved.testId === testId &&
        saved.answers &&
        Object.keys(saved.answers).length > 0
      ) {
        this.testId = saved.testId
        this.currentIndex = saved.currentIndex ?? 0
        this.answers = saved.answers ?? {}
        this.startedAt = saved.startedAt ?? new Date().toISOString()
        this.completedAt = saved.completedAt ?? null
        this.result = saved.result ?? null
        this.accessCodeVerified = saved.accessCodeVerified ?? false
        return
      }

      this.testId = testId
      this.currentIndex = 0
      this.answers = {}
      this.startedAt = new Date().toISOString()
      this.completedAt = null
      this.result = null
      this._persist()
    },

    /** Record an answer */
    selectAnswer(questionId: number, optionKey: string, totalQuestions: number) {
      this.answers[String(questionId)] = optionKey

      if (this.currentIndex < totalQuestions - 1) {
        this.currentIndex++
      }
      this._persist()
    },

    goToQuestion(index: number) {
      this.currentIndex = index
      this._persist()
    },

    goBack() {
      if (this.currentIndex > 0) {
        this.currentIndex--
        this._persist()
      }
    },

    completeQuiz(result: ScoringResult) {
      this.completedAt = new Date().toISOString()
      this.result = result
      this._persist()
    },

    resetQuiz() {
      this.testId = null
      this.currentIndex = 0
      this.answers = {}
      this.startedAt = null
      this.completedAt = null
      this.result = null
      this.accessCodeVerified = false
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY)
      }
    },

    setCodeVerified(testId: string) {
      this.testId = testId
      this.accessCodeVerified = true
      this._persist()
    },

    _persist() {
      saveToStorage({
        testId: this.testId,
        currentIndex: this.currentIndex,
        answers: this.answers,
        startedAt: this.startedAt,
        completedAt: this.completedAt,
        result: this.result,
        accessCodeVerified: this.accessCodeVerified,
      })
    },
  },
})
