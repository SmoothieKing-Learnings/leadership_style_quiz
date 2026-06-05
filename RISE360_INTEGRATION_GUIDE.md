# Embedding a React App in Articulate Rise 360 — Integration Guide

A reusable pattern for packaging any React (or other SPA) project as a self-contained, mobile-first iframe embed inside an Articulate Rise 360 lesson. Covers the React-side `postMessage` bridge, the Rise 360 Code Block markup, completion tracking, responsive sizing, and the architectural gotcha around scroll trapping.

This guide was extracted from the **Shift Survival** project (a React + Vite mobile game embedded in a Rise 360 lesson via the Code Block feature). All numeric heights, the namespace prefix, and the welcome-screen copy are project-specific and should be adjusted for your case — every other piece is reusable verbatim.

---

## 1. The architecture you're working with

Rise 360 doesn't embed your app at the top of its DOM. It wraps your code block inside several nested iframes:

```
rise.articulate.com  (lesson page — the real scroll container)
  └─ Rise preview iframe                 (same-origin, sized by Rise's device-preview selector)
      └─ Rise code-block sandbox iframe  (same-origin)
          └─ your iframe                 (cross-origin — points at your hosted React build)
```

Three implications you must design around:

1. **`width` and `height` attributes on your iframe are stripped.** Rise sizes the container according to its small/medium/full-width preset; your only height controls are CSS inside the code block.
2. **Wheel events trapped inside your cross-origin iframe cannot scroll Rise.** They fire inside your iframe, can't propagate across the cross-origin boundary, and `postMessage` forwarding doesn't help because synthetic dispatches don't trigger native scroll on the parent.
3. **Rise's mobile-app player handles embeds differently from the web player.** Preview ≠ published ≠ mobile-app behavior. Always test the published lesson, not just the editor preview.

---

## 2. React side: the `iframeBridge` utility

Create one file that owns the entire host ↔ app contract. Keeps the namespace consistent and gives you a single place to audit what crosses the iframe boundary.

### `src/utils/iframeBridge.js`

```js
/**
 * iframeBridge — minimal postMessage contract between the app and its host.
 *
 * Outbound (app → host):
 *   { type: '<ns>:ready' }
 *   { type: '<ns>:start' } / win / lose / restart  (your domain events)
 *   { type: '<ns>:resize', width, height, desiredHeight }
 *   { type: '<ns>:wheel',  deltaY }
 *   { type: 'complete' }   <-- NOT namespaced; Rise's completion listener key
 *
 * Inbound (host → app):
 *   { type: '<ns>:start' }
 *   { type: '<ns>:restart' }
 *
 * The host may pass ?parentOrigin=<encoded> in the iframe URL to lock messages
 * to a specific origin. Otherwise events go to '*'.
 */

const NAMESPACE = 'myApp'           // <-- change this per project

const ASPECT_RATIO = 1.6            // height = width * this
const MIN_DESIRED_HEIGHT = 520
const MAX_DESIRED_HEIGHT = 900

function readTargetOrigin() {
  if (typeof window === 'undefined') return '*'
  try {
    const p = new URLSearchParams(window.location.search)
    const explicit = p.get('parentOrigin')
    if (explicit) return decodeURIComponent(explicit)
  } catch {}
  return '*'
}

const targetOrigin = readTargetOrigin()

function inIframe() {
  try { return typeof window !== 'undefined' && window.parent !== window }
  catch { return true }
}

function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)) }

export function emit(event, payload = {}) {
  if (typeof window === 'undefined' || !inIframe()) return
  try {
    window.parent.postMessage(
      { type: `${NAMESPACE}:${event}`, ...payload },
      targetOrigin
    )
  } catch {}
}

/**
 * Rise's completion field listens for a bare { type: 'complete' } — no namespace.
 * Idempotent: Rise ignores repeat fires.
 */
export function emitComplete() {
  if (typeof window === 'undefined' || !inIframe()) return
  try { window.parent.postMessage({ type: 'complete' }, targetOrigin) } catch {}
}

/**
 * Report viewport size + a recommended height clamped to a portrait-phone band.
 * Hosts can use desiredHeight to size their wrapper for responsive fit.
 */
export function reportSize() {
  if (typeof window === 'undefined' || !inIframe()) return
  const width = window.innerWidth
  const height = window.innerHeight
  const desiredHeight = Math.round(
    clamp(width * ASPECT_RATIO, MIN_DESIRED_HEIGHT, MAX_DESIRED_HEIGHT)
  )
  emit('resize', { width, height, desiredHeight })
}

/**
 * Subscribe to inbound commands. Handler is called with the bare event name.
 */
export function onCommand(handler) {
  if (typeof window === 'undefined') return () => {}
  const listener = (e) => {
    const data = e.data
    if (!data || typeof data !== 'object' || typeof data.type !== 'string') return
    if (!data.type.startsWith(`${NAMESPACE}:`)) return
    if (targetOrigin !== '*' && e.origin !== targetOrigin) return
    handler(data.type.slice(NAMESPACE.length + 1), data)
  }
  window.addEventListener('message', listener)
  return () => window.removeEventListener('message', listener)
}

export const NAMESPACE_PREFIX = NAMESPACE
```

