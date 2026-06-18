/* ============================================================================
 *  🍦 ISHANA'S SHOP — ULTIMATE (SHOP-BUILDER EDITION)
 *  Build the coolest ice-cream SHOP in the world. Everything you buy is shop
 *  themed — signs, awnings, counters, machines, statues, attractions, staff —
 *  so the fantasy stays "my ice-cream business is growing", not house decor.
 *
 *  Single self-contained React app. index.html provides React/ReactDOM and
 *  compiles this file with Babel (classic JSX runtime). Audio = Web Audio API.
 *  Saves to localStorage.
 *
 *  ▶ Custom Ishana art? Set ISHANA_FACE_SRC to a square head image; otherwise
 *    the built-in drawn Ishana (matching the reference) is used.
 * ========================================================================== */

const { useState, useEffect, useRef, useCallback, useMemo } = React;

const ISHANA_FACE_SRC = "ishana_face.png";
const SAVE_KEY = "ishana_shop_save_v4";

/* ============================== CORE DATA ================================ */
const FLAVORS = {
  strawberry: { key: "strawberry", color: "#ff6b9d", light: "#ffc2d8", name: "Strawberry" },
  melon:      { key: "melon",      color: "#7ed957", light: "#c3f3a8", name: "Melon" },
  banana:     { key: "banana",     color: "#ffd93d", light: "#fff0a8", name: "Banana" },
  bubblegum:  { key: "bubblegum",  color: "#4dd0e1", light: "#b3eef5", name: "Bubblegum" },
};
const FLAVOR_KEYS = Object.keys(FLAVORS);
const FLAVOR_LIST = Object.values(FLAVORS);

const SHOP_TIERS = [
  { min: 1,  name: "Tiny Cart",       emoji: "🛒" },
  { min: 10, name: "Mini Shop",       emoji: "🏠" },
  { min: 20, name: "Ice Cream Store", emoji: "🏪" },
  { min: 30, name: "Dessert Palace",  emoji: "🏰" },
  { min: 40, name: "Magical Kingdom", emoji: "🌈" },
];
const INTERIORS = [
  { wall: "linear-gradient(#ffe6f1,#ffd0e6)", floor: "#e8b888", counter: "#ff9ec4" },
  { wall: "linear-gradient(#ffe9c2,#ffd79a)", floor: "#d8a36b", counter: "#ff8fb3" },
  { wall: "linear-gradient(#dff1ff,#bfe4ff)", floor: "#caa06a", counter: "#7ec8ff" },
  { wall: "linear-gradient(#efe2ff,#d9c2ff)", floor: "#b98a55", counter: "#b58cff" },
  { wall: "linear-gradient(#fff3cf,#ffe7a0)", floor: "#c79a3d", counter: "#ffc83d" },
];
const WORLDS = [
  { name: "Ice Cream Village",      sky: ["#bdecff", "#eaf9ff"], accent: "#ff7eb3", out: "🌳", sun: "☀️" },
  { name: "Candy Forest",          sky: ["#ffd6f4", "#fff0fb"], accent: "#ff5fae", out: "🍭", sun: "🌸" },
  { name: "Unicorn Meadows",       sky: ["#e3d4ff", "#f6f0ff"], accent: "#a06bff", out: "🌈", sun: "✨" },
  { name: "Space Dessert Station", sky: ["#2b2b5e", "#4a4a8f"], accent: "#7afcff", out: "🪐", sun: "⭐" },
  { name: "Royal Dessert Kingdom", sky: ["#ffe9a8", "#fff7dd"], accent: "#ffb300", out: "🏰", sun: "💎" },
];

const REGULARS = ["owl", "giraffe", "cat"];
const RARES = {
  unicorn: { emoji: "🦄", name: "Unicorn", unlockLevel: 5 }, robotpanda: { emoji: "🐼", name: "Robot Panda", unlockLevel: 12 },
  dragon: { emoji: "🐲", name: "Baby Dragon", unlockLevel: 18 }, dino: { emoji: "🦖", name: "Dino Kid", unlockLevel: 25 }, alienbunny: { emoji: "👽", name: "Alien Bunny", unlockLevel: 32 },
};
const RARE_KEYS = Object.keys(RARES);
const CUSTOMER_INFO = { owl: { emoji: "🦉", name: "Nerd Owl" }, giraffe: { emoji: "🦒", name: "Mechanic Giraffe" }, cat: { emoji: "🐱", name: "Lazy Cat" }, ...Object.fromEntries(RARE_KEYS.map((k) => [k, { emoji: RARES[k].emoji, name: RARES[k].name }])) };

const RARITY = { common: { name: "Common", color: "#9aa3ad", cost: 30 }, rare: { name: "Rare", color: "#3aa0ff", cost: 90 }, epic: { name: "Epic", color: "#a06bff", cost: 200 }, legendary: { name: "Legendary", color: "#ffb300", cost: 600 } };

/* Slot categories = single-select upgrades that restyle the shop. */
const SLOT_KEYS = ["sign", "roof", "entrance", "window", "counter", "floor", "wall", "ceiling", "machine", "helper"];
const isSlot = (cat) => SLOT_KEYS.includes(cat);

function it(id, cat, name, rarity, v) { return { id: cat + "_" + id, base: id, cat, name, rarity, cost: RARITY[rarity].cost, ...(v || {}) }; }
const CATALOG = [
  /* ---- EXTERIOR ---- */
  it("wood", "sign", "Wooden Sign", "common", { bg: "#b5824a" }),
  it("pink", "sign", "Pink Sign", "common", { bg: "#ff7eb3" }),
  it("neon", "sign", "Neon Sign", "rare", { bg: "#ff3df0", glow: "#ff3df0" }),
  it("rainbow", "sign", "Rainbow Sign", "epic", { bg: "linear-gradient(90deg,#ff5c93,#ffd93d,#7ed957,#4dd0e1,#a06bff)" }),
  it("unicorn", "sign", "Unicorn Sign", "epic", { bg: "#c9a6ff", tag: "🦄" }),
  it("gold", "sign", "Golden Sign", "legendary", { bg: "linear-gradient(90deg,#ffe27a,#ffb300)", glow: "#ffd700" }),

  it("stripe", "roof", "Stripe Awning", "common", { c1: "#ff5c5c", c2: "#fff" }),
  it("candy", "roof", "Candy Roof", "common", { c1: "#ff8fb3", c2: "#ffd6e8" }),
  it("rainbow", "roof", "Rainbow Roof", "rare", { rainbow: true }),
  it("icecream", "roof", "Ice Cream Roof", "rare", { c1: "#ffe0b3", c2: "#fff" }),
  it("castle", "roof", "Castle Roof", "epic", { c1: "#b58cff", c2: "#9b6bff", castle: true }),

  it("flower", "entrance", "Flower Arch", "common", { emoji: "🌸" }),
  it("balloon", "entrance", "Balloon Arch", "common", { emoji: "🎈" }),
  it("candy", "entrance", "Candy Gate", "rare", { emoji: "🍭" }),
  it("unicorn", "entrance", "Unicorn Gate", "epic", { emoji: "🦄" }),
  it("gold", "entrance", "Golden Gate", "legendary", { emoji: "👑" }),

  it("basic", "window", "Basic Window", "common", { icon: "" }),
  it("heart", "window", "Heart Window", "common", { icon: "❤️" }),
  it("star", "window", "Star Window", "rare", { icon: "⭐" }),
  it("rainbow", "window", "Rainbow Window", "epic", { icon: "🌈" }),

  /* ---- INTERIOR ---- */
  it("wood", "counter", "Wooden Counter", "common", { color: "#b5824a" }),
  it("pink", "counter", "Pink Counter", "common", { color: "#ff9ec4" }),
  it("candy", "counter", "Candy Counter", "rare", { color: "#ff6fae" }),
  it("crystal", "counter", "Crystal Counter", "epic", { color: "#a8eef5" }),
  it("gold", "counter", "Golden Counter", "legendary", { color: "#ffd24d" }),

  it("wood", "floor", "Wood Floor", "common", { bg: "repeating-linear-gradient(90deg,#caa06a 0 38px,#b88a55 38px 40px)" }),
  it("pinktile", "floor", "Pink Tile", "common", { bg: "repeating-conic-gradient(#ffd6e8 0% 25%,#ffb6d9 0% 50%) 0/40px 40px" }),
  it("rainbow", "floor", "Rainbow Tile", "rare", { bg: "repeating-linear-gradient(90deg,#ff6b9d,#ffd93d,#7ed957,#4dd0e1 90px)" }),
  it("candy", "floor", "Candy Tile", "rare", { bg: "repeating-conic-gradient(#fff 0% 25%,#ff8fb3 0% 50%) 0/36px 36px" }),
  it("ice", "floor", "Ice Floor", "epic", { bg: "linear-gradient(#dff6ff,#bfe9ff)" }),

  it("pink", "wall", "Pink Wallpaper", "common", { bg: "linear-gradient(#ffe6f1,#ffd0e6)" }),
  it("cloud", "wall", "Cloud Wallpaper", "common", { bg: "linear-gradient(#eaf6ff,#d6ecff)" }),
  it("candy", "wall", "Candy Wallpaper", "rare", { bg: "linear-gradient(#ffe1f0,#ffc6e6)" }),
  it("unicorn", "wall", "Unicorn Wallpaper", "epic", { bg: "linear-gradient(#efe2ff,#e0ccff)" }),
  it("space", "wall", "Space Wallpaper", "epic", { bg: "linear-gradient(#2b2b5e,#4a4a8f)", dark: true }),
  it("princess", "wall", "Princess Wallpaper", "legendary", { bg: "linear-gradient(#fff3cf,#ffe7a0)" }),

  it("balloons", "ceiling", "Balloons", "common", { emoji: "🎈" }),
  it("stars", "ceiling", "Stars", "common", { emoji: "⭐" }),
  it("clouds", "ceiling", "Clouds", "rare", { emoji: "☁️" }),
  it("lanterns", "ceiling", "Lanterns", "rare", { emoji: "🏮" }),
  it("candy", "ceiling", "Floating Candy", "epic", { emoji: "🍬" }),

  /* ---- EQUIPMENT ---- */
  it("basic", "machine", "Basic Machine", "common", { emoji: "🍦" }),
  it("rainbow", "machine", "Rainbow Machine", "rare", { emoji: "🌈" }),
  it("magic", "machine", "Magic Machine", "epic", { emoji: "✨" }),
  it("gold", "machine", "Golden Machine", "legendary", { emoji: "🏆" }),

  /* ---- STAFF ---- */
  it("bunny", "helper", "Bunny Helper", "common", { emoji: "🐰" }),
  it("kitty", "helper", "Kitty Helper", "common", { emoji: "🐱" }),
  it("panda", "helper", "Panda Helper", "rare", { emoji: "🐼" }),
  it("unicorn", "helper", "Unicorn Helper", "epic", { emoji: "🦄" }),

  /* ---- DECOR (placeable & draggable in the shop) ---- */
  it("plantsmall", "decor", "Small Plant", "common", { emoji: "🌱" }),
  it("flowerpot", "decor", "Flower Pot", "common", { emoji: "🪴" }),
  it("sakura", "decor", "Sakura Tree", "rare", { emoji: "🌸" }),
  it("table", "decor", "Café Table", "common", { emoji: "🍽️" }),
  it("teddy", "decor", "Teddy Bear", "common", { emoji: "🧸" }),
  it("bunnydoll", "decor", "Bunny Doll", "rare", { emoji: "🐰" }),
  it("unicorndoll", "decor", "Unicorn Doll", "epic", { emoji: "🦄" }),
  it("statueice", "decor", "Ice Cream Statue", "rare", { emoji: "🍦" }),
  it("statuedragon", "decor", "Dragon Statue", "epic", { emoji: "🐉" }),
  it("aquarium", "decor", "Aquarium", "rare", { emoji: "🐠" }),
  it("aquariumbig", "decor", "Giant Aquarium", "epic", { emoji: "🐳" }),
  it("sprinkle", "decor", "Sprinkle Station", "rare", { emoji: "🧁" }),
  it("topping", "decor", "Topping Display", "rare", { emoji: "🍫" }),
  it("photo", "decor", "Photo Booth", "rare", { emoji: "📸" }),
  it("balloons", "decor", "Balloon Corner", "common", { emoji: "🎈" }),
  it("fountain", "decor", "Choc Fountain", "epic", { emoji: "⛲" }),
  it("monument", "decor", "Ice Cream Monument", "legendary", { emoji: "🗼" }),

  /* ---- CLOTHES ---- */
  it("chef", "dress", "Chef Outfit", "common", { color: "#ffffff", emoji: "🍳" }),
  it("doctor", "dress", "Doctor Outfit", "rare", { color: "#eaf2ff", emoji: "🥼" }),
  it("pinkprincess", "dress", "Princess Dress", "rare", { color: "#ff9ec4", emoji: "👗" }),
  it("fairy", "dress", "Fairy Dress", "epic", { color: "#d7f7e0", emoji: "🧚" }),
  it("astronaut", "dress", "Astronaut Suit", "epic", { color: "#d6dcff", emoji: "🚀" }),
  it("rainbow", "dress", "Rainbow Dress", "epic", { color: "linear-gradient(135deg,#ff6b9d,#ffd93d,#7ed957,#4dd0e1,#a06bff)", emoji: "🌈" }),
  it("unicorn", "dress", "Unicorn Costume", "legendary", { color: "linear-gradient(135deg,#ffd6f4,#e3d4ff,#d7f7ff)", emoji: "🦄" }),
  it("bunny", "shoes", "Bunny Slippers", "common", { emoji: "🐰" }),
  it("princess", "shoes", "Princess Shoes", "rare", { emoji: "👠" }),
  it("rainbow", "shoes", "Rainbow Boots", "rare", { emoji: "👢" }),
  it("bow", "acc", "Hair Bow", "common", { place: "head", emoji: "🎀" }),
  it("glasses", "acc", "Glasses", "common", { place: "face", emoji: "👓" }),
  it("backpack", "acc", "Backpack", "common", { place: "side", emoji: "🎒" }),
  it("wand", "acc", "Magic Wand", "rare", { place: "hand", emoji: "🪄" }),
  it("stethoscope", "acc", "Stethoscope", "rare", { place: "neck", emoji: "🩺" }),
  it("crown", "acc", "Crown", "epic", { place: "head", emoji: "👑" }),
  it("wings", "acc", "Butterfly Wings", "epic", { place: "behind", emoji: "🦋" }),
  it("chef", "hat", "Chef Hat", "common", { emoji: "🎩" }),
  it("doctor", "hat", "Doctor Hat", "common", { emoji: "⛑️" }),
  it("tiara", "hat", "Princess Tiara", "epic", { emoji: "👑" }),
  it("unicornband", "hat", "Unicorn Headband", "epic", { emoji: "🦄" }),
  it("straw", "hat", "Straw Hat", "common", { emoji: "👒" }),
  it("flower", "hat", "Flower Hat", "common", { emoji: "🌻" }),
  it("party", "hat", "Party Hat", "common", { emoji: "🎉" }),
  it("star", "hat", "Star Headband", "rare", { emoji: "⭐" }),
  it("heart", "hat", "Heart Headband", "rare", { emoji: "💗" }),

  /* ---- MORE DRESSES ---- */
  it("flower", "dress", "Flower Dress", "common", { color: "#ffe9a8", emoji: "🌷" }),
  it("star", "dress", "Star Dress", "rare", { color: "#cfe3ff", emoji: "⭐" }),
  it("heart", "dress", "Heart Dress", "rare", { color: "#ffd6e6", emoji: "💖" }),
  it("ballerina", "dress", "Ballerina Tutu", "rare", { color: "#ffd9ec", emoji: "🩰" }),
  it("strawberry", "dress", "Strawberry Dress", "epic", { color: "#ffc2cf", emoji: "🍓" }),
  it("mermaid", "dress", "Mermaid Dress", "epic", { color: "#b3f0e0", emoji: "🧜‍♀️" }),
  it("witch", "dress", "Witch Robe", "rare", { color: "#d8c2ff", emoji: "🧙‍♀️" }),
  it("super", "dress", "Superhero Suit", "epic", { color: "#cfe0ff", emoji: "🦸‍♀️" }),
  it("queen", "dress", "Queen Gown", "legendary", { color: "linear-gradient(135deg,#ffe27a,#ffb300)", emoji: "👸" }),

  /* ---- MORE SHOES ---- */
  it("sneaker", "shoes", "Sneakers", "common", { emoji: "👟" }),
  it("heels", "shoes", "Sparkle Heels", "rare", { emoji: "👡" }),
  it("skate", "shoes", "Roller Skates", "rare", { emoji: "🛼" }),
  it("glass", "shoes", "Glass Slippers", "epic", { emoji: "🥿" }),

  /* ---- MORE ACCESSORIES ---- */
  it("starclip", "acc", "Star Clip", "common", { place: "head", emoji: "⭐" }),
  it("flowercrown", "acc", "Flower Crown", "rare", { place: "head", emoji: "🌸" }),
  it("sunnies", "acc", "Sunglasses", "common", { place: "face", emoji: "🕶️" }),
  it("necklace", "acc", "Necklace", "common", { place: "neck", emoji: "📿" }),
  it("scarf", "acc", "Cozy Scarf", "common", { place: "neck", emoji: "🧣" }),
  it("balloon", "acc", "Balloon", "common", { place: "hand", emoji: "🎈" }),
  it("starwand", "acc", "Star Wand", "epic", { place: "hand", emoji: "🌟" }),
  it("umbrella", "acc", "Cute Umbrella", "rare", { place: "hand", emoji: "☂️" }),

  /* ---- PETS ---- */
  it("bunny", "pet", "Bunny", "common", { emoji: "🐰" }),
  it("kitty", "pet", "Kitty", "common", { emoji: "🐱" }),
  it("penguin", "pet", "Penguin", "rare", { emoji: "🐧" }),
  it("fox", "pet", "Fox", "rare", { emoji: "🦊" }),
  it("panda", "pet", "Panda", "epic", { emoji: "🐼" }),
  it("unicorn", "pet", "Baby Unicorn", "epic", { emoji: "🦄" }),
  it("dragon", "pet", "Mini Dragon", "legendary", { emoji: "🐉" }),
];
const ITEM = Object.fromEntries(CATALOG.map((i) => [i.id, i]));
const byCat = (cat) => CATALOG.filter((i) => i.cat === cat);

