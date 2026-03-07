/**
 * POST /api/codes/verify
 *
 * Validates an access code against the DAILY_CODE environment variable.
 * Rate-limited per IP (5 attempts → 10-min lockout).
 */

// In-memory rate-limit tracker (resets on server restart — fine for MVP)
const failedAttempts: Record<string, { count: number; lockedUntil: number }> = {}
const MAX_ATTEMPTS = 5
const LOCKOUT_MINUTES = 10

export default defineEventHandler(async (event) => {
  const body = await readBody<{ code: string }>(event)

  if (!body?.code || typeof body.code !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Code is required' })
  }

  // Rate limiting by IP
  const ip = getRequestIP(event) || 'unknown'
  const attempt = failedAttempts[ip]

  if (attempt && attempt.lockedUntil > Date.now()) {
    const remainingMin = Math.ceil((attempt.lockedUntil - Date.now()) / 60_000)
    throw createError({
      statusCode: 429,
      statusMessage: `请求过于频繁，请 ${remainingMin} 分钟后重试`,
    })
  }

  const inputCode = body.code.trim()
  const dailyCode = process.env.DAILY_CODE || ''

  if (!dailyCode) {
    throw createError({ statusCode: 500, statusMessage: '服务端未配置每日口令' })
  }

  if (inputCode !== dailyCode) {
    if (!failedAttempts[ip]) {
      failedAttempts[ip] = { count: 0, lockedUntil: 0 }
    }
    failedAttempts[ip].count++

    if (failedAttempts[ip].count >= MAX_ATTEMPTS) {
      failedAttempts[ip].lockedUntil = Date.now() + LOCKOUT_MINUTES * 60_000
      failedAttempts[ip].count = 0
      throw createError({
        statusCode: 429,
        statusMessage: `失败次数过多，已锁定 ${LOCKOUT_MINUTES} 分钟`,
      })
    }

    throw createError({ statusCode: 401, statusMessage: '邀请码无效' })
  }

  // Success
  delete failedAttempts[ip]
  return { ok: true, message: 'Access granted' }
})
