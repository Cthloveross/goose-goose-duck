import type {
  Answers,
  Camp,
  Module,
  ModuleWeights,
  PersonaInfo,
  QuizData,
  RoleEntry,
  ScoringResult,
} from './types'
import { CAMP_LABELS, MODULES } from './types'

import roleData from '~/data/role.json'
import personaData from '~/data/persona.json'

/* ─── helpers ────────────────────────────────────────── */

/** Build a zero-initialised module weight object. */
function emptyWeights(): ModuleWeights {
  return Object.fromEntries(MODULES.map((m) => [m, 0])) as ModuleWeights
}

/**
 * Tally how often the user picked each module across 48 questions.
 * Returns raw counts (sum = number of answered questions).
 */
export function tallyModules(quiz: QuizData, answers: Answers): ModuleWeights {
  const scores = emptyWeights()

  for (const q of quiz.questions) {
    const picked = answers[String(q.id)]
    if (!picked) continue
    const opt = q.options[picked]
    if (!opt) continue
    const mod = opt.module as Module
    if (MODULES.includes(mod)) {
      scores[mod]++
    }
  }

  return scores
}

/**
 * Cosine similarity between two weight vectors.
 * Returns a value in [0, 1]  (both vectors are non-negative).
 */
export function cosineSimilarity(a: ModuleWeights, b: ModuleWeights): number {
  let dot = 0
  let magA = 0
  let magB = 0

  for (const m of MODULES) {
    dot += a[m] * b[m]
    magA += a[m] * a[m]
    magB += b[m] * b[m]
  }

  const denom = Math.sqrt(magA) * Math.sqrt(magB)
  return denom === 0 ? 0 : dot / denom
}

/* ─── main entry point ───────────────────────────────── */

/**
 * Given the full quiz definition and the user's answers map,
 * compute the best-matching game role via cosine similarity.
 */
export function computeResult(quiz: QuizData, answers: Answers): ScoringResult {
  const moduleScores = tallyModules(quiz, answers)
  const roles: RoleEntry[] = (roleData as { roles: RoleEntry[] }).roles

  if (roles.length === 0) {
    throw new Error('role.json contains no roles')
  }

  // Find best match
  let bestRole: RoleEntry = roles[0]!
  let bestSim = -1

  for (const role of roles) {
    const sim = cosineSimilarity(moduleScores, role.weights)
    if (sim > bestSim) {
      bestSim = sim
      bestRole = role
    }
  }

  // Look up persona info
  const personaEntry = (personaData as { roles: { key: string; persona: PersonaInfo }[] }).roles.find(
    (p) => p.key === bestRole.key,
  )

  const persona: PersonaInfo = personaEntry?.persona ?? {
    core_motivation: '',
    typical_behaviors: [],
    strengths: [],
    blind_spots: [],
    real_life_projection: '',
  }

  return {
    roleKey: bestRole.key,
    roleName: bestRole.name,
    camp: bestRole.camp as Camp,
    campName: CAMP_LABELS[bestRole.camp as Camp] ?? bestRole.camp,
    similarity: Math.round(bestSim * 1000) / 1000,
    moduleScores,
    persona,
  }
}
