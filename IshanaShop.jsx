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
// Painted art assets (AI-generated). If a file is missing, code-drawn art is used.
const ASSET = { hero: "assets/ishana-hero.png", exterior: "assets/shop-exterior.png", logo: "assets/logo.png", counter: "assets/counter.png", menu: "assets/menu-bg.png", window: "assets/window.png", shelf: "assets/shelf.png", machine: { basic: "assets/machine-basic.png", rainbow: "assets/machine-rainbow.png", magic: "assets/machine-magic.png", gold: "assets/machine-gold.png" } };
// Painted full-look outfit variants (a dress id -> painted Ishana image).
const OUTFITS = { dress_pinkprincess: "assets/outfit-princess.png", dress_chef: "assets/outfit-chef.png", dress_doctor: "assets/outfit-doctor.png", dress_fairy: "assets/outfit-fairy.png", dress_unicorn: "assets/outfit-unicorn.png", dress_rainbow: "assets/outfit-rainbow.png" };
const ishanaImg = (eq) => (eq && eq.dress && OUTFITS[eq.dress]) || ASSET.hero;
// Painted decor art (id → png); items not listed fall back to their emoji.
const DECOR_ART = { decor_plantsmall: "assets/decor-plant.png", decor_flowerpot: "assets/decor-plant.png", decor_lamp: "assets/decor-lamp.png", decor_frame: "assets/decor-frame.png", decor_table: "assets/decor-table.png" };
// Painted staff characters (helper id → png); others fall back to emoji.
const STAFF_ART = { helper_bunny: "assets/staff-bunny.png", helper_kitty: "assets/staff-cat.png" };
// Painted pet companions (pet id → png); others fall back to emoji.
const PET_ART = { pet_bunny: "assets/pet-bunny.png", pet_kitty: "assets/pet-kitty.png", pet_penguin: "assets/pet-penguin.png", pet_fox: "assets/pet-fox.png", pet_panda: "assets/pet-panda.png", pet_unicorn: "assets/pet-unicorn.png", pet_dragon: "assets/pet-dragon.png" };
const SAVE_KEY = "ishana_shop_save_v5";

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

const REGULARS = ["bear", "penguin", "cat", "frog"];
const RARES = {
  rabbit: { emoji: "🐰", name: "Bunny", unlockLevel: 4 }, elephant: { emoji: "🐘", name: "Ellie", unlockLevel: 8 },
  panda: { emoji: "🐼", name: "Panda", unlockLevel: 12 }, fox: { emoji: "🦊", name: "Foxy", unlockLevel: 16 },
  owl: { emoji: "🦉", name: "Professor Owl", unlockLevel: 22 }, bird: { emoji: "🐦", name: "Birdie", unlockLevel: 28 },
};
const RARE_KEYS = Object.keys(RARES);
const CUSTOMER_INFO = {
  bear: { emoji: "🐻", name: "Bobo Bear" }, penguin: { emoji: "🐧", name: "Pip Penguin" }, cat: { emoji: "🐱", name: "Kiki Cat" }, frog: { emoji: "🐸", name: "Freddy Frog" },
  ...Object.fromEntries(RARE_KEYS.map((k) => [k, { emoji: RARES[k].emoji, name: RARES[k].name }])),
};
// Customer sprites: regulars (bear/penguin/cat/frog) are painted 3/4 facing LEFT
// toward Ishana (no mirror needed); rares still use front-view art until their
// 3/4 sprites are background-removed (raws generated, pending credits).
// Per-animal width factor so wide sprites (fox tail, panda, elephant) never
// out-size Ishana. Applied to the base customer width in the scene.
const CUSTOMER_SCALE = { bear: 0.78, penguin: 0.86, cat: 0.82, frog: 0.8, rabbit: 0.82, elephant: 0.72, panda: 0.76, fox: 0.72, owl: 0.78, bird: 0.86 };

const RARITY = {
  common:    { name: "Common",    color: "#9aa3ad", cost: 120 },
  rare:      { name: "Rare",      color: "#3aa0ff", cost: 900 },
  epic:      { name: "Epic",      color: "#a06bff", cost: 5000 },
  legendary: { name: "Legendary", color: "#ffb300", cost: 30000 },
  dream:     { name: "Dream",     color: "#ff3fa0", cost: 100000 },
};
// Pretty price: 100000 -> "100K", 1000000 -> "1M"
function money(n) { return n >= 1000000 ? (n / 1000000) + "M" : n >= 1000 ? Math.round(n / 100) / 10 + "K" : ("" + n); }

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
  it("wood", "counter", "Wooden Counter", "common", { color: "#b5824a", filter: "sepia(.6) saturate(1.5) hue-rotate(-18deg) brightness(.92)" }),
  it("pink", "counter", "Pink Counter", "common", { color: "#ff9ec4", filter: "none" }),
  it("candy", "counter", "Candy Counter", "rare", { color: "#ff6fae", filter: "saturate(1.35) hue-rotate(-8deg)" }),
  it("crystal", "counter", "Crystal Counter", "epic", { color: "#a8eef5", filter: "hue-rotate(150deg) saturate(1.1) brightness(1.06)" }),
  it("gold", "counter", "Golden Counter", "legendary", { color: "#ffd24d", filter: "sepia(.85) saturate(2.4) hue-rotate(-12deg) brightness(1.06)" }),

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
  /* curated, on-theme set — every item supports the cute ice-cream-shop fantasy */
  it("plantsmall", "decor", "Small Plant", "common", { emoji: "🌱", zone: "floor" }),
  it("flowerpot", "decor", "Flower Pot", "common", { emoji: "🪴", zone: "floor" }),
  it("lamp", "decor", "Cozy Lamp", "common", { emoji: "💡", zone: "floor" }),
  it("table", "decor", "Café Table", "common", { emoji: "🪑", zone: "floor" }),
  it("sakura", "decor", "Sakura Tree", "rare", { emoji: "🌸", zone: "floor" }),
  it("statueice", "decor", "Ice Cream Statue", "rare", { emoji: "🍦", zone: "floor" }),
  it("teddy", "decor", "Teddy Bear", "common", { emoji: "🧸", zone: "shelf" }),
  it("bunnydoll", "decor", "Bunny Doll", "rare", { emoji: "🐰", zone: "shelf" }),
  it("unicorndoll", "decor", "Unicorn Doll", "epic", { emoji: "🦄", zone: "shelf" }),
  it("sprinkle", "decor", "Sprinkle Station", "rare", { emoji: "🧁", zone: "counter" }),
  it("topping", "decor", "Topping Display", "rare", { emoji: "🍫", zone: "counter" }),
  it("vase", "decor", "Flower Vase", "common", { emoji: "🌷", zone: "counter" }),
  it("frame", "decor", "Wall Frame", "common", { emoji: "🖼️", zone: "wall" }),
  it("clock", "decor", "Wall Clock", "common", { emoji: "🕐", zone: "wall" }),
  it("balloons", "decor", "Balloon Corner", "common", { emoji: "🎈", zone: "wall" }),

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

  /* ---- DREAM ITEMS (aspirational, super expensive) ---- */
  it("giantunicorn", "decor", "Giant Unicorn Statue", "dream", { emoji: "🦄", cost: 100000, zone: "floor" }),
  it("rainbowcastle", "decor", "Rainbow Castle Shop", "dream", { emoji: "🏰", cost: 250000, zone: "floor" }),
  it("palace", "decor", "Ice Cream Palace", "dream", { emoji: "🍨", cost: 500000, zone: "floor" }),
  it("goldqueen", "dress", "Golden Queen Outfit", "dream", { color: "linear-gradient(135deg,#fff0a8,#ffd24d,#ffb300)", emoji: "👑", cost: 1000000 }),
];
const ITEM = Object.fromEntries(CATALOG.map((i) => [i.id, i]));
const byCat = (cat) => CATALOG.filter((i) => i.cat === cat);
// Default placement (% of scene) for a decor item, by its logical zone, so
// nothing floats in the middle: wall=up high, shelf=top-right, counter=on the
// counter top, floor=on the floor to the side (clear of Ishana & the customer).
function zonePos(zone) {
  if (zone === "wall") return { x: 38 + Math.random() * 20, y: 30 }; // mid wall, clear of window & shelf
  if (zone === "shelf") return { x: 68 + Math.random() * 16, y: 16 };
  if (zone === "counter") return { x: Math.random() < 0.5 ? 18 + Math.random() * 20 : 54 + Math.random() * 12, y: 71 };
  return { x: 8 + Math.random() * 18, y: 62 }; // floor (left side)
}
const MAX_PLACED = 8; // keep the shop tidy — "less but better"

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
// Short spoken cue per mode so pre-readers know the task without reading.
const MODE_NARRATION = { pattern: "What comes next?", counting: "Give the right scoops!", addition: "How many scoops in total?", memory: "Remember the order!", sorting: "Catch the right colour!", speed: "Quick! Tap the right flavour!", mega: "Build a big tower!" };
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
function defaultSave() { return { level: 1, coins: 80, stars: 0, xp: 0, best: 0, met: [], rares: [], owned: [], equipped: { dress: null, shoes: null, acc: null, hat: null }, shop: {}, pet: null, placed: [], daily: { last: null, day: 0 }, mission: { date: null, served: 0, rewarded: false }, seenIntro: false }; }
const MISSION_TARGET = 5, MISSION_BONUS = 120;
function loadSave() { try { const r = localStorage.getItem(SAVE_KEY); if (r) return { ...defaultSave(), ...JSON.parse(r) }; } catch (e) {} return defaultSave(); }
const persist = (s) => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch (e) {} };

/* ============================== AUDIO ==================================== */
function useSounds() {
  const ctxRef = useRef(null);
  const mutedRef = useRef(false);
  const musicRef = useRef(null);
  const getCtx = () => { if (mutedRef.current) return null; if (!ctxRef.current) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) ctxRef.current = new AC(); } if (ctxRef.current && ctxRef.current.state === "suspended") ctxRef.current.resume(); return ctxRef.current; };
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
    plop: () => slide(520, 300, 0.1, "sine", 0.16),                                  // scoop dropped
    ding: () => { tone(1318, 0, 0.16, "sine", 0.18); tone(1760, 0.08, 0.22, "sine", 0.16); }, // order done
    yay: () => [784, 988, 1318].forEach((f, i) => tone(f, i * 0.07, 0.18, "triangle", 0.16)),  // customer happy
    sparkle: () => [1568, 2093, 2637].forEach((f, i) => tone(f, i * 0.05, 0.14, "sine", 0.1)), // topping/magic
    setMuted: (m) => { mutedRef.current = m; if (m) { if (musicRef.current) { clearInterval(musicRef.current); musicRef.current = null; } if (window.speechSynthesis) try { window.speechSynthesis.cancel(); } catch (e) {} } },
    isMuted: () => mutedRef.current,
    // Gentle ambient pad loop (very low volume), synthesised — no audio files.
    startMusic: () => { if (mutedRef.current || musicRef.current) return; const c = getCtx(); if (!c) return; const seq = [[392, 0], [523, 1.4], [440, 2.8], [587, 4.2]]; const loop = () => { if (mutedRef.current) return; const t0 = c.currentTime; seq.forEach(([f, t]) => { const o = c.createOscillator(), g = c.createGain(); o.type = "sine"; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t0 + t); g.gain.exponentialRampToValueAtTime(0.03, t0 + t + 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t0 + t + 1.3); o.connect(g).connect(c.destination); o.start(t0 + t); o.stop(t0 + t + 1.4); }); }; loop(); musicRef.current = setInterval(loop, 5600); },
    stopMusic: () => { if (musicRef.current) { clearInterval(musicRef.current); musicRef.current = null; } },
    // Voice narration so PRE-READERS (age 4–6) can play without reading.
    speak: (text) => { if (mutedRef.current || !window.speechSynthesis) return; try { window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 0.92; u.pitch = 1.25; u.volume = 0.95; window.speechSynthesis.speak(u); } catch (e) {} },
  }), []);
}

