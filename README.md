# Leadership Style Quiz Prototype

A modular, single-page React application for a "Leadership Style Quiz". It emphasizes a clean project structure through reusable utility functions ("skills") and strict review protocols for UI and WCAG compliance. This document tracks the initial system requirements, project planning, and updates.

## Mission & Design Constraints
**Goal**: Build a fully client-side React app without a backend database.

### Strict Design & Styling Rules
Configured via Tailwind CSS with a warm palette constraint:
- **Background Color**: `#FFF9EF`
- **Primary Action Color**: `#930018` (Buttons, progress bars)
- **Default Text Color**: `#40000F`
- **WCAG Constraint**: Whenever text overlaps `#930018`, text must be `#FFF9EF` to pass contrast standards. Otherwise, default to `#40000F`.
- **Chart Colors**: Four distinct complementary colors (`#F4A261`, `#E76F51`, `#2A9D8F`, `#E9C46A`) assigned structurally in the codebase for easy editing.

### Deployment Context
- Hosted on **GitHub Pages** at https://smoothieking-learnings.github.io/leadership_style_quiz/.
- Published automatically via GitHub Actions (`.github/workflows/deploy.yml`) on every push to `main`.
- **Base Pathing**: `vite.config.js` reads `VITE_BASE_PATH` (set by the workflow to `/leadership_style_quiz/`) so assets resolve under the Pages sub-path. Local dev falls back to `./`.
- **Routing**: Employs static React state-based rendering (`currentScreen`) to completely bypass `react-router-dom` 404 errors standard to static site refreshes.

## Tech Stack
- **React (Vite Base)**
- **Tailwind CSS** (for styling)
- **Recharts** (for the donut chart visualization)
- **html2canvas** (for capturing the results screen as an image)
- **lucide-react** (for simple UI icons)
- **@axe-core/react** (for dev-time accessibility auditing)
- **Vitest & React Testing Library** (Unit and component testing)

---

## Core Utilities ("Skills") Workflow

### Skill 1: Deployment & Hosting Config
State-based rendering handling navigation between Welcome, Quiz, and Result screens natively without an external DOM router.

### Skill 2: Data Processing (`calculateResults.js`)
A pure utility function that takes the user's answers array, tallies scores for the 4 styles, calculates the percentage, and securely returns an array of the top styles cleanly to handle exact numeric "Ties".

### Skill 3: Export & Share (`exportAndShare.js`)
Utility wrapper that bridges `html2canvas` to process a DOM ID into an image blob, attempting `navigator.share()` (Web Share API) natively with an automated fallback to gracefully download the `.png` if the browser does not support the Web Share standard.

### Skill 4: WCAG & Accessibility Engine (`a11yUtils.js`)
- **Announcer**: Verbally calls route/step changes to Screen Readers globally (`"Question 2 of 3: ..."`).
- **Keyboard Navigation**: Enforces explicit Tab formatting and `"Enter"` or `"Space"` firing on Answer buttons.
- **Auditor**: Development mode runs `@axe-core/react` instantly mapping structural violation logs.

### Skill 5: UI & Responsive Review Protocol (`LayoutWrapper.jsx`)
- Master Layout Wrapper enforcing mobile-first CSS architecture.
- Touch Target Sizes: Minimum `44x44px` enforced across all selectable objects (iOS/Android native standard).
- Desktop Constraint: Enforces a maximum width (`max-w-2xl`) preventing ugly horizontal stretch lines.

---

## Data Structure

**The 4 Leadership Styles** (Managed in `data.js`):
1. **The Teacher** (Situational Leadership) - Focus: Building Technical Confidence.
2. **The Role Model** (Modeling Leadership) - Focus: Integrity through Action.
3. **The Coach** (Transformational Leadership) - Focus: Asking over Telling.
4. **The Supporter** (Servant/Secure Base Leadership) - Focus: Emotional Safety.

---

## Getting Started

1. **Install dependencies:** `npm install`
2. **Run Dev Server:** `npm run dev`
3. **Run Testing Suite:** `npm run test`
4. **Build Production Bundle:** `npm run build`

## Publishing

Pushes to `main` are built and deployed to GitHub Pages by `.github/workflows/deploy.yml`. To bootstrap the published site on a fresh repository:

1. In GitHub → **Settings → Pages**, set **Source** to **GitHub Actions**.
2. In **Settings → Actions → General**, ensure workflows are allowed to run.
3. Make the repository **Public** under **Settings → General → Danger Zone → Change visibility** (required for free GitHub Pages).
4. Push to `main` (or trigger the workflow manually from the Actions tab). The live URL appears in the workflow's `deploy` job summary.

If the repo is renamed, update `VITE_BASE_PATH` in `.github/workflows/deploy.yml` to match the new name so Pages can resolve assets.
