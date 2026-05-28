# Leadership Style Quiz

A short, self-paced leadership self-assessment from the **SmoothieKing Learnings** team. Store leaders answer seven scenarios drawn from a real Smoothie King shift and receive a personalized result describing how they tend to lead under pressure.

**Live experience:** https://smoothieking-learnings.github.io/leadership_style_quiz/

---

## About the Experience

The quiz helps team captains, shift leaders, and general managers reflect on their natural leadership instincts and identify where they can grow. It is designed to be completed in under three minutes on a phone, tablet, or desktop, and can be taken standalone or embedded inside an Articulate Rise 360 lesson.

Every question maps to one of four leadership styles. The result page surfaces the leader's primary style (or styles, when a tie produces a "Hybrid Leader" result), shows the full distribution across all four styles, and lets the user save or share an image of their result.

### The Four Leadership Styles

| Style | Approach | Focus |
| --- | --- | --- |
| **The Teacher** | Situational leadership — direct instruction, technical and procedural | Building technical confidence |
| **The Role Model** | Modeling leadership — leads by example, sets the standard | Integrity through action |
| **The Coach** | Transformational leadership — asks questions, empowers the team | Asking over telling |
| **The Supporter** | Servant / secure-base leadership — relational, people-first | Emotional safety |

Question and answer copy is documented in [QUIZ_CONTENT.md](QUIZ_CONTENT.md). Scoring logic lives in [`src/skills/calculateResults.js`](src/skills/calculateResults.js): each of the seven questions contributes one point to a style, and the final percentage is `score / 7 × 100`, rounded to the nearest integer.

---

## Participant Experience

- **Welcome.** A branded intro and a single "Let's Blend!" call to action.
- **Quiz.** Seven shift scenarios presented one at a time with a progress bar and a clear "Continue" gate.
- **Results.** Headline with the leader's primary style, donut chart of how their answers distributed across the four styles, the dedicated strengths / blind-spots panel for their top style.
- **Share.** A one-tap option that captures the result card via `html2canvas` and uses the device's native share sheet on mobile, with a clean image download fallback in browsers that don't support Web Share.

Nothing is stored, transmitted, or sent anywhere — the quiz runs entirely in the browser.

---

## Design System

This project ships with the **SmoothieKing Learnings unified design system**, identical across every experience in the `sk-learning` repo. The tokens live in [`tailwind.config.js`](./tailwind.config.js).

### Color tokens

| Token | Hex | Usage |
| --- | --- | --- |
| `brand` | `#930018` | Primary buttons, progress fill, headings on cream |
| `brand-deep` | `#40000F` | Body copy, secondary text |
| `brand-bright` | `#E31F26` | Active / alert accents |
| `bg-primary` | `#FFF9EF` | Default cream surface |
| `bg-light` | `#FFDEE5` | Warm accent surfaces |
| `bg-soft-blue` | `#D6E0FF` | Cool accent surfaces |
| `accent-amber` | `#F4A261` | Style accent (warm honey — Teacher) |
| `accent-coral` | `#E76F51` | Style accent (burnt sienna — Role Model) |
| `accent-teal` | `#2A9D8F` | Style accent (deep teal — Coach) |
| `accent-gold` | `#E9C46A` | Style accent (soft gold — Supporter) |

Legacy aliases (`quiz-bg`, `quiz-primary`, `quiz-text`, `style-teacher`, `style-role`, `style-coach`, `style-supporter`) map to the same hex values and are preserved so existing class names keep working.

Body copy on the primary color switches to `bg-primary` (`#FFF9EF`) to satisfy WCAG contrast.

### Typography

| Token | Family | Usage |
| --- | --- | --- |
| `font-display` / `font-heading` | **Playfair Display**, Georgia, serif | Hero titles, screen headings, result names |
| `font-body` | **DM Sans**, system-ui, sans-serif | All body copy, buttons, labels |

Both families are loaded from Google Fonts in [`index.html`](./index.html) and applied to `<body>` via [`src/index.css`](./src/index.css).

### Iframe / LMS workflow

Embed mode is shared across the system. The universal utility lives at [`src/utils/iframeBridge.js`](./src/utils/iframeBridge.js) and offers:

- `?embed=1` — strips chrome so the experience renders flat inside an iframe.
- `?autostart=1` — skips the welcome screen.
- `?parentOrigin=<encoded>` — locks `postMessage` delivery to one host origin.
- A namespaced `postMessage` contract (`leadershipQuiz:*`) for `ready`, `start`, `results`, `restart`, `resize`, `wheel`.
- A bare `{ type: 'complete' }` fire on the results screen so a Rise 360 Code Block can mark the lesson complete.

Full embed snippets, sizing guidance, and Rise 360 gotchas live in [IFRAME_EMBED.md](./IFRAME_EMBED.md). A more in-depth integration walkthrough — including the host ↔ app `postMessage` contract — lives in [RISE360_INTEGRATION_GUIDE.md](./RISE360_INTEGRATION_GUIDE.md).

---

## Accessibility

- WCAG-compliant contrast on every screen of the warm cream palette.
- Screen-reader announcements at every screen change.
- Full keyboard navigation with visible focus indicators and Enter / Space selection.
- Touch targets meet the 44×44 px standard used across iOS and Android.
- Mobile-first layout with a `max-w-2xl` desktop cap that stays legible on small viewports without horizontal scroll.
- Continuous accessibility auditing via `@axe-core/react` during development.

---

## Tech Stack

- **React 18** on Vite
- **Tailwind CSS** locked to the SmoothieKing Learnings design tokens
- **Recharts** for the results donut chart
- **html2canvas** for the results screenshot
- **lucide-react** for icons
- **@axe-core/react** for dev-time accessibility auditing
- **Vitest + React Testing Library** for unit and component tests

---

## Project Layout

```
src/
  App.jsx                  screen-state router (Welcome / Quiz / Results)
  components/
    WelcomeScreen.jsx
    QuizScreen.jsx
    ResultsScreen.jsx
    LayoutWrapper.jsx      mobile-first wrapper
    ProgressBar.jsx
  data/
    stylesData.js          4 leadership styles, colors, strengths, blind spots
    questionsData.js       7 questions, styleId-tagged options
  skills/
    calculateResults.js    scoring and tie handling
    exportAndShare.js      html2canvas → Web Share / download
    a11yUtils.js           announcer, keyboard handling, axe auditor
  utils/
    iframeBridge.js        universal LMS embed contract (postMessage + hook)
```

---

## Local Development

```bash
npm install
npm run dev      # local dev server
npm run test     # unit & component tests
npm run build    # production build to dist/
```

---

## Deployment

Every push to `main` triggers [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml), which builds the site and deploys it to GitHub Pages. The workflow sets `VITE_BASE_PATH=/leadership_style_quiz/` so assets resolve under the Pages sub-path; local builds fall back to relative paths automatically.

For a fresh repository, GitHub Pages requires a one-time setup in the GitHub UI:

1. **Settings → General → Change visibility** — set the repository to **Public**.
2. **Settings → Pages** — set **Source** to **GitHub Actions**.
3. **Settings → Actions → General** — confirm workflows are allowed to run.

The live URL is printed in the `deploy` job summary after each successful run.

---

Maintained by the **SmoothieKing Learnings** team.
