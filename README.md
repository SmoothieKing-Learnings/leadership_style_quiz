# Leadership Style Quiz

A short, self-paced leadership self-assessment from the Smoothie King Learnings team. Store leaders answer seven scenarios drawn from a real Smoothie King shift and receive a personalized result describing how they tend to lead under pressure.

**Live site:** https://smoothieking-learnings.github.io/leadership_style_quiz/

---

## About the Assessment

The quiz helps team captains, shift leaders, and general managers reflect on their natural leadership instincts and identify where they can grow. It is designed to be completed in under three minutes on a phone, tablet, or desktop, and can be taken standalone or embedded inside an Articulate Rise 360 lesson.

Every question maps to one of four leadership styles. The result page surfaces the leader's primary style (or styles, when a tie produces a "Hybrid Leader" result), shows the full distribution across all four styles, and lets the user save or share an image of their result.

### The Four Leadership Styles

| Style | Approach | Focus |
|---|---|---|
| **The Teacher** | Situational leadership — direct instruction, technical and procedural | Building technical confidence |
| **The Role Model** | Modeling leadership — leads by example, sets the standard | Integrity through action |
| **The Coach** | Transformational leadership — asks questions, empowers the team | Asking over telling |
| **The Supporter** | Servant / secure-base leadership — relational, people-first | Emotional safety |

Question and answer copy is documented in [QUIZ_CONTENT.md](QUIZ_CONTENT.md). Scoring logic lives in [src/skills/calculateResults.js](src/skills/calculateResults.js): each of the seven questions contributes one point to a style, and the final percentage is `score / 7 × 100`, rounded to the nearest integer.

---

## Where It Runs

- **Public web URL:** https://smoothieking-learnings.github.io/leadership_style_quiz/ — served from GitHub Pages.
- **Inside Rise 360:** the same build embeds inside an Articulate Rise 360 lesson via an iframe. A `postMessage` bridge (`src/utils/iframeBridge.js`) reports readiness, screen transitions, results, and completion back to the host lesson, supports `?autostart=1`, and accepts `start` / `restart` commands from the parent. Integration details are in [RISE360_INTEGRATION_GUIDE.md](RISE360_INTEGRATION_GUIDE.md).
- **Sharing:** the results screen can be captured as a PNG via `html2canvas` and shared through the Web Share API, with an automatic download fallback when sharing isn't supported.

---

## Brand & Accessibility Standards

The build follows Smoothie King's brand palette and accessibility commitments:

- **Background:** `#FFF9EF` · **Primary action:** `#930018` · **Default text:** `#40000F`
- Text on the primary color uses `#FFF9EF` to meet WCAG contrast requirements.
- Mobile-first layout with a `max-w-2xl` desktop cap and minimum **44×44px** touch targets across all interactive elements.
- Screen-reader announcements for every screen and question transition, full keyboard navigation, and `@axe-core/react` running in development to catch regressions early.

---

## Tech Stack

- React 18 on Vite
- Tailwind CSS
- Recharts (results donut chart)
- html2canvas (results screenshot)
- lucide-react (icons)
- @axe-core/react (dev-time accessibility audit)
- Vitest + React Testing Library

---

## Working with the Repository

For maintainers running the project locally:

```bash
npm install
npm run dev      # local dev server
npm run test     # unit & component tests
npm run build    # production build to dist/
```

## Publishing

Every push to `main` triggers [.github/workflows/deploy.yml](.github/workflows/deploy.yml), which builds the site and deploys it to GitHub Pages. The workflow sets `VITE_BASE_PATH=/leadership_style_quiz/` so assets resolve under the Pages sub-path; local builds fall back to relative paths automatically.

For a fresh repository, GitHub Pages requires a one-time setup in the GitHub UI:

1. **Settings → General → Change visibility** — set the repository to **Public**.
2. **Settings → Pages** — set **Source** to **GitHub Actions**.
3. **Settings → Actions → General** — confirm workflows are allowed to run.

The live URL is printed in the `deploy` job summary after each successful run.
