# Embedding in Rise 360 or any LMS iframe

The **SmoothieKing Learnings unified iframe contract**, shared across every experience in the `sk-learning` repo. The bridge lives at [`src/utils/iframeBridge.js`](./src/utils/iframeBridge.js); the only value that differs per project is the message namespace. For this project the namespace is **`leadershipQuiz`** and the deployed URL is:

> `https://smoothieking-learnings.github.io/leadership_style_quiz/`

> **In-depth Rise 360 walkthrough:** see [RISE360_INTEGRATION_GUIDE.md](./RISE360_INTEGRATION_GUIDE.md) for the full host ↔ app integration story, scroll-trapping workarounds, and the three Code Block patterns (minimal, pointer-events bypass, app-themed overlay).

---

## 1. Universal URL parameters

| Param | Value | Effect |
| --- | --- | --- |
| `?embed=1` | flag | Strips outer chrome so the experience renders flat inside an iframe. Auto-detected when the page is loaded inside any iframe — explicit param is for previewing the embed view outside an iframe. |
| `?autostart=1` | flag | Skip the welcome screen and start the experience immediately. `?skipIntro=1` is accepted as an alias. |
| `?parentOrigin=<encoded>` | URL-encoded origin | Locks `postMessage` to a specific parent origin. Without this, messages are sent to `*` and inbound messages from any origin are accepted. Drop the param if you'll export to SCORM where the host origin is unknown. |

---

## 2. Recommended iframe snippets

Paste into a Rise 360 **Embed block** (or its **Code Block**, which supports the richer patterns documented in [RISE360_INTEGRATION_GUIDE.md](./RISE360_INTEGRATION_GUIDE.md)) or any LMS that accepts iframe HTML.

### Recommended — single fixed height, compromise between mobile and desktop

```html
<iframe
  src="https://smoothieking-learnings.github.io/leadership_style_quiz/?embed=1"
  width="100%"
  height="780"
  style="border:0; display:block; width:100%;"
  scrolling="auto"
  title="Leadership Style Quiz"
  allow="autoplay"></iframe>
```

780px keeps the iframe under the in-app `@media (max-height: 800px)` compressed-layout breakpoint, so content fits tightly without forcing internal scroll on a phone.

### Dynamic height that adapts to real device width

```html
<iframe
  src="https://smoothieking-learnings.github.io/leadership_style_quiz/?embed=1"
  style="border:0; display:block; width:100%; height:max(640px, 1400px - 70vw);"
  scrolling="auto"
  title="Leadership Style Quiz"
  allow="autoplay"></iframe>
```

`height:max(640px, 1400px - 70vw)` means: at least 640px, and gets taller as the viewport gets narrower. On a real phone (~400px wide), iframe ≈ 1120px. On a real desktop (~1400px wide), iframe ≈ 640px.

**Caveat:** does not respond to Rise's mobile preview pane.

### Dual block — per-device visibility

```html
<!-- Desktop block (set "Hide on mobile" in Rise) -->
<iframe
  src="https://smoothieking-learnings.github.io/leadership_style_quiz/?embed=1"
  width="100%" height="640"
  style="border:0; display:block; width:100%;" scrolling="auto"
  title="Leadership Style Quiz" allow="autoplay"></iframe>
```

```html
<!-- Mobile block (set "Hide on desktop" in Rise) -->
<iframe
  src="https://smoothieking-learnings.github.io/leadership_style_quiz/?embed=1"
  width="100%" height="1150"
  style="border:0; display:block; width:100%;" scrolling="auto"
  title="Leadership Style Quiz" allow="autoplay"></iframe>
```

### Origin-locked snippet (recommended for live Rise lessons)

```html
<iframe
  src="https://smoothieking-learnings.github.io/leadership_style_quiz/?embed=1&parentOrigin=https%3A%2F%2Frise.articulate.com"
  width="100%" height="780"
  style="border:0; display:block; width:100%;" scrolling="auto"
  title="Leadership Style Quiz" allow="autoplay"></iframe>
```

---

## 3. Universal `postMessage` contract

