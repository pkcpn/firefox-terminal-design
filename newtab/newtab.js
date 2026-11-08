/* Local-only new tab. The SSH prompt is decorative, never a connection. */
(() => {
  "use strict";
  const canvas = document.querySelector("#grid");
  const ctx = canvas.getContext("2d");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const motionButton = document.querySelector("#motion");
  const coordinates = document.querySelector("#coordinates");
  const size = 56;
  const cells = new Map();
  let width = 0, height = 0, frame = 0, lastFrame = 0;
  let paused = reducedMotion.matches;
  let pointer = null;

  function draw(now) {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(104, 181, 128, 0.10)";
    ctx.beginPath();
    for (let x = 0; x < width; x += size) { ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, height); }
    for (let y = 0; y < height; y += size) { ctx.moveTo(0, y + .5); ctx.lineTo(width, y + .5); }
    ctx.stroke();

    // Soft, sparse pulses instead of a moving wallpaper or scanline overlay.
    if (!paused) {
      const cols = Math.ceil(width / size);
      const rows = Math.ceil(height / size);
      for (let i = 0; i < 12; i++) {
        const x = ((i * 7 + 3) % cols) * size;
        const y = ((i * 11 + 2) % rows) * size;
        const alpha = (Math.sin(now / 2400 + i * 1.7) + 1) * .018;
        ctx.fillStyle = `rgba(110, 230, 140, ${alpha})`;
        ctx.fillRect(x + 1, y + 1, size - 1, size - 1);
      }
    }

    for (const [key, cell] of cells) {
      const fade = Math.max(0, 1 - (now - cell.time) / 950);
      if (!fade) { cells.delete(key); continue; }
      paintCell(cell.x, cell.y, fade * .18);
    }
    if (pointer) {
      paintCell(pointer.x, pointer.y, .22);
      ctx.strokeStyle = "rgba(128, 238, 152, .6)";
      ctx.strokeRect(pointer.x * size + .5, pointer.y * size + .5, size, size);
      const glow = ctx.createRadialGradient(pointer.px, pointer.py, 0, pointer.px, pointer.py, 180);
      glow.addColorStop(0, "rgba(100, 220, 135, .07)");
      glow.addColorStop(1, "rgba(100, 220, 135, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
    }
  }

  function paintCell(x, y, alpha) {
    ctx.fillStyle = `rgba(100, 225, 130, ${alpha})`;
    ctx.fillRect(x * size + 1, y * size + 1, size - 1, size - 1);
  }

  function animate(now) {
    frame = 0;
    if (paused || document.hidden) return;
    if (now - lastFrame >= 32) { draw(now); lastFrame = now; }
    frame = requestAnimationFrame(animate);
  }

  function start() {
    if (!frame && !paused && !document.hidden && ctx) frame = requestAnimationFrame(animate);
  }

  function resize() {
    width = innerWidth; height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    cells.clear(); pointer = null;
    draw(performance.now());
  }

  function updateMotion() {
    cancelAnimationFrame(frame); frame = 0;
    cells.clear();
    document.body.classList.toggle("motion-paused", paused);
    motionButton.textContent = paused ? "Enable motion" : "Pause motion";
    motionButton.setAttribute("aria-pressed", String(paused));
    draw(performance.now()); start();
  }

  motionButton.addEventListener("click", () => { paused = !paused; updateMotion(); });
  reducedMotion.addEventListener("change", () => { paused = reducedMotion.matches; updateMotion(); });
  addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    cancelAnimationFrame(frame); frame = 0;
    if (!document.hidden) { cells.clear(); start(); }
  });
  document.addEventListener("pointermove", event => {
    if (event.pointerType === "touch") return;
    const x = Math.floor(event.clientX / size), y = Math.floor(event.clientY / size);
    if (pointer && (pointer.x !== x || pointer.y !== y) && !paused) {
      cells.set(`${pointer.x}:${pointer.y}`, {...pointer, time: performance.now()});
    }
    pointer = {x, y, px: event.clientX, py: event.clientY};
    coordinates.textContent = `GRID / ${String(x).padStart(2, "0")}:${String(y).padStart(2, "0")}`;
    if (paused) draw(performance.now());
  });
  document.documentElement.addEventListener("pointerleave", () => {
    pointer = null; coordinates.textContent = "GRID / IDLE";
    if (paused) draw(performance.now());
  });

  const clock = document.querySelector("#clock");
  function updateClock() {
    const now = new Date();
    clock.dateTime = now.toISOString();
    clock.textContent = now.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit", hour12: false});
  }
  updateClock(); setInterval(updateClock, 30000);

  document.querySelector("#search").addEventListener("submit", async event => {
    event.preventDefault();
    const query = document.querySelector("#query").value.trim();
    if (!query) return;
    const status = document.querySelector("#search-status");
    try {
      if (!globalThis.browser?.search) {
        status.textContent = "Search becomes available when installed in Firefox.";
        return;
      }
      await browser.search.search({query, disposition: "CURRENT_TAB"});
    } catch {
      status.textContent = "Search unavailable. Try the Firefox address bar.";
    }
  });

  async function loadSites() {
    const status = document.querySelector("#sites-status");
    if (!globalThis.browser?.topSites) {
      status.textContent = "Your Firefox destinations appear here after installation.";
      return;
    }
    try {
      const sites = await browser.topSites.get({limit: 8, newtab: true, includeFavicon: true});
      const list = document.querySelector("#sites");
      const seen = new Set();
      for (const site of sites) {
        let url;
        try { url = new URL(site.url); } catch { continue; }
        if (!["https:", "http:"].includes(url.protocol) || seen.has(url.href)) continue;
        seen.add(url.href);
        const link = document.createElement("a");
        link.className = "site"; link.href = url.href;
        const label = site.title || url.hostname;
        link.title = `${label}\n${url.hostname}`;
        const top = document.createElement("span");
        top.className = "site-top";
        if (site.favicon) {
          const icon = document.createElement("img");
          icon.className = "site-icon"; icon.src = site.favicon; icon.alt = "";
          top.append(icon);
        }
        const initial = document.createElement("span");
        initial.className = "site-initial"; initial.textContent = label.slice(0, 2).toUpperCase();
        initial.setAttribute("aria-hidden", "true");
        if (site.favicon) initial.hidden = true;
        const title = document.createElement("span");
        title.className = "site-name"; title.textContent = label;
        top.append(initial); link.append(top, title); list.append(link);
      }
      document.querySelector("#site-count").textContent = String(seen.size).padStart(2, "0");
      status.hidden = seen.size > 0;
      status.textContent = "No frequent destinations yet. They appear as you browse.";
    } catch {
      status.textContent = "Destinations unavailable. You can still use search.";
    }
  }
  resize(); updateMotion(); loadSites();
})();
