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
- **Painted 2D art skin (`assets/`):** the game now uses AI-generated 2D images
  (kawaii flat style) as the primary skin, with **code-drawn art as fallback**
  via `<ImgOr src fallback>`. Assets are generated with the Higgsfield MCP
  (`generate_image` model `nano_banana_pro` → `remove_background` for transparent
  PNGs), then `curl`-downloaded into `assets/`. Files: `menu-bg`, `shop-exterior`,
  `counter` (front layer), `window` + `shelf` (standalone transparent layers),
  `machine-{basic,rainbow,magic,gold}` (painted ice-cream machines), `logo`,
  `ishana-hero`, `outfit-*` (6 painted Ishana looks), `animal-*` (10 chibi
  customers). (`shop-interior.png` was removed — the wall is a CSS layer now.)
  `ASSET`/`OUTFITS` maps resolve paths; `ASSET.machine[base]` keys the 4 machine
  arts; `ishanaImg(equipped)`; delete a file → code/emoji fallback shows.
- **ONE unified scene (`ShopScene`):** the SAME component renders both tabs —
  Serve (`mode="serve"`, a customer at the counter) and Upgrade (`mode="edit"`,
  decor draggable + a live `preview` item). `StorefrontScene` is now just a thin
  `<ShopScene mode="serve">` wrapper. So buying an upgrade visibly changes the
  very shop you serve in. **Layers are composed (not baked into one bg)** and
  each is driven by a slot so upgrades have a real visual effect: CSS striped
  **wall** (colour from `wall`/theme) → **roof** awning valance (top) → wall
  **sign** (always shown, restyled by `sign`) → `window.png` + `shelf.png`
  (small, high) → `machine`/`helper` flanking → placed **decor** → **Ishana**
  (z2, behind) → `counter.png` (z5, front, tinted by the counter item's CSS
  `filter`) → **customer** (z6, serve only). Rarity ⇒ meaning: epic/legendary
  items get glow / a wiggle.
- **Curated decor (less-but-better):** catalog trimmed to on-theme items only
  (removed aquarium/dragon/monument/fountain; added lamp/vase/frame/clock). Each
  decor has a `zone` + optional painted `DECOR_ART` (plant/lamp/frame/table);
  others use emoji. Placement capped at `MAX_PLACED` (8) to avoid clutter; pet has
  no white ring (soft ground shadow). Off-theme/emoji-only items can be replaced
  with painted PNGs the same way (`DECOR_ART` map + `nano_banana_pro`).
- **Staff = real employees (not decor):** painted staff characters (`STAFF_ART`,
  e.g. bunny/cat in aprons) stand on the back counter (no pedestal), idle-bob and
  **clap (`cust-happy`) when a customer is served**. Buying a helper **boosts coin
  earnings** (`staffMult` by rarity: +8/15/25/40%) and fires a hire celebration
  (fanfare + confetti). This gives a real reason to hire/upgrade staff.
- **Scene zones (believable layout):** every object has a logical home — wall
  (window, sign, `photo`/`balloons` decor) up high; **shelf** (`shelf.png` + jars,
  `teddy`/dolls/`aquarium`) top-right; **back counter** beside Ishana (machine +
  helper, `bottom>32%` so they sit ABOVE the counter line and aren't hidden by
  the front counter — z2, behind Ishana); **counter top** (`sprinkle`/`topping`,
  z6 in front); **floor** (plants/statues, z6, left side clear of Ishana/customer);
  **pet zone** front bottom-left (z6, always ≥90% visible). Decor placement uses
  `zonePos(item.zone)`; placed decor z-index/shadow derive from `zone`
  (floor/counter=front z6 with shadow, wall/shelf=flat z3).
- **Customer interaction:** `CustomerView` mirrors (`scaleX(-1)`) + leans toward
  Ishana so it reads as facing her, shows a 🍦 **order bubble** (tail points left
  to Ishana) while waiting, and a **heart burst + bounce** (`cust-happy`) when the
  order is served (`customerHappy` = feedback==="correct"). New customers **slide
  in** (`cust-enter`, keyed by `custKey`=roundKey). Pet hops (`pet-hop`).
