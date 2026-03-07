/* ─── Module dimensions ───────────────────────────────── */

export type Module =
  | 'logic'
  | 'insight'
  | 'mobility'
  | 'control'
  | 'protect'
  | 'enforce'
  | 'manipulate'
  | 'opportunism'

export const MODULES: Module[] = [
  'logic',
  'insight',
  'mobility',
  'control',
  'protect',
  'enforce',
  'manipulate',
  'opportunism',
]

/** Numeric scores keyed by module – used for both user profiles and role weights */
export type ModuleWeights = Record<Module, number>

/* ─── Quiz data  (gooseduck.json) ────────────────────── */

export interface QuizOption {
  text: string
  module: Module
}

export interface QuizQuestion {
  id: number
  text: string
  options: Record<string, QuizOption>
}

export interface QuizData {
  version: string
  question_count: number
  questions: QuizQuestion[]
}

/* ─── Role data  (role.json) ─────────────────────────── */

export type Camp = 'goose' | 'neutral' | 'duck'

export interface RoleEntry {
  key: string
  name: string
  camp: Camp
  weights: ModuleWeights
}

export interface RoleData {
  roles: RoleEntry[]
}

/* ─── Persona data  (persona.json) ───────────────────── */

export interface PersonaInfo {
  core_motivation: string
  typical_behaviors: string[]
  strengths: string[]
  blind_spots: string[]
  real_life_projection: string
}

export interface PersonaEntry {
  key: string
  name: string
  camp: Camp
  persona: PersonaInfo
}

export interface PersonaData {
  schema_version: string
  camps: { key: string; name: string; count: number }[]
  roles: PersonaEntry[]
}

/* ─── Answers map  (questionId → optionKey) ──────────── */

export type Answers = Record<string, string>

/* ─── Scoring result ─────────────────────────────────── */

export const CAMP_LABELS: Record<Camp, string> = {
  goose: '好人鹅',
  neutral: '中立',
  duck: '坏人鸭子',
}

export interface ScoringResult {
  roleKey: string
  roleName: string
  camp: Camp
  campName: string
  similarity: number
  /** User's raw module counts (sum = 48) */
  moduleScores: ModuleWeights
  /** Persona data pulled from persona.json */
  persona: PersonaInfo
}