/* ============================== ISHANA ART =============================== */
function IshanaPortrait({ size = 110, mood = "idle", cap = true }) {
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
      {cap && (<g>
        <g clipPath="url(#capDome)">{Array.from({ length: 10 }).map((_, i) => <rect key={i} x={22 + i * 7.6} y="14" width="7.6" height="48" fill={i % 2 ? "#ffffff" : "#ff9ec4"} />)}</g>
        <path d="M22,58 Q22,20 60,18 Q98,20 98,58 Z" fill="none" stroke="#ff7eb3" strokeWidth="2" />
        <rect x="20" y="56" width="80" height="11" rx="5" fill="#fff" stroke="#ffb6d9" strokeWidth="2" />
        <path d="M55,16 L65,16 L60,30 Z" fill="#f0c27a" /><circle cx="60" cy="11" r="7" fill="#ff9ec4" /><circle cx="57" cy="9" r="2" fill="#fff" opacity="0.7" />
      </g>)}
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
function IshanaFace({ size = 110, mood = "happy", cap = true }) {
  const [ok, setOk] = useState(true);
  const cls = mood === "cheer" ? "ishana-cheer" : mood === "dance" ? "ishana-dance" : mood === "freeze" ? "shiver" : "bob";
  return (
    <div className={"relative " + cls} style={{ width: size, height: size }} aria-label="Ishana">
      <img src={ISHANA_FACE_SRC} alt="" draggable={false} onLoad={() => setOk(true)} onError={() => setOk(false)} className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg" style={{ display: ok ? "block" : "none" }} />
      {!ok && <div className="w-full h-full flex items-center justify-center"><IshanaPortrait size={size} mood={mood} cap={cap} /></div>}
    </div>
  );
}
/* <img> that falls back to drawn art if the file is missing. */
function ImgOr({ src, className = "", style = {}, fallback = null }) {
  const [ok, setOk] = useState(true);
  if (!ok) return fallback;
  return <img src={src} alt="" draggable={false} onError={() => setOk(false)} className={className} style={style} />;
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
      {/* head — built-in cap hidden when a hat is worn (no more double-cap) */}
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 0, zIndex: 3 }}><IshanaFace size={head} mood={mood} cap={!hat} /></div>
      {/* hat sits ON TOP of the head (not over the face); glasses over the eyes */}
      {hat && <div className="absolute left-1/2 -translate-x-1/2 leading-none text-center" style={{ top: -size * 0.16, zIndex: 6, fontSize: size * 0.32 }}>{hat.emoji}</div>}
      {acc && acc.place === "head" && <div className="absolute left-1/2 -translate-x-1/2 leading-none text-center" style={{ top: -size * 0.13, zIndex: 6, fontSize: size * 0.28 }}>{acc.emoji}</div>}
      {acc && acc.place === "face" && <div className="absolute left-1/2 -translate-x-1/2 leading-none text-center" style={{ top: size * 0.17, zIndex: 6, fontSize: size * 0.22 }}>{acc.emoji}</div>}
      {acc && acc.place === "hand" && <div className="absolute" style={{ top: H * 0.5, right: W * 0.06, zIndex: 5, fontSize: size * 0.3 }}>{acc.emoji}</div>}
      {acc && acc.place === "side" && <div className="absolute" style={{ top: H * 0.46, left: W * 0.03, zIndex: 0, fontSize: size * 0.3 }}>{acc.emoji}</div>}
      {acc && acc.place === "neck" && <div className="absolute left-1/2 -translate-x-1/2" style={{ top: H * 0.36, zIndex: 5, fontSize: size * 0.24 }}>{acc.emoji}</div>}
      {pet && <div className="absolute bob" style={{ bottom: 0, right: -W * 0.12, fontSize: size * 0.4, zIndex: 5 }}>{ITEM[pet].emoji}</div>}
    </div>
  );
}

/* Painted Ishana that swaps her whole look per equipped outfit; falls back to
 * the code-drawn FullIshana for dresses without a painted variant. */
function IshanaAvatar({ equipped, pet, size = 130, mood = "idle" }) {
  const painted = (equipped.dress && OUTFITS[equipped.dress]) || (!equipped.dress ? ASSET.hero : null);
  if (!painted) return <FullIshana equipped={equipped} pet={pet} size={size} mood={mood} />;
  const H = size * 1.55;
  return (
    <div className="relative inline-block" style={{ height: H }}>
      <ImgOr src={painted} className={"object-contain h-full " + (mood === "cheer" ? "ishana-cheer" : "bob")} style={{ filter: "drop-shadow(0 5px 8px rgba(0,0,0,0.15))" }} fallback={<FullIshana equipped={equipped} pet={null} size={size} mood={mood} />} />
      {pet && <div className="absolute bob" style={{ right: -size * 0.05, bottom: 0, fontSize: size * 0.4 }}>{ITEM[pet].emoji}</div>}
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
/* Cute chibi animal customers — big head, big sparkly eyes, rosy cheeks, soft
 * pastel colours. One component draws every species (collectible feel). */
const ANIMAL_STYLE = {
  bear:    { body: "#caa06f", belly: "#ecd6b0", dark: "#a87c4f", nose: "#5a3a22" },
  penguin: { body: "#4a72a8", belly: "#ffffff", dark: "#ffb938", nose: "#ffb938" },
  cat:     { body: "#ffc23d", belly: "#fff0c2", dark: "#eaa92a", nose: "#ff7a9c" },
  frog:    { body: "#86d65a", belly: "#cdf5b3", dark: "#5fb53e", nose: "#3f8f2a" },
  rabbit:  { body: "#ff9ec4", belly: "#ffe1ee", dark: "#ef84ad", nose: "#ff5c8a" },
  elephant:{ body: "#94b6e4", belly: "#bcd5f2", dark: "#7a9bd0", nose: "#7a9bd0" },
  panda:   { body: "#fbfbfb", belly: "#fbfbfb", dark: "#2a2a2a", nose: "#2a2a2a" },
  fox:     { body: "#ff8b45", belly: "#fff1e3", dark: "#e5712f", nose: "#5a3a22" },
  owl:     { body: "#8ec449", belly: "#e7f3c8", dark: "#6fa233", nose: "#ffb938" },
  bird:    { body: "#b388ff", belly: "#e7dbff", dark: "#9a6bf0", nose: "#ffb938" },
};
function ChibiAnimal({ type, state, size = 120 }) {
  const s = ANIMAL_STYLE[type] || ANIMAL_STYLE.bear;
  const blink = state === "freeze" ? "googly" : "owl-blink";
  const scale = size / 120;
  const Eye = ({ x, w = 26, h = 30 }) => (
    <div className="absolute rounded-full bg-white flex items-center justify-center" style={{ top: 42, left: x, width: w, height: h, zIndex: 4 }}>
      <div className={blink} style={{ position: "relative", width: w * 0.66, height: h * 0.7, borderRadius: 99, background: "#2b2320" }}>
        <div style={{ position: "absolute", top: 3, left: 3, width: 6, height: 6, borderRadius: 99, background: "#fff" }} />
      </div>
    </div>
  );
  const triEar = (left, color, inner) => (
    <div className="absolute" style={{ top: -4, [left ? "left" : "right"]: 14, width: 0, height: 0, borderLeft: "16px solid transparent", borderRight: "16px solid transparent", borderBottom: "26px solid " + color, zIndex: 1 }}>
      {inner && <div style={{ position: "absolute", top: 11, left: -7, width: 0, height: 0, borderLeft: "7px solid transparent", borderRight: "7px solid transparent", borderBottom: "13px solid " + inner }} />}
    </div>
  );
  return (
    <div style={{ width: 120 * scale, height: 134 * scale }}>
      <div className={"relative " + (state === "freeze" ? "shiver" : "bob")} style={{ width: 120, height: 134, transform: scale !== 1 ? "scale(" + scale + ")" : undefined, transformOrigin: "bottom center" }}>
        {/* body */}
        <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: 0, width: 74, height: 56, background: s.body, borderRadius: "46% 46% 44% 44%" }} />
        <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: 2, width: 44, height: 34, background: s.belly, borderRadius: "50%" }} />
        <div className="absolute rounded-full" style={{ bottom: -3, left: 40, width: 15, height: 10, background: s.dark }} />
        <div className="absolute rounded-full" style={{ bottom: -3, right: 40, width: 15, height: 10, background: s.dark }} />

        {(type === "bear" || type === "panda") && (<>
          <div className="absolute rounded-full" style={{ top: -2, left: 16, width: 30, height: 30, background: type === "panda" ? s.dark : s.body }} />
          <div className="absolute rounded-full" style={{ top: -2, right: 16, width: 30, height: 30, background: type === "panda" ? s.dark : s.body }} />
        </>)}
        {type === "elephant" && (<>
          <div className="absolute rounded-full" style={{ top: 28, left: -6, width: 40, height: 44, background: s.body }} />
          <div className="absolute rounded-full" style={{ top: 28, right: -6, width: 40, height: 44, background: s.body }} />
        </>)}
        {type === "rabbit" && (<>
          <div className="absolute" style={{ top: -34, left: 32, width: 18, height: 46, background: s.body, borderRadius: 20 }}><div className="absolute" style={{ top: 6, left: 5, width: 8, height: 30, background: "#ffd0e6", borderRadius: 12 }} /></div>
          <div className="absolute" style={{ top: -34, right: 32, width: 18, height: 46, background: s.body, borderRadius: 20 }}><div className="absolute" style={{ top: 6, left: 5, width: 8, height: 30, background: "#ffd0e6", borderRadius: 12 }} /></div>
        </>)}
        {type === "owl" && (<>
          <div className="absolute" style={{ top: -2, left: 26, width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderBottom: "20px solid " + s.dark }} />
          <div className="absolute" style={{ top: -2, right: 26, width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderBottom: "20px solid " + s.dark }} />
        </>)}
        {type === "bird" && <div className="absolute left-1/2 -translate-x-1/2" style={{ top: -8, width: 8, height: 16, background: s.dark, borderRadius: 6, transform: "rotate(-12deg)" }} />}

        {/* head */}
        <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 2, width: 100, height: 92, background: s.body, borderRadius: "48% 48% 46% 46%", zIndex: 2 }} />

        {type === "penguin" && <div className="absolute left-1/2 -translate-x-1/2 rounded-[50%]" style={{ top: 16, width: 74, height: 70, background: "#ffffff", zIndex: 3 }} />}
        {type === "fox" && <div className="absolute left-1/2 -translate-x-1/2 rounded-[50%]" style={{ top: 52, width: 56, height: 40, background: s.belly, zIndex: 3 }} />}
        {type === "panda" && (<>
          <div className="absolute rounded-[50%]" style={{ top: 40, left: 24, width: 24, height: 28, background: s.dark, transform: "rotate(-12deg)", zIndex: 3 }} />
          <div className="absolute rounded-[50%]" style={{ top: 40, right: 24, width: 24, height: 28, background: s.dark, transform: "rotate(12deg)", zIndex: 3 }} />
        </>)}

        {type === "cat" && (<>{triEar(true, s.body, "#ff9ec4")}{triEar(false, s.body, "#ff9ec4")}</>)}
        {type === "fox" && (<>{triEar(true, s.body, "#fff")}{triEar(false, s.body, "#fff")}</>)}

        {type === "frog" ? (<>
          <div className="absolute rounded-full bg-white flex items-center justify-center" style={{ top: -6, left: 22, width: 34, height: 34, border: "3px solid " + s.body, zIndex: 4 }}><div className={blink} style={{ width: 16, height: 18, borderRadius: 99, background: "#2b2320" }} /></div>
          <div className="absolute rounded-full bg-white flex items-center justify-center" style={{ top: -6, right: 22, width: 34, height: 34, border: "3px solid " + s.body, zIndex: 4 }}><div className={blink} style={{ width: 16, height: 18, borderRadius: 99, background: "#2b2320" }} /></div>
        </>) : type === "owl" ? (
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center" style={{ top: 40, zIndex: 4 }}>
            <div className="rounded-full bg-white flex items-center justify-center" style={{ width: 32, height: 32, border: "3px solid #6b4bab" }}><div className={blink} style={{ width: 16, height: 16, borderRadius: 99, background: "#2b2320" }} /></div>
            <div style={{ width: 5, height: 3, background: "#6b4bab" }} />
            <div className="rounded-full bg-white flex items-center justify-center" style={{ width: 32, height: 32, border: "3px solid #6b4bab" }}><div className={blink} style={{ width: 16, height: 16, borderRadius: 99, background: "#2b2320" }} /></div>
          </div>
        ) : (<><Eye x={28} /><Eye x={66} /></>)}

        <div className="absolute rounded-full" style={{ top: 66, left: 20, width: 16, height: 10, background: "#ff7eb3", opacity: 0.55, zIndex: 4 }} />
        <div className="absolute rounded-full" style={{ top: 66, right: 20, width: 16, height: 10, background: "#ff7eb3", opacity: 0.55, zIndex: 4 }} />

        {(type === "penguin" || type === "bird" || type === "owl") ? (
          <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 64, width: 0, height: 0, borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderTop: "12px solid " + s.nose, zIndex: 5 }} />
        ) : type === "elephant" ? (
          <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 60, width: 18, height: 40, background: s.body, borderRadius: 10, zIndex: 5 }}><div className="absolute bottom-0 left-0 right-0" style={{ height: 8, background: s.dark, borderRadius: 6 }} /></div>
        ) : type === "frog" ? (
          <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 62, width: 40, height: 8, borderBottom: "3px solid #3f8f2a", borderRadius: "0 0 40px 40px", zIndex: 5 }} />
        ) : (<>
          <div className="absolute left-1/2 -translate-x-1/2 rounded-full" style={{ top: 62, width: 9, height: 6, background: s.nose, zIndex: 5 }} />
          <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 68, width: 16, height: 8, borderBottom: "2.5px solid " + s.nose, borderRadius: "0 0 12px 12px", zIndex: 5 }} />
        </>)}
      </div>
    </div>
  );
}
function CustomerView({ customer, state, size }) {
  const happy = state === "happy", freeze = state === "freeze";
  const anim = freeze ? "shiver" : happy ? "cust-happy" : "bob";
  // size given → fixed px; otherwise fill the parent's WIDTH (the scene is tall
  // and narrow, so width is the limiting dimension for these square sprites)
  const imgStyle = size ? { width: size, height: size } : { width: "100%", height: "auto" };
  return (
    <div className="relative w-full flex items-end justify-center">
      {customer.golden && <div className="absolute -inset-3 golden-glow" />}
      {/* heart burst when the order is served */}
      {happy && <div className="pointer-events-none absolute left-1/2 -translate-x-1/2" style={{ top: "2%", zIndex: 8 }}>{[-18, 0, 18].map((dx, i) => <span key={i} className="heart-float absolute" style={{ left: dx, fontSize: 20, animationDelay: i * 0.16 + "s" }}>❤️</span>)}</div>}
      {/* order speech bubble — tail points LEFT toward Ishana, so it reads as "ordering" */}
      {!happy && !freeze && (
        <div className="order-bob absolute" style={{ top: "0%", left: "-4%", zIndex: 8 }}>
          <div className="relative bg-white rounded-2xl px-2 py-1 shadow" style={{ border: "2px solid #ffd1e3", fontSize: 17, lineHeight: 1 }}>🍦
            <div className="absolute" style={{ left: 7, bottom: -7, width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "8px solid #fff" }} />
          </div>
        </div>
      )}
      {/* art is drawn in 3/4 view already facing LEFT toward Ishana — just a tiny lean */}
      <div style={{ transform: "rotate(-3deg)", transformOrigin: "bottom center", width: "100%" }}>
        <ImgOr src={"assets/animal-" + customer.type + ".png"} className={anim + " object-contain"} style={{ ...imgStyle, filter: "drop-shadow(0 6px 5px rgba(0,0,0,0.22))" }} fallback={<div className={anim}><ChibiAnimal type={customer.type} state={freeze ? "freeze" : "wait"} size={size || 150} /></div>} />
      </div>
      {/* ground shadow so the customer feels planted, not floating */}
      <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: 2, width: "58%", height: 10, background: "rgba(0,0,0,0.14)", borderRadius: "50%", zIndex: -1 }} />
    </div>
  );
}

