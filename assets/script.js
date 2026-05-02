(function () {
  const grid = document.getElementById("projectGrid");
  const filtersEl = document.getElementById("filters");
  const searchInput = document.getElementById("search");
  const emptyState = document.getElementById("emptyState");
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

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

    const maxVisibleFilters = 6; // Show only 6 filter chips initially
    let isExpanded = false;

    const renderChips = (tagsToShow, expanded) => {
      filtersEl.innerHTML = "";
      tagsToShow.forEach(tag => {
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
          [...filtersEl.children].forEach(el => {
            if (el.classList.contains('chip')) el.setAttribute("aria-pressed", "false");
          });
          btn.setAttribute("aria-pressed", "true");
          updateList();
        });
        filtersEl.appendChild(btn);
      });

      // Add "+X more" button if collapsed and there are hidden filters
      if (!expanded && tags.length > maxVisibleFilters) {
        const moreBtn = document.createElement("button");
        moreBtn.className = "chip more-filters";
        moreBtn.type = "button";
        moreBtn.textContent = `+${tags.length - maxVisibleFilters} more`;
        moreBtn.addEventListener("click", () => {
          isExpanded = true;
          renderChips(tags, true);
        });
        filtersEl.appendChild(moreBtn);
      }

      // Add "Show less" button if expanded
      if (expanded && tags.length > maxVisibleFilters) {
        const lessBtn = document.createElement("button");
        lessBtn.className = "chip more-filters";
        lessBtn.type = "button";
        lessBtn.textContent = "Show less";
        lessBtn.addEventListener("click", () => {
          isExpanded = false;
          renderChips(tags.slice(0, maxVisibleFilters), false);
        });
        filtersEl.appendChild(lessBtn);
      }
    };

    renderChips(isExpanded ? tags : tags.slice(0, maxVisibleFilters), isExpanded);
  }

  function renderGrid(projects) {
    grid.innerHTML = "";
    emptyState.hidden = projects.length !== 0;

    projects.forEach((p) => {
      const card = document.createElement("article");
      card.className = p.featured ? "card featured" : "card";

      // Image
      const imgWrap = document.createElement("div");
      imgWrap.className = "card-image";
      const img = document.createElement("img");
      img.className = "thumb";
      img.loading = "lazy";
      img.decoding = "async";
      img.src = p.image || "";
      img.alt = p.title ? `${p.title} thumbnail` : "Project thumbnail";
      imgWrap.appendChild(img);
      card.appendChild(imgWrap);

      const body = document.createElement("div");
      body.className = "card-body";

      const h3 = document.createElement("h3");
      h3.className = "card-title";
      h3.textContent = p.title || "Untitled Project";
      body.appendChild(h3);

      const desc = document.createElement("p");
      desc.className = "card-desc";
      desc.textContent = p.description || "";
      body.appendChild(desc);

      // Tag pills (max 3 + static "+N") — placed after description
      if (Array.isArray(p.tags) && p.tags.length) {
        const tags = document.createElement("div");
        tags.className = "tag-row";
        const visible = p.tags.slice(0, 3);
        const overflow = p.tags.length - visible.length;
        visible.forEach(t => {
          const tag = document.createElement("span");
          tag.className = t.startsWith("🏆") ? "tag award-tag" : "tag";
          tag.textContent = t;
          tags.appendChild(tag);
        });
        if (overflow > 0) {
          const more = document.createElement("span");
          more.className = "tag tag-more";
          more.textContent = `+${overflow}`;
          more.title = p.tags.slice(3).join(", ");
          tags.appendChild(more);
        }
        body.appendChild(tags);
      }

      // Footer: meta on left, "Read more →" on right
      const footer = document.createElement("div");
      footer.className = "card-footer";

      const meta = document.createElement("span");
      meta.className = "card-meta";
      const metaText = (p.tags || []).find(t => !t.startsWith("🏆")) || "";
      meta.textContent = metaText;
      footer.appendChild(meta);

      const readMore = document.createElement("button");
      readMore.className = "card-link";
      readMore.type = "button";
      readMore.setAttribute("aria-label", `Read more about ${p.title || "this project"}`);
      readMore.innerHTML = `Read more <span class="card-arrow" aria-hidden="true">&rarr;</span>`;
      readMore.addEventListener("click", () => openProjectModal(p));
      footer.appendChild(readMore);

      body.appendChild(footer);
      card.appendChild(body);
      grid.appendChild(card);
    });

    const section = grid.closest("[aria-live]");
    if (section) section.setAttribute("aria-busy", "false");
  }

  function openProjectModal(p) {
    const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
    const linkLine = (url, label) => url
      ? `<a class="inline-link" href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(label)}</a>`
      : null;
    const links = [
      linkLine(p.repoUrl, "Repository"),
      linkLine(p.liveUrl, p.liveUrlLabel || "Live demo"),
    ]
      .filter(Boolean).join(' <span class="modal-link-sep" aria-hidden="true">·</span> ');
    const tags = (p.tags || []).map(t => {
      const cls = t.startsWith("🏆") ? "tag award-tag" : "tag";
      return `<span class="${cls}">${escapeHtml(t)}</span>`;
    }).join("");

    openModal(p.title || "Project", `
      <div class="modal-prose">
        <p>${escapeHtml(p.description || "")}</p>
        ${tags ? `<div class="tag-row modal-tags">${tags}</div>` : ""}
        ${links ? `<p class="modal-links">${links}</p>` : ""}
      </div>
    `);
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init)
    : init();
})();
