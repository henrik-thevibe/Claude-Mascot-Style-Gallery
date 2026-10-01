/* Clawd in Twenty-Nine Styles — henrik-styles.js
   Styles 21–29: Henrik's experiments, nine looks from an upcoming project, re-drawn around Clawd.
   Only the look is carried over.
   Same contract as every other style: CM.style({ id, n, title, caption, init(env), draw(g, env, rig, state) }),
   drawing into a virtual 400×400 tile. Load after core.js and before page.js. */
'use strict';
(function () {
const CM = window.CM; if (!CM) return;
const { PI, sin, cos, min, max, floor, ceil, round, abs, hypot } = Math, TAU = PI * 2;
const MONO = CM.FONT.mono;
const GLYPHS = '01{}<>+*/&!?()[]=_-:;#%';
const STRAY = '0?!<>{}()+=1A';
const STREAM = 'AI 01{)<+ ■*/&!?01 ';
const TERMINAL = '#d9ffe6';                   // phosphor white-green
const PAL = CM.PAL;

/* ───────── shared helpers ───────── */
/* cells covered by line-drawn eyes (closed, happy, dizzy…); the rasteriser only knows the pill eyes */
function eyeCells(M, R) {
  const out = new Set(), [x0, y0] = R.rect, step = min(R.cw, R.ch) * .4;
  for (const e of M.eyes) if (e.vis) for (const l of e.lines) for (const q of CM.resample(l, step)) {
    const i = floor((q[0] - x0) / R.cw), j = floor((q[1] - y0) / R.ch);
    if (i >= 0 && j >= 0 && i < R.cols && j < R.rows) out.add(j * R.cols + i);
  }
  return out;
}
/* rasterise Clawd and classify every cell: null (ground) or { eye } / { f: face, rim } */
function cells(M, cols, rows, rect) {
  const R = CM.raster(M, cols, rows, rect), E = eyeCells(M, R), C = new Array(cols * rows).fill(null);
  for (let k = 0; k < C.length; k++) {
    const id = R.id[k]; if (!id) continue;
    C[k] = id >= 31999 || E.has(k) ? { eye: true } : { f: R.faces[id - 1] };
  }
  const on = (i, j) => i >= 0 && j >= 0 && i < cols && j < rows && C[j * cols + i];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const c = C[j * cols + i]; if (c) c.rim = !on(i - 1, j) || !on(i + 1, j) || !on(i, j - 1) || !on(i, j + 1); }
  return { R, C, cols, rows, on };
}
/* one glyph per eye, from the rig's mood (an eye alphabet) */
function eyeGlyph(e, p) {
  if (e.mode === 'happy') return '^'; if (e.mode === 'closed' || e.mode === 'sleep') return '-';
  if (e.mode === 'dizzy') return '@'; if (e.mode === 'x') return 'x'; if (e.mode === 'squint') return e.side < 0 ? '>' : '<';
  return p.wide > .5 ? '0' : 'o';
}
function darken(hex, k) { const A = CM.hex2rgb(hex); return CM.rgb(A[0] * (1 - k), A[1] * (1 - k), A[2] * (1 - k)); }
function lum(hex) { const A = CM.hex2rgb(hex); return .3 * A[0] + .59 * A[1] + .11 * A[2]; }
function hsl(h, s, l) {
  s /= 100; l /= 100; const k = n => (n + h / 30) % 12, a = s * min(l, 1 - l), f = n => l - a * max(-1, min(k(n) - 3, 9 - k(n), 1));
  return '#' + [f(0), f(8), f(4)].map(v => round(v * 255).toString(16).padStart(2, '0')).join('');
}
function fakeHandle(r) { const h = '0123456789ABCDEF'; let s = ''; for (let i = 0; i < 4; i++) s += h[floor(r() * 16)]; return s + '-' + floor(r() * 90 + 10); }
/* dizzy stars as glyphs, and z's in mono */
function glyphStars(g, M, color, size = 16) {
  g.fillStyle = color; g.font = `800 ${size}px ${MONO}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (const s of M.stars) { g.globalAlpha = s.k; g.fillText('*', s.x, s.y); } g.globalAlpha = 1;
}
const zzz = (g, M, color) => CM.drawZzz(g, M, { color, font: MONO });

/* ═════════ 21 · Atlas glyph tiles (after the FT “Atlas” tiles) ═════════ */
{
const GROUND = '#2d7fb8', ORANGE = '#f07a2a', GREY = '#aaaaaa', WHITE = '#f2f2f2', N = 34, T = 400 / N, GUT = max(1, round(T * .13));
function tile(g, x, y, kind, ch) {
  g.fillStyle = '#000'; g.fillRect(x, y, T + .4, T + .4); if (kind === 'black') return;
  g.fillStyle = kind === 'orange' ? ORANGE : kind === 'grey' ? GREY : WHITE; g.fillRect(x + GUT, y + GUT, T - 2 * GUT, T - 2 * GUT);
  g.fillStyle = '#000';
  if (kind === 'dot') { const s = T * .28; g.fillRect(x + (T - s) / 2, y + (T - s) / 2, s, s); }
  else if (kind === 'big') { const s = T * .46; g.fillRect(x + (T - s) / 2, y + (T - s) / 2, s, s); }
  else if (kind === 'text') { if (ch === '■') { const s = T * .28; g.fillRect(x + (T - s) / 2, y + (T - s) / 2, s, s); } else if (ch !== ' ') g.fillText(ch, x + T / 2, y + T / 2 + .5); }
  else { g.strokeStyle = '#000'; g.lineWidth = max(1, T * .08); g.beginPath(); g.moveTo(x + T * .32, y + T * .7); g.lineTo(x + T * .68, y + T * .3); g.stroke(); }
}
CM.style({
  id: 'eatlas', n: 21, title: 'Atlas Glyph Tiles', caption: 'After the FT “Atlas” tiles',
  init(env) { return { strays: Array.from({ length: 18 }, () => ({ i: floor(env.rnd() * N), j: 22 + floor(env.rnd() * (N - 22)), ch: STRAY[floor(env.rnd() * STRAY.length)], ph: env.rnd() })) }; },
  draw(g, env, rig, S) {
    const p = rig.pose, t = env.t, M = CM.build(p, { cx: 200, cy: 214, s: 15 }), G = cells(M, N, N, [0, 0, 400, 400]), { C } = G;
    const horizon = 7;
    g.fillStyle = GROUND; g.fillRect(0, 0, 400, 400); g.fillStyle = '#000'; g.fillRect(0, 0, 400, horizon * T);
    g.font = `500 ${round(T * .62)}px ${MONO}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    /* the terminal stream: one row of text tiles, two steps a second */
    const st = floor(t * 2);
    for (let i = 1; i < N - 1; i++) tile(g, i * T, 2 * T, 'text', STREAM[((i - st) % STREAM.length + STREAM.length) % STREAM.length]);
    for (let i = 1; i < N - 1; i++) if ((i + st) % 9 === 0) tile(g, i * T, 4 * T, 'big');
    /* strays: loose glyphs on the ground, each off for ~18% of a 2.7 s cycle */
    g.fillStyle = '#000';
    for (const s of S.strays) { if (((t / 2.7 + s.ph) % 1) < .18 || C[s.j * N + s.i]) continue; g.fillText(s.ch, s.i * T + T / 2, s.j * T + T / 2); }
    /* the black stepped shadow at (−1, +1) */
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) if (C[j * N + i] && !C[(j + 1) * N + i - 1]) tile(g, (i - 1) * T, (j + 1) * T, 'black');
    /* the figure in bands: the lit rim and the top in ■, the front in orange /, the sides in grey /, eyes black */
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const c = C[j * N + i]; if (!c) continue;
      const f = c.f, front = f && f.name === 'front' && f.part === 'body', kind = c.eye ? 'black' : f.name === 'top' || (c.rim && f.light > .2) ? 'dot' : front ? 'orange' : f.light > .1 ? 'grey' : 'black';
      tile(g, i * T, j * T, kind);
    }
    if (M.stars.length) glyphStars(g, M, '#fff', 18);
    zzz(g, M, '#000');
  },
});
}

