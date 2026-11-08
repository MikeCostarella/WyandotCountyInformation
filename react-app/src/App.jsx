import { useMemo, useState } from "react";
import { LINKS, CATEGORIES, AUDITOR_VENDOR } from "./data/links.js";
import { COUNTY, SEARCH_PLACEHOLDER, VENDOR_LABEL } from "./config/county.js";
import { useCountyApps } from "./data/countyApps.js";
import MainMenu from "./components/MainMenu.jsx";
import CountyApps from "./components/CountyApps.jsx";
import LinkGroups from "./components/LinkGroups.jsx";

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

export default function App() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("All");
  const { apps: countyApps } = useCountyApps();

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
          <MainMenu
            categories={CATEGORIES}
            categoryMeta={CATEGORY_META}
            active={active}
            onPickCategory={setActive}
            apps={countyApps}
          />
          <h1>{COUNTY.name} County Information</h1>
        </div>
        <p>A curated directory of government, education, health, business, community, and news links across {COUNTY.name} County, Ohio.</p>
        <p style={{ margin: "0 0 16px", fontSize: "0.9rem", opacity: 0.9 }}>
          <strong>{VENDOR_LABEL}:</strong> {AUDITOR_VENDOR}
        </p>
        <input
          className="search"
          type="search"
          placeholder={SEARCH_PLACEHOLDER}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search links"
        />
      </header>

      <CountyApps apps={countyApps} />

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

        <LinkGroups grouped={grouped} categoryMeta={CATEGORY_META} query={query} />
      </main>

      <footer className="footer">
        <p>{LINKS.length} links · This is a community reference, not an official county site.</p>
        <p className="build">Built {buildStamp}</p>
        <p className="copyright">© {buildYear} Costarella Innovations, LLC. All rights reserved.</p>
      </footer>
    </div>
  );
}
