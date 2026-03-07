/**
 * POST /api/codes/verify
 *
 * Validates an access code. Rate-limited per IP (5 attempts → 10-min lockout).
 * Codes are stored in server/data/access-codes.json and decremented on success.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

interface AccessCode {
  code: string
  usesLeft: number
  expiresAt: string | null
  status: 'active' | 'disabled'
}

interface CodesData {
  codes: AccessCode[]
}

// In-memory rate-limit tracker (resets on server restart — fine for MVP)
const failedAttempts: Record<string, { count: number; lockedUntil: number }> = {}
const MAX_ATTEMPTS = 5
const LOCKOUT_MINUTES = 10

function codesPath(): string {
  return resolve('.', 'server/data/access-codes.json')
}

function loadCodes(): CodesData {
  return JSON.parse(readFileSync(codesPath(), 'utf-8')) as CodesData
}

function saveCodes(data: CodesData): void {
  writeFileSync(codesPath(), JSON.stringify(data, null, 2), 'utf-8')
}

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

  const inputCode = body.code.trim().toUpperCase()
  const data = loadCodes()

  const match = data.codes.find(
    (c) => c.code.toUpperCase() === inputCode && c.status === 'active',
  )

  if (!match) {
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

  // Expiration check
  if (match.expiresAt && new Date(match.expiresAt) < new Date()) {
    throw createError({ statusCode: 401, statusMessage: '该邀请码已过期' })
  }

  // Uses remaining
  if (match.usesLeft <= 0) {
    throw createError({ statusCode: 401, statusMessage: '该邀请码已用完' })
  }

  // Success — decrement and persist
  match.usesLeft--
  saveCodes(data)
  delete failedAttempts[ip]

  return { ok: true, message: 'Access granted' }
})