/* Theme collections — own every item → coin bonus. */
const THEMES = [
  { name: "Candy", emoji: "🍭", color: "#ff6fae", items: ["roof_candy", "wall_candy", "floor_candy", "counter_candy"] },
  { name: "Princess", emoji: "👑", color: "#ffb300", items: ["roof_castle", "counter_gold", "wall_princess", "entrance_gold"] },
  { name: "Unicorn", emoji: "🦄", color: "#a06bff", items: ["sign_unicorn", "entrance_unicorn", "helper_unicorn", "decor_unicorndoll"] },
  { name: "Space", emoji: "🚀", color: "#3aa0ff", items: ["wall_space", "sign_neon", "machine_magic", "floor_ice"] },
];
const themeDone = (owned, t) => t.items.every((id) => owned.includes(id));

const MODES = ["pattern", "counting", "addition", "memory", "sorting", "speed", "mega"];
const MODE_LABELS = { pattern: "Pattern", counting: "Counting", addition: "Add Up", memory: "Memory", sorting: "Catch!", speed: "Speed", mega: "Mega" };
const DAILY_REWARDS = [
  { emoji: "🪙", label: "+50 Coins", coins: 50 }, { emoji: "🪙", label: "+80 Coins", coins: 80 }, { emoji: "🎀", label: "Free Bow", grant: "acc_bow" },
  { emoji: "🪙", label: "+120 Coins", coins: 120 }, { emoji: "🪴", label: "Free Plant", grant: "decor_flowerpot" }, { emoji: "🐰", label: "Free Pet", grant: "pet_bunny" }, { emoji: "🏆", label: "+250 Coins", coins: 250 },
];

/* ============================== HELPERS ================================== */
const rand = (a) => a[Math.floor(Math.random() * a.length)];
const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const today = () => new Date().toDateString();
function tierIndexForLevel(level) { let i = 0; SHOP_TIERS.forEach((t, k) => { if (level >= t.min) i = k; }); return i; }
function defaultSave() { return { level: 1, coins: 80, stars: 0, xp: 0, best: 0, met: [], rares: [], owned: [], equipped: { dress: null, shoes: null, acc: null, hat: null }, shop: {}, pet: null, placed: [], daily: { last: null, day: 0 } }; }
function loadSave() { try { const r = localStorage.getItem(SAVE_KEY); if (r) return { ...defaultSave(), ...JSON.parse(r) }; } catch (e) {} return defaultSave(); }
const persist = (s) => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch (e) {} };

/* ============================== AUDIO ==================================== */
function useSounds() {
  const ctxRef = useRef(null);
  const getCtx = () => { if (!ctxRef.current) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) ctxRef.current = new AC(); } if (ctxRef.current && ctxRef.current.state === "suspended") ctxRef.current.resume(); return ctxRef.current; };
  const tone = (f, s, d, t = "sine", g = 0.16) => { const c = getCtx(); if (!c) return; const t0 = c.currentTime + s, o = c.createOscillator(), gn = c.createGain(); o.type = t; o.frequency.setValueAtTime(f, t0); gn.gain.setValueAtTime(0.0001, t0); gn.gain.exponentialRampToValueAtTime(g, t0 + 0.02); gn.gain.exponentialRampToValueAtTime(0.0001, t0 + d); o.connect(gn).connect(c.destination); o.start(t0); o.stop(t0 + d + 0.05); };
  const slide = (a, b, d, t = "sine", g = 0.2) => { const c = getCtx(); if (!c) return; const t0 = c.currentTime, o = c.createOscillator(), gn = c.createGain(); o.type = t; o.frequency.setValueAtTime(a, t0); o.frequency.exponentialRampToValueAtTime(b, t0 + d); gn.gain.setValueAtTime(g, t0); gn.gain.exponentialRampToValueAtTime(0.0001, t0 + d + 0.02); o.connect(gn).connect(c.destination); o.start(t0); o.stop(t0 + d + 0.05); };
  return useMemo(() => ({
    getCtx,
    correct: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.08, 0.22, "triangle", 0.2)),
    wrong: () => slide(420, 120, 0.35, "sine", 0.22), pop: () => tone(680, 0, 0.08, "triangle", 0.13),
    coin: () => { tone(988, 0, 0.08, "square", 0.12); tone(1318, 0.06, 0.1, "square", 0.12); },
    gulp: () => slide(180, 90, 0.22, "sawtooth", 0.2),
    upgrade: () => [392, 523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.1, 0.3, "triangle", 0.18)),
    mystery: () => [880, 1100, 1320, 1760].forEach((f, i) => tone(f, i * 0.12, 0.35, "sine", 0.16)),
    rare: () => { [660, 880, 1320].forEach((f, i) => tone(f, i * 0.09, 0.3, "triangle", 0.18)); tone(1760, 0.3, 0.4, "sine", 0.14); },
    fanfare: () => { [523, 587, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.12, 0.3, "square", 0.15)); tone(1318, 0.6, 0.6, "triangle", 0.2); },
    tick: () => tone(1200, 0, 0.04, "square", 0.08),
  }), []);
}

