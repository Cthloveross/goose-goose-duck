<script setup lang="ts">
import type { QuizData } from '~/lib/types'
import quizData from '~/data/tests/gooseduck.json'
import { computeResult } from '~/lib/scoring'

const route = useRoute()
const store = useQuizStore()
const testId = route.params.testId as string
const quiz = quizData as unknown as QuizData

// Guard: must have verified code
onMounted(() => {
  if (!store.accessCodeVerified || store.testId !== testId) {
    navigateTo(`/t/${testId}`)
    return
  }
  store.initQuiz(testId)
})

const currentQuestion = computed(() => quiz.questions[store.currentIndex])
const optionKeys = ['A', 'B', 'C', 'D'] as const
const totalQuestions = quiz.questions.length
const progress = computed(() => Math.round((store.answeredCount / totalQuestions) * 100))

function selectOption(key: string) {
  if (!currentQuestion.value) return
  store.selectAnswer(currentQuestion.value.id, key, totalQuestions)

  // If all answered, navigate to analyzing
  if (store.answeredCount >= totalQuestions) {
    const result = computeResult(quiz, store.answers)
    store.completeQuiz(result)
    navigateTo(`/t/${testId}/analyzing`)
  }
}

function goBack() {
  store.goBack()
}

function goToQ(index: number) {
  store.goToQuestion(index)
}

// Already-selected option for current question
const selectedKey = computed(() =>
  currentQuestion.value ? store.answers[String(currentQuestion.value.id)] : null,
)
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Progress bar -->
    <div class="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div class="h-1.5 bg-gray-100">
        <div
          class="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300"
          :style="{ width: `${progress}%` }"
        />
      </div>

      <div class="flex items-center justify-between px-4 py-2">
        <!-- Back -->
        <button
          :disabled="store.currentIndex === 0"
          class="text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors p-1"
          @click="goBack"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span class="text-sm text-gray-400 font-mono">
          {{ store.currentIndex + 1 }} / {{ totalQuestions }}
        </span>

        <!-- Empty spacer -->
        <div class="w-7" />
      </div>
    </div>

    <!-- Question content -->
    <div class="flex-1 flex items-center justify-center px-4 py-8">
      <div v-if="currentQuestion" class="w-full max-w-lg">
        <!-- Question text -->
        <h2 class="text-xl font-bold text-gray-900 mb-8 text-center leading-relaxed">
          {{ currentQuestion.text }}
        </h2>

        <!-- Options -->
        <div class="space-y-3">
          <button
            v-for="key in optionKeys"
            :key="key"
            class="w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 active:scale-[0.98]"
            :class="
              selectedKey === key
                ? 'border-amber-400 bg-amber-50 text-amber-900 shadow-sm'
                : 'border-gray-100 bg-white hover:border-amber-200 hover:bg-amber-50/30 text-gray-700'
            "
            @click="selectOption(key)"
          >
            <span class="flex items-start gap-3">
              <span
                class="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-colors"
                :class="
                  selectedKey === key
                    ? 'bg-amber-400 text-white'
                    : 'bg-gray-100 text-gray-400'
                "
              >
                {{ key }}
              </span>
              <span class="text-[15px] leading-relaxed pt-0.5">
                {{ currentQuestion.options[key]?.text }}
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Navigation dots (bottom) -->
    <div class="py-4 px-4 flex justify-center">
      <div class="flex gap-1 flex-wrap max-w-xs justify-center">
        <button
          v-for="(q, i) in quiz.questions"
          :key="q.id"
          class="w-2 h-2 rounded-full transition-all duration-200"
          :class="
            i === store.currentIndex
              ? 'bg-amber-500 w-4'
              : store.answers[String(q.id)]
                ? 'bg-amber-300'
                : 'bg-gray-200'
          "
          @click="goToQ(i)"
        />
      </div>
    </div>
  </div>
</template>
