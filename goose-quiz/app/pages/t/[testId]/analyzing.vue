<script setup lang="ts">
const route = useRoute()
const testId = route.params.testId as string
const store = useQuizStore()

const dots = ref(0)

onMounted(() => {
  if (!store.result) {
    navigateTo(`/t/${testId}`)
    return
  }

  const dotInterval = setInterval(() => {
    dots.value = (dots.value + 1) % 4
  }, 400)

  const timeout = setTimeout(() => {
    navigateTo(`/t/${testId}/result`)
  }, 3000)

  onUnmounted(() => {
    clearInterval(dotInterval)
    clearTimeout(timeout)
  })
})

const dotText = computed(() => '.'.repeat(dots.value))
</script>

<template>
  <div class="flex items-center justify-center min-h-screen px-4">
    <div class="text-center">
      <div class="text-7xl mb-8 animate-bounce">🧮</div>

      <h2 class="text-xl font-bold text-gray-900 mb-2">
        正在分析你的人格{{ dotText }}
      </h2>

      <p class="text-gray-400 text-sm mb-8">48 道题的答案正在被解码…</p>

      <div class="w-64 mx-auto h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 rounded-full animate-shimmer"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes shimmer {
  0% { transform: translateX(-100%); width: 60%; }
  50% { width: 80%; }
  100% { transform: translateX(200%); width: 60%; }
}
.animate-shimmer {
  animation: shimmer 1.5s ease-in-out infinite;
}
</style>