/* ============================== ISHANA ART =============================== */
function IshanaPortrait({ size = 110, mood = "idle" }) {
  const eyes = mood === "cheer" ? "closed" : mood === "freeze" ? "wide" : mood === "proud" ? "wink" : "open";
  const mouth = mood === "cheer" || mood === "dance" ? "open" : mood === "freeze" ? "o" : "smile";
  const browY = mood === "freeze" ? 49 : 52;
  return (
    <svg width={size} height={size * 1.05} viewBox="0 0 120 126" style={{ overflow: "visible" }}>
      <defs>
        <clipPath id="capDome"><path d="M22,58 Q22,20 60,18 Q98,20 98,58 Z" /></clipPath>
        <radialGradient id="cheek" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#ff9ec4" /><stop offset="100%" stopColor="#ff9ec4" stopOpacity="0" /></radialGradient>
      </defs>
      <path d="M16,70 Q10,30 60,24 Q110,30 104,70 Q106,104 96,118 L88,96 Q86,108 80,116 L78,92 Q60,98 42,92 L40,116 Q34,108 32,96 L24,118 Q14,104 16,70 Z" fill="#211a1f" />
      <ellipse cx="60" cy="74" rx="33" ry="35" fill="#ffe0cf" />
      <ellipse cx="28" cy="76" rx="6" ry="9" fill="#ffe0cf" /><ellipse cx="92" cy="76" rx="6" ry="9" fill="#ffe0cf" />
      <path d="M27,64 Q26,42 60,40 Q94,42 93,64 Q86,54 76,57 Q72,46 60,48 Q48,46 44,57 Q34,54 27,64 Z" fill="#211a1f" />
      <g>
        <g clipPath="url(#capDome)">{Array.from({ length: 10 }).map((_, i) => <rect key={i} x={22 + i * 7.6} y="14" width="7.6" height="48" fill={i % 2 ? "#ffffff" : "#ff9ec4"} />)}</g>
        <path d="M22,58 Q22,20 60,18 Q98,20 98,58 Z" fill="none" stroke="#ff7eb3" strokeWidth="2" />
        <rect x="20" y="56" width="80" height="11" rx="5" fill="#fff" stroke="#ffb6d9" strokeWidth="2" />
        <path d="M55,16 L65,16 L60,30 Z" fill="#f0c27a" /><circle cx="60" cy="11" r="7" fill="#ff9ec4" /><circle cx="57" cy="9" r="2" fill="#fff" opacity="0.7" />
      </g>
      {eyes !== "closed" && (<><path d={`M44,${browY} Q50,${browY - 3} 55,${browY}`} stroke="#5b3a29" strokeWidth="2.4" fill="none" strokeLinecap="round" /><path d={`M65,${browY} Q70,${browY - 3} 76,${browY}`} stroke="#5b3a29" strokeWidth="2.4" fill="none" strokeLinecap="round" /></>)}
      {eyes === "open" && (<><ellipse cx="49" cy="72" rx="6.5" ry="8.5" fill="#3a2a22" /><ellipse cx="71" cy="72" rx="6.5" ry="8.5" fill="#3a2a22" /><circle cx="51" cy="69" r="2.4" fill="#fff" /><circle cx="73" cy="69" r="2.4" fill="#fff" /></>)}
      {eyes === "wide" && (<><ellipse cx="49" cy="72" rx="7.5" ry="10" fill="#3a2a22" /><ellipse cx="71" cy="72" rx="7.5" ry="10" fill="#3a2a22" /><circle cx="51" cy="68" r="2.6" fill="#fff" /><circle cx="73" cy="68" r="2.6" fill="#fff" /></>)}
      {eyes === "closed" && (<><path d="M42,73 Q49,66 56,73" stroke="#3a2a22" strokeWidth="3" fill="none" strokeLinecap="round" /><path d="M64,73 Q71,66 78,73" stroke="#3a2a22" strokeWidth="3" fill="none" strokeLinecap="round" /></>)}
      {eyes === "wink" && (<><ellipse cx="49" cy="72" rx="6.5" ry="8.5" fill="#3a2a22" /><circle cx="51" cy="69" r="2.4" fill="#fff" /><path d="M64,73 Q71,67 78,73" stroke="#3a2a22" strokeWidth="3" fill="none" strokeLinecap="round" /></>)}
      <ellipse cx="40" cy="86" rx="7" ry="4.5" fill="url(#cheek)" /><ellipse cx="80" cy="86" rx="7" ry="4.5" fill="url(#cheek)" />
      <circle cx="42" cy="84" r="0.9" fill="#e0936b" /><circle cx="46" cy="86" r="0.9" fill="#e0936b" /><circle cx="78" cy="84" r="0.9" fill="#e0936b" /><circle cx="74" cy="86" r="0.9" fill="#e0936b" />
      <path d="M59,80 Q60,83 61,80" stroke="#e0a17e" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {mouth === "smile" && <path d="M52,90 Q60,98 68,90" stroke="#b5485f" strokeWidth="2.6" fill="none" strokeLinecap="round" />}
      {mouth === "open" && (<><path d="M51,89 Q60,106 69,89 Z" fill="#b5485f" /><path d="M55,98 Q60,103 65,98 Z" fill="#ff8fab" /></>)}
      {mouth === "o" && <ellipse cx="60" cy="93" rx="4.5" ry="6" fill="#b5485f" />}
      {(mood === "dance" || mood === "cheer") && (<><text x="14" y="40" fontSize="14">✨</text><text x="98" y="38" fontSize="14">✨</text></>)}
    </svg>
  );
}
function IshanaFace({ size = 110, mood = "happy" }) {
  const [ok, setOk] = useState(true);
  const cls = mood === "cheer" ? "ishana-cheer" : mood === "dance" ? "ishana-dance" : mood === "freeze" ? "shiver" : "bob";
  return (
    <div className={"relative " + cls} style={{ width: size, height: size }} aria-label="Ishana">
      <img src={ISHANA_FACE_SRC} alt="" draggable={false} onLoad={() => setOk(true)} onError={() => setOk(false)} className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg" style={{ display: ok ? "block" : "none" }} />
      {!ok && <div className="w-full h-full flex items-center justify-center"><IshanaPortrait size={size} mood={mood} /></div>}
    </div>
  );
}
function FullIshana({ equipped, pet, size = 128, mood = "idle" }) {
  const dress = equipped.dress && ITEM[equipped.dress], shoes = equipped.shoes && ITEM[equipped.shoes], acc = equipped.acc && ITEM[equipped.acc], hat = equipped.hat && ITEM[equipped.hat];
  const W = size, H = size * 1.58, head = size * 0.66, skin = "#ffe0cf";
  const body = dress ? dress.color : "#ffffff";
  return (
    <div className={"relative " + (mood === "dance" ? "ishana-dance" : mood === "cheer" ? "ishana-cheer" : "bob")} style={{ width: W, height: H }}>
      {acc && acc.place === "behind" && <div className="absolute left-1/2 -translate-x-1/2" style={{ top: H * 0.34, fontSize: size * 0.82, zIndex: 0 }}>{acc.emoji}</div>}
      {/* legs */}
      <div className="absolute left-1/2 -translate-x-1/2 flex gap-1.5" style={{ top: H * 0.76, zIndex: 1 }}><div style={{ width: W * 0.1, height: H * 0.15, background: skin, borderRadius: 8 }} /><div style={{ width: W * 0.1, height: H * 0.15, background: skin, borderRadius: 8 }} /></div>
      {/* shoes */}
      <div className="absolute left-1/2 -translate-x-1/2 flex gap-1" style={{ top: H * 0.87, zIndex: 2, fontSize: size * 0.2 }}>{shoes ? <><span>{shoes.emoji}</span><span>{shoes.emoji}</span></> : <><span>👟</span><span>👟</span></>}</div>
      {/* torso — the outfit is actually WORN: collar + sleeves + A-line skirt */}
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: H * 0.39, width: W * 0.6, height: H * 0.42, zIndex: 1 }}>
        {/* puffy sleeves */}
        <div className="absolute" style={{ left: "-6%", top: "2%", width: "30%", height: "30%", background: body, borderRadius: "50%", zIndex: 1 }} />
        <div className="absolute" style={{ right: "-6%", top: "2%", width: "30%", height: "30%", background: body, borderRadius: "50%", zIndex: 1 }} />
        {/* A-line skirt */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{ width: "114%", height: "66%", background: body, clipPath: "polygon(22% 0,78% 0,100% 100%,0 100%)", borderRadius: "0 0 26px 26px", zIndex: 2 }} />
        {/* bodice */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2" style={{ width: "62%", height: "52%", background: body, borderRadius: "44% 44% 14% 14%", boxShadow: "inset 0 -3px 6px rgba(0,0,0,0.06)", zIndex: 2 }} />
        {dress ? (<>
          {/* white collar + waist sash so it clearly reads as a dress */}
          <div className="absolute left-1/2 -translate-x-1/2 bg-white" style={{ top: "-5%", width: "30%", height: "15%", borderRadius: "50%", zIndex: 3 }} />
          <div className="absolute left-1/2 -translate-x-1/2" style={{ top: "45%", width: "72%", height: "7%", background: "rgba(255,255,255,0.5)", borderRadius: 6, zIndex: 3 }} />
        </>) : (<>
          {/* default = pink ICE CREAM apron over a white shirt */}
          <div className="absolute left-1/2 -translate-x-1/2" style={{ top: "14%", width: "58%", height: "84%", background: "#ff7eb3", clipPath: "polygon(16% 0,84% 0,100% 100%,0 100%)", borderRadius: "0 0 22px 22px", zIndex: 3 }} />
          <div className="absolute left-1/2 -translate-x-1/2" style={{ top: "42%", fontSize: size * 0.15, zIndex: 4 }}>🍦</div>
          <div className="absolute left-1/2 -translate-x-1/2 bg-white" style={{ top: "-5%", width: "28%", height: "14%", borderRadius: "50%", zIndex: 3 }} />
          <div className="absolute left-1/2 -translate-x-1/2" style={{ top: "-13%", fontSize: size * 0.15, zIndex: 4 }}>🎀</div>
        </>)}
      </div>
      {/* arms + little hands resting on the front */}
      <div className="absolute" style={{ left: W * 0.22, top: H * 0.45, width: W * 0.3, height: H * 0.055, background: skin, borderRadius: 20, transform: "rotate(20deg)", transformOrigin: "left center", zIndex: 2 }} />
      <div className="absolute" style={{ right: W * 0.22, top: H * 0.45, width: W * 0.3, height: H * 0.055, background: skin, borderRadius: 20, transform: "rotate(-20deg)", transformOrigin: "right center", zIndex: 2 }} />
      <div className="absolute rounded-full" style={{ left: W * 0.4, top: H * 0.55, width: W * 0.11, height: W * 0.11, background: skin, zIndex: 2, boxShadow: "inset 0 -2px 3px rgba(0,0,0,0.08)" }} />
      <div className="absolute rounded-full" style={{ right: W * 0.4, top: H * 0.55, width: W * 0.11, height: W * 0.11, background: skin, zIndex: 2, boxShadow: "inset 0 -2px 3px rgba(0,0,0,0.08)" }} />
      {/* head */}
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 0, zIndex: 3 }}><IshanaFace size={head} mood={mood} /></div>
      {/* hat + accessories */}
      {hat && <div className="absolute left-1/2 -translate-x-1/2" style={{ top: -size * 0.16, zIndex: 4, fontSize: size * 0.4 }}>{hat.emoji}</div>}
      {acc && acc.place === "head" && <div className="absolute left-1/2 -translate-x-1/2" style={{ top: -size * 0.1, zIndex: 5, fontSize: size * 0.32 }}>{acc.emoji}</div>}
      {acc && acc.place === "face" && <div className="absolute left-1/2 -translate-x-1/2" style={{ top: size * 0.22, zIndex: 5, fontSize: size * 0.26 }}>{acc.emoji}</div>}
      {acc && acc.place === "hand" && <div className="absolute" style={{ top: H * 0.5, right: W * 0.06, zIndex: 5, fontSize: size * 0.3 }}>{acc.emoji}</div>}
      {acc && acc.place === "side" && <div className="absolute" style={{ top: H * 0.46, left: W * 0.03, zIndex: 0, fontSize: size * 0.3 }}>{acc.emoji}</div>}
      {acc && acc.place === "neck" && <div className="absolute left-1/2 -translate-x-1/2" style={{ top: H * 0.36, zIndex: 5, fontSize: size * 0.24 }}>{acc.emoji}</div>}
      {pet && <div className="absolute bob" style={{ bottom: 0, right: -W * 0.12, fontSize: size * 0.4, zIndex: 5 }}>{ITEM[pet].emoji}</div>}
    </div>
  );
}

