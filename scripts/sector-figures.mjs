/**
 * Draws the ten sector figures for the homepage's Industries section and
 * writes them to src/lib/sector-figures.generated.ts.
 *
 *   node scripts/sector-figures.mjs
 *
 * The drawing style is Hairline (@lucasmarkes/hairline, MIT): isometric line
 * figures built from rounded solids, each a bright silhouette and one dim
 * crease, painted back to front with plates filled in the ground colour so
 * hidden lines stay hidden, one bright mark per figure, no words. Its kernel
 * does the geometry here — camera, projection, rounded rings, hulls — so the
 * figures are drawn on the same engine as the package's own, not imitated.
 *
 * The site does not ship the kernel. Each figure is its designed rest pose,
 * rendered once to static path data, because ten live figures in a tile grid
 * would be ten pointer loops for what is a row of identifiers. Every figure
 * shares one camera and one scale, so a tyre and a transformer stand at the
 * sizes they would beside each other.
 *
 * The kernel comes from the installed skill:
 *   npx skills add lucasmarkes/hairline
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const kernelPath = join(root, ".agents/skills/hairline-create/kernel.js");
let source;
try {
  source = readFileSync(kernelPath, "utf8");
} catch {
  console.error(`No Hairline kernel at ${kernelPath}. Run: npx skills add lucasmarkes/hairline`);
  process.exit(1);
}
const sandbox = {};
vm.runInNewContext(`${source}\nthis.HL = HL;`, sandbox);
const { Cam, proj, facing, circ, rrect, rings, prism, ringAt, run, hull, poly, open, seg, fillet, r2 } = sandbox.HL;

/* One camera for all ten: the package's 2:1 view, at one scale. */
const S = 1.55;
const C = Cam(45, 0.5, S);
C.ox = 0;
C.oy = 0;
const P = proj(C);
const front = facing(C);
/** Unit vector toward the camera, for deciding which side of a curved surface shows. */
const V = (() => {
  const zf = Math.sqrt(1 - C.k * C.k), s = Math.sin(C.az), c = Math.cos(C.az);
  return [zf * s, zf * c, C.k];
})();
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const SQ = Math.SQRT1_2;

/* ---------- primitives: each returns [d, class] pairs, in paint order ---------- */

const shift = (ring, cx, cy) => ring.map((q) => ({ ...q, u: q.u + cx, v: q.v + cy }));

/** A rounded block standing on the ground plan, z0 to z1. */
function box(x0, y0, x1, y1, z0, z1, r = 4, b = 1.4, sil = "sil") {
  const [ring, inner] = rings(x0, y0, x1, y1, r, b);
  const s = prism(P, front, ring, inner, z0, z1);
  return [[s.sil, sil], [s.crease, "nf lo"]];
}

/** An upright cylinder. */
function cyl(cx, cy, R, z0, z1, { b = 1.1, sil = "sil", crease = "nf lo" } = {}) {
  const ring = shift(circ(R, 48), cx, cy);
  const inner = shift(circ(Math.max(0.3, R - b), 48), cx, cy);
  const s = prism(P, front, ring, inner, z0, z1);
  return [[s.sil, sil], [s.crease, crease]];
}

/** A solid whose top is narrower than its foot: rule 09's taper. */
function taper(cx, cy, R0, R1, z0, z1, b = 1, sil = "sil") {
  const foot = shift(circ(R0, 48), cx, cy), top = shift(circ(R1, 48), cx, cy);
  const inner = shift(circ(Math.max(0.3, R1 - b), 48), cx, cy);
  return [
    [poly(hull(ringAt(P, foot, z0).concat(ringAt(P, top, z1)))), sil],
    [open(ringAt(P, run(inner, front), z1)), "nf lo"],
  ];
}

/**
 * A convex outline extruded along a horizontal axis. `map(a, c, t)` places the
 * outline's point (a, c) at depth t; t1 is the end that faces the camera. The
 * cap's edge, inset by b, is the crease.
 */
function extrude(outline, map, t0, t1, b = 1.2, sil = "sil") {
  const at = (pts, t) => pts.map(([a, c]) => P(...map(a, c, t)));
  const [ca, cc] = centroid(outline);
  const inset = outline.map(([a, c]) => {
    const da = a - ca, dc = c - cc, L = Math.hypot(da, dc) || 1;
    return [a - (da / L) * b, c - (dc / L) * b];
  });
  return [
    [poly(hull(at(outline, t0).concat(at(outline, t1)))), sil],
    [poly(at(inset, t1)), "nf lo"],
  ];
}

