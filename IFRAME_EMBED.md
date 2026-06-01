# Embedding in Rise 360 or any LMS iframe

The **SmoothieKing Learnings unified iframe contract**, shared across every experience in the `sk-learning` repo. The bridge lives at [`src/utils/iframeBridge.js`](./src/utils/iframeBridge.js); the only value that differs per project is the message namespace. For this project the namespace is **`leadershipQuiz`** and the deployed URL is:

> `https://smoothieking-learnings.github.io/leadership_style_quiz/`

> **In-depth Rise 360 walkthrough:** see [`RISE360_INTEGRATION_GUIDE.md`](./RISE360_INTEGRATION_GUIDE.md) for the full host ↔ app integration story, scroll-trapping workarounds, and the three Code Block patterns (minimal, pointer-events bypass, app-themed overlay).

---

## 1. Universal URL parameters

| Param | Value | Effect |
| --- | --- | --- |
| `?embed=1` | flag | Strips outer chrome so the experience renders flat inside an iframe. Auto-detected when the page is loaded inside any iframe — explicit param is for previewing the embed view outside an iframe. |
| `?autostart=1` | flag | Skip the welcome screen and start the experience immediately. `?skipIntro=1` is accepted as an alias. |
| `?parentOrigin=<encoded>` | URL-encoded origin | Locks `postMessage` to a specific parent origin. Without this, messages are sent to `*` and inbound messages from any origin are accepted. Drop the param if you'll export to SCORM where the host origin is unknown. |

---

## 2. Copy-paste-ready iframe snippets

Each snippet below is self-contained — paste it directly into a Rise 360 block. Pick the variant that matches your hosting context. Default recommendation: **§2.2 — Origin-locked, fixed height**.

### 2.1 Minimal Embed block (no scroll-passthrough)

Paste into a Rise 360 **Embed block** (not the Custom Code Block — they're different).

```html
<iframe
  src="https://smoothieking-learnings.github.io/leadership_style_quiz/?embed=1"
  width="100%"
  height="700"
  style="border:0; display:block; width:100%;"
  scrolling="auto"
  title="Leadership Style Quiz"
  allow="autoplay"></iframe>
```

**Why 700px?** It sits 50px under Articulate Rise 360's default 750px **Code Block** height cap (see §10), and comfortably accommodates the quiz's internal content stack (640px QuizScreen + 16px page padding = 656px). Bump to 720px if you don't need Code Block headroom; bump further (up to ~1100px) only if you're using an Embed block where the cap is lazier — content will just bottom-anchor with breathing room.

### 2.2 Origin-locked, fixed height (recommended for live Rise lessons)

```html
<iframe
  src="https://smoothieking-learnings.github.io/leadership_style_quiz/?embed=1&parentOrigin=https%3A%2F%2Frise.articulate.com"
  width="100%" height="700"
  style="border:0; display:block; width:100%;" scrolling="auto"
  title="Leadership Style Quiz" allow="autoplay"></iframe>
```

The `parentOrigin` lock prevents `postMessage` from leaking to other embedders. Drop it for SCORM export where the host origin is unknown at build time.

### 2.3 Dynamic height that adapts to real device width

```html
<iframe
  src="https://smoothieking-learnings.github.io/leadership_style_quiz/?embed=1"
  style="border:0; display:block; width:100%; height:max(640px, 1400px - 70vw);"
  scrolling="auto"
  title="Leadership Style Quiz"
  allow="autoplay"></iframe>
```

`height:max(640px, 1400px - 70vw)` means: at least 640px, and taller as the viewport gets narrower. On a real phone (~400px wide), iframe ≈ 1120px. On a real desktop (~1400px wide), iframe ≈ 640px.

**Caveat:** does not respond to Rise's mobile preview pane.

### 2.4 Dual block — per-device visibility

If your Rise plan exposes "Hide on mobile" / "Hide on desktop" toggles on the Embed block (check the block's edit/pencil settings), this is the cleanest setup. Paste each block into its own Embed block and set the visibility toggle:

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
  width="100%" height="720"
  style="border:0; display:block; width:100%;" scrolling="auto"
  title="Leadership Style Quiz" allow="autoplay"></iframe>
```

### 2.5 Code Block — click-to-engage overlay (scroll-passthrough)

When you want scroll over the embed to flow into the Rise lesson, set `pointer-events: none` on the iframe and reveal an engagement gesture on top of it. Scroll never enters the iframe until the learner clicks the pill; click outside (or on results) returns to scroll-passthrough.

**Paste into a Rise 360 Code Block** (not the Embed block — Code Block accepts `<style>` and `<script>`).

```html
<style>
  #app-wrap { position: relative; width: 100%; }
  #app-wrap iframe {
    display: block; width: 100%; height: 700px; border: 0;
    pointer-events: none;
    transition: filter 200ms;
    filter: saturate(0.85);
  }
  #app-wrap.engaged iframe { pointer-events: auto; filter: none; }

  #app-overlay {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: opacity 200ms;
  }
  #app-overlay::after {
    content: '▶  Click to play';
    background: #930018; color: #fff;
    font-family: "DM Sans", system-ui, sans-serif; font-weight: 600; font-size: 15px;
    padding: 12px 22px; border-radius: 999px;
    box-shadow: 0 4px 14px rgba(147, 0, 24, 0.35);
  }
  #app-wrap.engaged #app-overlay { opacity: 0; pointer-events: none; }

  @media (max-width: 520px) {
    #app-wrap iframe { height: 90vh; max-height: 720px; min-height: 600px; }
  }
