document.addEventListener("DOMContentLoaded", () => {
    const defaultData = [
        {"username": "TechnoGod", "scores": {"raw_pvp_skill": 98, "building": 45, "speedrunning": 92, "boat_racing": 88, "redstone": 30, "game_sense": 96, "penance_score": 1200}},
        {"username": "RedstoneGuru", "scores": {"raw_pvp_skill": 30, "building": 82, "speedrunning": 40, "boat_racing": 50, "redstone": 100, "game_sense": 85}},
        {"username": "SpeedyGonzales", "scores": {"raw_pvp_skill": 70, "building": 20, "speedrunning": 99, "boat_racing": 91, "redstone": 10, "game_sense": 78, "penance_score": 450}},
        {"username": "BuilderBob", "scores": {"raw_pvp_skill": 40, "building": 97, "speedrunning": 30, "boat_racing": 25, "redstone": 60, "game_sense": 65}}
    ];

    const labels = {
        overall: "Overall Skill",
        raw_pvp_skill: "Raw PvP Skill",
        building: "Building",
        speedrunning: "Speedrunning",
        boat_racing: "Boat Racing",
        redstone: "Redstone",
        game_sense: "Game Sense",
        penance_score: "Penance Score"
    };

    let allPlayers = [];
    let currentCat = "overall";
    let searchQuery = "";

    const dom = {
        themeBtn: document.getElementById("theme-btn"),
        navBtns: document.querySelectorAll(".nav-btn"),
        title: document.getElementById("view-title"),
        count: document.getElementById("player-count"),
        searchInput: document.getElementById("search-input"),
        list: document.getElementById("list-container"),
        modal: document.getElementById("modal"),
        modalName: document.getElementById("modal-name"),
        modalStats: document.getElementById("modal-stats"),
        modalRemove: document.getElementById("modal-remove")
    };

    function initTheme() {
        const theme = localStorage.getItem("theme") || "dark";
        document.documentElement.setAttribute("data-theme", theme);
        dom.themeBtn.textContent = theme === "dark" ? "Light Theme" : "Dark Theme";
    }

    dom.themeBtn.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme");
        const next = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
        dom.themeBtn.textContent = next === "dark" ? "Light Theme" : "Dark Theme";
    });

    dom.navBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            dom.navBtns.forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            currentCat = e.target.getAttribute("data-cat");
            render();
        });
    });

    dom.searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        render();
    });

    dom.modalRemove.addEventListener("click", () => { dom.modal.style.display = "none"; });
    dom.modal.addEventListener("click", (e) => { if(e.target === dom.modal) dom.modal.style.display = "none"; });

    function showModal(player) {
        dom.modalName.textContent = player.username;
        dom.modalStats.innerHTML = "";
        
        let html = `<div class="stat-box"><div class="stat-name">Overall Skill</div><div class="stat-val">${player.avg}</div></div>`;
        
        Object.keys(labels).forEach(key => {
            if (key === "overall") return;
            const val = player.scores[key] !== undefined ? player.scores[key] : "N/A";
            html += `<div class="stat-box"><div class="stat-name">${labels[key]}</div><div class="stat-val">${val}</div></div>`;
        });
        
        dom.modalStats.innerHTML = html;
        dom.modal.style.display = "flex";
    }

    function processData(data) {
        const core = ["raw_pvp_skill", "building", "speedrunning", "boat_racing", "redstone", "game_sense"];
        allPlayers = data.map(p => {
            let sum = 0, count = 0;
            core.forEach(c => {
                if (typeof p.scores[c] === "number") { sum += p.scores[c]; count++; }
            });
            return {
                username: p.username,
                scores: p.scores,
                avg: count > 0 ? Math.round(sum / count) : 0
            };
        });
        render();
    }

    function render() {
        dom.title.textContent = labels[currentCat];
        dom.list.innerHTML = "";
        
        let filteredList = [];
        allPlayers.forEach(p => {
            const val = currentCat === "overall" ? p.avg : p.scores[currentCat];
            const matchesSearch = p.username.toLowerCase().includes(searchQuery);
            
            if (typeof val === "number" && matchesSearch) {
                filteredList.push({ player: p, score: val });
            }
        });

        filteredList.sort((a, b) => b.score - a.score);
        dom.count.textContent = `Total: ${filteredList.length}`;

        if (filteredList.length === 0) {
            dom.list.innerHTML = "<p style='padding: 1rem;'>No players found.</p>";
            return;
        }

        const fragment = document.createDocumentFragment();

        filteredList.forEach((item, index) => {
            const row = document.createElement("div");
            row.className = "list-row";
            
            row.innerHTML = `
                <div class="list-rank">#${index + 1}</div>
                <div class="list-name">${item.player.username}</div>
                <div class="list-score">${item.score}</div>
            `;
            
            row.addEventListener("click", () => showModal(item.player));
            fragment.appendChild(row);
        });

        dom.list.appendChild(fragment);
    }

    initTheme();

    fetch("./data.json")
        .then(res => res.json())
        .then(data => processData(data))
        .catch(err => {
            console.warn("Fetch failed, likely due to file:// protocol. Using default data.");
            processData(defaultData);
        });
});
