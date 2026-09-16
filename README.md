# Firefox Terminal Design

A custom Firefox theme setup using `userChrome.css` and `userContent.css` with a dark terminal-inspired style.

## Files

- `userChrome.css` – styles Firefox browser UI (tabs, toolbar, sidebar, menus)
- `userContent.css` – styles built-in pages like `about:newtab`, `about:home`, and `about:*`

## Setup

1. Enable `toolkit.legacyUserProfileCustomizations.stylesheets` in `about:config`.
2. Place `userChrome.css` and `userContent.css` into your Firefox profile `chrome` folder.
3. Restart Firefox.

## New tab background

The new tab canvas is built from six stacked layers on `<html>`: CRT scanlines, a
combined vignette / ambient phosphor bloom, a fine mesh and a coarse mesh. A 60s
linear drift keeps it from reading as a frozen texture. `<body>` is deliberately
transparent — an opaque body background would cover the reactive layers.

### Cursor reaction

Pure CSS has no access to cursor coordinates, so the viewport is tiled into
**eight invisible hover zones** (4 columns × 2 rows) built from the
`::before` / `::after` pseudo-elements of `html`, `body`, `#root` and `main` —
four elements `about:newtab` always provides. Each zone paints a radial bloom
that is blurred far past its own box, so neighbouring zones overlap heavily and
the light appears to travel with the pointer rather than snapping cell by cell.
The slow `--nt-react-ms` fade does the rest.

All zones sit at `z-index: -1`: above the page canvas, below every piece of
content. For them to receive hover at all, the full-width layout containers
(`.outer-wrapper`, `main`, `.sections-list`, `.top-sites-list`, …) get
`pointer-events: none`, and every actual control gets it back immediately
afterwards via the `#root a, #root button, …` block. If a future Firefox version
introduces a new interactive element on the new tab page that is not covered by
that list, add its selector there — otherwise it will not be clickable.

On top of the zones, `html:has(…)` reacts to hovering or focusing the search bar
and the top site tiles by lifting the mesh brightness a notch, so the background
also answers pointer movement over content.

### Tuning

All knobs live in the `:root` block of the `about:newtab` section:

| Variable | Effect |
| --- | --- |
| `--nt-grid` | phosphor color of the mesh |
| `--nt-grid-fine` / `--nt-grid-coarse` | cell sizes of the two meshes |
| `--nt-grid-a-fine` / `--nt-grid-a-coarse` | mesh brightness |
| `--nt-ambient` | static glow behind the search bar |
| `--nt-scanline` | CRT scanline strength, `0` disables them |
| `--nt-drift-ms` | drift speed of the mesh |
| `--nt-bloom` | strength of the glow under the cursor |
| `--nt-bloom-blur` | softness of that glow |
| `--nt-react-ms` | fade duration — keep it slow, it is what makes the glow feel like it follows |
| `--nt-zone-w` / `--nt-zone-h` | hover grid resolution (must stay consistent with the eight zone offsets) |

`prefers-reduced-motion: reduce` disables the drift animation and the bloom
transitions.

### Limitation

Eight zones is the resolution ceiling of the CSS-only approach — there are only
so many pseudo-elements on the page to tile with. A glow that follows the actual
cursor pixel requires JavaScript on the page, which in Firefox means either an
`autoconfig` / `userChrome.js` loader or an extension; neither is part of this
`userChrome.css` + `userContent.css` setup.