</style>

<div id="app-wrap">
  <iframe id="app-iframe"
    src="https://smoothieking-learnings.github.io/leadership_style_quiz/?embed=1&parentOrigin=https%3A%2F%2Frise.articulate.com"
    title="Leadership Style Quiz" allow="autoplay" allowfullscreen></iframe>
  <div id="app-overlay" role="button" aria-label="Click to start the Leadership Style Quiz"></div>
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
      if (d && typeof d === 'object' && d.type === 'leadershipQuiz:results') {
        wrap.classList.remove('engaged');
      }
    });
  })();
</script>
```

### 2.6 Themed welcome overlay (no separate engagement pill)

For the cleanest, most native-feeling embed: replicate the quiz's welcome card inside the Code Block, drop the iframe behind it with `pointer-events: none`, and post `leadershipQuiz:start` when the learner clicks **Let's Blend!**. Pass `?autostart=1` so the iframe skips its own welcome the moment it becomes interactive.

The full markup for this **Pattern C** is in section 5 of [`RISE360_INTEGRATION_GUIDE.md`](./RISE360_INTEGRATION_GUIDE.md) — too long to inline here, but a copy-paste affair. Substitute `myApp` → `leadershipQuiz` in the markup.

### 2.7 Code Block — scroll-eavesdrop (no engagement gesture)

The cleanest interaction model: the iframe is fully interactive immediately (no overlay, no `pointer-events: none`, no "Click to start" pill), and scroll passes through to the Rise lesson because the parent listens for the bridge's `leadershipQuiz:wheel` postMessage and calls `window.scrollBy()`.

**Prerequisite:** the iframe content must NOT internally scroll. If it does, wheel events are consumed by the iframe's own scroll first and never reach the bridge's emitter. Satisfied for this project by the `h-[640px]` QuizScreen + LayoutWrapper `p-2` in embed mode — total content stack is 656px, well inside the 700px iframe (see §10).

```html
<style>
  #leadership-wrap { position: relative; width: 100%; }
  #leadership-wrap iframe {
    display: block; width: 100%; height: 700px; border: 0;
  }
  @media (max-width: 520px) {
    #leadership-wrap iframe { height: 90vh; max-height: 720px; min-height: 600px; }
  }
</style>

<div id="leadership-wrap">
  <iframe
    src="https://smoothieking-learnings.github.io/leadership_style_quiz/?embed=1&parentOrigin=https%3A%2F%2Frise.articulate.com"
    title="Leadership Style Quiz" allow="autoplay" allowfullscreen></iframe>
</div>

<script>
  (function () {
    window.addEventListener('message', function (e) {
      var d = e.data;
      if (!d || typeof d !== 'object') return;
      if (d.type === 'leadershipQuiz:wheel' && typeof d.deltaY === 'number') {
        window.scrollBy({ top: d.deltaY, behavior: 'auto' });
      }
    });
  })();
</script>
```

**Trade-offs vs §2.5 / §2.6:**

- ✅ No pre-engagement affordance — feels native, no extra click required
- ✅ Wheel scroll passes through cleanly on desktop (mouse + trackpad)
- ⚠️ Mobile touch passthrough is best-effort — the bridge only forwards `wheel` events, not `touchstart` / `touchmove`. iOS Safari and Android Chrome usually behave well when iframe content has no internal scroll, but it's not guaranteed across all OS/browser versions
- ⚠️ Requires the iframe content to fit without internal scrolling (already satisfied — see §10)

**Security note (optional):** the listener accepts messages from any origin. For tighter security in a host page you control, add an origin check at the top of the handler:

```js
if (e.origin !== 'https://smoothieking-learnings.github.io') return;
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

