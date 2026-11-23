// Pixel-art sprites. Each character is one pixel: '.' is transparent,
// any other character is looked up in PALETTE. Fish face right.

export const PALETTE: Record<string, string> = {
  k: "#111827",
  w: "#f8fafc",
  o: "#f97316",
  b: "#3b82f6",
  d: "#1e3a8a",
  y: "#facc15",
  a: "#f59e0b",
  p: "#8b5cf6",
  l: "#c4b5fd",
  P: "#4c1d95",
  r: "#ef4444",
  R: "#991b1b",
  c: "#22d3ee",
  g: "#fda4af",
  G: "#e11d48",
  s: "#efdcbf",
  S: "#d9bd94",
  z: "#b8956a",
  D: "#3b2a1a",
  u: "#e9c9a0",
  U: "#a0703c",
  m: "#fb7185",
  M: "#be123c",
  q: "#fb923c",
  Q: "#c2410c",
  v: "#a855f7",
  V: "#6b21a8",
  n: "#d9a066",
  N: "#a16207",
};

type FishDef = {
  rows: string[];
  /** Number of columns (from the left) that make up the tail; animated by shifting them. */
  tail: number;
  /** Cruise speed in world pixels per second. */
  speed: number;
};

export const FISH = {
  clown: {
    tail: 3,
    speed: 11,
    rows: [
      "....kkk.....",
      "k..owooow...",
      "kk.owooowoo.",
      "kooowooowoko",
      "kk.owooowooo",
      "k..owooow...",
      "....kk......",
    ],
  },
  tang: {
    tail: 3,
    speed: 10,
    rows: [
      "......ddd.....",
      "....ddbbbbd...",
      "yy.dbbbbbbbbd.",
      "yyydbbdddbbbkb",
      "yyydbbbbdddbbb",
      "yy.dbbbbbbbbd.",
      "....ddbbbbd...",
      "......ddd.....",
    ],
  },
  yellow: {
    tail: 2,
    speed: 14,
    rows: ["...yy..", "y.yyyy.", "yyyyyky", "y.ayyy.", "...aa.."],
  },
  tetra: {
    tail: 2,
    speed: 16,
    rows: ["c..cccc.", "ccrrrrkc", "c..rrrr."],
  },
  grouper: {
    tail: 3,
    speed: 5,
    rows: [
      "........PPPP........",
      "......PPppppP.......",
      "P...PPpppppppP......",
      "PP.PpppppppppppP....",
      "PPPppppppppppwkpp...",
      "PPpppplllllllppppp..",
      "PPPpllllllllllllpP..",
      "PP.PllllllllllllP...",
      "P...PPlllllllPP.....",
      "......PPPPPP........",
    ],
  },
} satisfies Record<string, FishDef>;

export type FishKind = keyof typeof FISH;

export const CRAB_FRAMES: string[][] = [
  [
    "....k...k....",
    "rr..r...r..rr",
    "r.rrrrrrrrr.r",
    ".rrrrrrrrrrr.",
    "..rRrrrrrRr..",
    ".r.r.....r.r.",
  ],
  [
    "....k...k....",
    "rr..r...r..rr",
    "r.rrrrrrrrr.r",
    ".rrrrrrrrrrr.",
    "..rRrrrrrRr..",
    "r..r.....r..r",
  ],
];

/** Faces right; frame 2 moves the legs and antennae. */
export const SHRIMP_FRAMES: string[][] = [
  [
    ".......G..G",
    "...gggg.GG.",
    "..ggGgGggk.",
    ".gGgGgGgggG",
    "gg.G.G.G...",
    "Gg.........",
  ],
  [
    "......G...G",
    "...gggg.GG.",
    "..ggGgGggk.",
    ".gGgGgGgggG",
    "gg..G.G.G..",
    "Gg.........",
  ],
];

/** Two frames: the flag on top waves. The door is the "D" block at the bottom centre. */
const CASTLE_BODY = [
  "........s.s.s.s.s........",
  "........ssssssssS........",
  "........ssssssssS........",
  "........sssszsssS........",
  "........sssszsssS........",
  "s.s.s.s.ssssssssS.s.s.s.s",
  "ssssssS.ssssssssS.ssssssS",
  "ssszssS.ssssssssS.ssszssS",
  "ssszssSsssssssssSsssszssS",
  "ssssssSsssssssssSsssssssS",
  "sSssssSssssSssssSssSsssSS",
  "ssssssSsssssssssSsssssssS",
  "ssssssSssssDDDssSsssssssS",
  "ssssSsSsssDDDDDsSsssSsssS",
  "ssssssSsssDDDDDsSsssssssS",
  "ssssssSsssDDDDDsSsssssssS",
  "zzzzzzzzzzDDDDDzzzzzzzzzz",
];

