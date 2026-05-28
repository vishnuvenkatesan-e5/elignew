# WellSky Eligibility & Auth — Design System

An internal design system reconstructed from the **WellSky Eligibility & Authorization** product (P1 build).
This system covers the web app's dashboard, eligibility request views, authorization request views, payor/patient detail drill-downs, and supporting automation screens.

## Source materials

| Source | Location | Notes |
|---|---|---|
| Figma — primary product file | `Wellsky - Eligibility & Auth[Updated]_ Wellsky - P1 (Copy).fig` (mounted virtual filesystem) | 2 pages (`Main-Page`, `Other-Assets`), 410 top-level frames, 941 local components. The source of truth. |
| Figma — Ant Design v5.9.4 community library | referenced upstream; not mounted in this workspace | WellSky's app clearly composes Ant Design primitives (tables, tags, dropdowns, caret icons) with custom branding layered on top. |
| Uploaded fonts | `uploads/*.ttf` | Full Roboto family (including Roboto Condensed / SemiCondensed). The product uses standard `Roboto` — we copied Light/Regular/Italic/Medium/SemiBold/Bold into `fonts/`. |

> **Note on the Ant Design file:** the original request referenced a second Figma file (`Ant Design - Version 5.9.4 (Community).fig`) but only the WellSky P1 file is actually mounted in this workspace. Component vocabulary in the WellSky file is explicitly Ant-derived (e.g. `Size=large, Align=left`, `color=geek blue, border=true`, `Type=primary, Shape=standard`), so we've captured that influence in the token names below rather than duplicating Ant primitives.

## About the product

WellSky Eligibility & Authorization is a healthcare back-office workflow tool. It ingests eligibility/authorization status from payors (Medicare, Medicare Advantage, UHC, Aetna, Anthem, Medicaid, commercial), triages the results into a set of **action-item buckets** (Pending Submission, Due For Follow Up, Needs Attention, Alerts, Approved, Denied, Up For Recert, Expiring Auths), and lets agency staff work those buckets down.

Main surfaces:

1. **Dashboard — Eligibility** and **Dashboard — Authorization**: summary KPI cards (All Patients / Active / Inactive / Mixed / Exceptions / Alerts), donut + horizontal-bar charts (Eligibility Status Summary, Eligibility Alert Summary, Payor Type & Payor Distribution), a right rail of Action Items.
2. **Auth Req View / Eligibility Request View**: filterable data tables with expandable patient rows, status tags, inline action buttons, and drill-downs into coverage / deductibles / co-pay breakdowns.
3. **Patient Detailed View**: per-patient side panel with coverage summary (Medicare Part A/B, other payors), coordination of benefits, deductibles, copay financial breakdowns, and an automation log.
4. **Automation Log**: run-level log showing Extraction / Parsing stages with Terminated / Failed / Success statuses.

## Brand identity at a glance

- **Logo:** "WellSky" outline-white wordmark paired with a tiny accent dot. Always shown on the dark navy header.
- **Primary chrome:** a near-black navy → slate vertical gradient (`rgb(56,71,90)` → `rgb(44,60,80)` → `rgb(28,45,66)`) running the full 1920×72px top bar.
- **Accent palette:** link blue `#1677FF`, chart blue `#0E91C6`, brand teal `#276966`, soft red `#CF1322` for alerts.
- **Typography:** 100% Roboto. No brand display face. Medium 500 carries most titles; Regular 400 runs body.

---

## CONTENT FUNDAMENTALS

The product is internal enterprise healthcare software for operations staff. Copy is **terse, label-driven, and literal**. There is almost no marketing tone anywhere in the file.

**Voice characteristics**

- **Functional labels over sentences.** Headings are nouns and noun-phrases: "Summary of Eligibility Request Status", "Coverage Summary", "Eligibility Alert Summary", "Payor Type Distribution", "Action Items".
- **Title Case for section headers and column names.** "Total Coverage Status", "Active Coverage", "All Elig Requests".
- **ALL CAPS labels** appear on summary chips (`120 PATIENTS`, `PATIENTS`) and as tiny overline labels.
- **Domain abbreviations are used without expansion** — the reader is assumed expert: MRN, MSP, NPI, COB, EHR, Agency, Payor, Elig, Auth, Recert.
- **No "you" or "I" language.** The product addresses workflow, not the user. "Needs Attention", not "Review this". "Add More Filters", not "You can add more filters".
- **Counts are zero-padded to two digits in chips:** `01`, `02`, `09`, `12` — giving summary tiles a uniform weight.
- **Status phrases are hyphen-joined compact fragments:** `Terminated - Business Exceptions`, `Failed - Technical Exception`, `Modified - No Action Required - Completed`.
- **No emoji.** No exclamation points. No persuasion language. No empty-state cheer ("Great, you're all caught up!").
- **Error / alert rows state the condition directly:** "Policy with future activation date", "Patient name mismatch in EHR", "Coverage is inactive", "Agency is not within plan's service area".
- **Prompts on buttons are action-verb + object:** "Add More Filters", "View Details", "Sort by", "Export".

