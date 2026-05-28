import { useEffect, useMemo, useState } from 'react';
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
    <div id="result-capture-area" className="w-full flex flex-col items-center animate-fade-in p-2 rounded-2xl">
      <h2 className="text-xs font-extrabold text-quiz-primary uppercase tracking-widest mb-2">
        Your Results
      </h2>
      {isTie ? (
        <h1 className="font-heading text-3xl md:text-5xl font-black text-quiz-text mb-2 text-center">
          You are a Hybrid Leader
        </h1>
      ) : (
        <h1 className="font-heading text-3xl md:text-5xl font-black text-quiz-text mb-2 text-center">
          {topStyles[0].name}
        </h1>
      )}
      {isTie && (
        <p className="text-base font-medium text-quiz-text/80 mb-6 text-center">
          Your primary styles are {topStyles.map(s => <strong key={s.id} className="text-quiz-primary">{s.name}</strong>).reduce((prev, curr) => [prev, ' and ', curr])}
        </p>
      )}

      <div className="w-full grid grid-cols-2 gap-4 mt-4 sm:mt-6">
        <div
          className="h-40 sm:h-48 flex justify-center items-center"
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

        <div className="flex flex-col gap-2 justify-center text-left">
          {sortedScores.map((style) => (
            <div key={style.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: style.color }} />
                  <span className="font-semibold text-quiz-text text-xs truncate">{style.name}</span>
                </div>
                <span className="text-xs font-bold text-quiz-text/70 tabular-nums ml-2">
                  {style.score}/{style.maxPossible}
                </span>
              </div>
              <div className="w-full h-1.5 bg-surface-track rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${style.percentage}%`, backgroundColor: style.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full flex flex-col gap-3 mt-3 text-left">
        {topStyles.map((style) => {
          const scored = allScores.find(s => s.id === style.id);
          const defaultOpen = !isTie;
          const shineKey = `${style.id}-shine`;
          const struggleKey = `${style.id}-struggle`;
          const shineOpen = isSectionOpen(shineKey, defaultOpen);
          const struggleOpen = isSectionOpen(struggleKey, defaultOpen);
          return (
            <div key={style.id} className="bg-white p-3 rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-1">
                <h3 className="text-xl sm:text-2xl font-bold text-quiz-text flex items-start gap-3 min-w-0 break-words">
                  <span className="w-4 h-4 mt-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: style.color }}></span>
                  <span className="min-w-0 break-words">{style.name}</span>
                </h3>
                {scored && (
                  <span className="self-start flex-shrink-0 text-xs font-bold px-3 py-1 rounded-full text-quiz-bg whitespace-nowrap"
                    style={{ backgroundColor: style.color }}>
                    {scored.score}/{scored.maxPossible} pts
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-quiz-text/60 uppercase tracking-wide mb-4 mt-1">
                {style.subtitle}
              </p>

              <div className="text-sm mb-4">
                <strong className="text-quiz-primary">Focus:</strong> <span className="text-quiz-text/90">{style.focus}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50/50 rounded-xl border border-green-100 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection(shineKey, defaultOpen)}
                    aria-expanded={shineOpen}
                    className="w-full p-2.5 flex items-center justify-between text-xs uppercase tracking-wide text-green-800 font-bold cursor-pointer hover:bg-green-50/60 transition-colors"
                  >
                    <span>Strengths</span>
                    <ChevronDown size={14} className={`transition-transform duration-300 ease-out ${shineOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${shineOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                      <ul className="px-2.5 pb-2.5 text-xs text-quiz-text/80 space-y-2 leading-snug">
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
                <div className="bg-red-50/50 rounded-xl border border-red-100 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection(struggleKey, defaultOpen)}
                    aria-expanded={struggleOpen}
                    className="w-full p-2.5 flex items-center justify-between text-xs uppercase tracking-wide text-quiz-primary font-bold cursor-pointer hover:bg-red-50/60 transition-colors"
                  >
                    <span>Blind Spots</span>
                    <ChevronDown size={14} className={`transition-transform duration-300 ease-out ${struggleOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${struggleOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                      <ul className="px-2.5 pb-2.5 text-xs text-quiz-text/80 space-y-2 leading-snug">
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

      <div className="w-full flex justify-center mt-4 sm:mt-6">
        <button
          onClick={handleComplete}
          className="min-h-[44px] flex items-center justify-center gap-2 px-8 py-4 bg-quiz-primary text-quiz-bg rounded-xl font-bold text-base hover:bg-brand-dark focus:outline-none focus:ring-4 focus:ring-quiz-primary/50 transition-all shadow-md active:scale-95"
          aria-label="Mark this lesson as complete"
        >
          <CheckCircle2 size={20} />
          Complete
        </button>
      </div>
    </div>
  );
}
