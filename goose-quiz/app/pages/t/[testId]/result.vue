<script setup lang="ts">
import type { ScoringResult, Module } from '~/lib/types'
import { MODULES } from '~/lib/types'

const route = useRoute()
const testId = route.params.testId as string
const store = useQuizStore()

const result = computed<ScoringResult | null>(() => store.result)

// Guard
onMounted(() => {
  if (!result.value) navigateTo(`/t/${testId}`)
})

/* ─── Camp theming ─── */
const campTheme = computed(() => {
  const camp = result.value?.camp
  switch (camp) {
    case 'goose':
      return {
        emoji: '🪿',
        gradient: 'from-emerald-50 via-teal-50 to-green-50',
        accent: '#059669',
        accentLight: '#d1fae5',
        accentMid: '#6ee7b7',
        border: 'border-emerald-300',
        badge: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
        bar: 'bg-emerald-400',
        btn: 'bg-emerald-500 hover:bg-emerald-600',
      }
    case 'duck':
      return {
        emoji: '🦆',
        gradient: 'from-red-50 via-orange-50 to-rose-50',
        accent: '#dc2626',
        accentLight: '#fee2e2',
        accentMid: '#fca5a5',
        border: 'border-red-300',
        badge: 'bg-red-100 text-red-700 ring-red-200',
        bar: 'bg-red-400',
        btn: 'bg-red-500 hover:bg-red-600',
      }
    default:
      return {
        emoji: '🕊️',
        gradient: 'from-violet-50 via-indigo-50 to-purple-50',
        accent: '#7c3aed',
        accentLight: '#ede9fe',
        accentMid: '#c4b5fd',
        border: 'border-violet-300',
        badge: 'bg-violet-100 text-violet-700 ring-violet-200',
        bar: 'bg-violet-400',
        btn: 'bg-violet-500 hover:bg-violet-600',
      }
  }
})

/* ─── Module labels ─── */
const MODULE_LABELS: Record<Module, string> = {
  logic: '逻辑', insight: '洞察', mobility: '机动', control: '控场',
  protect: '防护', enforce: '执行', manipulate: '操纵', opportunism: '投机',
}

/* ─── Role image ─── */
const roleImage = computed(() => {
  if (!result.value) return ''
  return `/images/${result.value.roleName}.png`
})

const maxScore = computed(() => {
  if (!result.value) return 1
  return Math.max(...MODULES.map((m) => result.value!.moduleScores[m]), 1)
})
function barPct(mod: Module): number {
  if (!result.value) return 0
  return Math.round((result.value.moduleScores[mod] / maxScore.value) * 100)
}

/* ─── Share card ─── */
const shareCardRef = ref<HTMLElement | null>(null)
const showShareModal = ref(false)
const shareImageUrl = ref('')
const isGenerating = ref(false)

async function generateShareCard() {
  if (!shareCardRef.value) return
  isGenerating.value = true
  showShareModal.value = true

  await nextTick()
  await new Promise((r) => setTimeout(r, 150))

  try {
    const html2canvas = (await import('html2canvas-pro')).default
    const canvas = await html2canvas(shareCardRef.value, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
      logging: false,
    })
    shareImageUrl.value = canvas.toDataURL('image/png')
  } catch (e) {
    console.error('Share card generation failed:', e)
  } finally {
    isGenerating.value = false
  }
}

