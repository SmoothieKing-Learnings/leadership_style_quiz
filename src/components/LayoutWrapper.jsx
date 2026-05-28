import React, { useEffect } from 'react';
import { isEmbedded } from '../utils/iframeBridge';

/*
 * SmoothieKing Learnings — unified landing-card chrome.
 * Keep this file identical across every project in the sk-learning repo so
 * the welcome / quiz / results screens render at the same mobile-friendly
 * size on every experience. The card uses `max-w-md` (448px) for both
 * standalone and embed mode so it stays phone-shaped on desktop and fills
 * the viewport on actual phones.
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
        <main className="w-full max-w-md mx-auto px-3 py-4 sm:px-6 sm:py-6">
          <div className="flex flex-col items-center text-center">
            {children}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-quiz-bg text-quiz-text flex flex-col items-center justify-center p-4 sm:p-6">
      <main className="w-full max-w-md bg-white/50 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 overflow-hidden relative">
        <div className="p-6 sm:p-8 flex flex-col items-center text-center">
          {children}
        </div>
      </main>
    </div>
  );
}
