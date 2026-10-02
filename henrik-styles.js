/* Clawd in Fifty-Two Styles — henrik-styles.js
   Styles 21–29: Henrik's experiments, nine looks from an upcoming project, re-drawn around Clawd.
   Styles 30–48: after the plates of “Superman in Flight”, nineteen looks from tomb plaster to embroidery.
   Styles 49–51: a Y2K trio, liquid chrome, a media player skin and a holo foil sticker.
   Style 52: the Windows Vista desktop, Aero glass and all.
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
/* round a polygon's corners by about r px: resample its outline at N even steps, then blur the points along it.
   Everything here moves continuously with the input, so a turning part never snaps (merging or clamping corners did) */
function roundPoly(P, r, N = 32) {
  const n = P.length, L = [0];
  for (let i = 0; i < n; i++) { const a = P[i], b = P[(i + 1) % n]; L.push(L[i] + hypot(b[0] - a[0], b[1] - a[1])); }
  const per = L[n]; if (per < 1e-3) return P.slice();
  const step = per / N, X = new Float64Array(N), Y = new Float64Array(N), TX = new Float64Array(N), TY = new Float64Array(N);
  for (let k = 0, i = 0; k < N; k++) {
    const d = k * step; while (i < n - 1 && L[i + 1] < d) i++;
    const a = P[i], b = P[(i + 1) % n], u = (d - L[i]) / (L[i + 1] - L[i] || 1); X[k] = a[0] + (b[0] - a[0]) * u; Y[k] = a[1] + (b[1] - a[1]) * u;
  }
  /* each [¼ ½ ¼] pass spreads by √½ sample: pick the pass count from the radius wanted */
  const passes = min(240, round(2 * (r / step) ** 2));
  for (let p = 0; p < passes; p++) {
    TX.set(X); TY.set(Y);
    for (let k = 0; k < N; k++) { const a = (k + N - 1) % N, c = (k + 1) % N; X[k] = .25 * TX[a] + .5 * TX[k] + .25 * TX[c]; Y[k] = .25 * TY[a] + .5 * TY[k] + .25 * TY[c]; }
  }
  const Q = new Array(N); for (let k = 0; k < N; k++) Q[k] = [X[k], Y[k]];
  return Q;
}
/* the jelly body hangs a little lower than the model's box: every bottom corner (y bit clear) is pushed down along its edge */
/* the jiggle: the whole jelly squashes and stretches about the point between its feet, so nothing drifts or twitches */
const squish = (g, M, S) => { const fy = max(...M.feet.map(q => q[1])), a = S.wob || 0; g.translate(M.center[0], fy); g.scale(1 + a, 1 - a); g.translate(-M.center[0], -fy); };
const DROP = .03, FACE_IX = { front: [4, 5, 7, 6], back: [1, 0, 2, 3], right: [5, 1, 3, 7], left: [0, 4, 6, 2], top: [6, 7, 3, 2], bottom: [0, 1, 5, 4] };
const bodyPts = pt => pt.s.map((q, i) => i & 2 ? [q[0], q[1]] : [q[0] + (q[0] - pt.s[i + 2][0]) * DROP, q[1] + (q[1] - pt.s[i + 2][1]) * DROP]);
const roundHull = pt => {
  const H = pt.name === 'body' ? CM.hull(bodyPts(pt)) : pt.hull, bb = bbox(H), m = min(bb[2] - bb[0], bb[3] - bb[1]);
  return pt.name === 'body' ? roundPoly(H, m * .13, 64) : roundPoly(H, m * .2);
};
/* a limb's attached face pushed toward the body centre: fills the gap the body's rounded corners would leave */
function bridge(face, c, k) {
  const fc = centroid(face.pts), d = [(c[0] - fc[0]) * k, (c[1] - fc[1]) * k];
  const H = CM.hull(face.pts.map(q => [q[0], q[1]]).concat(face.pts.map(q => [q[0] + d[0], q[1] + d[1]]))), bb = bbox(H);
  return roundPoly(H, min(bb[2] - bb[0], bb[3] - bb[1]) * .2);
}
/* a leg's hip: flared sideways (across the leg's own axis) where it meets the body, tapering into the leg,
   so it grows out of the body. Box corners: x = bit 0, y = bit 1, z = bit 2, so 2,3,6,7 are the top and 0,1,4,5 the bottom */
function hip(pt) {
  const tc = centroid([2, 3, 6, 7].map(i => pt.s[i])), bc = centroid([0, 1, 4, 5].map(i => pt.s[i]));
  const L = hypot(bc[0] - tc[0], bc[1] - tc[1]) || 1, u = [(bc[0] - tc[0]) / L, (bc[1] - tc[1]) / L], n = [-u[1], u[0]];
  let hw = 0; for (const q of pt.s) hw = max(hw, abs((q[0] - tc[0]) * n[0] + (q[1] - tc[1]) * n[1]));
  const D = CM.DIM, fb = (.45 + DROP * D.BH) / (D.LH + .45);
  const at = (along, side) => [tc[0] + u[0] * along + n[0] * side, tc[1] + u[1] * along + n[1] * side];
  const H = CM.hull([at(L * (fb - .3), -hw), at(L * (fb - .3), hw), at(L * fb, -hw * 1.35), at(L * fb, hw * 1.35), at(L * (fb + .3), -hw * .95), at(L * (fb + .3), hw * .95)]);
  return roundPoly(H, hw * .35);
}
function shapes(M) {
  const c = M.center, out = [];
  for (const pt of M.order) {
    out.push(roundHull(pt));
    if (pt.name[0] === 'l') { out.push(bridge(pt.f.top, c, .32)); out.push(hip(pt)); }
    else if (pt.name === 'armL') out.push(bridge(pt.f.right, c, .22));
    else if (pt.name === 'armR') out.push(bridge(pt.f.left, c, .22));
  }
  return out;
}
const clearLayer = L => { L.g.save(); L.g.setTransform(1, 0, 0, 1, 0, 0); L.g.clearRect(0, 0, L.c.width, L.c.height); L.g.restore(); };
function jelly(g, M, S, t, env) {   // drawn unsquashed on its layer, squeezed by slim() when stamped
  const c = M.center, U = shapes(M), all = bbox(U.flat()), w = all[2] - all[0], h = all[3] - all[1];
  const body = M.parts.body, BP = roundHull(body), bb = bbox(BP), bw = bb[2] - bb[0], bh = bb[3] - bb[1], m = min(bw, bh);
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
  const BS = bodyPts(body);
  for (const f of body.faces) {
    if (!f.vis || f.name === 'front') continue; const fb = bbox(f.pts), fm = min(fb[2] - fb[0], fb[3] - fb[1]); if (fm < 2) continue;
    j.fillStyle = f.name === 'top' ? 'rgba(255,238,200,.3)' : f.name === 'bottom' ? 'rgba(150,40,0,.2)' : `rgba(170,50,5,${(.22 * (1 - f.light)).toFixed(3)})`;
    j.beginPath(); path(j, roundPoly(FACE_IX[f.name].map(i => BS[i]), fm * .2), true); j.fill();
  }
  /* a soft crease where a nub sits in front of the body */
  for (const [arm, side] of [['armL', 'left'], ['armR', 'right']]) {
    const k = CM.clamp(-CM.area(body.f[side].pts) / (m * m * .25), 0, 1); if (k < .01) continue;   // fades in as that side of the body turns toward us
    j.strokeStyle = `rgba(175,55,5,${(.22 * k).toFixed(3)})`; j.lineWidth = m * .03; j.beginPath(); path(j, roundHull(M.parts[arm]), true); j.stroke();
  }
  /* jelly depth: stacked rings (the jelly minus its own insets) darken and thicken every edge; a thin pale one is the rim */
  const insets = d => { o.beginPath(); for (const P of U) { const q = bbox(P); path(o, inset(P, min(d, min(q[2] - q[0], q[3] - q[1]) * .4)), true); } };
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
    const x = q[0] + lw * .32, y = leg ? q[1] + lh * .8 : q[1] + lh * .28;
    const k = CM.clamp(1 - edgeNear(x, y, BP).d / 6, 0, 1); if (k < .01) continue;   // fades as it slips behind the body
    j.globalAlpha = .85 * k; j.beginPath(); j.ellipse(x, y, max(1, lw * .13), max(1.2, lh * (leg ? .13 : .1)), leg ? 0 : -.5, 0, TAU); j.fill();
  }
  j.globalAlpha = 1; j.globalCompositeOperation = 'source-over';
  /* the layer goes down at once, translucent, so the meadow shows through */
  g.save(); g.globalAlpha = .93; squish(g, M, S); env.stamp(g, J); g.restore();
  return BP;
}
/* eyes live in the jelly: clipped to the rounded body, so they slide out of sight round a corner instead of poking out */
/* nearest point on a polygon's edge, and the signed distance to it (positive inside) */
function edgeNear(x, y, P) {
  let d = 1e9, q = P[0];
  for (let i = 0, n = P.length; i < n; i++) {
    const a = P[i], b = P[(i + 1) % n], vx = b[0] - a[0], vy = b[1] - a[1], l = vx * vx + vy * vy || 1, k = CM.clamp(((x - a[0]) * vx + (y - a[1]) * vy) / l, 0, 1);
    const px = a[0] + vx * k, py = a[1] + vy * k, dd = hypot(x - px, y - py); if (dd < d) { d = dd; q = [px, py]; }
  }
  return { d: CM.inPoly(x, y, P) ? d : -d, q };
}
/* eyes live in the jelly: near the rounded edge an eye is nudged back onto the body and narrowed a little,
   as if it wrapped round the curve, so both eyes always stay on the body and never stick out */
function eyes(g, M, BP) {
  g.save(); g.beginPath(); path(g, inset(BP, 1.5), true); g.clip();
  const ctr = centroid(BP);
  for (const e of M.eyes) {
    if (!e.vis) continue;
    const sz = e.size, keep = sz * 1.15, { d, q } = edgeNear(e.c[0], e.c[1], BP);
    let dx = 0, dy = 0, sc = 1;
    if (d < keep) {
      let nx = e.c[0] - q[0], ny = e.c[1] - q[1], nl = hypot(nx, ny);
      if (d < 0 || nl < 1e-3) { nx = ctr[0] - q[0]; ny = ctr[1] - q[1]; nl = hypot(nx, ny) || 1; }
      nx /= nl; ny /= nl; dx = q[0] + nx * keep - e.c[0]; dy = q[1] + ny * keep - e.c[1];
      sc = .7 + .3 * CM.clamp(d / keep, 0, 1);
    }
    g.save(); g.translate(e.c[0] + dx, e.c[1] + dy); g.scale(sc, sc); g.translate(-e.c[0], -e.c[1]);
    if (e.poly) {
      const bb = bbox(e.poly), gr = g.createLinearGradient(0, bb[1], 0, bb[3]);
      gr.addColorStop(0, '#2c0c02'); gr.addColorStop(.6, K.eye); gr.addColorStop(1, '#b8460f');
      g.fillStyle = gr; g.beginPath(); path(g, e.poly, true); g.fill();
      g.strokeStyle = 'rgba(255,230,200,.55)'; g.lineWidth = 1; g.stroke();
      if (e.open > .45) { g.fillStyle = '#fff'; g.beginPath(); g.ellipse(e.glint[0] - sz * .12, e.glint[1] - sz * .05, sz * .2, sz * .26, -.3, 0, TAU); g.fill(); g.globalAlpha = .7; g.beginPath(); g.arc(e.glint[0] + sz * .02, e.glint[1] + sz * .62, sz * .09, 0, TAU); g.fill(); g.globalAlpha = 1; }
    }
    if (e.lines.length) { g.strokeStyle = K.eyeLine; g.lineWidth = e.mode === 'dizzy' ? max(1.2, sz * .2) : max(1.8, sz * .34); g.lineCap = 'round'; g.lineJoin = 'round'; for (const l of e.lines) { g.beginPath(); path(g, l, false); g.stroke(); } }
    g.restore();
  }
  g.restore();
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
    /* jiggle: a spring fed by how fast the pose moves, decaying in about half a second */
    const L = S.last;
    if (L) S.jig = min(5, S.jig * .9 + (abs(p.yaw - L[0]) + abs(p.pitch - L[1]) + abs(p.roll - L[2]) + abs(p.hop - L[3]) * .15 + abs(p.sq - L[4]) * 2) * 7);
    S.last = [p.yaw, p.pitch, p.roll, p.hop, p.sq]; S.wob = S.jig * .008 * sin(t * 14);
    g.save(); squish(g, M, S); sparkles(g, M, false); g.restore();
    const BP = jelly(g, M, S, t, env);
    g.save(); squish(g, M, S);
    eyes(g, M, BP);
    sparkles(g, M, true);
    g.restore();
    bubbles(g, S, t, false);
    zs(g, M);
  },
});
}

/* ═════════════════════════════════════════════════════════════════════════════
   30–48 · after the plates of “Superman in Flight”: a film that carries one hero
   through twenty plates of art history. Nineteen of those looks, re-drawn around Clawd.
   ═════════════════════════════════════════════════════════════════════════════ */
const { sqrt, atan2 } = Math;
/* the face colour in a palette {top, front, side, leg, legDark} */
function tone(f, P) { return f.part[0] === 'l' ? (f.name === 'front' ? P.leg : P.legDark) : f.name === 'top' ? P.top : f.name === 'front' ? P.front : P.side; }
/* one readback at init: a cols×rows on/off grid of whatever fn draws (lettering, motifs) */
function mask(cols, rows, fn) {
  const L = CM.canvas(cols, rows); fn(L.g, cols, rows);
  const d = L.g.getImageData(0, 0, cols, rows).data, out = new Uint8Array(cols * rows);
  for (let k = 0; k < out.length; k++) out[k] = d[k * 4 + 3] > 110 ? 1 : 0;
  return out;
}
/* paper, plaster, linen: a flat ground, soft blotches from a low-res fbm field, and a scatter of grain */
function ground(g, base, blot, seed, o = {}) {
  g.fillStyle = base; g.fillRect(0, 0, 400, 400);
  const n = 64, L = CM.canvas(n, n), id = L.g.createImageData(n, n), B = CM.hex2rgb(blot), amt = o.amt == null ? .22 : o.amt;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const v = CM.fbm2(i / 14, j / 14, seed, 4), k = (j * n + i) * 4;
    id.data[k] = B[0]; id.data[k + 1] = B[1]; id.data[k + 2] = B[2]; id.data[k + 3] = max(0, v + .15) * amt * 255;
  }
  L.g.putImageData(id, 0, 0); g.imageSmoothingEnabled = true; g.drawImage(L.c, 0, 0, 400, 400);
  if (o.grain !== 0) { const r = CM.RNG(seed + 7); g.fillStyle = CM.alpha(blot, o.grainA || .18); for (let i = 0; i < (o.grain || 2600); i++) g.fillRect(r() * 400, r() * 400, r.range(.4, 1.3), r.range(.4, 1.3)); }
}
/* paint Clawd part by part, back to front (M.order): fill(face) for each visible face, then line(part).
   A part drawn later covers the lines of the parts behind it, so a leg's edges never show through the body. */
function paintParts(M, fill, line) { for (const pt of M.order) { for (const f of pt.faces) if (f.vis) fill(f); if (line) line(pt); } }
/* one part's edges worth inking: silhouettes and creases, never hidden ones or the seams where a limb is glued on */
const inkEdges = pt => pt.edges.filter(e => e.kind !== 'hidden' && !e.attached);
function strokeEdges(g, pt, color, lw) { g.strokeStyle = color; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath(); for (const e of inkEdges(pt)) { g.moveTo(e.a[0], e.a[1]); g.lineTo(e.b[0], e.b[1]); } g.stroke(); }
/* the whole figure's outer contour only: every hull stroked at double width, to be covered by the fills drawn next */
function contour(g, M, color, lw) { g.lineJoin = 'round'; g.strokeStyle = color; g.lineWidth = lw * 2; g.beginPath(); for (const h of M.hulls) CM.path(g, h); g.stroke(); }
/* a 3×5 pixel font (sampler stitches, handheld LCD): five rows of three bits per glyph */
const PIX = { A: '25755', B: '65656', C: '34443', D: '65556', E: '74647', F: '74644', G: '34553', H: '55755', I: '72227', J: '11152', K: '55655', L: '44447', M: '57755',
  N: '65555', O: '25552', P: '65644', Q: '25573', R: '65655', S: '34216', T: '72222', U: '55557', V: '55552', W: '55775', X: '55255', Y: '55222', Z: '71247',
  0: '75557', 1: '26227', 2: '61247', 3: '61216', 4: '55711', 5: '74616', 6: '34757', 7: '71122', 8: '75757', 9: '75716',
  '~': '03600', '/': '11244', '♥': '57720', x: '05250', '.': '00002', '·': '00200', ':': '02020', '-': '00700', '!': '22202', '$': '36236', ' ': '00000' };
/* calls dot(x, y) for every lit pixel of str set at (x, y); returns the width in pixels */
function pixText(str, x, y, dot) {
  let cx = x;
  for (const ch of str) { const G = PIX[ch] || PIX[' ']; for (let r = 0; r < 5; r++) { const b = +G[r]; for (let c = 0; c < 3; c++) if (b >> (2 - c) & 1) dot(cx + c, y + r); } cx += 4; }
  return cx - x - 1;
}

/* ═════════ 30 · Tomb painting (Thebes, c. 1300 BC) ═════════ */
{
const P = { wall: '#dcbf86', blot: '#a07843', ink: '#2b1b12', red: '#b5432a', blue: '#2f5f9e', green: '#3d7c58', gold: '#d8a630', linen: '#f1ead6',
  top: '#e39468', front: '#c25a3b', side: '#9b432c', leg: '#b9533a', legDark: '#8c3b27' };
const BAND = [P.red, P.blue, P.green, P.gold];
/* hieroglyphs, each centred on (x, y) in a cell of size s */
const HIERO = {
  sun(g, x, y, s) { g.strokeStyle = P.red; g.lineWidth = s * .09; g.beginPath(); g.arc(x, y, s * .3, 0, TAU); g.stroke(); g.fillStyle = P.red; g.beginPath(); g.arc(x, y, s * .08, 0, TAU); g.fill(); },
  ankh(g, x, y, s) { g.strokeStyle = P.blue; g.lineWidth = s * .1; g.lineCap = 'round'; g.beginPath(); g.ellipse(x, y - s * .22, s * .12, s * .16, 0, 0, TAU); g.moveTo(x - s * .26, y); g.lineTo(x + s * .26, y); g.moveTo(x, y - s * .06); g.lineTo(x, y + s * .4); g.stroke(); },
  water(g, x, y, s) { g.strokeStyle = P.blue; g.lineWidth = s * .08; g.lineJoin = 'miter'; for (const dy of [-.1, .12]) { g.beginPath(); for (let k = 0; k <= 6; k++) g.lineTo(x - s * .36 + k * s * .12, y + dy * s + (k & 1 ? -1 : 1) * s * .06); g.stroke(); } },
  feather(g, x, y, s) { g.fillStyle = P.green; g.beginPath(); g.moveTo(x, y + s * .42); g.quadraticCurveTo(x - s * .24, y - s * .1, x + s * .05, y - s * .42); g.quadraticCurveTo(x + s * .18, y, x, y + s * .42); g.fill(); },
  bread(g, x, y, s) { g.fillStyle = P.blue; g.beginPath(); g.arc(x, y + s * .14, s * .26, PI, 0); g.closePath(); g.fill(); },
  eye(g, x, y, s) {
    g.strokeStyle = P.ink; g.lineWidth = s * .07; g.beginPath(); g.moveTo(x - s * .34, y); g.quadraticCurveTo(x, y - s * .24, x + s * .3, y); g.quadraticCurveTo(x, y + s * .18, x - s * .34, y); g.stroke();
    g.fillStyle = P.ink; g.beginPath(); g.arc(x, y - s * .02, s * .08, 0, TAU); g.fill(); g.beginPath(); g.moveTo(x - s * .05, y + s * .1); g.lineTo(x - s * .1, y + s * .34); g.stroke();
  },
  reed(g, x, y, s) { g.strokeStyle = P.green; g.lineWidth = s * .08; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y + s * .4); g.lineTo(x, y - s * .38); g.moveTo(x, y - s * .1); g.quadraticCurveTo(x + s * .24, y - s * .24, x + s * .2, y - s * .44); g.stroke(); },
  snake(g, x, y, s) { g.strokeStyle = P.ink; g.lineWidth = s * .09; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - s * .34, y + s * .2); g.bezierCurveTo(x - s * .1, y - s * .2, x + s * .1, y + s * .3, x + s * .3, y - s * .1); g.lineTo(x + s * .34, y - s * .26); g.stroke(); },
};
CM.style({
  id: 'stomb', n: 30, title: 'Tomb Painting', caption: 'Thebes, c. 1300 BC',
  init(env) {
    return { bg: env.layer(g => {
      ground(g, P.wall, P.blot, 30, { amt: .34 });
      /* a border of painted squares, then the khekher frieze along the top */
      const B = 10;
      for (let k = 0; k < 40; k++) for (const [x, y] of [[k * B, 0], [k * B, 400 - B], [0, k * B], [400 - B, k * B]]) { g.fillStyle = BAND[k % 4]; g.fillRect(x, y, B, B); }
      g.strokeStyle = P.ink; g.lineWidth = 1.4; g.strokeRect(B, B, 400 - 2 * B, 400 - 2 * B);
      for (let k = 0, x = 16; x < 380; k++, x += 11) {
        g.fillStyle = BAND[k % 4]; g.beginPath(); g.moveTo(x, 46); g.lineTo(x, 22); g.arc(x + 4, 22, 4, PI, 0); g.lineTo(x + 8, 46); g.closePath(); g.fill();
        g.strokeStyle = P.ink; g.lineWidth = 1; g.stroke(); g.fillStyle = P.wall; g.fillRect(x + 2.5, 30, 3, 3);
      }
      g.fillStyle = P.blue; g.fillRect(B, 48, 400 - 2 * B, 6); g.fillStyle = P.ink; g.fillRect(B, 54, 400 - 2 * B, 1.5);
      /* a column of glyphs on the left, a cartouche on the right */
      g.strokeStyle = P.ink; g.lineWidth = 1.4;
      for (const x of [24, 70]) { g.beginPath(); g.moveTo(x, 64); g.lineTo(x, 340); g.stroke(); }
      ['feather', 'sun', 'ankh', 'water', 'snake', 'reed', 'eye', 'bread', 'ankh'].forEach((k, i) => HIERO[k](g, 47, 84 + i * 30, 26));
      g.strokeStyle = P.ink; g.lineWidth = 2.4; g.beginPath(); g.roundRect(334, 70, 40, 226, 20); g.stroke();
      g.beginPath(); g.moveTo(328, 304); g.lineTo(380, 304); g.stroke();
      ['bread', 'water', 'reed', 'eye', 'snake', 'sun'].forEach((k, i) => HIERO[k](g, 354, 96 + i * 35, 28));
      HIERO.ankh(g, 354, 324, 24);
      /* the ground line and a few plaster cracks */
      g.fillStyle = P.ink; g.fillRect(76, 339, 250, 2.6);
      const r = CM.RNG(301); g.strokeStyle = 'rgba(60,35,15,.4)'; g.lineWidth = .8;
      for (const [x0, y0] of [[110, 70], [300, 360], [260, 80]]) { let x = x0, y = y0, a = r() * TAU; g.beginPath(); g.moveTo(x, y); for (let i = 0; i < 14; i++) { a += r.gauss() * .5; x += cos(a) * 6; y += sin(a) * 6; g.lineTo(x, y); } g.stroke(); }
    }) };
  },
  draw(g, env, rig, S) {
    const p = rig.pose, t = env.t, M = CM.build(p, { cx: 200, cy: 255, s: 11.2 });
    env.stamp(g, S.bg);
    /* the sun disc carried overhead */
    const hx = M.top[0], hy = M.top[1] - 46 + sin(t * 1.3) * 3;
    g.fillStyle = P.gold; g.strokeStyle = P.red; g.lineWidth = 3; g.beginPath(); g.arc(hx, hy, 24, 0, TAU); g.fill(); g.stroke();
    g.strokeStyle = CM.alpha(P.red, .45); g.lineWidth = 1; g.beginPath(); g.arc(hx, hy, 18, 0, TAU); g.stroke();
    CM.drawStars(g, M, false, { fill: P.gold, ink: P.ink });
    /* flat earth pigments inside a dark contour, the way the tomb painters filled their outlines */
    g.lineJoin = 'round'; CM.unionOutline(g, M, 2.2, P.ink, P.front);
    paintParts(M, f => CM.fillPoly(g, f.pts, tone(f, P)), pt => {
    if (pt.name === 'body' && M.frontVis) {
      /* a pleated linen kilt and a gold belt across the bottom of the front face */
      const kilt = [M.F(-6, 0), M.F(6, 0), M.F(6, 1.9), M.F(-6, 1.9)];
      CM.fillPoly(g, kilt, P.linen); g.strokeStyle = CM.alpha(P.ink, .35); g.lineWidth = .8; g.beginPath();
      for (let x = -5; x <= 5; x += 1.25) { const a = M.F(x, 0), b = M.F(x + .4, 1.9); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); } g.stroke();
      CM.strokePoly(g, [M.F(-6, 1.9), M.F(6, 1.9)], P.gold, 2.4, false);
    }
    strokeEdges(g, pt, P.ink, 1.2);
    });
    /* eyes with a kohl line swept out towards the temples */
    for (const e of M.eyes) if (e.vis && e.poly) {
      const s = e.size; g.strokeStyle = P.ink; g.lineWidth = max(1.2, s * .2); g.lineCap = 'round';
      g.beginPath(); g.moveTo(e.c[0] + e.side * s * .45, e.c[1] + s * .25); g.quadraticCurveTo(e.c[0] + e.side * s * 1.2, e.c[1] + s * .4, e.c[0] + e.side * s * 1.5, e.c[1]); g.stroke();
    }
    CM.drawEyes(g, M, { color: P.ink, glint: false });
    CM.drawStars(g, M, true, { fill: P.gold, ink: P.ink });
    CM.drawZzz(g, M, { color: P.ink });
  },
});
}