function Confetti({ show, big }) {
  if (!show) return null;
  const colors = ["#ff6b9d", "#7ed957", "#ffd93d", "#4dd0e1", "#b388ff", "#ff9f43"];
  return (<div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">{Array.from({ length: big ? 100 : 70 }).map((_, i) => { const left = Math.random() * 100, delay = Math.random() * 0.4, dur = 1.4 + Math.random() * 1.3, size = 8 + Math.random() * 9; return <div key={i} className="confetti-piece absolute" style={{ left: left + "%", top: "-20px", width: size, height: size * 0.6, background: colors[i % colors.length], animationDelay: delay + "s", animationDuration: dur + "s", borderRadius: 2 }} />; })}</div>);
}
function RarityBadge({ rarity }) { return <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full text-white" style={{ background: RARITY[rarity].color }}>{RARITY[rarity].name}</span>; }

/* ============================== THE SHOP SCENE =========================== */
/* ONE shop, shared by the Serve tab (mode="serve" — a customer waits at the
 * counter) and the Upgrade tab (mode="edit" — decor is draggable and the
 * focused catalog item is previewed live). Every slot upgrade — sign, roof,
 * window, counter, wall, machine, helper, ceiling — paints a REAL layer here,
 * so buying something visibly transforms the very shop you serve in.
 * Layers are sized against Ishana (~62% of the scene = the size reference).  */
function ShopScene({ tierIdx, world, shop, placed, equipped, pet, ishanaMood = "idle", customer, customerHappy, custKey, freeze, mode = "serve", preview, editable, height = 300, onItemDown, onMove, onUp, sceneRef, children }) {
  const I = INTERIORS[tierIdx];
  // effective slot item: a live-preview item temporarily overrides its slot
  const S = (k) => (preview && preview.cat === k ? preview : (shop[k] ? ITEM[shop[k]] : null));
  const sign = S("sign"), roof = S("roof"), ent = S("entrance"), win = S("window"), counter = S("counter"), floor = S("floor"), wall = S("wall"), ceil = S("ceiling"), mac = S("machine"), helper = S("helper");
  const tubs = ["#ff6b9d", "#7ed957", "#ffd93d", "#4dd0e1"];
  const roofBg = roof ? (roof.rainbow ? "linear-gradient(90deg,#ff6b9d,#ffd93d,#7ed957,#4dd0e1,#a06bff)" : "repeating-linear-gradient(90deg," + roof.c1 + " 0 16px," + roof.c2 + " 16px 32px)") : null;
  const wallBg = wall ? wall.bg : I.wall;
  const fancy = (r) => r === "epic" || r === "legendary" || r === "dream";
  const pulse = (cat) => (preview && preview.cat === cat ? "preview-pulse " : "");
  const ghostDecor = preview && preview.cat === "decor" ? preview : null;

  return (
    <div ref={sceneRef} onPointerMove={editable ? onMove : undefined} onPointerUp={editable ? onUp : undefined} onPointerLeave={editable ? onUp : undefined}
      className="relative rounded-[1.6rem] overflow-hidden shadow-2xl select-none w-full" style={{ height, minHeight: 200, border: "4px solid #ffd1e3", touchAction: editable ? "none" : "auto" }}>

      {/* ---------- WALL (colour driven by the wall upgrade / theme) ---------- */}
      <div className={"absolute inset-0 " + pulse("wall")} style={{ background: wallBg }} />
      <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0 28px, rgba(255,255,255,0) 28px 56px)" }} />
      <div className="absolute inset-0 opacity-15" style={{ backgroundImage: (wall && wall.dark) ? "radial-gradient(#ffffff66 1px,transparent 1px)" : "radial-gradient(#ffffff 2px, transparent 2px)", backgroundSize: "28px 28px" }} />

      {/* ---------- FLOOR band (peeks above the counter; styled by floor upgrade) ---------- */}
      <div className={"absolute left-0 right-0 bottom-0 " + pulse("floor")} style={{ height: "38%", background: floor ? floor.bg : "linear-gradient(#ffe7d2,#ffd6bd)", borderTop: "3px solid rgba(255,255,255,0.7)", boxShadow: "inset 0 6px 10px rgba(255,255,255,0.35)", zIndex: 1 }} />

      {/* ---------- ROOF / AWNING valance across the top ---------- */}
      {roof && (
        <div className={"absolute top-0 left-0 right-0 " + pulse("roof")} style={{ height: "6.5%", background: roofBg, zIndex: 4, boxShadow: roof.glow ? "0 0 16px 3px " + roof.glow : "0 3px 8px rgba(0,0,0,0.12)" }}>
          <div className="absolute left-0 right-0 flex justify-around" style={{ bottom: -6 }}>{Array.from({ length: 12 }).map((_, i) => <div key={i} style={{ width: 11, height: 11, borderRadius: 99, background: roof.rainbow ? ["#ff6b9d", "#ffd93d", "#7ed957", "#4dd0e1", "#a06bff"][i % 5] : (i % 2 ? (roof.c2 || "#fff") : (roof.c1 || "#ff8fb3")) }} />)}</div>
        </div>
      )}

      {/* ---------- ceiling dangle ---------- */}
      {ceil && <div className={"absolute left-0 right-0 text-center tracking-[0.6em] " + pulse("ceiling")} style={{ top: roof ? "8%" : "1%", fontSize: 15, zIndex: 4 }}>{ceil.emoji}{ceil.emoji}{ceil.emoji}{ceil.emoji}</div>}

      {/* ---------- WALL SIGN (always there; the sign upgrade restyles it) ---------- */}
      <div className={"absolute left-1/2 -translate-x-1/2 px-3 py-1 rounded-xl text-[11px] font-black text-white shadow text-center " + pulse("sign") + (sign && fancy(sign.rarity) ? "ishana-cheer" : "")} style={{ top: roof ? "10%" : "4%", whiteSpace: "nowrap", zIndex: 4, background: sign ? sign.bg : "#ff7eb3", boxShadow: sign && sign.glow ? "0 0 16px 4px " + sign.glow : "0 2px 6px rgba(0,0,0,.15)" }}>{sign && sign.tag ? sign.tag + " " : "🍦 "}Ishana's Ice Cream</div>

      {/* ---------- WINDOW (small, high-left — background decoration) ---------- */}
      <div className={"absolute " + pulse("window")} style={{ left: "5%", top: roof ? "15%" : "10%", width: "26%", zIndex: 1, filter: win && win.icon ? "drop-shadow(0 0 8px rgba(255,210,90,.7))" : "drop-shadow(0 3px 5px rgba(0,0,0,.08))" }}>
        <ImgOr src={ASSET.window} className="w-full object-contain" fallback={<div style={{ aspectRatio: "0.85", borderRadius: 12, background: "linear-gradient(" + world.sky[0] + "," + world.sky[1] + ")", border: "5px solid #fff" }} />} />
        {win && win.icon && <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ fontSize: 20 }}>{win.icon}</div>}
      </div>

      {/* ---------- SHELF with topping jars (small, high-right) ---------- */}
      <div className="absolute" style={{ right: "7%", top: roof ? "14%" : "9%", width: "27%", zIndex: 1, filter: "drop-shadow(0 3px 5px rgba(0,0,0,.08))" }}>
        <ImgOr src={ASSET.shelf} className="w-full object-contain" fallback={<div className="flex gap-1.5 justify-center">{tubs.map((c, i) => <div key={i} style={{ width: 15, height: 19, background: c, borderRadius: 4 }} />)}</div>} />
      </div>

      {/* ---------- entrance / door on the wall (styled as a real doorway) ---------- */}
      {ent && (
        <div className={"absolute " + pulse("entrance")} style={{ left: "2%", bottom: "30%", width: "13%", zIndex: 1 }}>
          <div className="rounded-t-2xl flex items-end justify-center" style={{ aspectRatio: "0.6", background: "linear-gradient(#ffd9ec,#ffc2e0)", border: "3px solid #fff", boxShadow: "0 3px 6px rgba(0,0,0,.12)" }}><span style={{ fontSize: 18, marginBottom: 4 }}>{ent.emoji}</span></div>
        </div>
      )}

      {/* ---------- machine + helper on the BACK COUNTER, left of Ishana, sitting
           ABOVE the counter line (bottom>32%) so they stay visible, behind her
           (z2) and clear of the customer on the right ---------- */}
      {mac && <div className={"absolute " + pulse("machine")} style={{ left: "14%", bottom: "33%", width: "16%", zIndex: 2, filter: fancy(mac.rarity) ? "drop-shadow(0 0 10px gold)" : "drop-shadow(0 3px 5px rgba(0,0,0,.15))" }}>
        <ImgOr src={ASSET.machine[mac.base]} className="w-full object-contain" fallback={<div className="flex items-center justify-center rounded-2xl" style={{ aspectRatio: "1", fontSize: 28, background: "radial-gradient(circle at 50% 40%, #ffffffcc, #e6f7ffcc)", boxShadow: "0 4px 8px rgba(0,0,0,.1)" }}>{mac.emoji}</div>} />
      </div>}
      {helper && <div className={"absolute " + (customerHappy ? "cust-happy" : "bob") + " " + pulse("helper")} style={{ left: "0%", bottom: "33%", width: "14%", zIndex: 2, filter: "drop-shadow(0 3px 5px rgba(0,0,0,.2))" }} title="Your staff">
        <ImgOr src={STAFF_ART[helper.id]} className="w-full object-contain" fallback={<div className="flex items-center justify-center" style={{ fontSize: 30 }}>{helper.emoji}</div>} />
      </div>}

      {/* ---------- placed decorations (draggable in edit mode; soft base so the
           emoji reads as a placed object, not a floating glyph) ---------- */}
      {placed.map((p) => { const D = ITEM[p.id]; if (!D) return null; const zn = D.zone || "floor"; const front = zn === "floor" || zn === "counter"; const art = DECOR_ART[p.id]; const w = zn === "wall" ? "15%" : zn === "shelf" ? "12%" : "17%"; return (
        <div key={p.id} onPointerDown={editable ? (e) => onItemDown(e, p.id) : undefined} onDoubleClick={editable ? () => onUp(p.id, true) : undefined}
          className={"absolute flex items-end justify-center " + (editable ? "cursor-grab active:cursor-grabbing" : "")} style={{ left: p.x + "%", top: p.y + "%", transform: "translate(-50%,-50%)", zIndex: front ? 6 : 3, width: art ? w : undefined, touchAction: "none" }} title={editable ? "Drag · double-tap to put away" : undefined}>
          {art ? (
            <div className="relative w-full" style={{ filter: "drop-shadow(0 4px 4px rgba(0,0,0,.18))" }}><ImgOr src={art} className="w-full object-contain" fallback={<div style={{ fontSize: front ? 34 : 30 }}>{D.emoji}</div>} />{front && <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: -2, width: "55%", height: 6, background: "rgba(0,0,0,.1)", borderRadius: "50%" }} />}</div>
          ) : (
            <div className="relative leading-none" style={{ fontSize: front ? 34 : 30, filter: "drop-shadow(0 4px 3px rgba(0,0,0,.18))" }}>{D.emoji}{front && <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: -4, width: 26, height: 7, background: "rgba(0,0,0,.12)", borderRadius: "50%" }} />}</div>
          )}
        </div>
      ); })}
      {ghostDecor && <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 preview-pulse" style={{ fontSize: 42, opacity: 0.55, zIndex: 3 }}>{ghostDecor.emoji}</div>}

      {/* ---------- ISHANA — behind the counter, left-of-centre so the customer
           has room at the counter (static wrapper keeps her centred while the
           inner sprite bobs) ---------- */}
      <div className="absolute" style={{ left: mode === "serve" ? "37%" : "50%", bottom: "13%", height: "62%", maxHeight: 320, zIndex: 2, transform: "translateX(-50%)" }}>
        <ImgOr src={ishanaImg(equipped)} className={"h-full object-contain object-bottom " + (ishanaMood === "cheer" ? "ishana-cheer" : "bob")} style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.12))" }} fallback={<FullIshana equipped={equipped} pet={pet} size={92} mood={ishanaMood} />} />
      </div>

      {/* ---------- COUNTER (front; sized by scene height so it stays ~32% in
           both the tall Serve view and the shorter edit view; tinted by the
           counter upgrade) ---------- */}
      <div className={"absolute left-0 right-0 bottom-0 w-full " + pulse("counter")} style={{ height: "32%", zIndex: 5 }}>
        <ImgOr src={ASSET.counter} className="w-full h-full" style={{ objectFit: "cover", objectPosition: "center 30%", filter: counter ? counter.filter : "none" }} fallback={<div style={{ height: "100%", background: "linear-gradient(" + (counter ? counter.color : I.counter) + "," + (counter ? counter.color : I.counter) + "cc)", borderTop: "5px solid #fff" }} />} />
      </div>

      {/* ---------- PET — own zone, front bottom-left, always ≥90% visible
           (in front of the counter, clear of Ishana & the customer) ---------- */}
      {pet && ITEM[pet] && (
        <div className="absolute pet-hop" style={{ left: "4%", bottom: "4%", width: "16%", zIndex: 7, filter: "drop-shadow(0 5px 5px rgba(0,0,0,.25))" }} title="Your pet">
          <ImgOr src={PET_ART[pet]} className="w-full object-contain" fallback={<div className="flex items-end justify-center leading-none" style={{ fontSize: 54 }}>{ITEM[pet].emoji}</div>} />
        </div>
      )}

      {/* ---------- CUSTOMER — serve mode only; slides in, faces Ishana ---------- */}
      {mode === "serve" && customer && (
        <div key={custKey} className="absolute cust-enter" style={{ right: "2%", bottom: "3%", width: Math.round(46 * (CUSTOMER_SCALE[customer.type] || 0.82)) + "%", zIndex: 7 }}>
          <CustomerView customer={customer} state={freeze ? "freeze" : customerHappy ? "happy" : "wait"} />
        </div>
      )}

      {/* ---------- edit-mode label ---------- */}
      {mode === "edit" && <div className="absolute left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-black text-white" style={{ top: 4, background: "rgba(160,107,255,.85)", zIndex: 8 }}>✏️ Renovating your shop</div>}

      {children}
    </div>
  );
}

