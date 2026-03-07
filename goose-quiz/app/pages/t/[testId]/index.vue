<script setup lang="ts">
const route = useRoute()
const store = useQuizStore()
const testId = route.params.testId as string

const code = ref('')
const error = ref('')
const loading = ref(false)
const shake = ref(false)

// If already verified for this test, skip straight to quiz
onMounted(() => {
  if (store.accessCodeVerified && store.testId === testId) {
    navigateTo(`/t/${testId}/quiz`)
  }
})

async function verifyCode() {
  error.value = ''
  const trimmed = code.value.trim()
  if (!trimmed) {
    error.value = '请输入邀请码'
    triggerShake()
    return
  }

  loading.value = true
  try {
    await $fetch('/api/codes/verify', {
      method: 'POST',
      body: { code: trimmed },
    })

    // Success → save & navigate
    store.setCodeVerified(testId)
    navigateTo(`/t/${testId}/quiz`)
  } catch (e: unknown) {
    const err = e as { statusCode?: number; statusMessage?: string; data?: { statusMessage?: string } }
    error.value =
      err.data?.statusMessage || err.statusMessage || '验证失败，请重试'
    triggerShake()
  } finally {
    loading.value = false
  }
}

function triggerShake() {
  shake.value = true
  setTimeout(() => (shake.value = false), 500)
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen px-4">
    <div class="w-full max-w-sm">
      <!-- Back link -->
      <NuxtLink
        to="/"
        class="inline-flex items-center text-gray-400 hover:text-gray-600 mb-8 text-sm transition-colors"
      >
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        返回首页
      </NuxtLink>

      <!-- Title -->
      <div class="text-center mb-8">
        <div class="text-5xl mb-4">🔐</div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">输入邀请码</h1>
        <p class="text-gray-400 text-sm">请输入你收到的专属邀请码开始测试</p>
      </div>

      <!-- Code input -->
      <form @submit.prevent="verifyCode" class="space-y-4">
        <div :class="{ 'animate-shake': shake }">
          <input
            v-model="code"
            type="text"
            placeholder="邀请码"
            maxlength="20"
            autocomplete="off"
            class="w-full px-4 py-3 text-center text-lg font-mono tracking-widest bg-white border-2 rounded-xl outline-none transition-colors"
            :class="error ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-amber-400'"
          />
        </div>

        <!-- Error message -->
        <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors"
        >
          <span v-if="loading" class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            验证中…
          </span>
          <span v-else>开始测试 →</span>
        </button>
      </form>

      <!-- Demo codes hint -->
      <p class="text-center text-gray-300 text-xs mt-8">
        测试邀请码: GOOSE2026 / DUCK-TEST
      </p>
    </div>
  </div>
</template>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
}
.animate-shake {
  animation: shake 0.4s ease-in-out;
}
</style>