**What to change**: `NAMESPACE`, the aspect ratio, and the min/max height bands if your app isn't portrait-phone-shaped.

---

## 3. React side: wire the bridge into your root component

Add to your top-level component (e.g. `App.jsx`).

### Imports
```js
import { useEffect, useRef } from 'react'
import { emit, onCommand, reportSize, emitComplete } from './utils/iframeBridge.js'
```

### One-time mount: announce, report size, honour deep-link params
```js
useEffect(() => {
  emit('ready')
  reportSize()

  // Optional: ?autostart=1 skips your welcome screen
  const params = new URLSearchParams(window.location.search)
  if (params.get('autostart') === '1') {
    const t = setTimeout(() => startGame(), 50)
    return () => clearTimeout(t)
  }
}, [/* your start function */])
```

### Continuous: report size on resize / orientation change (debounced)
```js
useEffect(() => {
  if (typeof window === 'undefined') return
  let timer = null
  const schedule = () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => { timer = null; reportSize() }, 150)
  }
  window.addEventListener('resize', schedule)
  window.addEventListener('orientationchange', schedule)
  return () => {
    window.removeEventListener('resize', schedule)
    window.removeEventListener('orientationchange', schedule)
    if (timer) clearTimeout(timer)
  }
}, [])
```

### Continuous: forward wheel events to the host (rAF-throttled)
```js
useEffect(() => {
  if (typeof window === 'undefined') return
  let frame = 0
  let lastDelta = 0
  const onWheel = (e) => {
    lastDelta = e.deltaY
    if (frame) return
    frame = requestAnimationFrame(() => {
      frame = 0
      emit('wheel', { deltaY: lastDelta })
    })
  }
  window.addEventListener('wheel', onWheel, { passive: true })
  return () => {
    window.removeEventListener('wheel', onWheel)
    if (frame) cancelAnimationFrame(frame)
  }
}, [])
```

> ⚠️ The wheel-forwarding hook is **best-effort**. See §7 for why it can't fully replace `pointer-events: none` in Rise's nested-iframe context.

### Inbound: listen for host commands
```js
useEffect(() => {
  const off = onCommand((command) => {
    if (command === 'start')   startGame()
    if (command === 'restart') restartGame()
  })
  return off
}, [startGame, restartGame])
```

### Outbound: emit on screen transitions and fire completion
```js
const prevScreen = useRef(screen)

useEffect(() => {
  const prev = prevScreen.current
  prevScreen.current = screen
  if (prev === screen) return

  if (prev === 'welcome' && screen === 'game') emit('start')
  else if (screen === 'win')  { emit('win',  { /* your payload */ }); emitComplete() }
  else if (screen === 'lose') { emit('lose', { /* your payload */ }); emitComplete() }
  else if ((prev === 'win' || prev === 'lose') && screen === 'welcome') emit('restart')
}, [screen])
```

**`emitComplete()` is the magic that flips the Rise lesson to Complete.** Fire it on whichever terminal state(s) you consider "course complete" — win only, win-or-lose, first-card-revealed, etc.

---

## 4. Build & host your React app

Rise embeds via a URL. You need a public HTTPS host that allows framing.

### Vite (used here)
```js
// vite.config.js — emits relative asset paths so the same dist/ works at any base URL
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH ?? './',
})
```

### GitHub Pages deploy (cheapest, works fine)
A minimal `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Pages
on: { push: { branches: [main] } }
permissions: { contents: read, pages: write, id-token: write }
jobs:
  deploy:
    environment: { name: github-pages, url: ${{ steps.deployment.outputs.page_url }} }
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm install
      - run: npm run build
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with: { path: './dist' }
      - id: deployment
        uses: actions/deploy-pages@v4
```

