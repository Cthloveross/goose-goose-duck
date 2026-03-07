<script setup lang="ts">
// Landing page — single-screen hero
</script>

<template>
  <div class="landing-bg relative min-h-screen flex items-center justify-center overflow-hidden select-none">

    <!-- ═══ Background decorative icons (hidden on small screens) ═══ -->
    <!-- Feather silhouette — left-bottom area -->
    <svg
      class="deco-svg deco-feather"
      viewBox="0 0 200 200" fill="none"
    >
      <path
        d="M100 10 C60 40, 30 90, 40 160 C50 170, 70 175, 100 160 C90 130, 85 100, 100 60 C110 90, 115 130, 105 155 C130 170, 150 165, 160 150 C170 100, 140 50, 100 10Z"
        fill="#B8B5C4"
      />
      <path
        d="M100 60 C100 100, 100 140, 100 165"
        stroke="#B8B5C4" stroke-width="2" stroke-linecap="round"
      />
    </svg>

    <!-- Magnifying glass + sparkles — right area -->
    <svg
      class="deco-svg deco-magnifier"
      viewBox="0 0 260 260" fill="none"
    >
      <circle cx="120" cy="110" r="55" stroke="#B8B5C4" stroke-width="10" />
      <line x1="158" y1="148" x2="210" y2="200" stroke="#B8B5C4" stroke-width="12" stroke-linecap="round" />
      <path d="M200 50 L204 62 L216 66 L204 70 L200 82 L196 70 L184 66 L196 62Z" fill="#C5C2D0" />
      <path d="M230 90 L232 96 L238 98 L232 100 L230 106 L228 100 L222 98 L228 96Z" fill="#C5C2D0" />
    </svg>

    <!-- Diamond sparkle — bottom-right corner -->
    <svg
      class="deco-svg deco-diamond"
      viewBox="0 0 60 60" fill="none"
    >
      <path d="M30 5 L34 25 L55 30 L34 35 L30 55 L26 35 L5 30 L26 25Z" fill="#D0CDE0" />
    </svg>

    <!-- Noise overlay -->
    <div class="noise-overlay" />

    <!-- ═══ Main content ═══ -->
    <div class="content-container relative z-10 w-full mx-auto px-5 sm:px-6 text-center">

      <!-- 2.1 Tagline -->
      <p class="tagline-text">
        基于行为心理学研究的深度博弈测评工具
      </p>

      <!-- 2.2 Main title -->
      <h1 class="main-title">
        《鹅鸭杀》 角色人格测试
      </h1>

      <!-- 2.3 Main description -->
      <p class="body-text desc-main mx-auto">
        由专业游戏心理学家团队设计，基于32个核心角色人格与博弈模式，通过48道精心设计的场景问题，帮助您科学地发现自己的《鹅鸭杀》核心职业原型。深入探索在这场庄园博弈中，隐藏在你内心深处的真实策略倾向。
      </p>

      <!-- ═══ 5 Character illustrations ═══ -->
      <div class="characters-wrap">
        <img src="/images/char1.png" alt="角色1" class="char-img char-side" draggable="false" />
        <img src="/images/char2.png" alt="角色2" class="char-img char-mid" draggable="false" />
        <img src="/images/char3.png" alt="角色3" class="char-img char-center" draggable="false" />
        <img src="/images/char4.png" alt="角色4" class="char-img char-mid" draggable="false" />
        <img src="/images/char5.png" alt="角色5" class="char-img char-side" draggable="false" />
      </div>

      <!-- 2.4 Secondary heading -->
      <h2 class="secondary-title">
        探索您的游戏人格密码
      </h2>

      <!-- 2.5 Secondary description -->
      <p class="body-text desc-sub mx-auto">
        通过深度行为逻辑分析，发现您独特的博弈特质。每种角色代表着独特的性格维度和博弈策略模式，让我们一起揭开您的游戏本性。
      </p>

      <!-- 2.6 CTA Button -->
      <div class="cta-area">
        <NuxtLink to="/t/gooseduck" class="cta-button group">
          <span class="cta-highlight-left" />
          <span class="cta-highlight-right" />
          <span class="relative z-10 text-white font-extrabold cta-label tracking-wide">
            开始测试
          </span>
        </NuxtLink>

        <p class="cta-subtext">
          解锁您的博弈画像
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ─── Background ─── */
.landing-bg {
  background:
    linear-gradient(180deg, #F1F1F3 0%, #ECEAEF 40%, #E4E0ED 65%, #DDD8EA 100%);
  position: relative;
}

.landing-bg::before,
.landing-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.landing-bg::before {
  background: radial-gradient(ellipse 60% 70% at 15% 75%, rgba(200, 170, 210, 0.18) 0%, transparent 70%);
}
.landing-bg::after {
  background: radial-gradient(ellipse 55% 65% at 85% 70%, rgba(170, 195, 225, 0.16) 0%, transparent 70%);
}

.noise-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.35;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 256px 256px;
}

