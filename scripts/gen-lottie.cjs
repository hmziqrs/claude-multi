#!/usr/bin/env node
const fs = require('fs');

const W = 64, H = 64, FPS = 30, FRAMES = 90;

const hex = (h, a = 1) => [
  parseInt(h.slice(1, 3), 16) / 255,
  parseInt(h.slice(3, 5), 16) / 255,
  parseInt(h.slice(5, 7), 16) / 255,
  a,
];

const stat = v => ({ a: 0, k: v });

function ease(start, end, t0, t1) {
  const s = Array.isArray(start) ? [...start] : [start];
  const e = Array.isArray(end) ? [...end] : [end];
  return {
    a: 1,
    k: [
      {
        i: { x: s.map(() => 0.4), y: s.map(() => 1) },
        o: { x: s.map(() => 0.6), y: s.map(() => 0) },
        t: t0,
        s,
        e,
      },
      { t: t1, s: e },
    ],
  };
}

function multiEase(keyframes) {
  const k = keyframes.map((kf, i) => {
    const s = Array.isArray(kf.s) ? [...kf.s] : [kf.s];
    if (i === keyframes.length - 1) return { t: kf.t, s };
    const e = Array.isArray(kf.e) ? [...kf.e] : [kf.e];
    return {
      i: { x: s.map(() => 0.4), y: s.map(() => 1) },
      o: { x: s.map(() => 0.6), y: s.map(() => 0) },
      t: kf.t,
      s,
      e,
    };
  });
  return { a: 1, k };
}

const rc = (cx, cy, w, h, r) => ({ ty: 'rc', d: 1, s: stat([w, h]), p: stat([cx, cy]), r: stat(r) });

const fl = (color, opacity = 100) => ({ ty: 'fl', c: stat(hex(color)), o: stat(opacity), r: 1, bm: 0 });

const st = (color, w, opacity = 100) => ({ ty: 'st', c: stat(hex(color)), o: stat(opacity), w: stat(w), lc: 2, lj: 2, bm: 0 });

const gf = (sx, sy, ex, ey, stops) => ({
  ty: 'gf', o: stat(100), t: 1, bm: 0,
  g: { p: stops.length, k: stat(stops.flatMap(([o, r, g, b]) => [o, r, g, b])) },
  s: stat([sx, sy]),
  e: stat([ex, ey]),
});

const sh = (verts) => ({
  ty: 'sh', d: 1,
  ks: stat({
    i: verts.map(() => [0, 0]),
    o: verts.map(() => [0, 0]),
    v: verts,
    c: false,
  }),
});

function grp(items, pos, opacity) {
  return {
    ty: 'gr',
    it: [
      ...items,
      {
        ty: 'tr',
        p: pos || stat([0, 0]),
        a: stat([0, 0]),
        s: stat([100, 100]),
        r: stat(0),
        o: opacity || stat(100),
        sk: stat(0),
        sa: stat(0),
      },
    ],
  };
}

const GS = [0.851, 0.976, 0.616];
const GE = [0.396, 0.639, 0.051];

const lottie = {
  v: '5.7.4',
  fr: FPS,
  ip: 0,
  op: FRAMES,
  w: W,
  h: H,
  nm: 'claude-multi',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0, ind: 0, ty: 4, nm: 'Icon',
      sr: 1,
      ks: {
        o: stat(100),
        r: stat(0),
        p: stat([32, 32, 0]),
        a: stat([32, 32, 0]),
        s: multiEase([
          { t: 0, s: [100, 100, 100], e: [100, 100, 100] },
          { t: 36, s: [100, 100, 100], e: [104, 104, 100] },
          { t: 54, s: [104, 104, 100], e: [100, 100, 100] },
          { t: 72, s: [100, 100, 100], e: [104, 104, 100] },
          { t: 90, s: [104, 104, 100] },
        ]),
      },
      ao: 0,
      shapes: [
        grp(
          [rc(28, 36, 36, 28, 5), fl('#0c0c0f'), st('#6dd9a1', 1, 60)],
          ease([-20, 8], [0, 0], 0, 12),
          ease(0, 100, 0, 12),
        ),
        grp(
          [rc(32, 32, 36, 28, 5), fl('#0c0c0f'), st('#c79bff', 1, 70)],
          ease([-20, 8], [0, 0], 5, 17),
          ease(0, 100, 5, 17),
        ),
        grp(
          [rc(36, 28, 36, 28, 5), fl('#0c0c0f'), st('#7aa7ff', 1, 80)],
          ease([-20, 8], [0, 0], 10, 22),
          ease(0, 100, 10, 22),
        ),
        grp(
          [rc(34, 27, 28, 22, 5), gf(20, 16, 48, 38, [[0, ...GS], [1, ...GE]])],
          ease([-5, 5], [0, 0], 18, 28),
          ease(0, 100, 18, 28),
        ),
        grp(
          [sh([[28, 22], [34, 27], [28, 32]]), st('#0c0c0f', 2.4)],
          stat([0, 0]),
          ease(0, 100, 24, 32),
        ),
        grp(
          [sh([[36, 32], [42, 32]]), st('#0c0c0f', 2.4)],
          stat([0, 0]),
          ease(0, 100, 28, 34),
        ),
      ],
      ip: 0, op: FRAMES, st: 0, bm: 0,
    },
  ],
};

fs.writeFileSync('public/favicon.json', JSON.stringify(lottie));
console.log('Created public/favicon.json');