/* ═════════ 31 · Mosaic (Pompeii, c. 79 AD) ═════════ */
{
const N = 56, T = 400 / N;
const P = { grout: '#857b69', cream: '#e8dec6', black: '#2c2723', ochre: '#c49a58', red: '#a5452f', sea: '#3b76a6', sea2: '#6ca5c9', foam: '#dbe7ea', fish: '#4b5560',
  top: '#eaa47e', front: '#cf6a48', side: '#9c4a33', leg: '#bd5d40', legDark: '#8e432e', rim: '#5b2a1e', eye: '#1e1a17' };
const KEY = ['#######.', '#.....#.', '#.###.#.', '#.#.#.#.', '#.#...#.', '#.#####.'];
const FISH = ['...##.....', '.#######.#', '##########', '.#######.#', '...#.#....'];
const BAN = [14, 10, 42, 18];                   // banner cells: x0, y0, x1, y1
const SEA = 42;                                 // first row of the sea
/* one tessera: the grid cell, slightly irregular in size and seating, its colour nudged per stone */
function tess(g, x, y, w, c, i, j, k = 1) {
  const h = CM.hash2(i, j, 31), h2 = CM.hash2(i, j, 32), h3 = CM.hash2(i, j, 33);
  g.fillStyle = CM.shade(c, k * (.9 + h3 * .16)); g.fillRect(x + .55 + (h - .5) * .7, y + .55 + (h2 - .5) * .7, w - 1.1 - h2 * .5, w - 1.1 - h * .5);
}
function fieldColor(i, j) {
  const e = min(i, j, N - 1 - i, N - 1 - j);
  if (e < 2) return P.black;
  if (e < 8) { const along = e === i || e === N - 1 - i ? j : i, row = e - 2; return KEY[row][along % 8] === '#' ? P.black : P.cream; }
  if (e === 9) return P.red;
  if (j >= SEA && e > 9) { if (j === SEA) return P.foam; return ((j * 3 + round(2.2 * sin(i * .45 + j))) % 4 === 0) ? P.sea2 : P.sea; }
  return CM.hash2(i, j, 5) < .03 ? P.ochre : P.cream;
}
CM.style({
  id: 'smosaic', n: 31, title: 'Mosaic', caption: 'Pompeii, c. 79 AD',
  init(env) {
    const col = [];
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) col.push(fieldColor(i, j));
    /* the banner is laid in half-size stones so its letters read */
    const bw = (BAN[2] - BAN[0] + 1) * 2, bh = (BAN[3] - BAN[1] + 1) * 2;
    const txt = mask(bw, bh, (g, w, h) => { g.fillStyle = '#000'; g.font = `700 ${h * .62}px ${CM.FONT.caslon}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('CLAVDIVS', w / 2, h / 2 + 1); });
    const bg = env.layer(g => {
      g.fillStyle = P.grout; g.fillRect(0, 0, 400, 400);
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        if (i >= BAN[0] && i <= BAN[2] && j >= BAN[1] && j <= BAN[3]) continue;
        tess(g, i * T, j * T, T, col[j * N + i], i, j);
      }
      for (let j = 0; j < bh; j++) for (let i = 0; i < bw; i++) {
        const edge = i < 2 || j < 2 || i >= bw - 2 || j >= bh - 2;
        tess(g, BAN[0] * T + i * T / 2, BAN[1] * T + j * T / 2, T / 2, edge || txt[j * bw + i] ? P.black : P.cream, i + 99, j);
      }
    });
    return { bg, col };
  },
  draw(g, env, rig, S) {
    const p = rig.pose, t = env.t, M = CM.build(p, { cx: 200, cy: 236, s: 12 }), G = cells(M, N, N, [0, 0, 400, 400]), { C } = G;
    env.stamp(g, S.bg);
    /* a fish crossing the sea, one stone at a time */
    const fx = floor(t * 2.4) % (N + 14) - 12, fy = SEA + 2;
    FISH.forEach((row, r) => { for (let c = 0; c < row.length; c++) if (row[c] === '#') { const i = fx + row.length - 1 - c, j = fy + r; if (i > 9 && i < N - 10 && j < N - 10) tess(g, i * T, j * T, T, P.fish, i, j); } });
    /* the shadow: darker stones of the floor under the feet */
    const sb = CM.bbox(M.shadow);
    for (let j = max(0, floor(sb[1] / T)); j <= min(N - 1, floor(sb[3] / T)); j++) for (let i = max(0, floor(sb[0] / T)); i <= min(N - 1, floor(sb[2] / T)); i++)
      if (!C[j * N + i] && CM.inPoly((i + .5) * T, (j + .5) * T, M.shadow)) { g.fillStyle = P.grout; g.fillRect(i * T, j * T, T, T); tess(g, i * T, j * T, T, S.col[j * N + i], i, j, .72); }
    /* Clawd, outlined in a single row of dark stones (opus vermiculatum) */
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const c = C[j * N + i]; if (!c) continue;
      g.fillStyle = P.grout; g.fillRect(i * T, j * T, T, T);
      tess(g, i * T, j * T, T, c.eye ? P.eye : c.rim ? P.rim : tone(c.f, P), i, j, c.eye || c.rim ? 1 : min(1.08, .86 + .26 * c.f.light));
    }
    CM.drawStars(g, M, true, { fill: P.ochre, ink: P.black });
    CM.drawZzz(g, M, { color: P.black });
  },
});
}

/* ═════════ 32 · Stained glass (Gothic lancet, c. 1220) ═════════ */
{
const LEAD = '#151317';
const GL = { top: '#f3a15e', front: '#e0632f', side: '#a63422', leg: '#c9532a', legDark: '#8e2c1d' };
/* a pointed (drop) arch: sides are arcs of radius r centred on the opposite side's springing */
function lancet(xL, xR, ys, yb, r) {
  const c = xL + r, m = (xL + xR) / 2, dy = sqrt(r * r - (c - m) ** 2), a1 = atan2(-dy, m - c) + TAU, L = [];
  for (let k = 0; k <= 18; k++) { const a = PI + (a1 - PI) * k / 18; L.push([c + r * cos(a), ys + r * sin(a)]); }
  return [[xL, yb], ...L, ...L.slice(0, -1).reverse().map(q => [xL + xR - q[0], q[1]]), [xR, yb]];
}
/* keep the part of poly nearer to a than to b */
function clipHalf(poly, a, b) {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, nx = b[0] - a[0], ny = b[1] - a[1], out = [], side = q => (q[0] - mx) * nx + (q[1] - my) * ny;
  for (let i = 0; i < poly.length; i++) {
    const P0 = poly[i], P1 = poly[(i + 1) % poly.length], s0 = side(P0), s1 = side(P1);
    if (s0 <= 0) out.push(P0);
    if ((s0 <= 0) !== (s1 <= 0)) { const k = s0 / (s0 - s1); out.push([P0[0] + (P1[0] - P0[0]) * k, P0[1] + (P1[1] - P0[1]) * k]); }
  }
  return out;
}
const voronoi = (pts, box) => pts.map((a, i) => { let poly = box; for (let j = 0; j < pts.length && poly.length > 2; j++) if (j !== i) poly = clipHalf(poly, a, pts[j]); return poly; });
const WIN = lancet(72, 328, 196, 374, 158), GLASS = lancet(84, 316, 196, 362, 146);
CM.style({
  id: 'sglass', n: 32, title: 'Stained Glass', caption: 'Gothic lancet, c. 1220',
  init(env) {
    const r = CM.RNG(32), seeds = [];
    for (let j = 0; j < 12; j++) for (let i = 0; i < 8; i++) seeds.push([84 + (i + .5 + r.range(-.4, .4)) * 29, 40 + (j + .5 + r.range(-.4, .4)) * 27]);
    const panes = voronoi(seeds, [[84, 30], [316, 30], [316, 362], [84, 362]]);
    return { bg: env.layer(g => {
      /* ashlar wall */
      g.fillStyle = '#1e1d21'; g.fillRect(0, 0, 400, 400);
      for (let j = 0, y = 0; y < 400; j++, y += 28) for (let x = -(j % 2) * 30; x < 400; x += 60) { g.fillStyle = CM.mix('#33323a', '#46454c', r()); g.fillRect(x + 1.5, y + 1.5, 57, 25); }
      /* the frame, then the pieces of glass and their lead */
      CM.fillPoly(g, WIN, '#7c1a26'); CM.strokePoly(g, WIN, LEAD, 3);
      g.save(); g.beginPath(); CM.path(g, GLASS); g.clip();
      panes.forEach((q, i) => {
        if (q.length < 3) return; const cy = CM.centroid(q)[1], k = r();
        g.fillStyle = cy > 318 ? hsl(130 + k * 20, 45, 26 + k * 10) : k < .06 ? hsl(352, 70, 34) : k < .1 ? hsl(44, 80, 52) : hsl(218 + r() * 14, 72, 26 + r() * 18);
        g.beginPath(); CM.path(g, q); g.fill();
      });
      const glow = g.createRadialGradient(200, 200, 10, 200, 210, 210); glow.addColorStop(0, 'rgba(255,250,235,.28)'); glow.addColorStop(1, 'rgba(255,250,235,0)');
      g.fillStyle = glow; g.fillRect(0, 0, 400, 400);
      g.strokeStyle = LEAD; g.lineWidth = 2.4; g.lineJoin = 'round'; for (const q of panes) if (q.length > 2) { g.beginPath(); CM.path(g, q); g.stroke(); }
      /* the inscription band */
      g.fillStyle = '#4c2a6c'; g.fillRect(84, 330, 232, 32); g.strokeStyle = LEAD; g.lineWidth = 3; g.strokeRect(84, 330, 232, 32);
      g.fillStyle = '#f4e7c8'; g.font = `600 16px ${CM.FONT.caslon}`; g.textBaseline = 'middle'; CM.spaced(g, 'SCS · CLAVDIVS', 200, 347, 3.5);
      g.restore();
      CM.strokePoly(g, GLASS, LEAD, 3.4);
    }) };
  },
  draw(g, env, rig, S) {
    const p = rig.pose, t = env.t, M = CM.build(p, { cx: 200, cy: 236, s: 10.6 });
    env.stamp(g, S.bg);
    g.save(); g.beginPath(); CM.path(g, GLASS); g.clip();
    CM.drawStars(g, M, false, { fill: '#f4c542', ink: LEAD });
    g.lineJoin = 'round'; CM.unionOutline(g, M, 2.6, LEAD, GL.front);
    /* every face is cut into a few pieces of glass, each its own shade, each leaded */
    for (const f of M.faces) {
      const leg = f.part[0] === 'l', nu = leg || f.part[0] === 'a' ? 1 : 2, nw = f.name === 'front' && !leg ? 2 : 1, base = tone(f, GL), sd = f.part.length * 7 + f.name.length;
      const cu = [0, .5 + (CM.hash(sd) - .5) * .2, 1], cw = [0, .5 + (CM.hash(sd + 1) - .5) * .2, 1];
      for (let a = 0; a < nu; a++) for (let b = 0; b < nw; b++) {
        const u0 = nu === 1 ? 0 : cu[a], u1 = nu === 1 ? 1 : cu[a + 1], w0 = nw === 1 ? 0 : cw[b], w1 = nw === 1 ? 1 : cw[b + 1];
        const q = [f.at(u0, w0), f.at(u1, w0), f.at(u1, w1), f.at(u0, w1)], h = CM.hash2(a + b * 3, sd, 3);
        CM.fillPoly(g, q, CM.shade(base, .8 + .32 * f.light + (h - .5) * .22));
        if (abs(CM.area(q)) > 300) CM.fillPoly(g, CM.offsetPoly(q, 4), 'rgba(255,236,200,.13)');
        CM.strokePoly(g, q, LEAD, 1.8);
      }
    }
    for (const e of M.eyes) if (e.vis && e.poly) { CM.fillPoly(g, e.poly, '#1d1236'); CM.strokePoly(g, e.poly, LEAD, 1.6); if (e.open > .5) { g.fillStyle = 'rgba(210,225,255,.85)'; g.beginPath(); g.arc(e.glint[0], e.glint[1], e.size * .15, 0, TAU); g.fill(); } }
    CM.drawEyes(g, M, { color: LEAD, glint: false });
    CM.drawStars(g, M, true, { fill: '#f4c542', ink: LEAD });
    /* the iron saddle bars run in front of everything */
    g.fillStyle = LEAD; for (const y of [146, 270]) g.fillRect(84, y - 1.6, 232, 3.2);
    /* a passing cloud dims the light now and then */
    const dim = max(0, CM.noise1(t * .25, 32)) * .22; if (dim > .01) { g.fillStyle = `rgba(10,8,20,${dim.toFixed(3)})`; g.fillRect(0, 0, 400, 400); }
    g.restore();
    CM.drawZzz(g, M, { color: '#f4e7c8' });
  },
});
}

/* ═════════ 33 · Illuminated initial (Book of hours, c. 1410) ═════════ */
{
const P = { vellum: '#f1e6c8', blot: '#c4a873', ink: '#2a1d14', rubric: '#b22d1f', blue: '#2a49a0', pink: '#d77a88', gold: '#d6a53a', goldD: '#9c7420', white: '#fbf6ea',
  top: '#f29a6a', front: '#dd5a32', side: '#a8401f', leg: '#c64e2b', legDark: '#93391d' };
const SERIF = CM.FONT.caslon;
const TOP = [['uper caelos sedet', 0], ['parvus Clawdius', 0], ['natus in terminali', 0], ['et scribit codicem', 0]];
const BOT = [['¶ ecce ', 0], ['probationes transeunt', 1], [' · et', 0], ['omnes rident · ', 0], ['Explicit.', 1]];
function gold(g, x0, y0, x1, y1) { const G = g.createLinearGradient(x0, y0, x1, y1); G.addColorStop(0, '#f4d27a'); G.addColorStop(.5, P.gold); G.addColorStop(1, P.goldD); return G; }
CM.style({
  id: 'sinitial', n: 33, title: 'Illuminated Initial', caption: 'Book of hours, c. 1410',
  init(env) {
    return { bg: env.layer(g => {
      ground(g, P.vellum, P.blot, 33, { amt: .3, grainA: .12 });
      /* ruling */
      g.strokeStyle = 'rgba(160,120,90,.18)'; g.lineWidth = .6; for (let y = 50; y < 390; y += 22) { g.beginPath(); g.moveTo(30, y); g.lineTo(340, y); g.stroke(); }
      /* the initial: gold frame, blue diapered ground, a pink letter */
      g.fillStyle = gold(g, 30, 30, 132, 132); g.fillRect(30, 30, 102, 102);
      g.fillStyle = P.blue; g.fillRect(37, 37, 88, 88);
      g.fillStyle = 'rgba(244,210,122,.8)'; for (let y = 43; y < 124; y += 9) for (let x = 43 + (y / 9 % 2) * 4.5; x < 124; x += 9) { g.beginPath(); g.arc(x, y, 1.1, 0, TAU); g.fill(); }
      g.font = `700 92px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
      g.fillStyle = P.pink; g.fillText('S', 81, 116); g.strokeStyle = P.white; g.lineWidth = 1.2; g.strokeText('S', 81, 116);
      g.strokeStyle = P.goldD; g.lineWidth = 1; g.strokeRect(30, 30, 102, 102);
      /* text: black with red rubrics */
      g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.font = `400 18px ${SERIF}`;
      TOP.forEach(([s], i) => { g.fillStyle = P.ink; g.fillText(s, 144, 58 + i * 22); });
      g.font = `400 16.5px ${SERIF}`;
      let x = 34, y = 340;
      for (const [s, red] of BOT) { g.fillStyle = red ? P.rubric : P.ink; const w = g.measureText(s).width; if (x + w > 336) { x = 34; y += 22; } g.fillText(s, x, y); x += w + (s.endsWith(' ') ? 0 : 4); }
      g.fillStyle = P.blue; g.fillRect(x + 4, y - 6, 60, 4); g.fillStyle = 'rgba(244,210,122,.9)'; for (let k = 0; k < 10; k++) g.fillRect(x + 6 + k * 6, y - 5, 2, 2);
      /* the margin bar and its vine of gold ivy */
      g.fillStyle = gold(g, 354, 0, 362, 0); g.fillRect(354, 30, 7, 350);
      for (let y2 = 34; y2 < 376; y2 += 26) { g.fillStyle = (y2 / 26 | 0) % 2 ? P.blue : P.pink; g.fillRect(355, y2, 5, 12); }
      const r = CM.RNG(330);
      for (let y2 = 44; y2 < 380; y2 += 30) for (const s of [-1, 1]) {
        const x0 = 357.5, ex = x0 + s * r.range(16, 30), ey = y2 + r.range(-10, 10);
        g.strokeStyle = P.ink; g.lineWidth = .9; g.beginPath(); g.moveTo(x0, y2); g.quadraticCurveTo(x0 + s * 10, y2 - 14, ex, ey); g.stroke();
        for (const [lx, ly] of [[ex, ey], [x0 + s * 10, y2 - 9]]) {
          g.fillStyle = r() < .7 ? gold(g, lx - 4, ly - 4, lx + 4, ly + 4) : P.blue; g.beginPath(); g.moveTo(lx, ly - 5); g.quadraticCurveTo(lx + 5, ly, lx, ly + 4); g.quadraticCurveTo(lx - 5, ly, lx, ly - 5); g.fill();
          g.strokeStyle = P.ink; g.lineWidth = .5; g.stroke();
        }
      }
    }) };
  },
  draw(g, env, rig, S) {
    const p = rig.pose, M = CM.build(p, { cx: 188, cy: 236, s: 9.8 });
    env.stamp(g, S.bg);
    CM.drawStars(g, M, false, { fill: P.gold, ink: P.ink });
    /* bright pigment inside a fine black line, gold leaf on the top faces, lead-white highlights */
    g.lineJoin = 'round'; CM.unionOutline(g, M, 1.4, P.ink, P.front);
    paintParts(M, f => {
      if (f.name === 'top') { const b = CM.bbox(f.pts); CM.fillPoly(g, f.pts, gold(g, b[0], b[1], b[2], b[3])); return; }
      CM.fillPoly(g, f.pts, CM.shade(tone(f, P), .86 + .2 * f.light));
    }, pt => {
      if (pt.name === 'body' && M.frontVis) { g.strokeStyle = 'rgba(255,248,232,.7)'; g.lineWidth = 1.4; g.beginPath(); const a = M.F(-5.4, 8.4, .05), b = M.F(5.4, 8.4, .05); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
      strokeEdges(g, pt, P.ink, .9);
    });
    CM.drawEyes(g, M, { color: P.ink, glint: P.white });
    CM.drawStars(g, M, true, { fill: P.gold, ink: P.ink });
    CM.drawZzz(g, M, { color: P.rubric, font: SERIF });
  },
});
}

