import React, { useEffect } from 'react';
import { isEmbedded } from '../utils/iframeBridge';

/*
 * SmoothieKing Learnings — unified landing-card chrome.
 * Keep this file identical across every project in the sk-learning repo.
 *
 *   Card width:    max-w-md  (448px)
 *   Page padding:  p-3       (12px — minimized, flat at every breakpoint)
 *   Card padding:  p-6       (24px — flat at every breakpoint)
 *
 * Same values are mirrored inline in the thermostat game's WelcomeScreen.
 * When changing any value, mirror the edit into every other LayoutWrapper
 * AND into leadership_thermostat_game/src/components/WelcomeScreen.jsx +
 * intro/LandingStep.jsx.
 */
export default function LayoutWrapper({ children }) {
  const embedded = isEmbedded();

  useEffect(() => {
    if (embedded) {
      document.documentElement.classList.add('embed-mode');
      document.body.classList.add('embed-mode');
    }
    return () => {
      document.documentElement.classList.remove('embed-mode');
      document.body.classList.remove('embed-mode');
    };
  }, [embedded]);

  if (embedded) {
    // Embed mode: no card chrome, no fixed background — host page shows
    // through past the content so the iframe doesn't paint a cream void.
    return (
      <div className="text-quiz-text">
        <main className="w-full max-w-md mx-auto p-3">
          <div className="flex flex-col items-center text-center">
            {children}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-quiz-bg text-quiz-text flex flex-col items-center justify-center p-3">
      <main className="w-full max-w-md bg-white/50 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 overflow-hidden relative">
        <div className="p-6 flex flex-col items-center text-center">
          {children}
        </div>
      </main>
    </div>
  );
}
