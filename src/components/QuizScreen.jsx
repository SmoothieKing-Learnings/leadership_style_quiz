import { useState, useEffect } from 'react';
import ProgressBar from './ProgressBar';
import { QUESTIONS } from '../data/questionsData';
import { announceToScreenReader } from '../skills/a11yUtils';

// Fisher-Yates shuffle — returns a new shuffled array, never mutates the original
function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function QuizScreen({ onComplete }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // 'forward' on Next, 'backward' on Back. Drives which slide-in keyframe runs
  // on the question wrapper after the index changes. First mount runs forward.
  const [direction, setDirection] = useState('forward');

  // Shuffle question order AND option order within each question once on mount.
  // The lazy initializer runs only once so the order stays stable during back-navigation.
  const [shuffledQuestions] = useState(() =>
    shuffleArray(QUESTIONS).map(q => ({
      ...q,
      options: shuffleArray(q.options)
    }))
  );

  // Store answers as { questionIndex: styleId } so going back never erases prior picks
  const [answers, setAnswers] = useState({});

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === shuffledQuestions.length - 1;
  const selectedAnswer = answers[currentQuestionIndex]; // previously picked on this question (if any)

  useEffect(() => {
    announceToScreenReader(`Question ${currentQuestionIndex + 1} of ${shuffledQuestions.length}: ${currentQuestion.text}`);
  }, [currentQuestionIndex, currentQuestion, shuffledQuestions.length]);

  const handleOptionSelect = (styleId) => {
    setAnswers({ ...answers, [currentQuestionIndex]: styleId });
  };

  const handleContinue = () => {
    if (!selectedAnswer) return;

    if (isLastQuestion) {
      // Convert object to ordered array of styleIds before sending to results.
      // Also pass shuffledQuestions so the tie-breaker can re-render a chosen
      // question in the same option order the user originally saw.
      const orderedAnswers = shuffledQuestions.map((_, idx) => answers[idx]);
      onComplete(orderedAnswers, shuffledQuestions);
    } else {
      setDirection('forward');
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleGoBack = () => {
    setDirection('backward');
    setCurrentQuestionIndex(prev => prev - 1);
  };

  const handleKeyDown = (e, styleId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOptionSelect(styleId);
    }
  };

  // h-[680px] locks the QuizScreen to a fixed 680px tall card across every
  // question, so the footer never jumps as option counts/lengths vary.
  // The options container takes flex-1 + min-h-0 and each option inside
  // also takes flex-1, so options share leftover vertical space evenly.
  return (
    <div className="w-full h-[680px] flex flex-col items-stretch text-left animate-fade-in py-2">
      <ProgressBar current={currentQuestionIndex + 1} total={shuffledQuestions.length} />

      {/*
        Keyed wrapper — re-mounts whenever currentQuestionIndex changes, which
        re-runs the CSS slide-in animation. Direction picks the keyframe (slide
        from the right on Next, from the left on Back). Progress bar + footer
        sit outside so they stay stable across transitions.
      */}
      <div
        key={currentQuestionIndex}
        className={`flex-1 flex flex-col min-h-0 ${
          direction === 'forward' ? 'animate-question-forward' : 'animate-question-backward'
        }`}
      >
        <h2
          className="font-body text-lg sm:text-xl md:text-2xl font-bold text-quiz-text w-full leading-snug mb-6 sm:mb-8"
          aria-live="polite"
        >
          {currentQuestion.text}
        </h2>

        <div className="w-full flex-1 flex flex-col gap-1 min-h-0">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedAnswer === option.styleId;
            return (
              <div
                key={option.id}
                role="button"
                tabIndex={0}
                onClick={() => handleOptionSelect(option.styleId)}
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
      </div>

      {/* Footer row: Back (if any) + Continue on a single row, pinned to the bottom */}
      <div className="w-full pt-3 flex items-center gap-2 sm:gap-3">
        {currentQuestionIndex > 0 && (
          <button
            onClick={handleGoBack}
            type="button"
            className="flex items-center gap-1 min-h-[44px] px-3 py-2 text-sm font-semibold text-quiz-primary hover:text-brand-dark hover:bg-interactive-cream rounded-lg focus:outline-none focus:ring-2 focus:ring-quiz-primary/40 transition-colors whitespace-nowrap"
            aria-label="Go back to the previous question"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back
          </button>
        )}

        <button
          onClick={handleContinue}
          disabled={!selectedAnswer}
          className={`flex-1 min-h-[44px] py-3 px-4 rounded-xl font-bold text-quiz-bg transition-all duration-300 bg-quiz-primary active:scale-95
            ${selectedAnswer
              ? 'shadow-lg hover:bg-brand-dark'
              : 'opacity-40 cursor-not-allowed shadow-none'
            }`}
        >
          <span className="text-base">
            {isLastQuestion ? 'See My Leadership Style' : 'Next Question'}
          </span>
        </button>
      </div>
    </div>
  );
}
