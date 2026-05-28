import React, { useEffect } from 'react';
import { isEmbedded } from '../utils/iframeBridge';

/*
 * SmoothieKing Learnings — unified landing-card chrome.
 * Keep this file identical across every project in the sk-learning repo.
 *
 *   Card width:       max-w-md       (448px)
 *   Card min-height:  min-h-[480px]  (480px — universal floor; cards never collapse below this)
 *   Page padding:     p-3            (12px — minimized, flat at every breakpoint)
 *   Card padding:     p-6            (24px — flat at every breakpoint)
 *
 * The card uses `flex flex-col` so the inner content can grow (`flex-1`)
 * and vertically center (`justify-center`) when the content is shorter
 * than the 480px minimum. Same values are mirrored inline in the
 * thermostat game's WelcomeScreen + intro/LandingStep.
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
    // Embed mode: no card chrome, no fixed background, no min-height — the
    // iframe host controls the outer dimensions. Host page shows through
    // past the content so the iframe doesn't paint a cream void.
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
      <main className="w-full max-w-md min-h-[480px] bg-white/50 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 overflow-hidden relative flex flex-col">
        <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
          {children}
        </div>
      </main>
    </div>
  );
}
