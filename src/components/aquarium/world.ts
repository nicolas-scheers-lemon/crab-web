import {
  FISH,
  buildCrabSprite,
  buildFishSprites,
  buildShrimpSprite,
  buildCastleSprite,
  buildHermitSprite,
  buildCoralSprites,
  buildJellySprite,
  CASTLE_DOOR,
  type CoralKind,
  type FishKind,
  type Sprite,
} from "./sprites";

export type Vec = { x: number; y: number };

export type Fish = {
  kind: FishKind;
  sprite: Sprite;
  x: number;
  y: number;
  vx: number;
  vy: number;
  maxSpeed: number;
  cruise: number;
  heading: 1 | -1;
  /** Preferred swimming depth while wandering. */
  depth: number;
  phase: number;
  facing: 1 | -1;
  frame: number;
  tailTimer: number;
  /** Food pellet the fish is chasing; null while wandering. */
  target: Food | null;
};

export type Food = { x: number; y: number; vy: number; phase: number; eaten: boolean; age: number; landed: boolean };

type Bubble = { x: number; y: number; vy: number; phase: number; size: 1 | 2 };

type Plant = { x: number; height: number; phase: number; amp: number; dark: string; light: string };

type Rock = { x: number; rx: number; ry: number };

type Crab = {
  sprite: Sprite;
  x: number;
  dir: 1 | -1;
  walking: boolean;
  timer: number;
  frame: number;
  frameTimer: number;
};

type Shrimp = {
  sprite: Sprite;
  x: number;
  dir: 1 | -1;
  walking: boolean;
  timer: number;
  frame: number;
  frameTimer: number;
  /** Horizontal speed from a backward tail-flick dart; decays over time. */
  dartVx: number;
  /** Height above the sand during a dart, and its vertical velocity. */
  hop: number;
  hopV: number;
  /** Food pellet on the sand the shrimp is walking to. */
  target: Food | null;
};

type Spawner = { x: number; y: number; timer: number };

type Coral = { sprite: Sprite; x: number; y: number };

/** A single seagrass blade; blades are grouped in tufts along the sand. */
type GrassBlade = { x: number; height: number; phase: number; color: string };

type Castle = { sprite: Sprite; x: number; y: number; frame: number; frameTimer: number };

/**
 * home: inside the castle (eyes sometimes peek from the door)
 * emerging / entering: sitting in its shell in the doorway
 * out: wandering near the castle
 * returning: walking back to the door
 */
type HermitState = "home" | "emerging" | "out" | "returning" | "entering";

type Hermit = {
  sprite: Sprite;
  state: HermitState;
  x: number;
  dir: 1 | -1;
  walking: boolean;
  /** Time left in the current state. */
  timer: number;
  /** Time left in the current walk/pause while out. */
  stepTimer: number;
  frame: number;
  frameTimer: number;
  peeking: boolean;
  peekTimer: number;
};

/** Moon jelly drifting through the night aquarium. */
type Jelly = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  frame: number;
  pulseTimer: number;
  phase: number;
};

/** Bioluminescent plankton speck; flashes when a fish swims through it or food drops nearby. */
type Plankton = { x: number; y: number; vx: number; vy: number; phase: number; flash: number };

export type World = {
  night: boolean;
  W: number;
  H: number;
  scale: number;
  t: number;
  sandTop: number;
  surface: number[];
  background: HTMLCanvasElement;
  fishSprites: Record<FishKind, Sprite>;
  fish: Fish[];
  bubbles: Bubble[];
  food: Food[];
  plants: Plant[];
  rocks: Rock[];
  coralSprites: Record<CoralKind, Sprite>;
  corals: Coral[];
  grass: GrassBlade[];
  spawners: Spawner[];
  crab: Crab;
  shrimp: Shrimp;
  castle: Castle;
  hermit: Hermit;
  jellySprite: Sprite;
  jellies: Jelly[];
  plankton: Plankton[];
};

const DAY_POPULATION: [FishKind, number][] = [
  ["clown", 2],
  ["tang", 2],
  ["yellow", 3],
  ["tetra", 4],
  ["grouper", 1],
];

const NIGHT_POPULATION: [FishKind, number][] = [
  ["cardinal", 4],
  ["sweeper", 5],
  ["soldier", 2],
];

/** The whole scene is multiplied with this colour at night. */
const NIGHT_TINT = "#34428a";
const MOONLIGHT = "#c7d2fe";
const PLANKTON = "#5eead4";

