# Clawd in Twenty-Eight Styles

Clawd, the Claude Code mascot, drawn live in twenty-eight styles: from the cave wall to the lapel pin, and a few experiments beyond. Every line is drawn by code in your browser, with no images and no dependencies.

Unofficial fan art.

## Credits

- **Styles 1–20 and the whole engine** (the 3D mascot model, the rig that watches your cursor, the gallery): [ChetasLua](https://github.com/ChetasLua), from the original *Clawd in Twenty Styles*.
- **Styles 21–28** (`henrik-styles.js`): Henrik's experiments, eight looks from an upcoming project, re-drawn around Clawd. Only the look carries over.

| # | Style | After |
|---|---|---|
| 21 | Atlas Glyph Tiles | the FT "Atlas" glyph tiles, recoloured orange on azure |
| 22 | Blob Mosaic | tile-mosaic blobs with glyph eyes on one chapter ground |
| 23 | Phosphor Streams | phosphor glyph streams that stop at once |
| 24 | Density Portrait | an ASCII density portrait made of synthetic handles |
| 25 | Density Field | ertdfgcvb (Andreas Gysin), play.core |
| 26 | Teletext Page | Goto80's *Datagården* |
| 27 | Maze War | Maze War on the Xerox Alto |
| 28 | Code Poem | Kerr & Holden's *cold_cloud.cc*: the picture is made of letters taken from its own source code |

## Running it

Open `index.html` through any static server. A server is needed because the page loads `henrik-styles.js` as a separate file:

```bash
python -m http.server 8790
```

Then go to http://localhost:8790.

Controls: move the pointer and they watch you · click a tile to spin it · drag to turn it · **W** wave · **D** dance · **H** hop · **Space** say cheese.

Test views: `?grid=idle&cell=200` (every style in one pose), `?sheet=21,22&poses=idle,left,spin` (a pose sheet), `?solo=epoem&pose=idle&size=800` (one big tile).

## Adding a style

Each style is one call:

```js
CM.style({ id, n, title, caption, init(env) { return state; }, draw(g, env, rig, state) { /* 400×400 tile */ } });
```

`CM.build(rig.pose, view)` returns the projected mascot (faces, eyes, hulls), and `CM.raster(M, cols, rows)` turns it into a grid of cells. The gallery shows every registered style in order of `n`.