/* The Serve tab renders the very same shop, with a customer at the counter. */
function StorefrontScene(props) { return <ShopScene mode="serve" {...props} />; }

/* ============================== MODES ==================================== */
function FlavorButtons({ onPick, disabled }) {
  return (<div className="grid grid-cols-4 gap-2">{FLAVOR_LIST.map((f) => <button key={f.key} onClick={() => onPick(f.key)} disabled={disabled} aria-label={f.name} className="rounded-2xl p-2 bg-white shadow-md active:scale-90 transition flex items-center justify-center" style={{ border: "3px solid #f0f0f0" }}><Scoop flavorKey={f.key} size={46} /></button>)}</div>);
}
function Bubble({ children }) { return <div className="rounded-2xl px-4 py-3 mb-2 shadow-lg text-center bg-white" style={{ border: "3px solid #b3e5ff" }}>{children}</div>; }
function PatternMode({ onSolve, onMiss, locked, speak }) {
  const p = useMemo(() => { const a = rand(FLAVOR_KEYS); let b = rand(FLAVOR_KEYS); while (b === a) b = rand(FLAVOR_KEYS); const seq = rand([[a, b, a, b], [a, a, b, a], [a, b, b, a]]); return { seq, answer: seq[seq.length - 1], shown: seq.slice(0, -1) }; }, []);
  useEffect(() => { speak && speak("What scoop comes next?"); }, []); // eslint-disable-line
  return (<><Bubble><p className="text-base font-bold mb-2" style={{ color: "#6b4bff" }}>What comes next? 🤔</p><div className="flex items-center justify-center gap-2 flex-wrap">{p.shown.map((s, i) => <Scoop key={i} flavorKey={s} size={42} />)}<div className="rounded-full flex items-center justify-center text-2xl font-black" style={{ width: 42, height: 42, border: "3px dashed #b0b0b0", color: "#b0b0b0" }}>?</div></div></Bubble><FlavorButtons disabled={locked} onPick={(k) => (k === p.answer ? onSolve() : onMiss())} /></>);
}
function CountingMode({ level, onSolve, onMiss, locked, sounds, speak }) {
  const p = useMemo(() => ({ flavor: rand(FLAVOR_KEYS), target: randInt(2, clamp(3 + Math.floor(level / 8), 3, 6)) }), [level]);
  const [stack, setStack] = useState([]); const f = FLAVORS[p.flavor];
  useEffect(() => { speak && speak("I want " + p.target + " " + f.name + " scoops!"); }, []); // eslint-disable-line
  const tap = (k) => { if (locked) return; if (k !== p.flavor) { onMiss(); return; } const n = [...stack, k]; setStack(n); sounds && sounds.plop(); if (n.length >= p.target) onSolve(); };
  return (<><Bubble><p className="text-base font-bold mb-1" style={{ color: "#6b4bff" }}>I want <span style={{ color: f.color }}>{p.target} {f.name}</span> scoops!</p><div className="flex items-center justify-center gap-3"><Cone scoops={stack} size={30} /><div key={stack.length} className="counter-pop text-5xl font-black" style={{ color: f.color }}>{stack.length}<span className="text-2xl text-gray-400"> / {p.target}</span></div></div></Bubble><FlavorButtons disabled={locked} onPick={tap} /></>);
}
function AdditionMode({ level, onSolve, onMiss, locked, speak }) {
  const p = useMemo(() => { const mx = clamp(2 + Math.floor(level / 7), 2, 5); const a = randInt(1, mx), b = randInt(1, mx), sum = a + b; const o = new Set([sum]); while (o.size < 3) o.add(clamp(sum + randInt(-2, 2), 1, 12)); return { a, b, sum, options: [...o].sort(() => Math.random() - 0.5) }; }, [level]);
  useEffect(() => { speak && speak(p.a + " plus " + p.b + ". How many scoops in total?"); }, []); // eslint-disable-line
  const Dots = ({ n, c }) => <span className="inline-flex gap-1 align-middle">{Array.from({ length: n }).map((_, i) => <span key={i} className="inline-block rounded-full" style={{ width: 15, height: 15, background: c }} />)}</span>;
  return (<><Bubble><p className="text-base font-bold mb-2" style={{ color: "#6b4bff" }}>How many scoops? 🍨</p><div className="flex items-center justify-center gap-2 text-3xl font-black" style={{ color: "#3aa0ff" }}><Dots n={p.a} c="#ff5c93" /> <span>+</span> <Dots n={p.b} c="#4dd0e1" /> <span>=</span> <span className="text-gray-400">?</span></div></Bubble><div className="grid grid-cols-3 gap-3">{p.options.map((n) => <button key={n} disabled={locked} onClick={() => (n === p.sum ? onSolve() : onMiss())} className="rounded-2xl py-6 shadow-md active:scale-90 transition text-4xl font-black text-white" style={{ background: "linear-gradient(#7ed9ff,#3aa0ff)" }}>{n}</button>)}</div></>);
}
function MemoryMode({ level, onSolve, onMiss, locked, speak }) {
  const order = useMemo(() => Array.from({ length: clamp(2 + Math.floor(level / 6), 2, 5) }, () => rand(FLAVOR_KEYS)), [level]);
  const [phase, setPhase] = useState("show"); const [count, setCount] = useState(3); const [input, setInput] = useState([]);
  useEffect(() => { speak && speak("Remember the order!"); }, []); // eslint-disable-line
  useEffect(() => { if (phase !== "show") return; if (count <= 0) { setPhase("input"); return; } const id = setTimeout(() => setCount((c) => c - 1), 1000); return () => clearTimeout(id); }, [phase, count]);
  const tap = (k) => { if (locked || phase !== "input") return; if (k !== order[input.length]) { setInput([]); onMiss(); return; } const n = [...input, k]; setInput(n); if (n.length === order.length) onSolve(); };
  return (<><Bubble>{phase === "show" ? (<><p className="text-base font-bold mb-2" style={{ color: "#6b4bff" }}>Remember the order! 🧠 <span className="text-red-500">{count}</span></p><div className="flex items-center justify-center gap-2">{order.map((s, i) => <Scoop key={i} flavorKey={s} size={40} />)}</div></>) : (<><p className="text-base font-bold mb-2" style={{ color: "#6b4bff" }}>Make the same order! ✨</p><div className="flex items-center justify-center gap-2">{order.map((_, i) => <div key={i} className="rounded-full flex items-center justify-center" style={{ width: 40, height: 40, border: "3px dashed #ccc" }}>{input[i] && <Scoop flavorKey={input[i]} size={36} />}</div>)}</div></>)}</Bubble><FlavorButtons disabled={locked || phase === "show"} onPick={tap} /></>);
}
function SortingMode({ level, onSolve, onMiss, locked, sounds, speak }) {
  const target = useMemo(() => rand(FLAVOR_KEYS), [level]); const need = clamp(3 + Math.floor(level / 8), 3, 6);
  const [items, setItems] = useState([]); const [got, setGot] = useState(0); const idRef = useRef(0); const done = useRef(false);
  useEffect(() => { speak && speak("Catch " + need + " " + FLAVORS[target].name + " scoops!"); }, []); // eslint-disable-line
  useEffect(() => { if (locked) return; const sp = setInterval(() => { const color = Math.random() < 0.55 ? target : rand(FLAVOR_KEYS); const id = ++idRef.current; setItems((a) => [...a, { id, color, left: 8 + Math.random() * 78, dur: 2.6 + Math.random() * 1.4 }]); setTimeout(() => setItems((a) => a.filter((x) => x.id !== id)), 4200); }, 650); return () => clearInterval(sp); }, [locked, target]);
  const grab = (x) => { if (locked || done.current) return; setItems((a) => a.filter((y) => y.id !== x.id)); if (x.color === target) { const g = got + 1; setGot(g); sounds && sounds.sparkle(); if (g >= need) { done.current = true; onSolve(); } } else onMiss(); };
  const f = FLAVORS[target];
  return (<><Bubble><p className="text-base font-bold" style={{ color: "#6b4bff" }}>Catch <span style={{ color: f.color }}>{need} {f.name}</span> scoops! 🌧️</p><p className="text-sm text-gray-500">Tap only the right colour — {got}/{need}</p></Bubble><div className="relative rounded-2xl overflow-hidden mb-1" style={{ height: 200, background: "linear-gradient(#eef9ff,#dff1ff)", border: "3px solid #b3e5ff" }}>{items.map((x) => <button key={x.id} onClick={() => grab(x)} className="absolute falling active:scale-90" style={{ left: x.left + "%", top: -50, animationDuration: x.dur + "s" }}><Scoop flavorKey={x.color} size={46} /></button>)}</div></>);
}
function SpeedMode({ level = 1, onSolve, onMiss, locked, sounds, speak }) {
  const DUR = clamp(20 - Math.floor(level / 4), 12, 20); const [t, setT] = useState(DUR); const [order, setOrder] = useState(() => rand(FLAVOR_KEYS)); const [served, setServed] = useState(0); const done = useRef(false);
  useEffect(() => { speak && speak("Speed round! Tap fast!"); }, []); // eslint-disable-line
  useEffect(() => { if (locked) return; const id = setInterval(() => { setT((x) => { if (x <= 1) { clearInterval(id); if (!done.current) { done.current = true; onSolve({ bonusCoins: served * 3 }); } return 0; } if (x <= 5) sounds.tick(); return x - 1; }); }, 1000); return () => clearInterval(id); }, [locked]); // eslint-disable-line
  const f = FLAVORS[order];
  const tap = (k) => { if (locked || done.current) return; if (k === order) { setServed((s) => s + 1); sounds.coin(); setOrder(rand(FLAVOR_KEYS)); } else onMiss(); };
  return (<><Bubble><p className="text-base font-bold" style={{ color: "#6b4bff" }}>⚡ SPEED ROUND! Tap <span style={{ color: f.color }}>{f.name}</span>!</p><div className="mt-2 h-3 rounded-full bg-gray-200 overflow-hidden"><div style={{ width: (t / DUR) * 100 + "%", height: "100%", background: t <= 5 ? "#ff5c5c" : "#7ed957", transition: "width 1s linear" }} /></div><p className="text-sm font-black mt-1" style={{ color: "#ff7e1d" }}>Served: {served} 🍦</p></Bubble><FlavorButtons disabled={locked} onPick={tap} /></>);
}
function MegaMode({ level, onSolve, locked, sounds, speak }) {
  const target = useMemo(() => (level < 14 ? 10 : level < 26 ? 15 : 20), [level]); const [tower, setTower] = useState([]);
  useEffect(() => { speak && speak("Build a " + target + " scoop tower!"); }, []); // eslint-disable-line
  const add = () => { if (locked) return; const n = [...tower, rand(FLAVOR_KEYS)]; setTower(n); sounds && sounds.plop(); if (n.length >= target) onSolve({ bonusCoins: target }); };
  return (<><Bubble><p className="text-base font-bold" style={{ color: "#6b4bff" }}>🗼 MEGA ORDER! Build a <span className="text-pink-500">{target}-scoop</span> tower!</p><p className="text-sm text-gray-500">{tower.length} / {target}</p></Bubble><div className="relative rounded-2xl overflow-y-auto mb-2 flex items-end justify-center" style={{ height: 170, background: "linear-gradient(#fff,#fff5fa)", border: "3px solid #ffd1e3" }}><div className="scale-90"><Cone scoops={tower} size={26} max={30} /></div></div><button onClick={add} disabled={locked} className="w-full rounded-2xl py-5 text-2xl font-black text-white shadow-md active:scale-95 transition" style={{ background: "linear-gradient(#ff9f43,#ff7e1d)" }}>+ Add Scoop 🍦</button></>);
}
const MODE_COMPONENTS = { pattern: PatternMode, counting: CountingMode, addition: AdditionMode, memory: MemoryMode, sorting: SortingMode, speed: SpeedMode, mega: MegaMode };