const WATER = ["#2a8bc4", "#2379b0", "#1c679b", "#165686", "#114570", "#0d365c"];
const SAND_TOP = "#f5e6d0";
const SAND = ["#e8d4b8", "#dcbf9f"];
const SAND_SPECK = "#c9a77f";
const ROCK_LIGHT = "#8b95a5";
const ROCK_DARK = "#5b6474";
const BUBBLE = "#bfe6ff";
const GRASS = ["#65a30d", "#4d7c0f", "#84cc16", "#3f6212"];
const FOOD = ["#b45309", "#d97706"];
const MAX_FOOD = 40;
/** Seconds a pellet stays on the sand before it dissolves. */
const FOOD_LIFETIME_LANDED = 15;
/** How far (world pixels) a fish can spot food; fish further away keep wandering. */
const FOOD_SIGHT_RANGE = 60;
/** How far (world pixels) the shrimp notices food lying on the sand. */
const SHRIMP_SIGHT_RANGE = 40;
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/** Deterministic 0..1 noise so the sand texture stays stable between frames. */
function hash(x: number, y: number) {
  let n = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function createWorld(night = false): World {
  const fishSprites = buildFishSprites();
  return {
    night,
    W: 0,
    H: 0,
    scale: 1,
    t: 0,
    sandTop: 0,
    surface: [],
    background: document.createElement("canvas"),
    fishSprites,
    fish: [],
    bubbles: [],
    food: [],
    plants: [],
    rocks: [],
    coralSprites: buildCoralSprites(),
    corals: [],
    grass: [],
    spawners: [],
    crab: {
      sprite: buildCrabSprite(),
      x: 0,
      dir: 1,
      walking: true,
      timer: 3,
      frame: 0,
      frameTimer: 0,
    },
    shrimp: {
      sprite: buildShrimpSprite(),
      x: 0,
      dir: -1,
      walking: true,
      timer: 2,
      frame: 0,
      frameTimer: 0,
      dartVx: 0,
      hop: 0,
      hopV: 0,
      target: null,
    },
    castle: { sprite: buildCastleSprite(), x: 0, y: 0, frame: 0, frameTimer: 0 },
    hermit: {
      sprite: buildHermitSprite(),
      state: "home",
      x: 0,
      dir: 1,
      walking: false,
      timer: rand(2, 5),
      stepTimer: 0,
      frame: 0,
      frameTimer: 0,
      peeking: false,
      peekTimer: 1,
    },
    jellySprite: buildJellySprite(),
    jellies: [],
    plankton: [],
  };
}

const sandAt = (world: World, x: number) =>
  world.surface[clamp(Math.round(x), 0, world.surface.length - 1)];

const fishMinY = () => 4;
const fishMaxY = (world: World, f: Fish) => Math.max(fishMinY(), world.sandTop - f.sprite.h - 1);

export function resizeWorld(world: World, cssWidth: number, cssHeight: number) {
  const scale = Math.max(2, Math.round(Math.min(cssWidth, cssHeight) / 110));
  const W = Math.ceil(cssWidth / scale);
  const H = Math.ceil(cssHeight / scale);
  world.scale = scale;
  world.W = W;
  world.H = H;
  world.sandTop = H - Math.max(8, Math.round(H * 0.12));
  world.surface = Array.from(
    { length: W },
    (_, x) => world.sandTop + Math.round(Math.sin(x * 0.09) * 1.5 + Math.sin(x * 0.23 + 1) * 0.8),
  );

  layoutScenery(world);
  renderBackground(world);

  if (world.fish.length === 0) {
    for (const [kind, count] of world.night ? NIGHT_POPULATION : DAY_POPULATION) {
      for (let i = 0; i < count; i++) world.fish.push(spawnFish(world, kind));
    }
    world.crab.x = rand(0, W - world.crab.sprite.w);
    world.shrimp.x = rand(0, W - world.shrimp.sprite.w);
  }

  if (world.night) {
    const jellyCount = Math.max(2, Math.round(W / 90));
    while (world.jellies.length < jellyCount) world.jellies.push(spawnJelly(world));
    world.jellies.length = jellyCount;
    for (const j of world.jellies) {
      j.x = clamp(j.x, 0, W - world.jellySprite.w);
      j.y = clamp(j.y, 3, jellyMaxY(world));
    }
  }

  for (const f of world.fish) {
    f.x = clamp(f.x, 0, W - f.sprite.w);
    f.y = clamp(f.y, fishMinY(), fishMaxY(world, f));
    f.depth = clamp(f.depth, fishMinY(), fishMaxY(world, f));
  }
  world.crab.x = clamp(world.crab.x, 0, W - world.crab.sprite.w);
  world.shrimp.x = clamp(world.shrimp.x, 0, W - world.shrimp.sprite.w);
  if (world.hermit.state === "home") world.hermit.x = hermitDoorX(world);
  world.hermit.x = clamp(world.hermit.x, 0, W - world.hermit.sprite.w);
  world.bubbles = world.bubbles.filter((b) => b.x < W && b.y < H);
  world.food = world.food.filter((p) => p.x < W && p.y < H);
}

function spawnFish(world: World, kind: FishKind): Fish {
  const sprite = world.fishSprites[kind];
  const maxSpeed = FISH[kind].speed;
  const heading = Math.random() < 0.5 ? 1 : -1;
  const x = rand(0, world.W - sprite.w);
  const y = rand(fishMinY(), Math.max(fishMinY(), world.sandTop - sprite.h - 1));
  return {
    kind,
    sprite,
    x,
    y,
    vx: heading * maxSpeed * 0.5,
    vy: 0,
    maxSpeed,
    cruise: maxSpeed * rand(0.4, 0.8),
    heading,
    depth: y,
    phase: rand(0, Math.PI * 2),
    facing: heading,
    frame: 0,
    tailTimer: rand(0, 0.3),
    target: null,
  };
}

const jellyMaxY = (world: World) => Math.max(3, world.sandTop - world.jellySprite.h - 6);

function spawnJelly(world: World): Jelly {
  return {
    x: rand(0, world.W - world.jellySprite.w),
    y: rand(world.sandTop * 0.15, world.sandTop * 0.7),
    vx: rand(-1, 1),
    vy: 0,
    frame: 0,
    pulseTimer: rand(0, 2),
    phase: rand(0, Math.PI * 2),
  };
}

function layoutScenery(world: World) {
  const { W } = world;
  const waterDepth = world.sandTop;

  world.plankton = world.night
    ? Array.from({ length: Math.round((W * waterDepth) / 350) }, () => ({
        x: rand(0, W),
        y: rand(2, waterDepth - 2),
        vx: rand(-0.6, 0.6),
        vy: rand(-0.4, 0.4),
        phase: rand(0, Math.PI * 2),
        flash: 0,
      }))
    : [];

  const plantCount = Math.max(3, Math.round(W / 32));
  world.plants = Array.from({ length: plantCount }, (_, i) => {
    const slot = W / plantCount;
    const dark = i % 2 ? "#166534" : "#15803d";
    return {
      x: Math.round(slot * i + rand(slot * 0.2, slot * 0.8)),
      height: Math.round(rand(waterDepth * 0.25, waterDepth * 0.6)),
      phase: rand(0, Math.PI * 2),
      amp: rand(1.5, 3),
      dark,
      light: i % 2 ? "#22c55e" : "#4ade80",
    };
  });

  const castle = world.castle;
  castle.x = Math.round(clamp(W * 0.7 - castle.sprite.w / 2, 0, W - castle.sprite.w));
  castle.y = sandAt(world, castle.x + castle.sprite.w / 2) - castle.sprite.h + 3;
  const castleLeft = castle.x;
  const castleRight = castle.x + castle.sprite.w;

  const rockCount = Math.max(1, Math.round(W / 110));
  world.rocks = Array.from({ length: rockCount }, (_, i) => {
    const rx = Math.round(rand(4, 7));
    let x = Math.round((W / rockCount) * (i + 0.5) + rand(-10, 10));
    // Keep rocks out from under the castle.
    if (x + rx + 2 > castleLeft && x - rx - 2 < castleRight) {
      x = castleLeft - rx - 3 >= rx ? castleLeft - rx - 3 : castleRight + rx + 3;
    }
    return { x, rx, ry: Math.round(rand(3, 4)) };
  });

  // Corals: placed at random spots that don't overlap the castle, rocks or each other.
  const taken: [number, number][] = [
    [castleLeft - 2, castleRight + 2],
    ...world.rocks.map((r): [number, number] => [r.x - r.rx - 1, r.x + r.rx + 1]),
  ];
  const kinds = (Object.keys(world.coralSprites) as CoralKind[]).sort(() => Math.random() - 0.5);
  const coralCount = Math.max(2, Math.round(W / 45));
  world.corals = [];
  for (let i = 0; i < coralCount; i++) {
    const sprite = world.coralSprites[kinds[i % kinds.length]];
    for (let attempt = 0; attempt < 15; attempt++) {
      const x = Math.round(rand(0, W - sprite.w));
      if (taken.some(([a, b]) => x < b && x + sprite.w > a)) continue;
      taken.push([x - 1, x + sprite.w + 1]);
      world.corals.push({ sprite, x, y: sandAt(world, x + sprite.w / 2) - sprite.h + 2 });
      break;
    }
  }

  // Seagrass: small tufts all along the bottom, leaving the castle door free for the hermit.
  const doorCenter = castle.x + CASTLE_DOOR.x;
  world.grass = [];
  for (let i = 0, tufts = Math.round(W / 10); i < tufts; i++) {
    const cx = Math.round(rand(0, W - 1));
    if (Math.abs(cx - doorCenter) < 5) continue;
    for (let b = 0, blades = 3 + Math.floor(Math.random() * 3); b < blades; b++) {
      world.grass.push({
        x: clamp(cx + Math.round(rand(-2, 2)), 0, W - 1),
        height: Math.round(rand(3, 7)),
        phase: rand(0, Math.PI * 2),
        color: GRASS[Math.floor(Math.random() * GRASS.length)],
      });
    }
  }

  world.spawners = world.rocks.map((r) => ({
    x: r.x,
    y: sandAt(world, r.x) - r.ry,
    timer: rand(0, 1),
  }));
}

function renderBackground(world: World) {
  const { W, H, sandTop } = world;
  const canvas = world.background;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(W, H);
  const water = WATER.map(hexToRgb);
  const sandTopRgb = hexToRgb(SAND_TOP);
  const sand = SAND.map(hexToRgb);
  const speck = hexToRgb(SAND_SPECK);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const surface = world.surface[x];
      const threshold = BAYER[y % 4][x % 4] / 16;
      let rgb: [number, number, number];
      if (y < surface) {
        const f = (y / sandTop) * (water.length - 1);
        const i = Math.min(water.length - 2, Math.floor(f));
        rgb = f - i > threshold ? water[i + 1] : water[i];
      } else if (y === surface) {
        rgb = sandTopRgb;
      } else {
        const n = hash(x, y);
        rgb = n > 0.93 ? speck : n > 0.5 + ((y - surface) / (H - surface)) * 0.3 ? sand[1] : sand[0];
      }
      const o = (y * W + x) * 4;
      img.data[o] = rgb[0];
      img.data[o + 1] = rgb[1];
      img.data[o + 2] = rgb[2];
      img.data[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  for (const rock of world.rocks) {
    const cy = sandAt(world, rock.x) + 1;
    for (let dy = -rock.ry; dy <= 1; dy++) {
      const half = Math.round(rock.rx * Math.sqrt(Math.max(0, 1 - (dy / rock.ry) ** 2)));
      ctx.fillStyle = dy < -rock.ry / 2 ? ROCK_LIGHT : ROCK_DARK;
      ctx.fillRect(rock.x - half, cy + dy, half * 2 + 1, 1);
    }
  }
}

/** Drop a few food pellets around a point (world pixels). */
export function dropFood(world: World, point: Vec) {
  const count = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    world.food.push({
      x: clamp(point.x + rand(-3, 3), 1, world.W - 2),
      y: clamp(point.y + rand(-2, 2), 1, world.sandTop - 2),
      vy: rand(3, 5),
      phase: rand(0, Math.PI * 2),
      eaten: false,
      age: 0,
      landed: false,
    });
  }
  if (world.food.length > MAX_FOOD) world.food.splice(0, world.food.length - MAX_FOOD);
  for (const p of world.plankton) {
    if (Math.hypot(p.x - point.x, p.y - point.y) < 10) p.flash = 1;
  }
}

function updateFood(world: World, dt: number) {
  for (const p of world.food) {
    if (p.landed) {
      p.age += dt;
      if (p.age > FOOD_LIFETIME_LANDED) p.eaten = true;
      continue;
    }
    p.y += p.vy * dt;
    p.x = clamp(p.x + Math.sin(world.t * 2 + p.phase) * 1.5 * dt, 1, world.W - 2);
    const floor = sandAt(world, p.x) - 1;
    if (p.y >= floor) {
      p.y = floor;
      p.landed = true;
    }
  }
  world.food = world.food.filter((p) => !p.eaten);
}

function nearestFood(world: World, x: number, y: number): Food | null {
  let best: Food | null = null;
  let bestDist = FOOD_SIGHT_RANGE;
  for (const p of world.food) {
    if (p.eaten) continue;
    const d = Math.hypot(p.x - x, p.y - y);
    if (d < bestDist) {
      bestDist = d;
      best = p;
    }
  }
  return best;
}

export function updateWorld(world: World, dt: number) {
  world.t += dt;
  updateFood(world, dt);
  for (const f of world.fish) updateFish(world, f, dt);
  updateCrab(world, dt);
  updateShrimp(world, dt);
  updateCastle(world, dt);

  for (const s of world.spawners) {
    s.timer -= dt;
    if (s.timer <= 0) {
      s.timer = rand(0.25, 0.9);
      world.bubbles.push({
        x: s.x + rand(-1, 1),
        y: s.y,
        vy: rand(8, 14),
        phase: rand(0, Math.PI * 2),
        size: Math.random() < 0.3 ? 2 : 1,
      });
    }
  }

  for (const b of world.bubbles) b.y -= b.vy * dt;
  world.bubbles = world.bubbles.filter((b) => b.y > 1);

  if (world.night) {
    for (const j of world.jellies) updateJelly(world, j, dt);
    updatePlankton(world, dt);
  }
}

function updateJelly(world: World, j: Jelly, dt: number) {
  const maxY = jellyMaxY(world);
  j.pulseTimer -= dt;
  if (j.pulseTimer <= 0) {
    // Contract the bell: a short upward stroke, pulsing more often when sinking too low.
    j.vy = -rand(4, 7);
    j.frame = 1;
    j.pulseTimer = j.y > maxY - 4 ? rand(0.6, 1) : rand(1.5, 3.5);
  }
  if (j.frame === 1 && j.vy > -1.5) j.frame = 0;
  j.vy = Math.min(1.5, j.vy + 3 * dt);
  j.y = clamp(j.y + j.vy * dt, 3, maxY);

  const maxX = world.W - world.jellySprite.w;
  j.x += (j.vx + Math.sin(world.t * 0.4 + j.phase) * 1.5) * dt;
  if (j.x < 0 || j.x > maxX) {
    j.x = clamp(j.x, 0, maxX);
    j.vx = -j.vx;
  }
}

function updatePlankton(world: World, dt: number) {
  const { W, sandTop } = world;
  for (const p of world.plankton) {
    p.x += (p.vx + Math.sin(world.t * 0.5 + p.phase) * 0.5) * dt;
    p.y += p.vy * dt;
    if (p.x < 0) p.x += W;
    if (p.x >= W) p.x -= W;
    if (p.y < 2 || p.y > sandTop - 2) p.vy = -p.vy;
    p.flash = Math.max(0, p.flash - dt * 1.2);
    for (const f of world.fish) {
      if (p.x >= f.x - 1 && p.x <= f.x + f.sprite.w + 1 && p.y >= f.y - 1 && p.y <= f.y + f.sprite.h + 1) {
        p.flash = 1;
        break;
      }
    }
  }
}

function updateFish(world: World, f: Fish, dt: number) {
  const { W } = world;
  const { w, h } = f.sprite;
  const minY = fishMinY();
  const maxY = fishMaxY(world, f);
  // Fish may dip down to the sand line (to reach food on the bottom); wandering pulls them back up gently.
  const floorY = Math.max(minY, world.sandTop - h + 1);
  let desiredX = 0;
  let desiredY = 0;

  if (f.target?.eaten) f.target = null;
  // React to food with a small random delay, and now and then switch to a closer pellet.
  if (world.food.length > 0 && Math.random() < dt * (f.target ? 1 : 3)) {
    // Once a fish has spotted food it keeps chasing it, even if the pellet sinks out of sight range.
    f.target = nearestFood(world, f.x + w / 2, f.y + h / 2) ?? f.target;
  }

  if (f.target) {
    const food = f.target;
    const mouthX = f.facing === 1 ? f.x + w : f.x;
    const mouthY = f.y + h / 2;

    const inReach =
      food.x >= f.x - 2 &&
      food.x <= f.x + w + 2 &&
      food.y >= f.y - 2 &&
      food.y <= f.y + h + 2 &&
      (f.facing === 1 ? food.x >= f.x + w / 2 : food.x <= f.x + w / 2);

    if (inReach) {
      food.eaten = true;
      f.target = null;
      world.bubbles.push({ x: mouthX, y: mouthY, vy: rand(6, 10), phase: rand(0, Math.PI * 2), size: 1 });
    } else {
      const dx = food.x - mouthX;
      const dy = food.y - mouthY;
      const dist = Math.hypot(dx, dy) || 1;
      const speed = f.maxSpeed * 1.4;
      desiredX = (dx / dist) * speed;
      desiredY = (dy / dist) * speed;
    }
    if (!f.target) f.heading = f.vx >= 0 ? 1 : -1;
  }

  if (!f.target) {
    if (Math.random() < dt * 0.08) f.heading = f.heading === 1 ? -1 : 1;
    if (Math.random() < dt * 0.2) f.cruise = f.maxSpeed * rand(0.35, 0.85);
    if (Math.random() < dt * 0.1) f.depth = rand(minY, maxY);
    if (f.x < 2) f.heading = 1;
    if (f.x > W - w - 2) f.heading = -1;
    desiredX = f.heading * f.cruise;
    desiredY =
      clamp((f.depth - f.y) * 0.5, -f.cruise * 0.5, f.cruise * 0.5) +
      Math.sin(world.t * 1.3 + f.phase) * f.cruise * 0.25;
  }

  const k = Math.min(1, dt * (f.target ? 3 : 2));
  f.vx += (desiredX - f.vx) * k;
  f.vy += (desiredY - f.vy) * k;
  f.x = clamp(f.x + f.vx * dt, 0, W - w);
  f.y = clamp(f.y + f.vy * dt, minY, floorY);

  if (f.vx > 0.3) f.facing = 1;
  else if (f.vx < -0.3) f.facing = -1;

  f.tailTimer += dt * (1 + Math.abs(f.vx) * 0.15);
  if (f.tailTimer > 0.3) {
    f.tailTimer = 0;
    f.frame = (f.frame + 1) % f.sprite.right.length;
  }

  if (Math.random() < dt * 0.05) {
    world.bubbles.push({
      x: f.facing === 1 ? f.x + w : f.x - 1,
      y: f.y + h / 2,
      vy: rand(6, 10),
      phase: rand(0, Math.PI * 2),
      size: 1,
    });
  }
}

function updateCrab(world: World, dt: number) {
  const crab = world.crab;
  crab.timer -= dt;
  if (crab.timer <= 0) {
    crab.walking = !crab.walking;
    crab.timer = crab.walking ? rand(2, 6) : rand(1, 3);
    if (crab.walking && Math.random() < 0.5) crab.dir = crab.dir === 1 ? -1 : 1;
  }
  if (!crab.walking) return;

  crab.x += crab.dir * 6 * dt;
  const maxX = world.W - crab.sprite.w;
  if (crab.x <= 0 || crab.x >= maxX) {
    crab.x = clamp(crab.x, 0, maxX);
    crab.dir = crab.dir === 1 ? -1 : 1;
  }
  crab.frameTimer += dt;
  if (crab.frameTimer > 0.15) {
    crab.frameTimer = 0;
    crab.frame = (crab.frame + 1) % crab.sprite.right.length;
  }
}

function updateShrimp(world: World, dt: number) {
  const s = world.shrimp;
  const { w } = s.sprite;
  const maxX = world.W - w;
  const mouthX = () => (s.dir === 1 ? s.x + w : s.x);

  if (s.target?.eaten) s.target = null;
  if (!s.target && Math.random() < dt * 2) {
    let bestDist = SHRIMP_SIGHT_RANGE;
    for (const p of world.food) {
      const d = Math.abs(p.x - mouthX());
      if (p.landed && !p.eaten && d < bestDist) {
        bestDist = d;
        s.target = p;
      }
    }
  }

  let speed = 0;
  if (s.target) {
    const dx = s.target.x - mouthX();
    if (Math.abs(dx) < 1.5) {
      s.target.eaten = true;
      s.target = null;
      s.walking = false;
      s.timer = rand(1, 2);
    } else {
      s.dir = dx > 0 ? 1 : -1;
      speed = 10;
    }
  } else {
    s.timer -= dt;
    if (s.timer <= 0) {
      s.walking = !s.walking;
      s.timer = s.walking ? rand(1.5, 4) : rand(1, 3);
      if (s.walking && Math.random() < 0.5) s.dir = s.dir === 1 ? -1 : 1;
    }
    if (s.walking) speed = 5;
    // Now and then flick the tail and dart backwards.
    if (s.hop === 0 && Math.random() < dt * 0.04) {
      s.dartVx = -s.dir * 35;
      s.hopV = 14;
    }
  }

  s.x += (s.dir * speed + s.dartVx) * dt;
  s.dartVx *= Math.exp(-dt * 4);
  if (Math.abs(s.dartVx) < 0.5) s.dartVx = 0;
  if (s.hopV !== 0 || s.hop > 0) {
    s.hop += s.hopV * dt;
    s.hopV -= 40 * dt;
    if (s.hop <= 0) {
      s.hop = 0;
      s.hopV = 0;
    }
  }
  if (s.x <= 0 || s.x >= maxX) {
    s.x = clamp(s.x, 0, maxX);
    s.dartVx = 0;
    if (!s.target) s.dir = s.x <= 0 ? 1 : -1;
  }

  if (speed > 0) {
    s.frameTimer += dt;
    if (s.frameTimer > 0.12) {
      s.frameTimer = 0;
      s.frame = (s.frame + 1) % s.sprite.right.length;
    }
  }
}

/** Hermit x position (left edge) when standing in the castle doorway. */
const hermitDoorX = (world: World) =>
  world.castle.x + CASTLE_DOOR.x + 0.5 - world.hermit.sprite.w / 2;

const HERMIT_RANGE = 30;
const HERMIT_RETRACTED = 2;

function updateCastle(world: World, dt: number) {
  const castle = world.castle;
  castle.frameTimer += dt;
  if (castle.frameTimer > 0.4) {
    castle.frameTimer = 0;
    castle.frame = (castle.frame + 1) % castle.sprite.right.length;
  }

  const hm = world.hermit;
  const doorX = hermitDoorX(world);
  hm.timer -= dt;

  switch (hm.state) {
    case "home":
      hm.x = doorX;
      hm.peekTimer -= dt;
      if (hm.peekTimer <= 0) {
        hm.peeking = !hm.peeking;
        hm.peekTimer = hm.peeking ? rand(1, 2.5) : rand(1.5, 4);
      }
      if (hm.timer <= 0) {
        hm.state = "emerging";
        hm.peeking = false;
        hm.timer = rand(0.8, 1.5);
      }
      return;
    case "emerging":
      hm.frame = HERMIT_RETRACTED;
      if (hm.timer <= 0) {
        hm.state = "out";
        hm.timer = rand(8, 16);
        hm.stepTimer = 0;
        hm.frame = 0;
      }
      return;
    case "entering":
      hm.frame = HERMIT_RETRACTED;
      if (hm.timer <= 0) {
        hm.state = "home";
        hm.timer = rand(5, 12);
        hm.peekTimer = rand(1, 3);
      }
      return;
    case "out":
      hm.stepTimer -= dt;
      if (hm.stepTimer <= 0) {
        hm.walking = !hm.walking;
        hm.stepTimer = hm.walking ? rand(1.5, 4) : rand(1, 2.5);
        if (hm.walking) hm.dir = Math.random() < 0.5 ? 1 : -1;
      }
      // Stay near home.
      if (hm.x < doorX - HERMIT_RANGE) hm.dir = 1;
      if (hm.x > doorX + HERMIT_RANGE) hm.dir = -1;
      if (hm.timer <= 0) hm.state = "returning";
      break;
    case "returning":
      hm.walking = true;
      hm.dir = doorX > hm.x ? 1 : -1;
      if (Math.abs(doorX - hm.x) < 0.5) {
        hm.x = doorX;
        hm.state = "entering";
        hm.timer = rand(0.6, 1);
        return;
      }
      break;
  }

  if (hm.walking) {
    const maxX = world.W - hm.sprite.w;
    hm.x = clamp(hm.x + hm.dir * 4 * dt, 0, maxX);
    if (hm.state === "out" && (hm.x <= 0 || hm.x >= maxX)) hm.dir = hm.x <= 0 ? 1 : -1;
    hm.frameTimer += dt;
    if (hm.frameTimer > 0.18) {
      hm.frameTimer = 0;
      hm.frame = hm.frame === 0 ? 1 : 0;
    }
  } else {
    hm.frame = 0;
  }
}

export function drawWorld(ctx: CanvasRenderingContext2D, world: World) {
  const { W, t } = world;
  ctx.drawImage(world.background, 0, 0);

  // Light rays
  ctx.fillStyle = "#ffffff";
  ctx.globalAlpha = 0.05;
  for (let i = 0; i < 3; i++) {
    const baseX = (W / 3) * i + W / 8 + Math.sin(t * 0.3 + i * 2) * 4;
    for (let y = 0; y < world.sandTop; y++) {
      ctx.fillRect(Math.round(baseX + y * 0.35), y, 4 + (i % 2) * 2, 1);
    }
  }
  ctx.globalAlpha = 1;

  // Water surface shimmer
  ctx.fillStyle = "#7dd3fc";
  ctx.globalAlpha = 0.5;
  for (let x = 0; x < W; x++) {
    const wave = Math.sin(x * 0.25 + t * 2) > 0.3 ? 2 : 1;
    ctx.fillRect(x, 0, 1, wave);
  }
  ctx.globalAlpha = 1;

  // Seaweed
  for (const p of world.plants) {
    const base = sandAt(world, p.x);
    for (let i = 0; i < p.height; i++) {
      const sway = Math.round(Math.sin(t * 1.2 + p.phase + i * 0.25) * p.amp * (i / p.height));
      const x = p.x + sway;
      const y = base - i;
      ctx.fillStyle = Math.floor(i / 3) % 2 ? p.light : p.dark;
      ctx.fillRect(x, y, 2, 1);
      if (i > 2 && i % 5 === 0) {
        ctx.fillStyle = p.light;
        ctx.fillRect(i % 10 === 0 ? x + 2 : x - 2, y, 2, 1);
      }
    }
  }

  // Corals
  for (const c of world.corals) ctx.drawImage(c.sprite.right[0], c.x, c.y);

  // Sandcastle, with the hermit's eyes peeking from the doorway when it's home
  const castle = world.castle;
  ctx.drawImage(castle.sprite.right[castle.frame], castle.x, castle.y);
  if (world.hermit.state === "home" && world.hermit.peeking) {
    const eyeY = castle.y + castle.sprite.h - 4;
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(castle.x + CASTLE_DOOR.x - 1, eyeY, 1, 1);
    ctx.fillRect(castle.x + CASTLE_DOOR.x + 1, eyeY, 1, 1);
  }

  // Food
  for (const p of world.food) {
    ctx.fillStyle = FOOD[Math.floor(p.phase * 10) % FOOD.length];
    ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
  }

  // Bubbles
  ctx.fillStyle = BUBBLE;
  for (const b of world.bubbles) {
    const x = Math.round(b.x + Math.sin(t * 3 + b.phase) * 0.8);
    const y = Math.round(b.y);
    if (b.size === 1) {
      ctx.fillRect(x, y, 1, 1);
    } else {
      ctx.fillRect(x, y - 1, 1, 1);
      ctx.fillRect(x - 1, y, 1, 1);
      ctx.fillRect(x + 1, y, 1, 1);
      ctx.fillRect(x, y + 1, 1, 1);
    }
  }

  // Fish, largest first so small fish swim in front
  const fish = [...world.fish].sort((a, b) => b.sprite.w - a.sprite.w);
  for (const f of fish) {
    const frames = f.facing === 1 ? f.sprite.right : f.sprite.left;
    ctx.drawImage(frames[f.frame], Math.round(f.x), Math.round(f.y));
  }

  // Moon jellies (night only), slightly see-through
  const jelly = world.jellySprite;
  ctx.globalAlpha = 0.85;
  for (const j of world.jellies) {
    // Frame 1 is the contracted stroke; while relaxed the tentacles sway between frames 0 and 2.
    const frame = j.frame === 1 ? 1 : Math.floor(t * 1.5 + j.phase) % 2 ? 2 : 0;
    ctx.drawImage(jelly.right[frame], Math.round(j.x), Math.round(j.y));
  }
  ctx.globalAlpha = 1;

  // Seagrass, in front of fish dipping down for food
  for (const g of world.grass) {
    const base = sandAt(world, g.x);
    ctx.fillStyle = g.color;
    for (let i = 0; i < g.height; i++) {
      const sway = Math.round(Math.sin(t * 1.5 + g.phase) * (i / g.height) * 1.3);
      ctx.fillRect(g.x + sway, base - i, 1, 1);
    }
  }

  // Crab
  const crab = world.crab;
  const crabY = sandAt(world, crab.x + crab.sprite.w / 2) - crab.sprite.h + 2;
  ctx.drawImage(crab.sprite.right[crab.frame], Math.round(crab.x), Math.round(crabY));

  // Shrimp
  const shrimp = world.shrimp;
  const shrimpY = sandAt(world, shrimp.x + shrimp.sprite.w / 2) - shrimp.sprite.h + 1 - shrimp.hop;
  const shrimpFrames = shrimp.dir === 1 ? shrimp.sprite.right : shrimp.sprite.left;
  ctx.drawImage(shrimpFrames[shrimp.frame], Math.round(shrimp.x), Math.round(shrimpY));

  // Hermit crab (hidden while inside the castle)
  const hermit = world.hermit;
  if (hermit.state !== "home") {
    const hermitY = sandAt(world, hermit.x + hermit.sprite.w / 2) - hermit.sprite.h + 1;
    const hermitFrames = hermit.dir === 1 ? hermit.sprite.right : hermit.sprite.left;
    ctx.drawImage(hermitFrames[hermit.frame], Math.round(hermit.x), Math.round(hermitY));
  }

  if (world.night) drawNight(ctx, world);
}

/** Soft halo around a single bright pixel; expects the "lighter" composite mode. */
function drawGlow(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, strength: number) {
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.12 * strength;
  ctx.fillRect(x - 2, y - 1, 5, 3);
  ctx.fillRect(x - 1, y - 2, 3, 5);
  ctx.globalAlpha = 0.3 * strength;
  ctx.fillRect(x - 1, y - 1, 3, 3);
  ctx.globalAlpha = strength;
  ctx.fillRect(x, y, 1, 1);
}

/** Darken the day scene to moonlight, then draw everything that glows on top. */
function drawNight(ctx: CanvasRenderingContext2D, world: World) {
  const { W, H, t } = world;

  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = NIGHT_TINT;
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = "source-over";

  // Moonbeam and moonlit surface
  ctx.fillStyle = MOONLIGHT;
  ctx.globalAlpha = 0.05;
  const beamX = W * 0.25 + Math.sin(t * 0.2) * 3;
  for (let y = 0; y < world.sandTop; y++) {
    ctx.fillRect(Math.round(beamX + y * 0.25), y, 7, 1);
  }
  ctx.globalAlpha = 0.4;
  for (let x = 0; x < W; x++) {
    if (Math.sin(x * 0.25 + t * 2) > 0.6) ctx.fillRect(x, 0, 1, 1);
  }

  // Food pellets catch a little moonlight so you can see where you fed.
  ctx.globalAlpha = 0.25;
  for (const p of world.food) {
    ctx.fillStyle = FOOD[Math.floor(p.phase * 10) % FOOD.length];
    ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
  }

  ctx.globalCompositeOperation = "lighter";

  // Plankton
  ctx.fillStyle = PLANKTON;
  for (const p of world.plankton) {
    const twinkle = Math.sin(t * 2 + p.phase) * 0.5 + 0.5;
    const x = Math.round(p.x);
    const y = Math.round(p.y);
    if (p.flash > 0.2) {
      drawGlow(ctx, x, y, PLANKTON, p.flash);
      ctx.fillStyle = PLANKTON;
    } else {
      ctx.globalAlpha = 0.12 + twinkle * 0.25;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  // The hermit's eyes shine from the dark doorway
  if (world.hermit.state === "home" && world.hermit.peeking) {
    const castle = world.castle;
    const eyeY = castle.y + castle.sprite.h - 4;
    ctx.fillStyle = "#f8fafc";
    ctx.globalAlpha = 0.7;
    ctx.fillRect(castle.x + CASTLE_DOOR.x - 1, eyeY, 1, 1);
    ctx.fillRect(castle.x + CASTLE_DOOR.x + 1, eyeY, 1, 1);
  }

  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
}

/** Convert a pointer position on the canvas to world pixel coordinates. */
export function screenToWorld(world: World, canvas: HTMLCanvasElement, clientX: number, clientY: number): Vec {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (clientX - rect.left) / world.scale,
    y: (clientY - rect.top) / world.scale,
  };
}
