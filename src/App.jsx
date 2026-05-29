import { useState, useEffect, useRef, useCallback } from 'react';
import LayoutWrapper from './components/LayoutWrapper';
import WelcomeScreen from './components/WelcomeScreen';
import QuizScreen from './components/QuizScreen';
import ResultsScreen from './components/ResultsScreen';
import TieBreakerScreen from './components/TieBreakerScreen';
import { calculateResults } from './skills/calculateResults';
import {
  findTieBreakerCandidates,
  MAX_TIE_BREAKER_ATTEMPTS,
} from './skills/tieBreaker';
import { STYLES } from './data/stylesData';
import { QUESTIONS } from './data/questionsData';
import { emit, emitComplete, reportSize, onCommand } from './utils/iframeBridge';

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [resultsData, setResultsData] = useState(null);

  // Tie-breaker context. Set when calculateResults returns multiple top
  // styles AND qualifying non-tied-pick candidates exist. Cleared when the
  // tie-breaker resolves (single top style) OR the attempt budget runs out.
  //   {
  //     answers:           string[]     mutable across attempts
  //     shuffledQuestions: Question[]   QuizScreen's local shuffle, passed up
  //     attemptIdx:        number       0..MAX-1
  //     usedCandidates:    Set<number>  question indices already used
  //   }
  const [tieBreakerCtx, setTieBreakerCtx] = useState(null);

  const startQuiz = useCallback(() => {
    setCurrentScreen('quiz');
  }, []);

  // Helper: decide where to route given a candidate `results` payload.
  // Either to 'tieBreaker' (with context) or directly to 'results'.
  const finalizeOrTieBreak = useCallback((answers, shuffledQuestions, attemptIdx, usedCandidates) => {
    const results = calculateResults(answers, STYLES);
    const isTied = results.topStyles.length > 1;

    if (!isTied) {
      setResultsData(results);
      setTieBreakerCtx(null);
      setCurrentScreen('results');
      return;
    }

    // Cap reached — show Hybrid.
    if (attemptIdx >= MAX_TIE_BREAKER_ATTEMPTS) {
      setResultsData(results);
      setTieBreakerCtx(null);
      setCurrentScreen('results');
      return;
    }

    // Tie + budget left — check for candidates.
    const tiedIds = new Set(results.topStyles.map(s => s.id));
    const pool = findTieBreakerCandidates(answers, tiedIds, usedCandidates);
    if (pool.length === 0) {
      // No qualifying candidates — accept Hybrid.
      setResultsData(results);
      setTieBreakerCtx(null);
      setCurrentScreen('results');
      return;
    }

    // Enter / continue the tie-breaker.
    setTieBreakerCtx({
      answers,
      shuffledQuestions,
      tiedStyleIds: tiedIds,
      attemptIdx,
      usedCandidates,
    });
    setCurrentScreen('tieBreaker');
  }, []);

  const handleQuizComplete = useCallback((answers, shuffledQuestions) => {
    finalizeOrTieBreak(answers, shuffledQuestions, 0, new Set());
  }, [finalizeOrTieBreak]);

  const handleTieBreakerAttempt = useCallback((newAnswers, newUsedCandidates) => {
    if (!tieBreakerCtx) return;
    finalizeOrTieBreak(
      newAnswers,
      tieBreakerCtx.shuffledQuestions,
      tieBreakerCtx.attemptIdx + 1,
      newUsedCandidates,
    );
  }, [tieBreakerCtx, finalizeOrTieBreak]);

  const handleNoCandidates = useCallback(() => {
    if (!tieBreakerCtx) return;
    const results = calculateResults(tieBreakerCtx.answers, STYLES);
    setResultsData(results);
    setTieBreakerCtx(null);
    setCurrentScreen('results');
  }, [tieBreakerCtx]);

  const restartQuiz = useCallback(() => {
    setResultsData(null);
    setTieBreakerCtx(null);
    setCurrentScreen('welcome');
  }, []);

  // Rehydrate the Results screen from URL params on first mount. Used by the
  // iframe "Open to share" button on ResultsScreen — it opens the canonical
  // live URL with `?scores=<id>:<n>,<id>:<n>` so the new top-level tab lands
  // on the exact same Results state without making the user retake the quiz.
  // After rehydration we strip the params so a refresh resets to Welcome and
  // the address bar stays clean. (This project has no participant name capture,
  // so the `name` param from the reference is omitted.)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const scoresParam = params.get('scores');
    if (!scoresParam) return;

    const scoreMap = {};
    scoresParam.split(',').forEach(pair => {
      const [id, scoreStr] = pair.split(':');
      const score = parseInt(scoreStr, 10);
      if (id && Number.isFinite(score) && score >= 0) {
        scoreMap[id] = score;
      }
    });

    const knownIds = new Set(STYLES.map(s => s.id));
    if (!Object.keys(scoreMap).some(id => knownIds.has(id))) return;

    const totalQuestions = QUESTIONS.length;
    const allScores = STYLES.map(style => {
      const score = scoreMap[style.id] || 0;
      return {
        ...style,
        score,
        percentage: Math.round((score / totalQuestions) * 100),
        maxPossible: totalQuestions,
      };
    });

    let maxScore = -1;
    let topStyles = [];
    allScores.forEach(s => {
      if (s.score > maxScore) {
        maxScore = s.score;
        topStyles = [s];
      } else if (s.score === maxScore) {
        topStyles.push(s);
      }
    });

    setResultsData({ allScores, topStyles });
    setTieBreakerCtx(null);
    setCurrentScreen('results');

    window.history.replaceState({}, '', window.location.pathname);
  }, []);

  // Mount: announce ready, report size, honor ?autostart=1
  useEffect(() => {
    emit('ready');
    reportSize();

    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      const t = setTimeout(() => startQuiz(), 50);
      return () => clearTimeout(t);
    }
  }, [startQuiz]);

  // Debounced resize + orientation reporting
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let timer = null;
    const schedule = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => { timer = null; reportSize(); }, 150);
    };
    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);
    return () => {
      window.removeEventListener('resize', schedule);
      window.removeEventListener('orientationchange', schedule);
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Best-effort wheel forwarding to host (rAF-throttled)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let frame = 0;
    let lastDelta = 0;
    const onWheel = (e) => {
      lastDelta = e.deltaY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        emit('wheel', { deltaY: lastDelta });
      });
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Inbound host commands
  useEffect(() => {
    const off = onCommand((command) => {
      if (command === 'start') startQuiz();
      if (command === 'restart') restartQuiz();
    });
    return off;
  }, [startQuiz, restartQuiz]);

  // Outbound screen transitions + completion
  const prevScreen = useRef(currentScreen);
  useEffect(() => {
    const prev = prevScreen.current;
    prevScreen.current = currentScreen;
    if (prev === currentScreen) return;

    if (prev === 'welcome' && currentScreen === 'quiz') {
      emit('start');
    } else if (currentScreen === 'results' && resultsData) {
      emit('results', {
        topStyles: resultsData.topStyles?.map(s => s.name),
        allScores: resultsData.allScores?.map(s => ({ name: s.name, score: s.score })),
      });
      emitComplete();
    } else if (prev === 'results' && currentScreen === 'welcome') {
      emit('restart');
    }
  }, [currentScreen, resultsData]);

  return (
    <LayoutWrapper>
      {currentScreen === 'welcome' && <WelcomeScreen onStart={startQuiz} />}
      {currentScreen === 'quiz' && <QuizScreen onComplete={handleQuizComplete} />}
      {currentScreen === 'tieBreaker' && tieBreakerCtx && (
        <TieBreakerScreen
          key={`tb-${tieBreakerCtx.attemptIdx}`}
          answers={tieBreakerCtx.answers}
          shuffledQuestions={tieBreakerCtx.shuffledQuestions}
          tiedStyleIds={tieBreakerCtx.tiedStyleIds}
          attemptIdx={tieBreakerCtx.attemptIdx}
          usedCandidates={tieBreakerCtx.usedCandidates}
          onAttemptComplete={handleTieBreakerAttempt}
          onNoCandidates={handleNoCandidates}
        />
      )}
      {currentScreen === 'results' && resultsData && (
        <ResultsScreen resultsData={resultsData} onRestart={restartQuiz} />
      )}
    </LayoutWrapper>
  );
}

export default App;