export const CASTLE_FRAMES: string[][] = [
  [
    "............krrr.........",
    "............krr..........",
    "............k............",
    ...CASTLE_BODY,
  ],
  [
    "............krr..........",
    "............krrr.........",
    "............k............",
    ...CASTLE_BODY,
  ],
];

/** Door position within the castle sprite: centre column and width in pixels. */
export const CASTLE_DOOR = { x: 12, w: 5 };

/** Hermit crab facing right: two walking frames and a third frame retracted into its shell. */
const HERMIT_WALK = [
  "..uuuu....",
  ".uUUUuu...",
  "uUuuuUu.k.",
  "uUuUuUu.o.",
  "uuUUuUuooo",
  ".uuuuuuoo.",
  "..o.o.o...",
];

export const HERMIT_FRAMES: string[][] = [
  HERMIT_WALK,
  [...HERMIT_WALK.slice(0, -1), "...o.o.o.."],
  HERMIT_WALK.map((row) => row.replace(/[ok]/g, ".")),
];

export const CORALS = {
  branch: [
    ".g.....g...",
    ".m..g..m.g.",
    "mm..m.mm.m.",
    ".m.mm.m..m.",
    ".mmm..m.mm.",
    "..m...mmm..",
    "..mm..m....",
    "...mmmm....",
    "....MM.....",
    "...MMMM....",
  ],
  tube: [
    ".a...a...",
    ".q.a.q.a.",
    ".q.q.q.q.",
    "qq.q.qqq.",
    ".qqq.q.q.",
    "..qqqqqq.",
    "...QQQQ..",
    "..QQQQQQ.",
  ],
  fan: [
    "....v.v.v....",
    "..v.vvvvv.v..",
    ".vvvv.v.vvvv.",
    "v.v.vvvvv.v.v",
    "vvvv.v.v.vvvv",
    ".v.vvvvvvv.v.",
    ".vvv.v.v.vvv.",
    "...vvvvvvv...",
    ".....VVV.....",
    "......V......",
    ".....VVV.....",
  ],
  brain: [
    "...nnnn...",
    ".nnNnnNnn.",
    "nNnnNNnnNn",
    "nnNnnnnNnn",
    "NNNNNNNNNN",
  ],
} satisfies Record<string, string[]>;

export type CoralKind = keyof typeof CORALS;

export type Sprite = {
  w: number;
  h: number;
  /** Animation frames facing right. */
  right: HTMLCanvasElement[];
  /** Same frames mirrored, facing left. */
  left: HTMLCanvasElement[];
};

function rowsToCanvas(rows: string[]): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = rows[0].length;
  canvas.height = rows.length;
  const ctx = canvas.getContext("2d")!;
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const color = PALETTE[ch];
      if (!color) return;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    });
  });
  return canvas;
}

const mirror = (rows: string[]) => rows.map((r) => [...r].reverse().join(""));

/** Second animation frame: the tail columns shifted up by one pixel. */
function flapTail(rows: string[], tail: number): string[] {
  return rows.map((row, y) => {
    const below = rows[y + 1] ?? ".".repeat(row.length);
    return below.slice(0, tail) + row.slice(tail);
  });
}

function buildSprite(frames: string[][]): Sprite {
  return {
    w: frames[0][0].length,
    h: frames[0].length,
    right: frames.map(rowsToCanvas),
    left: frames.map((f) => rowsToCanvas(mirror(f))),
  };
}

export function buildFishSprites(): Record<FishKind, Sprite> {
  const entries = Object.entries(FISH).map(([kind, def]) => [
    kind,
    buildSprite([def.rows, flapTail(def.rows, def.tail)]),
  ]);
  return Object.fromEntries(entries) as Record<FishKind, Sprite>;
}

export function buildCrabSprite(): Sprite {
  return buildSprite(CRAB_FRAMES);
}

export function buildShrimpSprite(): Sprite {
  return buildSprite(SHRIMP_FRAMES);
}

export function buildCastleSprite(): Sprite {
  return buildSprite(CASTLE_FRAMES);
}

export function buildHermitSprite(): Sprite {
  return buildSprite(HERMIT_FRAMES);
}

export function buildCoralSprites(): Record<CoralKind, Sprite> {
  const entries = Object.entries(CORALS).map(([kind, rows]) => [kind, buildSprite([rows])]);
  return Object.fromEntries(entries) as Record<CoralKind, Sprite>;
}
