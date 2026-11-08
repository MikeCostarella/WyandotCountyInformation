import { useEffect, useMemo, useState } from "react";
import { COUNTY } from "../config/county.js";

function hostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * The directory as a collapsible tree: category → subcategory → link cards.
 * Categories start closed so the page reads as a table of contents with
 * counts; opening one shows its subcategories already open, each of which can
 * be closed on its own. Picking a category chip opens that category alone.
 * The bar at the top opens or closes the whole tree, and while a search is
 * typed every branch is forced open so no match is hidden. The visitor's
 * open/closed choices are kept for the browser session.
 */
export default function LinkGroups({ grouped, categoryMeta, query, active }) {
  // Open categories (default none) and closed subcategories (default none);
  // both remembered for this tab's session, per county (sessionStorage is
  // shared by every app on mikecostarella.github.io).
  const STORAGE_KEY = `${COUNTY.repo}.linkTree`;
  const [openCats, setOpenCats] = useState(() => new Set(loadState().openCats));
  const [closedSubs, setClosedSubs] = useState(() => new Set(loadState().closedSubs));
  const searching = query.trim().length > 0;

  function loadState() {
    try {
      const raw = sessionStorage.getItem(`${COUNTY.repo}.linkTree`);
      const v = raw ? JSON.parse(raw) : null;
      return { openCats: Array.isArray(v?.openCats) ? v.openCats : [], closedSubs: Array.isArray(v?.closedSubs) ? v.closedSubs : [] };
    } catch {
      return { openCats: [], closedSubs: [] };
    }
  }
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ openCats: [...openCats], closedSubs: [...closedSubs] }));
    } catch { /* storage unavailable: choices just aren't remembered */ }
  }, [STORAGE_KEY, openCats, closedSubs]);

  // A category chip (anything but "All") opens that category alone.
  useEffect(() => {
    if (active && active !== "All") setOpenCats(new Set([active]));
  }, [active]);

  const toggleCat = (cat) =>
    setOpenCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  const toggleSub = (key) =>
    setClosedSubs((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const catOpen = (cat) => searching || openCats.has(cat);
  const subOpen = (key) => searching || !closedSubs.has(key);

  // Subcategories in order of first appearance within each category.
  const tree = useMemo(
    () =>
      grouped.map(([cat, items]) => {
        const subs = new Map();
        for (const l of items) {
          if (!subs.has(l.subcategory)) subs.set(l.subcategory, []);
          subs.get(l.subcategory).push(l);
        }
        return { cat, items, subs: [...subs.entries()] };
      }),
    [grouped],
  );

  const allCats = tree.map(({ cat }) => cat);
  const expandAll = () => { setOpenCats(new Set(allCats)); setClosedSubs(new Set()); };
  const collapseAll = () => { setOpenCats(new Set()); setClosedSubs(new Set()); };
  const allOpen = allCats.every((c) => openCats.has(c)) && closedSubs.size === 0;
  const noneOpen = allCats.every((c) => !openCats.has(c));

  if (tree.length === 0) return null;

  return (
    <>
      <div className="tree-bar">
        <button type="button" className="tree-bar-btn" onClick={expandAll} disabled={searching || allOpen}>Expand all</button>
        <button type="button" className="tree-bar-btn" onClick={collapseAll} disabled={searching || noneOpen}>Collapse all</button>
        {searching && <span className="tree-bar-note">Showing every match for “{query.trim()}”</span>}
      </div>

      {tree.map(({ cat, items, subs }) => {
        const meta = categoryMeta[cat];
        const open = catOpen(cat);
        return (
          <section key={cat} className="group">
            <h2 style={{ color: meta.color }}>
              <button type="button" className="tree-toggle" aria-expanded={open} onClick={() => toggleCat(cat)}>
                <span className="tree-chevron" aria-hidden="true">{open ? "▾" : "▸"}</span>
                <span className="chip-icon" aria-hidden="true">{meta.icon}</span> {cat}
                <span className="count">{items.length}</span>
              </button>
            </h2>

            {open && subs.map(([sub, links]) => {
              const key = `${cat}/${sub}`;
              const isSubOpen = subOpen(key);
              return (
                <div key={key} className="subgroup">
                  <h3>
                    <button type="button" className="tree-toggle" aria-expanded={isSubOpen} onClick={() => toggleSub(key)}>
                      <span className="tree-chevron" aria-hidden="true">{isSubOpen ? "▾" : "▸"}</span>
                      <span className="badge" style={{ background: meta.color }}>{sub}</span>
                      <span className="count">{links.length}</span>
                    </button>
                  </h3>
                  {isSubOpen && (
                    <div className="grid">
                      {links.map((l) => (
                        <a key={l.url} className="card" href={l.url} target="_blank" rel="noopener noreferrer">
                          <h4>{l.name}</h4>
                          <p>{l.description}</p>
                          <span className="host">{hostname(l.url)} ↗</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        );
      })}
    </>
  );
}