- **World-scale system (scene is tall & narrow, ~0.5 aspect):** Ishana is the
  size reference (~62% of scene height). The **counter is sized by scene HEIGHT**
  (~32%, `objectFit:cover`) so it stays proportional in both the tall Serve view
  and the shorter edit view. The **customer is sized by scene WIDTH** (~48%) —
  the painted animal PNGs are square, so width is the limiting dimension; sizing
  by height would balloon them. In serve, Ishana shifts to `left:37%` to leave
  the customer room at the counter (centred in edit). Position Ishana via a
  STATIC-centred wrapper with the bob/cheer animation on the inner `<img>` (the
  keyframe's `transform` would otherwise clobber a `-translate-x-1/2`).
- **Outfit variants are full looks** (hat/shoes baked in); painted dresses swap
  the whole `ishana-*` image and reflect on Welcome + Serve + Dress-Up. Dresses
  without a painted variant fall back to the code-drawn layered `FullIshana`.
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
- **Dress-Up Try-On (affordability-gated):** owned → wear; affordable-not-owned
  → previews on the avatar + a "Buy" bar; **unaffordable → locked** (disabled,
  shows 🔒 + price, no try-on) so the urge to save up is preserved. `ItemGrid`
  disables `!owned && !afford` by default; `noDisable` exists but is intentionally
  NOT used on Dress-Up.
- **Sounds (`useSounds`):** correct/wrong/pop/coin/gulp/upgrade/mystery/rare/
  fanfare/tick + plop (scoop), ding (order done), yay (customer), sparkle.
  Also `setMuted(bool)`/`isMuted()` (gates all SFX + speech; `mutedRef`) and
  **`speak(text)`** (Web Speech `speechSynthesis`) — the HUD 🔊/🔇 toggle persists
  to `localStorage["ishana_muted"]`.
- **Voice narration (pre-readers):** age 4–6 can't read, so each new order speaks
  a short cue from `MODE_NARRATION[mode]` (effect on `[roundKey, tab]`, Serve tab
  only, skipped when muted). Instructions stay visual-first (scoops/dots/numbers).
- **Daily reward is guarded:** `claimDaily` early-returns if `save.daily.last ===
  today()` (was an INFINITE-claim exploit — 🎁 button opens the overlay anytime).
  `DailyReward` shows "Claimed! Come back tomorrow" when already claimed.
- **Reset is gated:** Welcome "new shop" opens a `confirmReset` modal ("ask a
  grown-up") instead of wiping instantly.
- **HUD:** Lv · ⭐ · 🪙(emphasised) · 🔊mute · 🎁 (44px tap targets) + a
  `ShopProgress` bar showing "N 🍦 to go" to the next `SHOP_TIERS` upgrade + a
  **daily-mission line** ("🎯 Daily goal: n/5 customers"; serve `MISSION_TARGET`
  for `MISSION_BONUS` coins, tracked in `save.mission`).
- **Onboarding:** first run shows `IntroCoach` (spoken) before the daily; gated by
  `save.seenIntro`. Entry effect order: intro → daily.
- **Settings + parental gate (Kids-store compliance):** Welcome ⚙️ Settings and
  "new shop" both route through `ParentalGate` (a multiplication only adults solve
  quickly) via `gateNext` → `passGate`. `SettingsPage` toggles SFX (`muted`) &
  `musicOn` and links `PrivacyPage` (no data collected / no ads / no IAP / local
  only) + reset (which still goes through the `confirmReset` modal).
- **Background music:** `useSounds.startMusic/stopMusic` — a gentle synthesised
  pad loop (no files), low volume, gated by `musicOn` && !muted && screen==="play".
- **Per-mode narration:** each mode speaks its SPECIFIC task on mount via a `speak`
  prop (e.g. CountingMode says "I want 3 Strawberry scoops"); the generic App cue
  was removed. Modes also scale difficulty with `level` (Catch `need`, Speed `DUR`,
  Addition operands).
- **Economy:** earning flattened to `10 + level*2` (× multipliers). Rare+ purchases
  fire a bigger celebration (`celebrate` → confetti `big` for legendary/dream).
- **Replace Ishana's art:** set `ISHANA_FACE_SRC` to a square head image;
  otherwise the drawn portrait is used.
- **Save data:** `localStorage` under `SAVE_KEY` — bump the version suffix when
  the save shape changes (currently `v5`).
- **Item catalog:** one `CATALOG` array; ids prefixed by category. Slot
  categories (`SLOT_KEYS`) are single-select shop upgrades that restyle the
  scene; `decor` items are placeable & draggable. `counter` items carry a CSS
  `filter` used to tint the painted `counter.png`.
- **Upgrade = live-preview renovation (not a catalog):** `DecoratePage` keeps a
  `focus` item. Tapping an OWNED item acts at once (equip / place); tapping an
  unowned-but-affordable item sets `focus` → it previews live on the shop (with
  a `preview-pulse` highlight) + a green **Buy** bar; unaffordable stays locked
  (🔒). `ShopScene`'s `S(slot)` returns the `preview` item when its category
  matches, so the focused upgrade shows before purchase. Buy commits + equips so
  the change is instantly visible (and persists into Serve).
- Keep everything in the single file and rebuild — no modules (no bundler).

## Known TODO / requested next

Done: daily-exploit fix, mute + background music, specific per-mode voice
narration, onboarding intro, parental gate + privacy + Settings, reset gate,
HUD progress bar + daily mission, faster reward, difficulty curves, economy
flatten, fewer particles, visible floor/door, **painted ice-cream machines**,
44px tap targets, bigger fonts, wider tablet column, dead-asset cleanup.

Still open (deferred, larger efforts):
- **Painted decor & helper assets** — decor/helpers are still emoji (on cute
  bases/pedestals). Generate PNGs (`nano_banana_pro` + `remove_background`) and
  wire like the machines (`ASSET.machine[base]` pattern) for full art parity.
- **Dedicated landscape/tablet layout** — column is wider on tablets now, but
  there's no landscape-specific layout using the side space.
- Push notifications / multi-profile / parental dashboard.
- Big features: sandbox free-play, multi-step orders (rasa+topping via shelf
  jars), tier-up cutscene, seasonal events, full localisation + spoken numbers.
- #5 extra juice: coin-fly-to-counter + heart burst on the customer.
- #6 Home/mascot expression pack as painted assets.