/* ═════════ 34 · Proportion study (after Leonardo, c. 1490) ═════════ */
{
const P = { paper: '#ece0c4', blot: '#b49564', ink: '#4a2f1c', faint: 'rgba(74,47,28,.35)', wash: 'rgba(196,140,96,.22)' };
function mirrored(g, str, x, y, size) { g.save(); g.translate(x, y); g.scale(-1, 1); g.font = `italic ${size}px ${CM.FONT.serif}`; g.textAlign = 'center'; g.fillText(str, 0, 0); g.restore(); }
CM.style({
  id: 'sprop', n: 34, title: 'Proportion Study', caption: 'After Leonardo, c. 1490',
  init(env) {
    return { bg: env.layer(g => {
      ground(g, P.paper, P.blot, 34, { amt: .42, grainA: .14 });
      g.fillStyle = P.ink;
      mirrored(g, 'il granchio del terminale e delle sue misure', 200, 36, 11.5);
      mirrored(g, 'tanto apre le braccia quanto è la sua altezza', 200, 52, 9);
      mirrored(g, 'e vola senza ali · più veloce d’una saetta', 200, 376, 9.5);
      /* circle and square, with their measuring ticks */
      g.strokeStyle = P.ink; g.lineWidth = 1.3;
      g.beginPath(); g.arc(200, 210, 142, 0, TAU); g.stroke();
      g.strokeRect(80, 92, 240, 260);
      g.lineWidth = .7; g.beginPath();
      for (let k = 1; k < 8; k++) { const x = 80 + k * 30, y = 92 + k * 32.5; g.moveTo(x, 352); g.lineTo(x, 346); g.moveTo(80, y); g.lineTo(86, y); }
      g.stroke();
      /* margin sketches: an eye study and a leg */
      g.lineWidth = .8; g.beginPath(); g.ellipse(40, 82, 12, 18, 0, 0, TAU); g.stroke(); g.beginPath(); g.ellipse(40, 82, 5, 9, 0, 0, TAU); g.fill();
      g.beginPath(); g.rect(352, 66, 10, 30); g.moveTo(352, 66); g.lineTo(358, 60); g.lineTo(368, 60); g.lineTo(362, 66); g.moveTo(368, 60); g.lineTo(368, 90); g.lineTo(362, 96); g.stroke();
    }) };
  },
  draw(g, env, rig, S) {
    const p = rig.pose, M = CM.build(p, { cx: 200, cy: 246, s: 13.5 });
    env.stamp(g, S.bg);
    /* the second pose, arms flung out, ghosted in behind as Leonardo did */
    const G = CM.build(Object.assign({}, p, { armL: .95, armR: .95 }), { cx: 200, cy: 246, s: 13.5 });
    g.strokeStyle = P.faint; g.lineWidth = .9; for (const k of ['armL', 'armR']) CM.strokePoly(g, G.parts[k].hull);
    /* part by part: a pale wash over the paper, hatching on the shaded sides, then the pen line */
    paintParts(M, f => {
      CM.fillPoly(g, f.pts, P.paper); CM.fillPoly(g, f.pts, P.wash);
      if (f.light > .62) return;
      CM.hatch(g, f.pts, f.name === 'top' ? -.3 : 1.05, 2.4 + f.light * 4, .7, { color: P.ink, wobble: .5, seed: f.part.length, cross: f.light < .25 ? 1.2 : 0 });
    }, pt => { g.fillStyle = P.ink; for (const e of inkEdges(pt)) CM.ink(g, CM.resample([e.a, e.b], 5), e.kind === 'sil' ? 1.6 : 1, e.a[0] * 3 + e.b[1], { amp: .5 }); });
    CM.drawEyes(g, M, { color: P.ink, glint: P.paper, lw: 1.3 });
    /* the navel of the figure sits at the centre of the circle: a little compass prick */
    g.beginPath(); g.arc(200, 210, 1.6, 0, TAU); g.fill();
    CM.drawStars(g, M, true, { fill: 'rgba(0,0,0,0)', ink: P.ink });
    CM.drawZzz(g, M, { color: P.ink });
  },
});
}

/* ═════════ 35 · Silhouette (cut paper, c. 1790) ═════════ */
{
const P = { wall: '#1f3a2c', damask: '#2b4a39', cream: '#f2ead6', cut: '#121110', gold: '#c99a3d', goldL: '#f0d58a', goldD: '#7a5a1c' };
const O = { cx: 200, cy: 212, rx: 122, ry: 160 };
function fleur(g, x, y, s) {
  g.beginPath(); g.ellipse(x, y - s * .35, s * .18, s * .42, 0, 0, TAU);
  g.ellipse(x - s * .32, y - s * .05, s * .14, s * .32, -.7, 0, TAU); g.ellipse(x + s * .32, y - s * .05, s * .14, s * .32, .7, 0, TAU);
  g.rect(x - s * .36, y + s * .12, s * .72, s * .1); g.moveTo(x, y + s * .2); g.lineTo(x - s * .12, y + s * .5); g.lineTo(x + s * .12, y + s * .5); g.fill();
}
CM.style({
  id: 'ssil', n: 35, title: 'Silhouette', caption: 'Cut paper, c. 1790',
  init(env) {
    return { bg: env.layer(g => {
      g.fillStyle = P.wall; g.fillRect(0, 0, 400, 400); g.fillStyle = P.damask;
      for (let j = 0; j < 7; j++) for (let i = -1; i < 7; i++) fleur(g, i * 70 + (j % 2) * 35 + 20, j * 64 + 30, 34);
      const v = g.createRadialGradient(200, 200, 120, 200, 200, 300); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.45)'); g.fillStyle = v; g.fillRect(0, 0, 400, 400);
      /* the oval mount, its gilt frame and the ribbon bow */
      g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(O.cx + 4, O.cy + 6, O.rx + 18, O.ry + 18, 0, 0, TAU); g.fill();
      const G = g.createLinearGradient(80, 50, 320, 380); G.addColorStop(0, P.goldL); G.addColorStop(.45, P.gold); G.addColorStop(1, P.goldD);
      g.fillStyle = G; g.beginPath(); g.ellipse(O.cx, O.cy, O.rx + 16, O.ry + 16, 0, 0, TAU); g.fill();
      g.strokeStyle = P.goldD; g.lineWidth = 1.2; g.stroke();
      g.fillStyle = P.goldL; for (let k = 0; k < 72; k++) { const a = k / 72 * TAU; g.beginPath(); g.arc(O.cx + cos(a) * (O.rx + 9), O.cy + sin(a) * (O.ry + 9), 1.5, 0, TAU); g.fill(); }
      g.fillStyle = '#0d0c0b'; g.beginPath(); g.ellipse(O.cx, O.cy, O.rx + 2.5, O.ry + 2.5, 0, 0, TAU); g.fill();
      const C = g.createRadialGradient(O.cx, O.cy - 30, 20, O.cx, O.cy, O.ry); C.addColorStop(0, '#fbf6e8'); C.addColorStop(1, '#ddd2b6');
      g.fillStyle = C; g.beginPath(); g.ellipse(O.cx, O.cy, O.rx, O.ry, 0, 0, TAU); g.fill();
      g.fillStyle = G; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(200 + s * 15, 40, 15, 8, s * .35, 0, TAU); g.fill(); g.stroke(); }
      g.beginPath(); g.arc(200, 42, 6, 0, TAU); g.fill(); g.stroke();
      g.fillStyle = '#3d3a33'; g.textAlign = 'center'; g.font = `400 18px ${CM.FONT.serif}`; g.fillText('Mr. C. Clawd', 200, 322);
      g.font = `italic 10px ${CM.FONT.serif}`; g.fillText('taken from the life · 1790', 200, 338);
    }) };
  },
  draw(g, env, rig, S) {
    const p = rig.pose, M = CM.build(p, { cx: 200, cy: 214, s: 10.8 });
    env.stamp(g, S.bg);
    g.save(); g.beginPath(); g.ellipse(O.cx, O.cy, O.rx, O.ry, 0, 0, TAU); g.clip();
    /* black paper, one clean cut, lifted a hair off the card */
    g.fillStyle = 'rgba(60,45,20,.22)'; g.beginPath(); for (const h of M.hulls) CM.path(g, h.map(q => [q[0] + 2, q[1] + 2.5])); g.fill();
    g.fillStyle = P.cut; g.beginPath(); for (const h of M.hulls) CM.path(g, h); g.fill();
    for (const s of M.stars) { const r = 8 * s.k, q = []; for (let i = 0; i < 10; i++) { const a = s.a * 1.7 - PI / 2 + i * PI / 5, d = i & 1 ? r * .45 : r; q.push([s.x + cos(a) * d, s.y + sin(a) * d]); } CM.fillPoly(g, q, P.cut); }
    /* the eyes are cut clean through the paper */
    CM.drawEyes(g, M, { color: '#efe6cf', glint: false });
    g.restore();
    CM.drawZzz(g, M, { color: P.cut, font: CM.FONT.serif });
  },
});
}

/* ═════════ 36 · Ukiyo-e (after Hokusai, 1831) ═════════ */
{
const P = { paper: '#e9dcc0', blot: '#b9a47a', deep: '#1d3866', mid: '#3a62a0', pale: '#9db6cf', foam: '#f6f1e4', key: '#1a2238', seal: '#b8322a',
  top: '#f1a27c', front: '#d9643f', side: '#a8472d', leg: '#c55a39', legDark: '#93402a' };
/* the big wave: an outline with a curling crest; s sways the crest */
function wave(g, s) {
  g.moveTo(0, 400); g.lineTo(0, 210);
  g.bezierCurveTo(8, 130, 66, 74, 146, 64 + s);
  g.bezierCurveTo(196, 58 + s, 232, 82 + s, 236 + s, 112 + s);
  g.bezierCurveTo(222, 94 + s, 196, 90 + s, 180, 106 + s);
  g.bezierCurveTo(150, 136, 160, 210, 196, 268);
  g.bezierCurveTo(214, 300, 232, 336, 240, 400); g.closePath();
}
const crest = s => { const pts = []; for (let k = 0; k <= 22; k++) { const u = k / 22, a = [0, 210], b = [8, 130], c = [66, 74], d = [146, 64 + s], m = 1 - u; pts.push([m * m * m * a[0] + 3 * m * m * u * b[0] + 3 * m * u * u * c[0] + u * u * u * d[0], m * m * m * a[1] + 3 * m * m * u * b[1] + 3 * m * u * u * c[1] + u * u * u * d[1]]); } return pts; };
CM.style({
  id: 'sukiyoe', n: 36, title: 'Ukiyo-e', caption: 'After Hokusai, 1831',
  init(env) {
    const r = CM.RNG(36);
    return {
      bg: env.layer(g => {
        ground(g, P.paper, P.blot, 36, { amt: .3, grainA: .1 });
        g.fillStyle = 'rgba(120,110,95,.12)'; g.fillRect(0, 150, 400, 26); g.fillRect(0, 196, 400, 12);
        /* the distant sea, and Fuji under its snow */
        g.fillStyle = P.pale; g.fillRect(0, 284, 400, 116);
        g.fillStyle = P.mid; g.beginPath(); g.moveTo(296, 285); g.lineTo(338, 252); g.lineTo(352, 252); g.lineTo(396, 285); g.fill();
        g.fillStyle = P.foam; g.beginPath(); g.moveTo(326, 261); g.lineTo(338, 252); g.lineTo(352, 252); g.lineTo(364, 261); for (let k = 0; k < 5; k++) g.lineTo(361 - k * 7, k % 2 ? 258 : 265); g.fill();
        /* the cartouche and the seal */
        g.fillStyle = '#f3ead6'; g.fillRect(352, 20, 30, 126); g.strokeStyle = P.key; g.lineWidth = 1.2; g.strokeRect(352, 20, 30, 126); g.strokeRect(349, 17, 36, 132);
        g.fillStyle = P.key; g.font = `600 17px ${CM.FONT.serif}`; g.textAlign = 'center'; g.textBaseline = 'middle'; [...'CLAWD'].forEach((c, i) => g.fillText(c, 367, 36 + i * 23.5));
        g.fillStyle = P.seal; g.beginPath(); g.roundRect(18, 20, 20, 22, 2); g.fill(); g.fillStyle = P.paper; g.font = `700 14px ${CM.FONT.serif}`; g.fillText('C', 28, 32);
        g.fillStyle = P.key; g.font = `11px ${CM.FONT.serif}`; [...'HOKU'].forEach((c, i) => g.fillText(c, 28, 58 + i * 14));
      }),
      grain: env.layer(g => { g.fillStyle = 'rgba(90,70,40,.1)'; for (let i = 0; i < 3500; i++) g.fillRect(r() * 400, r() * 400, r.range(.5, 1.6), r.range(.5, 1.6)); }),
      spray: Array.from({ length: 38 }, () => [r.range(40, 250), r.range(20, 80), r.range(1, 2.6), r() * TAU]),
    };
  },
  draw(g, env, rig, S) {
    const p = rig.pose, t = env.t, sw = sin(t * .9) * 4, M = CM.build(p, { cx: 262, cy: 252, s: 9.4 });
    env.stamp(g, S.bg);
    /* the great wave: Prussian blue with lighter combing, a white crest of clawed foam */
    g.fillStyle = P.deep; g.beginPath(); wave(g, sw); g.fill();
    g.save(); g.beginPath(); wave(g, sw); g.clip(); g.strokeStyle = P.mid; g.lineWidth = 2.2;
    for (let k = 1; k < 9; k++) { g.beginPath(); g.moveTo(k * 15, 400); g.bezierCurveTo(k * 15 + 4, 210, k * 12 + 40, 120 + k * 6, 150 + k * 4, 72 + k * 10 + sw); g.stroke(); }
    g.restore();
    const C = crest(sw); g.strokeStyle = P.foam; g.lineWidth = 9; g.lineCap = 'round'; g.lineJoin = 'round'; CM.strokePoly(g, C.slice(8), null, null, false);
    g.lineWidth = 2.2;
    for (let k = 9; k < C.length; k++) {
      const [x, y] = C[k], a = -1.2 + k * .07 + sin(t * 2 + k) * .12; g.beginPath(); g.moveTo(x, y);
      g.quadraticCurveTo(x + cos(a) * 12, y + sin(a) * 12, x + cos(a + 1.4) * 9, y + sin(a + 1.4) * 9 - 3); g.stroke();
    }
    g.fillStyle = P.foam; for (const [x, y, r, ph] of S.spray) { g.beginPath(); g.arc(x + sin(t * .8 + ph) * 2, y + ((t * 6 + ph * 10) % 30), r, 0, TAU); g.fill(); }
    /* the small wave Clawd stands on */
    g.fillStyle = P.mid; g.beginPath(); g.moveTo(150, 400); g.bezierCurveTo(180, 330, 240, 312 + sw * .5, 300, 318); g.bezierCurveTo(350, 324, 380, 340, 400, 350); g.lineTo(400, 400); g.fill();
    g.strokeStyle = P.foam; g.lineWidth = 2; g.beginPath(); g.moveTo(178, 352); g.bezierCurveTo(206, 322, 250, 316 + sw * .5, 300, 320); g.stroke();
    /* Clawd, cut in flat blocks with a dark key line */
    CM.drawStars(g, M, false, { fill: '#f2c14e', ink: P.key });
    g.lineJoin = 'round'; CM.unionOutline(g, M, 1.8, P.key, P.front);
    paintParts(M, f => CM.fillPoly(g, f.pts, tone(f, P)), pt => strokeEdges(g, pt, P.key, .9));
    CM.drawEyes(g, M, { color: P.key, glint: P.foam });
    CM.drawStars(g, M, true, { fill: '#f2c14e', ink: P.key });
    CM.drawZzz(g, M, { color: P.key, font: CM.FONT.serif });
    env.stamp(g, S.grain);
  },
});
}

/* ═════════ 37 · Sampler (cross-stitch, 1840s) ═════════ */
{
const N = 66, T = 400 / N;
const P = { linen: '#e7dab9', blot: '#b8a47a', red: '#a8392f', blue: '#3b5a8a', green: '#5d7a3e', brown: '#5a3a28', gold: '#c99a3d',
  top: '#eba27c', front: '#d0603c', side: '#9c4430', leg: '#c25537', legDark: '#8d3d29', rim: '#6b2a1c', eye: '#2a1c16' };
/* cross-stitches, batched per thread colour: a darker underside, then the thread on top */
function stitch(g, list, color) {
  if (!list.length) return;
  for (const [col, lw, d] of [[CM.shade(color, .62), 2, .45], [color, 1.45, 0]]) {
    g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath();
    for (const [i, j] of list) { const x = i * T + d, y = j * T + d; g.moveTo(x + 1, y + 1); g.lineTo(x + T - 1, y + T - 1); g.moveTo(x + T - 1, y + 1); g.lineTo(x + 1, y + T - 1); }
    g.stroke();
  }
}
CM.style({
  id: 'ssampler', n: 37, title: 'Sampler', caption: 'Cross-stitch, 1840s',
  init(env) {
    const by = new Map(), put = (c, i, j) => { if (!by.has(c)) by.set(c, []); by.get(c).push([i, j]); };
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const e = min(i, j, N - 1 - i, N - 1 - j);
      if (e === 2 && (i + j) % 4 !== 0) put(P.green, i, j);
      if (e === 3 && (i + j) % 8 === 0) put(P.red, i, j);
    }
    pixText('ABCDEFGHIJKLM', 7, 7, (i, j) => put(P.red, i, j));
    pixText('NOPQRSTUVWXYZ', 7, 14, (i, j) => put(P.blue, i, j));
    pixText('♥', 17, 21, (i, j) => put(P.red, i, j)); pixText('1843', 25, 21, (i, j) => put(P.blue, i, j)); pixText('♥', 45, 21, (i, j) => put(P.red, i, j));
    pixText('HOME SWEET ~/', 7, 56, (i, j) => put(P.brown, i, j));
    for (const cx of [11, 54]) for (let j = 38; j < 53; j++) for (let i = cx - 4; i <= cx + 4; i++) {
      if ((i - cx) ** 2 + (j - 42) ** 2 <= 11) put((i + j) % 5 ? P.green : P.red, i, j);
      else if (i === cx && j > 44) put(P.brown, i, j);
    }
    for (let i = 6; i < N - 6; i++) if (i % 3) put(P.green, i, 53);
    return { bg: env.layer(g => {
      ground(g, P.linen, P.blot, 37, { amt: .22, grain: 0 });
      g.fillStyle = 'rgba(120,100,60,.09)'; for (let k = 0; k < 400; k += 3) { g.fillRect(k, 0, 1, 400); g.fillRect(0, k, 400, 1); }
      for (const [c, list] of by) stitch(g, list, c);
    }) };
  },
  draw(g, env, rig, S) {
    const p = rig.pose, M = CM.build(p, { cx: 200, cy: 246, s: 9.4 }), { C } = cells(M, N, N, [0, 0, 400, 400]);
    env.stamp(g, S.bg);
    const by = new Map();
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const c = C[j * N + i]; if (!c) continue;
      const col = c.eye ? P.eye : c.rim ? P.rim : tone(c.f, P);
      if (!by.has(col)) by.set(col, []); by.get(col).push([i, j]);
    }
    for (const [col, list] of by) stitch(g, list, col);
    CM.drawStars(g, M, true, { fill: P.gold, ink: P.brown });
    CM.drawZzz(g, M, { color: P.brown });
  },
});
}

/* ═════════ 38 · Strongman bill (letterpress, 1890s) ═════════ */
{
const P = { paper: '#efe2c2', blot: '#b49a68', red: '#bf3527', ink: '#1d1a17' };
const ACT = { wave: 'WAVE', wave2: 'WAVE', dance: 'DANCE', hop: 'HOP', spin: 'SPIN', dizzy: 'SPIN', doze: 'NAP', stretch: 'STRETCH', cheese: 'SMILE', nod: 'NOD', shake: 'SHRUG' };
const DIDONE = CM.FONT.didone, SERIF = CM.FONT.caslon;
function fit(g, str, x, y, size, maxW, weight = 700, family = DIDONE, track = 0) {
  g.font = `${weight} ${size}px ${family}`; const w = g.measureText(str).width + track * (str.length - 1);
  if (w > maxW) g.font = `${weight} ${size * maxW / w}px ${family}`; CM.spaced(g, str, x, y, track * min(1, maxW / w));
}
CM.style({
  id: 'sbill', n: 38, title: 'Strongman Bill', caption: 'Letterpress, 1890s',
  init(env) {
    const r = CM.RNG(38);
    return {
      bg: env.layer(g => {
        ground(g, P.paper, P.blot, 38, { amt: .32, grainA: .12 });
        g.textBaseline = 'alphabetic'; g.textAlign = 'center';
        g.fillStyle = P.red; g.fillRect(24, 16, 352, 20); g.fillStyle = P.paper; fit(g, '★  ONE WEEK ONLY  ★', 200, 31, 13, 300, 600, SERIF, 2.5);
        g.fillStyle = P.ink; fit(g, 'THE AMAZING', 200, 72, 34, 300, 500, DIDONE, 1);
        g.fillStyle = P.red; fit(g, 'CLAWD', 200, 116, 50, 260, 700, DIDONE, 4);
        g.fillStyle = P.ink; g.fillRect(30, 126, 340, 2); g.fillRect(30, 146, 340, 1);
        fit(g, 'THE CLEVEREST CREATURE UPON THE EARTH', 200, 141, 11.5, 320, 700, SERIF, .8);
        /* the two outer columns of claims */
        g.fillStyle = P.red; ['PASSES', 'ALL', 'TESTS!'].forEach((s, i) => fit(g, s, 66, 284 + i * 17, 17, 96, 500, DIDONE));
        ['REFACTORS', 'LEGACY', 'CODE!'].forEach((s, i) => fit(g, s, 334, 284 + i * 17, 17, 96, 500, DIDONE));
        g.fillStyle = P.ink; g.font = `italic 9px ${SERIF}`; g.fillText('with no help at all', 66, 333); g.fillText('and leaves no trace', 334, 333);
        g.font = `14px ${SERIF}`; g.fillText('☞', 112, 332); g.fillText('☜', 288, 332);
        g.fillRect(30, 342, 340, 1.5);
        fit(g, 'TWICE DAILY · 2 & 8', 200, 362, 18, 300, 500, DIDONE, 1);
        g.fillStyle = P.red; fit(g, 'ADMISSION 10¢', 200, 378, 11, 200, 600, SERIF, 3);
        g.fillStyle = P.ink; g.font = `italic 8.5px ${SERIF}`; g.fillText('Children half price · Terminals admitted free on Tuesdays', 200, 391);
      }),
      /* worn type: specks of bare paper through the ink */
      worn: env.layer(g => { g.fillStyle = 'rgba(239,226,194,.75)'; for (let i = 0; i < 1800; i++) g.fillRect(r() * 400, r() * 400, r.range(.5, 1.5), r.range(.5, 1.5)); }),
    };
  },
  draw(g, env, rig, S) {
    const p = rig.pose, M = CM.build(p, { cx: 200, cy: 208, s: 7.8 });
    env.stamp(g, S.bg);
    /* the centre column follows whatever Clawd is up to */
    const verb = ACT[p.act] || 'THINK';
    g.textAlign = 'center'; g.fillStyle = P.ink; g.font = `500 15px ${DIDONE}`; g.fillText('SEE IT', 200, 285);
    g.fillStyle = P.red; fit(g, verb + '!', 200, 318, 34, 116, 500, DIDONE);
    g.fillStyle = P.ink; g.font = `italic 9px ${SERIF}`; g.fillText('without wires or tricks', 200, 333);
    /* two-colour woodcut: red pulled first and slightly off register, then the black key */
    contour(g, M, P.ink, 1.8);
    paintParts(M, f => {
      CM.fillPoly(g, f.pts, P.paper);
      if (f.name === 'front' || (f.part[0] === 'a' && f.name !== 'top')) { g.save(); g.translate(1.4, .9); CM.fillPoly(g, f.pts, P.red); g.restore(); }
      else if (f.name !== 'top') CM.hatch(g, f.pts, .8, 2.2, .8, { color: P.ink });
    }, pt => strokeEdges(g, pt, P.ink, .8));
    CM.drawEyes(g, M, { color: P.ink, glint: P.paper });
    CM.drawStars(g, M, true, { fill: P.red, ink: P.ink, r: 7 });
    CM.drawZzz(g, M, { color: P.ink, font: DIDONE });
    env.stamp(g, S.worn);
  },
});
}