### CSP / framing requirements
If your host emits `X-Frame-Options: DENY` or `Content-Security-Policy: frame-ancestors 'none'`, the iframe will refuse to load. For Rise, you need at minimum:
```
Content-Security-Policy: frame-ancestors https://rise.articulate.com;
```
GitHub Pages doesn't send these headers, so it Just Works™.

---

## 5. Rise 360 Code Block: pick the right pattern

Rise's Code Block (Multimedia → Code Block) accepts arbitrary HTML/CSS/JS that gets rendered inside Rise's sandbox. Three patterns, in order of complexity, depending on what UX you want.

### Pattern A — minimal embed (fastest, scroll trapped over iframe)

Use when scroll-pass-through over the embed isn't important.

```html
<style>
  #app-wrap { width: 100%; }
  #app-wrap iframe {
    display: block; width: 100%; height: 780px; border: 0;
  }
  @media (max-width: 520px) {
    #app-wrap iframe { height: 90vh; max-height: 780px; min-height: 600px; }
  }
</style>

<div id="app-wrap">
  <iframe
    src="https://YOUR-HOST/path/?parentOrigin=https%3A%2F%2Frise.articulate.com"
    title="YOUR APP TITLE"
    allow="autoplay"
    allowfullscreen></iframe>
</div>
```

**Why 780px?** If your app uses a `@media (max-height: 800px)` compressed-layout breakpoint (common for mobile-first SPAs), keeping the iframe under 800px tall activates the compressed CSS path so content fits without overflowing.

### Pattern B — pointer-events bypass with click-to-engage overlay

Use when you want `scroll-pass-through everywhere except an explicit engagement gesture`.

```html
<style>
  #app-wrap { position: relative; width: 100%; }
  #app-wrap iframe {
    display: block; width: 100%; height: 780px; border: 0;
    pointer-events: none;
    transition: filter 200ms;
    filter: saturate(0.85);
  }
  #app-wrap.engaged iframe {
    pointer-events: auto;
    filter: none;
  }
  #app-overlay {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: opacity 200ms;
  }
  #app-overlay::after {
    content: '▶  Click to play';
    background: #930018; color: #fff;
    font-family: system-ui, sans-serif; font-weight: 600; font-size: 15px;
    padding: 12px 22px; border-radius: 999px;
    box-shadow: 0 4px 14px rgba(147, 0, 24, 0.35);
  }
  #app-wrap.engaged #app-overlay { opacity: 0; pointer-events: none; }
  @media (max-width: 520px) {
    #app-wrap iframe { height: 90vh; max-height: 780px; min-height: 600px; }
  }
</style>

<div id="app-wrap">
  <iframe id="app-iframe" src="https://YOUR-HOST/path/?parentOrigin=https%3A%2F%2Frise.articulate.com"
          title="YOUR APP TITLE" allow="autoplay" allowfullscreen></iframe>
  <div id="app-overlay" role="button"></div>
</div>

<script>
  (function () {
    var wrap = document.getElementById('app-wrap');
    var overlay = document.getElementById('app-overlay');
    overlay.addEventListener('click', function () { wrap.classList.add('engaged'); });
    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) wrap.classList.remove('engaged');
    });
    window.addEventListener('message', function (e) {
      var d = e.data;
      if (d && typeof d === 'object' && (d.type === 'myApp:win' || d.type === 'myApp:lose')) {
        wrap.classList.remove('engaged');
      }
    });
  })();
</script>
```

**Why this works**: `pointer-events: none` keeps wheel events out of the iframe entirely. They fire on the overlay `<div>`, which lives in Rise's same-document scroll chain. Scroll past the embed feels like scrolling past any other Rise block. Click the pill → iframe becomes interactive; click elsewhere or win/lose → returns to scroll-pass-through.

### Pattern C — overlay that *looks like* your app's welcome screen (no separate pill)

Use when you want scroll-pass-through AND the engagement gesture to feel native (no extra "Click to play" pill on top of the app).

Replicate your React welcome screen markup directly in the Code Block. The overlay buttons handle engagement and post `<ns>:start` to skip your app's internal welcome.

