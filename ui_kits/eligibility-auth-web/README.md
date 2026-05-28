# UI Kit — WellSky Eligibility & Auth (web)

Clickable, cosmetic-only recreation of the P1 web app. Components are JSX loaded inline via Babel; there is no build step.

## What it covers
- **Header** with WellSky wordmark + nav tabs (Dashboard / Eligibility / Authorization)
- **Dashboard (Eligibility)** — filter bar, KPI chip row, Eligibility Status Summary donut card, Payor Distribution card, right-rail Action Items with expandable groups
- **Auth Req View** — filterable data table with status tags, attention rows, pagination footer
- **Patient Detail** — slide-out side panel with coverage summary (Medicare Part A/B), deductibles, copay

Switch between screens via the top nav tabs.

## Files
- `index.html` — entry, wires React + Babel, renders `<App />`
- `components.jsx` — Header, NavTabs, KPIChip, StatusTag, Card, Button, FilterBar, ActionItemRow, DataTable, PatientRow
- `screens.jsx` — Dashboard, AuthReqView, PatientDetail, App (state + routing)

## Caveats
- Charts are SVG approximations — they reflect the real data shapes in the Figma (donut + horizontal bars) but are not live.
- Payor logos (UHC/Aetna/Anthem) are rendered as text chips; swap in real marks when available.
- No real data: all rows are local fixtures defined in `screens.jsx`.