/* ═════════ 22 · Blob mosaic (tile-mosaic blobs with glyph eyes) ═════════ */
{
const GROUND = '#1dec80', N = 36, T = 400 / N;
function crowdColor(r, avoid) {
  const n = r(); if (n < .12) return '#dfdfdf'; if (n < .2) return '#262626';
  let h = r() * 360; for (const a of avoid) if (abs(((h - a + 540) % 360) - 180) < 40) h = (h + 120) % 360;
  return hsl(h, 62 + r() * 30, 48 + r() * 16);
}
function tileFill(g, i, j, c) { g.fillStyle = darken(c, .45); g.fillRect(i * T, j * T, T + .3, T + .3); const gu = max(1, round(T * .13)) / 2; g.fillStyle = c; g.fillRect(i * T + gu, j * T + gu, T - 2 * gu, T - 2 * gu); }
function glyph(g, ch, x, y, size, ink, tilt = 0) {
  g.save(); g.translate(x, y); g.rotate(tilt); g.fillStyle = g.strokeStyle = ink; g.font = `800 ${round(size)}px ${MONO}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineWidth = max(1, size * .025); g.lineJoin = 'round'; g.strokeText(ch, 0, size * .06); g.fillText(ch, 0, size * .06); g.restore();
}
CM.style({
  id: 'eblob', n: 22, title: 'Blob Mosaic', caption: 'Tile mosaic, one ground per chapter',
  init(env) {
    const r = env.rnd, spots = [[3.5, 31.5, 2.4], [9, 34, 1.7], [31.5, 32.5, 2.6], [26, 35, 1.5], [34, 27, 1.6], [2.5, 25, 1.4]];
    return { crowd: spots.map(([x, y, rr], k) => ({ x, y, r: rr, c: crowdColor(r, [150, 15]), ph: r() * TAU, eye: ['o', '*', '+', '.', 'o', '0'][k] })) };
  },
  draw(g, env, rig, S) {
    const p = rig.pose, t = env.t, M = CM.build(p, { cx: 200, cy: 196, s: 14.5 }), G = cells(M, N, N, [0, 0, 400, 400]), { C } = G;
    g.fillStyle = GROUND; g.fillRect(0, 0, 400, 400);
    /* the crowd: circles of tiles that bob by whole tiles and keep an eye on Clawd */
    const cc = M.center, happy = p.mode === 'happy' || p.happy > .5;
    for (const b of S.crowd) {
      const cy = b.y - (sin(t * 2.1 + b.ph) > .6 ? 1 : 0), rr = b.r;
      for (let j = floor(cy - rr - 1); j <= ceil(cy + rr); j++) for (let i = floor(b.x - rr - 1); i <= ceil(b.x + rr); i++) {
        if (hypot(i + .5 - b.x, j + .5 - cy) > rr) continue;
        if (!C[(j + 1) * N + i - 1] && hypot(i - .5 - b.x, j + 1.5 - cy) > rr) { g.fillStyle = '#000'; g.fillRect((i - 1) * T, (j + 1) * T, T + .3, T + .3); }
      }
      for (let j = floor(cy - rr - 1); j <= ceil(cy + rr); j++) for (let i = floor(b.x - rr - 1); i <= ceil(b.x + rr); i++) if (hypot(i + .5 - b.x, j + .5 - cy) <= rr) tileFill(g, i, j, b.c);
      const ink = lum(b.c) > 120 ? '#000' : '#fff', sz = max(T, rr * .5 * T) * 1.2, dx = CM.clamp((cc[0] - b.x * T) / 300, -1, 1) * T * .25;
      for (const s of [-1, 1]) glyph(g, happy ? '^' : b.eye, b.x * T + s * rr * .42 * T + dx, (cy - rr * .08) * T, sz, ink);
    }
    /* Clawd's stepped shadow, then the body: front in the body colour, the top and the sides as bands */
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) if (C[j * N + i] && !C[(j + 1) * N + i - 1]) { g.fillStyle = '#000'; g.fillRect((i - 1) * T, (j + 1) * T, T + .3, T + .3); }
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const c = C[j * N + i]; if (!c) continue;
      const f = c.f, leg = f && f.part[0] === 'l';
      tileFill(g, i, j, c.eye ? PAL.body : leg ? (f.name === 'front' ? PAL.leg : PAL.legDark) : f.name === 'top' ? PAL.top : f.name === 'front' ? PAL.body : PAL.side);
    }
    /* eyes are real glyphs over the mosaic: black on a light body (luminance > 120) */
    for (const e of M.eyes) if (e.vis) glyph(g, eyeGlyph(e, p), e.c[0], e.c[1], max(T * 1.3, e.size * 1.9), lum(PAL.body) > 120 ? '#000' : '#fff', p.roll);
    if (M.stars.length) glyphStars(g, M, '#000', 18);
    zzz(g, M, '#000');
  },
});
}

/* ═════════ 23 · Phosphor streams ("01:30") ═════════ */
{
const N = 40, CS = 400 / N, LOOP = 17, STOP = 10.5;
CM.style({
  id: 'ephosphor', n: 23, title: 'Phosphor Streams', caption: 'The streams stop at once',
  init(env) { const r = env.rnd; return { st: Array.from({ length: N }, () => ({ v: 4 + r() * 13, off: r() * 60, len: 6 + floor(r() * 22), b: .35 + r() * .65 })) }; },
  draw(g, env, rig, S) {
    const p = rig.pose, t = env.t, M = CM.build(p, { cx: 200, cy: 204, s: 15 }), { C } = cells(M, N, N, [0, 0, 400, 400]);
    const f = t % LOOP, frozen = f >= STOP, fade = frozen ? max(0, 1 - (f - STOP) / 3.5) : 1, tt = frozen ? STOP : f;
    g.fillStyle = '#000'; g.fillRect(0, 0, 400, 400);
    g.font = `500 ${round(CS * .98)}px ${MONO}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = TERMINAL;
    for (let i = 0; i < N; i++) {
      const s = S.st[i], head = (tt * s.v + s.off) % (N + s.len);
      for (let k = 0; k < s.len; k++) {
        const j = floor(head - k); if (j < 0 || j >= N || C[j * N + i]) continue;
        const a = (1 - k / s.len) * fade * s.b; if (a < .03) continue;
        g.globalAlpha = a; g.fillText(GLYPHS[(i * 31 + j * 7 + floor(tt * 2.7)) % GLYPHS.length], i * CS + CS / 2, j * CS + CS / 2);
      }
    }
    /* Clawd is the one body that keeps glowing when the streams stop */
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const c = C[j * N + i]; if (!c || c.eye) continue;
      g.globalAlpha = .5 + .5 * c.f.light;
      g.fillText(GLYPHS[(i * 13 + j * 5 + floor(t * 1.3)) % GLYPHS.length], i * CS + CS / 2, j * CS + CS / 2);
    }
    g.globalAlpha = 1;
    if (M.stars.length) glyphStars(g, M, TERMINAL, 16);
    zzz(g, M, TERMINAL);
    const secs = frozen ? 0 : floor(f / STOP * 60) % 60;
    g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.font = `500 13px ${MONO}`; g.fillStyle = frozen ? '#fff' : '#7fa38c';
    g.fillText(`01:${frozen ? '30' : '29'}:${String(secs).padStart(2, '0')}`, 14, 388);
  },
});
}