The bridge namespaces every outbound event with `leadershipQuiz:`. The `complete` signal is intentionally **not** namespaced — Rise 360's completion field listens for that exact bare message.

### Outbound — app → host

| Event | Payload | Fires when |
| --- | --- | --- |
| `leadershipQuiz:ready` | — | App has mounted |
| `leadershipQuiz:start` | — | User started the quiz |
| `leadershipQuiz:results` | `{ topStyles, allScores }` | Results screen rendered |
| `leadershipQuiz:restart` | — | User restarted from results |
| `leadershipQuiz:resize` | `{ width, height, desiredHeight }` | Mount + resize + orientation change |
| `leadershipQuiz:wheel` | `{ deltaY }` | rAF-throttled wheel forwarding |
| `complete` | — | (Not namespaced) Rise lesson completion — fires once on the results screen |

### Inbound — host → app

| Event | Effect |
| --- | --- |
| `leadershipQuiz:start` | Start the quiz immediately, skipping welcome |
| `leadershipQuiz:restart` | Return to the welcome screen |

### Wire up a host listener

```js
window.addEventListener('message', (e) => {
  // Optional: only trust messages from your iframe origin.
  // if (e.origin !== 'https://smoothieking-learnings.github.io') return
  const data = e.data
  if (!data?.type) return
  if (data.type === 'complete') return
  if (!String(data.type).startsWith('leadershipQuiz:')) return
  switch (data.type) {
    case 'leadershipQuiz:ready':    /* iframe mounted */                  break
    case 'leadershipQuiz:start':    /* user started the quiz */            break
    case 'leadershipQuiz:results':  /* { topStyles, allScores } */         break
    case 'leadershipQuiz:restart':  /* user restarted from results */      break
    case 'leadershipQuiz:resize':   /* { width, height, desiredHeight } */ break
    case 'leadershipQuiz:wheel':    /* { deltaY } */                       break
  }
})
```

### Send a command to the iframe

```js
const iframe = document.querySelector('iframe')
iframe.contentWindow.postMessage({ type: 'leadershipQuiz:start' },   '*')
iframe.contentWindow.postMessage({ type: 'leadershipQuiz:restart' }, '*')
```

---

## 4. Enabling Rise 360 completion

The bridge already calls `emitComplete()` on the results screen. To wire the lesson to actually mark complete:

1. In the Rise Code Block settings panel, enable **Set completion requirements**.
2. Paste this exact one-liner into the field (this is what Rise listens for):

   ```js
   window.parent.postMessage({ type: 'complete'}, '*')
   ```

The completion field registers the bare `complete` message Rise should accept — the actual fire comes from the iframe. Idempotent: once the lesson is complete, repeat fires are ignored.

---

## 5. Common gotchas when pasting into Rise

- **Use straight double quotes** (`"`) — not curly/smart quotes.
- **No text between `<iframe>` and `</iframe>`** — Rise rejects iframe HTML with content between the tags.
- **`<style>` tags may be stripped** — Rise's Embed block sometimes drops `<style>` blocks for security. Stick to inline `style` attributes on the iframe element. The Code Block tolerates `<style>` blocks.
- **Wrapping `<div>` may be stripped** in the Embed block — keep the iframe top-level. The Code Block keeps wrappers intact.

---

## 6. Scroll trapping inside Rise

The number-one frustration with Rise embeds is that scrolling while the cursor is over the iframe doesn't scroll the Rise lesson. Three options:

- **Plain Embed block** — accept that scroll is trapped while the cursor is over the iframe. Cheapest, fewest moving parts.
- **Code Block + `pointer-events: none` + click-to-engage overlay** — scroll passes through until the learner clicks to engage. See **Pattern B** in [RISE360_INTEGRATION_GUIDE.md](./RISE360_INTEGRATION_GUIDE.md).
- **Code Block + app-themed welcome overlay** — same scroll-passthrough, but the engagement gesture looks like the app's own welcome screen. See **Pattern C** in [RISE360_INTEGRATION_GUIDE.md](./RISE360_INTEGRATION_GUIDE.md).

