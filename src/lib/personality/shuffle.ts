/**
 * Seeded shuffle for question ordering.
 * Deterministic: same sessionId always produces the same order.
 * This lets applicants resume the test on a different device and see the same questions.
 */

function mulberry32(seed: number) {
  let s = seed
  return function (): number {
    s += 0x6d2b79f5
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000
  }
}

function seedFromSessionId(sessionId: string): number {
  // First 8 hex chars of UUID (dashes removed) → 32-bit integer seed
  return parseInt(sessionId.replace(/-/g, '').slice(0, 8), 16)
}

/** Returns a shuffled array of question indexes 0–99, deterministic for a given sessionId. */
export function getShuffledOrder(sessionId: string): number[] {
  const rand = mulberry32(seedFromSessionId(sessionId))
  const indexes = Array.from({ length: 100 }, (_, i) => i)
  for (let i = 99; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[indexes[i], indexes[j]] = [indexes[j], indexes[i]]
  }
  return indexes
}

/** Returns the 10 canonical question indexes for a given page (0-indexed, pages 0–9). */
export function getPageQuestions(sessionId: string, page: number): number[] {
  return getShuffledOrder(sessionId).slice(page * 10, page * 10 + 10)
}

/**
 * Returns the current page (0–9) — the first page that isn't fully answered.
 * Returns 10 if all 100 questions are answered.
 */
export function getCurrentPage(sessionId: string, answeredIndexes: number[]): number {
  const order = getShuffledOrder(sessionId)
  const answered = new Set(answeredIndexes)
  for (let page = 0; page < 10; page++) {
    const pageQs = order.slice(page * 10, page * 10 + 10)
    if (!pageQs.every(idx => answered.has(idx))) return page
  }
  return 10 // all pages complete
}
