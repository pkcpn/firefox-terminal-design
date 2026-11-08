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

The `userContent.css` rules include a native static terminal background for
Firefox's built-in `about:newtab` and `about:home`. It persists across browser
restarts and keeps Firefox's own search field, shortcut icons, context menus,
and customization controls. It does not need the optional extension below.

## Interactive Terminal New Tab

`newtab/` is an optional, self-contained Firefox desktop extension. It replaces
the new tab with a quiet green grid, gently pulsing cells, a mouse-following
highlight with a fading trail, search, and up to eight frequent destinations.
The bottom SSH prompt is decorative. It does not connect to a server or run commands.
The bookmarks toolbar remains available; this page does not reproduce Firefox's
native widgets or shortcut editing controls. Destinations come from Firefox's
new-tab list, including pinned sites when provided by Firefox. The homepage is unchanged.

The extension uses `topSites` to show local frequent destinations with their
Firefox-provided icons and `search`
to submit a query to your default Firefox search engine in the current tab.
It has no remote scripts, fonts, favicon requests, telemetry, or backend.
Only following a destination or submitting a search navigates outside the page.
The `Pause motion` button stops the ambient pulses, trails, and blinking cursor;
the cell under the mouse still highlights immediately. The page starts paused
when the system requests reduced motion, and pauses rendering in hidden tabs.

### Try it locally

1. Open `about:debugging#/runtime/this-firefox`.
2. Select **Load Temporary Add-on...** and choose `newtab/manifest.json`.
3. Open a new tab and accept Firefox's new-tab confirmation if shown.
4. Move across empty grid cells, try search and destinations, and check **Pause motion**.

Temporary add-ons are removed when Firefox restarts. For permanent installation
in Firefox Release, submit the extension to Mozilla for **unlisted signing**,
then install the returned signed `.xpi` from **Add-ons and themes > Install Add-on From File...**.
The repository does not include a signed package. Do not disable signature checks.
See Mozilla's [temporary installation guide](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/)
and [signing overview](https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/).

For a visual preview without installing, open `newtab/index.html` directly.
Search and frequent destinations require the extension environment.

### Validate and package

From the repository root in PowerShell:

```powershell
npx web-ext lint --source-dir newtab --warnings-as-errors
npx web-ext build --source-dir newtab --artifacts-dir web-ext-artifacts --overwrite-dest
```

The generated ZIP is an unsigned submission package, not an installable signed add-on.
After updating files, use **Reload** on the temporary extension in `about:debugging`
and open a fresh tab. To restore Firefox's native new tab, remove the extension.

### Mozilla signing process

For Firefox Release, unsigned extensions cannot be installed permanently. The
usual route is an **unlisted** submission on [addons.mozilla.org](https://addons.mozilla.org/):

1. Create or sign in to a Mozilla Add-ons developer account.
2. Choose **Submit a New Add-on** and select **On your own**.
3. Upload the ZIP produced by `web-ext build`.
4. Select **Unlisted** and complete the required privacy and technical metadata.
5. Mozilla runs automated validation and may request a manual review.
6. Download the signed `.xpi` and install it once via **Add-ons and themes > Install Add-on From File...**.

The submission does not require AI-written text. A short factual description,
the permissions (`topSites`, `search`), and the statement that the SSH prompt is
decorative are sufficient. The signed add-on then survives normal Firefox
restarts. The native CSS background remains usable without submitting or
installing an extension.