/* ============================== OVERLAYS ================================= */
function Overlay({ children }) { return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(40,20,60,0.45)" }}><div className="overlay-pop w-full max-w-sm text-center rounded-[2rem] p-6 shadow-2xl bg-white" style={{ border: "4px solid #ffd1e3" }}>{children}</div></div>); }
function MysteryBox({ reward, onContinue, sounds }) { const [o, setO] = useState(false); return (<Overlay><h2 className="text-3xl font-black mb-2" style={{ color: "#a06bff" }}>🎁 Mystery Box!</h2>{!o ? (<><button onClick={() => { setO(true); sounds.mystery(); }} className="text-[90px] leading-none my-3 wiggle active:scale-90">🎁</button><p className="text-lg font-bold text-gray-500 mb-3">Tap to open!</p></>) : (<><div className="text-[80px] leading-none my-2 reward-pop">{reward.emoji}</div><p className="text-xl font-black mb-1" style={{ color: "#ff5c93" }}>{reward.label}</p><Confetti show /><button onClick={onContinue} className="pulse-btn mt-3 text-white text-xl font-black px-8 py-3 rounded-full shadow-xl" style={{ background: "linear-gradient(#7ed957,#4caf2f)" }}>Yay! ✨</button></>)}</Overlay>); }
function Milestone({ kind, tierIdx, world, onContinue }) { return (<Overlay><Confetti show big />{kind === "world" ? (<><p className="text-lg font-bold" style={{ color: world.accent }}>NEW WORLD UNLOCKED!</p><div className="text-[80px] leading-none my-2 reward-pop">{world.out}</div><h2 className="text-3xl font-black mb-2" style={{ color: world.accent }}>{world.name}</h2></>) : (<><p className="text-lg font-bold" style={{ color: "#ff7e1d" }}>SHOP UPGRADE!</p><div className="text-[80px] leading-none my-2 reward-pop">{SHOP_TIERS[tierIdx].emoji}</div><h2 className="text-3xl font-black mb-2" style={{ color: "#ff5c93" }}>{SHOP_TIERS[tierIdx].name}</h2></>)}<div className="my-2 flex justify-center"><ImgOr src={ASSET.hero} className="object-contain ishana-cheer" style={{ height: 110 }} fallback={<IshanaFace size={86} mood="dance" />} /></div><button onClick={onContinue} className="pulse-btn mt-2 text-white text-xl font-black px-8 py-3 rounded-full shadow-xl" style={{ background: "linear-gradient(#ff7eb3,#ff5c93)" }}>Hooray! 🎉</button></Overlay>); }
function RareArrival({ customer, onContinue }) { return (<Overlay><Confetti show /><p className="text-lg font-bold" style={{ color: "#a06bff" }}>✨ NEW FRIEND! ✨</p><div className="my-2 reward-pop flex justify-center"><ImgOr src={"assets/animal-" + customer + ".png"} className="object-contain" style={{ width: 110, height: 110 }} fallback={<ChibiAnimal type={customer} state="wait" size={104} />} /></div><h2 className="text-2xl font-black mb-1" style={{ color: "#ff5c93" }}>{CUSTOMER_INFO[customer].name}</h2><p className="text-sm text-gray-500 mb-3">New sticker for your album! 📖</p><button onClick={onContinue} className="pulse-btn text-white text-xl font-black px-8 py-3 rounded-full shadow-xl" style={{ background: "linear-gradient(#a06bff,#7b3ff2)" }}>Cool! 🌟</button></Overlay>); }
function DailyReward({ day, claimed, onClaim, onClose }) { return (<Overlay><h2 className="text-2xl font-black mb-1" style={{ color: "#ff7e1d" }}>🎁 Daily Reward!</h2><p className="text-sm font-bold text-gray-500 mb-3">Day {day + 1} — come back every day!</p><div className="grid grid-cols-4 gap-2 mb-4">{DAILY_REWARDS.map((r, i) => (<div key={i} className="rounded-2xl p-2 flex flex-col items-center justify-center" style={{ background: i < day ? "#e9ffe9" : i === day ? "#fff3d6" : "#f3f3f3", border: "3px solid " + (i === day ? "#ffb300" : i < day ? "#7ed957" : "#eee"), aspectRatio: "1" }}><div className="text-2xl">{i < day ? "✅" : r.emoji}</div><div className="text-[8px] font-bold mt-0.5 leading-tight">{r.label}</div></div>))}</div>{claimed ? (<><p className="text-base font-black mb-3" style={{ color: "#7ed957" }}>✅ Claimed! Come back tomorrow ⏰</p><button onClick={onClose} className="pulse-btn text-white text-xl font-black px-8 py-3 rounded-full shadow-xl" style={{ background: "linear-gradient(#9aa3ad,#7d8794)" }}>OK 👍</button></>) : (<button onClick={onClaim} className="pulse-btn text-white text-xl font-black px-8 py-3 rounded-full shadow-xl" style={{ background: "linear-gradient(#ff9f43,#ff7e1d)" }}>Claim {DAILY_REWARDS[day].emoji}</button>)}</Overlay>); }

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
function ItemGrid({ items, save, onUse, isEquipped, labelFor, noDisable }) {
  return (<div className="grid grid-cols-3 gap-2">{items.map((i) => {
    const owned = save.owned.includes(i.id), equipped = isEquipped ? isEquipped(i) : false, afford = save.coins >= i.cost;
    return (<button key={i.id} onClick={() => onUse(i)} disabled={!noDisable && !owned && !afford} className="relative rounded-2xl p-2 shadow-md transition active:scale-95 text-center flex flex-col items-center" style={{ background: equipped ? "#fff0d6" : owned ? "#f3fff3" : afford ? "#fff" : "#f3f3f3", border: "3px solid " + (equipped ? "#ffb300" : owned ? "#7ed957" : "#eee"), opacity: owned || afford ? 1 : 0.6 }}>
      <div className="absolute top-1 left-1"><RarityBadge rarity={i.rarity} /></div>
      <div className="mt-3 flex items-center justify-center" style={{ minHeight: 30 }}><ItemIcon item={i} size={26} /></div>
      <div className="text-[11px] font-bold mt-1 leading-tight">{i.name}</div>
      <div className="text-[11px] font-black mt-0.5" style={{ color: equipped ? "#ff7e1d" : owned ? "#4caf2f" : "#ff7e1d" }}>{labelFor ? labelFor(i, owned, equipped) : (equipped ? "Using ✓" : owned ? "Use it" : "🪙 " + money(i.cost))}</div>
    </button>);
  })}</div>);
}

/* ============================== PAGES ==================================== */
function DressUpPage({ save, onUse }) {
  const [cat, setCat] = useState("dress");
  const [tryOn, setTryOn] = useState(null); // unowned item being previewed before buying
  const cats = [["dress", "👗"], ["pet", "🐾"]];
  const dressItems = byCat("dress").filter((d) => OUTFITS[d.id]); // only painted outfits
  const isEq = (i) => (tryOn ? tryOn.id === i.id : (i.cat === "pet" ? save.pet === i.id : save.equipped[i.cat] === i.id));
  // Avatar reflects the Try-On preview when active.
  const previewEquipped = tryOn && tryOn.cat !== "pet" ? { ...save.equipped, [tryOn.cat]: tryOn.id } : save.equipped;
  const previewPet = tryOn && tryOn.cat === "pet" ? tryOn.id : save.pet;
  const tap = (i) => {
    if (save.owned.includes(i.id)) { setTryOn(null); onUse(i); }      // owned -> wear now
    else setTryOn(tryOn && tryOn.id === i.id ? null : i);              // not owned -> try it on
  };
  const buy = () => { if (tryOn) { onUse(tryOn); setTryOn(null); } };  // confirm purchase
  return (<div>
    <div className="flex justify-center mb-2"><IshanaAvatar equipped={previewEquipped} pet={previewPet} size={120} mood="idle" /></div>
    {tryOn && (
      <div className="flex items-center justify-center gap-2 mb-2 banner-pop">
        <span className="text-sm font-black" style={{ color: "#a06bff" }}>Try-On: {tryOn.name}</span>
        <button onClick={buy} disabled={save.coins < tryOn.cost} className="text-sm font-black text-white px-4 py-1.5 rounded-full shadow active:scale-95" style={{ background: save.coins >= tryOn.cost ? "linear-gradient(#7ed957,#4caf2f)" : "#bbb" }}>Buy 🪙 {money(tryOn.cost)}</button>
        <button onClick={() => setTryOn(null)} className="text-xs font-bold text-gray-400 underline">cancel</button>
      </div>
    )}
    <div className="flex justify-center gap-2 mb-2">{cats.map(([c, e]) => <button key={c} onClick={() => { setCat(c); setTryOn(null); }} className="w-11 h-11 rounded-2xl text-xl shadow active:scale-90" style={{ background: cat === c ? "#ff7eb3" : "#fff", border: "3px solid " + (cat === c ? "#ff5c93" : "#eee") }}>{e}</button>)}</div>
    <div className="rounded-2xl p-2 bg-white/70" style={{ border: "3px solid #ffd1e3" }}><div className="max-h-[30vh] overflow-y-auto pr-1">
      {cat === "dress" && (
        <button onClick={() => { if (save.equipped.dress) onUse(ITEM[save.equipped.dress]); setTryOn(null); }} className="w-full mb-2 rounded-2xl py-2 shadow-md active:scale-95 flex items-center justify-center gap-2 font-black text-sm" style={{ background: !save.equipped.dress ? "#fff0d6" : "#fff", border: "3px solid " + (!save.equipped.dress ? "#ffb300" : "#eee"), color: "#ff7e1d" }}>🍦 Default Apron {!save.equipped.dress ? "✓" : ""}</button>
      )}
      <ItemGrid items={cat === "dress" ? dressItems : byCat("pet")} save={save} onUse={tap} isEquipped={isEq} labelFor={(i, o, e) => (o ? (e ? (cat === "pet" ? "Chosen ✓" : "Wearing ✓") : (cat === "pet" ? "Pick pet" : "Tap to wear")) : (save.coins >= i.cost ? (tryOn && tryOn.id === i.id ? "Trying… 👀" : "Try on 👀") : "🔒 🪙 " + money(i.cost)))} />
    </div></div>
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
  const [focus, setFocus] = useState(null); // unowned item being previewed live before buying
  const sceneRef = useRef(null); const drag = useRef(null); const [boom, setBoom] = useState(false);
  const placedIds = save.placed.map((p) => p.id);

  const celebrate = (rarity) => { if (["rare", "epic", "legendary", "dream"].includes(rarity)) { sounds.rare(); sounds.sparkle(); setBoom(rarity); setTimeout(() => setBoom(false), 1700); } else sounds.upgrade(); };
  const place = (id) => { setSave((s) => (s.placed.find((p) => p.id === id) || s.placed.length >= MAX_PLACED ? s : { ...s, placed: [...s.placed, { id, ...zonePos(ITEM[id] && ITEM[id].zone) }] })); sounds.pop(); };
  const onItemDown = (e, id) => { const r = sceneRef.current.getBoundingClientRect(); drag.current = { id, r }; if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId); };
  const onMove = (e) => { if (!drag.current) return; const { id, r } = drag.current; const x = clamp(((e.clientX - r.left) / r.width) * 100, 4, 96), y = clamp(((e.clientY - r.top) / r.height) * 100, 8, 84); setSave((s) => ({ ...s, placed: s.placed.map((p) => (p.id === id ? { ...p, x, y } : p)) })); };
  const onUp = (maybeId, rm) => { if (rm && typeof maybeId === "string") setSave((s) => ({ ...s, placed: s.placed.filter((p) => p.id !== maybeId) })); drag.current = null; };

  // Tap: owned item acts at once; unowned+affordable previews live (then Buy commits).
  const onUse = (i) => {
    const owned = save.owned.includes(i.id);
    if (!owned) { if (save.coins < i.cost) return; sounds.pop(); setFocus((f) => (f && f.id === i.id ? null : i)); return; }
    setFocus(null);
    if (isSlot(i.cat)) { sounds.pop(); setSave((s) => ({ ...s, shop: { ...s.shop, [i.cat]: s.shop[i.cat] === i.id ? null : i.id } })); }
    else if (!placedIds.includes(i.id)) place(i.id);
  };
  // Buy the previewed item — and immediately wear/place it so the shop updates.
  const buyFocused = () => {
    const i = focus; if (!i || save.coins < i.cost) return;
    celebrate(i.rarity);
    if (i.cat === "helper") { sounds.fanfare(); setBoom(i.rarity || "rare"); } // hiring a helper feels like a milestone
    setSave((s) => {
      const ns = { ...s, coins: s.coins - i.cost, owned: [...s.owned, i.id] };
      if (isSlot(i.cat)) ns.shop = { ...s.shop, [i.cat]: i.id };
      else ns.placed = s.placed.length >= MAX_PLACED ? s.placed : [...s.placed, { id: i.id, ...zonePos(i.zone) }];
      return ns;
    });
    setFocus(null);
  };

  const active = SUBTABS.find((s) => s.key === sub);
  return (<div>
    {boom && <Confetti show big={boom === "legendary" || boom === "dream"} />}
    <div className="text-center mb-1 text-sm font-black" style={{ color: "#a06bff" }}>{SHOP_TIERS[tierIdx].emoji} {SHOP_TIERS[tierIdx].name} — make it the coolest shop!</div>
    <div className="mb-2"><ShopScene mode="edit" tierIdx={tierIdx} world={world} shop={save.shop} placed={save.placed} equipped={save.equipped} pet={save.pet} preview={focus} editable height={360} sceneRef={sceneRef} onItemDown={onItemDown} onMove={onMove} onUp={onUp} /></div>
    {focus && (
      <div className="flex items-center justify-center gap-2 mb-2 banner-pop">
        <span className="text-sm font-black truncate" style={{ color: "#a06bff" }}>Preview: {focus.name}</span>
        <button onClick={buyFocused} disabled={save.coins < focus.cost} className="text-sm font-black text-white px-4 py-1.5 rounded-full shadow active:scale-95" style={{ background: save.coins >= focus.cost ? "linear-gradient(#7ed957,#4caf2f)" : "#bbb" }}>Buy 🪙 {money(focus.cost)}</button>
        <button onClick={() => setFocus(null)} className="text-xs font-bold text-gray-400 underline">cancel</button>
      </div>
    )}

    <div className="flex gap-1.5 overflow-x-auto pb-1 mb-2">{SUBTABS.map((s) => <button key={s.key} onClick={() => { setSub(s.key); setFocus(null); }} className="flex-shrink-0 flex flex-col items-center rounded-2xl px-3 py-1 active:scale-90" style={{ background: sub === s.key ? "linear-gradient(#ff7eb3,#ff5c93)" : "#fff", border: "3px solid " + (sub === s.key ? "#ff5c93" : "#eee") }}><span className="text-lg">{s.emoji}</span><span className="text-[10px] font-black" style={{ color: sub === s.key ? "#fff" : "#b08" }}>{s.label}</span></button>)}</div>

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
              <ItemGrid items={byCat(c)} save={save} onUse={onUse} isEquipped={(i) => (focus ? focus.id === i.id : (isSlot(i.cat) ? save.shop[i.cat] === i.id : placedIds.includes(i.id)))} labelFor={(i, o, e) => { if (focus && focus.id === i.id) return "Preview 👀"; if (isSlot(i.cat)) return o ? (save.shop[i.cat] === i.id ? "Using ✓" : "Use it") : (save.coins >= i.cost ? "Try it 👀" : "🔒 🪙 " + money(i.cost)); return placedIds.includes(i.id) ? "In shop ✓" : o ? "Place it" : (save.coins >= i.cost ? "Try it 👀" : "🔒 🪙 " + money(i.cost)); }} />
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
    <div className="mb-3 rounded-2xl p-3 bg-white shadow" style={{ border: "3px solid #ffe3ef" }}><div className="flex items-center justify-between mb-1"><span className="font-black" style={{ color: "#ff5c93" }}>🧁 Customers</span><span className="text-sm font-bold text-gray-500">{custList.filter((c) => save.met.includes(c)).length} / {custList.length}</span></div><div className="grid grid-cols-6 gap-1.5">{custList.map((c) => box(save.met.includes(c), "#ffb6d9", save.met.includes(c) ? <ImgOr src={"assets/animal-" + c + ".png"} className="object-contain" style={{ width: "94%", height: "94%" }} fallback={<span>{CUSTOMER_INFO[c].emoji}</span>} /> : "❓"))}</div></div>
    <div className="mb-2 rounded-2xl p-3 bg-white shadow" style={{ border: "3px solid #ffe3ef" }}><div className="flex items-center justify-between mb-1"><span className="font-black" style={{ color: "#ff5c93" }}>🌍 Worlds</span><span className="text-sm font-bold text-gray-500">{worldCount} / {WORLDS.length}</span></div><div className="grid grid-cols-5 gap-1.5">{WORLDS.map((w, i) => box(i < worldCount, "#a06bff", i < worldCount ? w.out : "🔒"))}</div></div>
  </div>);
}

/* Progress bar toward the next shop tier — gives a visible reason to keep playing. */
function ShopProgress({ level }) {
  const idx = tierIndexForLevel(level), cur = SHOP_TIERS[idx], next = SHOP_TIERS[idx + 1];
  if (!next) return <div className="mt-1.5 text-center text-[11px] font-black" style={{ color: "#a06bff" }}>{cur.emoji} {cur.name} — MAX shop! 🏆</div>;
  const span = next.min - cur.min, done = clamp(level - cur.min, 0, span), pct = Math.round((done / span) * 100), togo = next.min - level;
  return (<div className="mt-1.5 flex items-center gap-2 px-1">
    <span className="text-base leading-none">{cur.emoji}</span>
    <div className="flex-1 h-2.5 rounded-full bg-white/70 overflow-hidden" style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,.12)" }}><div style={{ width: pct + "%", height: "100%", background: "linear-gradient(90deg,#ffd93d,#ff7e1d)" }} /></div>
    <span className="text-base leading-none">{next.emoji}</span>
    <span className="text-[10px] font-black text-gray-500 whitespace-nowrap">{togo} 🍦 to go</span>
  </div>);
}

/* First-run coach card — short, friendly, spoken aloud for pre-readers. */
function IntroCoach({ onClose, speak }) {
  useEffect(() => { speak && speak("Welcome to Ishana's ice cream shop! Tap the answers to serve your customers, and earn coins to build the coolest shop!"); }, []); // eslint-disable-line
  return (<Overlay>
    <div className="text-[64px] leading-none my-1 bob">🍦</div>
    <h2 className="text-2xl font-black mb-1" style={{ color: "#ff5c93" }}>Hi, I'm Ishana!</h2>
    <div className="text-left text-sm font-bold text-gray-600 space-y-2 my-3">
      <div className="flex items-center gap-2"><span className="text-2xl">👆</span> Tap the answer to serve a customer.</div>
      <div className="flex items-center gap-2"><span className="text-2xl">🪙</span> Each happy customer gives you coins.</div>
      <div className="flex items-center gap-2"><span className="text-2xl">🏪</span> Spend coins to build the coolest shop!</div>
    </div>
    <button onClick={onClose} className="pulse-btn text-white text-xl font-black px-10 py-3 rounded-full shadow-xl active:scale-95" style={{ background: "linear-gradient(#ff7eb3,#ff5c93)" }}>Let's go! 🎉</button>
  </Overlay>);
}

/* Parental gate — a multiplication only a grown-up can solve quickly. Guards
   Settings and shop reset (App Store / Play Kids-category requirement). */
function ParentalGate({ onPass, onClose }) {
  const q = useMemo(() => { const a = randInt(3, 9), b = randInt(3, 9), ans = a * b; const o = new Set([ans]); while (o.size < 3) o.add(clamp(ans + randInt(-12, 12) || ans + 5, 6, 99)); return { a, b, ans, opts: [...o].sort(() => Math.random() - 0.5) }; }, []);
  const [wrong, setWrong] = useState(false);
  return (<Overlay>
    <h2 className="text-xl font-black mb-1" style={{ color: "#a06bff" }}>🔒 Grown-ups only</h2>
    <p className="text-sm font-bold text-gray-500 mb-3">Ask a grown-up to solve this:</p>
    <div className="text-3xl font-black mb-3" style={{ color: "#ff5c93" }}>{q.a} × {q.b} = ?</div>
    <div className="grid grid-cols-3 gap-2 mb-2">{q.opts.map((n) => <button key={n} onClick={() => (n === q.ans ? onPass() : (setWrong(true), setTimeout(() => setWrong(false), 600)))} className="rounded-2xl py-4 text-2xl font-black text-white shadow active:scale-90" style={{ background: "linear-gradient(#7ed9ff,#3aa0ff)" }}>{n}</button>)}</div>
    {wrong && <p className="text-sm font-black text-red-500 mb-1">Not quite — try again!</p>}
    <button onClick={onClose} className="mt-1 text-xs font-bold text-gray-400 underline">cancel</button>
  </Overlay>);
}
function SettingsToggle({ label, on, toggle }) { return <button onClick={toggle} className="w-full flex items-center justify-between rounded-2xl px-4 py-3 mb-2 shadow active:scale-95" style={{ background: "#fff", border: "3px solid #eee" }}><span className="font-black text-gray-700">{label}</span><span className="text-sm font-black px-3 py-1 rounded-full text-white" style={{ background: on ? "#7ed957" : "#bbb" }}>{on ? "ON" : "OFF"}</span></button>; }
function SettingsPage({ muted, setMuted, musicOn, setMusicOn, onPrivacy, onReset, onClose }) {
  return (<Overlay>
    <h2 className="text-2xl font-black mb-3" style={{ color: "#a06bff" }}>⚙️ Settings</h2>
    <SettingsToggle label="🔊 Sound effects" on={!muted} toggle={() => setMuted((m) => !m)} />
    <SettingsToggle label="🎵 Music" on={musicOn} toggle={() => setMusicOn((m) => !m)} />
    <button onClick={onPrivacy} className="w-full rounded-2xl px-4 py-3 mb-2 shadow font-black text-gray-700 active:scale-95" style={{ background: "#fff", border: "3px solid #eee" }}>🔐 Privacy Policy</button>
    <button onClick={onReset} className="w-full rounded-2xl px-4 py-3 mb-3 shadow font-black text-white active:scale-95" style={{ background: "#ff7e1d" }}>🗑️ Start a new shop</button>
    <button onClick={onClose} className="pulse-btn text-white text-lg font-black px-8 py-2.5 rounded-full shadow-xl active:scale-95" style={{ background: "linear-gradient(#ff7eb3,#ff5c93)" }}>Done</button>
  </Overlay>);
}
function PrivacyPage({ onClose }) {
  return (<Overlay>
    <h2 className="text-xl font-black mb-2" style={{ color: "#a06bff" }}>🔐 Privacy Policy</h2>
    <div className="text-left text-xs text-gray-600 space-y-2 mb-3 max-h-[42vh] overflow-y-auto pr-1">
      <p><b>Ishana's Shop</b> is made for children and respects your family's privacy.</p>
      <p>• We do <b>NOT</b> collect, store, or share any personal data.</p>
      <p>• There are <b>no ads</b> and <b>no in-app purchases</b>.</p>
      <p>• Progress is saved only on this device (local storage) — nothing is sent to any server.</p>
      <p>• No logins, no accounts, no third-party tracking or analytics.</p>
      <p>• The internet is used only once, to load the game files.</p>
    </div>
    <button onClick={onClose} className="pulse-btn text-white text-lg font-black px-8 py-2.5 rounded-full shadow-xl active:scale-95" style={{ background: "linear-gradient(#7ed957,#4caf2f)" }}>Back</button>
  </Overlay>);
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
  const [streak, setStreak] = useState(0);
  const [muted, setMuted] = useState(() => { try { return localStorage.getItem("ishana_muted") === "1"; } catch (e) { return false; } });
  const [musicOn, setMusicOn] = useState(() => { try { return localStorage.getItem("ishana_music") !== "0"; } catch (e) { return true; } });
  const [confirmReset, setConfirmReset] = useState(false);
  const [gateNext, setGateNext] = useState(null); // overlay/action to open after the parental gate passes
  const passGate = () => { const n = gateNext; setGateNext(null); if (n === "reset") { setOverlay(null); setConfirmReset(true); } else setOverlay(n); };
  useEffect(() => { sounds.setMuted(muted); try { localStorage.setItem("ishana_muted", muted ? "1" : "0"); } catch (e) {} }, [muted]); // eslint-disable-line
  useEffect(() => { try { localStorage.setItem("ishana_music", musicOn ? "1" : "0"); } catch (e) {} if (screen === "play" && !muted && musicOn) sounds.startMusic(); else sounds.stopMusic(); }, [screen, muted, musicOn]); // eslint-disable-line
  const timers = useRef([]); const modeHistory = useRef([]);
  const after = (ms, fn) => { const id = setTimeout(fn, ms); timers.current.push(id); return id; };
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => () => { clearTimers(); sounds.stopMusic(); }, []); // eslint-disable-line
  useEffect(() => { persist(save); }, [save]);

  const tierIdx = tierIndexForLevel(save.level);
  const world = WORLDS[tierIdx];

  useEffect(() => { if (screen !== "play") return; if (!save.seenIntro) { setOverlay("intro"); return; } if (save.daily.last !== today() && !overlay) { ovRef.current = {}; setOverlay("daily"); } }, [screen, overlay]); // eslint-disable-line

  const pickMode = () => { let pool = MODES.filter((m) => { if ((m === "speed" || m === "mega") && save.level < 4) return false; if (m === "memory" && save.level < 3) return false; return true; }); const last = modeHistory.current[modeHistory.current.length - 1]; pool = pool.filter((m) => m !== last); const c = rand(pool); modeHistory.current = [...modeHistory.current, c].slice(-4); return c; };
  const newRound = useCallback(() => {
    clearTimers(); setFeedback(null); setShowConfetti(false); setShowNyam(false); setBrainFreeze(false); setReward(null);
    let ev = null; const r = Math.random();
    if (r < 0.06) ev = { type: "golden", label: "✨ Golden Customer!", mult: 3 }; else if (r < 0.13) ev = { type: "double", label: "🪙 Double Coin Day!", mult: 2 }; else if (r < 0.18) ev = { type: "rainbow", label: "🌈 Rainbow Day!", mult: 1 };
    setEvent(ev);
    const ur = save.rares.filter((k) => RARES[k]); let cust;
    if (ur.length && Math.random() < 0.22) cust = { type: rand(ur), isRare: true, golden: false }; else cust = { type: rand(REGULARS), isRare: false, golden: ev && ev.type === "golden" };
    if (ev && ev.type === "golden") cust.golden = true; setCustomer(cust);
    setSave((s) => (s.met.includes(cust.type) ? s : { ...s, met: [...s.met, cust.type] }));
    setMode(pickMode()); setRoundKey((k) => k + 1);
  }, [save.rares, save.level]);


  const onMiss = useCallback(() => { if (feedback) return; setFeedback("wrong"); sounds.wrong(); setShake(true); setStreak(0); after(120, () => setShake(false)); after(650, () => setFeedback(null)); }, [feedback, sounds]);

  const runQueue = (q) => { if (!q.length) { newRound(); return; } const item = q[0]; const cont = () => { setOverlay(null); runQueue(q.slice(1)); }; ovRef.current = { ...item, onContinue: cont }; setOverlay(item.kind); force((n) => n + 1); if (item.kind === "mystery") sounds.mystery(); if (item.kind === "milestone") item.world ? sounds.fanfare() : sounds.upgrade(); if (item.kind === "rare") sounds.rare(); };
  function rollMysteryReward(raresArr, metArr) { const locked = RARE_KEYS.filter((k) => !raresArr.includes(k)); const pick = rand(["coins", "stars", "golden", locked.length ? "rare" : "coins"]); if (pick === "coins") { const c = randInt(40, 120); applyDelta({ coins: c }); return { emoji: "🪙", label: "+" + c + " Coins!" }; } if (pick === "stars") { const s = randInt(3, 8); applyDelta({ stars: s }); return { emoji: "⭐", label: "+" + s + " Stars!" }; } if (pick === "golden") { const c = randInt(80, 160); applyDelta({ coins: c }); return { emoji: "🏆", label: "Golden Bonus! +" + c }; } const rk = rand(locked); raresArr.push(rk); if (!metArr.includes(rk)) metArr.push(rk); return { emoji: CUSTOMER_INFO[rk].emoji, label: "New Friend: " + CUSTOMER_INFO[rk].name + "!" }; }
  const applyDelta = (d) => setSave((s) => ({ ...s, coins: s.coins + (d.coins || 0), stars: s.stars + (d.stars || 0) }));

  const onSolve = useCallback((opts = {}) => {
    if (feedback) return; setFeedback("correct");
    const themeBonus = 1 + THEMES.filter((t) => themeDone(save.owned, t)).length * 0.1;
    const helperItem = save.shop.helper && ITEM[save.shop.helper];
    const staffMult = helperItem ? 1 + ({ common: 0.08, rare: 0.15, epic: 0.25, legendary: 0.4, dream: 0.5 }[helperItem.rarity] || 0) : 1; // staff actually boost earnings
    const mult = (event ? event.mult : 1) * (customer.isRare ? 2 : 1), sb = streak >= 2 ? 1.5 : 1;
    const coinsGain = Math.round((10 + save.level * 2 + (opts.bonusCoins || 0) * 3) * mult * sb * themeBonus * staffMult);
    const starsGain = 1 + (streak > 0 && streak % 4 === 3 ? 1 : 0) + (customer.isRare ? 1 : 0);
    setReward({ coins: coinsGain, stars: starsGain }); setStreak((s) => s + 1);
    sounds.ding(); sounds.correct(); setShowConfetti(true); setShake(true);
    after(120, () => setShake(false)); after(380, () => { sounds.gulp(); setShowNyam(true); }); after(560, () => { sounds.yay(); sounds.coin(); });
    after(950, () => { setShowNyam(false); setBrainFreeze(true); }); after(1850, () => setBrainFreeze(false)); after(2050, () => setShowConfetti(false));
    after(2250, () => {
      const oldLevel = save.level, newLevel = oldLevel + 1, oldTier = tierIndexForLevel(oldLevel), newTier = tierIndexForLevel(newLevel);
      const newRares = [...save.rares], newMet = [...save.met], q = [];
      RARE_KEYS.forEach((rk) => { if (newLevel >= RARES[rk].unlockLevel && !newRares.includes(rk)) { newRares.push(rk); if (!newMet.includes(rk)) newMet.push(rk); q.push({ kind: "rare", customer: rk }); } });
      if (newTier > oldTier) q.push({ kind: "milestone", tierIdx: newTier, world: WORLDS[newTier] });
      if (newLevel % 5 === 0) q.push({ kind: "mystery", reward: rollMysteryReward(newRares, newMet) });
      // daily mission: serve MISSION_TARGET customers/day for a coin bonus
      const mToday = save.mission && save.mission.date === today();
      const served = (mToday ? save.mission.served : 0) + 1;
      const wasRewarded = mToday ? save.mission.rewarded : false;
      const hitGoal = !wasRewarded && served >= MISSION_TARGET;
      const missionBonus = hitGoal ? MISSION_BONUS : 0;
      if (hitGoal) q.push({ kind: "mystery", reward: { emoji: "🎯", label: "Daily Goal done! +" + MISSION_BONUS + " 🪙" } });
      setSave((s) => ({ ...s, level: newLevel, coins: s.coins + coinsGain + missionBonus, stars: s.stars + starsGain, xp: s.xp + 14, rares: newRares, met: newMet, best: Math.max(s.best, streak + 1), mission: { date: today(), served, rewarded: wasRewarded || hitGoal } }));
      runQueue(q);
    });
  }, [feedback, event, customer, streak, save, sounds, newRound]);

  const useItem = (i) => {
    const owned = save.owned.includes(i.id);
    if (!owned) { if (save.coins < i.cost) return; sounds.upgrade(); if (i.rarity === "epic" || i.rarity === "legendary") { sounds.rare(); setShowConfetti(true); after(1400, () => setShowConfetti(false)); } setSave((s) => { const ns = { ...s, coins: s.coins - i.cost, owned: [...s.owned, i.id] }; if (i.cat === "pet") ns.pet = i.id; else if (["dress", "shoes", "acc", "hat"].includes(i.cat)) ns.equipped = { ...s.equipped, [i.cat]: i.id }; return ns; }); return; }
    sounds.pop(); if (i.cat === "pet") setSave((s) => ({ ...s, pet: s.pet === i.id ? null : i.id })); else if (["dress", "shoes", "acc", "hat"].includes(i.cat)) setSave((s) => ({ ...s, equipped: { ...s.equipped, [i.cat]: s.equipped[i.cat] === i.id ? null : i.id } }));
  };
  const claimDaily = () => { if (save.daily.last === today()) { setOverlay(null); return; } const d = save.daily.day % DAILY_REWARDS.length, r = DAILY_REWARDS[d]; sounds.coin(); setSave((s) => { const ns = { ...s, daily: { last: today(), day: s.daily.day + 1 } }; if (r.coins) ns.coins = s.coins + r.coins; if (r.grant && !s.owned.includes(r.grant)) ns.owned = [...s.owned, r.grant]; return ns; }); setOverlay(null); };
  const startGame = () => { sounds.getCtx(); setScreen("play"); setTab("shop"); newRound(); };
  const resetGame = () => { const f = defaultSave(); setSave(f); persist(f); modeHistory.current = []; setStreak(0); setScreen("welcome"); setOverlay(null); };

  const ModeComp = MODE_COMPONENTS[mode]; const locked = !!feedback || !!overlay;

  return (
    <div className={"w-full flex justify-center " + (shake ? "screen-shake" : "")} style={{ height: "100dvh", overflow: "hidden", background: "linear-gradient(160deg,#fff0f6,#e7f9ff 55%,#fff7e6)", paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      <StyleKeyframes />
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-0">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="absolute float-slow" style={{ left: (i * 17.3 % 100) + "%", top: ((i * 29) % 100) + "%", animationDelay: (i % 5) * 0.6 + "s", opacity: 0.45 }}>{["⭐", "✨", "🍬", "🍦"][i % 4]}</div>)}</div>
      <Confetti show={showConfetti} />

      <div className="w-full max-w-md md:max-w-lg mx-auto relative z-10 flex flex-col" style={{ height: "100%" }}>
        {/* brain-freeze tint stays over the game column so it reads well on mobile */}
        {brainFreeze && (<div className="pointer-events-none absolute inset-0 z-30 rounded-[2rem] overflow-hidden" style={{ background: "rgba(80,170,255,0.22)" }}><div className="absolute left-1/2 -translate-x-1/2 text-2xl sm:text-3xl font-black text-sky-700 shiver text-center w-full px-2" style={{ top: "30%" }}>❄️ BRAIN FREEZE! ❄️</div></div>)}
        {screen === "welcome" && (
          <div className="flex-1 min-h-0 flex items-center justify-center p-3">
          <div className="relative rounded-[2rem] shadow-2xl w-full overflow-hidden flex flex-col items-center" style={{ height: "100%", border: "4px solid #ffd1e3", background: "linear-gradient(#cdefff,#ffe6f3)" }}>
            {/* clean pastel sky background */}
            <ImgOr src={ASSET.menu} className="absolute inset-0 w-full h-full object-cover" style={{ zIndex: 0 }} fallback={null} />
            {/* TOP: logo + tagline pill */}
            <div className="relative shrink-0 flex flex-col items-center pt-5 px-4" style={{ zIndex: 2 }}>
              <ImgOr src={ASSET.logo} className="drop-shadow-lg" style={{ height: 92, objectFit: "contain" }} fallback={<h1 className="text-4xl font-black" style={{ color: "#ff5c93", textShadow: "0 2px 8px #fff" }}>Ishana's Shop</h1>} />
              <div className="mt-2 px-4 py-1 rounded-full text-sm font-bold text-white shadow" style={{ background: "rgba(255,124,179,0.92)" }}>🍦 Build the coolest ice cream shop!</div>
            </div>
            {/* MIDDLE: Ishana hero (fills remaining space) */}
            <div className="relative flex-1 min-h-0 w-full flex items-end justify-center" style={{ zIndex: 2 }}>
              <ImgOr src={ishanaImg(save.equipped)} className="object-contain drop-shadow-xl" style={{ maxHeight: "98%", maxWidth: "80%" }} fallback={<FullIshana equipped={save.equipped} pet={save.pet} size={150} mood="idle" />} />
            </div>
            {/* BOTTOM: PLAY */}
            <div className="relative shrink-0 flex flex-col items-center pb-6" style={{ zIndex: 2 }}>
              <button onClick={startGame} className="pulse-btn inline-flex items-center gap-2 text-white text-3xl font-black px-12 py-5 rounded-full shadow-xl active:scale-95 transition" style={{ background: "linear-gradient(#ff7eb3,#ff5c93)" }}>▶ PLAY</button>
              <button onClick={() => { setGateNext("settings"); setOverlay("gate"); }} className="mt-3 inline-flex items-center gap-1 text-sm font-black text-gray-600 bg-white/80 rounded-full px-4 py-2 shadow active:scale-95">⚙️ Settings</button>
              {save.level > 1 && (<div className="mt-2 text-xs font-bold text-gray-600 bg-white/70 rounded-full px-3 py-1">Lv {save.level} · 🪙 {save.coins} · ⭐ {save.stars} · <button onClick={() => { setGateNext("reset"); setOverlay("gate"); }} className="underline">new shop</button></div>)}
            </div>
          </div>
          </div>
        )}

        {screen === "play" && (
          <div className="flex-1 min-h-0 flex flex-col p-2">
            <div className="shrink-0 mb-2">
              <div className="flex items-center justify-between gap-1 text-xs sm:text-sm">
                <div className="px-3 py-1.5 rounded-full font-black text-white shadow" style={{ background: "#8a5cff" }}>Lv {save.level}</div>
                <div className="px-3 py-1.5 rounded-full font-black bg-white shadow" style={{ color: "#f5a300" }}>⭐ {save.stars}</div>
                <div className="px-3 py-1.5 rounded-full font-black bg-white shadow text-base" style={{ color: "#ff9f1d", border: "2px solid #ffe09a" }}><span key={save.coins} className="inline-block coin-pop">🪙 {save.coins}</span></div>
                <button onClick={() => setMuted((m) => !m)} aria-label={muted ? "unmute" : "mute"} className="flex items-center justify-center rounded-full shadow active:scale-90" style={{ width: 44, height: 44, fontSize: 19, background: muted ? "#9aa3ad" : "#4dd0e1" }}>{muted ? "🔇" : "🔊"}</button>
                <button onClick={() => { ovRef.current = {}; setOverlay("daily"); }} aria-label="daily reward" className="flex items-center justify-center rounded-full shadow active:scale-90" style={{ width: 44, height: 44, fontSize: 21, background: "#ff7e1d" }}>🎁</button>
              </div>
              <ShopProgress level={save.level} />
              {(() => { const ms = save.mission && save.mission.date === today() ? save.mission.served : 0, done = ms >= MISSION_TARGET; return <div className="mt-1 text-center text-[11px] font-black" style={{ color: done ? "#4caf2f" : "#ff7e1d" }}>{done ? "🎯 Daily goal complete! 🎉" : "🎯 Daily goal: " + Math.min(ms, MISSION_TARGET) + "/" + MISSION_TARGET + " customers"}</div>; })()}
            </div>

            {/* main content fills remaining height; nav is in-flow below (no overlap) */}
            <div className="flex-1 min-h-0 relative">
              {tab === "shop" && (
                <div className="h-full flex flex-col min-h-0">
                  {event && <div className="shrink-0 mb-1 text-center text-xs font-black py-1 rounded-full text-white banner-pop" style={{ background: event.type === "rainbow" ? "linear-gradient(90deg,#ff5c93,#ffd93d,#7ed957,#4dd0e1,#a06bff)" : "#ff5c93" }}>{event.label}</div>}
                  {streak >= 2 && !feedback && <div className="shrink-0 mb-1 text-center text-xs font-black" style={{ color: "#ff7e1d" }}>🔥 Streak x{streak}!</div>}
                  <div className="flex-1 min-h-0">
                    <StorefrontScene tierIdx={tierIdx} world={world} shop={save.shop} placed={save.placed} equipped={save.equipped} pet={save.pet} ishanaMood={feedback === "correct" ? "cheer" : brainFreeze ? "freeze" : "idle"} customer={customer} customerHappy={feedback === "correct"} custKey={roundKey} freeze={brainFreeze} height="100%">
                      {showNyam && <div className="absolute left-1/2 -translate-x-1/2 text-5xl font-black nyam" style={{ top: "42%", zIndex: 9, color: "#ff3d77" }}>NYAM!</div>}
                      {reward && <div className="absolute top-2 right-2 text-right reward-float" style={{ zIndex: 9 }}><div className="text-lg font-black" style={{ color: "#ff9f1d" }}>+{reward.coins} 🪙</div><div className="text-md font-black" style={{ color: "#f5a300" }}>+{reward.stars} ⭐</div></div>}
                    </StorefrontScene>
                  </div>
                  <div className="shrink-0 flex items-center justify-between my-1.5 px-1"><span className="text-sm font-bold text-gray-500">{customer.isRare ? "✨ " : ""}{CUSTOMER_INFO[customer.type].name}</span><span className="text-xs font-black px-2 py-0.5 rounded-full text-white" style={{ background: "#4dd0e1" }}>{MODE_LABELS[mode]}</span></div>
                  <div className={"shrink-0 " + (shake && feedback === "wrong" ? "shake" : "")}><ModeComp key={roundKey} level={save.level} locked={locked} sounds={sounds} speak={sounds.speak} onSolve={onSolve} onMiss={onMiss} /></div>
                  {feedback === "wrong" && <p className="shrink-0 text-center mt-1 text-base font-black" style={{ color: "#ff7e1d" }}>😆 Oops! Try again!</p>}
                </div>
              )}
              {tab === "decorate" && <div className="h-full overflow-y-auto"><DecoratePage save={save} setSave={setSave} sounds={sounds} world={world} tierIdx={tierIdx} /></div>}
              {tab === "dressup" && <div className="h-full overflow-y-auto"><DressUpPage save={save} onUse={useItem} /></div>}
              {tab === "collection" && <div className="h-full overflow-y-auto"><CollectionPage save={save} /></div>}
            </div>

            {/* bottom nav — in-flow, never overlaps content */}
            <div className="shrink-0 flex justify-center pt-2">
              <div className="flex gap-1 px-2 py-1.5 rounded-[1.6rem] shadow-2xl bg-white/95 backdrop-blur" style={{ border: "3px solid #ffd1e3" }}>
                {[["shop", "🍦", "Serve"], ["decorate", "🏪", "Upgrade"], ["dressup", "👗", "Dress Up"], ["collection", "⭐", "Album"]].map(([id, e, label]) => { const act = tab === id; return (<button key={id} onClick={() => setTab(id)} className="flex flex-col items-center justify-center rounded-2xl px-2.5 py-1 active:scale-90 transition" style={{ background: act ? "linear-gradient(#ff7eb3,#ff5c93)" : "transparent" }}><span className="text-2xl leading-none">{e}</span><span className="text-[10px] font-black mt-0.5" style={{ color: act ? "#fff" : "#b08" }}>{label}</span></button>); })}
              </div>
            </div>
          </div>
        )}

        {overlay === "mystery" && <MysteryBox reward={ovRef.current.reward} sounds={sounds} onContinue={ovRef.current.onContinue} />}
        {overlay === "milestone" && <Milestone kind={ovRef.current.world ? "world" : "shop"} tierIdx={ovRef.current.tierIdx} world={ovRef.current.world} onContinue={ovRef.current.onContinue} />}
        {overlay === "rare" && <RareArrival customer={ovRef.current.customer} onContinue={ovRef.current.onContinue} />}
        {overlay === "daily" && <DailyReward day={save.daily.day % DAILY_REWARDS.length} claimed={save.daily.last === today()} onClaim={claimDaily} onClose={() => setOverlay(null)} />}
        {overlay === "intro" && <IntroCoach onClose={() => { setSave((s) => ({ ...s, seenIntro: true })); setOverlay(null); }} speak={sounds.speak} />}
        {overlay === "gate" && <ParentalGate onPass={passGate} onClose={() => { setOverlay(null); setGateNext(null); }} />}
        {overlay === "settings" && <SettingsPage muted={muted} setMuted={setMuted} musicOn={musicOn} setMusicOn={setMusicOn} onPrivacy={() => setOverlay("privacy")} onReset={() => { setOverlay(null); setConfirmReset(true); }} onClose={() => setOverlay(null)} />}
        {overlay === "privacy" && <PrivacyPage onClose={() => setOverlay("settings")} />}
        {confirmReset && (<Overlay><h2 className="text-2xl font-black mb-2" style={{ color: "#ff5c93" }}>Start a new shop?</h2><p className="text-sm font-bold text-gray-500 mb-4">This erases your level, coins, outfits and everything you built. Ask a grown-up first! 🧑‍🍼</p><div className="flex gap-3 justify-center"><button onClick={() => setConfirmReset(false)} className="text-base font-black px-6 py-3 rounded-full shadow active:scale-95" style={{ background: "#eee", color: "#777" }}>Keep my shop</button><button onClick={() => { setConfirmReset(false); resetGame(); }} className="text-base font-black text-white px-6 py-3 rounded-full shadow active:scale-95" style={{ background: "linear-gradient(#ff7eb3,#ff5c93)" }}>Start over</button></div></Overlay>)}
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
      @keyframes previewPulse {0%,100%{filter:brightness(1);outline-color:rgba(160,107,255,0)}50%{filter:brightness(1.12);outline-color:rgba(160,107,255,.9)}}
      .preview-pulse{outline:3px dashed rgba(160,107,255,0);outline-offset:2px;border-radius:10px;animation:previewPulse .9s ease-in-out infinite}
      @keyframes custEnter {0%{transform:translateX(60%) scale(.7);opacity:0}60%{transform:translateX(-4%) scale(1.04)}100%{transform:translateX(0) scale(1);opacity:1}}
      .cust-enter{animation:custEnter .55s cubic-bezier(.3,1.3,.5,1) both}
      @keyframes custHappy {0%,100%{transform:translateY(0) rotate(0)}30%{transform:translateY(-14px) rotate(-3deg)}60%{transform:translateY(-4px) rotate(3deg)}}
      .cust-happy{animation:custHappy .5s ease-in-out 2}
      @keyframes heartFloat {0%{transform:translateY(0) scale(.4);opacity:0}25%{opacity:1}100%{transform:translateY(-46px) scale(1.1);opacity:0}}
      .heart-float{animation:heartFloat 1.1s ease-out forwards}
      @keyframes petHop {0%,72%,100%{transform:translateY(0)}82%{transform:translateY(-12px)}90%{transform:translateY(0)}}
      .pet-hop{animation:petHop 2.6s ease-in-out infinite}
      @keyframes orderBob {0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
      .order-bob{animation:orderBob 1.6s ease-in-out infinite}
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