/* ============================== SCOOPS / CUSTOMERS ======================= */
function Scoop({ flavorKey, size = 60, className = "", style = {} }) {
  const f = FLAVORS[flavorKey] || FLAVORS.strawberry;
  return (
    <div className={"relative rounded-full " + className} style={{ width: size, height: size, background: "radial-gradient(circle at 32% 28%, " + f.light + ", " + f.color + " 72%)", boxShadow: "inset 0 -6px 10px rgba(0,0,0,0.12)", ...style }}>
      <div className="absolute rounded-full" style={{ top: "16%", left: "20%", width: size * 0.28, height: size * 0.18, background: "rgba(255,255,255,0.75)", filter: "blur(1px)" }} />
      {[[60, 30, 18], [40, 55, -25], [70, 60, 50], [30, 38, 10]].map((s, i) => <div key={i} className="absolute rounded-full" style={{ top: s[1] + "%", left: s[0] + "%", width: size * 0.06, height: size * 0.16, background: ["#fff", "#ffe066", "#ff8fab", "#b388ff"][i % 4], transform: "rotate(" + s[2] + "deg)" }} />)}
    </div>
  );
}
function Cone({ scoops = [], size = 46, max = 99 }) {
  const shown = scoops.slice(-max);
  return (<div className="flex flex-col items-center justify-end"><div className="flex flex-col-reverse items-center" style={{ marginBottom: -size * 0.25 }}>{shown.map((s, i) => <div key={i} className="scoop-pop" style={{ marginBottom: i === 0 ? 0 : -size * 0.42, zIndex: shown.length - i }}><Scoop flavorKey={s} size={size} /></div>)}</div><div style={{ width: 0, height: 0, borderLeft: size * 0.42 + "px solid transparent", borderRight: size * 0.42 + "px solid transparent", borderTop: size * 1.2 + "px solid #e0a85a" }} /></div>);
}
function Owl({ state }) {
  const Eye = () => <div className="rounded-full bg-white flex items-center justify-center" style={{ width: 42, height: 42, border: "3px solid #6b4bab" }}><div className={state === "freeze" ? "googly" : "owl-blink"} style={{ position: "relative", width: 22, height: 22, borderRadius: 99, background: "#3a2a22" }}><div style={{ position: "absolute", top: 4, left: 4, width: 7, height: 7, borderRadius: 99, background: "#fff" }} /></div></div>;
  return (
    <div className={"relative " + (state === "freeze" ? "shiver" : "bob")} style={{ width: 124, height: 130 }}>
      <div className="absolute rounded-full" style={{ bottom: 0, left: 42, width: 14, height: 8, background: "#ffb938" }} />
      <div className="absolute rounded-full" style={{ bottom: 0, right: 42, width: 14, height: 8, background: "#ffb938" }} />
      <div className="absolute left-1/2 -translate-x-1/2 rounded-[46%]" style={{ bottom: 4, width: 108, height: 116, background: "linear-gradient(#caa6f7,#9b6bf0)" }} />
      <div className="absolute rounded-[60%]" style={{ bottom: 22, left: 5, width: 22, height: 46, background: "#8a5fe0" }} />
      <div className="absolute rounded-[60%]" style={{ bottom: 22, right: 5, width: 22, height: 46, background: "#8a5fe0" }} />
      <div className="absolute left-1/2 -translate-x-1/2 rounded-[50%]" style={{ bottom: 8, width: 66, height: 78, background: "#f3eaff" }} />
      <div className="absolute" style={{ top: 2, left: 28, width: 0, height: 0, borderLeft: "9px solid transparent", borderRight: "9px solid transparent", borderBottom: "20px solid #8a5fe0" }} />
      <div className="absolute" style={{ top: 2, right: 28, width: 0, height: 0, borderLeft: "9px solid transparent", borderRight: "9px solid transparent", borderBottom: "20px solid #8a5fe0" }} />
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center" style={{ top: 24 }}><Eye /><div style={{ width: 6, height: 3, background: "#6b4bab" }} /><Eye /></div>
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 66, width: 0, height: 0, borderLeft: "7px solid transparent", borderRight: "7px solid transparent", borderTop: "12px solid #ffb938" }} />
      <div className="absolute rounded-full" style={{ top: 62, left: 24, width: 15, height: 9, background: "#ff9ec4", opacity: 0.65 }} />
      <div className="absolute rounded-full" style={{ top: 62, right: 24, width: 15, height: 9, background: "#ff9ec4", opacity: 0.65 }} />
    </div>
  );
}
function Giraffe({ neck, state }) {
  const h = Math.min(94, 16 + neck);
  const GEye = ({ side }) => <div className="absolute rounded-full bg-white flex items-center justify-center" style={{ top: 14, left: side === "l" ? 13 : undefined, right: side === "r" ? 13 : undefined, width: 16, height: 17 }}><div style={{ position: "relative", width: 9, height: 9, borderRadius: 99, background: "#3a2a22" }}><div style={{ position: "absolute", top: 1, left: 1, width: 3, height: 3, borderRadius: 99, background: "#fff" }} /></div></div>;
  return (
    <div className={"relative flex flex-col items-center " + (state === "freeze" ? "shiver" : "")} style={{ width: 124 }}>
      <div className="relative" style={{ zIndex: 3, marginBottom: -2 }}>
        <div className="rounded-[46%]" style={{ width: 62, height: 54, background: "#ffd479" }} />
        <div className="absolute" style={{ top: -13, left: 16, width: 6, height: 13, background: "#e0a94a", borderRadius: 4 }}><div className="rounded-full" style={{ position: "absolute", top: -6, left: -3, width: 12, height: 12, background: "#c98f3a" }} /></div>
        <div className="absolute" style={{ top: -13, right: 16, width: 6, height: 13, background: "#e0a94a", borderRadius: 4 }}><div className="rounded-full" style={{ position: "absolute", top: -6, left: -3, width: 12, height: 12, background: "#c98f3a" }} /></div>
        <div className="absolute rounded-[50%]" style={{ top: 12, left: -7, width: 16, height: 11, background: "#f3c25f" }} />
        <div className="absolute rounded-[50%]" style={{ top: 12, right: -7, width: 16, height: 11, background: "#f3c25f" }} />
        <GEye side="l" /><GEye side="r" />
        <div className="absolute left-1/2 -translate-x-1/2 rounded-[40%]" style={{ bottom: 3, width: 34, height: 20, background: "#ffe1a3" }} />
        <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: 9, width: 14, height: 6, borderBottom: "2px solid #b5824a", borderRadius: "0 0 8px 8px" }} />
        <div className="absolute rounded-full" style={{ top: 30, left: 5, width: 12, height: 7, background: "#ff9ec4", opacity: 0.6 }} />
        <div className="absolute rounded-full" style={{ top: 30, right: 5, width: 12, height: 7, background: "#ff9ec4", opacity: 0.6 }} />
      </div>
      <div style={{ width: 26, height: h, background: "#ffd479", marginTop: -2, borderRadius: 8, transition: "height .5s ease-out", overflow: "hidden", position: "relative", zIndex: 1 }}>
        {[16, 50, 82].map((t) => <div key={t} className="absolute rounded-md" style={{ top: t + "%", left: 5, width: 10, height: 10, background: "#e0a94a" }} />)}
      </div>
      <div className="rounded-[44%]" style={{ width: 80, height: 56, background: "#ffd479", marginTop: -4, position: "relative" }}>
        <div className="absolute rounded-md" style={{ top: 10, left: 14, width: 12, height: 12, background: "#e0a94a" }} />
        <div className="absolute rounded-md" style={{ top: 26, right: 16, width: 12, height: 12, background: "#e0a94a" }} />
      </div>
    </div>
  );
}
function Cat({ state }) {
  const CEye = ({ side }) => <div className="absolute rounded-full bg-white flex items-center justify-center" style={{ top: 30, left: side === "l" ? 30 : undefined, right: side === "r" ? 30 : undefined, width: 18, height: 20 }}><div style={{ position: "relative", width: 10, height: 12, borderRadius: 99, background: "#3a2a22" }}><div style={{ position: "absolute", top: 2, left: 2, width: 3, height: 3, borderRadius: 99, background: "#fff" }} /></div></div>;
  return (
    <div className={"relative " + (state === "freeze" ? "shiver" : "bob")} style={{ width: 124, height: 124 }}>
      <div className="absolute left-1/2 -translate-x-1/2 bottom-0 rounded-[46%]" style={{ width: 100, height: 70, background: "linear-gradient(#ffc18a,#ffb07c)" }} />
      <div className="absolute rounded-full" style={{ bottom: 8, right: 4, width: 34, height: 14, background: "#ffb07c", transform: "rotate(20deg)" }} />
      <div className="absolute left-1/2 -translate-x-1/2 rounded-[46%]" style={{ top: 4, width: 86, height: 76, background: "#ffc59b" }} />
      <div className="absolute" style={{ top: 0, left: 30, width: 0, height: 0, borderLeft: "13px solid transparent", borderRight: "13px solid transparent", borderBottom: "22px solid #ffc59b" }} />
      <div className="absolute" style={{ top: 0, right: 30, width: 0, height: 0, borderLeft: "13px solid transparent", borderRight: "13px solid transparent", borderBottom: "22px solid #ffc59b" }} />
      <div className="absolute" style={{ top: 5, left: 35, width: 0, height: 0, borderLeft: "7px solid transparent", borderRight: "7px solid transparent", borderBottom: "12px solid #ff9ec4" }} />
      <div className="absolute" style={{ top: 5, right: 35, width: 0, height: 0, borderLeft: "7px solid transparent", borderRight: "7px solid transparent", borderBottom: "12px solid #ff9ec4" }} />
      {state === "freeze" ? (<>
        <div className="absolute googly rounded-full" style={{ top: 32, left: 34, width: 13, height: 13, background: "#222" }} />
        <div className="absolute googly rounded-full" style={{ top: 32, right: 34, width: 13, height: 13, background: "#222" }} />
      </>) : (<><CEye side="l" /><CEye side="r" /></>)}
      <div className="absolute rounded-full" style={{ top: 50, left: 20, width: 16, height: 10, background: "#ff9ec4", opacity: 0.55 }} />
      <div className="absolute rounded-full" style={{ top: 50, right: 20, width: 16, height: 10, background: "#ff9ec4", opacity: 0.55 }} />
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 50, width: 8, height: 5, background: "#ff7a9c", borderRadius: 3 }} />
      <div className="absolute left-1/2 -translate-x-1/2 cat-yawn rounded-full" style={{ top: 58, width: 16, height: 12, background: "#7a3b4a" }} />
      <div className="absolute" style={{ top: 52, left: 6, width: 18, height: 2, background: "#e6c4a0", borderRadius: 2 }} />
      <div className="absolute" style={{ top: 58, left: 6, width: 18, height: 2, background: "#e6c4a0", borderRadius: 2 }} />
      <div className="absolute" style={{ top: 52, right: 6, width: 18, height: 2, background: "#e6c4a0", borderRadius: 2 }} />
      <div className="absolute" style={{ top: 58, right: 6, width: 18, height: 2, background: "#e6c4a0", borderRadius: 2 }} />
    </div>
  );
}
function CustomerView({ customer, neck, state }) {
  const t = customer.type;
  const inner = t === "owl" ? <Owl state={state} /> : t === "giraffe" ? <Giraffe neck={neck} state={state} /> : t === "cat" ? <Cat state={state} /> : <div className={"text-[80px] leading-none " + (state === "freeze" ? "shiver" : "bob")}>{CUSTOMER_INFO[t].emoji}</div>;
  return <div className="relative flex flex-col items-center">{customer.golden && <div className="absolute -inset-3 golden-glow" />}<div className="relative">{inner}</div></div>;
}
function Confetti({ show, big }) {
  if (!show) return null;
  const colors = ["#ff6b9d", "#7ed957", "#ffd93d", "#4dd0e1", "#b388ff", "#ff9f43"];
  return (<div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">{Array.from({ length: big ? 100 : 70 }).map((_, i) => { const left = Math.random() * 100, delay = Math.random() * 0.4, dur = 1.4 + Math.random() * 1.3, size = 8 + Math.random() * 9; return <div key={i} className="confetti-piece absolute" style={{ left: left + "%", top: "-20px", width: size, height: size * 0.6, background: colors[i % colors.length], animationDelay: delay + "s", animationDuration: dur + "s", borderRadius: 2 }} />; })}</div>);
}
function RarityBadge({ rarity }) { return <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full text-white" style={{ background: RARITY[rarity].color }}>{RARITY[rarity].name}</span>; }

/* ============================== THE SHOP SCENE =========================== */
/* Storefront that grows from a tiny cart into a grand parlour, fully driven by
 * the chosen slot upgrades (sign/roof/entrance/window/counter/floor/wall/
 * ceiling/machine/helper) plus the decorations the child places.            */
function ShopScene({ tierIdx, world, shop, placed, editable, height = 300, onItemDown, onMove, onUp, sceneRef, children }) {
  const I = INTERIORS[tierIdx];
  const S = (k) => (shop[k] ? ITEM[shop[k]] : null);
  const sign = S("sign"), roof = S("roof"), ent = S("entrance"), win = S("window"), counter = S("counter"), floor = S("floor"), wall = S("wall"), ceil = S("ceiling"), mac = S("machine"), helper = S("helper");
  const tubs = ["#ff6b9d", "#7ed957", "#ffd93d", "#4dd0e1"];
  const roofBg = roof ? (roof.rainbow ? "linear-gradient(90deg,#ff6b9d,#ffd93d,#7ed957,#4dd0e1,#a06bff)" : "repeating-linear-gradient(90deg," + roof.c1 + " 0 18px," + roof.c2 + " 18px 36px)") : null;
  return (
    <div ref={sceneRef} onPointerMove={editable ? onMove : undefined} onPointerUp={editable ? onUp : undefined} onPointerLeave={editable ? onUp : undefined}
      className="relative rounded-[1.6rem] overflow-hidden shadow-2xl select-none" style={{ height, border: "4px solid #ffd1e3", touchAction: editable ? "none" : "auto" }}>
      {/* wall */}
      <div className="absolute inset-0" style={{ background: wall ? wall.bg : I.wall }} />
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: (wall && wall.dark) ? "radial-gradient(#ffffff66 1px,transparent 1px)" : "radial-gradient(#ffffff 2px, transparent 2px)", backgroundSize: "22px 22px" }} />

      {/* roof / awning (or a starter umbrella for the tiny cart) */}
      {roof ? (
        <div className="absolute top-0 left-0 right-0" style={{ height: 18, background: roofBg, zIndex: 4 }}>
          {roof.castle && <div className="flex justify-around">{Array.from({ length: 9 }).map((_, i) => <div key={i} style={{ width: 8, height: 7, marginTop: -6, background: roof.c1 }} />)}</div>}
        </div>
      ) : (<div className="absolute left-1/2 -translate-x-1/2 text-3xl" style={{ top: 0, zIndex: 4 }}>⛱️</div>)}

      {/* ceiling decorations */}
      {ceil && <div className="absolute left-0 right-0 text-center text-base tracking-[0.5em]" style={{ top: 18, zIndex: 4 }}>{ceil.emoji}{ceil.emoji}{ceil.emoji}{ceil.emoji}</div>}

      {/* sign */}
      <div className="absolute left-1/2 -translate-x-1/2 px-3 py-1 rounded-xl text-[11px] font-black text-white shadow text-center" style={{ top: "10%", whiteSpace: "nowrap", zIndex: 4, background: sign ? sign.bg : "#ff7eb3", boxShadow: sign && sign.glow ? "0 0 14px 3px " + sign.glow : undefined }}>{sign && sign.tag ? sign.tag + " " : "🍦 "}Ishana's Ice Cream</div>

      {/* window */}
      <div className="absolute" style={{ left: "8%", top: "22%", width: "30%", height: "30%", borderRadius: 12, background: "linear-gradient(" + world.sky[0] + "," + world.sky[1] + ")", border: "5px solid #fff", overflow: "hidden", zIndex: 2 }}>
        <div className="absolute" style={{ top: 4, right: 6, fontSize: 18 }}>{world.sun}</div>
        <div className="absolute" style={{ bottom: 2, left: 6, fontSize: 20 }}>{world.out}</div>
        {win && win.icon && <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">{win.icon}</div>}
        <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2" style={{ width: 3, background: "#fff" }} />
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2" style={{ height: 3, background: "#fff" }} />
      </div>

      {/* entrance arch on the right wall */}
      {ent && <div className="absolute leading-none text-center" style={{ right: "4%", top: "20%", fontSize: 22, zIndex: 2 }}>{ent.emoji}<br />{ent.emoji}<br />{ent.emoji}</div>}

      {/* ice-cream shelf */}
      <div className="absolute" style={{ right: "8%", top: "16%", width: "30%", zIndex: 2 }}>
        <div className="flex gap-1.5 justify-center">{tubs.map((c, i) => <div key={i} className="rounded-md" style={{ width: 15, height: 19, background: c, boxShadow: "inset 0 -4px 4px rgba(0,0,0,.12)" }}><div className="rounded-t-md" style={{ height: 6, background: "rgba(255,255,255,.6)" }} /></div>)}</div>
        <div className="mt-1 rounded" style={{ height: 5, background: "#c98f5a" }} />
      </div>

      {/* floor */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: "30%", background: floor ? floor.bg : "linear-gradient(" + I.floor + "," + I.floor + "dd)", borderTop: "3px solid rgba(0,0,0,0.1)" }} />

      {/* placed decorations */}
      {placed.map((p) => ITEM[p.id] && (
        <div key={p.id} onPointerDown={editable ? (e) => onItemDown(e, p.id) : undefined} onDoubleClick={editable ? () => onUp(p.id, true) : undefined}
          className={"absolute leading-none " + (editable ? "cursor-grab active:cursor-grabbing" : "")} style={{ left: p.x + "%", top: p.y + "%", transform: "translate(-50%,-50%)", fontSize: 36, zIndex: 3, touchAction: "none" }} title={editable ? "Drag · double-tap to put away" : undefined}>{ITEM[p.id].emoji}</div>
      ))}

      {/* helper standing in the shop */}
      {helper && <div className="absolute bob" style={{ left: "4%", bottom: "26%", fontSize: 34, zIndex: 5 }}>{helper.emoji}</div>}

      {/* foreground: Ishana / customer / effects */}
      {children}

      {/* counter with glass case + machine */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: "22%", zIndex: 7 }}>
        <div className="absolute left-0 right-0 bottom-0" style={{ height: "100%", background: "linear-gradient(" + (counter ? counter.color : I.counter) + "," + (counter ? counter.color : I.counter) + "cc)", borderTop: "5px solid #fff" }} />
        <div className="absolute left-3 right-3" style={{ bottom: "60%", height: 22, borderRadius: 8, background: "rgba(255,255,255,0.35)", border: "2px solid rgba(255,255,255,0.7)" }}>
          <div className="flex gap-2 items-center h-full px-2">{["strawberry", "melon", "banana", "bubblegum"].map((f) => <Scoop key={f} flavorKey={f} size={14} />)}</div>
        </div>
        <div className="absolute" style={{ right: 10, bottom: 4, fontSize: 26 }}>{mac ? mac.emoji : "🍦"}</div>
        <div className="absolute left-1/2 -translate-x-1/2 rounded-full bg-white/85 flex items-center justify-center" style={{ bottom: 4, width: 28, height: 28, border: "2px solid #fff" }}>🍦</div>
      </div>
    </div>
  );
}

/* The STOREFRONT — the shop seen from the street. Ishana serves from the
 * window inside; the customer waits OUTSIDE on the sidewalk in front.        */
