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

- **Replace Ishana's art:** set `ISHANA_FACE_SRC` at the top of `IshanaShop.jsx`
  to a square head image; otherwise the built-in hand-drawn SVG Ishana (black
  hair + striped ice-cream cap + pink apron) is used.
- **Save data:** persisted to `localStorage` under `SAVE_KEY` (bump the version
  suffix when the save shape changes to reset cleanly).
- **Item catalog:** one `CATALOG` array; ids are prefixed by category
  (`sign_`, `roof_`, `decor_`, `dress_`, `pet_`, …). Slot categories
  (`SLOT_KEYS`) are single-select shop upgrades that restyle the scene;
  `decor` items are placeable & draggable.
- **Two shop views:** the **Serve** tab uses `StorefrontScene` (shop from the
  street, customer outside); the **Upgrade** tab uses the interior `ShopScene`
  for decorating.
- Keep everything in the single file and rebuild — do not split into modules
  (there is no bundler).