```html
<style>
  @import url('https://fonts.googleapis.com/css2?family=Lora:wght@700&family=Poppins:wght@400;600&display=swap');

  #app-wrap { position: relative; width: 100%; }
  #app-wrap iframe {
    display: block; width: 100%; height: 780px; border: 0;
    pointer-events: none;
    transition: opacity 250ms;
  }
  #app-wrap.engaged iframe { pointer-events: auto; }

  #app-welcome {
    position: absolute; inset: 0;
    background: #FFF9EF;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center; padding: 40px 24px;
    transition: opacity 250ms;
    box-sizing: border-box;
  }
  #app-wrap.engaged #app-welcome { opacity: 0; pointer-events: none; }

  /* — Style your welcome to match your React app's welcome — */
  #app-welcome .logo { height: 28px; margin-bottom: 28px; }
  #app-welcome h1 {
    font-family: 'Lora', Georgia, serif;
    font-size: 44px; font-weight: 700; color: #930018;
    line-height: 1.1; margin: 0 0 14px; max-width: 360px;
  }
  #app-welcome p {
    font-family: 'Poppins', system-ui, sans-serif;
    font-size: 14px; line-height: 1.7; color: #40000F;
    margin: 0 0 26px; max-width: 340px;
  }
  #app-welcome button { font-family: 'Poppins', system-ui, sans-serif; cursor: pointer; border: 0; }
  #app-welcome .learn {
    background: none; color: #930018;
    font-weight: 600; font-size: 15px;
    margin-bottom: 28px; padding: 4px 8px;
  }
  #app-welcome .start {
    font-family: 'Lora', Georgia, serif;
    background: #930018; color: #fff;
    font-weight: 700; font-size: 22px;
    padding: 16px 68px; border-radius: 999px;
    box-shadow: 0 8px 24px rgba(147, 0, 24, 0.32);
  }

  @media (max-width: 520px) {
    #app-wrap iframe { height: 90vh; max-height: 780px; min-height: 600px; }
    #app-welcome h1 { font-size: 34px; }
  }
</style>

<div id="app-wrap">
  <iframe id="app-iframe"
    src="https://YOUR-HOST/path/?parentOrigin=https%3A%2F%2Frise.articulate.com&autostart=1"
    title="YOUR APP TITLE" allow="autoplay" allowfullscreen></iframe>

  <div id="app-welcome">
    <img class="logo" src="https://YOUR-HOST/path/assets/logo.png" alt="" onerror="this.style.display='none'" />
    <h1>Your title here</h1>
    <p>Your description here.</p>
    <button class="learn" id="app-learn">Learn more →</button>
    <button class="start" id="app-start">Start</button>
  </div>
</div>

<script>
  (function () {
    var wrap = document.getElementById('app-wrap');
    var iframe = document.getElementById('app-iframe');

    function engage(skipIntro) {
      wrap.classList.add('engaged');
      if (skipIntro) {
        setTimeout(function () {
          try { iframe.contentWindow.postMessage({ type: 'myApp:start' }, '*'); } catch (e) {}
        }, 120);
      }
    }
    document.getElementById('app-start').addEventListener('click', function () { engage(true); });
    document.getElementById('app-learn').addEventListener('click', function () { engage(false); });

    window.addEventListener('message', function (e) {
      var d = e.data;
      if (!d || typeof d !== 'object' || typeof d.type !== 'string') return;
      if (d.type === 'myApp:restart') wrap.classList.remove('engaged');
    });
  })();
</script>
```

**Trade-off**: the welcome content (title, body, logo, button labels) lives in TWO places — your React app *and* the Rise Code Block. Changes to one require updating the other. In exchange you get a clean, native-feeling engagement gesture with full scroll-pass-through.

---

## 6. Rise 360 completion requirements

If you want the lesson to be marked complete when the learner reaches a terminal state in your app:

1. In the Code Block settings panel, enable **"Set completion requirements"**.
2. Paste this exact one-liner into the field (this is what Rise listens for):

   ```js
   window.parent.postMessage({ type: 'complete'}, '*')
   ```

3. Make sure your React app calls `emitComplete()` from `iframeBridge.js` at the appropriate moment (win/lose/etc — see §3).

Rise's listener is keyed on the bare `{ type: 'complete' }` message. The completion field is just confirming that's the contract — you paste the snippet to *register* your app's emitter, not because Rise will execute it. Idempotent: once the lesson is complete, repeat fires are ignored.

---

## 7. The scroll-trapping problem (and what you can/can't do about it)

The number-one frustration with Rise embeds is that **scrolling while the cursor is over the iframe doesn't scroll the Rise lesson**. Here's the honest breakdown.

### Why it happens
Your iframe is cross-origin (your hosted app vs `rise.articulate.com`). Wheel events fire on whatever element is under the cursor. When the cursor is over a cross-origin iframe with `pointer-events: auto`, the wheel event fires *inside* the iframe and stays there — browsers do not propagate wheel events across cross-origin iframe boundaries.

