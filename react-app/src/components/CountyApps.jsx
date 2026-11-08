import { COUNTY, HUB_COUNTY_URL } from "../config/county.js";
import { iconFor } from "../data/countyApps.js";

/**
 * Strip under the header: the other fleet apps for this county as buttons,
 * plus a link to the county in the Ohio Counties hub. The list comes from
 * useCountyApps (county-apps.json with a built-in fallback).
 */
export default function CountyApps({ apps }) {
  if (apps.length === 0) return null;
  return (
    <nav className="county-apps" aria-label={`Other ${COUNTY.name} County apps`}>
      <span className="county-apps-label">{COUNTY.name} County apps</span>
      <div className="county-apps-list">
        {apps.map((a) => (
          <a key={a.href} className="app-btn" href={a.href} target="_blank" rel="noopener noreferrer" title={`Open ${a.label} (new tab)`}>
            <span className="app-icon" aria-hidden="true">{iconFor(a.kind)}</span> {a.label}
          </a>
        ))}
        <a className="app-btn app-btn-hub" href={HUB_COUNTY_URL} target="_blank" rel="noopener noreferrer" title="This county in the Ohio Counties hub (new tab)">
          All Ohio counties →
        </a>
      </div>
    </nav>
  );
}
