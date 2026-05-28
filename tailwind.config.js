/** @type {import('tailwindcss').Config} */
/*
 * SmoothieKing Learnings — unified design system.
 * This config is intentionally identical across every project in the
 * sk-learning repo (appreciation / communication / leadership style quizzes
 * and the leadership thermostat game). When adding a new token, add it here
 * AND mirror the change into every other project's tailwind.config.js so the
 * system stays in sync.
 */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        heading: ['"Playfair Display"', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        body: ['"DM Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      colors: {
        // Brand
        brand: '#930018',
        'brand-dark': '#7a0014',   // hover state for any brand-red surface
        'brand-deep': '#40000F',
        'brand-bright': '#E31F26',

        // Surfaces
        'bg-primary': '#FFF9EF',
        'bg-light': '#FFDEE5',
        'bg-soft-blue': '#D6E0FF',
        'interactive-cream': '#fff5e6', // selected / hover bg for option cards
        'surface-track':     '#FFF7ED', // progress bar tracks, subtle warm surfaces

        // Mood tints
        'pink-light': '#FFDEE5',
        'pink-mid': '#FFADB0',
        'blue-light': '#D6E0FF',
        'blue-mid': '#9BB4FF',
        'green-light': '#D0FCA1',
        'green-mid': '#B7EB7F',

        // Accent palette — shared across every style result card
        'accent-amber':  '#F4A261',
        'accent-coral':  '#E76F51',
        'accent-teal':   '#2A9D8F',
        'accent-gold':   '#E9C46A',
        'accent-violet': '#6A4C93',

        // Error / invalid state
        'error':       '#EF4444',
        'error-light': '#FEF2F2',
        'error-soft':  '#FCA5A5',

        // Backwards-compatible aliases (legacy class names still in use)
        'quiz-bg':       '#FFF9EF',
        'quiz-primary':  '#930018',
        'quiz-text':     '#40000F',
        'style-teacher': '#F4A261',
        'style-role':    '#E76F51',
        'style-coach':   '#2A9D8F',
        'style-supporter': '#E9C46A',
      },
      borderRadius: {
        pill: '999px',
      },
      boxShadow: {
        // Chart tooltip drop shadow — matches Tailwind shadow-md, named so
        // Recharts inline-style blocks can reference a documented token.
        'chart-tooltip': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
}
