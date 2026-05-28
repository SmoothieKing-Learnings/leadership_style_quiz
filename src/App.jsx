import { useState, useEffect, useRef, useCallback } from 'react';
import LayoutWrapper from './components/LayoutWrapper';
import WelcomeScreen from './components/WelcomeScreen';
import QuizScreen from './components/QuizScreen';
import ResultsScreen from './components/ResultsScreen';
import { calculateResults } from './skills/calculateResults';
import { STYLES } from './data/stylesData';
import { emit, emitComplete, reportSize, onCommand } from './utils/iframeBridge';

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [resultsData, setResultsData] = useState(null);

  const startQuiz = useCallback(() => {
    setCurrentScreen('quiz');
  }, []);

  const handleQuizComplete = useCallback((answers) => {
    const results = calculateResults(answers, STYLES);
    setResultsData(results);
    setCurrentScreen('results');
  }, []);

  const restartQuiz = useCallback(() => {
    setResultsData(null);
    setCurrentScreen('welcome');
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
      {currentScreen === 'results' && resultsData && (
        <ResultsScreen resultsData={resultsData} onRestart={restartQuiz} />
      )}
    </LayoutWrapper>
  );
}

export default App;