function downloadCard() {
  if (!shareImageUrl.value) return
  const a = document.createElement('a')
  a.href = shareImageUrl.value
  a.download = `goose-duck-${result.value?.roleKey || 'result'}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

function closeModal() {
  showShareModal.value = false
  shareImageUrl.value = ''
}

function retake() {
  store.resetQuiz()
  navigateTo(`/t/${testId}`)
}
</script>

<template>
  <div
    v-if="result"
    class="result-page min-h-screen bg-gradient-to-br py-6 px-4"
    :class="campTheme.gradient"
  >
    <div class="max-w-md mx-auto space-y-4">

      <!-- ═══ SHARE CARD (offscreen render target) ═══ -->
      <div class="share-card-offscreen">
        <div
          ref="shareCardRef"
          class="share-card"
          :style="{
            '--camp-accent': campTheme.accent,
            '--camp-light': campTheme.accentLight,
            '--camp-mid': campTheme.accentMid,
          }"
        >
          <div class="sc-header">
            <img :src="roleImage" :alt="result.roleName" class="sc-role-img" />
            <div class="sc-badge" :style="{ background: campTheme.accentLight, color: campTheme.accent }">
              {{ result.campName }}
            </div>
            <h2 class="sc-role">{{ result.roleName }}</h2>
            <p class="sc-match">匹配度 {{ (result.similarity * 100).toFixed(1) }}%</p>
          </div>

          <div class="sc-bars">
            <div v-for="mod in MODULES" :key="mod" class="sc-bar-row">
              <span class="sc-bar-label">{{ MODULE_LABELS[mod] }}</span>
              <div class="sc-bar-track">
                <div class="sc-bar-fill" :style="{ width: `${barPct(mod)}%`, background: campTheme.accent }" />
              </div>
              <span class="sc-bar-val">{{ result.moduleScores[mod] }}</span>
            </div>
          </div>

          <div class="sc-motivation">
            <p class="sc-motivation-label">🎯 核心动机</p>
            <p class="sc-motivation-text">{{ result.persona.core_motivation }}</p>
          </div>

          <div class="sc-footer">
            <span>🪿 《鹅鸭杀》角色人格测试</span>
            <span class="sc-footer-url">gooseduck.quiz</span>
          </div>
        </div>
      </div>

      <!-- ═══ VISIBLE RESULT CARDS ═══ -->

      <!-- Header card -->
      <div class="card card-hero text-center">
        <img
          :src="roleImage"
          :alt="result.roleName"
          class="role-img mx-auto mb-3"
        />
        <span
          class="inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ring-1"
          :class="campTheme.badge"
        >
          {{ result.campName }}
        </span>
        <h1 class="text-2xl font-black text-gray-900 mb-0.5">
          {{ result.roleName }}
        </h1>
        <p class="text-sm text-gray-400">
          匹配度 {{ (result.similarity * 100).toFixed(1) }}%
        </p>
      </div>

      <!-- Core motivation -->
      <div class="card">
        <h2 class="card-title">🎯 核心动机</h2>
        <p class="text-base text-gray-800 leading-relaxed">
          {{ result.persona.core_motivation }}
        </p>
      </div>

      <!-- Module scores -->
      <div class="card">
        <h2 class="card-title">📊 维度分布</h2>
        <div class="space-y-2.5">
          <div v-for="mod in MODULES" :key="mod" class="flex items-center gap-2.5">
            <span class="w-9 text-right text-xs text-gray-500 font-medium shrink-0">
              {{ MODULE_LABELS[mod] }}
            </span>
            <div class="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-700 ease-out"
                :class="campTheme.bar"
                :style="{ width: `${barPct(mod)}%` }"
              />
            </div>
            <span class="w-5 text-xs text-gray-400 font-mono">
              {{ result.moduleScores[mod] }}
            </span>
          </div>
        </div>
      </div>

      <!-- Typical behaviours -->
      <div class="card">
        <h2 class="card-title">🧩 典型行为</h2>
        <ul class="space-y-1.5">
          <li
            v-for="(b, i) in result.persona.typical_behaviors"
            :key="i"
            class="flex items-start gap-2 text-gray-700 text-sm leading-relaxed"
          >
            <span class="text-amber-400 mt-0.5 shrink-0">•</span>
            <span>{{ b }}</span>
          </li>
        </ul>
      </div>

      <!-- Strengths & Blind spots -->
      <div class="grid grid-cols-2 gap-3">
        <div class="card !p-4">
          <h2 class="card-title !mb-2">💪 优势</h2>
          <ul class="space-y-1">
            <li
              v-for="(s, i) in result.persona.strengths"
              :key="i"
              class="text-sm text-gray-700 flex items-start gap-1.5"
            >
              <span class="text-emerald-400 shrink-0">✓</span>
              <span>{{ s }}</span>
            </li>
          </ul>
        </div>
        <div class="card !p-4">
          <h2 class="card-title !mb-2">👁️ 盲区</h2>
          <ul class="space-y-1">
            <li
              v-for="(b, i) in result.persona.blind_spots"
              :key="i"
              class="text-sm text-gray-700 flex items-start gap-1.5"
            >
              <span class="text-red-400 shrink-0">!</span>
              <span>{{ b }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Real-life projection -->
      <div class="card border-l-4" :class="campTheme.border">
        <h2 class="card-title">🌍 现实投射</h2>
        <p class="text-sm text-gray-800 leading-relaxed">
          {{ result.persona.real_life_projection }}
        </p>
      </div>

      <!-- ═══ Action buttons ═══ -->
      <div class="flex flex-col gap-2.5 pt-1 pb-8">
        <button
          class="w-full py-3 rounded-xl font-bold text-white shadow-md transition active:scale-[0.98] flex items-center justify-center gap-2"
          :class="campTheme.btn"
          @click="generateShareCard"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          生成分享卡片
        </button>

        <button
          class="w-full py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition active:scale-[0.98]"
          @click="retake"
        >
          🔄 重新测试
        </button>

        <button
          class="w-full py-2.5 rounded-xl text-sm text-gray-400 hover:text-gray-600 transition"
          @click="navigateTo('/')"
        >
          返回首页
        </button>
      </div>
    </div>

    <!-- ═══ Share modal overlay ═══ -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showShareModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-content">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-gray-800">分享卡片</h3>
              <button
                class="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                @click="closeModal"
              >
                ×
              </button>
            </div>

            <div v-if="isGenerating" class="flex flex-col items-center py-12 gap-3">
              <div class="spinner" />
              <p class="text-sm text-gray-500">正在生成卡片...</p>
            </div>

            <div v-else-if="shareImageUrl" class="space-y-4">
              <div class="rounded-xl overflow-hidden shadow-lg border border-gray-100">
                <img :src="shareImageUrl" alt="分享卡片" class="w-full" />
              </div>

              <p class="text-xs text-gray-400 text-center leading-relaxed">
                📱 手机用户：长按上方图片即可保存到相册<br/>
                💻 电脑用户：点击下方按钮下载
              </p>

              <button
                class="w-full py-3 rounded-xl font-bold text-white shadow-md transition active:scale-[0.98]"
                :class="campTheme.btn"
                @click="downloadCard"
              >
                📥 保存到本地
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* ─── Cards ─── */
.card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03);
}
.card-hero {
  padding: 28px 20px;
}
.role-img {
  width: 140px;
  height: 140px;
  object-fit: contain;
  border-radius: 16px;
}
.card-title {
  font-size: 12px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 10px;
}

/* ─── Share card (offscreen render target) ─── */
.share-card-offscreen {
  position: fixed;
  left: -9999px;
  top: 0;
  z-index: -1;
  pointer-events: none;
}

.share-card {
  width: 420px;
  padding: 32px 28px 24px;
  background: linear-gradient(
    180deg,
    white 0%,
    var(--camp-light, #f5f3ff) 100%
  );
  border-radius: 20px;
  font-family: 'PingFang SC', 'Source Han Sans SC', 'Noto Sans SC', system-ui, sans-serif;
}

.sc-header {
  text-align: center;
  margin-bottom: 24px;
}
.sc-role-img {
  width: 120px;
  height: 120px;
  object-fit: contain;
  margin: 0 auto 10px;
  display: block;
  border-radius: 16px;
}
.sc-badge {
  display: inline-block;
  padding: 3px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 8px;
}
.sc-role {
  font-size: 28px;
  font-weight: 900;
  color: #1f2937;
  margin: 0 0 2px;
}
.sc-match {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
}

.sc-bars {
  background: rgba(255,255,255,0.7);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 20px;
}
.sc-bar-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.sc-bar-row:last-child { margin-bottom: 0; }
.sc-bar-label {
  width: 32px;
  text-align: right;
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
  flex-shrink: 0;
}
.sc-bar-track {
  flex: 1;
  height: 12px;
  background: #f3f4f6;
  border-radius: 999px;
  overflow: hidden;
}
.sc-bar-fill {
  height: 100%;
  border-radius: 999px;
}
.sc-bar-val {
  width: 20px;
  font-size: 10px;
  color: #9ca3af;
  font-family: ui-monospace, monospace;
  flex-shrink: 0;
}

.sc-motivation {
  background: rgba(255,255,255,0.6);
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 20px;
}
.sc-motivation-label {
  font-size: 11px;
  font-weight: 700;
  color: #9ca3af;
  margin: 0 0 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.sc-motivation-text {
  font-size: 14px;
  color: #374151;
  line-height: 1.7;
  margin: 0;
}

.sc-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #9ca3af;
  padding-top: 12px;
  border-top: 1px solid rgba(0,0,0,0.05);
}
.sc-footer-url {
  font-weight: 600;
  color: #6b7280;
}

/* ─── Modal ─── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.modal-content {
  background: white;
  border-radius: 20px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* ─── Spinner ─── */
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
