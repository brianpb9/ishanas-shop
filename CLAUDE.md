# Ishana's Shop 🍦

An educational ice-cream **shop-builder** game for children aged 4–6. The
educational challenges (patterns, counting, addition, memory, sorting, speed,
mega orders) are the core loop, but the emotional motivation is *"make Ishana's
shop the coolest ice-cream shop in the world"* — coins earned from challenges
buy shop upgrades, decorations, outfits, and pets.

## How to run / preview

This machine has **no Node.js, Python, or .NET SDK** — there is no npm build.

- **Play it:** double-click `index.html` (self-contained; needs internet once
  for the React/Tailwind/Babel CDNs).
- **Preview server:** `serve.ps1` is a static file server using PowerShell's
  `System.Net.HttpListener` on `http://localhost:8080`. Config lives in
  `.claude/launch.json` (runs with `-ExecutionPolicy RemoteSigned`, **not**
  `Bypass` — Bypass is blocked by the auto-mode classifier).

## Architecture

- **`IshanaShop.jsx`** — the entire game, single source of truth. One big React
  component tree using **global** `React`/`ReactDOM` (`const {useState,...} =
  React`), pure CSS keyframe animations, and Web Audio API synth sounds (no
  audio files). Ends with a guarded auto-mount.
- **`index.template.html`** — HTML shell: CDN scripts + a
  `<script type="text/plain" id="game-source">/*__GAME_SOURCE__*/</script>`
  placeholder + a bootstrap that compiles with
  `Babel.transform(src, { presets: [["react", { runtime: "classic" }]] })`.
  **Classic JSX runtime is required** — the automatic runtime emits a bare
  `import {jsx}` that silently fails with no bundler.
- **`build.ps1`** — inlines `IshanaShop.jsx` into the template, producing the
  self-contained **`index.html`**. `index.html` is GENERATED — do not hand-edit.
- **`serve.ps1`** / **`.claude/launch.json`** — local preview server.

### Build & verify loop

After editing `IshanaShop.jsx`:

```
powershell -ExecutionPolicy RemoteSigned -NoProfile -File build.ps1
```

Then reload the preview. **Verify with `preview_eval` (read `#root`), not
screenshots** — the screenshot tool times out because the game has infinite CSS
animations (never a stable frame). React state updates are async, so `await` a
`setTimeout` tick before reading after a simulated click.

## Conventions & notes

- **Mobile-first, NO scroll:** the root is `100dvh` + `overflow:hidden` with
  safe-area padding; the play screen is a flex column (HUD → content `flex-1
  min-h-0` → in-flow bottom nav, so nothing overlaps). Verified no page-scroll
  at 320/375/390/414/tablet/landscape. Management tabs scroll *internally* only.
- **Characters are code-drawn (CSS/SVG), not image assets** — kept dynamic so
  outfits/upgrades change live. The user provided painted reference images for
  *style inspiration only*; do not wire them as fixed assets (an earlier attempt
  was reverted). The empty `assets/` dir is unused.
- **Ishana avatar (`FullIshana` + `IshanaPortrait`):** layered hair/body/clothes/
  arms/head/hat. The portrait draws a built-in striped cap; pass `cap={!hat}` so
  an equipped hat doesn't double up. Hats/head-accessories sit ABOVE the head;
  glasses (`place:"face"`) over the eyes. Default outfit = pink ICE CREAM apron.
- **Customers** = cute chibi `ChibiAnimal` (big head/eyes, pastel): regulars
  bear/penguin/cat/frog; rares rabbit/elephant/panda/fox/owl/bird unlock by
  level. `CUSTOMER_INFO[type]` has a small `emoji` for tiny UI; the scene renders
  `ChibiAnimal`. Guard rare picks with `RARES[k]` (old saves had stale types).
- **Economy / `RARITY`:** tiered prices — common ~120, rare ~900, epic ~5K,
  legendary ~30K, **dream** (aspirational) 100K–1M with per-item `cost` override.
  `money(n)` formats `5K`/`1M`. Coin earning ≈ `14 + level*3` × multipliers.
- **Dress-Up Try-On:** tapping an unowned item previews it on the avatar (items
  are tappable even if unaffordable — pass `noDisable` to `ItemGrid`); a "Buy"
  bar confirms purchase.
- **Sounds (`useSounds`):** correct/wrong/pop/coin/gulp/upgrade/mystery/rare/
  fanfare/tick + plop (scoop), ding (order done), yay (customer), sparkle.
- **Replace Ishana's art:** set `ISHANA_FACE_SRC` to a square head image;
  otherwise the drawn portrait is used.
- **Save data:** `localStorage` under `SAVE_KEY` — bump the version suffix when
  the save shape changes (currently `v5`).
- **Item catalog:** one `CATALOG` array; ids prefixed by category. Slot
  categories (`SLOT_KEYS`) are single-select shop upgrades that restyle the
  scene; `decor` items are placeable & draggable.
- **Two shop views:** **Serve** tab = `StorefrontScene` (shop from the street,
  customer outside); **Upgrade** tab = interior `ShopScene` for decorating.
- Keep everything in the single file and rebuild — no modules (no bundler).

## Known TODO / requested next

- #5 extra juice: coin-fly-to-counter + heart burst on the customer.
- #6 Home/mascot redesign with painted **image assets** (standing Ishana +
  expression pack) — blocked: assets must be saved into `assets/` by the user;
  Claude can't write chat images to disk. Wire with fallback once present.