function StorefrontScene({ tierIdx, world, shop, placed, equipped, pet, ishanaMood, customer, neck, freeze, children }) {
  const I = INTERIORS[tierIdx];
  const S = (k) => (shop[k] ? ITEM[shop[k]] : null);
  const sign = S("sign"), roof = S("roof"), ent = S("entrance"), win = S("window"), counter = S("counter"), wall = S("wall"), mac = S("machine"), helper = S("helper");
  const roofBg = roof ? (roof.rainbow ? "linear-gradient(90deg,#ff6b9d,#ffd93d,#7ed957,#4dd0e1,#a06bff)" : "repeating-linear-gradient(90deg," + roof.c1 + " 0 16px," + roof.c2 + " 16px 32px)") : null;
  const interiorBg = wall ? wall.bg : I.wall;
  const counterColor = counter ? counter.color : I.counter;
  const decoEmojis = placed.map((p) => ITEM[p.id] && ITEM[p.id].emoji).filter(Boolean).slice(0, 8);
  return (
    <div className="relative rounded-[1.6rem] overflow-hidden shadow-2xl" style={{ height: 300, border: "4px solid #ffd1e3" }}>
      {/* sky + far scenery */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(" + world.sky[0] + "," + world.sky[1] + ")" }} />
      <div className="absolute" style={{ top: 8, left: 10, fontSize: 22, opacity: 0.85 }}>{world.sun}</div>
      <div className="absolute float-slow" style={{ top: 14, right: 14, fontSize: 24, opacity: 0.85 }}>{world.out}</div>
      {/* sidewalk (outside ground) */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: "24%", background: "linear-gradient(#ece3d6,#d8ccba)", borderTop: "3px solid rgba(0,0,0,0.08)", backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0 1px, transparent 1px 46px)" }} />

      {/* SHOP BUILDING */}
      <div className="absolute" style={{ left: "5%", right: "5%", top: "7%", height: "66%" }}>
        {roof ? (
          <div className="absolute left-[-2%] right-[-2%]" style={{ top: -10, height: 16, background: roofBg, borderRadius: "8px 8px 0 0", zIndex: 3 }}>
            {roof.castle && <div className="flex justify-around">{Array.from({ length: 11 }).map((_, i) => <div key={i} style={{ width: 7, height: 6, marginTop: -6, background: roof.c1 }} />)}</div>}
          </div>
        ) : (<div className="absolute left-1/2 -translate-x-1/2 text-3xl" style={{ top: -24, zIndex: 3 }}>⛱️</div>)}
        {/* building body */}
        <div className="absolute inset-0" style={{ background: "#fff7f0", borderRadius: "14px 14px 10px 10px", border: "3px solid #ffe0ec", boxShadow: "0 6px 14px rgba(0,0,0,0.12)" }} />
        {/* sign */}
        <div className="absolute left-1/2 -translate-x-1/2 px-3 py-1 rounded-xl text-[11px] font-black text-white shadow text-center" style={{ top: 5, whiteSpace: "nowrap", zIndex: 4, background: sign ? sign.bg : "#ff7eb3", boxShadow: sign && sign.glow ? "0 0 14px 3px " + sign.glow : undefined }}>{sign && sign.tag ? sign.tag + " " : "🍦 "}Ishana's Ice Cream</div>
        {/* decorative side window */}
        <div className="absolute" style={{ left: "6%", top: "36%", width: "18%", height: "26%", borderRadius: 8, background: "linear-gradient(" + world.sky[0] + "," + world.sky[1] + ")", border: "3px solid #fff" }}>{win && win.icon && <div className="w-full h-full flex items-center justify-center text-base">{win.icon}</div>}</div>
        {/* door / entrance */}
        {ent && <div className="absolute text-2xl leading-none" style={{ left: "7%", bottom: "1%" }}>{ent.emoji}</div>}

        {/* SERVING WINDOW (interior visible through it) */}
        <div className="absolute overflow-hidden" style={{ left: "32%", right: "7%", top: "28%", bottom: "8%", borderRadius: 10, background: interiorBg, border: "3px solid #fff", zIndex: 1 }}>
          <div className="absolute left-1 right-1 flex gap-1 justify-center" style={{ top: 3 }}>{["#ff6b9d", "#7ed957", "#ffd93d", "#4dd0e1"].map((c, i) => <div key={i} style={{ width: 10, height: 13, background: c, borderRadius: 3 }} />)}</div>
          <div className="absolute left-1 right-1 flex flex-wrap gap-0.5 justify-center" style={{ top: 19, fontSize: 12 }}>{decoEmojis.map((e, i) => <span key={i}>{e}</span>)}</div>
          <div className="absolute" style={{ right: 3, bottom: 2, fontSize: 17 }}>{mac ? mac.emoji : "🍦"}</div>
          {helper && <div className="absolute bob" style={{ left: 2, bottom: 2, fontSize: 17 }}>{helper.emoji}</div>}
          <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: -8, zIndex: 2 }}><FullIshana equipped={equipped} pet={pet} size={62} mood={ishanaMood} /></div>
        </div>
        {/* serving counter ledge in front of the window */}
        <div className="absolute" style={{ left: "30%", right: "5%", bottom: "-2%", height: "15%", background: "linear-gradient(" + counterColor + "," + counterColor + "cc)", borderRadius: 8, border: "2px solid #fff", zIndex: 5 }}>
          <div className="absolute left-1 right-1 top-1 rounded" style={{ height: 7, background: "rgba(255,255,255,0.4)" }} />
        </div>
      </div>

      {/* CUSTOMER — OUTSIDE on the sidewalk, in front of the serving counter */}
      <div className="absolute" style={{ left: "44%", bottom: "2%", zIndex: 6, transform: "scale(0.82)", transformOrigin: "bottom center" }}>
        <CustomerView customer={customer} neck={neck} state={freeze ? "freeze" : "wait"} />
      </div>

      {children}
    </div>
  );
}

/* ============================== MODES ==================================== */
function FlavorButtons({ onPick, disabled }) {
  return (<div className="grid grid-cols-4 gap-2">{FLAVOR_LIST.map((f) => <button key={f.key} onClick={() => onPick(f.key)} disabled={disabled} aria-label={f.name} className="rounded-2xl p-2 bg-white shadow-md active:scale-90 transition flex items-center justify-center" style={{ border: "3px solid #f0f0f0" }}><Scoop flavorKey={f.key} size={46} /></button>)}</div>);
}
function Bubble({ children }) { return <div className="rounded-2xl px-4 py-3 mb-2 shadow-lg text-center bg-white" style={{ border: "3px solid #b3e5ff" }}>{children}</div>; }
function PatternMode({ onSolve, onMiss, locked }) {
  const p = useMemo(() => { const a = rand(FLAVOR_KEYS); let b = rand(FLAVOR_KEYS); while (b === a) b = rand(FLAVOR_KEYS); const seq = rand([[a, b, a, b], [a, a, b, a], [a, b, b, a]]); return { seq, answer: seq[seq.length - 1], shown: seq.slice(0, -1) }; }, []);
  return (<><Bubble><p className="text-base font-bold mb-2" style={{ color: "#6b4bff" }}>What comes next? 🤔</p><div className="flex items-center justify-center gap-2 flex-wrap">{p.shown.map((s, i) => <Scoop key={i} flavorKey={s} size={42} />)}<div className="rounded-full flex items-center justify-center text-2xl font-black" style={{ width: 42, height: 42, border: "3px dashed #b0b0b0", color: "#b0b0b0" }}>?</div></div></Bubble><FlavorButtons disabled={locked} onPick={(k) => (k === p.answer ? onSolve() : onMiss())} /></>);
}
function CountingMode({ level, onSolve, onMiss, locked }) {
  const p = useMemo(() => ({ flavor: rand(FLAVOR_KEYS), target: randInt(2, clamp(3 + Math.floor(level / 8), 3, 6)) }), [level]);
  const [stack, setStack] = useState([]); const f = FLAVORS[p.flavor];
  const tap = (k) => { if (locked) return; if (k !== p.flavor) { onMiss(); return; } const n = [...stack, k]; setStack(n); if (n.length >= p.target) onSolve(); };
  return (<><Bubble><p className="text-base font-bold mb-1" style={{ color: "#6b4bff" }}>I want <span style={{ color: f.color }}>{p.target} {f.name}</span> scoops!</p><div className="flex items-center justify-center gap-3"><Cone scoops={stack} size={30} /><div key={stack.length} className="counter-pop text-5xl font-black" style={{ color: f.color }}>{stack.length}<span className="text-2xl text-gray-400"> / {p.target}</span></div></div></Bubble><FlavorButtons disabled={locked} onPick={tap} /></>);
}
function AdditionMode({ level, onSolve, onMiss, locked }) {
  const p = useMemo(() => { const a = randInt(1, 3), b = randInt(1, 3), sum = a + b; const o = new Set([sum]); while (o.size < 3) o.add(clamp(sum + randInt(-2, 2), 1, 9)); return { a, b, sum, options: [...o].sort(() => Math.random() - 0.5) }; }, [level]);
  const Dots = ({ n, c }) => <span className="inline-flex gap-1 align-middle">{Array.from({ length: n }).map((_, i) => <span key={i} className="inline-block rounded-full" style={{ width: 15, height: 15, background: c }} />)}</span>;
  return (<><Bubble><p className="text-base font-bold mb-2" style={{ color: "#6b4bff" }}>How many scoops? 🍨</p><div className="flex items-center justify-center gap-2 text-3xl font-black" style={{ color: "#3aa0ff" }}><Dots n={p.a} c="#ff5c93" /> <span>+</span> <Dots n={p.b} c="#4dd0e1" /> <span>=</span> <span className="text-gray-400">?</span></div></Bubble><div className="grid grid-cols-3 gap-3">{p.options.map((n) => <button key={n} disabled={locked} onClick={() => (n === p.sum ? onSolve() : onMiss())} className="rounded-2xl py-6 shadow-md active:scale-90 transition text-4xl font-black text-white" style={{ background: "linear-gradient(#7ed9ff,#3aa0ff)" }}>{n}</button>)}</div></>);
}
function MemoryMode({ level, onSolve, onMiss, locked }) {
  const order = useMemo(() => Array.from({ length: clamp(2 + Math.floor(level / 6), 2, 5) }, () => rand(FLAVOR_KEYS)), [level]);
  const [phase, setPhase] = useState("show"); const [count, setCount] = useState(3); const [input, setInput] = useState([]);
  useEffect(() => { if (phase !== "show") return; if (count <= 0) { setPhase("input"); return; } const id = setTimeout(() => setCount((c) => c - 1), 1000); return () => clearTimeout(id); }, [phase, count]);
  const tap = (k) => { if (locked || phase !== "input") return; if (k !== order[input.length]) { setInput([]); onMiss(); return; } const n = [...input, k]; setInput(n); if (n.length === order.length) onSolve(); };
  return (<><Bubble>{phase === "show" ? (<><p className="text-base font-bold mb-2" style={{ color: "#6b4bff" }}>Remember the order! 🧠 <span className="text-red-500">{count}</span></p><div className="flex items-center justify-center gap-2">{order.map((s, i) => <Scoop key={i} flavorKey={s} size={40} />)}</div></>) : (<><p className="text-base font-bold mb-2" style={{ color: "#6b4bff" }}>Make the same order! ✨</p><div className="flex items-center justify-center gap-2">{order.map((_, i) => <div key={i} className="rounded-full flex items-center justify-center" style={{ width: 40, height: 40, border: "3px dashed #ccc" }}>{input[i] && <Scoop flavorKey={input[i]} size={36} />}</div>)}</div></>)}</Bubble><FlavorButtons disabled={locked || phase === "show"} onPick={tap} /></>);
}
function SortingMode({ level, onSolve, onMiss, locked }) {
  const target = useMemo(() => rand(FLAVOR_KEYS), [level]); const need = 4;
  const [items, setItems] = useState([]); const [got, setGot] = useState(0); const idRef = useRef(0); const done = useRef(false);
  useEffect(() => { if (locked) return; const sp = setInterval(() => { const color = Math.random() < 0.55 ? target : rand(FLAVOR_KEYS); const id = ++idRef.current; setItems((a) => [...a, { id, color, left: 8 + Math.random() * 78, dur: 2.6 + Math.random() * 1.4 }]); setTimeout(() => setItems((a) => a.filter((x) => x.id !== id)), 4200); }, 650); return () => clearInterval(sp); }, [locked, target]);
  const grab = (x) => { if (locked || done.current) return; setItems((a) => a.filter((y) => y.id !== x.id)); if (x.color === target) { const g = got + 1; setGot(g); if (g >= need) { done.current = true; onSolve(); } } else onMiss(); };
  const f = FLAVORS[target];
  return (<><Bubble><p className="text-base font-bold" style={{ color: "#6b4bff" }}>Catch <span style={{ color: f.color }}>{need} {f.name}</span> scoops! 🌧️</p><p className="text-sm text-gray-500">Tap only the right colour — {got}/{need}</p></Bubble><div className="relative rounded-2xl overflow-hidden mb-1" style={{ height: 200, background: "linear-gradient(#eef9ff,#dff1ff)", border: "3px solid #b3e5ff" }}>{items.map((x) => <button key={x.id} onClick={() => grab(x)} className="absolute falling active:scale-90" style={{ left: x.left + "%", top: -50, animationDuration: x.dur + "s" }}><Scoop flavorKey={x.color} size={46} /></button>)}</div></>);
}
function SpeedMode({ onSolve, onMiss, locked, sounds }) {
  const DUR = 18; const [t, setT] = useState(DUR); const [order, setOrder] = useState(() => rand(FLAVOR_KEYS)); const [served, setServed] = useState(0); const done = useRef(false);
  useEffect(() => { if (locked) return; const id = setInterval(() => { setT((x) => { if (x <= 1) { clearInterval(id); if (!done.current) { done.current = true; onSolve({ bonusCoins: served * 3 }); } return 0; } if (x <= 5) sounds.tick(); return x - 1; }); }, 1000); return () => clearInterval(id); }, [locked]); // eslint-disable-line
  const f = FLAVORS[order];
  const tap = (k) => { if (locked || done.current) return; if (k === order) { setServed((s) => s + 1); sounds.coin(); setOrder(rand(FLAVOR_KEYS)); } else onMiss(); };
  return (<><Bubble><p className="text-base font-bold" style={{ color: "#6b4bff" }}>⚡ SPEED ROUND! Tap <span style={{ color: f.color }}>{f.name}</span>!</p><div className="mt-2 h-3 rounded-full bg-gray-200 overflow-hidden"><div style={{ width: (t / DUR) * 100 + "%", height: "100%", background: t <= 5 ? "#ff5c5c" : "#7ed957", transition: "width 1s linear" }} /></div><p className="text-sm font-black mt-1" style={{ color: "#ff7e1d" }}>Served: {served} 🍦</p></Bubble><FlavorButtons disabled={locked} onPick={tap} /></>);
}
function MegaMode({ level, onSolve, locked }) {
  const target = useMemo(() => (level < 14 ? 10 : level < 26 ? 15 : 20), [level]); const [tower, setTower] = useState([]);
  const add = () => { if (locked) return; const n = [...tower, rand(FLAVOR_KEYS)]; setTower(n); if (n.length >= target) onSolve({ bonusCoins: target }); };
  return (<><Bubble><p className="text-base font-bold" style={{ color: "#6b4bff" }}>🗼 MEGA ORDER! Build a <span className="text-pink-500">{target}-scoop</span> tower!</p><p className="text-sm text-gray-500">{tower.length} / {target}</p></Bubble><div className="relative rounded-2xl overflow-y-auto mb-2 flex items-end justify-center" style={{ height: 170, background: "linear-gradient(#fff,#fff5fa)", border: "3px solid #ffd1e3" }}><div className="scale-90"><Cone scoops={tower} size={26} max={30} /></div></div><button onClick={add} disabled={locked} className="w-full rounded-2xl py-5 text-2xl font-black text-white shadow-md active:scale-95 transition" style={{ background: "linear-gradient(#ff9f43,#ff7e1d)" }}>+ Add Scoop 🍦</button></>);
}
const MODE_COMPONENTS = { pattern: PatternMode, counting: CountingMode, addition: AdditionMode, memory: MemoryMode, sorting: SortingMode, speed: SpeedMode, mega: MegaMode };

