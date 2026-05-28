import React, { useEffect, useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CheckCircle2, ChevronDown } from 'lucide-react';
import { announceToScreenReader } from '../skills/a11yUtils';
import { emitComplete } from '../utils/iframeBridge';

export default function ResultsScreen({ resultsData, onRestart }) {
  const { allScores, topStyles } = resultsData;

  useEffect(() => {
    const styleNames = topStyles.map(s => s.name).join(' and ');
    announceToScreenReader(`Quiz complete. Your primary style is ${styleNames}.`);
  }, [topStyles]);

  const handleComplete = () => {
    emitComplete();
    onRestart();
  };

  const [openSections, setOpenSections] = useState({});
  const isSectionOpen = (key, defaultOpen) =>
    openSections[key] !== undefined ? openSections[key] : defaultOpen;
  const toggleSection = (key, defaultOpen) => {
    setOpenSections(prev => {
      const current = prev[key] !== undefined ? prev[key] : defaultOpen;
      return { ...prev, [key]: !current };
    });
  };

  const chartData = useMemo(() => {
    return allScores.filter(s => s.score > 0).map(s => ({
      name: s.name,
      value: s.score,
      color: s.color
    }));
  }, [allScores]);

  const sortedScores = useMemo(() => [...allScores].sort((a, b) => b.score - a.score), [allScores]);
  const isTie = topStyles.length > 1;

  return (
    <div id="result-capture-area" className="w-full flex flex-col items-center animate-fade-in">
      <span className="text-[10px] font-extrabold text-quiz-primary uppercase tracking-widest">
        Your Results
      </span>
      {isTie ? (
        <h1 className="font-heading text-lg sm:text-xl md:text-2xl font-black text-quiz-text text-center leading-tight">
          You are a Hybrid Leader
        </h1>
      ) : (
        <h1 className="font-heading text-lg sm:text-xl md:text-2xl font-black text-quiz-text text-center leading-tight">
          {topStyles[0].name}
        </h1>
      )}
      {isTie && (
        <p className="text-[11px] sm:text-xs text-quiz-text/80 text-center mt-0.5">
          {topStyles.map(s => <strong key={s.id} className="text-quiz-primary">{s.name}</strong>).reduce((prev, curr) => [prev, ' & ', curr])}
        </p>
      )}

      <div className="w-full grid grid-cols-2 gap-2 sm:gap-3 mt-2 sm:mt-3">
        <div
          className="h-32 sm:h-40 flex justify-center items-center"
          aria-label={`Donut chart showing score breakdown. Highest scores are ${topStyles.map(s=>s.name).join(', ')}.`}
          role="img"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="38%"
                outerRadius="78%"
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value} pts`, name]}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', padding: '6px 10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-1 sm:gap-1.5 justify-center text-left">
          {sortedScores.map((style) => (
            <div key={style.id}>
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: style.color }} />
                  <span className="font-semibold text-quiz-text text-[10px] sm:text-[11px] truncate">{style.name}</span>
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold text-quiz-text/70 tabular-nums ml-1.5">
                  {style.score}/{style.maxPossible}
                </span>
              </div>
              <div className="w-full h-1 sm:h-1.5 bg-orange-50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${style.percentage}%`, backgroundColor: style.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full flex flex-col gap-2 mt-2 sm:mt-3 text-left">
        {topStyles.map((style) => {
          const scored = allScores.find(s => s.id === style.id);
          const defaultOpen = !isTie;
          const shineKey = `${style.id}-shine`;
          const struggleKey = `${style.id}-struggle`;
          const shineOpen = isSectionOpen(shineKey, defaultOpen);
          const struggleOpen = isSectionOpen(struggleKey, defaultOpen);
          return (
            <div key={style.id} className="bg-white p-2.5 sm:p-3 rounded-xl border border-orange-50">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="text-xs sm:text-sm font-bold text-quiz-text flex flex-col min-w-0">
                  <span className="truncate">{style.name}</span>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-quiz-text/60 uppercase tracking-wide">{style.subtitle}</span>
                </h3>
                {scored && (
                  <span className="flex-shrink-0 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: style.color }}>
                    {scored.score}/{scored.maxPossible}
                  </span>
                )}
              </div>

              <div className="text-[10px] sm:text-[11px] mb-1.5 sm:mb-2">
                <strong className="text-quiz-primary">Focus:</strong> <span className="text-quiz-text/90">{style.focus}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="bg-green-50/50 rounded-lg border border-green-100 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection(shineKey, defaultOpen)}
                    aria-expanded={shineOpen}
                    className="w-full p-2 sm:p-2.5 flex items-center justify-between text-[9px] sm:text-[10px] uppercase tracking-wide text-green-800 font-bold cursor-pointer hover:bg-green-50/60 transition-colors"
                  >
                    <span>Where You Shine</span>
                    <ChevronDown size={12} className={`transition-transform duration-300 ease-out ${shineOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${shineOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                      <ul className="px-2 pb-2 sm:px-2.5 sm:pb-2.5 text-[10px] sm:text-[11px] text-quiz-text/80 space-y-1 sm:space-y-1.5">
                        {style.strengths.map((s, i) => (
                          <li key={i} className="leading-snug">
                            <strong className="text-quiz-text font-semibold">{s.title}: </strong>
                            <span>{s.description}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50/50 rounded-lg border border-red-100 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection(struggleKey, defaultOpen)}
                    aria-expanded={struggleOpen}
                    className="w-full p-2 sm:p-2.5 flex items-center justify-between text-[9px] sm:text-[10px] uppercase tracking-wide text-quiz-primary font-bold cursor-pointer hover:bg-red-50/60 transition-colors"
                  >
                    <span>Where You Might Struggle</span>
                    <ChevronDown size={12} className={`transition-transform duration-300 ease-out ${struggleOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${struggleOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                      <ul className="px-2 pb-2 sm:px-2.5 sm:pb-2.5 text-[10px] sm:text-[11px] text-quiz-text/80 space-y-1 sm:space-y-1.5">
                        {style.blindSpots.map((b, i) => (
                          <li key={i} className="leading-snug">
                            <strong className="text-quiz-text font-semibold">{b.title}: </strong>
                            <span>{b.description}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="w-full flex justify-center mt-2 sm:mt-3">
        <button
          onClick={handleComplete}
          className="min-h-[40px] sm:min-h-[44px] flex items-center justify-center gap-1.5 sm:gap-2 px-6 sm:px-8 py-2 sm:py-2.5 bg-quiz-primary text-[#FFF9EF] rounded-lg font-bold text-xs sm:text-sm hover:bg-[#7a0014] focus:outline-none focus:ring-4 focus:ring-quiz-primary/50 transition-all shadow-md active:scale-95"
          aria-label="Mark this lesson as complete"
        >
          <CheckCircle2 size={14} className="sm:hidden" />
          <CheckCircle2 size={16} className="hidden sm:inline" />
          Complete
        </button>
      </div>
    </div>
  );
}