## 5. Keyboard shortcuts

Useful for LMS-embedded scenarios where learners keyboard their way through:

| Key | Action |
| --- | --- |
| `Tab` | Move focus through interactive elements |
| `Shift` + `Tab` | Move focus backwards |
| `Enter` / `Space` | Select the focused option, submit the focused button, or activate the focused link |

All interactive elements have visible focus rings (`focus:ring-4 focus:ring-quiz-primary/30`) so the keyboard path is unambiguous.

---

## 6. CSP / framing requirements

This project loads **Playfair Display** + **DM Sans** from Google Fonts at runtime. If the host page enforces a strict Content-Security-Policy, allow:

```
font-src  https://fonts.gstatic.com;
style-src https://fonts.googleapis.com 'unsafe-inline';
```

If your hosting target sets `X-Frame-Options: DENY` or `Content-Security-Policy: frame-ancestors 'none'`, the iframe will refuse to load. Configure the host to allow framing from the parent's origin:

```
Content-Security-Policy: frame-ancestors https://rise.articulate.com;
```

GitHub Pages doesn't set restrictive `X-Frame-Options` headers, so the published `https://smoothieking-learnings.github.io/...` URL just works in iframes by default.

---

## 7. Common gotchas when pasting into Rise

- **Use straight double quotes** (`"`) — not curly/smart quotes. Pasting from Word, Slack, or some chat clients can silently convert quotes and Rise will reject the iframe.
- **No text between `<iframe>` and `</iframe>`** — Rise rejects iframe HTML with content between the tags.
- **`<style>` tags may be stripped** by the **Embed block** — Rise's Embed block sometimes drops `<style>` blocks for security. Use the **Code Block** for §2.5 / §2.6 patterns that need `<style>` and `<script>`.
- **Wrapping `<div>` may be stripped** in the Embed block — keep the iframe top-level there. The Code Block keeps wrappers intact.

---

## 8. Scroll trapping inside Rise

The number-one frustration with Rise embeds is that scrolling while the cursor is over the iframe doesn't scroll the Rise lesson. Four options, in order of complexity:

- **Plain Embed block (§2.1 / §2.2)** — accept that scroll is trapped while the cursor is over the iframe. Cheapest, fewest moving parts. Fine when the embed sits at the bottom of the lesson.
- **Code Block + click-to-engage overlay (§2.5)** — scroll passes through until the learner clicks to engage. Reverts on results, so the learner can keep scrolling once they finish.
- **Themed welcome overlay (§2.6)** — same scroll-passthrough as above, but the engagement gesture *looks* like the quiz's own welcome card. See [`RISE360_INTEGRATION_GUIDE.md`](./RISE360_INTEGRATION_GUIDE.md) §5 Pattern C for the full markup.
- **Scroll-eavesdrop Code Block (§2.7)** — no engagement gesture at all; the iframe is always interactive, and the parent listens for the bridge's wheel postMessage and scrolls itself. Lightest-touch UX. Best-effort on mobile touch (only wheel events are forwarded — not `touchstart` / `touchmove`). Requires the iframe content to not internally scroll.

The bridge emits `leadershipQuiz:wheel { deltaY }` on every wheel event inside the iframe as a best-effort signal for non-Rise hosts that *can* briefly toggle `pointer-events: none` based on it.

---

## 9. Things that were tried and did NOT work — don't repeat these

### Vertical centering of content (`my-auto`)

Idea: center content in iframe so empty cream looks intentional. Failed because flexbox `justify-center` cuts off the top of overflowing content when the iframe is shorter than the content. Made the Results screen worse, not better.

### Container queries (`cqw`) for responsive iframe height

Idea: use `height: max(700px, 1500px - 70cqw)` so narrower containers get taller iframes. Works in real browsers. **Does not work in Rise's mobile preview** because Rise's mobile preview is a visual clip of the desktop-rendered iframe, not a real viewport change.

### Dynamic iframe resize via `postMessage`

The bridge emits `leadershipQuiz:resize` with a `desiredHeight` recommendation. **Rise's parent doesn't listen for it**, and Rise's sandboxing prevents adding a custom listener that could find and resize the Embed block. The `resize` event is preserved for non-Rise hosts (intranet pages, custom LMS shells) that *can* honor it.

### Auto-fitting iframe to content

Iframes don't have a "size to content" mode. The `height` attribute is fixed unless dynamically resized via JS bridging — and Rise's bridging is locked down.

### `scrolling="no"` to suppress internal scrollbars

Deprecated attribute, no effect on wheel capture in modern browsers. Use the click-to-engage pattern in §2.5 instead.

