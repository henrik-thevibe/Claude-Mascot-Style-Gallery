// Records one looping GIF per style into media/ for the README.
// Usage: python -m http.server 8790 & node tools/record-gifs.mjs   (needs playwright + ffmpeg)
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:8790/', SIZE = 200, FPS = 15, OUT = 'media';
const browser = await chromium.launch(), page = await browser.newPage();
await page.goto(BASE + '?solo=cave&size=' + SIZE); await page.waitForFunction(() => window.__READY);
const ids = await page.evaluate(() => window.CM.styles.slice().sort((a, b) => a.n - b.n).map(s => s.id));
mkdirSync(OUT, { recursive: true });

for (const id of ids) {
  await page.goto(`${BASE}?solo=${id}&pose=idle&size=${SIZE}`); await page.waitForFunction(() => window.__READY);
  // a short script: look left, look right, spin, wave; 60 fps rig, every fourth frame kept
  const frames = await page.evaluate(({ FPS }) => {
    const t = window.__TILES[0], ctx = t.ctx, out = [], step = 60 / FPS;
    const beats = [[0, () => { ctx.px = -640; ctx.py = -120; }], [0.9, () => { ctx.px = 640; ctx.py = 160; }],
      [1.8, () => { ctx.px = 0; ctx.py = -30; t.rig.setAct('spin', { dir: 1 }); }], [3.6, () => t.rig.setAct('wave2')], [5.6, null]];
    let b = 0;
    for (let f = 0; ; f++) {
      const s = f / 60;
      while (b < beats.length && s >= beats[b][0]) { if (!beats[b][1]) return out; beats[b][1](); b++; }
      ctx.pAge = 0; t.rig.update(1 / 60, ctx); t.env.t += 1 / 60; t.env.frame++;
      if (f % step === 0) { t.draw(); out.push(t.c.toDataURL('image/png')); }
    }
  }, { FPS });
  const dir = `${OUT}/.frames-${id}`; rmSync(dir, { recursive: true, force: true }); mkdirSync(dir);
  frames.forEach((d, i) => writeFileSync(`${dir}/${String(i).padStart(4, '0')}.png`, Buffer.from(d.split(',')[1], 'base64')));
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', `${dir}/%04d.png`, '-vf',
    `scale=${SIZE}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`,
    '-loop', '0', `${OUT}/${id}.gif`]);
  rmSync(dir, { recursive: true });
  const errs = await page.evaluate(() => window.__ERRORS);
  console.log(id, frames.length, 'frames', errs.length ? errs : '');
}
await browser.close();
