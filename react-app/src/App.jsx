import { useMemo, useState } from "react";
import { LINKS, CATEGORIES, AUDITOR_VENDOR } from "./data/links.js";

// Main menu links. Replace the placeholder URLs with your real ones.
const MENU_LINKS = [
  { label: "GitHub Repository", url: "https://github.com/MikeCostarella/WyandotCountyInformation", icon: "📦" },
  { label: "GitHub Actions", url: "https://github.com/MikeCostarella/WyandotCountyInformation/actions", icon: "⚙️" },
  { label: "My Website", url: "https://mikecostarella.github.io/MyWebSite/", icon: "🌐" },
];

const CATEGORY_META = {
  "Government": { icon: "🏛️", color: "#1d4ed8" },
  "Education": { icon: "📚", color: "#7c3aed" },
  "Health": { icon: "⚕️", color: "#dc2626" },
  "Business & Economy": { icon: "💼", color: "#0f766e" },
  "Community & Social": { icon: "🤝", color: "#ea580c" },
  "Recreation & Tourism": { icon: "🌿", color: "#16a34a" },
  "News & Media": { icon: "📰", color: "#475569" },
};

// Build timestamp injected by Vite (see vite.config.js `define`).
const BUILD_DATE = new Date(__BUILD_TIME__);
const buildStamp = BUILD_DATE.toLocaleString("en-US", {
  year: "numeric", month: "long", day: "numeric",
  hour: "numeric", minute: "2-digit", timeZoneName: "short",
});
const buildYear = BUILD_DATE.getFullYear();

function hostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function App() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("All");
  const [menuOpen, setMenuOpen] = useState(false);

  const counts = useMemo(() => {
    const c = { All: LINKS.length };
    for (const cat of CATEGORIES) c[cat] = LINKS.filter((l) => l.category === cat).length;
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LINKS.filter((l) => {
      const matchesCat = active === "All" || l.category === active;
      const matchesQuery =
        !q ||
        l.name.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.subcategory.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [query, active]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const l of filtered) {
      if (!map.has(l.category)) map.set(l.category, []);
      map.get(l.category).push(l);
    }
    return CATEGORIES.filter((c) => map.has(c)).map((c) => [c, map.get(c)]);
  }, [filtered]);

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-top">
          <div className="menu">
            <button
              className="menu-toggle"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-label="Main menu"
            >
              <span className="menu-bars">☰</span> Menu
              <span className={menuOpen ? "caret open" : "caret"}>▾</span>
            </button>
            {menuOpen && (
              <ul className="menu-panel">
                {MENU_LINKS.map((m) => (
                  <li key={m.label}>
                    <a href={m.url} target="_blank" rel="noopener noreferrer">
                      <span className="menu-icon">{m.icon}</span> {m.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <h1>Wyandot County Information</h1>
        </div>
        <p>A curated directory of government, education, health, business, community, and news links across Wyandot County, Ohio.</p>
        <p style={{ margin: "0 0 16px", fontSize: "0.9rem", opacity: 0.9 }}>
          <strong>Auditor Data Vendor:</strong> {AUDITOR_VENDOR}
        </p>
        <input
          className="search"
          type="search"
          placeholder="Search links, e.g. library, chamber, elections…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search links"
        />
      </header>

      <nav className="chips">
        <button className={active === "All" ? "chip active" : "chip"} onClick={() => setActive("All")}>
          All <span className="count">{counts.All}</span>
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={active === cat ? "chip active" : "chip"}
            onClick={() => setActive(cat)}
            style={active === cat ? { borderColor: CATEGORY_META[cat].color, color: CATEGORY_META[cat].color } : undefined}
          >
            <span className="chip-icon">{CATEGORY_META[cat].icon}</span> {cat} <span className="count">{counts[cat]}</span>
          </button>
        ))}
      </nav>

      <main>
        {filtered.length === 0 && (
          <p className="empty">No links match “{query}”. Try a different search.</p>
        )}

        {grouped.map(([cat, items]) => (
          <section key={cat} className="group">
            <h2 style={{ color: CATEGORY_META[cat].color }}>
              <span className="chip-icon">{CATEGORY_META[cat].icon}</span> {cat}
            </h2>
            <div className="grid">
              {items.map((l) => (
                <a key={l.url} className="card" href={l.url} target="_blank" rel="noopener noreferrer">
                  <div className="card-top">
                    <span className="badge" style={{ background: CATEGORY_META[cat].color }}>{l.subcategory}</span>
                  </div>
                  <h3>{l.name}</h3>
                  <p>{l.description}</p>
                  <span className="host">{hostname(l.url)} ↗</span>
                </a>
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer className="footer">
        <p>{LINKS.length} links · This is a community reference, not an official county site.</p>
        <p className="build">Built {buildStamp}</p>
        <p className="copyright">© {buildYear} Costarella Innovations, LLC. All rights reserved.</p>
      </footer>
    </div>
  );
}
