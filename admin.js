document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const SKILLS = ["raw_pvp", "building", "redstone", "ice_boat", "trap_box", "ffa_br"];
  const PLATFORM_LABEL = { pc: "PC · 1.00x", pojav_kbm: "Pojav KBM · 1.02x", pojav_touch: "Pojav Touch · 1.08x" };
  const PLATFORM_CLASS = { pc: "badge-pc", pojav_kbm: "badge-kbm", pojav_touch: "badge-touch" };
  const SKIN_CACHE_KEY = "mst-skin-cache";

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

  const dom = {
    form: document.getElementById("player-form"),
    formTitle: document.getElementById("form-title"),
    editIndex: document.getElementById("edit-index"),
    submitBtn: document.getElementById("form-submit"),
    cancelBtn: document.getElementById("form-cancel"),
    tableBody: document.getElementById("table-body"),
    emptyMsg: document.getElementById("empty-msg"),
    downloadBtn: document.getElementById("btn-download"),
    resetBtn: document.getElementById("btn-reset"),
    themeBtn: document.getElementById("theme-btn"),
    themeLabel: document.querySelector(".theme-label"),
    canvas: document.getElementById("bg-canvas"),
    dropZone: document.getElementById("drop-zone"),
    fileInput: document.getElementById("file-input")
  };

  /* Theme */
  function initTheme() {
    const t = localStorage.getItem("mst-theme") || "dark";
    document.documentElement.setAttribute("data-theme", t);
    dom.themeLabel.textContent = t === "dark" ? "PLAINS" : "CAVE";
  }
  dom.themeBtn.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("mst-theme", next);
    dom.themeLabel.textContent = next === "dark" ? "PLAINS" : "CAVE";
  });
  initTheme();

  /* Background blocks */
  function initBackground() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = dom.canvas.getContext("2d");
    let w, h, blocks;
    const COLORS = ["#5fbb3a", "#3f8f24", "#4a7be0", "#d9b25a", "#8b97a6"];
    function resize() {
      w = dom.canvas.width = window.innerWidth;
      h = dom.canvas.height = window.innerHeight;
      blocks = Array.from({ length: Math.round((w * h) / 90000) }, spawn);
    }
    function spawn() { return { x: Math.random() * w, y: Math.random() * h, s: 8 + Math.random() * 16, v: 0.15 + Math.random() * 0.5, c: COLORS[(Math.random() * COLORS.length) | 0], a: 0.15 + Math.random() * 0.25 }; }
    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (const b of blocks) {
        b.y -= b.v;
        if (b.y + b.s < 0) { b.y = h + b.s; b.x = Math.random() * w; }
        ctx.globalAlpha = b.a;
        ctx.fillStyle = b.c;
        ctx.fillRect(b.x | 0, b.y | 0, b.s | 0, b.s | 0);
      }
      requestAnimationFrame(frame);
    }
    resize();
    window.addEventListener("resize", resize);
    frame();
  }
  initBackground();

  /* Skin cache */
  function getSkinCache() {
    try { return JSON.parse(localStorage.getItem(SKIN_CACHE_KEY) || "{}"); } catch { return {}; }
  }
  function setSkinCache(cache) {
    try { localStorage.setItem(SKIN_CACHE_KEY, JSON.stringify(cache)); } catch {}
  }
  function skinUrl(username, customSkin) {
    if (customSkin) return customSkin;
    return "https://mc-heads.net/avatar/" + encodeURIComponent(username) + "/48";
  }
  function cacheSkin(username, customSkin) {
    const url = skinUrl(username, customSkin);
    const cache = getSkinCache();
    if (cache[username]) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const c = document.createElement("canvas");
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        c.getContext("2d").drawImage(img, 0, 0);
        cache[username] = c.toDataURL("image/png");
        setSkinCache(cache);
      } catch {}
    };
    img.src = url;
  }
  function getCachedSkin(username) {
    const cache = getSkinCache();
    return cache[username] || null;
  }

  /* Drag and drop */
  dom.dropZone.addEventListener("click", () => dom.fileInput.click());
  dom.fileInput.addEventListener("change", e => { if (e.target.files[0]) loadFile(e.target.files[0]); });
  dom.dropZone.addEventListener("dragover", e => { e.preventDefault(); dom.dropZone.classList.add("over"); });
  dom.dropZone.addEventListener("dragleave", () => dom.dropZone.classList.remove("over"));
  dom.dropZone.addEventListener("drop", e => {
    e.preventDefault();
    dom.dropZone.classList.remove("over");
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  });

  function loadFile(file) {
    if (!file.name.endsWith(".json")) { toast("Only .json files accepted"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data)) { toast("JSON must be an array of players"); return; }
        loadData(data);
        toast("Loaded " + players.length + " players from " + file.name);
      } catch { toast("Invalid JSON file"); }
    };
    reader.readAsText(file);
  }

  /* Load data */
  function loadData(data) {
    players = data.map(p => ({
      username: p.username || "",
      platform: p.platform || "pc",
      scores: {
        raw_pvp: p.scores?.raw_pvp ?? 0,
        building: p.scores?.building ?? 0,
        redstone: p.scores?.redstone ?? 0,
        ice_boat: p.scores?.ice_boat ?? 0,
        trap_box: p.scores?.trap_box ?? 0,
        ffa_br: p.scores?.ffa_br ?? 0
      },
      penance: typeof p.penance === "number" ? p.penance : null,
      skin: p.skin || ""
    }));
    players.forEach(p => cacheSkin(p.username, p.skin));
    render();
  }

  /* Render table */
  function render() {
    dom.tableBody.innerHTML = "";
    if (players.length === 0) { dom.emptyMsg.hidden = false; return; }
    dom.emptyMsg.hidden = true;
    const frag = document.createDocumentFragment();
    players.forEach((p, i) => {
      const tr = document.createElement("tr");
      const penStr = p.penance !== null ? p.penance : "—";
      const cached = getCachedSkin(p.username);
      const src = cached || skinUrl(p.username, p.skin);
      tr.innerHTML =
        `<td class="score-cell">${i + 1}</td>` +
        `<td class="uname"><img class="skin-thumb" src="${esc(src)}" alt="" onerror="this.style.display='none'">${esc(p.username)}</td>` +
        `<td><span class="badge ${PLATFORM_CLASS[p.platform]}">${PLATFORM_LABEL[p.platform]}</span></td>` +
        `<td class="score-cell">${p.scores.raw_pvp}</td>` +
        `<td class="score-cell">${p.scores.building}</td>` +
        `<td class="score-cell">${p.scores.redstone}</td>` +
        `<td class="score-cell">${p.scores.ice_boat}</td>` +
        `<td class="score-cell">${p.scores.trap_box}</td>` +
        `<td class="score-cell">${p.scores.ffa_br}</td>` +
        `<td class="score-cell">${penStr}</td>` +
        `<td class="actions-cell"><button class="edit" data-i="${i}">EDIT</button><button class="del" data-i="${i}">DEL</button></td>`;
      frag.appendChild(tr);
    });
    dom.tableBody.appendChild(frag);
  }

  function esc(s) { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }

  /* Table edit/delete */
  dom.tableBody.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const i = parseInt(btn.dataset.i, 10);
    if (btn.classList.contains("edit")) startEdit(i);
    else if (btn.classList.contains("del")) deletePlayer(i);
  });

  function startEdit(i) {
    const p = players[i];
    document.getElementById("f-username").value = p.username;
    document.getElementById("f-platform").value = p.platform;
    SKILLS.forEach(s => { document.getElementById("f-" + s).value = p.scores[s]; });
    document.getElementById("f-penance").value = p.penance ?? "";
    document.getElementById("f-skin").value = p.skin || "";
    dom.editIndex.value = i;
    dom.formTitle.textContent = "EDIT PLAYER";
    dom.submitBtn.textContent = "SAVE CHANGES";
    dom.cancelBtn.style.display = "";
    document.getElementById("form-card").scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function deletePlayer(i) {
    if (!confirm("Delete " + players[i].username + "?")) return;
    players.splice(i, 1);
    render();
    toast("Player deleted");
  }

  /* Form submit */
  dom.form.addEventListener("submit", e => {
    e.preventDefault();
    const username = document.getElementById("f-username").value.trim();
    const platform = document.getElementById("f-platform").value;
    const scores = {};
    SKILLS.forEach(s => { scores[s] = Math.max(0, Math.min(100, parseInt(document.getElementById("f-" + s).value, 10) || 0)); });
    const penVal = document.getElementById("f-penance").value;
    const penance = penVal !== "" ? Math.max(0, parseInt(penVal, 10) || 0) : null;
    const skin = document.getElementById("f-skin").value.trim();

    const obj = { username, platform, scores, penance, skin };
    const idx = parseInt(dom.editIndex.value, 10);

    if (idx >= 0 && idx < players.length) {
      players[idx] = obj;
      toast("Player updated");
    } else {
      players.push(obj);
      toast("Player added");
    }
    cacheSkin(username, skin);
    resetForm();
    render();
  });

  dom.cancelBtn.addEventListener("click", resetForm);

  function resetForm() {
    dom.form.reset();
    dom.editIndex.value = -1;
    dom.formTitle.textContent = "ADD PLAYER";
    dom.submitBtn.textContent = "ADD PLAYER";
    dom.cancelBtn.style.display = "none";
    document.getElementById("f-raw_pvp").value = 0;
    document.getElementById("f-building").value = 0;
    document.getElementById("f-redstone").value = 0;
    document.getElementById("f-ice_boat").value = 0;
    document.getElementById("f-trap_box").value = 0;
    document.getElementById("f-ffa_br").value = 0;
  }

  /* Download */
  dom.downloadBtn.addEventListener("click", () => {
    const json = JSON.stringify(players, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.json";
    a.click();
    URL.revokeObjectURL(url);
    toast("Downloaded data.json — replace the file and push to GitHub");
  });

  /* Reload from file */
  dom.resetBtn.addEventListener("click", () => {
    fetch("./data.json?" + Date.now())
      .then(r => r.json())
      .then(loadData)
      .catch(() => loadData(defaultData));
    toast("Reloaded from data.json");
  });

  /* Toast */
  function toast(msg) {
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }

  /* Boot */
  fetch("./data.json")
    .then(r => r.json())
    .then(loadData)
    .catch(() => loadData(defaultData));
});
