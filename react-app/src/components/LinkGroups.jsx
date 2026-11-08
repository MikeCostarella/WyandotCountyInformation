import { useMemo, useState } from "react";

function hostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * The directory as a collapsible tree: category → subcategory → link cards.
 * Everything starts expanded; headers toggle their branch, and the bar at the
 * top expands or collapses the whole tree. While a search is typed every
 * branch is forced open so no match is hidden.
 */
export default function LinkGroups({ grouped, categoryMeta, query }) {
  const [collapsed, setCollapsed] = useState(() => new Set());
  const searching = query.trim().length > 0;

  const toggle = (key) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const isOpen = (key) => searching || !collapsed.has(key);

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

  const allKeys = useMemo(
    () => tree.flatMap(({ cat, subs }) => [cat, ...subs.map(([sub]) => `${cat}/${sub}`)]),
    [tree],
  );
  const collapseAll = () => setCollapsed(new Set(allKeys));
  const expandAll = () => setCollapsed(new Set());
  const anyCollapsed = allKeys.some((k) => collapsed.has(k));

  if (tree.length === 0) return null;

  return (
    <>
      <div className="tree-bar">
        <button type="button" className="tree-bar-btn" onClick={expandAll} disabled={searching || !anyCollapsed}>Expand all</button>
        <button type="button" className="tree-bar-btn" onClick={collapseAll} disabled={searching}>Collapse all</button>
        {searching && <span className="tree-bar-note">Showing every match for “{query.trim()}”</span>}
      </div>

      {tree.map(({ cat, items, subs }) => {
        const meta = categoryMeta[cat];
        const open = isOpen(cat);
        return (
          <section key={cat} className="group">
            <h2 style={{ color: meta.color }}>
              <button type="button" className="tree-toggle" aria-expanded={open} onClick={() => toggle(cat)}>
                <span className="tree-chevron" aria-hidden="true">{open ? "▾" : "▸"}</span>
                <span className="chip-icon" aria-hidden="true">{meta.icon}</span> {cat}
                <span className="count">{items.length}</span>
              </button>
            </h2>

            {open && subs.map(([sub, links]) => {
              const key = `${cat}/${sub}`;
              const subOpen = isOpen(key);
              return (
                <div key={key} className="subgroup">
                  <h3>
                    <button type="button" className="tree-toggle" aria-expanded={subOpen} onClick={() => toggle(key)}>
                      <span className="tree-chevron" aria-hidden="true">{subOpen ? "▾" : "▸"}</span>
                      <span className="badge" style={{ background: meta.color }}>{sub}</span>
                      <span className="count">{links.length}</span>
                    </button>
                  </h3>
                  {subOpen && (
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
