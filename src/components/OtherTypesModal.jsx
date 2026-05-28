import { useEffect, useMemo } from 'react';
import { X } from 'lucide-react';

/**
 * OtherTypesModal
 *
 * Surfaced from the results screen when the user taps "Explore the other
 * types →". Shows every style the user's top result did NOT include — so
 * in a tie, the tied top styles are excluded too. Each entry renders as
 * dot + name + 2–3 sentence `summary` paragraph.
 *
 * Dismissal:
 *   • Backdrop click
 *   • Close (X) button in the top-right of the card
 *   • Escape key
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
  // The caller should already hide the trigger in this case.
  if (others.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-quiz-bg/90 animate-tie-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="other-types-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md max-h-[88vh] flex flex-col bg-white rounded-2xl shadow-xl border border-orange-100 animate-tie-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close X — absolute, top-right of the card */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full text-quiz-text/60 hover:text-quiz-text hover:bg-interactive-cream focus:outline-none focus:ring-4 focus:ring-quiz-primary/30 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-2 text-center">
          <p className="text-xs font-extrabold text-quiz-primary uppercase tracking-widest mb-2">
            More to explore
          </p>
          <h2
            id="other-types-title"
            className="font-heading text-2xl font-black text-quiz-text leading-tight"
          >
            The Other Types
          </h2>
        </div>

        {/* Scrollable body */}
        <div className="px-6 pb-6 pt-2 overflow-y-auto flex flex-col gap-5">
          {others.map((style) => (
            <div key={style.id} className="text-left">
              <h3 className="font-heading text-lg font-bold text-quiz-text flex items-start gap-2 mb-2">
                <span
                  className="w-3 h-3 mt-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: style.color }}
                  aria-hidden="true"
                />
                <span>{style.name}</span>
              </h3>
              <p className="text-sm text-quiz-text/80 leading-relaxed">
                {style.summary || style.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