/* ═════════ 39 · Constructivism (Moscow, 1920s) ═════════ */
{
const P = { paper: '#ece2cc', blot: '#b9a985', red: '#d22b1f', black: '#161413', grey: '#8f8a82' };
const GROT = CM.FONT.grotesk;
/* a straight band from a to b, w wide */
function band(a, b, w) { const dx = b[0] - a[0], dy = b[1] - a[1], L = hypot(dx, dy), nx = -dy / L * w / 2, ny = dx / L * w / 2; return [[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]]; }
CM.style({
  id: 'sconst', n: 39, title: 'Constructivism', caption: 'Moscow, 1920s',
  init(env) {
    return { bg: env.layer(g => {
      ground(g, P.paper, P.blot, 39, { amt: .26 });
      g.fillStyle = P.red; g.beginPath(); g.arc(246, 168, 106, 0, TAU); g.fill();
      CM.fillPoly(g, band([-30, 404], [430, 172], 46), P.black);
      CM.fillPoly(g, band([-30, 444], [430, 212], 4), P.grey);
      CM.fillPoly(g, [[18, 392], [104, 330], [58, 300]], P.red);
      g.fillStyle = P.black; g.textBaseline = 'alphabetic';
      g.save(); g.translate(76, 338); g.rotate(-PI / 2); g.font = `900 78px ${GROT}`; g.textAlign = 'left'; CM.spaced(g, 'КЛОД', 0, 0, 2, 'left'); g.restore();
      g.font = `700 10px ${GROT}`; g.textAlign = 'left'; CM.spaced(g, 'ВЫШЕ · БЫСТРЕЕ · УМНЕЕ', 104, 36, 1.2, 'left'); g.fillRect(104, 41, 168, 2.4);
      g.save(); g.translate(290, 112); g.rotate(.42); g.fillStyle = P.paper; g.font = `italic 700 17px ${GROT}`; g.fillText('ПИШЕТ!', 0, 0); g.restore();
      g.save(); g.translate(128, 386); g.rotate(-.2); g.fillStyle = P.red; g.font = `900 38px ${GROT}`; g.fillText('ИЗ КОДА', 0, 0); g.restore();
      g.fillStyle = P.black; g.fillRect(328, 300, 50, 42); g.fillStyle = P.paper; g.font = `800 25px ${GROT}`; g.textAlign = 'center'; g.fillText('№1', 353, 330);
    }) };
  },
  draw(g, env, rig, S) {
    const p = rig.pose, M = CM.build(p, { cx: 222, cy: 176, s: 10 });
    env.stamp(g, S.bg);
    /* photomontage: a halftoned photograph of Clawd, cut out with a white margin */
    g.save(); g.shadowColor = 'rgba(0,0,0,.25)'; g.shadowOffsetX = 2; g.shadowOffsetY = 3;
    g.lineJoin = 'round'; CM.unionOutline(g, M, 5, '#fbf8f0', '#9a948a'); g.restore();
    for (const f of M.faces) {
      const v = 70 + 150 * f.light; CM.fillPoly(g, f.pts, CM.rgb(v, v * .97, v * .93));
      CM.halftone(g, f.pts, 3.4, () => .35 + (1 - f.light) * 1.35, PI / 4, P.black);
    }
    CM.drawEyes(g, M, { color: P.black, glint: '#eee' });
    CM.drawStars(g, M, true, { fill: P.red, ink: P.black });
    CM.drawZzz(g, M, { color: P.black, font: GROT });
  },
});
}

/* ═════════ 40 · Art Deco (streamline poster, 1930s) ═════════ */
{
const P = { sky0: '#0f1a33', sky1: '#24426a', ray: 'rgba(160,200,230,.07)', teal: '#21737b', tealD: '#164c55', win: '#f2d06b', gold: '#d9b25a', goldL: '#f4dc93', cream: '#f2e8cf',
  top: '#f6b48c', front: '#e2774f', side: '#b4553a', leg: '#cc6545', legDark: '#9a4630' };
const ROOF = 262;
CM.style({
  id: 'sdeco', n: 40, title: 'Art Deco', caption: 'Streamline poster, 1930s',
  init(env) {
    const r = CM.RNG(40);
    return { bg: env.layer(g => {
      const G = g.createLinearGradient(0, 0, 0, 330); G.addColorStop(0, P.sky0); G.addColorStop(1, P.sky1); g.fillStyle = G; g.fillRect(0, 0, 400, 400);
      g.fillStyle = P.ray; for (let k = 0; k < 28; k += 2) { const a0 = PI + k / 28 * PI, a1 = PI + (k + 1) / 28 * PI; g.beginPath(); g.moveTo(200, 250); g.lineTo(200 + cos(a0) * 500, 250 + sin(a0) * 500); g.lineTo(200 + cos(a1) * 500, 250 + sin(a1) * 500); g.fill(); }
      const glow = g.createRadialGradient(200, 250, 5, 200, 250, 180); glow.addColorStop(0, 'rgba(244,220,147,.55)'); glow.addColorStop(1, 'rgba(244,220,147,0)'); g.fillStyle = glow; g.fillRect(0, 0, 400, 400);
      /* the skyline: stepped towers, lit windows, two spires and the gilded globe */
      const tower = (x, w, top, steps, spire) => {
        const cx = x + w / 2;
        if (spire) { g.fillStyle = P.gold; g.beginPath(); g.moveTo(cx - 3, top); g.lineTo(cx, top - spire); g.lineTo(cx + 3, top); g.fill(); }
        const tiers = Array.from({ length: steps + 1 }, (_, s) => [cx - w * (1 - (steps - s) * .16) / 2, top + s * 14, w * (1 - (steps - s) * .16)]);
        for (const [tx, ty, tw] of tiers) { g.fillStyle = P.tealD; g.fillRect(tx, ty, tw, 330 - ty); g.fillStyle = P.teal; g.fillRect(tx, ty, tw * .62, 330 - ty); }
        for (let wy = top + 8; wy < 326; wy += 7) for (let wx = x + 4; wx < x + w - 4; wx += 6) if (r() < .32) { g.fillStyle = CM.alpha(P.win, r.range(.5, 1)); g.fillRect(wx, wy, 2.2, 3.2); }
      };
      [[-6, 52, 214, 2, 30], [40, 40, 250, 1, 0], [76, 46, 196, 3, 46], [118, 40, 236, 1, 0], [158, 84, ROOF, 0, 0], [238, 42, 232, 1, 0], [276, 48, 180, 3, 0], [320, 40, 244, 1, 0], [356, 50, 206, 2, 34]].forEach(a => tower(...a));
      g.fillStyle = P.gold; g.beginPath(); g.arc(300, 164, 13, 0, TAU); g.fill(); g.strokeStyle = P.goldL; g.lineWidth = 1.5; g.beginPath(); g.ellipse(300, 164, 21, 5, -.3, 0, TAU); g.stroke();
      g.fillStyle = P.gold; g.fillRect(298, 177, 4, 4);
      /* the title band and the double gold rule */
      g.fillStyle = '#0b1324'; g.fillRect(0, 330, 400, 70); g.fillStyle = P.gold; g.fillRect(14, 332, 372, 1.5);
      g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillStyle = P.cream; g.font = `400 40px ${CM.FONT.deco}`; CM.spaced(g, 'CLAWD', 200, 370, 12);
      g.fillStyle = P.gold; g.font = `600 9px ${CM.FONT.sans}`; CM.spaced(g, 'THE TERMINAL OF TOMORROW', 200, 387, 3.2);
      g.fillStyle = P.cream; g.font = `600 10px ${CM.FONT.sans}`; g.textAlign = 'left'; CM.spaced(g, 'CODE · 1938', 22, 32, 3, 'left');
      g.strokeStyle = P.gold; g.lineWidth = 1.2; g.strokeRect(8, 8, 384, 384); g.strokeRect(12, 12, 376, 376);
    }) };
  },
  draw(g, env, rig, S) {
    const p = rig.pose, t = env.t, s = 9.6, M = CM.build(p, { cx: 200, cy: ROOF - 7.3 * s, s });
    env.stamp(g, S.bg);
    /* two searchlights sweep the sky */
    g.save(); g.globalCompositeOperation = 'lighter';
    for (const [x, ph] of [[70, 0], [330, 2.1]]) {
      const a = -PI / 2 + sin(t * .45 + ph) * .55, L = 420, w = .07;
      const G = g.createLinearGradient(x, 330, x + cos(a) * L, 330 + sin(a) * L); G.addColorStop(0, 'rgba(255,240,200,.22)'); G.addColorStop(1, 'rgba(255,240,200,0)');
      g.fillStyle = G; g.beginPath(); g.moveTo(x, 330); g.lineTo(x + cos(a - w) * L, 330 + sin(a - w) * L); g.lineTo(x + cos(a + w) * L, 330 + sin(a + w) * L); g.fill();
    }
    g.restore();
    CM.drawStars(g, M, false, { fill: P.gold, ink: P.sky0 });
    /* streamline shading: every face a smooth vertical ramp, a fine gold edge round the whole */
    g.lineJoin = 'round'; CM.unionOutline(g, M, 1.3, P.gold, P.front);
    paintParts(M, f => {
      const b = CM.bbox(f.pts), c = tone(f, P), G = g.createLinearGradient(0, b[1], 0, b[3] + .1);
      G.addColorStop(0, CM.shade(c, 1.18)); G.addColorStop(1, CM.shade(c, .72 + .2 * f.light)); CM.fillPoly(g, f.pts, G);
    }, pt => strokeEdges(g, pt, CM.alpha(P.goldL, .55), .7));
    CM.drawEyes(g, M, { color: P.sky0, glint: P.goldL });
    CM.drawStars(g, M, true, { fill: P.gold, ink: P.sky0 });
    CM.drawZzz(g, M, { color: P.cream, font: CM.FONT.deco });
  },
});
}

