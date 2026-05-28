import { motion } from 'framer-motion';
import logo from '../assets/logo.png';

export default function WelcomeScreen({ onStart }) {
  return (
    <div className="w-full animate-fade-in flex flex-col items-center">
      {/* Element 1 — logo (delayed slightly, comes from above) */}
      <motion.img
        src={logo}
        alt="Smoothie King Logo"
        className="w-24 h-auto mb-5"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.10, duration: 0.45, ease: 'easeOut' }}
      />

      {/* Element 2 — headline (rises from below) */}
      <motion.h1
        className="font-heading text-3xl md:text-5xl font-extrabold text-quiz-primary mb-6 tracking-tight"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.20, duration: 0.45 }}
      >
        Discover Your Leadership Style
      </motion.h1>

      {/* Element 3 — divider (horizontal reveal) */}
      <motion.div
        className="w-16 h-0.5 bg-quiz-primary/40 mb-6 rounded-full"
        style={{ transformOrigin: 'center' }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.30, duration: 0.40, ease: 'easeOut' }}
        aria-hidden="true"
      />

      {/* Element 4 — body text */}
      <motion.p
        className="text-base md:text-lg text-quiz-text/80 mb-10 max-w-md"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38, duration: 0.40 }}
      >
        Take this short assessment to uncover your primary style, strengths, and blind spots as a leader.
      </motion.p>

      {/* Element 5 — CTAs block */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.50, duration: 0.40 }}
      >
        <button
          onClick={onStart}
          className="min-h-[44px] min-w-[44px] px-8 py-4 bg-quiz-primary text-quiz-bg rounded-xl font-bold text-base hover:bg-brand-dark focus:outline-none focus:ring-4 focus:ring-quiz-primary/50 transition-all shadow-lg hover:shadow-xl active:scale-95"
          aria-label="Start the Leadership Style Quiz"
        >
          Let's Blend!
        </button>
      </motion.div>
    </div>
  );
}