/* ═════════ 24 · Density portrait (a figure made of handles) ═════════ */
{
const COLS = 44, CW = 400 / COLS, CH = CW * 1.25, ROWS = ceil(400 / CH);
CM.style({
  id: 'edensity', n: 24, title: 'Density Portrait', caption: 'Drawn in synthetic handles',
  init(env) { return { text: Array.from({ length: 300 }, () => fakeHandle(env.rnd)).join(' ') }; },
  draw(g, env, rig, S) {
    const p = rig.pose, M = CM.build(p, { cx: 200, cy: 206, s: 15 }), { C } = cells(M, COLS, ROWS, [0, 0, 400, ROWS * CH]);
    const shift = floor(env.t * 15), tx = S.text, n = tx.length;
    g.fillStyle = '#05070a'; g.fillRect(0, 0, 400, 400);
    g.font = `500 ${round(CH * .9)}px ${MONO}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = TERMINAL;
    for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) {
      const c = C[j * COLS + i], ch = tx[(j * COLS + i + shift) % n]; if (ch === ' ') continue;
      g.globalAlpha = !c ? .06 : c.eye ? .02 : .42 + .58 * c.f.light;
      g.fillText(ch, i * CW + CW / 2, j * CH + CH / 2);
    }
    g.globalAlpha = 1;
    if (M.stars.length) glyphStars(g, M, TERMINAL, 16);
    zzz(g, M, TERMINAL);
  },
});
}

/* ═════════ 25 · Character-density field (after ertdfgcvb / play.core) ═════════ */
{
const RAMP = ' .:-=+*#', SHADE = ['#07090d', '#121b24', '#18242f', '#1f2e3a', '#273846', '#304352', '#3a4f5f', '#465c6d'];
const COLS = 50, CW = 8, CH = 16, ROWS = 25, LAMP = '#2fd4c8';
CM.style({
  id: 'efield', n: 25, title: 'Density Field', caption: 'After ertdfgcvb’s play.core',
  init(env) { return { pk: Array.from({ length: 5 }, () => ({ x: -env.rnd() * 30, y: floor(env.rnd() * 20) + 2, v: 3 + env.rnd() * 4 })) }; },
  draw(g, env, rig, S) {
    const p = rig.pose, t = env.t, M = CM.build(p, { cx: 236, cy: 208, s: 13.5 }), { C } = cells(M, COLS, ROWS, [0, 0, 400, 400]), used = new Uint8Array(COLS * ROWS);
    g.fillStyle = SHADE[0]; g.fillRect(0, 0, 400, 400);
    g.font = `600 ${CH - 2}px ${MONO}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    const put = (i, j, ch, col) => { if (i < 0 || j < 0 || i >= COLS || j >= ROWS || used[j * COLS + i]) return; used[j * COLS + i] = 1; if (ch !== ' ') { g.fillStyle = col; g.fillText(ch, i * CW + CW / 2, j * CH + CH / 2); } };
    /* foreground first, each cell drawn once: Clawd in the ramp, eyes as darkness */
    for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) {
      const c = C[j * COLS + i]; if (!c) continue;
      if (c.eye) { put(i, j, ' '); continue; }
      const L = c.f.light; put(i, j, RAMP[min(7, 3 + round(L * 4.4))], CM.rgb(217, 255, 230, .45 + .55 * L));
    }
    /* "Hi" packets drift in from the left and fade as they reach him */
    const bx = floor(M.bbox[0] / CW) - 2;
    for (const k of S.pk) {
      const x = floor(((k.x + t * k.v) % (bx + 8)) - 4), a = x > bx - 6 ? max(0, (bx - x) / 6) : 1;
      if (x >= 0 && a > .05) { put(x, k.y, 'H', CM.rgb(217, 255, 230, a)); put(x + 1, k.y, 'i', CM.rgb(217, 255, 230, a)); }
    }
    /* the field last: a slow swell, pushed into brightness where Clawd is looking */
    const lx = M.center[0] / CW + p.eyeX * 16, ly = M.center[1] / CH - p.eyeY * 7;
    for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) {
      let v = .5 + .5 * sin(i * .16 + t * 1.2) * cos(j * .29 - t * .8);
      v += max(0, 1 - hypot(i - lx, (j - ly) * 2) / 12) * 1.2;
      const k = max(0, min(7, floor(v * 3.2))); if (k > 0) put(i, j, RAMP[k], SHADE[k]);
    }
    if (M.stars.length) glyphStars(g, M, LAMP, 16);
    zzz(g, M, TERMINAL);
  },
});
}