/* ─── Decorative SVGs — responsive ─── */
.deco-svg {
  position: absolute;
  pointer-events: none;
}
.deco-feather {
  left: 4%;
  bottom: 16%;
  width: clamp(100px, 14vw, 200px);
  height: auto;
  opacity: 0.16;
}
.deco-magnifier {
  right: 3%;
  bottom: 18%;
  width: clamp(120px, 18vw, 260px);
  height: auto;
  opacity: 0.18;
}
.deco-diamond {
  right: 3%;
  bottom: 3%;
  width: clamp(30px, 4vw, 60px);
  height: auto;
  opacity: 0.12;
}
/* Hide decorations on very small screens to keep it clean */
@media (max-width: 480px) {
  .deco-feather,
  .deco-magnifier {
    opacity: 0.08;
  }
}

/* ─── Content container — responsive vertical rhythm ─── */
.content-container {
  max-width: 1140px;
  /* responsive vertical padding */
  padding-top: clamp(48px, 8vh, 130px);
  padding-bottom: clamp(48px, 8vh, 140px);
}

/* ─── Typography — all responsive ─── */
.tagline-text {
  font-size: clamp(11px, 1.2vw, 14px);
  font-weight: 500;
  color: #98979A;
  letter-spacing: 0.12em;
  margin-bottom: clamp(12px, 2vw, 20px);
}

.main-title {
  font-size: clamp(26px, 5vw, 52px);
  font-weight: 800;
  color: #5F557F;
  line-height: 1.25;
  margin-bottom: clamp(14px, 2.5vw, 28px);
}

.body-text {
  font-size: clamp(13px, 1.5vw, 17px);
  color: #454446;
  font-weight: 400;
  line-height: 1.85;
}

.desc-main {
  max-width: min(780px, 90vw);
  margin-bottom: clamp(12px, 2vw, 24px);
}

.secondary-title {
  font-size: clamp(20px, 3vw, 32px);
  font-weight: 800;
  color: #64608B;
  line-height: 1.3;
  margin-top: clamp(16px, 3vw, 32px);
  margin-bottom: clamp(10px, 1.8vw, 20px);
}

.desc-sub {
  max-width: min(700px, 88vw);
  margin-bottom: clamp(24px, 4vw, 48px);
}

.cta-subtext {
  font-size: clamp(14px, 1.3vw, 20px);
  color: #4A4652;
  font-weight: 400;
  margin-top: clamp(8px, 1vw, 14px);
}

.cta-label {
  font-size: clamp(22px, 3.2vw, 40px);
}

/* ─── Character illustrations — 5 in a row ─── */
.characters-wrap {
  margin: clamp(8px, 1.5vw, 20px) auto;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: clamp(2px, 0.8vw, 10px);
  width: min(96%, 780px);
}

.char-img {
  flex-shrink: 0;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 3px 8px rgba(80, 70, 120, 0.12));
  user-select: none;
  -webkit-user-drag: none;
  transition: transform 0.3s ease;
}
.char-img:hover {
  transform: translateY(-4px) scale(1.04);
}

/* Center character slightly bigger, sides slightly smaller */
.char-center {
  width: clamp(80px, 14vw, 160px);
}
.char-mid {
  width: clamp(68px, 12vw, 140px);
}
.char-side {
  width: clamp(60px, 10vw, 120px);
}

/* ─── CTA area ─── */
.cta-area {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ─── CTA Button — responsive ─── */
.cta-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* key fix: use percentage + clamp so it never overflows on mobile */
  width: min(88vw, clamp(280px, 48vw, 620px));
  height: clamp(52px, 6.5vw, 96px);
  border-radius: 9999px;
  background: linear-gradient(135deg, #7650BD 0%, #6558C0 40%, #5167C9 75%, #4D76D7 100%);
  border: clamp(2.5px, 0.3vw, 3.5px) solid #2E2754;
  box-shadow:
    0 8px 28px -4px rgba(94, 84, 148, 0.45),
    0 16px 40px -8px rgba(46, 39, 84, 0.3);
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  text-decoration: none;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow:
    0 10px 34px -4px rgba(94, 84, 148, 0.55),
    0 20px 50px -8px rgba(46, 39, 84, 0.35);
}
.cta-button:active {
  transform: translateY(1px);
}

.cta-highlight-left {
  position: absolute;
  top: 10%;
  left: 12%;
  width: 35%;
  height: 40%;
  background: radial-gradient(ellipse, rgba(255, 255, 255, 0.30) 0%, transparent 70%);
  pointer-events: none;
  border-radius: 50%;
}

.cta-highlight-right {
  position: absolute;
  top: 25%;
  right: 10%;
  width: 25%;
  height: 50%;
  background: radial-gradient(ellipse, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
  pointer-events: none;
  border-radius: 50%;
}
</style>
