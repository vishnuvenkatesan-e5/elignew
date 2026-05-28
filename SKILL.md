---
name: wellsky-eligibility-auth-design
description: Use this skill to generate well-branded interfaces and assets for WellSky's Eligibility & Authorization product, either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

Key entry points in this skill:
- `colors_and_type.css` — all design tokens as CSS custom properties + `@font-face` rules.
- `fonts/` — Roboto TTFs (300, 400, 400italic, 500, 600, 700).
- `assets/` — WellSky wordmark SVG plus iconography extracted from the Figma.
- `ui_kits/eligibility-auth-web/` — React (Babel inline) components and three sample screens.
- `preview/` — per-concept visual cards (colors, type, components).