/* ═════════ 41 · Golden Age (newsprint, 1938) ═════════ */
{
const P = { paper: '#f1dfa9', sky: '#f6ae2d', dot: '#e0502a', ground: '#8a5a2b', red: '#d63a2a', yellow: '#ffd23f', ink: '#16120f', bug: '#4f9a3a', bugD: '#2f6a24',
  top: '#ffb48c', front: '#f0683a', side: '#b9442a', leg: '#d9592f', legDark: '#9f3c24' };
const GROT = CM.FONT.grotesk;
function burst(g, x, y, r, n, seed) { g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * TAU, d = i & 1 ? r * (.62 + CM.hash(seed + i) * .12) : r * (1 + CM.hash(seed + i) * .15); g.lineTo(x + cos(a) * d * 1.2, y + sin(a) * d); } g.closePath(); }
CM.style({
  id: 'sgolden', n: 41, title: 'Golden Age', caption: 'Newsprint, 1938',
  init(env) {
    const r = CM.RNG(41);
    return {
      bg: env.layer(g => {
        g.fillStyle = P.paper; g.fillRect(0, 0, 400, 400);
        g.fillStyle = P.sky; g.fillRect(8, 78, 384, 236);
        CM.halftone(g, [[[8, 78], [392, 78], [392, 314], [8, 314]]], 6, (x, y) => .6 + (y - 78) / 236 * 1.3, PI / 4, CM.alpha(P.dot, .55));
        g.fillStyle = P.ground; g.fillRect(8, 312, 384, 80);
        CM.hatch(g, [[8, 314], [392, 314], [392, 392], [8, 392]], .12, 7, 1, { color: 'rgba(40,20,5,.5)', wobble: 1.4, seed: 4 });
        g.fillStyle = P.ink; g.fillRect(8, 311, 384, 2.5);
        /* masthead */
        g.fillStyle = P.red; g.fillRect(8, 8, 384, 66); g.strokeStyle = P.ink; g.lineWidth = 2.5; g.strokeRect(8, 8, 384, 66); g.strokeRect(8, 8, 384, 384);
        for (const [x, l1, l2] of [[16, 'No.', '1'], [338, '10¢', 'JUNE']]) {
          g.fillStyle = P.yellow; g.fillRect(x, 16, 46, 50); g.strokeRect(x, 16, 46, 50);
          g.fillStyle = P.ink; g.textAlign = 'center'; g.font = `700 13px ${GROT}`; g.fillText(l1, x + 23, 36); g.font = `700 ${l2.length > 2 ? 11 : 20}px ${GROT}`; g.fillText(l2, x + 23, 58);
        }
        g.font = `italic 900 46px ${GROT}`; const w = g.measureText('TERMINAL').width, k = min(1, 260 / w);
        g.save(); g.translate(200, 60); g.scale(k, 1); g.textAlign = 'center'; g.lineJoin = 'round'; g.lineWidth = 6; g.strokeStyle = P.ink; g.strokeText('TERMINAL', 2, 2); g.strokeText('TERMINAL', 0, 0); g.fillStyle = P.yellow; g.fillText('TERMINAL', 0, 0); g.restore();
        /* the caption box */
        g.fillStyle = '#fff4c8'; g.fillRect(16, 86, 136, 40); g.strokeRect(16, 86, 136, 40);
        g.fillStyle = P.ink; g.textAlign = 'center'; g.font = `700 9px ${GROT}`; g.fillText('STARTING THIS ISSUE!', 84, 101); g.font = `italic 900 17px ${GROT}`; g.fillText('CLAWD!', 84, 120);
      }),
      grain: env.layer(g => { for (let i = 0; i < 2600; i++) { g.fillStyle = r() < .5 ? 'rgba(90,60,20,.12)' : 'rgba(255,250,230,.3)'; g.fillRect(r() * 400, r() * 400, r.range(.5, 1.6), r.range(.5, 1.6)); } }),
    };
  },
  draw(g, env, rig, S) {
    const p = rig.pose, t = env.t, M = CM.build(p, { cx: 168, cy: 236, s: 10.6 });
    env.stamp(g, S.bg);
    /* a bug, flipped on its back, legs going */
    const bx = 324, by = 296, rot = sin(t * 3) * .12;
    g.save(); g.translate(bx, by); g.rotate(PI + rot); g.lineCap = 'round';
    g.strokeStyle = P.ink; g.lineWidth = 2.4;
    for (let i = 0; i < 6; i++) { const x = -14 + (i % 3) * 14, s = i < 3 ? -1 : 1, k = sin(t * 14 + i * 1.7) * 5; g.beginPath(); g.moveTo(x, s * 10); g.lineTo(x + k, s * 24); g.lineTo(x + k + 6, s * 28); g.stroke(); }
    g.fillStyle = P.bug; g.beginPath(); g.ellipse(0, 0, 28, 17, 0, 0, TAU); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-26, 0); g.lineTo(26, 0); g.stroke();
    g.fillStyle = P.bugD; g.beginPath(); g.arc(30, 0, 9, 0, TAU); g.fill(); g.stroke();
    g.restore();
    g.strokeStyle = P.ink; g.lineWidth = 2; for (const [a, d] of [[-2.3, 40], [-1.6, 44], [-.9, 40]]) { g.beginPath(); g.moveTo(bx + cos(a) * d, by + sin(a) * d); g.lineTo(bx + cos(a) * (d + 12), by + sin(a) * (d + 12)); g.stroke(); }
    /* sound effect */
    const sc = 1 + .06 * sin(t * 6);
    g.save(); g.translate(318, 168); g.scale(sc, sc); burst(g, 0, 0, 40, 11, 41); g.fillStyle = P.yellow; g.fill(); g.lineWidth = 2.5; g.strokeStyle = P.ink; g.stroke();
    g.rotate(-.12); g.fillStyle = P.red; g.font = `italic 900 23px ${GROT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 3; g.strokeText('FIXED!', 0, 2); g.fillText('FIXED!', 0, 2); g.restore();
    g.textBaseline = 'alphabetic';
    /* Clawd: the colour plate printed off the black key, peeking out past the contour */
    CM.drawStars(g, M, false, { fill: P.yellow, ink: P.ink });
    g.save(); g.translate(3.4, 2.4); g.fillStyle = P.front; g.beginPath(); for (const h of M.hulls) CM.path(g, h); g.fill(); g.restore();
    contour(g, M, P.ink, 2.6);
    paintParts(M, f => { CM.fillPoly(g, f.pts, tone(f, P)); if (f.name !== 'front' && f.name !== 'top') CM.halftone(g, f.pts, 4.2, () => 1.2, PI / 4, CM.alpha(P.red, .7)); },
      pt => strokeEdges(g, pt, P.ink, 1.3));
    CM.drawEyes(g, M, { color: P.ink, glint: '#fff' });
    CM.drawStars(g, M, true, { fill: P.yellow, ink: P.ink });
    CM.drawZzz(g, M, { color: P.ink, font: GROT });
    env.stamp(g, S.grain);
  },
});
}

/* ═════════ 42 · Neon (diner sign, 1950s) ═════════ */
{
const P = { wall: '#1a1214', mortar: '#0e090a', body: '#ff8a3d', face: '#ff6f61', eye: '#5fc8ff', pink: '#ff4fa3', green: '#3dff7a' };
const SCRIPT = '"Snell Roundhand","Brush Script MT","Segoe Script","URW Chancery L",cursive';
/* a lit tube: wide faint halo, tighter glow, the tube, a hot white core */
function tube(g, trace, color, on = 1) {
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  for (const [w, a, c] of [[16, .07, color], [9, .16, color], [4.2, .9, color], [1.6, .9, CM.mix(color, '#ffffff', .65)]]) { g.globalAlpha = a * on; g.lineWidth = w; g.strokeStyle = c; trace(); }
  g.restore();
}
CM.style({
  id: 'sneon', n: 42, title: 'Neon', caption: 'Diner sign, 1950s',
  init(env) {
    const r = CM.RNG(42);
    return { bg: env.layer(g => {
      g.fillStyle = P.mortar; g.fillRect(0, 0, 400, 400);
      for (let j = 0, y = 0; y < 400; j++, y += 18) for (let x = -(j % 2) * 22; x < 400; x += 44) { g.fillStyle = CM.mix('#2c1c1f', '#41282b', r()); g.fillRect(x + 1.5, y + 1.5, 41, 15); }
      const v = g.createRadialGradient(200, 200, 60, 200, 200, 300); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.65)'); g.fillStyle = v; g.fillRect(0, 0, 400, 400);
      /* the unlit glass of the lettering, faintly visible on the wall */
      g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 2; g.font = `italic 600 50px ${SCRIPT}`; g.textAlign = 'center'; g.strokeText('Clawd’s Diner', 200, 304);
      g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(150, 300, 3, 40); g.fillRect(250, 300, 3, 40);
    }) };
  },
  draw(g, env, rig, S) {
    const p = rig.pose, t = env.t, M = CM.build(p, { cx: 200, cy: 156, s: 10.4 }), outl = CM.outline(M, { res: 60 });
    env.stamp(g, S.bg);
    const blink = CM.hash(floor(t * 9) + 4242) < .025 ? .25 : 1;
    g.save(); g.globalCompositeOperation = 'lighter';
    const wash = g.createRadialGradient(M.center[0], M.center[1], 10, M.center[0], M.center[1], 190); wash.addColorStop(0, `rgba(255,120,60,${.22 * blink})`); wash.addColorStop(1, 'rgba(255,120,60,0)');
    g.fillStyle = wash; g.fillRect(0, 0, 400, 400);
    const pw = g.createRadialGradient(200, 296, 10, 200, 296, 170); pw.addColorStop(0, 'rgba(255,80,160,.16)'); pw.addColorStop(1, 'rgba(255,80,160,0)'); g.fillStyle = pw; g.fillRect(0, 0, 400, 400);
    g.restore();
    /* Clawd bent in glass: the outline, the front face, the eyes */
    tube(g, () => { g.beginPath(); for (const o of outl) CM.path(g, o); g.stroke(); }, P.body, blink);
    if (M.frontVis) tube(g, () => { g.beginPath(); CM.path(g, CM.offsetPoly(M.front.pts, 3.5)); g.stroke(); }, P.face, blink);
    for (const e of M.eyes) if (e.vis) tube(g, () => { g.beginPath(); if (e.poly) CM.path(g, e.poly); for (const l of e.lines) CM.path(g, l, false); g.stroke(); }, P.eye, blink);
    for (const s of M.stars) tube(g, () => { g.beginPath(); g.arc(s.x, s.y, 5 * s.k, 0, TAU); g.stroke(); }, '#fff27a');
    /* the sign, and OPEN with a tired E */
    g.font = `italic 600 50px ${SCRIPT}`; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    tube(g, () => g.strokeText('Clawd’s Diner', 200, 304), P.pink);
    g.font = `700 26px ${CM.FONT.grotesk}`; const E = CM.noise1(t * 2.2, 42) > .45 ? .12 : 1;
    [...'OPEN'].forEach((c, i) => tube(g, () => g.strokeText(c, 296 + i * 24, 364), P.green, c === 'E' ? E : 1));
    CM.drawZzz(g, M, { color: P.eye });
  },
});
}

/* ═════════ 43 · Silkscreen (after Warhol, 1960s) ═════════ */
{
const INK = '#151213';
const Q = [
  { bg: '#f39a3c', front: '#ffd36b', top: '#fff0b0', side: '#d9573b', eye: '#2a3cb0' },
  { bg: '#3fc1b0', front: '#ff7a5c', top: '#ffd0c0', side: '#2b6f8f', eye: '#ffe14d' },
  { bg: '#f06aa8', front: '#ffe14d', top: '#fff6c0', side: '#9b3fa0', eye: '#2b6f8f' },
  { bg: '#d8e84a', front: '#f28c28', top: '#ffe9b0', side: '#3d8f5f', eye: '#c2185b' },
];
CM.style({
  id: 'ssilk', n: 43, title: 'Silkscreen', caption: 'After Warhol, 1960s',
  draw(g, env, rig) {
    const p = rig.pose, t = env.t;
    g.fillStyle = '#e8e4da'; g.fillRect(0, 0, 400, 400);
    Q.forEach((c, q) => {
      const qx = (q % 2) * 200, qy = floor(q / 2) * 200, M = CM.build(p, { cx: qx + 100, cy: qy + 104, s: 7.2 });
      /* every print in the run lands a little differently: the colour screen drifts off the black one */
      const k = floor(t / 1.6), dx = (CM.hash(q * 31 + k) - .5) * 5, dy = (CM.hash(q * 17 + k + 9) - .5) * 4;
      g.save(); g.beginPath(); g.rect(qx + 2, qy + 2, 196, 196); g.clip();
      g.fillStyle = c.bg; g.fillRect(qx, qy, 200, 200);
      /* part by part, back to front: the colour screen drifted off, then the black key's halftone in the shadows */
      contour(g, M, INK, 1.5);
      paintParts(M, f => {
        g.save(); g.translate(dx, dy); CM.fillPoly(g, f.pts, f.name === 'top' ? c.top : f.name === 'front' ? c.front : c.side); g.restore();
        if (f.light < .55) CM.halftone(g, f.pts, 3.6, () => .5 + (.55 - f.light) * 2, PI / 4, INK);
      });
      g.save(); g.translate(dx, dy); for (const e of M.eyes) if (e.vis && e.poly) CM.fillPoly(g, CM.offsetPoly(e.poly, -2.2), c.eye); g.restore();
      CM.drawEyes(g, M, { color: INK, glint: false });
      CM.drawStars(g, M, true, { fill: c.top, ink: INK, r: 6 });
      CM.drawZzz(g, M, { color: INK, font: CM.FONT.grotesk });
      g.restore();
    });
  },
});
}

/* ═════════ 44 · Line printer (ASCII art, 1970s) ═════════ */
{
const INK = '#26262a', RAMP = ' .:-=+*#%@', CW = 6.2, CH = 10, X0 = 36, Y0 = 40, COLS = 53, ROWS = 25;
CM.style({
  id: 'sprinter', n: 44, title: 'Line Printer', caption: 'ASCII art, 1970s',
  init(env) {
    const r = CM.RNG(44);
    return { bg: env.layer(g => {
      g.fillStyle = '#f6f7f0'; g.fillRect(0, 0, 400, 400);
      g.fillStyle = '#d3e8d0'; for (let y = 0; y < 400; y += 60) g.fillRect(30, y, 340, 30);
      g.fillStyle = '#ecede4'; g.fillRect(0, 0, 30, 400); g.fillRect(370, 0, 30, 400);
      g.strokeStyle = 'rgba(0,0,0,.18)'; g.setLineDash([2, 3]); g.beginPath(); g.moveTo(30, 0); g.lineTo(30, 400); g.moveTo(370, 0); g.lineTo(370, 400); g.stroke(); g.setLineDash([]);
      g.fillStyle = '#2b2b2e'; for (let y = 12; y < 400; y += 24) for (const x of [15, 385]) { g.beginPath(); g.arc(x, y, 4.5, 0, TAU); g.fill(); }
      g.fillStyle = INK; g.font = `500 7.5px ${MONO}`; g.textBaseline = 'middle'; g.textAlign = 'left';
      g.fillText('CLAWD.TXT        RUN 1977-06-14 14:02        PAGE 0001', 40, 18);
      g.fillText('*** ALL TESTS PASSED ***       *** END OF JOB ***', 40, 388);
      /* a skyline in characters along the foot of the page */
      g.font = `600 9.5px ${MONO}`; let x = 0;
      while (x < COLS) {
        const w = 3 + floor(r() * 5), h = 2 + floor(r() * 6), ch = r.pick(['#', 'H', '8', '%']);
        for (let j = 0; j < h; j++) for (let i = 0; i < w && x + i < COLS; i++) g.fillText(j === h - 1 ? '=' : (i + j) % 2 && r() < .3 ? ':' : ch, X0 + (x + i) * CW, 372 - j * CH);
        x += w + floor(r() * 2);
      }
    }) };
  },
  draw(g, env, rig, S) {
    const p = rig.pose, M = CM.build(p, { cx: 200, cy: 188, s: 11 }), { C } = cells(M, COLS, ROWS, [X0, Y0, X0 + COLS * CW, Y0 + ROWS * CH]);
    env.stamp(g, S.bg);
    g.font = `600 9.5px ${MONO}`; g.textBaseline = 'middle'; g.textAlign = 'left';
    for (let j = 0; j < ROWS; j++) {
      /* the ribbon prints some lines darker than others, and the hammers strike a touch off line */
      g.globalAlpha = .78 + CM.hash(j + 440) * .22; const jy = (CM.hash(j + 441) - .5) * 1.2;
      for (let i = 0; i < COLS; i++) {
        const c = C[j * COLS + i]; if (!c) continue;
        const x = X0 + i * CW, y = Y0 + j * CH + CH / 2 + jy;
        g.fillStyle = INK;
        if (c.eye) { g.fillText('@', x, y); g.fillText('@', x + .6, y); continue; }
        const d = c.rim ? .8 : 1 - c.f.light * (c.f.name === 'top' ? .75 : .55);
        const ch = RAMP[min(RAMP.length - 1, max(2, round(d * (RAMP.length - 1))))];
        g.fillText(ch, x, y); if (c.rim) g.fillText(ch, x + .5, y);
      }
    }
    g.globalAlpha = 1;
    for (const s of M.stars) { g.fillStyle = INK; g.fillText('*', s.x, s.y); }
    CM.drawZzz(g, M, { color: INK, font: MONO });
  },
});
}

/* ═════════ 45 · Handheld (four shades of green, 1989) ═════════ */
{
const SH = ['#c5d36b', '#8fa83f', '#4f6b2a', '#1f3415'], R = 100, K = 400 / R;
const CLOUD = ['..####...', '.#....##.', '#.......#', '#########'];
const MSG = 'HELLO WORLD';
CM.style({
  id: 'shandheld', n: 45, title: 'Handheld', caption: 'Four shades of green, 1989',
  init(env) {
    const r = CM.RNG(45), city = [];
    for (let x = 0; x < 200;) { const w = 6 + floor(r() * 8), h = 8 + floor(r() * 16); city.push({ x, w, h, lit: r() }); x += w + 1 + floor(r() * 3); }
    return {
      lo: CM.canvas(R, R), city,
      lcd: env.layer(g => { g.fillStyle = 'rgba(31,52,21,.08)'; for (let k = 0; k <= 400; k += K) { g.fillRect(k - .3, 0, .6, 400); g.fillRect(0, k - .3, 400, .6); } }),
    };
  },
  draw(g, env, rig, S) {
    const p = rig.pose, t = env.t, M = CM.build(p, { cx: 200, cy: 196, s: 10.4 }), { C } = cells(M, R, R, [0, 0, 400, 400]), L = S.lo.g;
    const px = (x, y, c) => { L.fillStyle = SH[c]; L.fillRect(x, y, 1, 1); };
    L.fillStyle = SH[0]; L.fillRect(0, 0, R, R);
    /* the horizon dither, drifting clouds, and the city scrolling past */
    for (let y = 56; y < 78; y++) for (let x = (y & 1); x < R; x += 2) if (y > 66 || (x + y) % 4 === 0) px(x, y, 1);
    [[10, 16, 3], [60, 22, 2], [100, 13, 4]].forEach(([x0, y0, v]) => {
      const x = ((floor(x0 - t * v) % 120) + 120) % 120 - 10;
      CLOUD.forEach((row, j) => { for (let i = 0; i < row.length; i++) if (row[i] === '#') px(x + i, y0 + j, 3); });
    });
    const off = floor(t * 5) % 200;
    for (const b of S.city) for (const base of [b.x - off, b.x - off + 200]) {
      if (base > R || base + b.w < 0) continue;
      L.fillStyle = SH[2]; L.fillRect(base, 78 - b.h, b.w, b.h); L.fillStyle = SH[3]; L.fillRect(base, 78 - b.h, b.w, 1);
      for (let y = 78 - b.h + 3; y < 76; y += 3) for (let x = base + 2; x < base + b.w - 1; x += 2) if (CM.hash2(x - base + b.x, y, 7) < b.lit) px(x, y, 0);
    }
    /* Clawd, rasterised straight onto the LCD */
    for (let j = 0; j < R; j++) for (let i = 0; i < R; i++) {
      const c = C[j * R + i]; if (!c) continue;
      px(i, j, c.eye || c.rim ? 3 : c.f.name === 'top' ? 0 : c.f.name === 'front' && c.f.part === 'body' ? 1 : 2);
    }
    for (const s of M.stars) { const x = round(s.x / K), y = round(s.y / K); px(x, y, 3); px(x - 1, y, 3); px(x + 1, y, 3); px(x, y - 1, 3); px(x, y + 1, 3); }
    if (p.sleep > .3) pixText('Z', round(M.top[0] / K) + 6, round(M.top[1] / K) - 8 - (floor(t * 2) % 3), (x, y) => px(x, y, 3));
    /* the status bar and the text box */
    L.fillStyle = SH[0]; L.fillRect(0, 0, R, 9); L.fillStyle = SH[3]; L.fillRect(0, 9, R, 1);
    pixText('SCORE ' + String(2318 + floor(t * 7) % 7000).padStart(6, '0'), 2, 2, (x, y) => px(x, y, 3));
    pixText('♥x3', R - 13, 2, (x, y) => px(x, y, 3));
    L.fillStyle = SH[3]; L.fillRect(0, 80, R, 20); L.fillStyle = SH[0]; L.fillRect(1, 81, R - 2, 18); L.fillStyle = SH[3]; L.fillRect(2, 82, R - 4, 16); L.fillStyle = SH[0]; L.fillRect(3, 83, R - 6, 14);
    const n = min(MSG.length, floor((t * 8) % 30));
    pixText(MSG.slice(0, n), 6, 87, (x, y) => px(x, y, 3));
    if (n === MSG.length && floor(t * 2) % 2) { L.fillStyle = SH[3]; L.fillRect(89, 91, 5, 1); L.fillRect(90, 92, 3, 1); L.fillRect(91, 93, 1, 1); }
    g.imageSmoothingEnabled = false; g.drawImage(S.lo.c, 0, 0, 400, 400); g.imageSmoothingEnabled = true;
    env.stamp(g, S.lcd);
  },
});
}

/* ═════════ 46 · Low poly (polygon era, 1999) ═════════ */
{
const P = { top: '#f7a77c', front: '#e8693e', side: '#b84b2c', leg: '#d65a35', legDark: '#a2432a' };
const GOLD = ['#7a5410', '#b8860b', '#e8b923', '#ffe27a'];
const VP = [200, 170];
const prj = (X, Y, z) => [VP[0] + X * 170 / z, VP[1] + (1.4 - Y) * 170 / z];
function hud(g, str, x, y, size, align = 'left') {
  g.font = `italic 900 ${size}px ${CM.FONT.grotesk}`; g.textAlign = align; g.textBaseline = 'alphabetic'; g.lineJoin = 'round';
  g.lineWidth = 4; g.strokeStyle = '#1a1206'; g.strokeText(str, x, y);
  const G = g.createLinearGradient(0, y - size, 0, y); G.addColorStop(0, '#fff3a8'); G.addColorStop(.5, '#ffc928'); G.addColorStop(1, '#e8781a'); g.fillStyle = G; g.fillText(str, x, y);
}
CM.style({
  id: 'slowpoly', n: 46, title: 'Low Poly', caption: 'Polygon era, 1999',
  init(env) {
    const r = CM.RNG(46);
    return { bg: env.layer(g => {
      ['#5e93c9', '#73a5d4', '#8ab6dd', '#a3c7e6', '#bdd8ee', '#d6e8f4'].forEach((c, k) => { g.fillStyle = c; g.fillRect(0, k * 29, 400, 30); });
      g.fillStyle = '#76866a'; g.fillRect(0, 170, 400, 230);
      CM.fillPoly(g, [prj(-1.4, 0, 60), prj(1.4, 0, 60), prj(1.4, 0, .9), prj(-1.4, 0, .9)], '#5a5d64');
      for (let z = 1.2; z < 40; z *= 1.45) CM.fillPoly(g, [prj(-.05, 0, z), prj(.05, 0, z), prj(.05, 0, z * 1.2), prj(-.05, 0, z * 1.2)], '#e8c547');
      /* blocks of flats down both sides, farthest first */
      for (let z = 40; z > 1.6; z /= 1.38) for (const side of [-1, 1]) {
        const X = side * (2 + r() * .6), z1 = z / 1.25, H = 2.5 + r() * 4, c = r.pick(['#7f9aa6', '#8e8f7c', '#6f8796', '#9a8a74']);
        const wall = [prj(X, 0, z), prj(X, 0, z1), prj(X, H, z1), prj(X, H, z)], front = [prj(X, 0, z1), prj(X + side * 2, 0, z1), prj(X + side * 2, H, z1), prj(X, H, z1)];
        CM.fillPoly(g, front, CM.shade(c, .82)); CM.fillPoly(g, wall, c);
        g.fillStyle = 'rgba(40,60,80,.55)';
        for (let y = .6; y < H - .3; y += .8) for (let u = .15; u < .9; u += .3) { const za = z + (z1 - z) * u, zb = z + (z1 - z) * (u + .14); CM.fillPoly(g, [prj(X, y, za), prj(X, y, zb), prj(X, y + .4, zb), prj(X, y + .4, za)]); }
      }
      for (const [x, z, c] of [[-.7, 6, '#f2f2f2'], [.6, 3.4, '#e8c547'], [-.6, 2.4, '#d24b3c']]) {
        CM.fillPoly(g, [prj(x - .3, 0, z), prj(x + .3, 0, z), prj(x + .3, .45, z), prj(x - .3, .45, z)], c);
        CM.fillPoly(g, [prj(x - .3, .45, z), prj(x + .3, .45, z), prj(x + .3, .45, z * 1.15), prj(x - .3, .45, z * 1.15)], CM.shade(c, 1.15));
      }
    }) };
  },
  draw(g, env, rig, S) {
    const p = rig.pose, t = env.t, M = CM.build(p, { cx: 200, cy: 214, s: 10.8 });
    env.stamp(g, S.bg);
    /* the gold ring, a coarse torus: the far half behind Clawd, the near half in front */
    const a = .5 + .3 * sin(t * .7), R = 136, W = 15, cx = 200, cy = 206, segs = [];
    for (let k = 0; k < 20; k++) {
      const t0 = k / 20 * TAU, t1 = (k + 1) / 20 * TAU, pt = (th, rr) => [cx + rr * cos(th) * cos(a), cy + rr * sin(th) * .92];
      const q = [pt(t0, R - W), pt(t1, R - W), pt(t1, R + W), pt(t0, R + W)], z = cos((t0 + t1) / 2) * sin(a);
      const lit = (sin((t0 + t1) / 2 - 2.2) + 1) / 2; segs.push({ q, z, c: GOLD[min(3, floor(lit * 3.99))] });
    }
    for (const s of segs) if (s.z < 0) CM.fillPoly(g, s.q, s.c);
    /* Clawd in flat-shaded triangles, each quad split the way the hardware drew it */
    g.fillStyle = P.side; g.beginPath(); for (const h of M.hulls) CM.path(g, h); g.fill();
    for (const f of M.faces) {
      const c = CM.shade(tone(f, P), .8 + .3 * f.light), [a0, a1, a2, a3] = f.pts;
      CM.fillPoly(g, [a0, a1, a2], c); CM.fillPoly(g, [a0, a2, a3], CM.shade(tone(f, P), .74 + .3 * f.light));
    }
    CM.drawEyes(g, M, { color: '#1a1206', glint: '#ffffff' });
    for (const s of segs) if (s.z >= 0) CM.fillPoly(g, s.q, s.c);
    CM.drawStars(g, M, true, { fill: '#ffe27a', ink: '#1a1206' });
    CM.drawZzz(g, M, { color: '#1a1206', font: CM.FONT.grotesk });
    /* HUD */
    g.strokeStyle = '#1a1206'; g.lineWidth = 6; g.beginPath(); g.arc(28, 28, 9, 0, TAU); g.stroke(); g.strokeStyle = '#ffc928'; g.lineWidth = 3.4; g.stroke();
    hud(g, 'RINGS 07/12', 44, 36, 21);
    hud(g, 'TIME 0:' + String((42 + floor(t)) % 60).padStart(2, '0'), 382, 36, 21, 'right');
    g.fillStyle = '#e8693e'; g.strokeStyle = '#1a1206'; g.lineWidth = 2; g.fillRect(16, 364, 20, 16); g.strokeRect(16, 364, 20, 16); g.fillStyle = '#1a1206'; g.fillRect(21, 368, 2.5, 5); g.fillRect(29, 368, 2.5, 5);
    hud(g, '×3', 42, 382, 20);
    g.fillStyle = 'rgba(20,30,90,.82)'; g.fillRect(186, 360, 200, 24); g.strokeStyle = '#f2f2f2'; g.lineWidth = 1.5; g.strokeRect(186, 360, 200, 24);
    g.fillStyle = '#ffffff'; g.font = `800 11px ${CM.FONT.grotesk}`; g.textAlign = 'center'; CM.spaced(g, 'JUMP THROUGH THE RING!', 286, 376, 1);
  },
});
}

/* ═════════ 47 · Stencil (spray paint, 2000s) ═════════ */
{
const P = { wall: '#b9b5ad', blot: '#6f6b64', paint: '#1d1c1c', grey: '#5b5856', red: '#d0261d', bare: '#cbc7bf' };
function heart(g, x, y, s) { g.moveTo(x, y + s * .9); g.bezierCurveTo(x - s * 1.3, y + s * .1, x - s * .9, y - s * .9, x, y - s * .35); g.bezierCurveTo(x + s * .9, y - s * .9, x + s * 1.3, y + s * .1, x, y + s * .9); g.closePath(); }
CM.style({
  id: 'sstencil', n: 47, title: 'Stencil', caption: 'Spray paint, 2000s',
  init(env) {
    return { bg: env.layer(g => {
      ground(g, P.wall, P.blot, 47, { amt: .38, grainA: .22, grain: 5000 });
      g.fillStyle = 'rgba(60,58,54,.35)'; g.fillRect(0, 132, 400, 1.5); g.fillRect(0, 268, 400, 1.5);
      for (const y of [66, 200, 334]) for (const x of [60, 200, 340]) { g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.arc(x + .8, y + .8, 4, 0, TAU); g.fill(); g.fillStyle = '#5f5b55'; g.beginPath(); g.arc(x, y, 3.4, 0, TAU); g.fill(); }
      /* SHIP IT, cut as a stencil: the letters broken by bridges */
      const L = CM.canvas(400, 400); L.g.fillStyle = 'rgba(40,38,36,.85)'; L.g.font = `900 34px ${CM.FONT.grotesk}`; L.g.textAlign = 'right'; L.g.textBaseline = 'alphabetic'; CM.spaced(L.g, 'SHIP IT', 380, 380, 4, 'right');
      L.g.globalCompositeOperation = 'destination-out'; for (let x = 236; x < 384; x += 11.4) L.g.fillRect(x, 352, 1.6, 34);
      g.drawImage(L.c, 0, 0);
      g.strokeStyle = '#3c5bb5'; g.lineWidth = 1.4; g.beginPath(); for (let k = 0; k <= 30; k++) g.lineTo(340 + k * 1.4, 392 - sin(k * .9) * 3 - (k % 7 === 0 ? 4 : 0)); g.stroke();
    }) };
  },
  draw(g, env, rig, S) {
    const p = rig.pose, t = env.t, M = CM.build(p, { cx: 168, cy: 236, s: 10.4 });
    env.stamp(g, S.bg);
    /* a red heart balloon on a string from the right hand */
    const hand = M.armTip(1), bx = hand[0] + 66 + sin(t * .9) * 7, by = max(56, hand[1] - 130 + cos(t * 1.1) * 4);
    g.strokeStyle = P.paint; g.lineWidth = 1.1; g.beginPath(); g.moveTo(hand[0], hand[1]); g.quadraticCurveTo(hand[0] + 50, hand[1] - 40 + sin(t * 1.3) * 8, bx, by + 24); g.stroke();
    for (const [grow, a] of [[5, .1], [2.5, .2], [0, 1]]) { g.fillStyle = CM.alpha(P.red, a); g.beginPath(); heart(g, bx, by, 26 + grow); g.fill(); }
    /* overspray halo, then the cut: black body, a grey second layer on the tops, eyes left bare */
    g.lineJoin = 'round';
    for (const [grow, a] of [[-4.5, .08], [-2.2, .16]]) { g.fillStyle = CM.alpha(P.paint, a); g.beginPath(); for (const h of M.hulls) CM.path(g, CM.offsetPoly(h, grow)); g.fill(); }
    g.fillStyle = P.paint; g.beginPath(); for (const h of M.hulls) CM.path(g, h); g.fill();
    for (const f of M.faces) if (f.name === 'top' && abs(CM.area(f.pts)) > 60) CM.fillPoly(g, CM.offsetPoly(f.pts, 2.2), P.grey);
    if (M.frontVis) { const hl = [M.F(-5.3, 8.4), M.F(5.3, 8.4), M.F(5.3, 7.8), M.F(-5.3, 7.8)]; CM.fillPoly(g, hl, P.grey); }
    CM.drawEyes(g, M, { color: P.bare, glint: false });
    /* drips under the feet */
    g.strokeStyle = P.paint; g.fillStyle = P.paint; g.lineWidth = 1.6; g.lineCap = 'round';
    M.feet.forEach((f, i) => { if (CM.hash(i + 470) < .35) return; const x = f[0] + (CM.hash(i + 471) - .5) * 5, L = 8 + CM.hash(i + 472) * 22; g.beginPath(); g.moveTo(x, f[1] - 2); g.lineTo(x, f[1] + L); g.stroke(); g.beginPath(); g.arc(x, f[1] + L, 1.7, 0, TAU); g.fill(); });
    CM.drawStars(g, M, true, { fill: P.red, ink: P.paint });
    CM.drawZzz(g, M, { color: P.paint, font: CM.FONT.grotesk });
  },
});
}

/* ═════════ 48 · Patch (embroidered, 2020s) ═════════ */
{
const P = { denim: '#2f5a91', twillL: 'rgba(110,150,200,.45)', twillD: 'rgba(15,35,70,.45)', seam: '#264c7c', thread: '#d99a3a', border: '#7c2a20', borderL: '#b04a36', label: '#efe6d2',
  top: '#f4ae86', front: '#e06a42', side: '#a9472d', leg: '#c95a38', legDark: '#93402a' };
const ANG = { front: .95, top: .15, left: -.55, right: -.55, back: -.55, bottom: .2 };
CM.style({
  id: 'spatch', n: 48, title: 'Patch', caption: 'Embroidered, 2020s',
  init(env) {
    return { bg: env.layer(g => {
      ground(g, P.denim, '#a9c4e4', 48, { amt: .2, grainA: .25, grain: 4000 });
      const sq = [[0, 0], [400, 0], [400, 400], [0, 400]];
      CM.hatch(g, sq, -1.05, 2.6, .8, { color: P.twillL }); CM.hatch(g, sq, -1.05, 5.2, .9, { color: P.twillD });
      g.fillStyle = P.seam; g.fillRect(350, 0, 24, 400); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(350, 0, 2, 400);
      g.strokeStyle = P.thread; g.lineWidth = 1.4; g.setLineDash([5, 3]); for (const x of [356, 368]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 400); g.stroke(); } g.setLineDash([]);
      g.save(); g.translate(276, 352); g.rotate(-.04);
      g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(-58, -15, 120, 34); g.fillStyle = P.label; g.fillRect(-60, -17, 120, 34);
      g.strokeStyle = '#b8352a'; g.lineWidth = .7; g.setLineDash([2, 2]); g.strokeRect(-56, -13, 112, 26); g.setLineDash([]);
      g.fillStyle = '#b8352a'; g.textAlign = 'center'; g.font = `800 11px ${CM.FONT.grotesk}`; CM.spaced(g, 'TERMINAL', 0, 1, 2.6); g.font = `700 6.5px ${CM.FONT.grotesk}`; CM.spaced(g, 'SUPPLY CO. · NO. 48', 0, 10, 1);
      g.restore();
    }) };
  },
  draw(g, env, rig, S) {
    const p = rig.pose, M = CM.build(p, { cx: 176, cy: 196, s: 11 }), O = CM.outline(M, { res: 64 }), grown = O.map(o => CM.offsetPoly(o, -6));
    env.stamp(g, S.bg);
    g.lineJoin = 'round';
    /* the patch sits proud of the denim, sewn down with a running stitch */
    g.fillStyle = 'rgba(5,15,35,.45)'; g.beginPath(); for (const o of grown) CM.path(g, o.map(q => [q[0] + 2.5, q[1] + 3.5])); g.fill();
    g.strokeStyle = 'rgba(230,215,180,.75)'; g.lineWidth = .8; g.setLineDash([3, 2.4]); g.beginPath(); for (const o of O) CM.path(g, CM.offsetPoly(o, -9.5)); g.stroke(); g.setLineDash([]);
    g.fillStyle = P.border; g.beginPath(); for (const o of grown) CM.path(g, o); g.fill();
    /* satin stitch inside: each face laid in its own direction */
    paintParts(M, f => {
      const c = tone(f, P), ang = f.part[0] === 'l' ? PI / 2 - .1 : f.part[0] === 'a' ? .4 : ANG[f.name];
      CM.fillPoly(g, f.pts, CM.shade(c, .8)); CM.hatch(g, f.pts, ang, 2.1, 1.25, { color: CM.shade(c, 1.02 + .14 * f.light) });
    }, pt => strokeEdges(g, pt, 'rgba(60,20,10,.4)', 1));
    for (const e of M.eyes) if (e.vis) { if (e.poly) { CM.fillPoly(g, e.poly, '#1a1412'); CM.hatch(g, e.poly, PI / 2, 1.6, .7, { color: '#3a302c' }); } }
    CM.drawEyes(g, M, { color: '#1a1412', glint: '#e8e2d6' });
    /* the merrowed edge: a fat satin border stitched round the whole shape */
    g.lineWidth = 9; g.setLineDash([1.1, 1.2]); g.strokeStyle = P.borderL; g.beginPath(); for (const o of O) CM.path(g, CM.offsetPoly(o, -2.5)); g.stroke(); g.setLineDash([]);
    g.lineWidth = .8; g.strokeStyle = 'rgba(40,8,4,.6)'; g.beginPath(); for (const o of grown) CM.path(g, o); g.stroke();
    CM.drawStars(g, M, true, { fill: P.thread, ink: P.border });
    CM.drawZzz(g, M, { color: P.label, font: CM.FONT.grotesk });
  },
});
}

/* ═════════════════════════════════════════════════════════════════════════════
   49–51 · Y2K: chrome, skins and foil, the turn of the millennium in three looks.
   ═════════════════════════════════════════════════════════════════════════════ */
/* a four-point sparkle with a soft halo */
function sparkle(g, x, y, r, color = '#ffffff', glow = 'rgba(255,255,255,.55)') {
  if (r < .3) return;
  const gr = g.createRadialGradient(x, y, 0, x, y, r * 1.3); gr.addColorStop(0, glow); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r * 1.3, 0, TAU); g.fill();
  g.fillStyle = color; g.beginPath();
  for (let i = 0; i < 8; i++) { const a = i * PI / 4 - PI / 2, q = i & 1 ? r * .16 : r; g.lineTo(x + cos(a) * q, y + sin(a) * q); }
  g.closePath(); g.fill();
}

/* ═════════ 49 · Liquid Chrome (millennium chrome, 1999) ═════════ */
{
const HOR = 268;
/* each face reflects a sky over an orange desert: its normal sets where the horizon falls across it,
   so faces turned up show sky, faces turned down show ground, and the line slides as Clawd turns */
function chrome(g, f) {
  const bb = CM.bbox(f.pts), n = f.n, h = CM.clamp(.5 + n[1] * .42 - n[0] * .12, .06, .94);
  const gr = g.createLinearGradient(bb[0] + (bb[2] - bb[0]) * .2, bb[1], bb[0] + (bb[2] - bb[0]) * .35, bb[3]);
  gr.addColorStop(0, '#2d5fc4'); gr.addColorStop(h * .55, '#8fd2ff'); gr.addColorStop(h * .9, '#eefaff'); gr.addColorStop(h, '#ffffff');
  gr.addColorStop(min(1, h + .015), '#3a1b2e'); gr.addColorStop(min(1, h + .1), '#a9461c'); gr.addColorStop(1, '#ffc27a');
  CM.fillPoly(g, f.pts, gr);
  const k = (1 - f.light) * .45; if (k > .01) CM.fillPoly(g, f.pts, `rgba(20,10,60,${k.toFixed(3)})`);
}
function word(g, str, x, y, size) {
  g.save(); g.font = `italic 900 ${size}px ${CM.FONT.sans}`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round';
  for (let d = 6; d > 0; d--) { g.fillStyle = d > 1 ? '#3b136b' : '#7a2fd0'; g.fillText(str, x + d * .6, y + d * .8); }
  g.lineWidth = 5; g.strokeStyle = '#140829'; g.strokeText(str, x, y);
  const G = g.createLinearGradient(0, y - size * .8, 0, y);
  G.addColorStop(0, '#ffffff'); G.addColorStop(.42, '#a9dcff'); G.addColorStop(.5, '#24346e'); G.addColorStop(.58, '#c86a2c'); G.addColorStop(.85, '#ffd9a8'); G.addColorStop(1, '#ffffff');
  g.fillStyle = G; g.fillText(str, x, y);
  g.lineWidth = 1; g.strokeStyle = 'rgba(255,255,255,.8)'; g.strokeText(str, x, y);
  g.restore();
}
/* a turning wireframe globe */
function globe(g, x, y, r, t) {
  g.save(); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 1;
  g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke();
  for (let k = -2; k <= 2; k++) { const la = k * PI / 6, yy = y - sin(la) * r, rr = cos(la) * r; g.beginPath(); g.ellipse(x, yy, rr, rr * .22, 0, 0, TAU); g.stroke(); }
  for (let k = 0; k < 6; k++) { const a = (k * PI / 6 + t * .4) % PI, rx = abs(cos(a)) * r; g.beginPath(); g.ellipse(x, y, rx, r, 0, 0, TAU); g.stroke(); }
  g.restore();
}
CM.style({
  id: 'schrome', n: 49, title: 'Liquid Chrome', caption: 'Millennium chrome, 1999',
  init(env) {
    const r = CM.RNG(49);
    return {
      stars: Array.from({ length: 12 }, () => ({ x: r.range(16, 384), y: r.range(16, 250), r: r.range(5, 11), ph: r() * TAU, v: r.range(1.2, 2.4) })),
      bg: env.layer(g => {
        /* an iridescent sky: pink → lilac → cyan, with soft pools of colour */
        let G = g.createLinearGradient(0, 0, 400, HOR); G.addColorStop(0, '#ffb8ec'); G.addColorStop(.35, '#cdb4ff'); G.addColorStop(.7, '#9eeaff'); G.addColorStop(1, '#f2fdff');
        g.fillStyle = G; g.fillRect(0, 0, 400, HOR);
        for (const [x, y, rr, c] of [[60, 220, 140, '255,140,220'], [330, 40, 160, '120,240,255'], [210, 120, 120, '255,255,255']]) {
          G = g.createRadialGradient(x, y, 0, x, y, rr); G.addColorStop(0, `rgba(${c},.45)`); G.addColorStop(1, `rgba(${c},0)`); g.fillStyle = G; g.fillRect(0, 0, 400, HOR);
        }
        /* the floor: a violet void with a magenta grid running to the horizon */
        G = g.createLinearGradient(0, HOR, 0, 400); G.addColorStop(0, '#2a0f5c'); G.addColorStop(1, '#0b0420'); g.fillStyle = G; g.fillRect(0, HOR, 400, 140);
        g.save(); g.beginPath(); g.rect(0, HOR, 400, 140); g.clip(); g.lineWidth = 1.2;
        for (let i = -14; i <= 14; i++) { g.strokeStyle = 'rgba(255,90,230,.7)'; g.beginPath(); g.moveTo(200, HOR); g.lineTo(200 + i * 60, 400 + 300); g.stroke(); }
        for (let z = 1; z < 30; z *= 1.32) { const y = HOR + 132 / z; g.strokeStyle = `rgba(110,230,255,${(.85 / sqrt(z)).toFixed(3)})`; g.beginPath(); g.moveTo(0, y); g.lineTo(400, y); g.stroke(); }
        g.restore();
        G = g.createLinearGradient(0, HOR - 10, 0, HOR + 10); G.addColorStop(0, 'rgba(255,255,255,0)'); G.addColorStop(.5, 'rgba(255,255,255,.95)'); G.addColorStop(1, 'rgba(255,120,240,0)');
        g.fillStyle = G; g.fillRect(0, HOR - 10, 400, 20);
      }),
    };
  },
  draw(g, env, rig, S) {
    const p = rig.pose, t = env.t, M = CM.build(p, { cx: 200, cy: 204, s: 12.5 });
    env.stamp(g, S.bg);
    globe(g, 334, 74, 40, t);
    for (const s of S.stars) { const k = max(0, sin(t * s.v + s.ph)); sparkle(g, s.x, s.y, s.r * k * k); }
    CM.drawShadow(g, M, 'rgba(255,80,230,.45)');
    CM.drawStars(g, M, false, { fill: '#eef8ff', ink: '#3b136b' });
    contour(g, M, '#140829', 1.6);
    paintParts(M, f => chrome(g, f), pt => strokeEdges(g, pt, 'rgba(255,255,255,.75)', .9));
    CM.drawEyes(g, M, { color: '#0c0718', glint: '#ffffff' });
    /* a glint that runs round the rim */
    const H = M.parts.body.hull, u = (t * .25) % 1, i = floor(u * H.length), a = H[i], b = H[(i + 1) % H.length], w = u * H.length - i;
    sparkle(g, a[0] + (b[0] - a[0]) * w, a[1] + (b[1] - a[1]) * w, 10 + 3 * sin(t * 5));
    CM.drawStars(g, M, true, { fill: '#eef8ff', ink: '#3b136b' });
    CM.drawZzz(g, M, { color: '#ffffff', font: CM.FONT.sans });
    word(g, 'CLAWD 2K', 200, 372, 50);
  },
});
}

/* ═════════ 50 · Media Player Skin (player skin, 2001) ═════════ */
{
const P = { top: '#ff9a4d', front: '#f06a14', side: '#b8460a', leg: '#e0600f', legDark: '#a83f08' };
const SCR = [40, 66, 360, 214], INFO = [40, 222, 262, 270], CLK = [268, 222, 360, 270], SPEC = [40, 278, 170, 316], BARS = 20;
const GREEN = '#5cff8c', GHOST = 'rgba(92,255,140,.09)', LCDBG = '#07140c';
const rr = (g, x0, y0, x1, y1, r) => { g.beginPath(); g.roundRect(x0, y0, x1 - x0, y1 - y0, r); };
function bevel(g, x0, y0, x1, y1, r, inset) {
  const G = g.createLinearGradient(0, y0, 0, y1);
  G.addColorStop(0, inset ? 'rgba(0,0,0,.5)' : 'rgba(255,255,255,.95)'); G.addColorStop(1, inset ? 'rgba(255,255,255,.95)' : 'rgba(0,0,0,.4)');
  g.strokeStyle = G; g.lineWidth = 1.6; rr(g, x0, y0, x1, y1, r); g.stroke();
}
function well(g, [x0, y0, x1, y1], r, fill) { g.fillStyle = fill; rr(g, x0, y0, x1, y1, r); g.fill(); bevel(g, x0 - 1.5, y0 - 1.5, x1 + 1.5, y1 + 1.5, r + 1.5, true); }
function plate(g, x, y, w, h, r) {
  const G = g.createLinearGradient(0, y, 0, y + h); G.addColorStop(0, '#fbfcfe'); G.addColorStop(.48, '#d2d8e1'); G.addColorStop(.52, '#b9c1cd'); G.addColorStop(1, '#9aa4b3');
  g.fillStyle = 'rgba(0,0,0,.25)'; rr(g, x + .8, y + 1.5, x + w + .8, y + h + 1.5, r); g.fill();
  g.fillStyle = G; rr(g, x, y, x + w, y + h, r); g.fill(); bevel(g, x, y, x + w, y + h, r, false);
}
/* transport icons, drawn as shapes so they never depend on a font */
const tri = (g, x, y, s, dir) => { g.moveTo(x - s * dir, y - s); g.lineTo(x + s * dir, y); g.lineTo(x - s * dir, y + s); g.closePath(); };
const ICON = {
  prev(g, x, y) { g.fillRect(x - 7, y - 5, 2, 10); tri(g, x - 1, y, 5, -1); tri(g, x + 5, y, 5, -1); },
  play(g, x, y) { tri(g, x + 1, y, 6, 1); },
  pause(g, x, y) { g.rect(x - 5, y - 5.5, 3.5, 11); g.rect(x + 1.5, y - 5.5, 3.5, 11); },
  stop(g, x, y) { g.rect(x - 5, y - 5, 10, 10); },
  next(g, x, y) { tri(g, x - 5, y, 5, 1); tri(g, x + 1, y, 5, 1); g.fillRect(x + 5, y - 5, 2, 10); },
  eject(g, x, y) { g.moveTo(x - 6, y + 1); g.lineTo(x, y - 6); g.lineTo(x + 6, y + 1); g.closePath(); g.rect(x - 6, y + 3, 12, 2.5); },
};
function screw(g, x, y) {
  const G = g.createRadialGradient(x - 1, y - 1, 0, x, y, 4); G.addColorStop(0, '#ffffff'); G.addColorStop(1, '#7c8696');
  g.fillStyle = G; g.beginPath(); g.arc(x, y, 3.6, 0, TAU); g.fill(); g.strokeStyle = 'rgba(40,48,60,.7)'; g.lineWidth = .8; g.stroke();
  g.beginPath(); g.moveTo(x - 2.4, y - 1); g.lineTo(x + 2.4, y + 1); g.stroke();
}
function slider(g, x0, x1, y, v, label) {
  g.fillStyle = '#2b3240'; g.font = `800 7px ${CM.FONT.grotesk}`; g.textAlign = 'left'; g.textBaseline = 'middle'; CM.spaced(g, label, x0, y, 1, 'left');
  const a = x0 + 22; g.fillStyle = '#3d4655'; rr(g, a, y - 2, x1, y + 2, 2); g.fill(); bevel(g, a, y - 2, x1, y + 2, 2, true);
  const G = g.createLinearGradient(a, 0, x1, 0); G.addColorStop(0, '#2bd96a'); G.addColorStop(1, '#ffd23b'); g.fillStyle = G; rr(g, a + 1, y - 1, a + (x1 - a) * v, y + 1, 1); g.fill();
  plate(g, a + (x1 - a) * v - 6, y - 6, 12, 12, 3);
}
function toggle(g, x, y, label, on) {
  plate(g, x, y, 24, 14, 4);
  g.fillStyle = on ? GREEN : '#3a4a3e'; g.beginPath(); g.arc(x + 6, y + 7, 2.2, 0, TAU); g.fill();
  g.fillStyle = '#1d2840'; g.font = `800 7px ${CM.FONT.grotesk}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, x + 15.5, y + 7.5);
}
/* a seven-segment LCD digit, slanted, with its unlit segments faintly showing */
const SEG = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
function seg7(g, ch, x, y, w, h) {
  const L = { a: [0, 0, w, 0], b: [w, 0, w, h / 2], c: [w, h / 2, w, h], d: [0, h, w, h], e: [0, h / 2, 0, h], f: [0, 0, 0, h / 2], g: [0, h / 2, w, h / 2] }, on = SEG[ch] || '';
  g.save(); g.translate(x, y); g.transform(1, 0, -.14, 1, h * .14, 0); g.lineCap = 'round'; g.lineWidth = 2.6;
  for (const k in L) { const [x0, y0, x1, y1] = L[k], dx = (x1 - x0) * .14, dy = (y1 - y0) * .14; g.strokeStyle = on.includes(k) ? GREEN : GHOST; g.beginPath(); g.moveTo(x0 + dx, y0 + dy); g.lineTo(x1 - dx, y1 - dy); g.stroke(); }
  g.restore();
}
function lcdGrid(g, [x0, y0, x1, y1]) { g.fillStyle = 'rgba(92,255,140,.035)'; for (let x = x0 + 2; x < x1; x += 3) g.fillRect(x, y0, 1, y1 - y0); for (let y = y0 + 2; y < y1; y += 3) g.fillRect(x0, y, x1 - x0, 1); }
CM.style({
  id: 'sskin', n: 50, title: 'Media Player Skin', caption: 'Player skin, 2001',
  init(env) {
    return { peaks: new Float32Array(BARS), bg: env.layer(g => {
      /* the desktop behind, with a soft glow */
      let G = g.createLinearGradient(0, 0, 400, 400); G.addColorStop(0, '#123a8a'); G.addColorStop(1, '#2a0d4f'); g.fillStyle = G; g.fillRect(0, 0, 400, 400);
      G = g.createRadialGradient(200, 160, 0, 200, 160, 260); G.addColorStop(0, 'rgba(120,200,255,.35)'); G.addColorStop(1, 'rgba(120,200,255,0)'); g.fillStyle = G; g.fillRect(0, 0, 400, 400);
      g.fillStyle = 'rgba(0,0,0,.45)'; rr(g, 30, 33, 382, 389, 24); g.fill();
      /* the brushed-silver body */
      G = g.createLinearGradient(0, 26, 0, 382); G.addColorStop(0, '#f2f4f8'); G.addColorStop(.45, '#b7c0cc'); G.addColorStop(.55, '#cdd4de'); G.addColorStop(1, '#929cab');
      g.fillStyle = G; rr(g, 24, 26, 376, 382, 24); g.fill();
      g.save(); g.clip(); const r = CM.RNG(50);
      for (let y = 26; y < 384; y += .9) { g.fillStyle = r() < .5 ? `rgba(255,255,255,${r.range(.05, .2).toFixed(3)})` : `rgba(40,50,70,${r.range(.03, .12).toFixed(3)})`; g.fillRect(0, y, 400, .5); }
      G = g.createLinearGradient(24, 26, 200, 220); G.addColorStop(0, 'rgba(255,255,255,.35)'); G.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = G; g.fillRect(24, 26, 352, 356);
      g.restore();
      g.lineWidth = 2.5; g.strokeStyle = '#475162'; rr(g, 24, 26, 376, 382, 24); g.stroke();
      g.lineWidth = 1; g.strokeStyle = 'rgba(255,255,255,.8)'; rr(g, 26.5, 28.5, 373.5, 379.5, 22); g.stroke();
      for (const [x, y] of [[36, 70], [364, 70], [36, 370], [364, 370]]) screw(g, x, y);
      /* title bar */
      G = g.createLinearGradient(0, 36, 0, 58); G.addColorStop(0, '#8cb8ff'); G.addColorStop(.48, '#3a6fd8'); G.addColorStop(.52, '#2456c4'); G.addColorStop(1, '#1b48a8');
      g.fillStyle = G; rr(g, 38, 36, 362, 58, 11); g.fill(); bevel(g, 38, 36, 362, 58, 11, false);
      g.fillStyle = 'rgba(255,255,255,.35)'; rr(g, 44, 38, 356, 46, 6); g.fill();
      g.fillStyle = '#ffffff'; g.font = `italic 900 12px ${CM.FONT.sans}`; g.textBaseline = 'middle'; CM.spaced(g, 'CLAWDAMP', 54, 48, 1.6, 'left');
      g.fillStyle = 'rgba(255,255,255,.65)'; g.font = `italic 700 9px ${CM.FONT.sans}`; g.fillText('2.0', 140, 48.5);
      for (const [x, k] of [[316, 0], [332, 1], [348, 2]]) {
        G = g.createRadialGradient(x - 2, 44, 0, x, 47, 7); G.addColorStop(0, '#ffffff'); G.addColorStop(1, k === 2 ? '#ff8a8a' : '#c9d8f2');
        g.fillStyle = G; g.beginPath(); g.arc(x, 47, 6, 0, TAU); g.fill(); g.strokeStyle = 'rgba(20,40,90,.6)'; g.lineWidth = .8; g.stroke();
        g.strokeStyle = '#173a8c'; g.lineWidth = 1.4; g.lineCap = 'round'; g.beginPath();
        if (k === 0) { g.moveTo(x - 2.5, 49); g.lineTo(x + 2.5, 49); } else if (k === 1) g.rect(x - 2.5, 44.5, 5, 5); else { g.moveTo(x - 2.3, 44.7); g.lineTo(x + 2.3, 49.3); g.moveTo(x + 2.3, 44.7); g.lineTo(x - 2.3, 49.3); }
        g.stroke();
      }
      /* screen, info LCD, clock and spectrum wells */
      well(g, SCR, 8, '#05070d'); well(g, INFO, 6, LCDBG); well(g, CLK, 6, LCDBG); well(g, SPEC, 5, LCDBG);
      for (const w of [INFO, CLK, SPEC]) lcdGrid(g, w);
      /* static info row: bitrate, sample rate, stereo */
      g.font = `700 8px ${MONO}`; g.textBaseline = 'middle'; g.textAlign = 'left';
      for (const [x, s, on] of [[46, '128 kbps', 1], [96, '44 kHz', 1], [196, 'MONO', 0], [224, 'STEREO', 1]]) { g.fillStyle = on ? GREEN : GHOST; g.fillText(s, x, 260); }
      g.fillStyle = 'rgba(92,255,140,.25)'; g.fillRect(44, 249, 214, .8);
      /* sliders and toggles */
      slider(g, 178, 300, 287, .72, 'VOL'); slider(g, 178, 300, 307, .5, 'BAL');
      toggle(g, 308, 280, 'EQ', true); toggle(g, 336, 280, 'PL', false); toggle(g, 308, 299, 'SHF', false); toggle(g, 336, 299, 'REP', true);
      /* seek track */
      g.fillStyle = '#3d4655'; rr(g, 40, 326, 360, 332, 3); g.fill(); bevel(g, 40, 326, 360, 332, 3, true);
      /* transport row */
      ['prev', 'play', 'pause', 'stop', 'next'].forEach((k, i) => { plate(g, 40 + i * 33, 342, 30, 24, 6); g.fillStyle = '#1d2840'; g.beginPath(); ICON[k](g, 55 + i * 33, 354); g.fill(); });
      plate(g, 210, 342, 26, 24, 6); g.fillStyle = '#1d2840'; g.beginPath(); ICON.eject(g, 223, 354); g.fill();
      /* the embossed logo */
      g.font = `italic 900 17px ${CM.FONT.sans}`; g.textAlign = 'right'; g.textBaseline = 'middle';
      g.fillStyle = 'rgba(255,255,255,.75)'; g.fillText('clawdamp', 361, 355); g.fillStyle = 'rgba(40,50,70,.55)'; g.fillText('clawdamp', 360, 354);
    }) };
  },
  draw(g, env, rig, S) {
    const p = rig.pose, t = env.t, M = CM.build(p, { cx: 200, cy: 132, s: 7.6 });
    env.stamp(g, S.bg);
    /* the visualiser: drifting plasma behind Clawd, a scope trace, scanlines and a glass glare over */
    g.save(); rr(g, ...SCR, 8); g.clip();
    g.globalCompositeOperation = 'lighter';
    for (const [c, k] of [['60,90,255', 0], ['200,40,255', 2.1], ['0,220,255', 4.2]]) {
      const x = 200 + cos(t * .7 + k) * 120, y = 140 + sin(t * .9 + k * 1.3) * 50, G = g.createRadialGradient(x, y, 0, x, y, 110);
      G.addColorStop(0, `rgba(${c},.5)`); G.addColorStop(1, `rgba(${c},0)`); g.fillStyle = G; g.fillRect(SCR[0], SCR[1], 320, 148);
    }
    g.globalCompositeOperation = 'source-over';
    g.strokeStyle = 'rgba(120,255,200,.55)'; g.lineWidth = 1.4; g.beginPath();
    for (let x = SCR[0]; x <= SCR[2]; x += 3) g.lineTo(x, 196 + sin(x * .09 + t * 6) * 5 * sin(x * .013 + t));
    g.stroke();
    CM.drawShadow(g, M, 'rgba(0,0,0,.45)');
    CM.drawStars(g, M, false, { fill: '#ffe27a', ink: '#1d2840' });
    contour(g, M, '#1a0a02', 1.3);
    /* glossy orange plastic: a hot band near the top of every face */
    paintParts(M, f => {
      const c = tone(f, P), bb = CM.bbox(f.pts), G = g.createLinearGradient(bb[0], bb[1], bb[2], bb[3]), k = .75 + .3 * f.light;
      G.addColorStop(0, CM.shade(c, k * 1.05)); G.addColorStop(.2, CM.shade(c, 1.45)); G.addColorStop(.3, CM.shade(c, k * 1.05)); G.addColorStop(1, CM.shade(c, k * .8));
      CM.fillPoly(g, f.pts, G);
    }, pt => strokeEdges(g, pt, 'rgba(60,20,0,.55)', .8));
    CM.drawEyes(g, M, { color: '#140804', glint: '#ffffff' });
    CM.drawStars(g, M, true, { fill: '#ffe27a', ink: '#1d2840' });
    CM.drawZzz(g, M, { color: '#bff7ff', font: MONO });
    g.fillStyle = 'rgba(0,0,0,.22)'; for (let y = SCR[1]; y < SCR[3]; y += 3) g.fillRect(SCR[0], y, 320, 1);
    g.font = `700 8px ${MONO}`; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillStyle = 'rgba(140,255,200,.75)'; g.fillText('CLAWDSCOPE', SCR[0] + 8, SCR[1] + 7);
    g.textAlign = 'right'; g.fillText('PRESET 07', SCR[2] - 8, SCR[1] + 7);
    const G = g.createLinearGradient(SCR[0], SCR[1], SCR[0] + 160, SCR[1] + 120); G.addColorStop(0, 'rgba(255,255,255,.16)'); G.addColorStop(.5, 'rgba(255,255,255,.04)'); G.addColorStop(.51, 'rgba(255,255,255,0)');
    g.fillStyle = G; g.fillRect(SCR[0], SCR[1], 320, 148);
    g.restore();
    /* track marquee */
    g.save(); rr(g, INFO[0] + 4, INFO[1], INFO[2] - 4, INFO[1] + 26, 4); g.clip();
    g.font = `700 12px ${MONO}`; g.textBaseline = 'middle'; g.textAlign = 'left';
    const msg = '1. Clawd - Theme from the Terminal (3:07)  ***  ', w = g.measureText(msg).width, x0 = INFO[0] + 8 - (t * 30) % w;
    g.fillStyle = GREEN; g.fillText(msg + msg, x0, INFO[1] + 14);
    g.restore();
    /* clock: a blinking play mark and seven-segment digits */
    const secs = 46 + floor(t), digits = String(floor(secs / 60) % 100).padStart(2, '0') + String(secs % 60).padStart(2, '0');
    g.fillStyle = GREEN; g.beginPath(); tri(g, 279, 246, 5, 1); g.fill();
    [0, 1, 2, 3].forEach(i => seg7(g, digits[i], 292 + i * 16 + (i > 1 ? 6 : 0), 235, 9, 22));
    g.fillStyle = (t % 1) < .5 ? GREEN : GHOST; g.fillRect(325, 240, 2.5, 2.5); g.fillRect(324, 250, 2.5, 2.5);
    /* spectrum analyser: it jumps when Clawd dances or hops */
    const e = CM.clamp(.62 + p.hop * .2 + p.stride * .8 + p.happy * .25, 0, 1), N = 12;
    for (let i = 0; i < BARS; i++) {
      const v = CM.clamp((.5 + .5 * CM.noise1(t * 4 + i * 1.7, 50)) * e * (1 - i / BARS * .35), .05, 1), n = round(v * N), x = SPEC[0] + 3 + i * 6.3;
      S.peaks[i] = max(S.peaks[i] - env.dt * .6, v);
      for (let k = 0; k < N; k++) { g.fillStyle = k >= n ? 'rgba(92,255,140,.06)' : k > 9 ? '#ff3b3b' : k > 6 ? '#ffd23b' : '#3bff6e'; g.fillRect(x, SPEC[3] - 4 - k * 2.8, 4.8, 1.9); }
      g.fillStyle = '#e8f0ff'; g.fillRect(x, SPEC[3] - 4 - min(N - 1, round(S.peaks[i] * N)) * 2.8, 4.8, 1.2);
    }
    /* the seek bar and its thumb; the play button glows */
    const u = (secs / 187) % 1; g.fillStyle = GREEN; rr(g, 41, 327, 41 + 318 * u, 331, 2); g.fill();
    plate(g, 34 + 318 * u, 323, 14, 12, 3);
    g.fillStyle = `rgba(92,255,140,${(.75 + .25 * sin(t * 4)).toFixed(3)})`; g.beginPath(); ICON.play(g, 88, 354); g.fill();
  },
});
}

