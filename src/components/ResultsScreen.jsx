import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Share2, RotateCcw } from 'lucide-react';
import { announceToScreenReader } from '../skills/a11yUtils';
import { exportAndShare } from '../skills/exportAndShare';
import OtherTypesModal from './OtherTypesModal';
import { STYLES } from '../data/stylesData';

// Strip the "The " prefix from style names so the one-row legend stays
// readable at 9px on a mobile viewport (Leadership subtitles are too long
// to fit four-across with `flex-nowrap`, so the trimmed name is used here).
const legendLabel = (name) => name.replace(/^The\s+/i, '');

export default function ResultsScreen({ resultsData, onRestart }) {
  const { allScores, topStyles } = resultsData;

  // "Explore the other types" modal state. The trigger button auto-hides
  // when no "other" types remain (all styles are tied at the top).
  const [otherTypesOpen, setOtherTypesOpen] = useState(false);
  const otherTypesAvailable = useMemo(() => {
    const topIds = new Set(topStyles.map(s => s.id));
    return STYLES.some(s => !topIds.has(s.id));
  }, [topStyles]);

  useEffect(() => {
    const styleNames = topStyles.map(s => s.name).join(' and ');
    announceToScreenReader(`Quiz complete. Your primary style is ${styleNames}.`);
  }, [topStyles]);

  // Single accordion per detail tile — one toggle reveals BOTH the full
  // "Where You Might Shine" and "Where You Might Struggle" prose blocks.
  const [openSections, setOpenSections] = useState({});
  const isOpen = (key) => !!openSections[key];
  const toggleSection = (key) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Sorted high → low so the dominant style sits at the leading edge of the
  // stacked bar and the legend reads dominant → recessive. Percentages sum
  // to 100 (±1 from rounding).
  const chartData = useMemo(() => {
    return [...allScores]
      .sort((a, b) => b.score - a.score)
      .map(s => ({
        name: s.name,
        subtitle: s.subtitle,
        percentage: s.percentage,
        score: s.score,
        maxPossible: s.maxPossible,
        color: s.color,
      }));
  }, [allScores]);

  const isTie = topStyles.length > 1;

  const handleShare = () => {
    exportAndShare('result-capture-area', 'leadership-style-result.png');
  };

  return (
    <div className="w-full flex flex-col items-center animate-fade-in">
      {/*
        CAPTURE AREA — everything between this opening div and its close is
        rendered into the share-as-image PNG via html2canvas. The action
        buttons below live outside it so the screenshot stays focused on
        the result content itself.
      */}
      <div id="result-capture-area" className="w-full flex flex-col items-center p-2 rounded-2xl">
        {/* Kicker */}
        <h2 className="text-xs font-extrabold text-quiz-primary uppercase tracking-widest">
          Your Results
        </h2>

        {/*
          PROPORTIONAL STACKED BAR
          Single horizontal bar = 100% of answers, segments per style sized by
          `flex: percentage`. Zero-score styles are filtered out (legend below
          still lists them). minWidth: 4px keeps very small (1–3%) segments
          visible as a thin sliver instead of collapsing.
          `animate-bar-fill` reveals the bar from the left after the rest of
          the header has rendered (keyframes in src/index.css).
        */}
        <div
          className="w-full h-8 mt-2 flex bg-surface-track rounded-full overflow-hidden shadow-sm animate-bar-fill"
          role="img"
          aria-label={`Score breakdown. ${chartData.map(s => `${s.subtitle} ${s.percentage} percent`).join(', ')}.`}
        >
          {chartData.filter(s => s.percentage > 0).map((s) => (
            <div
              key={s.name}
              className="h-full"
              style={{
                flex: s.percentage,
                backgroundColor: s.color,
                minWidth: '4px',
              }}
              title={`${s.subtitle}: ${s.percentage}% (${s.score}/${s.maxPossible} pts)`}
            />
          ))}
        </div>

        {/*
          LEGEND — one row, nowrap. Uses the trimmed style name (see legendLabel)
          because the full subtitles ("Servant/Secure Base Leadership" etc.) are
          too long to fit four-across at 9px on a 375px viewport.
        */}
        <div className="w-full flex flex-nowrap justify-center gap-x-3 mt-2 text-[9px]">
          {chartData.filter(s => s.percentage > 0).map((s) => (
            <div key={s.name} className="flex items-center gap-[0.1rem]">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: s.color }}
                aria-hidden="true"
              />
              <span className="font-semibold text-quiz-text">{legendLabel(s.name)}</span>
              <span className="text-quiz-text/60">{s.percentage}%</span>
            </div>
          ))}
        </div>

        {/* H1 — single style name, or compact "Hybrid Leader" label in a tie */}
        {isTie ? (
          <h1 className="font-heading text-xs font-black text-quiz-text mt-6 mb-2 text-center">
            You are a Hybrid Leader
          </h1>
        ) : (
          <h1 className="font-heading text-3xl font-black text-quiz-text mt-6 mb-2 text-center">
            {topStyles[0].name}
          </h1>
        )}

        {/*
          Detail tile(s) — bare wrapper, no chrome. In a tie, two (or more)
          tiles stack with gap-8 for breathing room since there's no
          background to separate them.
        */}
        <div className={`w-full flex flex-col text-left ${isTie ? 'gap-8' : ''}`}>
          {topStyles.map((style) => {
            const accordionKey = `${style.id}-full`;
            const open = isOpen(accordionKey);
            return (
              <div key={style.id}>
                {/* Approach / Focus — centered, 12px, deep brown, stacked on two lines */}
                <div className="text-xs text-center mb-4 text-quiz-text space-y-0.5">
                  <div>
                    <strong className="text-quiz-text">Approach:</strong>{' '}
                    <span className="text-quiz-text/80">{style.subtitle}</span>
                  </div>
                  <div>
                    <strong className="text-quiz-text">Focus:</strong>{' '}
                    <span className="text-quiz-text/80">{style.focus}</span>
                  </div>
                </div>

                {/*
                  Strengths + Blind Spots — concise summary. Hides
                  completely when the full-description accordion opens
                  (max-height collapses to 0, opacity fades, and the
                  element becomes invisible to assistive tech). Uses
                  max-h-[600px] as a generous ceiling so the open height
                  animates from 0 → content height; the actual rendered
                  height is whatever the content needs, not 600px.
                */}
                <div
                  className={`overflow-hidden transition-[max-height,opacity,visibility] duration-300 ease-out ${open ? 'max-h-0 opacity-0 invisible' : 'max-h-[600px] opacity-100 visible'}`}
                  aria-hidden={open}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                      <strong className="w-28 flex-shrink-0 text-base uppercase text-green-800">Strengths</strong>
                      <ul className="list-disc pl-5 text-xs text-quiz-text/80 space-y-1 flex-1">
                        {style.strengths.map((s, i) => (
                          <li key={i}>{s.title}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex gap-3">
                      <strong className="w-28 flex-shrink-0 text-base uppercase text-quiz-primary">Blind Spots</strong>
                      <ul className="list-disc pl-5 text-xs text-quiz-text/80 space-y-1 flex-1">
                        {style.blindSpots.map((b, i) => (
                          <li key={i}>{b.title}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Single accordion toggle — reveals both full descriptions */}
                <button
                  type="button"
                  onClick={() => toggleSection(accordionKey)}
                  aria-expanded={open}
                  aria-controls={`${accordionKey}-content`}
                  className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-quiz-primary hover:underline focus:outline-none focus:ring-2 focus:ring-quiz-primary/40 rounded"
                >
                  <span>{open ? 'Hide full description' : 'Show full description'}</span>
                  <ChevronDown size={14} className={`transition-transform duration-300 ease-out ${open ? 'rotate-180' : ''}`} />
                </button>

                {/*
                  Expanded content — labels sit ABOVE their lists (vertical
                  stack) instead of side-by-side, because the description
                  prose is substantial and would compress awkwardly in the
                  narrow right column of the side-by-side pattern.
                  Mirrors the summary's hide/show pattern: max-height
                  collapses to 0 + opacity fades + invisible swaps the
                  reachability. max-h-[1200px] is a generous ceiling for
                  the longer prose content.
                */}
                <div
                  id={`${accordionKey}-content`}
                  className={`overflow-hidden transition-[max-height,opacity,visibility] duration-300 ease-out ${open ? 'max-h-[1200px] opacity-100 visible' : 'max-h-0 opacity-0 invisible'}`}
                  aria-hidden={!open}
                >
                  <div className="flex flex-col gap-4 mt-3">
                    <div>
                      <strong className="block mb-2 text-base uppercase text-green-800">Where You Might Shine</strong>
                      <ul className="list-disc pl-5 text-xs text-quiz-text/80 space-y-2">
                        {style.strengths.map((s, i) => (
                          <li key={i}>
                            <span className="font-bold">{s.title}.</span>{' '}
                            <span className="leading-relaxed">{s.description}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong className="block mb-2 text-base uppercase text-quiz-primary">Where You Might Struggle</strong>
                      <ul className="list-disc pl-5 text-xs text-quiz-text/80 space-y-2">
                        {style.blindSpots.map((b, i) => (
                          <li key={i}>
                            <span className="font-bold">{b.title}.</span>{' '}
                            <span className="leading-relaxed">{b.description}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/*
        ACTION BUTTONS — outside the capture area so they don't appear in
        the shared/saved PNG. Share triggers exportAndShare (Web Share API
        with download fallback); Retake routes back to the welcome screen.
        `emitComplete()` for the Rise 360 host has already been fired in
        App.jsx when the results screen mounted, so no need to refire here.
      */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-4 sm:mt-6">
        <button
          onClick={handleShare}
          className="w-full max-w-[280px] sm:flex-1 sm:max-w-xs min-h-[44px] flex items-center justify-center gap-2 px-6 py-4 bg-quiz-primary text-quiz-bg rounded-xl font-bold text-base hover:bg-brand-dark focus:outline-none focus:ring-4 focus:ring-quiz-primary/50 transition-all shadow-md active:scale-95"
          aria-label="Share or download my result image"
        >
          <Share2 size={20} /> Share Result
        </button>

        <button
          onClick={onRestart}
          className="w-full max-w-[280px] sm:flex-1 sm:max-w-xs min-h-[44px] flex items-center justify-center gap-2 px-6 py-4 bg-white text-quiz-primary border-2 border-quiz-primary rounded-xl font-bold text-base hover:bg-interactive-cream focus:outline-none focus:ring-4 focus:ring-quiz-primary/30 transition-all active:scale-95"
          aria-label="Retake the quiz"
        >
          <RotateCcw size={20} /> Retake Quiz
        </button>
      </div>

      {/*
        "Explore the other types →" footer link — quiet, low-priority
        affordance, sits below the CTAs so it doesn't compete with the
        in-card "Show full description" accordion for visual hierarchy.
        Auto-hidden when no other types remain (rare full-tie edge case).
      */}
      {otherTypesAvailable && (
        <button
          type="button"
          onClick={() => setOtherTypesOpen(true)}
          className="mt-3 mx-auto text-xs font-medium text-quiz-text/60 hover:text-quiz-primary focus:outline-none focus:ring-2 focus:ring-quiz-primary/30 transition-colors rounded-md px-2 py-1"
          aria-label="Explore the other leadership types"
        >
          Explore the other types →
        </button>
      )}

      {otherTypesOpen && (
        <OtherTypesModal
          allStyles={STYLES}
          topStyles={topStyles}
          onClose={() => setOtherTypesOpen(false)}
        />
      )}
    </div>
  );
}