/* ═════════ 26 · Teletext page (after Goto80's Datagården) ═════════ */
{
const K = { k: '#000000', R: '#ff3b30', G: '#34d058', Y: '#ffd60a', B: '#2255ff', M: '#ff4fd8', c: '#35e0ff', w: '#ffffff' };
const PW = 40, PH = 25, CW = 10, CH = 16, PIC = [1, 3, 23, 21];                 // picture: cols 1–22, rows 3–20
const ACT = { wave: 'WAVING', wave2: 'WAVING', dance: 'DANCING', hop: 'HOPPING', cheese: 'SMILING', spin: 'SPINNING', dizzy: 'DIZZY', doze: 'DOZING', grabbed: 'HELD', stretch: 'STRETCHING', nod: 'NODDING', shake: 'NO', glance: 'LOOKING' };
CM.style({
  id: 'eteletext', n: 26, title: 'Teletext Page', caption: 'After Goto80’s Datagården',
  init(env) { return { stars: Array.from({ length: 12 }, () => [PIC[0] + floor(env.rnd() * (PIC[2] - PIC[0])), PIC[1] + floor(env.rnd() * 5)]), page: 100 + floor(env.rnd() * 799) }; },
  draw(g, env, rig, S) {
    const p = rig.pose, t = env.t, [c0, r0, c1, r1] = PIC, cols = (c1 - c0) * 2, rows = (r1 - r0) * 3;
    const M = CM.build(p, { cx: (c0 + c1) / 2 * CW, cy: (r1 - 2) * CH - 7.3 * 11.5, s: 11.5 }), { C } = cells(M, cols, rows, [c0 * CW, r0 * CH, c1 * CW, r1 * CH]);
    g.fillStyle = K.k; g.fillRect(0, 0, 400, 400);
    g.font = `700 ${CH - 2}px ${MONO}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    const ch = (i, j, c, col, bg) => { if (bg) { g.fillStyle = bg; g.fillRect(i * CW, j * CH, CW + .3, CH + .3); } if (c !== ' ') { g.fillStyle = col; g.fillText(c, i * CW + CW / 2, j * CH + CH / 2 + 1); } };
    const text = (s, i, j, col, bg) => { for (let k = 0; k < s.length; k++) ch(i + k, j, s[k], col, bg); };
    const cyc = t % 22, searching = cyc < .7, page = searching ? 100 + floor(t * 37) % 799 : S.page + floor(t / 22);
    const ss = String(floor(t) % 60).padStart(2, '0');
    text(('P' + page).padEnd(6) + 'CLAWD   OCT01 21:00:' + ss, 1, 0, searching ? K.G : K.w);
    if (searching) { text('searching...', 1, 2, K.G); }
    else {
      text(' '.repeat(PW), 0, 1, K.k, K.B); text('TERMINAL CREATURES', 11, 1, K.Y, K.B);
      /* mosaic graphics: every character cell is 2×3 blocks in one colour, as on a real teletext page */
      for (const [x, y] of S.stars) ch(x, y, (floor(t * 1.4) + x) % 4 ? '.' : '+', K.w);
      for (let j = r0; j < r1; j++) for (let i = c0; i < c1; i++) {
        let n = 0, top = 0, side = 0, front = 0;
        for (let v = 0; v < 3; v++) for (let u = 0; u < 2; u++) { const c = C[((j - r0) * 3 + v) * cols + (i - c0) * 2 + u]; if (!c || c.eye) continue; n++; c.f.name === 'top' ? top++ : c.f.name === 'front' && c.f.part === 'body' ? front++ : side++; }
        if (!n) continue;
        const col = front >= top && front >= side ? K.R : top >= side ? K.Y : K.M, w = CW / 2, h = CH / 3;
        g.fillStyle = col;
        for (let v = 0; v < 3; v++) for (let u = 0; u < 2; u++) { const c = C[((j - r0) * 3 + v) * cols + (i - c0) * 2 + u]; if (c && !c.eye) g.fillRect(i * CW + u * w, j * CH + v * h, w + .3, h + .3); }
      }
      for (let i = c0; i < c1; i++) { ch(i, r1 - 1, sin(i * .9 + t * 1.8) > .4 ? '"' : ',', K.G); ch(i, r1, ' ', K.G, K.G); }
      /* the entry: what he is doing right now */
      const ex = 25, doing = p.sleep > .5 ? 'DOZING' : ACT[p.act] || (p.happy > .5 ? 'HAPPY' : 'WATCHING');
      text('NAME', ex, 4, K.c); text('CLAWD', ex + 7, 4, K.w);
      text('BORN', ex, 6, K.c); text('IN A', ex + 7, 6, K.w); text('TERMINAL', ex + 7, 7, K.w);
      text('NOW', ex, 9, K.c); text(doing.slice(0, 9), ex + 7, 9, K.Y);
      text('LEGS', ex, 11, K.c); text('4', ex + 7, 11, K.w);
      text('MOOD', ex, 13, K.c); text(p.dizzy > .4 ? '< ? >' : p.happy > .4 ? '< :) >' : '< ok >', ex + 7, 13, K.M);
      text('Move the pointer and', 1, 22, K.w); text('he will follow it.', 1, 23, K.w);
    }
    ['WAVE', 'DANCE', 'HOP', 'CHEESE'].forEach((w, i) => text(w, 1 + i * 10, PH - 1, [K.R, K.G, K.Y, K.c][i]));
    if (M.stars.length) glyphStars(g, M, K.Y, 16);
    zzz(g, M, K.w);
  },
});
}

/* ═════════ 27 · Maze War (after the Xerox Alto) ═════════ */
{
const VX = 200, VY = 196, SEG = 6, STEP = 2.6, hw = z => 205 / (1 + z * .62);
CM.style({
  id: 'emaze', n: 27, title: 'Maze War', caption: 'After Maze War on the Xerox Alto',
  init(env) { return { seed: floor(env.rnd() * 1e6) }; },
  draw(g, env, rig, S) {
    const p = rig.pose, t = env.t, k0 = floor(t / STEP);
    const open = (k, side) => CM.hash2(k0 + k, side, S.seed) < .38;           // a side passage at depth segment k?
    const L = z => VX - hw(z), Rr = z => VX + hw(z), U = z => VY - hw(z) * .82, D = z => VY + hw(z) * .82;
    g.fillStyle = '#fff'; g.fillRect(0, 0, 400, 400);
    g.strokeStyle = '#000'; g.lineWidth = 2; g.lineCap = 'square'; g.beginPath();
    for (let k = 0; k < SEG; k++) {
      const z0 = k, z1 = k + 1;
      for (const side of [-1, 1]) {
        const X = side < 0 ? L : Rr;
        if (!open(k, side)) { g.moveTo(X(z0), U(z0)); g.lineTo(X(z1), U(z1)); g.moveTo(X(z0), D(z0)); g.lineTo(X(z1), D(z1)); }
        else { g.moveTo(X(z0), U(z1)); g.lineTo(X(z1), U(z1)); g.moveTo(X(z0), D(z1)); g.lineTo(X(z1), D(z1)); g.moveTo(X(z0), U(z1)); g.lineTo(X(z0), D(z1)); }
        g.moveTo(X(z1), U(z1)); g.lineTo(X(z1), D(z1));
        if (k > 0) { g.moveTo(X(z0), U(z0)); g.lineTo(X(z0), D(z0)); }
      }
    }
    g.rect(L(SEG), U(SEG), Rr(SEG) - L(SEG), D(SEG) - U(SEG));
    g.stroke();
    /* Clawd one step ahead in the corridor: white faces, black lines, hidden lines removed by painting order */
    const z = 1.35, s = hw(z) * 2 / 12 * .7, M = CM.build(p, { cx: VX, cy: D(z) - CM.DIM.CY * s, s, persp: .01 });
    g.lineJoin = 'round';
    for (const f of M.faces) { CM.fillPoly(g, f.pts, '#fff'); CM.strokePoly(g, f.pts, '#000', 2); }
    for (const e of M.eyes) {
      if (!e.vis) continue;
      if (e.poly) { const r = e.size * .95; g.fillStyle = '#fff'; g.beginPath(); g.arc(e.c[0], e.c[1], r, 0, TAU); g.fill(); g.lineWidth = 2; g.stroke();
        g.fillStyle = '#000'; g.beginPath(); g.arc(e.c[0] + p.eyeX * r * .4, e.c[1] - p.eyeY * r * .4, r * .45 * max(.2, e.open), 0, TAU); g.fill(); }
      else { g.lineWidth = 2.4; for (const l of e.lines) CM.strokePoly(g, l, '#000', 2.4, false); }
    }
    if (M.stars.length) glyphStars(g, M, '#000', 16);
    zzz(g, M, '#000');
    /* the Alto's status line */
    g.fillStyle = '#000'; g.fillRect(0, 372, 400, 28); g.fillStyle = '#fff'; g.font = `600 12px ${MONO}`; g.textAlign = 'left'; g.textBaseline = 'middle';
    g.fillText(`CLAWD   SCORE 0   STEP ${String(k0 % 1000).padStart(3, '0')}`, 12, 386);
  },
});
}

/* ═════════ 28 · Code poem (after Kerr & Holden's cold_cloud.cc) ═════════ */
{
const N = 40, CS = 400 / N, LOOP = 18, TYPE = 5, FLY = 3.2, BG = '#0b0d12', OLD = '#c9b27a', DIMC = '#6f8a7a';
CM.style({
  id: 'epoem', n: 28, title: 'Code Poem', caption: 'After Kerr & Holden’s cold_cloud.cc',
  init(env) {
    /* the poem is this very function: its own source is the text, and every letter of the picture is lifted out of it */
    const src = CM.styles.find(s => s.id === 'epoem').draw.toString().replace(/\s+/g, ' ');
    const FS = 7.2, LH = 8.4, PER = floor(392 / (FS * .6)), pos = [], idx = [];
    for (let i = 0; i < src.length; i++) { pos.push([4 + (i % PER) * FS * .6, 10 + floor(i / PER) * LH]); if (src[i] !== ' ') idx.push(i); }
    return { src, pos, idx, FS };
  },
  draw(g, env, rig, S) {
    const p = rig.pose, t = env.t, f = t % LOOP, M = CM.build(p, { cx: 200, cy: 222, s: 14.5 }), { C } = cells(M, N, N, [0, 0, 400, 400]);
    const { src, pos, idx } = S, typed = min(src.length, floor(f / TYPE * src.length));
    g.fillStyle = BG; g.fillRect(0, 0, 400, 400);
    /* the source as verse, typed in, then left behind as a ghost */
    g.font = `500 ${S.FS}px ${MONO}`; g.textAlign = 'left'; g.textBaseline = 'middle';
    g.fillStyle = f < TYPE ? TERMINAL : DIMC; g.globalAlpha = f < TYPE ? .62 : .2;
    for (let i = 0; i < typed; i++) if (src[i] !== ' ') g.fillText(src[i], pos[i][0], pos[i][1]);
    if (f < TYPE && floor(t * 2) % 2 === 0) { const q = pos[min(typed, pos.length - 1)]; g.globalAlpha = 1; g.fillStyle = '#2fd4c8'; g.fillRect(q[0], q[1] - 4, 4, 8); }
    g.globalAlpha = 1;
    if (f < TYPE) return;
    /* run: each cell of Clawd takes a letter from the source, carried along a curve to its place; the dark arrives last */
    const u = CM.clamp((f - TYPE) / FLY, 0, 1), out = CM.clamp((f - (LOOP - 1.2)) / 1.2, 0, 1);
    g.font = `700 ${round(CS * 1.05)}px ${MONO}`; g.textAlign = 'center';
    let k = 0;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const c = C[j * N + i]; if (!c) continue; k++;
      if (c.eye) continue;
      const si = idx[(k * 7 + j) % idx.length], L = c.f.light, delay = (1 - L) * .45, e = CM.easeOut(CM.clamp((u - delay) / (1 - delay + 1e-6), 0, 1));
      if (e <= 0) continue;
      const a = pos[si], bx = i * CS + CS / 2, by = j * CS + CS / 2 + out * 18, mx = (a[0] + bx) / 2 + (a[1] - by) * .25, my = (a[1] + by) / 2 - 60;
      const x = (1 - e) * (1 - e) * a[0] + 2 * (1 - e) * e * mx + e * e * bx, y = (1 - e) * (1 - e) * a[1] + 2 * (1 - e) * e * my + e * e * by;
      g.globalAlpha = (.55 + .45 * L) * (1 - out);
      g.fillStyle = c.f.name === 'top' ? OLD : c.f.name === 'front' ? TERMINAL : DIMC;
      g.fillText(src[si], x, y);
    }
    g.globalAlpha = 1;
    if (M.stars.length) glyphStars(g, M, OLD, 16);
    zzz(g, M, TERMINAL);
    /* scanlines */
    g.fillStyle = 'rgba(0,0,0,.18)'; for (let y = 0; y < 400; y += 3) g.fillRect(0, y, 400, 1);
  },
});
}
/* ═════════ 29 · Frutiger Aero (glossy jelly, mid-2000s) ═════════ */
{
const { path, offsetPoly, bbox, centroid } = CM;
const K = { light: '#ffbd5c', mid: '#ff7f17', deep: '#e0480a', edge: '#b23a06', eye: '#5c1d05', eyeLine: '#7a2809' };
const inset = (p, d) => offsetPoly(p, d);   // offsetPoly already shrinks for either winding
const SUN = [62, 46];
function ribbon(g, x0, y0, cx, cy, x1, y1, w, a) {
  g.save(); g.lineCap = 'round';
  const gr = g.createLinearGradient(x0, y0, x1, y1);
  gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.35, `rgba(255,255,255,${a})`); gr.addColorStop(.7, `rgba(255,255,255,${a * .6})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.strokeStyle = gr; g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(cx, cy, x1, y1); g.stroke();
  g.lineWidth = 1.4; g.globalAlpha = .9; g.beginPath(); g.moveTo(x0, y0 - w / 2); g.quadraticCurveTo(cx, cy - w / 2, x1, y1 - w / 2); g.stroke();
  g.restore();
}
/* halftone dot streak along a quadratic: dots fade toward both ends and the band's edges */
function dotStreak(g, x0, y0, cx, cy, x1, y1, rows, gap, r0, a) {
  g.fillStyle = `rgba(255,255,255,${a})`;
  for (let u = 0; u <= 1.0001; u += 1 / 46) {
    const x = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * cx + u * u * x1, y = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * cy + u * u * y1, fade = sin(PI * u);
    for (let k = -rows; k <= rows; k++) { const rr = r0 * fade * (1 - abs(k) / (rows + 1)); if (rr > .25) { g.beginPath(); g.arc(x + k * 1.5, y + k * gap, rr, 0, TAU); g.fill(); } }
  }
}
function cloud(g, x, y, s) {
  for (const [dx, dy, r] of [[0, 0, 1], [-.9, .25, .7], [.95, .2, .75], [.4, -.45, .7], [-.4, -.3, .6]]) {
    const R = r * s, gr = g.createRadialGradient(x + dx * s, y + dy * s, 0, x + dx * s, y + dy * s, R);
    gr.addColorStop(0, 'rgba(255,255,255,.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x + dx * s, y + dy * s, R, 0, TAU); g.fill();
  }
}
function hill(g, pts, top, bot, gloss) {
  g.beginPath(); g.moveTo(-10, 410); for (const q of pts) g.lineTo(q[0], q[1]); g.lineTo(410, 410); g.closePath();
  const y0 = min(...pts.map(q => q[1])), gr = g.createLinearGradient(0, y0, 0, y0 + 90); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fill();
  if (gloss) { g.save(); g.clip(); g.strokeStyle = `rgba(255,255,255,${gloss})`; g.lineWidth = 5; g.filter = 'blur(2px)'; g.beginPath(); g.moveTo(pts[0][0], pts[0][1] + 3); for (const q of pts) g.lineTo(q[0], q[1] + 3); g.stroke(); g.restore(); }
}
const curve = (x0, x1, base, amps) => { const o = []; for (let x = x0; x <= x1; x += 8) { let y = base; for (const [a, f, ph] of amps) y += a * sin(x * f + ph); o.push([x, y]); } return o; };
function tower(g, x, yb, yt, w) {
  const gr = g.createLinearGradient(x - w, 0, x + w, 0); gr.addColorStop(0, '#ffffff'); gr.addColorStop(.6, '#e8f3fb'); gr.addColorStop(1, '#a9c6dc');
  g.fillStyle = gr; g.beginPath(); g.moveTo(x - w, yb); g.lineTo(x - w * .45, yt); g.lineTo(x + w * .45, yt); g.lineTo(x + w, yb); g.closePath(); g.fill();
}
function scene(g, r) {
  /* sky: deep azure → pale aqua at the horizon */
  const sky = g.createLinearGradient(0, 0, 0, 260); sky.addColorStop(0, '#0d6fd6'); sky.addColorStop(.45, '#3aa3ef'); sky.addColorStop(.85, '#a5e0fb'); sky.addColorStop(1, '#d9f5ff');
  g.fillStyle = sky; g.fillRect(0, 0, 400, 400);
  /* the sun and its flare */
  let gr = g.createRadialGradient(SUN[0], SUN[1], 0, SUN[0], SUN[1], 120); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(.12, 'rgba(255,255,240,.7)'); gr.addColorStop(.4, 'rgba(255,255,255,.18)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 400, 400);
  for (const [k, rr, a] of [[.55, 9, .22], [.95, 16, .12], [1.35, 6, .25]]) { const x = SUN[0] + (200 - SUN[0]) * k, y = SUN[1] + (200 - SUN[1]) * k; g.strokeStyle = `rgba(255,255,255,${a})`; g.lineWidth = 1.2; g.beginPath(); g.arc(x, y, rr, 0, TAU); g.stroke(); g.fillStyle = `rgba(200,240,255,${a * .6})`; g.fill(); }
  for (const [x, y, s] of [[300, 70, 22], [180, 120, 14], [365, 150, 16], [95, 150, 12]]) cloud(g, x, y, s);
  /* the glossy swooshes and their halftone dot streaks */
  ribbon(g, -40, 190, 160, 40, 450, 70, 30, .32);
  ribbon(g, -30, 230, 220, 120, 440, 140, 12, .4);
  dotStreak(g, 20, 150, 200, 30, 420, 40, 3, 5, 2.2, .55);
  dotStreak(g, 120, 210, 280, 140, 430, 120, 2, 4.5, 1.6, .5);
  /* far turbine towers (blades are live) */
  tower(g, 96, 252, 186, 2.4); tower(g, 324, 250, 128, 4.2);
  /* hills, far to near, each with a glossy rim */
  hill(g, curve(-10, 410, 238, [[8, .018, .4], [5, .041, 2]]), '#9fdc7a', '#62b23d', .5);
  hill(g, curve(-10, 410, 258, [[10, .013, 2.6], [4, .05, .3]]), '#7fd23d', '#3f9a1e', .55);
  /* the meadow */
  gr = g.createLinearGradient(0, 270, 0, 400); gr.addColorStop(0, '#8ee23f'); gr.addColorStop(.5, '#58c21f'); gr.addColorStop(1, '#2f8f12');
  g.fillStyle = gr; g.beginPath(); g.moveTo(-10, 400); for (const q of curve(-10, 410, 280, [[6, .011, 1], [3, .04, 4]])) g.lineTo(q[0], q[1]); g.lineTo(410, 400); g.closePath(); g.fill();
  /* soft mown stripes */
  g.save(); g.globalAlpha = .05; g.fillStyle = '#fff'; for (let i = -4; i < 10; i++) { g.beginPath(); g.moveTo(i * 60, 400); g.lineTo(i * 60 + 30, 400); g.lineTo(200 + i * 6 + 3, 280); g.lineTo(200 + i * 6, 280); g.closePath(); g.fill(); } g.restore();
  /* daisies */
  for (let i = 0; i < 26; i++) {
    const y = r.range(292, 396), x = r.range(6, 394); if (abs(x - 200) < 90 && y < 350) continue;
    const s = .6 + (y - 290) / 110 * 1.2;
    g.fillStyle = 'rgba(255,255,255,.95)'; for (let k = 0; k < 6; k++) { const a = k * TAU / 6; g.beginPath(); g.ellipse(x + cos(a) * 2.2 * s, y + sin(a) * 1.3 * s, 1.7 * s, 1.1 * s, a, 0, TAU); g.fill(); }
    g.fillStyle = '#ffd21f'; g.beginPath(); g.arc(x, y, 1.3 * s, 0, TAU); g.fill();
  }
}
function blades(g, x, y, len, ang, w) {
  g.save(); g.translate(x, y);
  for (let i = 0; i < 3; i++) {
    g.save(); g.rotate(ang + i * TAU / 3);
    const gr = g.createLinearGradient(-w, 0, w, 0); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#b7d2e6'); g.fillStyle = gr;
    g.beginPath(); g.moveTo(-w * .6, 0); g.quadraticCurveTo(-w * 1.1, -len * .35, -w * .15, -len); g.lineTo(w * .25, -len * .98); g.quadraticCurveTo(w * .7, -len * .4, w * .6, 0); g.closePath(); g.fill(); g.restore();
  }
  g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, w * .9, 0, TAU); g.fill(); g.strokeStyle = 'rgba(120,160,190,.6)'; g.lineWidth = .8; g.stroke();
  g.restore();
}
/* a soap bubble: clear middle, iridescent edge, a window highlight and a small counter-glint */
function bubble(g, x, y, r, a = 1) {
  g.save(); g.globalAlpha = a;
  const gr = g.createRadialGradient(x - r * .2, y - r * .25, r * .1, x, y, r);
  gr.addColorStop(0, 'rgba(255,255,255,.04)'); gr.addColorStop(.72, 'rgba(190,240,255,.12)'); gr.addColorStop(.9, 'rgba(255,190,240,.32)'); gr.addColorStop(1, 'rgba(255,255,255,.7)');
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = max(.7, r * .05); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = max(1, r * .13); g.lineCap = 'round'; g.beginPath(); g.arc(x, y, r * .7, PI * 1.1, PI * 1.45); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.arc(x + r * .45, y + r * .45, max(.6, r * .08), 0, TAU); g.fill();
  g.restore();
}
function bubbles(g, S, t, back) {
  for (const b of S.bubbles) {
    if (b.back !== back) continue;
    const u = (b.ph + t * b.v) % 1, y = 420 - u * 470, x = b.x + sin(t * b.w + b.ph * 9) * 10, a = min(1, u * 6, (1 - u) * 5);
    bubble(g, x, y, b.r * (1 + .04 * sin(t * 3 + b.ph * 5)), a);
  }
}
/* the whole mascot as one fused lump of tangerine jelly, painted on its own layer so overlaps never double up:
   rounded parts plus a bridge that roots every limb in the body, a blurred inner depth along the true outline,
   a glowing core, air bubbles, light pooling at the bottom, a window gloss on top, and a jiggle when it moves */
/* round every corner of a convex polygon by radius r (clamped to half of each edge), sampled as points */
function roundPoly(P, r) {
  /* first merge corners closer than r, so a short edge can't leave a sharp point */
  let Q = P.slice();
  for (let it = 0; it < 4 && Q.length > 3; it++) {
    let k = -1, best = r * .9;
    for (let i = 0; i < Q.length; i++) { const a = Q[i], b = Q[(i + 1) % Q.length], l = hypot(a[0] - b[0], a[1] - b[1]); if (l < best) { best = l; k = i; } }
    if (k < 0) break; const a = Q[k], b = Q[(k + 1) % Q.length], mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    Q.splice(k, 1, mid); Q.splice((k + 1) % (Q.length), 1);
  }
  P = Q;
  const n = P.length, out = [];
  for (let i = 0; i < n; i++) {
    const a = P[(i + n - 1) % n], b = P[i], c = P[(i + 1) % n], la = hypot(a[0] - b[0], a[1] - b[1]), lc = hypot(c[0] - b[0], c[1] - b[1]); if (la < 1e-6 || lc < 1e-6) continue;
    const ra = min(r, la * .5), rc = min(r, lc * .5), p0 = [b[0] + (a[0] - b[0]) / la * ra, b[1] + (a[1] - b[1]) / la * ra], p1 = [b[0] + (c[0] - b[0]) / lc * rc, b[1] + (c[1] - b[1]) / lc * rc];
    for (let k = 0; k <= 5; k++) { const u = k / 5, v = 1 - u; out.push([v * v * p0[0] + 2 * v * u * b[0] + u * u * p1[0], v * v * p0[1] + 2 * v * u * b[1] + u * u * p1[1]]); }
  }
  return out;
}
const roundHull = pt => { const bb = bbox(pt.hull), m = min(bb[2] - bb[0], bb[3] - bb[1]); return roundPoly(pt.hull, pt.name === 'body' ? m * .38 : m * .5); };
function wobble(P, c, amp, t) {
  if (amp < .05) return P;
  return P.map(q => { const a = Math.atan2(q[1] - c[1], q[0] - c[0]), k = 1 + amp * .011 * sin(a * 3 + t * 15) + amp * .006 * sin(a * 5 - t * 11); return [c[0] + (q[0] - c[0]) * k, c[1] + (q[1] - c[1]) * k]; });
}
/* a limb's attached face pushed toward the body centre: fills the gap the body's rounded corners would leave */
function bridge(face, c, k) {
  const fc = centroid(face.pts), d = [(c[0] - fc[0]) * k, (c[1] - fc[1]) * k];
  const H = CM.hull(face.pts.map(q => [q[0], q[1]]).concat(face.pts.map(q => [q[0] + d[0], q[1] + d[1]]))), bb = bbox(H);
  return roundPoly(H, min(bb[2] - bb[0], bb[3] - bb[1]) * .4);
}
function shapes(M, amp, t) {
  const c = M.center, out = [];
  for (const pt of M.order) {
    out.push(roundHull(pt));
    if (pt.name[0] === 'l') out.push(bridge(pt.f.top, c, .32));
    else if (pt.name === 'armL') out.push(bridge(pt.f.right, c, .22));
    else if (pt.name === 'armR') out.push(bridge(pt.f.left, c, .22));
  }
  return out.map(P => wobble(P, c, amp, t));
}
const clearLayer = L => { L.g.save(); L.g.setTransform(1, 0, 0, 1, 0, 0); L.g.clearRect(0, 0, L.c.width, L.c.height); L.g.restore(); };
function jelly(g, M, S, t, env) {
  const c = M.center, U = shapes(M, S.jig, t), all = bbox(U.flat()), w = all[2] - all[0], h = all[3] - all[1];
  const body = M.parts.body, BP = wobble(roundHull(body), c, S.jig, t), bb = bbox(BP), bw = bb[2] - bb[0], bh = bb[3] - bb[1], m = min(bw, bh);
  const J = S.J, O = S.O, j = J.g, o = O.g, shape = q => { q.beginPath(); for (const P of U) path(q, P, true); };
  clearLayer(J); clearLayer(O);
  /* base: light top-left to deep bottom-right */
  let gr = j.createLinearGradient(all[0], all[1], all[0] + w * .6, all[3]);
  gr.addColorStop(0, K.light); gr.addColorStop(.4, K.mid); gr.addColorStop(1, K.deep);
  shape(j); j.fillStyle = gr; j.fill();
  /* everything after this stays inside the jelly */
  j.globalCompositeOperation = 'source-atop';
  /* a glowing core, as if the sun were caught inside */
  gr = j.createRadialGradient(c[0] + bw * .05, c[1] + bh * .12, 0, c[0], c[1] + bh * .1, max(bw, bh) * .55);
  gr.addColorStop(0, 'rgba(255,215,110,.4)'); gr.addColorStop(.6, 'rgba(255,180,70,.1)'); gr.addColorStop(1, 'rgba(255,190,90,0)'); j.fillStyle = gr; j.fillRect(all[0], all[1], w, h);
  /* the body's faces, rounded and faint, so the turn still reads */
  for (const f of body.faces) {
    if (!f.vis || f.name === 'front') continue; const fb = bbox(f.pts), fm = min(fb[2] - fb[0], fb[3] - fb[1]); if (fm < 2) continue;
    j.fillStyle = f.name === 'top' ? 'rgba(255,238,200,.3)' : f.name === 'bottom' ? 'rgba(150,40,0,.2)' : `rgba(170,50,5,${(.22 * (1 - f.light)).toFixed(3)})`;
    j.beginPath(); path(j, wobble(roundPoly(f.pts, fm * .45), c, S.jig, t), true); j.fill();
  }
  /* a soft crease where a nub sits in front of the body */
  for (const pt of M.order.slice(M.order.indexOf(body) + 1)) if (pt.name[0] === 'a') { j.strokeStyle = 'rgba(175,55,5,.22)'; j.lineWidth = m * .03; j.beginPath(); path(j, wobble(roundHull(pt), c, S.jig, t), true); j.stroke(); }
  /* jelly depth: stacked rings (the jelly minus its own insets) darken and thicken every edge; a thin pale one is the rim */
  const insets = d => { o.beginPath(); for (const P of U) { const q = bbox(P); if (min(q[2] - q[0], q[3] - q[1]) > d * 2.2) path(o, inset(P, d), true); } };
  const k = env.px, x0 = max(0, floor((all[0] - 4) * k)), y0 = max(0, floor((all[1] - 4) * k)), sw = min(O.c.width, ceil((all[2] + 4) * k)) - x0, sh = min(O.c.height, ceil((all[3] + 4) * k)) - y0;
  if (sw > 0 && sh > 0) {
    for (const [d, a] of [[m * .22, .14], [m * .14, .15], [m * .085, .17], [m * .045, .2], [m * .018, .22]]) { o.globalAlpha = a; o.fillStyle = K.edge; shape(o); o.fill(); o.globalAlpha = 1; o.globalCompositeOperation = 'destination-out'; insets(d); o.fill(); o.globalCompositeOperation = 'source-over'; }
    j.drawImage(O.c, x0, y0, sw, sh, x0 / k, y0 / k, sw / k, sh / k);
    clearLayer(O); o.fillStyle = 'rgba(255,236,210,.6)'; shape(o); o.fill(); o.globalCompositeOperation = 'destination-out'; insets(1.3); o.fill(); o.globalCompositeOperation = 'source-over';
    j.drawImage(O.c, x0, y0, sw, sh, x0 / k, y0 / k, sw / k, sh / k);
  }
  /* tiny air bubbles caught in the jelly, drifting up */
  for (const b of S.air) {
    const u = (b.ph + t * b.v) % 1, x = bb[0] + bw * (b.x + .03 * sin(t * 2 + b.ph * 9)), y = bb[3] - bh * (.12 + u * .78), r = b.r * m * .02, a = sin(PI * u) * .85;
    j.strokeStyle = `rgba(255,245,225,${a.toFixed(3)})`; j.lineWidth = .8; j.beginPath(); j.arc(x, y, r, 0, TAU); j.stroke();
    j.fillStyle = `rgba(255,255,255,${(a * .9).toFixed(3)})`; j.beginPath(); j.arc(x - r * .35, y - r * .35, r * .3, 0, TAU); j.fill();
  }
  /* light passing through, pooling at the bottom */
  gr = j.createRadialGradient(c[0], all[3], 0, c[0], all[3], w * .55);
  gr.addColorStop(0, 'rgba(255,225,120,.55)'); gr.addColorStop(.5, 'rgba(255,190,80,.16)'); gr.addColorStop(1, 'rgba(255,190,80,0)'); j.fillStyle = gr; j.fillRect(all[0], all[1], w, h);
  /* the glossy window: an inset cap over the top of the body */
  j.save(); j.beginPath(); path(j, inset(BP, m * .07), true); j.clip();
  gr = j.createLinearGradient(0, bb[1], 0, bb[1] + bh * .52);
  gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(.6, 'rgba(255,255,255,.2)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  j.fillStyle = gr; j.fillRect(bb[0], bb[1], bw, bh * .52);
  j.restore();
  /* hot spots: a big one on the body, small ones on the visible nubs and legs */
  j.fillStyle = 'rgba(255,255,255,.95)';
  j.beginPath(); j.ellipse(bb[0] + bw * .25, bb[1] + bh * .19, bw * .085, bh * .05, -.5, 0, TAU); j.fill();
  for (const pt of M.order) {
    if (pt === body) continue; const q = bbox(pt.s), lw = q[2] - q[0], lh = q[3] - q[1], leg = pt.name[0] === 'l';
    const x = q[0] + lw * .32, y = leg ? q[1] + lh * .66 : q[1] + lh * .28;
    if (CM.inPoly(x, y, BP)) continue;
    j.globalAlpha = .85; j.beginPath(); j.ellipse(x, y, max(1, lw * .13), max(1.2, lh * (leg ? .13 : .1)), leg ? 0 : -.5, 0, TAU); j.fill();
  }
  j.globalAlpha = 1; j.globalCompositeOperation = 'source-over';
  /* the layer goes down at once, translucent, so the meadow shows through */
  g.save(); g.globalAlpha = .93; env.stamp(g, J); g.restore();
}
function eyes(g, M) {
  for (const e of M.eyes) {
    if (!e.vis) continue; const sz = e.size;
    if (e.poly) {
      const bb = bbox(e.poly), gr = g.createLinearGradient(0, bb[1], 0, bb[3]);
      gr.addColorStop(0, '#2c0c02'); gr.addColorStop(.6, K.eye); gr.addColorStop(1, '#b8460f');
      g.fillStyle = gr; g.beginPath(); path(g, e.poly, true); g.fill();
      g.strokeStyle = 'rgba(255,230,200,.55)'; g.lineWidth = 1; g.stroke();
      if (e.open > .45) { g.fillStyle = '#fff'; g.beginPath(); g.ellipse(e.glint[0] - sz * .12, e.glint[1] - sz * .05, sz * .2, sz * .26, -.3, 0, TAU); g.fill(); g.globalAlpha = .7; g.beginPath(); g.arc(e.glint[0] + sz * .02, e.glint[1] + sz * .62, sz * .09, 0, TAU); g.fill(); g.globalAlpha = 1; }
    }
    if (e.lines.length) { g.strokeStyle = K.eyeLine; g.lineWidth = e.mode === 'dizzy' ? max(1.2, sz * .2) : max(1.8, sz * .34); g.lineCap = 'round'; g.lineJoin = 'round'; for (const l of e.lines) { g.beginPath(); path(g, l, false); g.stroke(); } }
  }
}
/* dizzy: little glossy four-point sparkles */
function sparkles(g, M, front) {
  for (const s of M.stars) {
    if (s.front !== front) continue; const r = 9 * s.k * (1 + s.z * .03);
    g.save(); g.translate(s.x, s.y); g.rotate(s.a * .8); g.globalAlpha = s.k;
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, r * 1.6); gr.addColorStop(0, 'rgba(255,255,255,.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r * 1.6, 0, TAU); g.fill();
    g.fillStyle = '#fff6a8'; g.strokeStyle = 'rgba(255,170,30,.9)'; g.lineWidth = 1;
    g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * PI / 4, q = i & 1 ? r * .28 : r; g.lineTo(cos(a) * q, sin(a) * q); } g.closePath(); g.fill(); g.stroke();
    g.restore();
  }
}
function zs(g, M) {
  const k = M.pose.sleep; if (k < .3) return; const t = M.pose.t || 0, top = M.top;
  g.save(); g.textAlign = 'center'; g.lineJoin = 'round';
  for (let i = 0; i < 3; i++) {
    const u = (t * .45 + i / 3) % 1, x = top[0] + 20 + u * 26 + sin(u * 6 + i) * 4, y = top[1] - 12 - u * 46;
    g.globalAlpha = k * sin(PI * u); g.font = `800 ${round(11 + u * 12)}px ${CM.FONT.sans}`;
    g.strokeStyle = 'rgba(20,110,200,.75)'; g.lineWidth = 3.5; g.strokeText('z', x, y); g.fillStyle = '#fff'; g.fillText('z', x, y);
  }
  g.restore();
}
CM.style({
  id: 'eaero', n: 29, title: 'Frutiger Aero', caption: 'Glossy eco-tech, mid-2000s',
  init(env) {
    const r = env.rnd;
    return {
      bg: env.layer(g => scene(g, r)),
      air: Array.from({ length: 6 }, () => ({ x: r.range(.15, .85), r: r.range(.6, 1.6), v: r.range(.05, .12), ph: r() })),
      jig: 0, last: null, J: env.layer(() => {}), O: env.layer(() => {}),
      bubbles: Array.from({ length: 14 }, (_, i) => ({ x: r.range(14, 386), r: r.range(5, 17), v: r.range(.035, .07), w: r.range(.6, 1.3), ph: r(), back: i % 5 !== 0 })),
    };
  },
  draw(g, env, rig, S) {
    const t = env.t, p = rig.pose;
    env.stamp(g, S.bg);
    blades(g, 96, 186, 22, t * 1.1 + 1, 2.2); blades(g, 324, 128, 46, t * .8, 4);
    bubbles(g, S, t, true);
    const M = CM.build(p, { cx: 200, cy: 214, s: 14 });
    /* the shadow, lit orange through the jelly */
    const c = centroid(M.shadow), sb = bbox(M.shadow), rx = (sb[2] - sb[0]) / 2, ry = (sb[3] - sb[1]) / 2;
    g.save(); g.globalAlpha = M.shadowAlpha; g.translate(c[0], c[1]); g.scale(1, ry / rx);
    let gr = g.createRadialGradient(0, 0, 0, 0, 0, rx * 1.05); gr.addColorStop(0, 'rgba(255,150,40,.55)'); gr.addColorStop(.35, 'rgba(230,120,30,.35)'); gr.addColorStop(.7, 'rgba(30,90,10,.28)'); gr.addColorStop(1, 'rgba(30,90,10,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, rx * 1.05, 0, TAU); g.fill(); g.restore();
    sparkles(g, M, false);
    /* jiggle: a spring fed by how fast the pose moves */
    const L = S.last;
    if (L) S.jig = min(5, S.jig * .9 + (abs(p.yaw - L[0]) + abs(p.pitch - L[1]) + abs(p.roll - L[2]) + abs(p.hop - L[3]) * .15 + abs(p.sq - L[4]) * 2) * 7);
    S.last = [p.yaw, p.pitch, p.roll, p.hop, p.sq];
    jelly(g, M, S, t, env);
    eyes(g, M);
    sparkles(g, M, true);
    bubbles(g, S, t, false);
    zs(g, M);
  },
});
}
})();