### What doesn't work
- ❌ **postMessage-forwarding wheel events** and calling `window.scrollBy(...)` in the parent. Synthetic dispatches don't trigger native scroll, and Rise's intermediate sandbox iframes don't listen for your custom protocol.
- ❌ **`scrolling="no"`** attribute (deprecated, no effect on wheel capture).
- ❌ **`overscroll-behavior: contain`** inside your app (only affects scroll-chaining when *something* in your iframe is scrollable).

### What does work
- ✅ **Pattern B or C above** — `pointer-events: none` on the iframe + click-to-engage gesture. Wheel events never enter the iframe in the first place.
- ✅ **`pointer-events: none` permanent + keyboard-only play** — only works if every interactive in your app has a keyboard shortcut. Not viable for mouse-driven content.

### Best-effort hybrid (worth deploying anyway)
The `app:wheel` postMessage I document in §3 *can* help when the iframe is in `pointer-events: auto` mode. The flow:
1. Wheel fires inside iframe.
2. App emits `app:wheel` to host.
3. Host briefly toggles iframe to `pointer-events: none` (e.g. 250ms).
4. *Subsequent* wheel ticks bypass the iframe and reach the parent scroll.

It loses the first wheel tick of every scroll gesture but is harmless to ship as a fallback for when the user is mid-interaction.

---

## 8. Common gotchas

| Gotcha | Fix |
|---|---|
| Embed height looks wrong on mobile | Use `aspect-ratio` as fallback in CSS; let `desiredHeight` postMessage override once known |
| Game / app overflows the footer in compressed view | Make sure your app's internal compressed-layout media query activates at the iframe's height (e.g. `@media (max-height: 800px)`) |
| Completion never fires | Confirm both: (a) `emitComplete()` runs in your app; (b) the Rise completion field has the `window.parent.postMessage({ type: 'complete'}, '*')` snippet |
| Iframe is blank | Check `X-Frame-Options` / `frame-ancestors` headers on your host; add `frame-ancestors https://rise.articulate.com` |
| Web preview works, mobile Rise app doesn't | The Articulate mobile player handles embeds differently; always test the published lesson on an actual mobile device, not just preview |
| Editor preview ≠ published | Rise's authoring preview vs published lesson behave differently. Always validate on the published URL |
| Origin lock breaks SCORM export | If you'll export to SCORM for an LMS, drop the `?parentOrigin=` query param. The bridge falls back to `*`, safer for unknown LMS hosts |

---

## 9. Checklist for adapting to a new project

1. ☐ Copy `src/utils/iframeBridge.js`; change `NAMESPACE`.
2. ☐ Adjust `ASPECT_RATIO`, `MIN_DESIRED_HEIGHT`, `MAX_DESIRED_HEIGHT` for your app's shape.
3. ☐ Wire `emit('ready')`, `reportSize()`, the resize/wheel useEffects, and `onCommand` into your root component.
4. ☐ Emit your app's domain events (`start`, `win`, `lose`, etc) on screen transitions.
5. ☐ Call `emitComplete()` at your completion moment.
6. ☐ Build with relative asset paths so the same `dist/` works at any base URL.
7. ☐ Deploy to a public HTTPS host that allows framing from `rise.articulate.com`.
8. ☐ Pick Pattern A / B / C from §5 based on the scroll-pass-through UX you want.
9. ☐ Update the iframe `src` URL and any hardcoded copy in the Code Block.
10. ☐ Enable Rise's completion requirements field with the standard snippet.
11. ☐ Test on: web preview, published lesson, Articulate mobile app, real mobile browser.

---

## 10. Reference — full list of `iframeBridge` events

| Direction | Event | Payload | Fires when |
|---|---|---|---|
| out | `<ns>:ready` | — | App has mounted |
| out | `<ns>:start` | — | App transitioned to active state |
| out | `<ns>:win` | `{ score, maxScore, percent }` | User reached the "win" terminal |
| out | `<ns>:lose` | `{ strikeBreakdown }` | User reached the "lose" terminal |
| out | `<ns>:restart` | — | User restarted from a terminal |
| out | `<ns>:resize` | `{ width, height, desiredHeight }` | On mount + resize + orientation change |
| out | `<ns>:wheel` | `{ deltaY }` | rAF-throttled wheel forwarding |
| out | `complete` | — | (Not namespaced) Rise lesson completion signal |
| in  | `<ns>:start` | — | Host wants to skip welcome and start |
| in  | `<ns>:restart` | — | Host wants to reset to welcome |

Customize the payloads to your app's domain. Keep the namespace and direction conventions.
