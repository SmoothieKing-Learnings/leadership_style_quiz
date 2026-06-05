import { useEffect, useMemo } from 'react';
import { X } from 'lucide-react';

/**
 * OtherTypesModal
 *
 * Surfaced from the results screen when the user taps the quiet
 * "Explore the other types →" footer link. Shows every style the user's top
 * result did NOT include — so in a tie, the tied top styles are excluded too.
 *
 * Visual aesthetic notes:
 *   • Card uses the page cream (`bg-quiz-bg`) instead of pure white so it
 *     blends with the rest of the screen — the modal reads as a paused
 *     extension of the page, not a stark white intrusion.
 *   • No drop shadow — keeps the chrome quiet against the cream backdrop.
 *   • Generous header padding (`pt-10 pb-4`) for breathing room.
 *   • Each style is separated by a `border-orange-100` hairline; the
 *     coloured dots from the earlier version are gone.
 *   • Bottom gradient (cream → transparent) hints at scroll overflow on
 *     long lists without overlaying content too aggressively.
 *
 * Dismissal: backdrop click, close (X) button, Escape key.
 *
 * Hide the trigger button entirely when there are zero "other" types
 * (rare full-tie case — handled by the caller, not this component).
 */
export default function OtherTypesModal({
  allStyles,    // ordered array of every style for this quiz
  topStyles,    // user's top style(s) — excluded from the modal list
  onClose,
}) {
  // Listen for Escape key to close.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Compute the "others" list once per topStyles change.
  const others = useMemo(() => {
    const topIds = new Set(topStyles.map(s => s.id));
    return allStyles.filter(s => !topIds.has(s.id));
  }, [allStyles, topStyles]);

  // Defensive: don't render the modal if the others list is empty.
  if (others.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-start justify-center p-3 bg-quiz-bg/90 animate-tie-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="other-types-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[620px] max-h-full flex flex-col bg-quiz-bg rounded-2xl animate-tie-card overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close X — sits above content via z-10 since the gradient overlay also lives in this card */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-0 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full text-quiz-text/60 hover:text-quiz-text hover:bg-interactive-cream focus:outline-none focus:ring-4 focus:ring-quiz-primary/30 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Header — eyebrow only; H2 removed per design feedback */}
        <div className="px-8 py-3 text-center border-b border-orange-100">
          <p
            id="other-types-title"
            className="text-xs font-extrabold text-quiz-primary uppercase tracking-widest"
          >
            More to explore
          </p>
        </div>

        {/* Scrollable body — hairline dividers between styles, no coloured dots */}
        <div className="px-8 pb-8 overflow-y-auto divide-y divide-orange-100">
          {others.map((style) => (
            <div key={style.id} className="text-left py-5 first:pt-2">
              <h3 className="font-heading text-lg font-bold text-quiz-text mb-2">
                {style.name}
              </h3>
              <p className="text-sm text-quiz-text leading-relaxed">
                {style.summary || style.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom overflow hint — cream fade pinned to the card's bottom edge */}
        <div
          className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none bg-gradient-to-t from-quiz-bg via-quiz-bg/80 to-transparent"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
