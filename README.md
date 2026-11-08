# Firefox Terminal Design

A custom Firefox theme setup using `userChrome.css` and `userContent.css` with a dark terminal-inspired style.

## Files

- `userChrome.css` – styles Firefox browser UI (tabs, toolbar, sidebar, menus)
- `userContent.css` – styles built-in pages like `about:newtab`, `about:home`, and `about:*`

## Active tab highlighting

The active tab uses a dark green fill, a neon green border and bottom accent,
and a bold, high-contrast title. Hovering over inactive tabs uses a softer fill
so the active tab stays distinct, including when hovered or pinned. The theme
supports both Firefox's `selected` and `visuallyselected` tab states.

## Setup

1. Enable `toolkit.legacyUserProfileCustomizations.stylesheets` in `about:config`.
2. Place `userChrome.css` and `userContent.css` into your Firefox profile `chrome` folder.
3. Restart Firefox.

