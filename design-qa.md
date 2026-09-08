# Design QA

## Target

- Reference: user-selected Campus Broadsheet composition (`1488 x 1057`).
- Prototype: local `dev` branch at `http://localhost:3200`.
- Supporting references: Google Material design eras, Material Symbols, and Google Fonts licensing guidance.

## Visual comparison

- `P0`: none.
- `P1`: desktop action headline clipped at the right edge. Fixed by rebalancing the display scale to the available grid column.
- `P1`: desktop hero broke `BUILD WHAT` across two lines instead of preserving the reference composition. Fixed with a responsive no-wrap rule and tighter display sizing.
- `P2`: decorative diagonal CSS stripes read as an invented brand asset. Removed; the interface now relies on the real GDG mark, Google G, licensed Roboto Condensed font files, Material Symbols, and functional Google color fields.
- `P2`: admin, error, and utility surfaces retained rounded SaaS panels. Reworked into the same square editorial grid and type system.

## Responsive and interaction checks

- Desktop: `1488 x 1057` homepage and departments; `1440 x 1000` sign-in.
- Mobile: `390 x 844` homepage and departments, plus the in-app browser viewport.
- Mobile navigation opens and exposes Explore teams, FAQs, and Google sign-in links.
- Department search filters the index and updates technical/community counts.
- Closed recruitment state remains visible and disables team selection as intended by the current deadline.
- Sign-in retains a single Google action and clearly communicates the `@vitstudent.ac.in` restriction.
- No horizontal overflow or clipped interface text remains in the checked viewports.

## Result

- Lint: passed.
- TypeScript: passed.
- Unit/security suite: 60 passed.
- Production build: passed.
- Playwright E2E: 8 passed across desktop Chromium and iPhone 13 emulation.

Final result: passed.
