/* Clawd in Twenty-Eight Styles — henrik-styles.js
   Styles 21–28: Henrik's experiments, eight looks from an upcoming project, re-drawn around Clawd.
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
})();
