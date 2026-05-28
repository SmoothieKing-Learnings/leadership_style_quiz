/**
 * Tie-breaker helpers.
 *
 * When calculateResults returns more than one style in `topStyles`, we re-ask
 * one of the user's previously-answered questions — but with only the tied
 * styles' options visible. The new pick replaces the original answer in the
 * answers array; results are recomputed; if still tied AND attempts < MAX,
 * the loop continues with another random candidate.
 *
 * Resolved-spec recap:
 *   • No qualifying candidates → accept Hybrid (skip tie-breaker entirely)
 *   • Candidate selection      → random pick from the pool, no repeats
 *   • 3+ way ties              → show all tied styles as options
 *   • Loop cap                 → 2 attempts before accepting Hybrid
 *   • Previous-answer hint     → none (render the question fresh)
 */

export const MAX_TIE_BREAKER_ATTEMPTS = 2;

/**
 * Return question indices where the user picked a style NOT in the tied set.
 * Excludes any indices already used in a prior attempt.
 *
 * @param {string[]} answers           - one styleId per question (in shuffled order)
 * @param {Set<string>} tiedStyleIds   - styleIds currently tied for top
 * @param {Set<number>} usedCandidates - indices already used in prior attempts
 * @returns {number[]} candidate indices
 */
export function findTieBreakerCandidates(answers, tiedStyleIds, usedCandidates = new Set()) {
  const candidates = [];
  answers.forEach((styleId, idx) => {
    if (!styleId) return;
    if (tiedStyleIds.has(styleId)) return;
    if (usedCandidates.has(idx)) return;
    candidates.push(idx);
  });
  return candidates;
}

/**
 * Pick one candidate index uniformly at random. Returns null if pool empty.
 */
export function pickRandomCandidate(candidates) {
  if (!candidates || candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * Filter a shuffled-question's options to only those whose styleId is in the
 * tied set. Preserves the original (shuffled) option order so the layout
 * stays consistent with how the user saw it the first time.
 */
export function filterOptionsToTied(question, tiedStyleIds) {
  return question.options.filter(opt => tiedStyleIds.has(opt.styleId));
}

/**
 * Apply a tie-breaker answer: replace the user's previous pick at the
 * given question index. Returns a new answers array (does not mutate).
 */
export function applyTieBreakerAnswer(answers, questionIdx, newStyleId) {
  const next = [...answers];
  next[questionIdx] = newStyleId;
  return next;
}
