import { useEffect, useRef, useState } from "react";
import {
  COUNTY,
  GITHUB_ACTIONS_URL,
  GITHUB_REPO_URL,
  HUB_COUNTY_URL,
  MY_WEBSITE_URL,
} from "../config/county.js";
import { iconFor } from "../data/countyApps.js";

/**
 * The fleet's hamburger main menu, in sections like the Voters / Parcels apps:
 *   View            — All links, or one category (same as the chips below)
 *   <County> apps   — the other fleet apps for this county (county-apps.json)
 *   Links           — Ohio Counties hub (on this county), MyWebSite, GitHub
 * Each section collapses on its header. Opens on click; closes on item select,
 * a click outside, or Escape.
 */
export default function MainMenu({ categories, categoryMeta, active, onPickCategory, apps }) {
  const [open, setOpen] = useState(false);
  // Collapsed section titles. Everything starts open; a collapsed section stays
  // collapsed while the page is open, like the OhioCounties hub menu.
  const [collapsed, setCollapsed] = useState(() => new Set());
  const ref = useRef(null);

  const toggleSection = (title) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });

  /** Collapsible section: a toggle header plus its items (hidden when collapsed). */
  const Section = ({ title, children }) => {
    const isOpen = !collapsed.has(title);
    return (
      <>
        <button type="button" className="menu-section-label menu-section-toggle" aria-expanded={isOpen} onClick={() => toggleSection(title)}>
          <span>{title}</span>
          <span className="menu-chevron" aria-hidden="true">{isOpen ? "▾" : "▸"}</span>
        </button>
        {isOpen && children}
      </>
    );
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (cat) => { onPickCategory(cat); setOpen(false); };
  const close = () => setOpen(false);

  const extLink = (href, label, icon) => (
    <a role="menuitem" className="menu-item menu-link" href={href} target="_blank" rel="noopener noreferrer" onClick={close}>
      <span className="menu-icon" aria-hidden="true">{icon}</span> {label} <span className="ext" aria-hidden="true">↗</span>
    </a>
  );

  return (
    <div className="menu" ref={ref}>
      <button
        type="button"
        className="menu-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Main menu"
      >
        <span className="menu-bars">☰</span> Menu
        <span className={open ? "caret open" : "caret"}>▾</span>
      </button>

      {open && (
        <div className="menu-panel" role="menu">
          <Section title="View">
            <button type="button" role="menuitemradio" aria-checked={active === "All"}
              className={active === "All" ? "menu-item active" : "menu-item"} onClick={() => pick("All")}>
              <span className="menu-icon" aria-hidden="true">📋</span> All links
            </button>
            {categories.map((cat) => (
              <button key={cat} type="button" role="menuitemradio" aria-checked={active === cat}
                className={active === cat ? "menu-item active" : "menu-item"} onClick={() => pick(cat)}>
                <span className="menu-icon" aria-hidden="true">{categoryMeta[cat].icon}</span> {cat}
              </button>
            ))}
          </Section>

          {apps.length > 0 && (
            <Section title={`${COUNTY.name} County apps`}>
              {apps.map((a) => (
                <span key={a.href}>{extLink(a.href, a.label, iconFor(a.kind))}</span>
              ))}
            </Section>
          )}

          <Section title="Links">
            {extLink(HUB_COUNTY_URL, "Ohio Counties hub", "🗺️")}
            {extLink(MY_WEBSITE_URL, "My Website", "🌐")}
            {extLink(GITHUB_REPO_URL, "GitHub Repository", "📦")}
            {extLink(GITHUB_ACTIONS_URL, "GitHub Actions", "⚙️")}
          </Section>
        </div>
      )}
    </div>
  );
}
