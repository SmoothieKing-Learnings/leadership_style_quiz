/**
 * iframeBridge — SmoothieKing Learnings universal LMS embed utility.
 *
 * One file, identical across every project in the sk-learning repo. The only
 * value that should differ per project is `NAMESPACE` (see below). Drop a copy
 * into `src/utils/iframeBridge.js` of any new project, change the namespace,
 * and you have:
 *
 *   • `?embed=1`     — explicit embed mode (strips chrome via LayoutWrapper).
 *   • `?autostart=1` — skip the welcome screen.
 *   • `?parentOrigin=<encoded>` — lock postMessage delivery to a single origin.
 *
 * Outbound (app → host):
 *   { type: '<ns>:ready' }
 *   { type: '<ns>:start' } / win / lose / results / restart  (your domain events)
 *   { type: '<ns>:resize', width, height, desiredHeight }
 *   { type: '<ns>:wheel',  deltaY }
 *   { type: 'complete' }   <-- NOT namespaced; Rise's completion listener key.
 *
 * Inbound (host → app):
 *   { type: '<ns>:start' }
 *   { type: '<ns>:restart' }
 *
 * Public API:
 *   isEmbedded()         — true when running in iframe or with ?embed=1.
 *   emit(event, payload) — fire a namespaced event to the host.
 *   emitComplete()       — fire Rise's bare { type: 'complete' } signal.
 *   reportSize()         — emit current viewport + a recommended height.
 *   onCommand(handler)   — subscribe to inbound host commands.
 *   useIframeBridge(opts)— React hook that wires ready/resize/wheel/commands.
 */

// ─── per-project config — change NAMESPACE in each project ─────────────────
const NAMESPACE = 'leadershipQuiz'
const ASPECT_RATIO = 1.4        // height = width × this (portrait-phone band)
const MIN_DESIRED_HEIGHT = 600
const MAX_DESIRED_HEIGHT = 900
// ───────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react'

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

/** True when the app is running inside an iframe OR with ?embed=1. */
export function isEmbedded() {
  if (typeof window === 'undefined') return false
  try {
    const params = new URLSearchParams(window.location.search)
    if (params.get('embed') === '1') return true
  } catch {}
  return inIframe()
}

/** Send a namespaced event to the host. No-op when not embedded. */
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
 * Rise 360's completion field listens for a bare { type: 'complete' } —
 * no namespace. Idempotent: Rise ignores repeat fires.
 */
export function emitComplete() {
  if (typeof window === 'undefined' || !inIframe()) return
  try { window.parent.postMessage({ type: 'complete' }, targetOrigin) } catch {}
}

/**
 * Emit current viewport size + a recommended iframe height clamped to a
 * portrait-phone band. Hosts can use desiredHeight to size their wrapper.
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
 * Subscribe to inbound commands from the host. Handler is called with the
 * bare command name (e.g. "start", "restart") and the full data payload.
 * Returns an unsubscribe function.
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

/**
 * Read deep-link launch params: ?autostart=1 (or ?skipIntro=1).
 */
export function readLaunchParams() {
  if (typeof window === 'undefined') return { autostart: false }
  try {
    const p = new URLSearchParams(window.location.search)
    return { autostart: p.get('autostart') === '1' || p.get('skipIntro') === '1' }
  } catch {
    return { autostart: false }
  }
}

/**
 * Wire the full bridge into a React app in one call. Returns void — the hook
 * sets up listeners on mount and cleans up on unmount.
 *
 *   useIframeBridge({
 *     onStart:   () => startQuiz(),       // host → "<ns>:start"   or ?autostart=1
 *     onRestart: () => restartQuiz(),     // host → "<ns>:restart"
 *     screen,                             // current screen name
 *     screenEvents: {                     // optional outbound events per screen
 *       quiz:    { event: 'start'                                    },
 *       results: { event: 'results', payload: {...}, complete: true  },
 *       welcome: { whenFrom: ['results'], event: 'restart'           },
 *     },
 *   })
 */
export function useIframeBridge({
  onStart,
  onRestart,
  screen,
  screenEvents,
} = {}) {
  // Mount: announce ready, report size, honor ?autostart.
  useEffect(() => {
    emit('ready')
    reportSize()
    const { autostart } = readLaunchParams()
    if (autostart && typeof onStart === 'function') {
      const t = setTimeout(() => onStart(), 50)
      return () => clearTimeout(t)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounced resize / orientation change → re-emit size.
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

  // rAF-throttled wheel forwarding (best-effort scroll-passthrough hint).
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

  // Inbound host commands.
  useEffect(() => {
    const off = onCommand((command) => {
      if (command === 'start'   && typeof onStart   === 'function') onStart()
      if (command === 'restart' && typeof onRestart === 'function') onRestart()
    })
    return off
  }, [onStart, onRestart])

  // Outbound screen-transition events + completion.
  const prevRef = useRef(screen)
  useEffect(() => {
    const prev = prevRef.current
    prevRef.current = screen
    if (prev === screen || !screenEvents) return
    const rule = screenEvents[screen]
    if (!rule) return
    if (Array.isArray(rule.whenFrom) && !rule.whenFrom.includes(prev)) return
    if (rule.event) emit(rule.event, rule.payload || {})
    if (rule.complete) emitComplete()
  }, [screen, screenEvents])
}