---

## 10. Fundamental Rise 360 constraints

| Constraint | Implication |
| --- | --- |
| **Code Block height cap = 750px** | Articulate Rise 360 caps **Code Blocks** at 750px tall by default. Anything taller is clipped at the bottom. Recommended iframe height is **700px** — gives 50px headroom for Articulate's internal Code Block chrome. The QuizScreen inside the iframe is pinned to `h-[640px]` and the LayoutWrapper uses `p-2` in embed mode, so the total content stack is 656px — comfortably under 700. **Embed blocks** do not appear to share this cap. |
| **Scroll-passthrough requires no internal iframe scroll** | The §2.5 / §2.7 patterns rely on the iframe NOT having an internal scrollbar. If the iframe content overflows its iframe height, wheel events get consumed by the iframe's own scroll before reaching the bridge or the browser's cross-iframe passthrough. The quizzes meet this via the `h-[640px]` QuizScreen ceiling + LayoutWrapper `p-2` in embed mode (total content = 656px ≤ 700px iframe). |
| **Iframe height is one fixed value** | Cannot be different per device with a single iframe. Use the dual-block pattern in §2.4 if your Rise plan exposes per-device visibility. |
| **Rise mobile preview ≠ real mobile** | Mobile preview is a visual clip in a desktop browser. Responsive CSS won't change behavior between Rise's preview modes — only on real devices or DevTools (see §11). |
| **Sandboxed download blocked** | `html2canvas` → file download silently fails inside Rise. The "Share Result" button works only when the quiz is loaded standalone (outside Rise). |
| **No `<style>` blocks in Embed input** | Rise's Embed block strips `<style>` tags. Use the **Code Block** for the §2.5 / §2.6 patterns. |
| **Embed block has built-in padding** | Rise wraps every block in a styled container. Some padding is unavoidable around the iframe — check the block's Format menu (block padding S/M/L) to minimize. |
| **Per-device block visibility** | Some Rise plans/block types let you show a block only on mobile or desktop. If available, the dual-iframe pattern (§2.4) is the cleanest sizing solution. |
| **CSP / framing** | If you host on a domain that emits `X-Frame-Options: DENY` or `frame-ancestors 'none'`, the iframe will refuse to load. GitHub Pages doesn't set these headers. |

---

## 11. How to verify mobile behavior properly

Rise's mobile preview pane is misleading for iframe sizing. To verify how real mobile users will see the experience:

1. Open the published GitHub Pages URL directly:
   `https://smoothieking-learnings.github.io/leadership_style_quiz/?embed=1`
2. Open Chrome DevTools (F12 / Cmd+Option+I).
3. Click the device toolbar icon, pick "iPhone 14 Pro" or "Pixel 7".
4. The experience reflows at real mobile viewport dimensions.

This is the only reliable way to verify mobile responsiveness without an actual phone.

---

## 12. Adapting the bridge for a new project

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

## 13. File map for future changes

| File | Purpose |
| --- | --- |
| `src/utils/iframeBridge.js` | Universal LMS embed contract — postMessage events + `useIframeBridge` hook |
| `src/components/LayoutWrapper.jsx` | Mobile-first layout wrapper |
| `src/App.jsx` | Top-level screen routing + bridge wiring |
| `src/data/questionsData.js` | Question copy and option `styleId` mapping |
| `src/data/stylesData.js` | Style definitions (name, focus, strengths, blind spots, color) |
| `src/skills/calculateResults.js` | Tally logic |
| `RISE360_INTEGRATION_GUIDE.md` | Full Rise 360 patterns (minimal embed, pointer-events bypass, themed overlay) — canonical for the repo |

---

## 14. Open trade-off

Because iframe height is a single fixed number set in Rise:

- **Tall iframe (~720px)** → mobile content fits, desktop has blank space. Hits the Articulate Code Block 750 ceiling.
- **Short iframe (~640px)** → desktop has less blank, mobile content may need to scroll inside the iframe.
- **Compromise (~700px)** → 50px under the Articulate Code Block 750 cap, comfortably fits the `h-[640px]` content stack. **Current recommendation.**

If Rise exposes per-device block visibility for your Embed blocks, the cleanest fix is two embed blocks (one per device) with different heights — see §2.4.

---

*Last unified: 2026-06-05. Sibling docs: [appreciation_style_quiz](../appreciation_style_quiz/IFRAME_EMBED.md) · [communication_style_quiz](../communication_style_quiz/IFRAME_EMBED.md) · [leadership_thermostat_game](../leadership_thermostat_game/IFRAME_EMBED.md).*