The bridge emits `leadershipQuiz:wheel { deltaY }` on every wheel event inside the iframe as a best-effort signal for hosts that *can* briefly toggle `pointer-events: none` based on it.

---

## 7. Fundamental Rise 360 constraints

| Constraint | Implication |
| --- | --- |
| **Iframe height is one fixed value** | Cannot be different per device with a single iframe. |
| **Rise mobile preview ≠ real mobile** | Mobile preview is a visual clip in a desktop browser. |
| **Sandboxed download blocked** | `html2canvas` → file download silently fails inside Rise. The "Share Result" button works only when the quiz is loaded standalone. |
| **No `<style>` blocks in Embed input** | Use the Code Block when you need `<style>`. |
| **Embed block has built-in padding** | Some padding is unavoidable around the iframe. |
| **Per-device block visibility** | If your Rise plan exposes Hide on mobile / Hide on desktop on Embed blocks, dual-iframe is the cleanest solution. |
| **CSP / framing** | If you host on a domain that emits `X-Frame-Options: DENY` or `frame-ancestors 'none'`, the iframe will refuse to load. GitHub Pages doesn't set these headers. |

---

## 8. How to verify mobile behavior properly

Rise's mobile preview pane is misleading for iframe sizing. To verify how real mobile users will see the experience:

1. Open the published GitHub Pages URL directly:
   `https://smoothieking-learnings.github.io/leadership_style_quiz/?embed=1`
2. Open Chrome DevTools (F12 / Cmd+Option+I).
3. Click the device toolbar icon, pick "iPhone 14 Pro" or "Pixel 7".
4. The experience reflows at real mobile viewport dimensions.

---

## 9. Adapting the bridge for a new project

The bridge is one file. Drop it into `src/utils/iframeBridge.js` and change four lines at the top:

```js
const NAMESPACE = 'yourProject'
const ASPECT_RATIO = 1.4        // height = width × this
const MIN_DESIRED_HEIGHT = 600
const MAX_DESIRED_HEIGHT = 900
```

Wire it in your root component using either the named exports (`emit`, `emitComplete`, `reportSize`, `onCommand`) directly — see [`src/App.jsx`](./src/App.jsx) for the current pattern — or via the `useIframeBridge()` hook:

```jsx
import { useIframeBridge } from './utils/iframeBridge'

useIframeBridge({
  onStart:   startQuiz,
  onRestart: restartQuiz,
  screen:    currentScreen,
  screenEvents: {
    quiz:    { event: 'start' },
    results: { event: 'results', payload: { /* … */ }, complete: true },
    welcome: { whenFrom: ['results'], event: 'restart' },
  },
})
```

You get `?embed=1`, `?autostart=1`, `?parentOrigin=`, the namespaced `postMessage` contract, the Rise 360 completion fire, debounced resize reporting, and rAF-throttled wheel forwarding — all without any further wiring.

---

## 10. File map for future changes

| File | Purpose |
| --- | --- |
| `src/utils/iframeBridge.js` | Universal LMS embed contract — postMessage events + `useIframeBridge` hook |
| `src/components/LayoutWrapper.jsx` | Mobile-first layout wrapper |
| `src/App.jsx` | Top-level screen routing + bridge wiring |
| `src/data/questionsData.js` | Question copy and option `styleId` mapping |
| `src/data/stylesData.js` | Style definitions (name, focus, strengths, blind spots, color) |
| `src/skills/calculateResults.js` | Tally logic |
| `RISE360_INTEGRATION_GUIDE.md` | Full Rise 360 patterns (minimal embed, pointer-events bypass, themed overlay) |

---

## 11. Open trade-off

Because iframe height is a single fixed number set in Rise:

- **Tall iframe (~1150px)** → mobile content fits, desktop has blank space.
- **Short iframe (~640px)** → desktop has no blank, mobile content scrolls inside the iframe.
- **Compromise (~780px)** → some of both. Current recommendation.

If Rise exposes per-device block visibility for your Embed blocks, the cleanest fix is two embed blocks (one per device) with different heights — see "Dual block" in §2 above.