**Tone vibe:** neutral, clinical, back-office. Similar to Epic / Cerner / Athena back-office screens, not to consumer health apps. The user is a billing / authorization specialist working dozens of patients a day; the UI respects their expertise.

---

## VISUAL FOUNDATIONS

**Color vibe.** Cool and clinical. The dominant chromatic sensation is the dark-navy chrome at the top contrasted against an almost pure-white canvas underneath. Chart color doesn't dance — it stays in a narrow teal/blue range with one muted gold and one muted red. No gradients in content, only in the chrome. No saturation above ~70%.

**Backgrounds.** Flat white (`#FFFFFF`) for cards and page. The only filled background tints are:
- Soft blue wash (`rgb(240,245,255)`) on the filter bar just under the header.
- Pale red (`rgba(255,231,230,0.65)`) on the Action Items banner inside the right rail.
- Pale red (`rgb(255,244,244)`) on individual "Needs Attention" rows.
- No hand-drawn illustrations. No photography (except a small circular avatar PNG in the header). No full-bleed imagery.

**Patterns / textures.** None. There are no repeating patterns, no dot-grids, no noise, no grain. A single dot-grid mark appears purely as a drag-handle affordance inside tables.

**Typography.**
- Roboto across the board. No serif. No display face.
- Sizes (from Figma Typography page): Hero Title 36/42, H1 32/40, H2 28/34, H3 24/28, H4 20/24, Paragraph Large 18/22, Paragraph Medium 16/20, Paragraph Small 14/18 (this is the dominant body size), Paragraph X-Small 12/16 (table cells), Overline 11/14.
- Weight usage: Medium 500 for titles and most KPI counts; Regular 400 for body and table cells; SemiBold 600 sparingly on emphasis; Bold 700 reserved for chart tooltips and logo.
- Almost no italics. No underlines except on hover for `.ws-link`.

**Spacing.** 4-px base grid. Card interiors use 16–24px padding. Card-to-card gutters are 24px. The KPI chip row uses a tight 8px gap.

**Borders.**
- Hairline rules: `rgb(238,240,243)` or `rgb(232,233,234)` (≈ 1px).
- Card strokes: `rgb(216,216,216)` for the heavier card border, `rgb(232,233,234)` for lighter.
- Selected / active row: 1.5px `rgb(22,119,255)`.
- Table row separators: thin `rgba(0,0,0,0.15)`.

**Corner radii.** Small. 2px on most rectangles (tables, tags, chips), 4px on inputs/buttons, 8px on cards, 12px on the hero panel inside the typography specimen, 24px on the largest outer container. Pills (full-round) are reserved for badges and the avatar.

**Shadows.** Two shadow flavors only:
- A **card shadow** used on the Action Items rail: `0 22px 26px rgba(86,86,86,0.09)` — diffuse, cool, strictly downward.
- A **pressed / hairline shadow** on headers and sticky rows: `0 1px 0 rgba(0,0,0,0.04)`.

No inner shadows. No neumorphism. No glow.

**Blur / transparency.** Transparency appears only in: the navy-over-navy header text (`rgba(255,255,255,0.65)` for inactive nav, `rgba(255,255,255,0.25)` for disabled); the soft red alert tint; and semitransparent icon tints. No backdrop-blur.

**Animation.** The Figma file carries no motion spec. Treat transitions as **fast, utilitarian**: 120–160 ms `ease-out` on hover/press, 200 ms on expand/collapse. No bouncing, no spring. Dropdowns fade+scale(0.98→1). Loading states are the skeleton-loader frames (`Frame-1000004940 - Skeleton Loader`) — grey rectangles at 12% opacity that pulse.

**Hover states.**
- Buttons lift by 2% lightness on their fill, OR they gain a 1px blue outline (`rgb(22,119,255)`), depending on type.
- Links: underline appears.
- Table rows: background shifts to `rgb(248,250,253)`.
- Nav items in the header: text opacity jumps from 0.65 → 1.

**Press states.** Slight darken (5% on fills) and no scale change. Buttons do not shrink.

