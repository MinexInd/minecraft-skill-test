document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const SKILLS = [
    { key: "raw_pvp", label: "Raw PvP" },
    { key: "building", label: "Building" },
    { key: "redstone", label: "Redstone" },
    { key: "ice_boat", label: "Ice Boat Racing" },
    { key: "trap_box", label: "Trap Box" },
    { key: "ffa_br", label: "FFA Battle Royale" }
  ];

  const CATEGORIES = [
    { key: "overall", label: "Overall", desc: "Average of all six equalized skill scores. This is the batch ranking." },
    ...SKILLS.map(s => ({ key: s.key, label: s.label, desc: `${s.label} — equalized by platform before ranking.` })),
    { key: "penance", label: "Penance", desc: "Separate kit-based 1v1 ladder. Not averaged into Overall." }
  ];

  const EQUALIZE = { pc: 1.0, pojav_kbm: 1.02, pojav_touch: 1.08 };
  const PLATFORM_LABEL = {
    pc: "PC · 1.00×",
    pojav_kbm: "Pojav KBM · 1.02×",
    pojav_touch: "Pojav Touch · 1.08×"
  };
  const PLATFORM_CLASS = { pc: "badge-pc", pojav_kbm: "badge-kbm", pojav_touch: "badge-touch" };

  const defaultData = [
    { username: "EnderSlayer", platform: "pc", scores: { raw_pvp: 96, building: 52, redstone: 38, ice_boat: 84, trap_box: 90, ffa_br: 94 }, penance: 1280 },
    { username: "RedstoneRiot", platform: "pc", scores: { raw_pvp: 41, building: 78, redstone: 99, ice_boat: 55, trap_box: 62, ffa_br: 70 } },
    { username: "FrostRunner", platform: "pojav_kbm", scores: { raw_pvp: 72, building: 33, redstone: 22, ice_boat: 97, trap_box: 80, ffa_br: 76 }, penance: 640 },
    { username: "BlockWarden", platform: "pc", scores: { raw_pvp: 58, building: 95, redstone: 71, ice_boat: 40, trap_box: 66, ffa_br: 60 } },
    { username: "TouchTitan", platform: "pojav_touch", scores: { raw_pvp: 88, building: 61, redstone: 44, ice_boat: 79, trap_box: 85, ffa_br: 91 }, penance: 990 },
    { username: "NetherNomad", platform: "pojav_kbm", scores: { raw_pvp: 64, building: 70, redstone: 58, ice_boat: 68, trap_box: 73, ffa_br: 81 } },
    { username: "CreeperCraft", platform: "pc", scores: { raw_pvp: 49, building: 88, redstone: 83, ice_boat: 47, trap_box: 55, ffa_br: 52 } },
    { username: "SpeedPixel", platform: "pojav_touch", scores: { raw_pvp: 76, building: 28, redstone: 15, ice_boat: 92, trap_box: 71, ffa_br: 83 }, penance: 410 },
    { username: "DiamondDuke", platform: "pc", scores: { raw_pvp: 91, building: 64, redstone: 49, ice_boat: 73, trap_box: 88, ffa_br: 95 }, penance: 1510 },
    { username: "LapisLad", platform: "pojav_kbm", scores: { raw_pvp: 53, building: 81, redstone: 90, ice_boat: 44, trap_box: 59, ffa_br: 57 } },
    { username: "BoatBaron", platform: "pc", scores: { raw_pvp: 67, building: 45, redstone: 31, ice_boat: 99, trap_box: 77, ffa_br: 72 } },
    { username: "TrapMaster", platform: "pojav_touch", scores: { raw_pvp: 60, building: 54, redstone: 66, ice_boat: 63, trap_box: 96, ffa_br: 78 }, penance: 720 },
    { username: "QuartzQueen", platform: "pc", scores: { raw_pvp: 44, building: 99, redstone: 76, ice_boat: 36, trap_box: 50, ffa_br: 48 } },
    { username: "WitherWhip", platform: "pojav_kbm", scores: { raw_pvp: 85, building: 39, redstone: 27, ice_boat: 70, trap_box: 82, ffa_br: 89 }, penance: 870 }
  ];

  let players = [];
  let currentCat = "overall";
  let searchQuery = "";

  const dom = {
    themeBtn: document.getElementById("theme-btn"),
    themeLabel: document.querySelector(".theme-label"),
    catTabs: document.getElementById("cat-tabs"),
    title: document.getElementById("view-title"),
    desc: document.getElementById("view-desc"),
    count: document.getElementById("player-count"),
    search: document.getElementById("search-input"),
    list: document.getElementById("list-container"),
    empty: document.getElementById("empty-state"),
    modal: document.getElementById("modal"),
    modalName: document.getElementById("modal-name"),
    modalHead: document.getElementById("modal-head"),
    modalPlatform: document.getElementById("modal-platform"),
    modalOverall: document.getElementById("modal-overall"),
    modalStats: document.getElementById("modal-stats"),
    modalPenance: document.getElementById("modal-penance"),
    modalPenanceVal: document.getElementById("modal-penance-val"),
    modalClose: document.getElementById("modal-close"),
    canvas: document.getElementById("bg-canvas")
  };

  /* ---------- Theme ---------- */
  function initTheme() {
    const theme = localStorage.getItem("mst-theme") || "dark";
    document.documentElement.setAttribute("data-theme", theme);
    dom.themeLabel.textContent = theme === "dark" ? "PLAINS" : "CAVE";
  }
  dom.themeBtn.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("mst-theme", next);
    dom.themeLabel.textContent = next === "dark" ? "PLAINS" : "CAVE";
  });

  /* ---------- Data processing ---------- */
  function processData(data) {
    players = data.map(p => {
      const mult = EQUALIZE[p.platform] || 1.0;
      const eq = {};
      let sum = 0;
      SKILLS.forEach(s => {
        const raw = typeof p.scores[s.key] === "number" ? p.scores[s.key] : 0;
        eq[s.key] = Math.round(raw * mult);
        sum += eq[s.key];
      });
      return {
        username: p.username,
        platform: p.platform,
        raw: p.scores,
        eq,
        overall: Math.round(sum / SKILLS.length),
        penance: typeof p.penance === "number" ? p.penance : null
      };
    });
    renderTabs();
    render();
  }

  function scoreFor(player, cat) {
    if (cat === "overall") return player.overall;
    if (cat === "penance") return player.penance;
    return player.eq[cat];
  }

  /* ---------- Tabs ---------- */
  function renderTabs() {
    dom.catTabs.innerHTML = "";
    CATEGORIES.forEach(cat => {
      const btn = document.createElement("button");
      btn.className = "cat-tab" + (cat.key === currentCat ? " active" : "");
      btn.type = "button";
      btn.textContent = cat.label;
      btn.setAttribute("aria-pressed", cat.key === currentCat ? "true" : "false");
      btn.addEventListener("click", () => {
        currentCat = cat.key;
        renderTabs();
        render();
      });
      dom.catTabs.appendChild(btn);
    });
  }

  /* ---------- Avatar ---------- */
  function buildAvatar(username) {
    const img = document.createElement("img");
    img.className = "avatar";
    img.width = 48; img.height = 48;
    img.alt = username + " skin";
    img.loading = "lazy";
    img.src = `https://mc-heads.net/avatar/${encodeURIComponent(username)}/48`;
    img.addEventListener("error", () => {
      const fb = document.createElement("div");
      fb.className = "avatar avatar-fallback";
      fb.textContent = username.slice(0, 2).toUpperCase();
      img.replaceWith(fb);
    });
    return img;
  }

  /* ---------- Render list ---------- */
  function render() {
    const cat = CATEGORIES.find(c => c.key === currentCat);
    dom.title.textContent = cat.label;
    dom.desc.textContent = cat.desc;

    const q = searchQuery.toLowerCase().trim();
    let ranked = players
      .filter(p => currentCat !== "penance" || p.penance !== null)
      .filter(p => p.username.toLowerCase().includes(q))
      .map(p => ({ player: p, score: scoreFor(p, currentCat) }))
      .filter(x => typeof x.score === "number")
      .sort((a, b) => b.score - a.score);

    dom.count.textContent = `${ranked.length} PLAYER${ranked.length === 1 ? "" : "S"}`;
    dom.list.innerHTML = "";

    if (ranked.length === 0) {
      dom.empty.hidden = false;
      return;
    }
    dom.empty.hidden = true;

    const frag = document.createDocumentFragment();
    ranked.forEach((item, i) => {
      const row = document.createElement("li");
      row.className = "rank-row" + (i < 3 ? " top" + (i + 1) : "");
      row.tabIndex = 0;
      row.style.animationDelay = Math.min(i * 35, 500) + "ms";
      row.setAttribute("role", "button");
      row.setAttribute("aria-label", `#${i + 1} ${item.player.username}, score ${item.score}`);

      const rank = document.createElement("div");
      rank.className = "rank-num";
      rank.textContent = "#" + (i + 1);

      const main = document.createElement("div");
      main.className = "player-main";
      const name = document.createElement("div");
      name.className = "player-name";
      name.textContent = item.player.username;
      const sub = document.createElement("div");
      sub.className = "player-sub";
      const badge = document.createElement("span");
      badge.className = "badge " + PLATFORM_CLASS[item.player.platform];
      badge.textContent = PLATFORM_LABEL[item.player.platform];
      sub.appendChild(badge);
      main.appendChild(name);
      main.appendChild(sub);

      const scoreWrap = document.createElement("div");
      scoreWrap.className = "score-wrap";
      const track = document.createElement("div");
      track.className = "xp-track";
      const fill = document.createElement("div");
      fill.className = "xp-fill";
      fill.style.transform = "scaleX(" + (Math.max(0, Math.min(100, item.score)) / 100) + ")";
      track.appendChild(fill);
      const num = document.createElement("div");
      num.className = "score-num";
      num.textContent = item.score;
      scoreWrap.appendChild(track);
      scoreWrap.appendChild(num);

      row.appendChild(rank);
      row.appendChild(buildAvatar(item.player.username));
      row.appendChild(main);
      row.appendChild(scoreWrap);

      const open = () => openModal(item.player);
      row.addEventListener("click", open);
      row.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
      });

      frag.appendChild(row);
    });
    dom.list.appendChild(frag);
  }

  /* ---------- Modal ---------- */
  function openModal(p) {
    dom.modalName.textContent = p.username;
    dom.modalHead.src = `https://mc-heads.net/avatar/${encodeURIComponent(p.username)}/48`;
    dom.modalHead.alt = p.username + " skin";
    dom.modalPlatform.className = "badge " + PLATFORM_CLASS[p.platform];
    dom.modalPlatform.textContent = PLATFORM_LABEL[p.platform];
    dom.modalOverall.textContent = p.overall;

    dom.modalStats.innerHTML = "";
    SKILLS.forEach(s => {
      const cell = document.createElement("div");
      cell.className = "stat-cell";
      const raw = p.raw[s.key] || 0;
      const eq = p.eq[s.key];
      const note = eq !== raw ? ` (${raw}→${eq})` : "";
      cell.innerHTML =
        `<div class="stat-name">${s.label}</div>` +
        `<div class="stat-bar"><span style="width:${Math.min(100, eq)}%"></span></div>` +
        `<div class="stat-val">${eq}${note}</div>`;
      dom.modalStats.appendChild(cell);
    });

    if (p.penance !== null) {
      dom.modalPenance.hidden = false;
      dom.modalPenanceVal.textContent = p.penance;
    } else {
      dom.modalPenance.hidden = true;
    }

    dom.modal.hidden = false;
    dom.modalClose.focus();
  }
  function closeModal() { dom.modal.hidden = true; }
  dom.modalClose.addEventListener("click", closeModal);
  dom.modal.addEventListener("click", e => { if (e.target === dom.modal) closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !dom.modal.hidden) closeModal(); });

  dom.search.addEventListener("input", e => {
    searchQuery = e.target.value;
    render();
  });

  /* ---------- Background blocks ---------- */
  function initBackground() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = dom.canvas.getContext("2d");
    let w, h, blocks;
    const COLORS = ["#5fbb3a", "#3f8f24", "#4a7be0", "#d9b25a", "#8b97a6"];
    function resize() {
      w = dom.canvas.width = window.innerWidth;
      h = dom.canvas.height = window.innerHeight;
      const count = Math.round((w * h) / 90000);
      blocks = Array.from({ length: count }, () => spawn());
    }
    function spawn() {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        s: 8 + Math.random() * 16,
        v: 0.15 + Math.random() * 0.5,
        c: COLORS[(Math.random() * COLORS.length) | 0],
        a: 0.15 + Math.random() * 0.25
      };
    }
    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (const b of blocks) {
        b.y -= b.v;
        if (b.y + b.s < 0) { b.y = h + b.s; b.x = Math.random() * w; }
        ctx.globalAlpha = b.a;
        ctx.fillStyle = b.c;
        ctx.fillRect(b.x | 0, b.y | 0, b.s | 0, b.s | 0);
        ctx.globalAlpha = b.a * 0.5;
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(b.x | 0, (b.y + b.s * 0.7) | 0, b.s | 0, (b.s * 0.3) | 0);
      }
      requestAnimationFrame(frame);
    }
    resize();
    window.addEventListener("resize", resize);
    frame();
  }

  /* ---------- Boot ---------- */
  initTheme();
  initBackground();
  fetch("./data.json")
    .then(r => r.json())
    .then(processData)
    .catch(() => {
      console.warn("Fetch failed (likely file://). Using built-in sample data.");
      processData(defaultData);
    });
});
