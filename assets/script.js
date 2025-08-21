/* ---------- Config (edit these) ---------- */
window.CONFIG = {
  // Set this to enable automatic stars/forks fetching for repos
  // that match https://github.com/<githubUsername>/<repo>
  githubUsername: "", // e.g., "username" (leave blank to disable)
  enableRepoStats: true
};
/* ---------------------------------------- */

(function () {
  const html = document.documentElement;
  const themeToggleBtn = document.getElementById("themeToggle");
  const grid = document.getElementById("projectGrid");
  const filtersEl = document.getElementById("filters");
  const searchInput = document.getElementById("search");
  const emptyState = document.getElementById("emptyState");
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Theme (default dark + respects prefers-color-scheme) ---------- */
  const storedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const startTheme = storedTheme || (prefersDark ? "dark" : "dark"); // default to dark even if light system
  html.setAttribute("data-theme", startTheme);
  if (themeToggleBtn) themeToggleBtn.setAttribute("aria-pressed", startTheme === "dark" ? "true" : "false");

  themeToggleBtn?.addEventListener("click", () => {
    const current = html.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    themeToggleBtn.setAttribute("aria-pressed", next === "dark" ? "true" : "false");
  });

  /* ---------- Modal helpers ---------- */
  const modal = document.getElementById("modal");
  const modalBody = document.getElementById("modalBody");
  const modalTitle = document.getElementById("modalTitle");
  let lastFocused = null;
  function openModal(title, htmlBody) {
    lastFocused = document.activeElement;
    modalTitle.textContent = title;
    modalBody.innerHTML = htmlBody;
    modal.hidden = false;
    // focus first focusable
    const f = modal.querySelector("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
    if (f) f.focus();
    document.addEventListener("keydown", escToClose);
  }
  function closeModal() {
    modal.hidden = true;
    document.removeEventListener("keydown", escToClose);
    if (lastFocused) lastFocused.focus();
  }
  function escToClose(e) { if (e.key === "Escape") closeModal(); }
  modal?.addEventListener("click", (e) => {
    if (e.target.closest("[data-close-modal]")) closeModal();
  });

  /* ---------- Data state ---------- */
  let allProjects = [];
  let filteredTag = "All";
  let query = "";

  /* ---------- Fetch & Render ---------- */
  async function init() {
    // Only run on pages that have a grid (index); About/Contact still need theme/year
    if (!grid) return;

    try {
      const res = await fetch("assets/projects.json", { cache: "no-cache" });
      allProjects = await res.json();
      renderFilters(allProjects);
      renderGrid(allProjects);
    } catch (err) {
      console.error("Failed to load projects.json", err);
      grid.innerHTML = `<p class="empty">Failed to load projects. Please check <code>assets/projects.json</code>.</p>`;
    }

    // Search
    let t;
    searchInput?.addEventListener("input", () => {
      clearTimeout(t);
      t = setTimeout(() => {
        query = searchInput.value.trim().toLowerCase();
        updateList();
      }, 120);
    });
  }

  function updateList() {
    const list = filterProjects(allProjects, filteredTag, query);
    renderGrid(list);
  }

  function filterProjects(projects, tag, q) {
    return projects.filter(p => {
      const matchesTag = tag === "All" || (p.tags || []).includes(tag);
      const hay = `${p.title} ${p.description}`.toLowerCase();
      const matchesQuery = !q || hay.includes(q);
      return matchesTag && matchesQuery;
    });
  }

  function renderFilters(projects) {
    // Counts
    const counts = { All: projects.length };
    projects.forEach(p => (p.tags || []).forEach(tag => counts[tag] = (counts[tag] || 0) + 1));

    // Clear
    filtersEl.innerHTML = "";
    const tags = Object.keys(counts).sort((a, b) => (a === "All" ? -1 : b === "All" ? 1 : a.localeCompare(b)));

    tags.forEach(tag => {
      const btn = document.createElement("button");
      btn.className = "chip";
      btn.type = "button";
      btn.setAttribute("role", "button");
      btn.setAttribute("aria-pressed", tag === filteredTag ? "true" : "false");
      btn.textContent = tag;
      const span = document.createElement("span");
      span.className = "count";
      span.textContent = counts[tag];
      btn.appendChild(span);
      btn.addEventListener("click", () => {
        filteredTag = tag;
        [...filtersEl.children].forEach(el => el.setAttribute("aria-pressed", "false"));
        btn.setAttribute("aria-pressed", "true");
        updateList();
      });
      filtersEl.appendChild(btn);
    });
  }

  function renderGrid(projects) {
    grid.innerHTML = "";
    emptyState.hidden = projects.length !== 0;

    projects.forEach((p, i) => {
      const card = document.createElement("article");
      card.className = "card";

      const img = document.createElement("img");
      img.className = "thumb";
      img.loading = "lazy";
      img.decoding = "async";
      img.src = p.image || "";
      img.alt = p.title ? `${p.title} thumbnail` : "Project thumbnail";
      card.appendChild(img);

      const body = document.createElement("div");
      body.className = "card-body";

      const h3 = document.createElement("h2");
      h3.className = "card-title";
      h3.textContent = p.title || "Untitled Project";
      body.appendChild(h3);

      const desc = document.createElement("p");
      desc.className = "card-desc";
      desc.textContent = p.description || "";
      body.appendChild(desc);

      if (Array.isArray(p.tags) && p.tags.length) {
        const tags = document.createElement("div");
        tags.className = "tag-row";
        p.tags.forEach(t => {
          const tag = document.createElement("span");
          tag.className = "tag";
          tag.textContent = t;
          tags.appendChild(tag);
        });
        body.appendChild(tags);
      }

      const meta = document.createElement("div");
      meta.className = "meta";

      const stat = document.createElement("div");
      stat.className = "stat";
      stat.textContent = "★ —   🍴 —"; // placeholders updated if API fetch succeeds
      meta.appendChild(stat);

      const links = document.createElement("div");
      links.className = "links";

      if (p.repoUrl) {
        const a = document.createElement("a");
        a.href = p.repoUrl;
        a.target = "_blank";
        a.rel = "noopener";
        a.className = "btn";
        a.textContent = "GitHub";
        links.appendChild(a);
      }

      if (p.liveUrl) {
        const a = document.createElement("a");
        a.href = p.liveUrl;
        a.target = "_blank";
        a.rel = "noopener";
        a.className = "btn";
        a.textContent = "Live Demo";
        links.appendChild(a);
      }

      const detailsBtn = document.createElement("button");
      detailsBtn.className = "btn";
      detailsBtn.type = "button";
      detailsBtn.textContent = "Details";
      detailsBtn.addEventListener("click", () => {
        const safeUrl = (url) => url ? `<a href="${url}" target="_blank" rel="noopener">${url}</a>` : "<em>—</em>";
        openModal(p.title, `
          <div class="prose">
            <p>${p.description || ""}</p>
            <p><strong>Tags:</strong> ${(p.tags || []).join(", ") || "—"}</p>
            <p><strong>Repo:</strong> ${safeUrl(p.repoUrl)}</p>
            <p><strong>Live:</strong> ${safeUrl(p.liveUrl)}</p>
          </div>
        `);
      });
      links.appendChild(detailsBtn);

      meta.appendChild(links);
      body.appendChild(meta);
      card.appendChild(body);
      grid.appendChild(card);

      // Optional: fetch stars/forks if configured and repo matches username
      if (window.CONFIG.enableRepoStats && window.CONFIG.githubUsername && p.repoUrl) {
        const match = p.repoUrl.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/#]+)/i);
        if (match && match[1].toLowerCase() === window.CONFIG.githubUsername.toLowerCase()) {
          const repo = match[2];
          fetch(`https://api.github.com/repos/${window.CONFIG.githubUsername}/${repo}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
              if (data) stat.textContent = `★ ${data.stargazers_count ?? 0}   🍴 ${data.forks_count ?? 0}`;
            })
            .catch(() => {/* silent */});
        }
      }
    });

    // a11y live-region state
    const section = grid.closest("section[aria-live]");
    if (section) section.setAttribute("aria-busy", "false");
  }

  // Kick off only on pages that include grid; still safe elsewhere
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();
})();
