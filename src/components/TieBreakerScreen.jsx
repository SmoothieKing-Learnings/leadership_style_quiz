import { useEffect, useMemo, useState } from 'react';
import { announceToScreenReader } from '../skills/a11yUtils';
import {
  findTieBreakerCandidates,
  pickRandomCandidate,
  filterOptionsToTied,
  applyTieBreakerAnswer,
} from '../skills/tieBreaker';

/**
 * TieBreakerScreen
 *
 * Drives the full tie-breaker flow:
 *   1. Show an explanation modal with a Continue button (spring-in animation).
 *   2. Pick a random non-tied-pick question; re-render it with only the tied
 *      styles' options visible.
 *   3. User picks → call onAttemptComplete(newAnswers, usedCandidates) so the
 *      parent (App.jsx) can re-run calculateResults and decide whether to
 *      route to results, or loop with another attempt.
 *
 * If no qualifying candidates exist at any point, calls onNoCandidates()
 * so the parent skips the tie-breaker and shows the Hybrid result directly.
 */
export default function TieBreakerScreen({
  answers,
  shuffledQuestions,
  tiedStyleIds,         // Set<string>
  attemptIdx,           // 0..MAX-1 (which attempt are we on?)
  usedCandidates,       // Set<number>
  onAttemptComplete,    // (newAnswers, nextUsedCandidates) => void
  onNoCandidates,       // () => void  — caller accepts Hybrid
}) {
  const [modalOpen, setModalOpen] = useState(true);
  const [selectedStyleId, setSelectedStyleId] = useState(null);

  // Pick one random candidate question for this attempt. The pick is locked
  // for the lifetime of this mount via useMemo so it doesn't re-randomize on
  // every re-render. When the parent loops with a new attempt, this component
  // re-mounts (different `key` on attemptIdx) and the pick re-runs.
  const candidateIdx = useMemo(() => {
    const pool = findTieBreakerCandidates(answers, tiedStyleIds, usedCandidates);
    return pickRandomCandidate(pool);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptIdx]);

  // No-candidates fallback. Reported once on mount when applicable.
  useEffect(() => {
    if (candidateIdx === null) onNoCandidates?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateIdx]);

  // Defensive: if no candidate (shouldn't normally render here because the
  // parent should have routed to results — but in case of edge race).
  if (candidateIdx === null) return null;

  const question = shuffledQuestions[candidateIdx];
  const filteredOptions = filterOptionsToTied(question, tiedStyleIds);

  const handleContinue = () => {
    setModalOpen(false);
    announceToScreenReader(
      `Tie-breaker. We have a tie between your top styles. Answering one more question will help us pick your primary style.`
    );
  };

  const handleSelect = (styleId) => {
    setSelectedStyleId(styleId);
  };

  const handleConfirm = () => {
    if (!selectedStyleId) return;
    const nextAnswers = applyTieBreakerAnswer(answers, candidateIdx, selectedStyleId);
    const nextUsed = new Set(usedCandidates);
    nextUsed.add(candidateIdx);
    onAttemptComplete?.(nextAnswers, nextUsed);
  };

  const handleKeyDown = (e, styleId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(styleId);
    }
  };

  // ── Modal first, then the filtered question ──────────────────────────────
  return (
    <div className="w-full h-[680px] flex flex-col items-stretch text-left py-2 relative">
      {modalOpen ? (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-quiz-bg/90 animate-tie-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tie-breaker-title"
        >
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-orange-100 p-6 text-center animate-tie-card">
            <p className="text-xs font-extrabold text-quiz-primary uppercase tracking-widest mb-2">
              {attemptIdx === 0 ? "One more question" : "Tie-breaker round"}
            </p>
            <h2
              id="tie-breaker-title"
              className="font-heading text-2xl md:text-3xl font-bold text-quiz-text mb-4 leading-tight"
            >
              {attemptIdx === 0 ? "It's a tie!" : "Still a tie!"}
            </h2>
            <p className="text-sm text-quiz-text leading-relaxed mb-6">
              Your top styles are equally weighted. Answer one more question — with just the tied options — and we'll lock in your primary style.
            </p>
            <button
              onClick={handleContinue}
              className="w-full min-h-[44px] px-8 py-4 bg-quiz-primary text-quiz-bg rounded-xl font-bold text-base hover:bg-brand-dark focus:outline-none focus:ring-4 focus:ring-quiz-primary/50 transition-all shadow-lg active:scale-95"
              aria-label="Continue to the tie-breaker question"
              autoFocus
            >
              Continue
            </button>
          </div>
        </div>
      ) : null}

      {/* Tie-breaker question — same chrome as the regular QuizScreen but
          with the progress-bar swapped for an attempt indicator and only the
          tied styles' options shown. */}
      <div className="w-full flex items-center justify-between mb-3 sm:mb-5">
        <span className="text-[10px] sm:text-xs font-bold text-quiz-primary uppercase tracking-wider">
          Tie-breaker
        </span>
      </div>

      <h2
        className="font-body text-lg sm:text-xl md:text-2xl font-bold text-quiz-text w-full leading-snug mb-6 sm:mb-8"
        aria-live="polite"
      >
        {question.text}
      </h2>

      <div className="w-full flex-1 flex flex-col gap-1 min-h-0">
        {filteredOptions.map((option, idx) => {
          const isSelected = selectedStyleId === option.styleId;
          return (
            <div
              key={option.id}
              role="button"
              tabIndex={0}
              onClick={() => handleSelect(option.styleId)}
              onKeyDown={(e) => handleKeyDown(e, option.styleId)}
              className={`w-full flex-1 min-h-[44px] px-3 sm:px-4 py-1.5 rounded-xl border-2 transition-all cursor-pointer shadow-sm flex items-center
                ${isSelected
                  ? 'border-quiz-primary bg-interactive-cream shadow-md ring-2 ring-quiz-primary/30'
                  : 'border-orange-100 bg-white hover:border-quiz-primary hover:bg-interactive-cream hover:shadow'
                } focus:outline-none focus:ring-4 focus:ring-quiz-primary/30`}
              aria-label={`Option ${idx + 1}: ${option.text}`}
              aria-pressed={isSelected}
            >
              <span className="text-xs sm:text-sm font-medium text-quiz-text leading-snug">{option.text}</span>
            </div>
          );
        })}
      </div>

      <div className="w-full pt-3 flex items-center">
        <button
          onClick={handleConfirm}
          disabled={!selectedStyleId}
          className={`flex-1 min-h-[44px] py-3 px-4 rounded-xl font-bold text-quiz-bg transition-all duration-300 bg-quiz-primary active:scale-95
            ${selectedStyleId
              ? 'shadow-lg hover:bg-brand-dark'
              : 'opacity-40 cursor-not-allowed shadow-none'
            }`}
        >
          <span className="text-base">See My Style</span>
        </button>
      </div>
    </div>
  );
}