/** A flat outline drawn on a plane, as one path. */
const onPlane = (outline, map, t, cls) => [poly(outline.map(([a, c]) => P(...map(a, c, t)))), cls];

/** A flat dot lying on a horizontal surface at height z. */
const flatDot = (x, y, z, r, cls) => [poly(circ(r, 24).map((q) => P(x + q.u, y + q.v, z))), cls];

/** A ring round an axis, only the half that faces the camera. */
function frontRing(center, axis, R, cls) {
  const [e1, e2] = basis(axis);
  const pts = [];
  for (let k = 0; k < 96; k++) {
    const a = (k / 96) * Math.PI * 2, n = [0, 1, 2].map((i) => Math.cos(a) * e1[i] + Math.sin(a) * e2[i]);
    pts.push({ n, p: [0, 1, 2].map((i) => center[i] + R * n[i]) });
  }
  const shown = run(pts, (q) => dot3(q.n, V) > 0);
  return [open(shown.map((q) => P(...q.p))), cls];
}

/** A capsule: two spheres and the cylinder between them. Orthographic, so each sphere is a screen circle. */
function capsule(c0, c1, R) {
  const pts = [];
  for (const c of [c0, c1]) {
    const [sx, sy] = P(...c);
    for (let k = 0; k < 48; k++) {
      const a = (k / 48) * Math.PI * 2;
      pts.push([sx + R * S * Math.cos(a), sy + R * S * Math.sin(a)]);
    }
  }
  return [poly(hull(pts)), "sil"];
}

const line = (a, b, cls = "nf lo") => [seg(P(...a), P(...b)), cls];