/* ============================== OVERLAYS ================================= */
function Overlay({ children }) { return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(40,20,60,0.45)" }}><div className="overlay-pop w-full max-w-sm text-center rounded-[2rem] p-6 shadow-2xl bg-white" style={{ border: "4px solid #ffd1e3" }}>{children}</div></div>); }
function MysteryBox({ reward, onContinue, sounds }) { const [o, setO] = useState(false); return (<Overlay><h2 className="text-3xl font-black mb-2" style={{ color: "#a06bff" }}>🎁 Mystery Box!</h2>{!o ? (<><button onClick={() => { setO(true); sounds.mystery(); }} className="text-[90px] leading-none my-3 wiggle active:scale-90">🎁</button><p className="text-lg font-bold text-gray-500 mb-3">Tap to open!</p></>) : (<><div className="text-[80px] leading-none my-2 reward-pop">{reward.emoji}</div><p className="text-xl font-black mb-1" style={{ color: "#ff5c93" }}>{reward.label}</p><Confetti show /><button onClick={onContinue} className="pulse-btn mt-3 text-white text-xl font-black px-8 py-3 rounded-full shadow-xl" style={{ background: "linear-gradient(#7ed957,#4caf2f)" }}>Yay! ✨</button></>)}</Overlay>); }
function Milestone({ kind, tierIdx, world, onContinue }) { return (<Overlay><Confetti show big />{kind === "world" ? (<><p className="text-lg font-bold" style={{ color: world.accent }}>NEW WORLD UNLOCKED!</p><div className="text-[80px] leading-none my-2 reward-pop">{world.out}</div><h2 className="text-3xl font-black mb-2" style={{ color: world.accent }}>{world.name}</h2></>) : (<><p className="text-lg font-bold" style={{ color: "#ff7e1d" }}>SHOP UPGRADE!</p><div className="text-[80px] leading-none my-2 reward-pop">{SHOP_TIERS[tierIdx].emoji}</div><h2 className="text-3xl font-black mb-2" style={{ color: "#ff5c93" }}>{SHOP_TIERS[tierIdx].name}</h2></>)}<div className="my-2 flex justify-center"><IshanaFace size={86} mood="dance" /></div><button onClick={onContinue} className="pulse-btn mt-2 text-white text-xl font-black px-8 py-3 rounded-full shadow-xl" style={{ background: "linear-gradient(#ff7eb3,#ff5c93)" }}>Hooray! 🎉</button></Overlay>); }
function RareArrival({ customer, onContinue }) { return (<Overlay><Confetti show /><p className="text-lg font-bold" style={{ color: "#a06bff" }}>✨ RARE VISITOR! ✨</p><div className="text-[90px] leading-none my-2 reward-pop">{CUSTOMER_INFO[customer].emoji}</div><h2 className="text-2xl font-black mb-1" style={{ color: "#ff5c93" }}>{CUSTOMER_INFO[customer].name}</h2><p className="text-sm text-gray-500 mb-3">New sticker for your album! 📖</p><button onClick={onContinue} className="pulse-btn text-white text-xl font-black px-8 py-3 rounded-full shadow-xl" style={{ background: "linear-gradient(#a06bff,#7b3ff2)" }}>Cool! 🌟</button></Overlay>); }
function DailyReward({ day, onClaim }) { return (<Overlay><h2 className="text-2xl font-black mb-1" style={{ color: "#ff7e1d" }}>🎁 Daily Reward!</h2><p className="text-sm font-bold text-gray-500 mb-3">Day {day + 1} — come back every day!</p><div className="grid grid-cols-4 gap-2 mb-4">{DAILY_REWARDS.map((r, i) => (<div key={i} className="rounded-2xl p-2 flex flex-col items-center justify-center" style={{ background: i < day ? "#e9ffe9" : i === day ? "#fff3d6" : "#f3f3f3", border: "3px solid " + (i === day ? "#ffb300" : i < day ? "#7ed957" : "#eee"), aspectRatio: "1" }}><div className="text-2xl">{i < day ? "✅" : r.emoji}</div><div className="text-[8px] font-bold mt-0.5 leading-tight">{r.label}</div></div>))}</div><button onClick={onClaim} className="pulse-btn text-white text-xl font-black px-8 py-3 rounded-full shadow-xl" style={{ background: "linear-gradient(#ff9f43,#ff7e1d)" }}>Claim {DAILY_REWARDS[day].emoji}</button></Overlay>); }

/* Visual preview for any catalog item — real swatches for slot upgrades so
 * signs/roofs/counters/floors/walls no longer show a placeholder icon. */
function ItemIcon({ item, size = 28 }) {
  const c = item.cat;
  if (c === "sign") return <div className="flex items-center justify-center text-white font-black" style={{ width: size * 1.5, height: size * 0.78, borderRadius: 6, background: item.bg, fontSize: size * 0.5, boxShadow: item.glow ? "0 0 8px " + item.glow : undefined }}>{item.tag || "🍦"}</div>;
  if (c === "roof") { const bg = item.rainbow ? "linear-gradient(90deg,#ff6b9d,#ffd93d,#7ed957,#4dd0e1,#a06bff)" : "repeating-linear-gradient(90deg," + item.c1 + " 0 6px," + item.c2 + " 6px 12px)"; return <div style={{ width: size * 1.5, height: size * 0.72, borderRadius: "8px 8px 3px 3px", background: bg, border: "1px solid #eee" }} />; }
  if (c === "counter") return <div style={{ width: size * 1.4, height: size * 0.7, borderRadius: 6, background: item.color, border: "2px solid #fff", boxShadow: "0 1px 3px rgba(0,0,0,.15)" }} />;
  if (c === "floor" || c === "wall") return <div style={{ width: size * 1.4, height: size * 0.9, borderRadius: 6, background: item.bg, border: "1px solid #ddd" }} />;
  if (c === "window") return <div className="flex items-center justify-center" style={{ width: size * 0.95, height: size * 0.95, borderRadius: 6, background: "linear-gradient(#bdecff,#eaf9ff)", border: "3px solid #fff", fontSize: size * 0.5 }}>{item.icon || "🪟"}</div>;
  return <span style={{ fontSize: size }}>{item.emoji || "🏪"}</span>;
}

/* ============================== ITEM GRID ================================ */
function ItemGrid({ items, save, onUse, isEquipped, labelFor }) {
  return (<div className="grid grid-cols-3 gap-2">{items.map((i) => {
    const owned = save.owned.includes(i.id), equipped = isEquipped ? isEquipped(i) : false, afford = save.coins >= i.cost;
    return (<button key={i.id} onClick={() => onUse(i)} disabled={!owned && !afford} className="relative rounded-2xl p-2 shadow-md transition active:scale-95 text-center flex flex-col items-center" style={{ background: equipped ? "#fff0d6" : owned ? "#f3fff3" : afford ? "#fff" : "#f3f3f3", border: "3px solid " + (equipped ? "#ffb300" : owned ? "#7ed957" : "#eee"), opacity: owned || afford ? 1 : 0.6 }}>
      <div className="absolute top-1 left-1"><RarityBadge rarity={i.rarity} /></div>
      <div className="mt-3 flex items-center justify-center" style={{ minHeight: 30 }}><ItemIcon item={i} size={26} /></div>
      <div className="text-[10px] font-bold mt-1 leading-tight">{i.name}</div>
      <div className="text-[10px] font-black mt-0.5" style={{ color: equipped ? "#ff7e1d" : owned ? "#4caf2f" : "#ff7e1d" }}>{labelFor ? labelFor(i, owned, equipped) : (equipped ? "Using ✓" : owned ? "Use it" : "🪙 " + i.cost)}</div>
    </button>);
  })}</div>);
}

/* ============================== PAGES ==================================== */
function DressUpPage({ save, onUse }) {
  const [cat, setCat] = useState("dress");
  const cats = [["dress", "👗"], ["shoes", "👟"], ["acc", "🎀"], ["hat", "👒"], ["pet", "🐾"]];
  const isEq = (i) => (i.cat === "pet" ? save.pet === i.id : save.equipped[i.cat] === i.id);
  return (<div>
    <div className="flex justify-center mb-2"><FullIshana equipped={save.equipped} pet={save.pet} size={138} mood="idle" /></div>
    <div className="flex justify-center gap-2 mb-2">{cats.map(([c, e]) => <button key={c} onClick={() => setCat(c)} className="w-11 h-11 rounded-2xl text-xl shadow active:scale-90" style={{ background: cat === c ? "#ff7eb3" : "#fff", border: "3px solid " + (cat === c ? "#ff5c93" : "#eee") }}>{e}</button>)}</div>
    <div className="rounded-2xl p-2 bg-white/70" style={{ border: "3px solid #ffd1e3" }}><div className="max-h-[34vh] overflow-y-auto pr-1"><ItemGrid items={byCat(cat)} save={save} onUse={onUse} isEquipped={isEq} labelFor={(i, o, e) => (e ? (cat === "pet" ? "Chosen ✓" : "Wearing ✓") : o ? (cat === "pet" ? "Pick pet" : "Tap to wear") : "🪙 " + i.cost)} /></div></div>
  </div>);
}

const SUBTABS = [
  { key: "outside", label: "Outside", emoji: "🏪", cats: ["sign", "roof", "entrance", "window"] },
  { key: "inside", label: "Inside", emoji: "🧱", cats: ["counter", "floor", "wall", "ceiling"] },
  { key: "machine", label: "Machines", emoji: "🍦", cats: ["machine"] },
  { key: "staff", label: "Staff", emoji: "🐰", cats: ["helper"] },
  { key: "decor", label: "Decor", emoji: "🎀", cats: ["decor"] },
  { key: "themes", label: "Themes", emoji: "🌈", cats: [] },
];
const CAT_LABEL = { sign: "Signboard", roof: "Roof / Awning", entrance: "Entrance", window: "Windows", counter: "Counter", floor: "Floor", wall: "Wallpaper", ceiling: "Ceiling", machine: "Ice Cream Machine", helper: "Staff Helper" };

function DecoratePage({ save, setSave, sounds, world, tierIdx }) {
  const [sub, setSub] = useState("outside");
  const sceneRef = useRef(null); const drag = useRef(null); const [boom, setBoom] = useState(false);
  const placedIds = save.placed.map((p) => p.id);

  const celebrate = (rarity) => { if (rarity === "epic" || rarity === "legendary") { sounds.rare(); setBoom(true); setTimeout(() => setBoom(false), 1400); } else sounds.upgrade(); };
  const place = (id) => { setSave((s) => (s.placed.find((p) => p.id === id) ? s : { ...s, placed: [...s.placed, { id, x: 30 + Math.random() * 40, y: 46 + Math.random() * 22 }] })); sounds.pop(); };
  const onItemDown = (e, id) => { const r = sceneRef.current.getBoundingClientRect(); drag.current = { id, r }; if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId); };
  const onMove = (e) => { if (!drag.current) return; const { id, r } = drag.current; const x = clamp(((e.clientX - r.left) / r.width) * 100, 4, 96), y = clamp(((e.clientY - r.top) / r.height) * 100, 8, 84); setSave((s) => ({ ...s, placed: s.placed.map((p) => (p.id === id ? { ...p, x, y } : p)) })); };
  const onUp = (maybeId, rm) => { if (rm && typeof maybeId === "string") setSave((s) => ({ ...s, placed: s.placed.filter((p) => p.id !== maybeId) })); drag.current = null; };

  const onUse = (i) => {
    const owned = save.owned.includes(i.id);
    if (isSlot(i.cat)) {
      if (!owned) { if (save.coins < i.cost) return; celebrate(i.rarity); setSave((s) => ({ ...s, coins: s.coins - i.cost, owned: [...s.owned, i.id], shop: { ...s.shop, [i.cat]: i.id } })); }
      else { sounds.pop(); setSave((s) => ({ ...s, shop: { ...s.shop, [i.cat]: s.shop[i.cat] === i.id ? null : i.id } })); }
      return;
    }
    // decor
    if (!owned) { if (save.coins < i.cost) return; celebrate(i.rarity); setSave((s) => ({ ...s, coins: s.coins - i.cost, owned: [...s.owned, i.id], placed: [...s.placed, { id: i.id, x: 30 + Math.random() * 40, y: 46 + Math.random() * 22 }] })); }
    else if (!placedIds.includes(i.id)) place(i.id);
  };

  const active = SUBTABS.find((s) => s.key === sub);
  return (<div>
    {boom && <Confetti show />}
    <div className="text-center mb-1 text-sm font-black" style={{ color: "#a06bff" }}>{SHOP_TIERS[tierIdx].emoji} {SHOP_TIERS[tierIdx].name} — make it the coolest shop!</div>
    <div className="mb-2"><ShopScene tierIdx={tierIdx} world={world} shop={save.shop} placed={save.placed} editable height={290} sceneRef={sceneRef} onItemDown={onItemDown} onMove={onMove} onUp={onUp}><div className="absolute" style={{ left: "28%", bottom: "16%", zIndex: 6 }}><FullIshana equipped={save.equipped} pet={save.pet} size={86} mood="idle" /></div></ShopScene></div>

    <div className="flex gap-1.5 overflow-x-auto pb-1 mb-2">{SUBTABS.map((s) => <button key={s.key} onClick={() => setSub(s.key)} className="flex-shrink-0 flex flex-col items-center rounded-2xl px-3 py-1 active:scale-90" style={{ background: sub === s.key ? "linear-gradient(#ff7eb3,#ff5c93)" : "#fff", border: "3px solid " + (sub === s.key ? "#ff5c93" : "#eee") }}><span className="text-lg">{s.emoji}</span><span className="text-[9px] font-black" style={{ color: sub === s.key ? "#fff" : "#b08" }}>{s.label}</span></button>)}</div>

    <div className="rounded-2xl p-2 bg-white/70" style={{ border: "3px solid #ffd1e3" }}>
      <div className="max-h-[34vh] overflow-y-auto pr-1">
        {sub === "themes" ? (
          <div className="space-y-2">{THEMES.map((t) => { const have = t.items.filter((id) => save.owned.includes(id)).length, done = have === t.items.length; return (
            <div key={t.name} className="rounded-2xl p-2" style={{ background: done ? "#fff7e6" : "#fafafa", border: "3px solid " + (done ? t.color : "#eee") }}>
              <div className="flex items-center justify-between"><span className="font-black text-sm" style={{ color: t.color }}>{t.emoji} {t.name} Theme</span><span className="text-xs font-bold text-gray-500">{have}/{t.items.length} {done ? "✓ +10% 🪙" : ""}</span></div>
              <div className="flex gap-1 mt-1 flex-wrap">{t.items.map((id) => <span key={id} className="text-lg" style={{ filter: save.owned.includes(id) ? "none" : "grayscale(1) opacity(.35)" }}>{ITEM[id] ? (ITEM[id].emoji || ITEM[id].tag || "🏪") : "❓"}</span>)}</div>
            </div>
          ); })}<p className="text-center text-[11px] text-gray-400 mt-1">Collect a whole theme for a permanent +10% coin bonus!</p></div>
        ) : (
          active.cats.map((c) => (
            <div key={c} className="mb-2">
              <div className="text-xs font-black mb-1 px-1" style={{ color: "#ff5c93" }}>{CAT_LABEL[c] || "Decorations"}</div>
              <ItemGrid items={byCat(c)} save={save} onUse={onUse} isEquipped={(i) => (isSlot(i.cat) ? save.shop[i.cat] === i.id : placedIds.includes(i.id))} labelFor={(i, o, e) => (isSlot(i.cat) ? (e ? "Using ✓" : o ? "Use it" : "🪙 " + i.cost) : (placedIds.includes(i.id) ? "In shop ✓" : o ? "Place it" : "🪙 " + i.cost))} />
            </div>
          ))
        )}
      </div>
    </div>
    <p className="text-center text-[11px] text-gray-400 mt-1">Tap to buy · upgrades restyle the shop · decor can be dragged · double-tap to put away</p>
  </div>);
}