**Focus.** 3px soft blue outline `rgba(22,119,255,0.18)` around the focused element (our addition; not explicit in Figma but consistent with Ant Design's conventions upstream).

**Layout rules.**
- Frame width is 1920 with ~1600–1860 content. The dashboard uses a 2-column split: main content (left ~1280) + Action Items rail (right ~620), both anchored under a 72px fixed header.
- Tables are full-bleed to card padding and use dedicated sticky column headers at 44–48px tall.
- Pagination + row-count footer sits flush to card bottom.

**Cards.** White fill. 1px `rgb(232,233,234)` border. 8px radius. The shadow is only present on the floating Action Items rail — most cards are **flat-bordered, not shadowed**.

**Tags / chips / badges.**
- Status tags: 2px radius rectangle with a **1px colored border** and a tinted background (Ant's "color, border=true" pattern). Colors used in the file: `geek blue`, `green`, `gold`, `red`, `processing` (purple).
- Count chips in section headers: tiny 16–20px rounded pill with colored fill and white number.

**Iconography.** See ICONOGRAPHY section below.

**Imagery mood.** Effectively none — the app is data-dense. The only bitmap images are a small user-avatar PNG and payor/insurance mark PNGs (UHC, Aetna, Anthem, Medicare). The avatar is warm-toned; the payor marks are their own brands.

---

## ICONOGRAPHY

- **Primary icon vocabulary:** the file mixes **Ant Design v5 glyphs** (caret-up/caret-down/caret-right for table headers and expand rows, check, close, search, filter, setting, minus-circle) with a small set of **custom WellSky status marks** (ArtboardStatus variants, alert triangles, "needs attention" badges).
- **Secondary icon sources** visible in the file (by `data-name`): `material-symbols:book-6-outline`, `mdi:user`, `tabler:chevron-down`, `heroicons-*`, `solar:copy-bold`, `ri:reset-left-fill`, `fa-solid-copy`. The WellSky product clearly imports from multiple CDN libraries — it does NOT ship one uniform icon set.
- **Stroke vs fill:** table controls are **stroke icons at 1.25–1.5px weight, 14–16px**. Status indicators (e.g. Approved check, Denied X, Needs Attention triangle) use **solid fills with a colored circular background**.
- **Emoji:** not used anywhere in the product surface.
- **Unicode symbols:** not used as icons. `—` is used as a null value (e.g. "Recert rem-days: —").
- **Icon color:** matches the text color of the row it sits in. In the dark header, icons are `rgba(255,255,255,0.6)`. In the body, icons inherit `rgb(98,109,138)` (secondary text).
- **Icon sizes:** 14px (inline with small body), 16px (buttons / menu items), 20px (section header affordances), 24px (large status marks).

**What we've copied into `assets/icons/`**: the handful of raw SVGs Figma exported for Close, Search, Mail, Setting, Minus-Circle — enough to preview the style.

**Recommended runtime source:** use [`@ant-design/icons`](https://github.com/ant-design/ant-design-icons) for table & form controls, and a small custom-SVG set for the WellSky status marks (Approved / Pending / Denied / Needs Attention / Up For Recert / Expiring Auths / Alerts). Fall back to Heroicons Outline for anything missing. **Flagged substitution:** the ICONOGRAPHY above is authoritative; if you need 1:1 SVGs of every status mark, pull them from Figma — only the handful in `assets/icons/` are local.

---

## Index — what's in this design system

```
/
├── README.md                      ← you are here
├── SKILL.md                       ← Agent-Skills entry point (drop into Claude Code)
├── colors_and_type.css            ← CSS custom properties (all tokens) + font-face + semantic type helpers
├── fonts/                         ← Roboto Light/Regular/Italic/Medium/SemiBold/Bold (TTF)
├── assets/
│   ├── wellsky-logo-white.svg     ← wordmark (outline white, horizontal)
│   ├── wellsky-logo-dot.svg       ← trailing accent mark
│   └── icons/                     ← Close, Search, Mail, Setting, Minus-Circle (SVGs extracted from Figma)
├── preview/                       ← cards shown in the Design System tab (one per token/component family)
└── ui_kits/
    └── eligibility-auth-web/
        ├── README.md              ← what the kit covers + recipe
        ├── index.html             ← clickable prototype of the main dashboard + auth-req view
        ├── components.jsx         ← header, navtabs, KPI chip, status tag, card, table, action-item row, button, filter bar
        └── screens.jsx            ← Dashboard, AuthReqView, PatientDetail
```

The **Design System tab** is populated by the cards in `preview/`, each registered as an asset.

---

## Iterating

- Every token in `colors_and_type.css` is keyed `--ws-*`. Reach for those first; invent new colors only if nothing fits.
- The UI kit in `ui_kits/eligibility-auth-web/` is cosmetic-only (no real data). It's meant to be remixed into mockups, not used as production code.
- The SKILL.md file at the project root makes this system installable as a Claude Code skill.
