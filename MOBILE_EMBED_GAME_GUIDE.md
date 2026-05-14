# Mobile & iframe sizing — copy-paste guide for each game

Games run **inside an iframe** on `/games/<slug>`. The portal sets the iframe’s **CSS height** from `embedHeight` in `data/game.json` (synced into `src/data/games.ts`). On phones the portal uses **different** heights than on desktop so the game fits under the site header + player chrome + toolbar.

**Source of truth in this repo:** `src/lib/games/embed-height.ts` (`resolveEmbedHeights`).

Paste the sections below into each game repo’s `index.html`, global CSS, and README checklist. Replace `<GAME-ID>` with your slug (same as `game-id` in `data/game.json`).

---

## 1. Portal behavior (what your game must assume)

| Context | What happens |
|--------|----------------|
| **Not full viewport** | `100vh` / `100dvh` in **your** CSS means the **browser tab**, not the iframe. Inside the iframe, that often **overflows** the iframe slot and causes double scroll or a clipped canvas. |
| **Mobile** | Iframe height is roughly `calc(100dvh - 200px)` (budget for header, padding, toolbar, safe areas). Exact rules depend on `embedHeight` and slug — see `embed-height.ts`. |

**Do not** size your root with `height: 100vh` only. Prefer **100% of the iframe** (`html, body, #root { height: 100% }`) and size the canvas from the **container’s** `clientWidth` / `clientHeight`.

---

## 2. Copy — `<head>` snippet (every game `index.html`)

Paste into `<head>` (adjust title):

```html
<meta charset="utf-8" />
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=5"
/>
<title>YOUR GAME TITLE</title>
```

---

## 3. Copy — base layout CSS (global or first loaded stylesheet)

Fills the **iframe** without fighting `vh`:

```css
/* Fill iframe slot; avoid 100vh inside nested iframe */
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  touch-action: manipulation;
  -webkit-text-size-adjust: 100%;
}

/* Your app root id may differ: #app, #root, #game, etc. */
#root {
  width: 100%;
  height: 100%;
  min-height: 0;
  min-width: 0;
  box-sizing: border-box;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}
```

If you use a **full-bleed canvas**:

```css
canvas {
  display: block;
  max-width: 100%;
  max-height: 100%;
}
```

### Drag & drop on phones (critical)

The portal can reduce **outside** scrolling fighting your iframe (overscroll isolation + coarse-pointer `touch-action`), but **inside** the iframe, classic HTML drag-and-drop (`draggable="true"` + `dragstart`/`drop`) is **often broken or inconsistent on touch**.

**Prefer [Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events):** listen for `pointerdown` → **`setPointerCapture(pointerId)`** on your movable element (or canvas) → update position on `pointermove` → cleanup on `pointerup`/`pointercancel`. That one path covers mouse, finger, and pen.

Apply **`touch-action: none`** on the **surface** users drag from (often the canvas wrapper or draggable card), otherwise the browser may treat the gesture as a page pan/zoom attempt:

```css
.drag-surface {
  touch-action: none;
}
```

If part of your UI needs to **scroll vertically** inside the iframe, put `touch-action: pan-y` **only on that scrollable panel**, not on the whole body.

Phaser / Pixi / custom canvas: configure the renderer’s [**input / pointer**](https://docs.phaser.io/) so events use pointer capture patterns above; wire `pointerdown`/`pointermove` on your interactive objects instead of relying on mouse-only handlers.

---

## 4. Copy — resize game / canvas to container (vanilla JS)

Call once on load and on resize. Replace `#root` and canvas lookup with your DOM.

```javascript
function layoutGame() {
  const root = document.getElementById("root");
  if (!root) return;

  const w = root.clientWidth;
  const h = root.clientHeight;

  // Example: 2D canvas filling root
  const canvas = root.querySelector("canvas");
  if (canvas && w > 0 && h > 0) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // If you use a library (Phaser, Kaplay, Three, etc.), call its resize API here with w, h.
}

window.addEventListener("load", layoutGame);
window.addEventListener("resize", layoutGame);
// VisualViewport helps when mobile browser chrome shows/hides
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", layoutGame);
  window.visualViewport.addEventListener("scroll", layoutGame);
}
```

---

## 5. Copy — `data/game.json` hints for the portal

- Prefer a **fixed minimum** that matches your real UI, e.g. `"embedHeight": "720px"` or `"760px"`, if your layout has a hard minimum on desktop.
- **`100vh`** in `embedHeight` is rewritten on the portal for nested iframe use; your game should still not rely on `100vh` **internally** — use **100%** + container sizing (sections 3–4).
- **`circuit-breaker`** has special-cased heights in the portal; other games use the generic rules in `embed-height.ts`.

Example:

```json
{
  "game-id": "<GAME-ID>",
  "embedHeight": "760px"
}
```

---

## 6. Copy — per-game README checklist (paste into each repo)

```markdown
## Portal / mobile iframe checklist

- [ ] Viewport meta: `width=device-width`, `initial-scale=1`, `viewport-fit=cover`
- [ ] Root layout: `html, body, #root { height: 100%; width: 100% }` — no standalone `100vh` as sole height for the game surface
- [ ] Resize: `resize` + `visualViewport` resize/scroll → update canvas / engine size from **container** `clientWidth` / `clientHeight`
- [ ] Touch: controls ≥ 44×44px tap targets; base `touch-action: manipulation` on `html/body`; **`touch-action: none`** on any drag surface / game canvas wrapper
- [ ] Drag: use **Pointer Events** + **`setPointerCapture`** for moves; avoid HTML5-only `dragstart/drop` for primary mechanics on mobile
- [ ] Safe area: avoid putting critical buttons under iOS home indicator (`env(safe-area-inset-bottom)`) if you use fixed UI
- [ ] Test: `/games/<GAME-ID>` on a real phone (portrait + landscape)
- [ ] `embedHeight` in `data/game.json` matches minimum playable height you tested
```

---

## 7. Quick verification in the portal

1. Run the site, open `/games/<GAME-ID>`.
2. DevTools → responsive mode → pick a phone height.
3. Confirm: **one** primary scroll (page or game, not both fighting).
4. Confirm: canvas/UI uses full **visible** iframe area without clipping.

---

## 8. Optional — link from game repo to portal docs

Relative link after cloning the monorepo is not applicable; instead link to this file in your team wiki, e.g.:

`MOBILE_EMBED_GAME_GUIDE.md` in the LLNL STEM Games portal repository.