function CollectionPage({ save }) {
  const groups = [
    { name: "Shop Upgrades", emoji: "🏪", items: CATALOG.filter((i) => isSlot(i.cat) && i.cat !== "helper") },
    { name: "Decorations", emoji: "🎀", items: byCat("decor") },
    { name: "Staff", emoji: "🐰", items: byCat("helper") },
    { name: "Clothes", emoji: "👗", items: CATALOG.filter((i) => ["dress", "shoes", "acc", "hat"].includes(i.cat)) },
    { name: "Pets", emoji: "🐾", items: byCat("pet") },
  ];
  const custList = [...REGULARS, ...RARE_KEYS]; const worldCount = tierIndexForLevel(save.level) + 1;
  const box = (got, color, content) => <div className="rounded-xl flex items-center justify-center text-lg" style={{ aspectRatio: "1", background: got ? "#fff7fb" : "#f1f1f1", border: "2px solid " + (got ? color : "#ddd"), filter: got ? "none" : "grayscale(1) opacity(.4)" }}>{content}</div>;
  return (<div className="max-h-[74vh] overflow-y-auto pr-1">
    <h2 className="text-center text-2xl font-black mb-3" style={{ color: "#a06bff" }}>⭐ My Collection</h2>
    {groups.map((g) => { const have = g.items.filter((i) => save.owned.includes(i.id)).length, total = g.items.length, pct = Math.round((have / total) * 100); return (
      <div key={g.name} className="mb-3 rounded-2xl p-3 bg-white shadow" style={{ border: "3px solid #ffe3ef" }}>
        <div className="flex items-center justify-between mb-1"><span className="font-black" style={{ color: "#ff5c93" }}>{g.emoji} {g.name}</span><span className="text-sm font-bold text-gray-500">{have} / {total}</span></div>
        <div className="h-2.5 rounded-full bg-gray-200 overflow-hidden mb-2"><div style={{ width: pct + "%", height: "100%", background: "linear-gradient(90deg,#ff9f43,#ff5c93)" }} /></div>
        <div className="grid grid-cols-6 gap-1.5">{g.items.map((i) => box(save.owned.includes(i.id), RARITY[i.rarity].color, save.owned.includes(i.id) ? <ItemIcon item={i} size={16} /> : "❓"))}</div>
      </div>
    ); })}
    <div className="mb-3 rounded-2xl p-3 bg-white shadow" style={{ border: "3px solid #ffe3ef" }}><div className="flex items-center justify-between mb-1"><span className="font-black" style={{ color: "#ff5c93" }}>🧁 Customers</span><span className="text-sm font-bold text-gray-500">{custList.filter((c) => save.met.includes(c)).length} / {custList.length}</span></div><div className="grid grid-cols-6 gap-1.5">{custList.map((c) => box(save.met.includes(c), "#ffb6d9", save.met.includes(c) ? CUSTOMER_INFO[c].emoji : "❓"))}</div></div>
    <div className="mb-2 rounded-2xl p-3 bg-white shadow" style={{ border: "3px solid #ffe3ef" }}><div className="flex items-center justify-between mb-1"><span className="font-black" style={{ color: "#ff5c93" }}>🌍 Worlds</span><span className="text-sm font-bold text-gray-500">{worldCount} / {WORLDS.length}</span></div><div className="grid grid-cols-5 gap-1.5">{WORLDS.map((w, i) => box(i < worldCount, "#a06bff", i < worldCount ? w.out : "🔒"))}</div></div>
  </div>);
}

