# Chukwudalu Dumebi-Kachikwu — Portfolio (Vanilla HTML/CSS/JS)

A fast, accessible, dark-mode-first portfolio that showcases GitHub projects without any API keys. Includes tag filters, search, optional GitHub stars/forks, and a simple “Project Details” modal.

## Features
- **Dark Mode First** + light/dark toggle (persisted via `localStorage`; respects `prefers-color-scheme`)
- **Project Grid** with cards: title, description, tags, links, optional stars/forks, and thumbnail
- **Search & Filter**: client-side search (title/description) and tag chips with counts
- **A11y**: semantic HTML, alt text, focus styles, keyboard navigable; modal supports Escape/overlay close
- **Performance**: small, no frameworks; Lighthouse targets ≥90

---

## Local Development

No build step needed. Use any static server or open `index.html` directly.

### Option A: Open directly
- Double-click `index.html` (some browsers restrict `fetch` for local files; if cards don’t load, use Option B).

### Option B: Simple static server (Python)
```bash
# from the project root
python3 -m http.server 5500
# then open http://localhost:5500