/* ═════════ 51 · Holo Sticker (foil sticker, 2000) ═════════ */
{
function heart(g, x, y, s) { g.moveTo(x, y + s * .9); g.bezierCurveTo(x - s * 1.3, y + s * .1, x - s * .9, y - s * .9, x, y - s * .35); g.bezierCurveTo(x + s * .9, y - s * .9, x + s * 1.3, y + s * .1, x, y + s * .9); g.closePath(); }
function star5(g, x, y, r) { for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, q = i & 1 ? r * .48 : r; g.lineTo(x + cos(a) * q, y + sin(a) * q); } g.closePath(); }
function face(g, x, y, s, ink) { g.fillStyle = ink; g.beginPath(); g.arc(x - s * .3, y - s * .15, s * .1, 0, TAU); g.arc(x + s * .3, y - s * .15, s * .1, 0, TAU); g.fill(); g.strokeStyle = ink; g.lineWidth = s * .08; g.lineCap = 'round'; g.beginPath(); g.arc(x, y + s * .02, s * .32, .35, PI - .35); g.stroke(); }
function word(g, s, x, y, size, fill, ink) { g.font = `italic 900 ${size}px ${CM.FONT.sans}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; if (ink) { g.strokeStyle = ink; g.lineWidth = size * .2; g.strokeText(s, x, y); } g.fillStyle = fill; g.fillText(s, x, y); }
/* the stickers, each centred on its origin: shape(g) traces the outline the white die-cut border follows, art(g) paints it */
const ST = {
  star: { shape: g => star5(g, 0, 0, 22), art(g) { g.fillStyle = '#ffe14d'; g.beginPath(); star5(g, 0, 0, 22); g.fill(); face(g, 0, 2, 16, '#3a1a00'); } },
  bluestar: { shape: g => star5(g, 0, 0, 18), art(g) { g.fillStyle = '#5fd8ff'; g.beginPath(); star5(g, 0, 0, 18); g.fill(); g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); star5(g, -3, -3, 7); g.fill(); } },
  bff: { shape: g => heart(g, 0, 0, 24), art(g) { g.fillStyle = '#b06cff'; g.beginPath(); heart(g, 0, 0, 24); g.fill(); word(g, 'BFF', 0, 1, 13, '#ffffff'); } },
  heart: { shape: g => heart(g, 0, 0, 14), art(g) { g.fillStyle = '#ff2d55'; g.beginPath(); heart(g, 0, 0, 14); g.fill(); g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.ellipse(-6, -4, 3, 2, -.6, 0, TAU); g.fill(); } },
  butterfly: { shape: g => g.ellipse(0, 4, 30, 28, 0, 0, TAU), art(g) {
    for (const s of [-1, 1]) { g.fillStyle = '#5fd8ff'; g.beginPath(); g.ellipse(s * 13, -4, 13, 18, s * .5, 0, TAU); g.fill(); g.fillStyle = '#ff9be0'; g.beginPath(); g.ellipse(s * 10, 16, 9, 11, -s * .5, 0, TAU); g.fill(); }
    g.fillStyle = '#4a2060'; g.beginPath(); g.ellipse(0, 6, 3, 16, 0, 0, TAU); g.fill();
  } },
  daisy: { shape: g => g.arc(0, 0, 18, 0, TAU), art(g) {
    g.strokeStyle = '#ff8fd0'; g.lineWidth = 1.2; g.fillStyle = '#ffffff';
    for (let k = 0; k < 5; k++) { const a = k * TAU / 5; g.beginPath(); g.arc(cos(a) * 9, sin(a) * 9, 7, 0, TAU); g.fill(); g.stroke(); }
    g.fillStyle = '#ffd400'; g.beginPath(); g.arc(0, 0, 6, 0, TAU); g.fill();
  } },
  smiley: { shape: g => g.arc(0, 0, 18, 0, TAU), art(g) { g.fillStyle = '#ffd400'; g.beginPath(); g.arc(0, 0, 18, 0, TAU); g.fill(); face(g, 0, 0, 22, '#1a1200'); } },
  xoxo: { shape: g => g.roundRect(-30, -11, 60, 22, 11), art(g) { g.fillStyle = '#b8ff5c'; g.beginPath(); g.roundRect(-30, -11, 60, 22, 11); g.fill(); word(g, 'XOXO', 0, 1, 14, '#ff3d9e'); } },
  y2k: { shape: g => g.roundRect(-34, -15, 68, 30, 15), art(g) {
    const G = g.createLinearGradient(0, -15, 0, 15); G.addColorStop(0, '#ffffff'); G.addColorStop(.45, '#9fb4cf'); G.addColorStop(.55, '#5a6c88'); G.addColorStop(1, '#e8eef6');
    g.fillStyle = G; g.beginPath(); g.roundRect(-34, -15, 68, 30, 15); g.fill(); word(g, 'Y2K', 0, 1, 19, '#ffffff', '#2a1a5e');
  } },
  omg: { shape: g => { g.ellipse(0, 0, 28, 18, 0, 0, TAU); g.moveTo(-6, 14); g.lineTo(-16, 28); g.lineTo(6, 16); }, art(g) {
    g.fillStyle = '#ffffff'; g.strokeStyle = '#ff3d9e'; g.lineWidth = 2; g.beginPath(); g.ellipse(0, 0, 25, 15, 0, 0, TAU); g.fill(); g.stroke(); word(g, 'OMG!', 0, 1, 14, '#ff3d9e');
  } },
  cherries: { shape: g => g.arc(0, 2, 22, 0, TAU), art(g) {
    g.strokeStyle = '#2f9e44'; g.lineWidth = 2; g.beginPath(); g.moveTo(-8, 6); g.quadraticCurveTo(-4, -10, 4, -16); g.moveTo(9, 8); g.quadraticCurveTo(8, -6, 4, -16); g.stroke();
    g.fillStyle = '#43c463'; g.beginPath(); g.ellipse(9, -15, 7, 3.5, -.4, 0, TAU); g.fill();
    for (const [x, y] of [[-9, 10], [9, 12]]) { g.fillStyle = '#e8173a'; g.beginPath(); g.arc(x, y, 8, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.arc(x - 3, y - 3, 2, 0, TAU); g.fill(); }
  } },
  peace: { shape: g => g.arc(0, 0, 18, 0, TAU), art(g) {
    g.fillStyle = '#2ec4b6'; g.beginPath(); g.arc(0, 0, 18, 0, TAU); g.fill(); g.strokeStyle = '#ffffff'; g.lineWidth = 3; g.lineCap = 'round';
    g.beginPath(); g.arc(0, 0, 12, 0, TAU); g.moveTo(0, -12); g.lineTo(0, 12); g.moveTo(0, 0); g.lineTo(-8.5, 8.5); g.moveTo(0, 0); g.lineTo(8.5, 8.5); g.stroke();
  } },
  rainbow: { shape: g => { g.arc(0, 8, 28, PI, 0); g.closePath(); }, art(g) {
    ['#ff4d6d', '#ff9f1c', '#ffe14d', '#43c463', '#4dabf7', '#9b5de5'].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(0, 8, 28 - i * 3.4, PI, 0); g.closePath(); g.fill(); });
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(0, 8, 8, PI, 0); g.closePath(); g.fill();
  } },
  bolt: { shape: g => { g.moveTo(4, -22); g.lineTo(-12, 3); g.lineTo(-1, 3); g.lineTo(-6, 22); g.lineTo(12, -4); g.lineTo(1, -4); g.closePath(); }, art(g) {
    g.fillStyle = '#ffd400'; g.beginPath(); ST.bolt.shape(g); g.fill(); g.strokeStyle = '#ff8c00'; g.lineWidth = 1.5; g.lineJoin = 'round'; g.stroke();
  } },
  cd: { shape: g => g.arc(0, 0, 21, 0, TAU), art(g) {
    const G = g.createConicGradient ? g.createConicGradient(.6, 0, 0) : null;
    if (G) { ['#e9eef5', '#ffb3e6', '#b3f0ff', '#fff3b0', '#e9eef5', '#c8b3ff', '#b3ffd1', '#e9eef5'].forEach((c, i, a) => G.addColorStop(i / (a.length - 1), c)); g.fillStyle = G; } else g.fillStyle = '#dfe6ef';
    g.beginPath(); g.arc(0, 0, 21, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.arc(0, 0, 7, 0, TAU); g.fill();
    g.fillStyle = '#ff6fc1'; g.beginPath(); g.arc(0, 0, 3.5, 0, TAU); g.fill();
  } },
};
/* where they landed: slapped on by hand, overlapping, every one at its own angle */
const LAYOUT = [
  ['rainbow', 96, 128, -.35, .85], ['star', 58, 66, -.3, 1.05], ['y2k', 178, 36, .14, 1], ['heart', 252, 20, -.5, .8], ['bff', 322, 64, .32, 1.05],
  ['omg', 258, 108, .22, .8], ['cd', 372, 166, .4, 1], ['smiley', 32, 178, .45, .95], ['bolt', 30, 262, .5, .95], ['xoxo', 336, 254, -.55, 1],
  ['daisy', 64, 330, -.2, 1.1], ['peace', 128, 380, -.25, .9], ['cherries', 236, 384, .3, .9], ['butterfly', 330, 342, .22, 1], ['bluestar', 382, 398, .7, .9],
  ['heart', 18, 380, .35, .9], ['bluestar', 18, 110, -.15, .7], ['smiley', 386, 26, -.3, .75],
  ['daisy', 92, 90, .5, .7], ['heart', 298, 96, .9, .75], ['xoxo', 128, 262, 1.15, .9], ['bolt', 288, 306, -.35, .8], ['bluestar', 214, 70, .25, .65],
  ['smiley', 44, 226, -.6, .7], ['cd', 168, 396, -.3, .85], ['heart', 360, 300, -.8, .65],
];
function slap(g, k, x, y, a, s) {
  const S = ST[k];
  g.save(); g.translate(x, y); g.rotate(a); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round';
  g.save(); g.translate(1.5, 3); g.fillStyle = g.strokeStyle = 'rgba(110,0,60,.3)'; g.lineWidth = 10; g.beginPath(); S.shape(g); g.fill(); g.stroke(); g.restore();
  g.fillStyle = g.strokeStyle = '#ffffff'; g.lineWidth = 9; g.beginPath(); S.shape(g); g.fill(); g.stroke();
  S.art(g);
  /* a little light catches the top of the vinyl */
  g.beginPath(); S.shape(g); g.clip(); const G = g.createLinearGradient(0, -30, 0, 10); G.addColorStop(0, 'rgba(255,255,255,.3)'); G.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = G; g.fillRect(-40, -40, 80, 50);
  g.restore();
}
/* the holographic rainbow: hue bands whose angle and phase follow the turn */
function foil(g, x0, y0, x1, y1, ph, ang) {
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = hypot(x1 - x0, y1 - y0) / 2, dx = cos(ang) * R, dy = sin(ang) * R, G = g.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
  for (let k = 0; k <= 8; k++) G.addColorStop(k / 8, hsl(((ph * 360 + k * 70) % 360 + 360) % 360, 95, 74));
  return G;
}
CM.style({
  id: 'sholo', n: 51, title: 'Holo Sticker', caption: 'Foil sticker, 2000',
  init(env) {
    const r = CM.RNG(51);
    return {
      glit: Array.from({ length: 22 }, () => ({ u: r(), v: r(), ph: r() * TAU, s: r.range(2.5, 5) })),
      tw: Array.from({ length: 10 }, () => ({ x: r.range(20, 380), y: r.range(20, 380), ph: r() * TAU })),
      bg: env.layer(g => {
        /* candy-pink glitter plastic, edge to edge */
        let G = g.createLinearGradient(0, 0, 400, 400); G.addColorStop(0, '#ff9ad6'); G.addColorStop(.5, '#ff6fc1'); G.addColorStop(1, '#e8449f');
        g.fillStyle = G; g.fillRect(0, 0, 400, 400);
        const q = CM.RNG(510);
        for (let i = 0; i < 4200; i++) { g.fillStyle = q() < .55 ? `rgba(255,255,255,${q.range(.2, .7).toFixed(3)})` : `rgba(255,${floor(q.range(150, 230))},${floor(q.range(200, 255))},.6)`; g.fillRect(q() * 400, q() * 400, q.range(.6, 1.6), q.range(.6, 1.6)); }
        G = g.createLinearGradient(0, 0, 400, 400); G.addColorStop(.18, 'rgba(255,255,255,0)'); G.addColorStop(.26, 'rgba(255,255,255,.28)'); G.addColorStop(.34, 'rgba(255,255,255,0)'); g.fillStyle = G; g.fillRect(0, 0, 400, 400);
        for (const L of LAYOUT) slap(g, ...L);
      }),
    };
  },
  draw(g, env, rig, S) {
    const p = rig.pose, t = env.t, M = CM.build(p, { cx: 200, cy: 210, s: 12.5 }), O = CM.outline(M, { res: 64 }), grown = O.map(o => CM.offsetPoly(o, -8));
    env.stamp(g, S.bg);
    for (const s of S.tw) { const k = max(0, sin(t * 2 + s.ph)); sparkle(g, s.x, s.y, 7 * k * k * k); }
    /* the die-cut border, lifted off the shell */
    g.fillStyle = 'rgba(110,0,60,.35)'; g.beginPath(); for (const o of grown) CM.path(g, o.map(q => [q[0] + 3, q[1] + 5])); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); for (const o of grown) CM.path(g, o); g.fill();
    CM.drawStars(g, M, false, { fill: '#fff59a', ink: '#c2368a' });
    /* the foil: one rainbow across the whole figure, its bands tilting and sliding as Clawd turns; each face tinted by its light */
    const bb = M.bbox, ph = p.yaw * .35 + t * .05, ang = .6 + p.yaw * .8;
    g.save(); g.beginPath(); for (const h of M.hulls) CM.path(g, h, true); g.clip();
    paintParts(M, f => {
      CM.fillPoly(g, f.pts, foil(g, bb[0], bb[1], bb[2], bb[3], ph + f.n[0] * .25 + (f.name === 'top' ? .3 : 0), ang + f.n[1]));
      const k = (1 - f.light) * .32; if (k > .01) CM.fillPoly(g, f.pts, `rgba(80,20,120,${k.toFixed(3)})`);
    }, pt => strokeEdges(g, pt, 'rgba(255,255,255,.8)', 1.1));
    /* sheen bands sweep across with the turn */
    g.globalCompositeOperation = 'overlay';
    const off = ((p.yaw * 90 + t * 20) % 120 + 120) % 120;
    for (let x = bb[0] - 160 + off; x < bb[2] + 40; x += 120) { const G = g.createLinearGradient(x, 0, x + 60, 0); G.addColorStop(0, 'rgba(255,255,255,0)'); G.addColorStop(.5, 'rgba(255,255,255,.75)'); G.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = G; g.beginPath(); g.moveTo(x, bb[3] + 10); g.lineTo(x + 60, bb[3] + 10); g.lineTo(x + 120, bb[1] - 10); g.lineTo(x + 60, bb[1] - 10); g.closePath(); g.fill(); }
    g.globalCompositeOperation = 'source-over';
    for (const s of S.glit) { const k = max(0, sin(t * 3 + s.ph)) ** 4; sparkle(g, bb[0] + s.u * (bb[2] - bb[0]), bb[1] + s.v * (bb[3] - bb[1]), s.s * k); }
    g.restore();
    CM.drawEyes(g, M, { color: '#2a1240', glint: '#ffffff' });
    CM.drawStars(g, M, true, { fill: '#fff59a', ink: '#c2368a' });
    CM.drawZzz(g, M, { color: '#ffffff', font: CM.FONT.sans });
  },
});
}

/* ═════════ 52 · Vista (Aero glass, 2007) ═════════ */
{
const UI = '"Segoe UI","Tahoma",' + CM.FONT.grotesk;
const P = { top: '#ffb98f', front: '#f27a45', side: '#c4532a', leg: '#e2683a', legDark: '#a8461f' };
const WIN = [12, 20, 318, 358], CONT = [20, 68, 310, 350], TASK = 372;
const rr = (g, x0, y0, x1, y1, r) => { g.beginPath(); g.roundRect(x0, y0, x1 - x0, y1 - y0, r); };
/* the Aurora wallpaper: deep teal with swooshes of green and white light */
function aurora(g) {
  let G = g.createLinearGradient(0, 0, 400, 400); G.addColorStop(0, '#0d5560'); G.addColorStop(.5, '#0f6f66'); G.addColorStop(1, '#05252f'); g.fillStyle = G; g.fillRect(0, 0, 400, 400);
  G = g.createRadialGradient(60, 330, 0, 60, 330, 260); G.addColorStop(0, 'rgba(150,230,60,.55)'); G.addColorStop(1, 'rgba(150,230,60,0)'); g.fillStyle = G; g.fillRect(0, 0, 400, 400);
  G = g.createRadialGradient(330, 60, 0, 330, 60, 220); G.addColorStop(0, 'rgba(60,200,220,.45)'); G.addColorStop(1, 'rgba(60,200,220,0)'); g.fillStyle = G; g.fillRect(0, 0, 400, 400);
  g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  for (const [x0, y0, cx, cy, x1, y1, w, c, b] of [
    [-40, 140, 120, 260, 420, 300, 40, 'rgba(110,220,80,.35)', 14], [-40, 200, 160, 300, 430, 260, 16, 'rgba(200,255,150,.5)', 6],
    [-20, 330, 200, 250, 420, 380, 30, 'rgba(90,210,170,.3)', 12], [40, -20, 120, 160, 430, 230, 10, 'rgba(255,255,255,.45)', 4],
    [-30, 260, 180, 330, 430, 330, 5, 'rgba(255,255,230,.7)', 2], [150, -30, 260, 120, 430, 120, 22, 'rgba(80,190,230,.3)', 10]]) {
    g.filter = `blur(${b}px)`; g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(cx, cy, x1, y1); g.stroke();
  }
  g.restore(); g.filter = 'none';
}
/* Aero glass over whatever path is set as the clip: the wallpaper, blurred, tinted and glossed */
function glass(g, x0, y0, x1, y1, tint = 'rgba(170,215,235,.32)') {
  g.save(); g.filter = 'blur(7px)'; aurora(g); g.restore();
  g.fillStyle = tint; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  let G = g.createLinearGradient(0, y0, 0, y0 + 40); G.addColorStop(0, 'rgba(255,255,255,.45)'); G.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = G; g.fillRect(x0, y0, x1 - x0, 40);
  g.fillStyle = 'rgba(255,255,255,.07)'; for (let x = x0 - 200; x < x1; x += 46) { g.beginPath(); g.moveTo(x, y1); g.lineTo(x + 14, y1); g.lineTo(x + 214, y0); g.lineTo(x + 200, y0); g.closePath(); g.fill(); }
}
function capButton(g, x0, x1, y0, y1, red) {
  const G = g.createLinearGradient(0, y0, 0, y1);
  if (red) { G.addColorStop(0, '#f2a08c'); G.addColorStop(.48, '#d8573e'); G.addColorStop(.52, '#c0391f'); G.addColorStop(1, '#e8804f'); }
  else { G.addColorStop(0, 'rgba(255,255,255,.65)'); G.addColorStop(.48, 'rgba(210,235,245,.45)'); G.addColorStop(.52, 'rgba(150,190,210,.35)'); G.addColorStop(1, 'rgba(200,235,250,.5)'); }
  g.fillStyle = G; rr(g, x0, y0, x1, y1, 3); g.fill(); g.strokeStyle = 'rgba(0,20,40,.55)'; g.lineWidth = .8; g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.6)'; rr(g, x0 + 1, y0 + 1, x1 - 1, y1 - 1, 2); g.stroke();
}
function navOrb(g, x, y, r, on) {
  const G = g.createLinearGradient(0, y - r, 0, y + r); G.addColorStop(0, on ? '#9fd4ff' : '#dfe8ee'); G.addColorStop(.5, on ? '#2d7fd6' : '#a9b8c3'); G.addColorStop(1, on ? '#6ec0ff' : '#cdd8df');
  g.fillStyle = G; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.strokeStyle = 'rgba(0,30,60,.6)'; g.lineWidth = .8; g.stroke();
  g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(x - r * .45, y); g.lineTo(x + r * .1, y - r * .45); g.lineTo(x + r * .1, y + r * .45); g.closePath(); g.fill(); g.fillRect(x, y - r * .14, r * .45, r * .28);
}
/* a Vista folder: a pale teal back, the paper peeking out, a translucent front flap */
function folder(g, x, y, s, a) {
  g.save(); g.globalAlpha = a; g.translate(x, y); g.scale(s, s);
  let G = g.createLinearGradient(0, -20, 0, 20); G.addColorStop(0, '#bfe6e2'); G.addColorStop(1, '#5fa8a8'); g.fillStyle = G;
  g.beginPath(); g.moveTo(-20, 18); g.lineTo(-20, -18); g.lineTo(-8, -18); g.lineTo(-5, -14); g.lineTo(18, -14); g.lineTo(18, 18); g.closePath(); g.fill();
  g.fillStyle = '#ffffff'; g.fillRect(-14, -11, 26, 22); g.fillStyle = '#d8e4ec'; for (let k = 0; k < 4; k++) g.fillRect(-11, -7 + k * 4, 20, 1.4);
  G = g.createLinearGradient(0, -6, 0, 20); G.addColorStop(0, 'rgba(200,240,235,.85)'); G.addColorStop(1, 'rgba(90,170,165,.9)'); g.fillStyle = G;
  g.beginPath(); g.moveTo(-20, 20); g.lineTo(-16, -4); g.lineTo(22, -4); g.lineTo(18, 20); g.closePath(); g.fill(); g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = .8; g.stroke();
  g.restore();
}
function label(g, s, x, y, color = '#1e2a33', size = 9, weight = 400, align = 'center') { g.font = `${weight} ${size}px ${UI}`; g.fillStyle = color; g.textAlign = align; g.textBaseline = 'middle'; g.fillText(s, x, y); }
function plastic(g, M) {
  paintParts(M, f => {
    const c = tone(f, P), bb = CM.bbox(f.pts), G = g.createLinearGradient(bb[0], bb[1], bb[0], bb[3]), k = .82 + .25 * f.light;
    G.addColorStop(0, CM.shade(c, f.name === 'top' ? 1.3 : k * 1.18)); G.addColorStop(.5, CM.shade(c, k)); G.addColorStop(1, CM.shade(c, k * .78));
    CM.fillPoly(g, f.pts, G);
  }, pt => strokeEdges(g, pt, 'rgba(90,30,10,.45)', .8));
}
const NEWS = ['Clawd waves', 'Mascot hops', 'Crab spotted', 'Spin record!', 'Clawd naps', 'Clawd dances'];
CM.style({
  id: 'svista', n: 52, title: 'Vista', caption: 'Aero glass, 2007',
  init(env) {
    return { busy: 0, py: null, bg: env.layer(g => {
      aurora(g);
      /* the window: a soft shadow, the glass frame, the white Explorer pane */
      g.save(); g.filter = 'blur(8px)'; g.fillStyle = 'rgba(0,0,0,.5)'; rr(g, WIN[0] + 3, WIN[1] + 6, WIN[2] + 3, WIN[3] + 8, 8); g.fill(); g.restore();
      g.save(); rr(g, ...WIN, 7); g.clip(); glass(g, ...WIN); g.restore();
      g.strokeStyle = 'rgba(0,15,30,.7)'; g.lineWidth = 1; rr(g, WIN[0] + .5, WIN[1] + .5, WIN[2] - .5, WIN[3] - .5, 7); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,.55)'; rr(g, WIN[0] + 1.5, WIN[1] + 1.5, WIN[2] - 1.5, WIN[3] - 1.5, 6); g.stroke();
      capButton(g, 236, 258, WIN[1] + 1, WIN[1] + 16, false); capButton(g, 258, 280, WIN[1] + 1, WIN[1] + 16, false); capButton(g, 280, 311, WIN[1] + 1, WIN[1] + 16, true);
      g.strokeStyle = '#ffffff'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(242, 31); g.lineTo(252, 31); g.rect(264.5, 25, 9, 7); g.moveTo(291.5, 24.5); g.lineTo(299.5, 31.5); g.moveTo(299.5, 24.5); g.lineTo(291.5, 31.5); g.stroke();
      /* navigation: back and forward orbs, the breadcrumb bar, search */
      navOrb(g, 32, 52, 10, true); g.save(); g.translate(56, 52); g.scale(-1, 1); navOrb(g, 0, 0, 8, false); g.restore();
      g.fillStyle = 'rgba(255,255,255,.75)'; rr(g, 70, 43, 236, 61, 2); g.fill(); g.strokeStyle = 'rgba(0,30,50,.5)'; g.lineWidth = .8; g.stroke();
      folder(g, 79, 52, .26, 1); label(g, '▸  Clawd  ▸  Clawd Center  ▸', 88, 52.5, '#1e2a33', 9, 400, 'left');
      g.fillStyle = 'rgba(255,255,255,.75)'; rr(g, 242, 43, 310, 61, 2); g.fill(); g.stroke(); g.font = `italic 400 9px ${UI}`; g.fillStyle = '#7a8a96'; g.textAlign = 'left'; g.fillText('Search', 247, 52.5);
      g.strokeStyle = '#3a6a9a'; g.lineWidth = 1.3; g.beginPath(); g.arc(298, 50.5, 3.2, 0, TAU); g.moveTo(300.3, 52.8); g.lineTo(303.5, 56); g.stroke();
      /* the Explorer pane: command bar, white icon view, details pane */
      g.fillStyle = '#ffffff'; g.fillRect(CONT[0], CONT[1], CONT[2] - CONT[0], CONT[3] - CONT[1]);
      let G = g.createLinearGradient(0, CONT[1], 0, CONT[1] + 20); G.addColorStop(0, '#3c6f8e'); G.addColorStop(.5, '#1d4a66'); G.addColorStop(1, '#0f3550');
      g.fillStyle = G; g.fillRect(CONT[0], CONT[1], CONT[2] - CONT[0], 20); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(CONT[0], CONT[1], CONT[2] - CONT[0], 1);
      [['Organize ▾', 28], ['Views ▾', 86], ['Open', 134], ['Share ▾', 170]].forEach(([s, x]) => label(g, s, x, CONT[1] + 10.5, '#ffffff', 9, 400, 'left'));
      G = g.createLinearGradient(0, 316, 0, CONT[3]); G.addColorStop(0, '#f4f9fc'); G.addColorStop(1, '#cfe3ef'); g.fillStyle = G; g.fillRect(CONT[0], 316, CONT[2] - CONT[0], CONT[3] - 316);
      g.fillStyle = '#b9d2e2'; g.fillRect(CONT[0], 316, CONT[2] - CONT[0], 1);
      g.fillStyle = '#e07a52'; rr(g, 30, 322, 52, 344, 4); g.fill(); g.fillStyle = '#1f1412'; g.fillRect(36, 329, 2.5, 5); g.fillRect(44, 329, 2.5, 5);
      label(g, 'Clawd', 60, 327, '#1e2a33', 10, 700, 'left'); label(g, 'Mascot   Date modified: 1/30/2007 11:03 PM', 60, 340, '#4a5a66', 8, 400, 'left');
      /* the other icons, unselected */
      folder(g, 54, 140, 1, .85); label(g, 'Documents', 54, 172); folder(g, 54, 236, 1, .85); label(g, 'Pictures', 54, 268);
      folder(g, 276, 140, 1, .85); label(g, 'Music', 276, 172); folder(g, 276, 236, 1, .85); label(g, 'Saved Games', 276, 268);
      /* the sidebar: a clock, a feed and a CPU meter, each in its gadget frame */
      G = g.createLinearGradient(326, 0, 400, 0); G.addColorStop(0, 'rgba(0,0,0,0)'); G.addColorStop(1, 'rgba(0,0,0,.25)'); g.fillStyle = G; g.fillRect(322, 0, 78, TASK);
      g.save(); g.filter = 'blur(3px)'; g.fillStyle = 'rgba(0,0,0,.55)'; g.beginPath(); g.arc(362, 58, 31, 0, TAU); g.fill(); g.restore();
      G = g.createRadialGradient(356, 50, 2, 360, 56, 32); G.addColorStop(0, '#ffffff'); G.addColorStop(.8, '#e8ecef'); G.addColorStop(1, '#9aa3aa'); g.fillStyle = G; g.beginPath(); g.arc(360, 56, 30, 0, TAU); g.fill();
      g.lineWidth = 3; g.strokeStyle = '#2a2f33'; g.stroke(); g.lineWidth = 1; g.strokeStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.arc(360, 56, 27.5, 0, TAU); g.stroke();
      for (let k = 0; k < 12; k++) { const a = k * TAU / 12; g.strokeStyle = '#2a2f33'; g.lineWidth = k % 3 ? .8 : 1.8; g.beginPath(); g.moveTo(360 + cos(a) * 22, 56 + sin(a) * 22); g.lineTo(360 + cos(a) * 26, 56 + sin(a) * 26); g.stroke(); }
      for (const [x, y] of [[328, 100], [328, 226]]) { G = g.createLinearGradient(0, y, 0, y + (y === 100 ? 118 : 60)); G.addColorStop(0, 'rgba(40,48,58,.92)'); G.addColorStop(1, 'rgba(10,14,20,.92)'); g.fillStyle = G; rr(g, x, y, 394, y + (y === 100 ? 118 : 60), 5); g.fill(); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1; g.stroke(); }
      label(g, '◂   1–3   ▸', 361, 209, '#c8d2da', 8);
      /* CPU meter dials */
      for (const x of [347, 375]) { g.strokeStyle = '#59636d'; g.lineWidth = 4; g.beginPath(); g.arc(x, 258, 11, PI, TAU); g.stroke(); g.strokeStyle = '#e8473a'; g.beginPath(); g.arc(x, 258, 11, PI * 1.75, TAU); g.stroke(); }
      label(g, 'CPU', 347, 272, '#c8d2da', 7, 700); label(g, 'RAM', 375, 272, '#c8d2da', 7, 700);
      /* the taskbar: black glass, an orb with Clawd in it, the active window and the tray */
      G = g.createLinearGradient(0, TASK, 0, 400); G.addColorStop(0, 'rgba(70,80,90,.95)'); G.addColorStop(.45, 'rgba(20,24,28,.97)'); G.addColorStop(1, 'rgba(0,0,0,.98)');
      g.fillStyle = G; g.fillRect(0, TASK, 400, 28); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(0, TASK, 400, 1);
      G = g.createRadialGradient(22, 382, 2, 24, 386, 17); G.addColorStop(0, '#5ab0ff'); G.addColorStop(.6, '#0d3f7a'); G.addColorStop(1, '#061a33'); g.fillStyle = G; g.beginPath(); g.arc(24, 386, 15, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(160,210,255,.8)'; g.lineWidth = 1.2; g.stroke();
      g.fillStyle = '#e07a52'; g.fillRect(17, 381, 14, 9); g.fillRect(14, 384, 3, 3); g.fillRect(31, 384, 3, 3); for (const x of [18, 21, 26, 29]) g.fillRect(x, 390, 1.6, 3); g.fillStyle = '#1f1412'; g.fillRect(20, 383, 1.6, 3); g.fillRect(26.5, 383, 1.6, 3);
      G = g.createLinearGradient(0, 377, 0, 395); G.addColorStop(0, 'rgba(255,255,255,.35)'); G.addColorStop(.5, 'rgba(255,255,255,.12)'); G.addColorStop(1, 'rgba(255,255,255,.2)');
      g.fillStyle = G; rr(g, 48, 377, 162, 395, 3); g.fill(); g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = .8; g.stroke();
      folder(g, 58, 386, .3, 1); label(g, 'Clawd Center', 68, 386.5, '#ffffff', 9, 400, 'left');
      for (const [x, c] of [[312, '#7ad0ff'], [324, '#9be05a'], [336, '#ffffff']]) { g.fillStyle = c; rr(g, x, 382, x + 8, 390, 1.5); g.fill(); }
    }) };
  },
  draw(g, env, rig, S) {
    const p = rig.pose, t = env.t, dt = env.dt || 1 / 60;
    /* “Not Responding”: a fast spin, a dance or a dizzy spell freezes the window */
    const vy = S.py == null ? 0 : abs(p.yaw - S.py) / dt; S.py = p.yaw;
    const want = vy > 4 || p.stride > .3 || p.dizzy > .3 ? 1 : 0; S.busy += (want - S.busy) * min(1, dt * (want ? 6 : 1.5));
    const M = CM.build(p, { cx: 165, cy: 186, s: 8 }), floorY = max(...CM.build(Object.assign({}, p, { hop: 0 }), { cx: 165, cy: 186, s: 8 }).feet.map(q => q[1]));
    env.stamp(g, S.bg);
    /* the selected icon: a pale blue tile behind Clawd, his reflection on the white below */
    g.save(); g.beginPath(); g.rect(CONT[0], CONT[1] + 20, CONT[2] - CONT[0], 316 - CONT[1] - 20); g.clip();
    let G = g.createLinearGradient(0, 96, 0, 300); G.addColorStop(0, 'rgba(225,242,252,.9)'); G.addColorStop(1, 'rgba(196,226,246,.9)');
    g.fillStyle = G; rr(g, 98, 96, 232, 300, 5); g.fill(); g.strokeStyle = 'rgba(120,180,225,.9)'; g.lineWidth = 1; g.stroke();
    g.save(); rr(g, 99, floorY, 231, 299, 4); g.clip(); g.translate(0, 2 * floorY); g.scale(1, -1); g.globalAlpha = .3; plastic(g, M); g.restore();
    G = g.createLinearGradient(0, floorY, 0, floorY + 30); G.addColorStop(0, 'rgba(210,233,248,.15)'); G.addColorStop(1, 'rgba(204,229,247,1)'); g.fillStyle = G; g.fillRect(99, floorY, 132, 300 - floorY - 1);
    CM.drawStars(g, M, false, { fill: '#ffe27a', ink: '#5a3a10' });
    contour(g, M, 'rgba(90,30,10,.6)', 1);
    plastic(g, M);
    CM.drawEyes(g, M, { color: '#1f1412', glint: '#ffffff' });
    /* a glossy highlight on the body, like every 256px icon of the day */
    const bb = CM.bbox(M.parts.body.hull); G = g.createLinearGradient(0, bb[1], 0, bb[1] + (bb[3] - bb[1]) * .5); G.addColorStop(0, 'rgba(255,255,255,.4)'); G.addColorStop(1, 'rgba(255,255,255,0)');
    g.save(); g.beginPath(); CM.path(g, M.parts.body.hull, true); g.clip(); g.fillStyle = G; g.fillRect(bb[0], bb[1], bb[2] - bb[0], (bb[3] - bb[1]) * .5); g.restore();
    CM.drawStars(g, M, true, { fill: '#ffe27a', ink: '#5a3a10' });
    CM.drawZzz(g, M, { color: '#2d6fa8', font: UI });
    g.restore();
    label(g, 'Clawd', 165, 290, '#1e2a33', 9);
    /* frozen: the window frosts over, the title admits it, the busy ring spins */
    if (S.busy > .01) {
      g.fillStyle = `rgba(255,255,255,${(.5 * S.busy).toFixed(3)})`; rr(g, ...WIN, 7); g.fill();
      g.globalAlpha = S.busy; label(g, 'Clawd Center (Not Responding)', WIN[0] + 10, WIN[1] + 9, '#0d1a24', 9, 400, 'left');
      const cx = 250, cy = 120; g.lineWidth = 4; g.lineCap = 'round';
      for (let k = 0; k < 10; k++) { g.strokeStyle = `rgba(40,140,230,${(.1 + k * .09).toFixed(3)})`; const a = t * 7 + k * .32; g.beginPath(); g.arc(cx, cy, 9, a, a + .3); g.stroke(); }
      g.globalAlpha = 1;
    }
    /* clock gadget hands */
    const sec = (t * 1) % 60, mins = 3 + t / 60, hrs = 11 + mins / 60;
    for (const [a, len, w, c] of [[hrs / 12, 13, 2.6, '#1d2226'], [mins / 60, 20, 1.8, '#1d2226'], [sec / 60, 22, .9, '#c7261c']]) {
      const ang = a * TAU - PI / 2; g.strokeStyle = c; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(360 - cos(ang) * 4, 56 - sin(ang) * 4); g.lineTo(360 + cos(ang) * len, 56 + sin(ang) * len); g.stroke();
    }
    g.fillStyle = '#c7261c'; g.beginPath(); g.arc(360, 56, 2, 0, TAU); g.fill();
    /* feed gadget: three headlines, moving on every few seconds */
    const step = floor(t / 3);
    for (let k = 0; k < 3; k++) {
      const y = 106 + k * 32, s = NEWS[(step + k) % NEWS.length];
      g.fillStyle = 'rgba(255,255,255,.08)'; rr(g, 332, y, 390, y + 28, 3); g.fill();
      g.save(); g.beginPath(); g.rect(334, y, 54, 28); g.clip(); label(g, s, 335, y + 9, '#ffffff', 8, 700, 'left'); g.restore();
      label(g, 'CLAWD NEWS', 335, y + 20, '#8d9aa5', 6.5, 400, 'left');
    }
    /* CPU meter: the needle pins when the window hangs */
    const cpu = CM.clamp(.18 + .08 * CM.noise1(t * 2, 52) + .8 * S.busy, 0, 1), ram = .42 + .03 * sin(t);
    for (const [x, v] of [[347, cpu], [375, ram]]) { const a = PI + v * PI; g.strokeStyle = '#ffffff'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x, 258); g.lineTo(x + cos(a) * 10, 258 + sin(a) * 10); g.stroke(); }
    label(g, round(cpu * 100) + '%', 347, 238, '#ffffff', 7, 700); label(g, round(ram * 100) + '%', 375, 238, '#ffffff', 7, 700);
    /* tray clock */
    label(g, '11:0' + (3 + floor(t / 60)) % 10 + ' PM', 392, 386.5, '#ffffff', 8.5, 400, 'right');
  },
});
}
})();