/* ============================== MAIN ===================================== */
function IshanaShop() {
  const sounds = useSounds();
  const [save, setSave] = useState(loadSave);
  const [screen, setScreen] = useState("welcome");
  const [tab, setTab] = useState("shop");
  const [overlay, setOverlay] = useState(null);
  const ovRef = useRef({}); const [, force] = useState(0);
  const [customer, setCustomer] = useState({ type: "owl", isRare: false, golden: false });
  const [mode, setMode] = useState("pattern");
  const [roundKey, setRoundKey] = useState(1);
  const [event, setEvent] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showNyam, setShowNyam] = useState(false);
  const [brainFreeze, setBrainFreeze] = useState(false);
  const [shake, setShake] = useState(false);
  const [reward, setReward] = useState(null);
  const [neck, setNeck] = useState(0);
  const [streak, setStreak] = useState(0);
  const timers = useRef([]); const modeHistory = useRef([]);
  const after = (ms, fn) => { const id = setTimeout(fn, ms); timers.current.push(id); return id; };
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => () => clearTimers(), []);
  useEffect(() => { persist(save); }, [save]);

  const tierIdx = tierIndexForLevel(save.level);
  const world = WORLDS[tierIdx];

  useEffect(() => { if (screen === "play" && save.daily.last !== today() && !overlay) { ovRef.current = {}; setOverlay("daily"); } }, [screen]); // eslint-disable-line

  const pickMode = () => { let pool = MODES.filter((m) => { if ((m === "speed" || m === "mega") && save.level < 4) return false; if (m === "memory" && save.level < 3) return false; return true; }); const last = modeHistory.current[modeHistory.current.length - 1]; pool = pool.filter((m) => m !== last); const c = rand(pool); modeHistory.current = [...modeHistory.current, c].slice(-4); return c; };
  const newRound = useCallback(() => {
    clearTimers(); setFeedback(null); setShowConfetti(false); setShowNyam(false); setBrainFreeze(false); setReward(null); setNeck(0);
    let ev = null; const r = Math.random();
    if (r < 0.06) ev = { type: "golden", label: "✨ Golden Customer!", mult: 3 }; else if (r < 0.13) ev = { type: "double", label: "🪙 Double Coin Day!", mult: 2 }; else if (r < 0.18) ev = { type: "rainbow", label: "🌈 Rainbow Day!", mult: 1 };
    setEvent(ev);
    const ur = save.rares; let cust;
    if (ur.length && Math.random() < 0.22) cust = { type: rand(ur), isRare: true, golden: false }; else cust = { type: rand(REGULARS), isRare: false, golden: ev && ev.type === "golden" };
    if (ev && ev.type === "golden") cust.golden = true; setCustomer(cust);
    setSave((s) => (s.met.includes(cust.type) ? s : { ...s, met: [...s.met, cust.type] }));
    setMode(pickMode()); setRoundKey((k) => k + 1);
  }, [save.rares, save.level]);

  useEffect(() => { if (screen !== "play" || tab !== "shop" || customer.type !== "giraffe" || feedback || overlay) return; const id = setInterval(() => setNeck((n) => Math.min(100, n + 5)), 380); return () => clearInterval(id); }, [screen, tab, customer.type, feedback, overlay]);

  const onMiss = useCallback(() => { if (feedback) return; setFeedback("wrong"); sounds.wrong(); setShake(true); setStreak(0); after(120, () => setShake(false)); after(650, () => setFeedback(null)); }, [feedback, sounds]);

  const runQueue = (q) => { if (!q.length) { newRound(); return; } const item = q[0]; const cont = () => { setOverlay(null); runQueue(q.slice(1)); }; ovRef.current = { ...item, onContinue: cont }; setOverlay(item.kind); force((n) => n + 1); if (item.kind === "mystery") sounds.mystery(); if (item.kind === "milestone") item.world ? sounds.fanfare() : sounds.upgrade(); if (item.kind === "rare") sounds.rare(); };
  function rollMysteryReward(raresArr, metArr) { const locked = RARE_KEYS.filter((k) => !raresArr.includes(k)); const pick = rand(["coins", "stars", "golden", locked.length ? "rare" : "coins"]); if (pick === "coins") { const c = randInt(40, 120); applyDelta({ coins: c }); return { emoji: "🪙", label: "+" + c + " Coins!" }; } if (pick === "stars") { const s = randInt(3, 8); applyDelta({ stars: s }); return { emoji: "⭐", label: "+" + s + " Stars!" }; } if (pick === "golden") { const c = randInt(80, 160); applyDelta({ coins: c }); return { emoji: "🏆", label: "Golden Bonus! +" + c }; } const rk = rand(locked); raresArr.push(rk); if (!metArr.includes(rk)) metArr.push(rk); return { emoji: CUSTOMER_INFO[rk].emoji, label: "New Friend: " + CUSTOMER_INFO[rk].name + "!" }; }
  const applyDelta = (d) => setSave((s) => ({ ...s, coins: s.coins + (d.coins || 0), stars: s.stars + (d.stars || 0) }));

  const onSolve = useCallback((opts = {}) => {
    if (feedback) return; setFeedback("correct");
    const themeBonus = 1 + THEMES.filter((t) => themeDone(save.owned, t)).length * 0.1;
    const mult = (event ? event.mult : 1) * (customer.isRare ? 2 : 1), sb = streak >= 2 ? 1.5 : 1;
    const coinsGain = Math.round((6 + save.level + (opts.bonusCoins || 0)) * mult * sb * themeBonus);
    const starsGain = 1 + (streak > 0 && streak % 4 === 3 ? 1 : 0) + (customer.isRare ? 1 : 0);
    setReward({ coins: coinsGain, stars: starsGain }); setStreak((s) => s + 1);
    sounds.correct(); setShowConfetti(true); setShake(true);
    after(120, () => setShake(false)); after(420, () => { sounds.gulp(); setShowNyam(true); }); after(560, () => sounds.coin());
    after(1050, () => { setShowNyam(false); setBrainFreeze(true); }); after(2500, () => setBrainFreeze(false)); after(2700, () => setShowConfetti(false));
    after(2900, () => {
      const oldLevel = save.level, newLevel = oldLevel + 1, oldTier = tierIndexForLevel(oldLevel), newTier = tierIndexForLevel(newLevel);
      const newRares = [...save.rares], newMet = [...save.met], q = [];
      RARE_KEYS.forEach((rk) => { if (newLevel >= RARES[rk].unlockLevel && !newRares.includes(rk)) { newRares.push(rk); if (!newMet.includes(rk)) newMet.push(rk); q.push({ kind: "rare", customer: rk }); } });
      if (newTier > oldTier) q.push({ kind: "milestone", tierIdx: newTier, world: WORLDS[newTier] });
      if (newLevel % 5 === 0) q.push({ kind: "mystery", reward: rollMysteryReward(newRares, newMet) });
      setSave((s) => ({ ...s, level: newLevel, coins: s.coins + coinsGain, stars: s.stars + starsGain, xp: s.xp + 14, rares: newRares, met: newMet, best: Math.max(s.best, streak + 1) }));
      runQueue(q);
    });
  }, [feedback, event, customer, streak, save, sounds, newRound]);

  const useItem = (i) => {
    const owned = save.owned.includes(i.id);
    if (!owned) { if (save.coins < i.cost) return; sounds.upgrade(); if (i.rarity === "epic" || i.rarity === "legendary") { sounds.rare(); setShowConfetti(true); after(1400, () => setShowConfetti(false)); } setSave((s) => { const ns = { ...s, coins: s.coins - i.cost, owned: [...s.owned, i.id] }; if (i.cat === "pet") ns.pet = i.id; else if (["dress", "shoes", "acc", "hat"].includes(i.cat)) ns.equipped = { ...s.equipped, [i.cat]: i.id }; return ns; }); return; }
    sounds.pop(); if (i.cat === "pet") setSave((s) => ({ ...s, pet: s.pet === i.id ? null : i.id })); else if (["dress", "shoes", "acc", "hat"].includes(i.cat)) setSave((s) => ({ ...s, equipped: { ...s.equipped, [i.cat]: s.equipped[i.cat] === i.id ? null : i.id } }));
  };
  const claimDaily = () => { const d = save.daily.day % DAILY_REWARDS.length, r = DAILY_REWARDS[d]; sounds.coin(); setSave((s) => { const ns = { ...s, daily: { last: today(), day: s.daily.day + 1 } }; if (r.coins) ns.coins = s.coins + r.coins; if (r.grant && !s.owned.includes(r.grant)) ns.owned = [...s.owned, r.grant]; return ns; }); setOverlay(null); };
  const startGame = () => { sounds.getCtx(); setScreen("play"); setTab("shop"); newRound(); };
  const resetGame = () => { const f = defaultSave(); setSave(f); persist(f); modeHistory.current = []; setStreak(0); setScreen("welcome"); setOverlay(null); };

  const ModeComp = MODE_COMPONENTS[mode]; const locked = !!feedback || !!overlay;

  return (
    <div className={"min-h-screen w-full flex items-start sm:items-center justify-center p-3 " + (shake ? "screen-shake" : "")} style={{ background: "linear-gradient(160deg,#fff0f6,#e7f9ff 55%,#fff7e6)" }}>
      <StyleKeyframes />
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-0">{Array.from({ length: 14 }).map((_, i) => <div key={i} className="absolute float-slow" style={{ left: (i * 7.3 % 100) + "%", top: ((i * 13) % 100) + "%", animationDelay: (i % 5) * 0.6 + "s", opacity: 0.5 }}>{["⭐", "✨", "🍬", "🍦"][i % 4]}</div>)}</div>
      <Confetti show={showConfetti} />

      <div className="w-full max-w-md mx-auto relative z-10">
        {/* brain-freeze tint stays over the game column so it reads well on mobile */}
        {brainFreeze && (<div className="pointer-events-none absolute inset-0 z-30 rounded-[2rem] overflow-hidden" style={{ background: "rgba(80,170,255,0.22)" }}><div className="absolute left-1/2 -translate-x-1/2 text-2xl sm:text-3xl font-black text-sky-700 shiver text-center w-full px-2" style={{ top: "30%" }}>❄️ BRAIN FREEZE! ❄️</div></div>)}
        {screen === "welcome" && (
          <div className="text-center rounded-[2rem] p-6 shadow-2xl" style={{ background: "rgba(255,255,255,0.72)", border: "4px solid #ffd1e3" }}>
            <h1 className="text-4xl font-black mb-1" style={{ color: "#ff5c93" }}>Ishana's Shop</h1>
            <p className="text-base mb-4" style={{ color: "#8a5cff" }}>🍦 Build the coolest ice cream shop! 🍦</p>
            <div className="flex justify-center mb-5"><FullIshana equipped={save.equipped} pet={save.pet} size={150} mood="idle" /></div>
            <button onClick={startGame} className="pulse-btn inline-flex items-center gap-2 text-white text-3xl font-black px-10 py-5 rounded-full shadow-xl active:scale-95 transition" style={{ background: "linear-gradient(#ff7eb3,#ff5c93)" }}>▶ PLAY</button>
            {save.level > 1 && (<div className="mt-4 text-sm font-bold text-gray-500">Shop level {save.level} · 🪙 {save.coins} · ⭐ {save.stars}<div><button onClick={resetGame} className="mt-2 text-xs underline text-gray-400">Start a new shop</button></div></div>)}
          </div>
        )}

        {screen === "play" && (
          <div className="relative pb-24">
            <div className="flex items-center justify-between gap-1 mb-2 text-xs sm:text-sm">
              <div className="px-3 py-1 rounded-full font-black text-white shadow" style={{ background: "#8a5cff" }}>Lv {save.level}</div>
              <div className="px-3 py-1 rounded-full font-black bg-white shadow" style={{ color: "#f5a300" }}>⭐ {save.stars}</div>
              <div className="px-3 py-1 rounded-full font-black bg-white shadow" style={{ color: "#ff9f1d" }}><span key={save.coins} className="inline-block coin-pop">🪙 {save.coins}</span></div>
              <button onClick={() => { ovRef.current = {}; setOverlay("daily"); }} className="px-3 py-1 rounded-full font-black text-white shadow active:scale-95" style={{ background: "#ff7e1d" }}>🎁</button>
            </div>

            {tab === "shop" && (<>
              {event && <div className="mb-2 text-center text-sm font-black py-1 rounded-full text-white banner-pop" style={{ background: event.type === "rainbow" ? "linear-gradient(90deg,#ff5c93,#ffd93d,#7ed957,#4dd0e1,#a06bff)" : "#ff5c93" }}>{event.label}</div>}
              {streak >= 2 && !feedback && <div className="mb-2 text-center text-sm font-black" style={{ color: "#ff7e1d" }}>🔥 Streak x{streak}!</div>}
              <StorefrontScene tierIdx={tierIdx} world={world} shop={save.shop} placed={save.placed} equipped={save.equipped} pet={save.pet} ishanaMood={feedback === "correct" ? "cheer" : brainFreeze ? "freeze" : "idle"} customer={customer} neck={neck} freeze={brainFreeze}>
                {showNyam && <div className="absolute left-1/2 -translate-x-1/2 text-5xl font-black nyam" style={{ top: "44%", zIndex: 9, color: "#ff3d77" }}>NYAM!</div>}
                {reward && <div className="absolute top-2 right-2 text-right reward-float" style={{ zIndex: 9 }}><div className="text-lg font-black" style={{ color: "#ff9f1d" }}>+{reward.coins} 🪙</div><div className="text-md font-black" style={{ color: "#f5a300" }}>+{reward.stars} ⭐</div></div>}
              </StorefrontScene>
              <div className="flex items-center justify-between my-2 px-1"><span className="text-sm font-bold text-gray-500">{customer.isRare ? "✨ " : ""}{CUSTOMER_INFO[customer.type].name}</span><span className="text-xs font-black px-2 py-0.5 rounded-full text-white" style={{ background: "#4dd0e1" }}>{MODE_LABELS[mode]}</span></div>
              <div className={shake && feedback === "wrong" ? "shake" : ""}><ModeComp key={roundKey} level={save.level} locked={locked} sounds={sounds} onSolve={onSolve} onMiss={onMiss} /></div>
              {feedback === "wrong" && <p className="text-center mt-2 text-lg font-black" style={{ color: "#ff7e1d" }}>😆 Oops! Try again!</p>}
            </>)}

            {tab === "decorate" && <DecoratePage save={save} setSave={setSave} sounds={sounds} world={world} tierIdx={tierIdx} />}
            {tab === "dressup" && <DressUpPage save={save} onUse={useItem} />}
            {tab === "collection" && <CollectionPage save={save} />}

            <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
              <div className="pointer-events-auto mb-2 flex gap-1.5 px-2 py-2 rounded-[2rem] shadow-2xl bg-white/90 backdrop-blur" style={{ border: "3px solid #ffd1e3" }}>
                {[["shop", "🍦", "Serve"], ["decorate", "🏪", "Upgrade"], ["dressup", "👗", "Dress Up"], ["collection", "⭐", "Album"]].map(([id, e, label]) => { const act = tab === id; return (<button key={id} onClick={() => setTab(id)} className="flex flex-col items-center justify-center rounded-2xl px-3 py-1.5 active:scale-90 transition" style={{ background: act ? "linear-gradient(#ff7eb3,#ff5c93)" : "transparent", minWidth: 64 }}><span className="text-2xl">{e}</span><span className="text-[10px] font-black" style={{ color: act ? "#fff" : "#b08" }}>{label}</span></button>); })}
              </div>
            </div>
          </div>
        )}

        {overlay === "mystery" && <MysteryBox reward={ovRef.current.reward} sounds={sounds} onContinue={ovRef.current.onContinue} />}
        {overlay === "milestone" && <Milestone kind={ovRef.current.world ? "world" : "shop"} tierIdx={ovRef.current.tierIdx} world={ovRef.current.world} onContinue={ovRef.current.onContinue} />}
        {overlay === "rare" && <RareArrival customer={ovRef.current.customer} onContinue={ovRef.current.onContinue} />}
        {overlay === "daily" && <DailyReward day={save.daily.day % DAILY_REWARDS.length} onClaim={claimDaily} />}
      </div>
    </div>
  );
}

/* ============================== STYLES =================================== */
function StyleKeyframes() {
  return (
    <style>{`
      @keyframes bobAnim {0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
      .bob{animation:bobAnim 2s ease-in-out infinite}
      @keyframes floatSlow {0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
      .float-slow{animation:floatSlow 5s ease-in-out infinite}
      @keyframes pulseBtn {0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
      .pulse-btn{animation:pulseBtn 1.1s ease-in-out infinite}
      @keyframes blink {0%,42%,48%,100%{transform:scaleY(1)}45%{transform:scaleY(.1)}}
      .owl-blink{animation:blink 1.4s infinite}
      @keyframes yawn {0%,70%,100%{transform:scaleY(.4) scaleX(.8)}85%{transform:scaleY(1.2) scaleX(1.1)}}
      .cat-yawn{animation:yawn 3.5s ease-in-out infinite;transform-origin:center}
      @keyframes shiverAnim {0%,100%{transform:translate(0,0) rotate(0)}25%{transform:translate(-2px,1px) rotate(-3deg)}75%{transform:translate(2px,-1px) rotate(3deg)}}
      .shiver{animation:shiverAnim .18s linear infinite}
      @keyframes googlyAnim {0%{transform:translate(2px,0)}25%{transform:translate(0,2px)}50%{transform:translate(-2px,0)}75%{transform:translate(0,-2px)}100%{transform:translate(2px,0)}}
      .googly{animation:googlyAnim .25s linear infinite}
      @keyframes cheerAnim {0%,100%{transform:translateY(0) rotate(0)}30%{transform:translateY(-12px) rotate(-6deg)}60%{transform:translateY(-6px) rotate(6deg)}}
      .ishana-cheer{animation:cheerAnim .6s ease-in-out infinite}
      @keyframes danceAnim {0%,100%{transform:rotate(-6deg) translateY(0)}50%{transform:rotate(6deg) translateY(-8px)}}
      .ishana-dance{animation:danceAnim .5s ease-in-out infinite}
      @keyframes scoopPop {0%{transform:scale(0) translateY(-20px)}70%{transform:scale(1.15)}100%{transform:scale(1)}}
      .scoop-pop{animation:scoopPop .35s cubic-bezier(.34,1.56,.64,1)}
      @keyframes counterPop {0%{transform:scale(.4);opacity:0}60%{transform:scale(1.3)}100%{transform:scale(1);opacity:1}}
      .counter-pop{animation:counterPop .35s cubic-bezier(.34,1.56,.64,1);display:inline-block}
      @keyframes nyamAnim {0%{transform:scale(0) rotate(-12deg);opacity:0}50%{transform:scale(1.3) rotate(6deg);opacity:1}100%{transform:scale(1) rotate(-4deg);opacity:1}}
      .nyam{animation:nyamAnim .5s cubic-bezier(.34,1.56,.64,1);text-shadow:3px 3px 0 #fff,-2px -2px 0 #fff}
      @keyframes shakeAnim {0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}
      .shake{animation:shakeAnim .45s ease-in-out}
      @keyframes screenShake {0%,100%{transform:translate(0,0)}25%{transform:translate(-3px,2px)}75%{transform:translate(3px,-2px)}}
      .screen-shake{animation:screenShake .25s ease-in-out 2}
      @keyframes confettiFall {0%{transform:translateY(-20px) rotate(0);opacity:1}100%{transform:translateY(105vh) rotate(720deg);opacity:.9}}
      .confetti-piece{animation-name:confettiFall;animation-timing-function:linear;animation-iteration-count:1}
      @keyframes fallAnim {0%{transform:translateY(0)}100%{transform:translateY(240px)}}
      .falling{animation-name:fallAnim;animation-timing-function:linear;animation-iteration-count:1}
      @keyframes coinPop {0%{transform:scale(1)}40%{transform:scale(1.4)}100%{transform:scale(1)}}
      .coin-pop{animation:coinPop .4s ease-out}
      @keyframes rewardFloat {0%{transform:translateY(0);opacity:0}20%{opacity:1}100%{transform:translateY(-30px);opacity:0}}
      .reward-float{animation:rewardFloat 2.4s ease-out forwards}
      @keyframes overlayPop {0%{transform:scale(.7);opacity:0}70%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
      .overlay-pop{animation:overlayPop .4s cubic-bezier(.34,1.56,.64,1)}
      @keyframes rewardPop {0%{transform:scale(0) rotate(-20deg)}60%{transform:scale(1.3) rotate(8deg)}100%{transform:scale(1) rotate(0)}}
      .reward-pop{animation:rewardPop .6s cubic-bezier(.34,1.56,.64,1)}
      @keyframes wiggleAnim {0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}
      .wiggle{animation:wiggleAnim .4s ease-in-out infinite}
      @keyframes bannerPop {0%{transform:scale(.6);opacity:0}100%{transform:scale(1);opacity:1}}
      .banner-pop{animation:bannerPop .4s cubic-bezier(.34,1.56,.64,1)}
      @keyframes glowAnim {0%,100%{box-shadow:0 0 18px 6px rgba(255,210,60,.7)}50%{box-shadow:0 0 30px 12px rgba(255,210,60,.95)}}
      .golden-glow{animation:glowAnim 1s ease-in-out infinite;border-radius:9999px}
    `}</style>
  );
}

if (typeof ReactDOM !== "undefined" && document.getElementById("root")) {
  ReactDOM.createRoot(document.getElementById("root")).render(<IshanaShop />);
}