function centroid(pts) {
  const n = pts.length;
  return [pts.reduce((s, p) => s + p[0], 0) / n, pts.reduce((s, p) => s + p[1], 0) / n];
}
function basis(axis) {
  const L = Math.hypot(...axis), d = axis.map((v) => v / L);
  const up = Math.abs(d[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
  const e1 = norm(cross(d, up));
  return [e1, cross(d, e1)];
}
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (v) => {
  const L = Math.hypot(...v);
  return v.map((x) => x / L);
};
const circle2 = (R, cx = 0, cy = 0, n = 56) => circ(R, n).map((q) => [q.u + cx, q.v + cy]);
const rrect2 = (a0, c0, a1, c1, r) => rrect(a0, c0, a1, c1, r, 6).map((q) => [q.u, q.v]);
const inPoly = (pt, poly2) => {
  let inside = false;
  for (let i = 0, j = poly2.length - 1; i < poly2.length; j = i++) {
    const [xi, yi] = poly2[i], [xj, yj] = poly2[j];
    if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};

/* ---------- the ten figures: one object each, one bright mark ---------- */

const FIGURES = {
  /** A jacketed reactor vessel and a slim column on a skid. Bright: the vessel's top nozzle. */
  chemical() {
    return [
      ...box(-30, -26, 30, 26, 0, 5, 4),
      ...cyl(-8, -6, 16, 5, 50),
      frontRing([-8, -6, 22], [0, 0, 1], 16, "nf lo"),
      frontRing([-8, -6, 34], [0, 0, 1], 16, "nf lo"),
      ...taper(-8, -6, 16, 8, 50, 58),
      ...cyl(-8, -6, 3, 58, 65, { sil: "hi", crease: "nf hi" }),
      ...cyl(19, 13, 5.5, 5, 40),
      ...cyl(19, 13, 7, 40, 42.4, { b: 0.8 }),
    ];
  },

  /** A shield, face-on, held above a dashed ground mark. Bright: its centre ridge. */
  defence() {
    /* A heater shield: square shoulders, straight flanks, a full curve to a
       blunt point. */
    const raw = [[-23, 66], [23, 66], [23, 38], [16, 21], [0, 8], [-16, 21], [-23, 38]];
    const outline = fillet(raw, [4, 4, 10, 12, 6, 12, 10], 6);
    const map = (a, c, t) => [a * SQ + t * SQ, -a * SQ + t * SQ, c];
    const ridge = [P(...map(0, 61, 4.2)), P(...map(0, 13, 4.2))];
    return [
      [poly(circ(17, 48).map((q) => P(q.u, q.v, 0))), "nf dash"],
      line([0, 0, 0], map(0, 8, 0), "nf dash"),
      flatDot(0, 0, 0, 1.6, "dot m"),
      ...extrude(outline, map, -4, 4, 2.6),
      [open(ridge), "nf hi"],
    ];
  },

  /** A transformer: finned tank, three bushings. Bright: the middle bushing's cap. */
  energy() {
    const out = [...box(-26, -18, 26, 18, 0, 32, 5, 1.6)];
    for (let x = -18; x <= 18; x += 6) out.push(line([x, 18, 5], [x, 18, 26]));
    for (const [i, x] of [-14, 0, 14].entries()) {
      out.push(...cyl(x, 0, 4.2, 32, 35), ...cyl(x, 0, 2.6, 35, 52));
      out.push(...cyl(x, 0, 5, 40, 41.4, { b: 0.7 }), ...cyl(x, 0, 5, 45, 46.4, { b: 0.7 }));
      out.push(...cyl(x, 0, 2, 52, 55.5, i === 1 ? { sil: "hi", crease: "nf hi" } : {}));
    }
    return out;
  },

  /** Cans riding a conveyor. Bright: the middle can's lid. */
  food() {
    const out = [];
    for (const [x, y] of [[-32, -6], [32, -6], [-32, 6], [32, 6]]) out.push(...cyl(x, y, 1.6, 0, 14, { b: 0.6 }));
    out.push(...box(-42, -11, 42, 11, 14, 20, 10, 1.4));
    out.push(line([-32, 11, 17], [32, 11, 17]));
    for (const [i, x] of [-24, 0, 24].entries()) {
      out.push(...cyl(x, 0, 7.5, 20, 22, { b: 0.8 }));
      out.push(...cyl(x, 0, 7, 22, 37, { b: 0.8 }));
      out.push(frontRing([x, 0, 34.6], [0, 0, 1], 7, "nf lo"));
      out.push(...cyl(x, 0, 7.5, 37, 39, i === 1 ? { b: 1.2, sil: "hi", crease: "nf hi" } : { b: 1.2 }));
    }
    return out;
  },

  /** A CT gantry and its table. Bright: the bore's rim. */
  medical() {
    const map = (a, c, t) => [t, a, c];
    const outline = rrect2(-30, 0, 30, 62, 14);
    const bore = circle2(16, 0, 34);
    const boreFront = bore.map(([a, c]) => P(...map(a, c, 8)));
    const back = bore.map(([a, c]) => P(...map(a, c, -8)));
    /* Through the bore, the far rim shows where it falls inside the near one. */
    const backShown = run(back, (p) => inPoly(p, boreFront));
    return [
      ...extrude(outline, map, -8, 8, 1.8),
      [poly(boreFront), "hi"],
      [open(backShown), "nf lo"],
      ...box(30, -6, 50, 6, 0, 17, 3, 1.2),
      ...box(8, -9, 58, 9, 17, 21, 4, 1.2),
    ];
  },

  /** A blister card with a capsule lying across it. Bright: the capsule's seam. */
  pharmaceutical() {
    const out = [...box(-34, -30, 12, -2, 0, 2.5, 4, 1.2)];
    const domes = [];
    for (const y of [-22, -10]) for (const x of [-25, -15, -5, 5]) domes.push([x, y]);
    domes.sort((p, q) => p[0] + p[1] - (q[0] + q[1]));
    /* One cell already pushed through: an empty pocket, a flat ring. */
    for (const [x, y] of domes) {
      out.push(x === 5 && y === -10 ? flatDot(x, y, 2.5, 3.6, "nf lo") : null);
      if (!(x === 5 && y === -10)) out.push(...taper(x, y, 4.2, 2.8, 2.5, 6.5, 0.8));
    }
    /* The capsule lies on the bench in front of the card, across the view. */
    const d = [SQ, -SQ, 0], c = [16, 18, 7.5], L = 10, R = 7.5;
    const c0 = c.map((v, i) => v - d[i] * L), c1 = c.map((v, i) => v + d[i] * L);
    out.push(capsule(c0, c1, R));
    /* Its one crease: a line along the top, where a rounded body turns away. */
    const lift = (p) => [p[0], p[1], p[2] + R * 0.62];
    out.push(line(lift(c0), lift(c1)));
    out.push(frontRing(c, d, R, "nf hi"));
    return out;
  },

  /** A PET bottle and a scatter of granules. Bright: the cap. */
  plastics() {
    const out = [];
    for (const [x, y, cls] of [[16, 10, "dot off"], [22, 4, "dot m"], [19, 16, "dot off"], [26, 12, "dot off"], [12, 18, "dot m"], [28, 19, "dot off"], [23, 22, "dot off"]]) {
      out.push(flatDot(x, y, 0, 2, cls));
    }
    out.push(...cyl(-6, -4, 13, 0, 30, { b: 1.2 }));
    out.push(frontRing([-6, -4, 10], [0, 0, 1], 13, "nf lo"));
    out.push(frontRing([-6, -4, 18], [0, 0, 1], 13, "nf lo"));
    out.push(...taper(-6, -4, 13, 5, 30, 42));
    out.push(...cyl(-6, -4, 5, 42, 44, { b: 0.8 }));
    out.push(...cyl(-6, -4, 7.2, 44, 45.4, { b: 0.8 }));
    out.push(...cyl(-6, -4, 5, 45.4, 48, { b: 0.8 }));
    out.push(...cyl(-6, -4, 5.8, 48, 54, { b: 0.9, sil: "hi", crease: "nf hi" }));
    return out;
  },

  /** A roll of sheet rubber, running out toward the viewer. Bright: the sheet's leading edge. */
  rubber() {
    const map = (a, c, t) => [t, a, c];
    const out = [...box(-24, -14, 20, 32, 0, 1.6, 2, 0.8)];
    out.push([open([P(-22.4, 32, 1.6), P(18.4, 32, 1.6)]), "nf hi"]);
    out.push(...extrude(circle2(16, -12, 16), map, -26, 22, 1.2));
    for (const R of [12.5, 9]) out.push(onPlane(circle2(R, -12, 16), map, 22, "nf lo"));
    out.push(onPlane(circle2(5, -12, 16), map, 22, "sil"));
    out.push(onPlane(circle2(2.6, -12, 16), map, 22, "nf lo"));
    return out;
  },

  /** A die lifted off its wafer, on dashed guides. Bright: the pin-one mark. */
  semiconductor() {
    const out = [...cyl(0, 0, 32, 0, 2.2, { b: 1 })];
    for (let g = -24; g <= 24; g += 8) {
      const h = Math.sqrt(29 * 29 - g * g);
      out.push(line([g, -h, 2.2], [g, h, 2.2]), line([-h, g, 2.2], [h, g, 2.2]));
    }
    const z0 = 20, z1 = 24.5;
    for (const [x, y] of [[-12, -12], [12, -12], [-12, 12], [12, 12]]) out.push(line([x, y, 2.2], [x, y, z0], "nf dash"));
    out.push(...box(-12, -12, 12, 12, z0, z1, 2, 1.2));
    for (let k = -8; k <= 8; k += 4) {
      out.push(line([12, k, z0 + 1.5], [16, k, z0 + 1.5], "nf sil"), line([k, 12, z0 + 1.5], [k, 16, z0 + 1.5], "nf sil"));
    }
    out.push([poly(rrect(-6, -6, 6, 6, 1.2).map((q) => P(q.u, q.v, z1))), "nf lo"]);
    out.push(flatDot(-8.5, -8.5, z1, 1.3, "dot"));
    return out;
  },

  /** A tyre on its tread. Bright: the hub. */
  tyre() {
    const R = 26, Z = 26, map = (a, c, t) => [t, a, c + Z];
    const out = [...extrude(circle2(R), map, -9, 9, 1.4)];
    for (let k = 0; k < 36; k++) {
      const u = (k / 36) * Math.PI * 2, n = [0, Math.cos(u), Math.sin(u)];
      if (dot3(n, V) <= 0.12) continue;
      out.push(line([-9, R * n[1], Z + R * n[2]], [7.6, R * n[1], Z + R * n[2]]));
    }
    out.push(onPlane(circle2(16), map, 9, "nf lo"));
    out.push(onPlane(circle2(13), map, 9, "sil"));
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2 + 0.3;
      const p = map(8.5 * Math.cos(a), 8.5 * Math.sin(a), 9);
      out.push([poly(circle2(1.1, p[1], p[2] - Z).map(([a2, c2]) => P(...map(a2, c2, 9)))), "dot off"]);
    }
    out.push(onPlane(circle2(4.2), map, 9, "hi"));
    return out;
  },
};

/* ---------- framing: every figure in one viewBox size, centred on itself ---------- */

const built = Object.entries(FIGURES).map(([id, draw]) => {
  /* One decimal: the frame is 130 units drawn at about 200px, so a tenth of a
     unit is under a sixth of a pixel, and it takes a fifth off the page. */
  const paths = draw()
    .filter((p) => p && p[0] && p[0].length > 0)
    .map(([d, cls]) => [d.replace(/-?\d+\.\d+/g, (n) => String(Math.round(Number(n) * 10) / 10)), cls]);
  const nums = paths.flatMap(([d]) => (d.match(/-?\d+(\.\d+)?/g) || []).map(Number));
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (let i = 0; i + 1 < nums.length; i += 2) {
    x0 = Math.min(x0, nums[i]); x1 = Math.max(x1, nums[i]);
    y0 = Math.min(y0, nums[i + 1]); y1 = Math.max(y1, nums[i + 1]);
  }
  return { id, paths, box: [x0, y0, x1, y1] };
});
const PAD = 6;
const W = Math.ceil(Math.max(...built.map((f) => f.box[2] - f.box[0])) + PAD * 2);
const H = Math.ceil(Math.max(...built.map((f) => f.box[3] - f.box[1])) + PAD * 2);

const entries = built.map(({ id, paths, box: [x0, , x1, y1] }) => {
  /* Centred across, and stood on a shared baseline so the row reads level. */
  const vx = r2((x0 + x1) / 2 - W / 2), vy = r2(y1 + PAD - H);
  const body = paths.map(([d, cls]) => `      [${JSON.stringify(cls)}, ${JSON.stringify(d)}],`).join("\n");
  return `  ${JSON.stringify(id)}: {\n    viewBox: "${vx} ${vy} ${W} ${H}",\n    paths: [\n${body}\n    ],\n  },`;
});

const out = `/* Generated by scripts/sector-figures.mjs — do not edit by hand. */
import type { SectorId } from "@/lib/industries";

/** One stroke: its Hairline class ("sil", "lo", "hi", "dash", "dot", "nf"…) and path data. */
export type FigurePath = readonly [cls: string, d: string];

export const SECTOR_FIGURES: Record<SectorId, { viewBox: string; paths: readonly FigurePath[] }> = {
${entries.join("\n")}
};
`;
writeFileSync(join(root, "src/lib/sector-figures.generated.ts"), out);

/* `--preview <file.html>`: a contact sheet in the site's palette, for looking
   at the set before it ships. */
const at = process.argv.indexOf("--preview");
if (at > -1 && process.argv[at + 1]) {
  const tiles = built.map(({ id, paths }, i) => {
    const vb = entries[i].match(/viewBox: "([^"]+)"/)[1];
    const body = paths.map(([d, cls]) => `<path class="${cls}" d="${d}"/>`).join("");
    return `<figure><svg viewBox="${vb}">${body}</svg><figcaption>${id}</figcaption></figure>`;
  });
  writeFileSync(process.argv[at + 1], `<!doctype html><meta charset="utf-8"><style>
body{margin:0;background:#02102e;font:12px system-ui;color:#fff9;display:grid;grid-template-columns:repeat(5,1fr);gap:1px;padding:24px}
figure{margin:0;background:#061a4a;padding:18px}svg{width:100%;display:block}
path{fill:#061a4a;stroke:rgba(255,255,255,.42);stroke-width:1;vector-effect:non-scaling-stroke;stroke-linejoin:round;stroke-linecap:round}
.nf{fill:none}.sil{stroke:rgba(255,255,255,.8)}.lo{stroke:rgba(255,255,255,.2)}.hi{stroke:#f97316}.dash{stroke-dasharray:1 3}
.dot{stroke:none;fill:#f97316}.dot.m{fill:rgba(255,255,255,.8)}.dot.off{fill:rgba(255,255,255,.25)}
</style>${tiles.join("")}`);
  console.log(`preview: ${process.argv[at + 1]}`);
}
console.log(`wrote ${built.length} figures, viewBox ${W} × ${H}, ${(out.length / 1024).toFixed(1)} KB`);
