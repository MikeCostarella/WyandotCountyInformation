// The other fleet apps for this county, read from the OhioCounties hub's
// county-apps.json so the list is maintained in one place (the hub's
// src/data/counties.ts). See the hub README, "County apps feed".
import { useEffect, useState } from "react";
import { COUNTY, FALLBACK_APPS, OHIO_COUNTIES_URL } from "../config/county.js";

export const COUNTY_APPS_FEED_URL = `${OHIO_COUNTIES_URL}county-apps.json`;

/** Small icon per app kind (the hub uses the same kind names). */
export const KIND_ICON = {
  "Parcels": "🗺️",
  "Jurisdictions": "🧭",
  "Address Points": "📍",
  "Fire Stations": "🚒",
  "Hydrants": "🧯",
  "Water Providers": "💧",
  "Healthcare": "🏥",
  "Schools": "🏫",
  "School Districts": "🎓",
  "Precincts": "🗂️",
  "Voters": "🗳️",
  "Information": "ℹ️",
  "Elections": "🏛️",
  "Liquor Permits": "🍷",
};
export const iconFor = (kind) => KIND_ICON[kind] ?? "🔗";

/** This app itself, which shouldn't appear in its own "other apps" list. */
const isThisApp = (a) => a.kind === "Information" && a.href.includes(`/${COUNTY.repo}/`);

/** The feed's entry for this county, or null if the shape isn't what we expect. */
function appsFromFeed(feed) {
  const entry = feed && feed.counties && feed.counties[COUNTY.slug];
  if (!entry || !Array.isArray(entry.apps)) return null;
  const apps = entry.apps.filter(
    (a) => a && typeof a.label === "string" && typeof a.href === "string" && /^https:\/\//.test(a.href),
  );
  return apps.length ? apps : null;
}

/**
 * The other fleet apps for this county. Starts with the built-in copy, then
 * swaps in the live list once county-apps.json arrives. A failed fetch leaves
 * the built-in copy in place — it is never an error the visitor sees.
 */
export function useCountyApps() {
  const [apps, setApps] = useState(() => FALLBACK_APPS.filter((a) => !isThisApp(a)));
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(COUNTY_APPS_FEED_URL, { cache: "default" })
      .then((r) => (r.ok ? r.json() : null))
      .then((feed) => {
        if (cancelled) return;
        const fromFeed = appsFromFeed(feed);
        if (fromFeed) {
          setApps(fromFeed.filter((a) => !isThisApp(a)));
          setLive(true);
        }
      })
      .catch(() => { /* offline or hub unreachable: keep the built-in list */ });
    return () => { cancelled = true; };
  }, []);

  return { apps, live };
}
