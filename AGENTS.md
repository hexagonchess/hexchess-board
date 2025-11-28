# hexchess-board Agent Guide

## Mission
- Provide a dependency-free `<hexchess-board>` web component that implements Glinsky's hexagonal chess, complete with rules enforcement, move generation, and a fully themed UI.
- Ship a standalone element that can be embedded directly in HTML, bundled through npm, or referenced via CDN, while remaining performant (120 FPS drag/resizing targets) and fully customizable via CSS custom properties.
- Maintain published documentation (Eleventy static site under `docs/`) so users can discover installation guides, API docs, and live examples.

## Source Map
- `src/hexchess-board.ts`: Primary custom element class; orchestrates state management, rendering, input, and customization.
- `src/*.ts`: Game logic (board, pieces, movement, state machine) compiled to top-level JS files for publishing.
- `docs-src/`: Eleventy-based documentation site sources (`index.md`, `install.md`, `_data/api.11tydata.js`, etc.). Run `npm run docs` to regenerate `docs/`.
- `docs/`: Built static site that GitHub Pages serves.
- Top-level configs: `package.json` scripts, `rollup.config.js` for docs bundling, `tsconfig.json`, `biome.json`, etc.

## Dev & Build Workflow
- Install deps: `npm install`.
- Component dev server: `npm run serve` (uses @web/dev-server; watch mode, auto port increment if 8000 is busy).
- Documentation preview: `npm run docs:serve` (serves `docs/`).
- Build component: `npm run build` (TypeScript → JS).
- Regenerate docs: `npm run docs` (clean, build component, run custom-elements analysis, rollup docs bundle, copy assets, run Eleventy).
- Tests: `npm run test` (runs dev + prod web-test-runner suites). Jest unit tests exist via `npm run test:unit`. Use `npm run lint`/`npm run format` before committing.

## HexchessBoard Architecture (src/hexchess-board.ts)
- Extends `HTMLElement`, registers as `hexchess-board`. Observes attributes for board FEN, move strings, player names, orientation, role, coordinates visibility, frozen state, hints, history animation duration, and color scheme. Attributes map to strongly typed setters (fenToBoard/stringToMoves conversions).
- State is maintained via a `BoardStateMachine`, tracking a `Game` instance, move history, captured pieces, and UI substates (WAITING, DRAG_PIECE, PROMOTING, GAMEOVER, REWOUND). `_reconcileNewState` applies transitions, queues history animations, emits lifecycle CustomEvents (`furthestback`, `furthestforward`), and triggers renders.
- Rendering uses `<canvas>` inside the shadow root. `_recalculateBoardCoordinates` computes polygon geometry per hex using column configs, DPI scaling, and orientation; `_drawBoardCanvas` handles drawing order: board fill, squares (with coordinates, move highlights), legal move overlays, dragged piece, history animations, and pieces.
- Interaction:
  - Pointer events bound to window (down/move/up) drive state transitions; `_getSquareFromClick` determines hit-testing by checking each hex polygon for pointer coordinates.
  - Drag logic tracks `_draggedSquare` and pointer deltas to keep piece centered while moving.
  - Promotion overlay renders clickable hexes aligned to target column; `_handlePromotionClick` passes chosen piece back through state machine.
- Customization & UX:
  - Extensive CSS custom properties (base and `-light`/`-dark` overrides) control board colors, selection highlights, labels, move dots, and stroke colors. `colorScheme` attribute enforces `'light' | 'dark' | 'auto'`, with `prefers-color-scheme` listeners providing automatic theme switching.
  - Properties for player names, captured pieces visibility, hints, coordinates, and orientation allow integrators to tailor experience. `playerRole` enforces move permissions (white-only, black-only, analyzer, spectator) and `frozen` prevents interactions.
- Public API:
  - `export()` returns move list string; `fen()` outputs `TURN;FEN`.
  - `flip()`, `goBack()`/`goForward()` (via history state machine), `move(from,to)` for programmatic moves, `setMoves()`, `promote(piece)` with validation, `reset()`, and event pausing/resuming methods.
  - Assets for piece SVGs loaded lazily based on `PIECE_ASSET_URLS`, with redraw triggered upon load.

## Documentation Site Notes
- `docs-src/index.md` provides landing page with `<hexchess-board>` samples; ensure embedded scripts reference the ESM CDN with `?module`.
- `docs-src/install.md` covers npm vs CDN usage; align README snippets if installation instructions change.
- `docs-src/_README.md` explains Eleventy workflow; follow it when updating docs so GitHub Pages stays accurate.

## Tips for Future Agents
- When altering gameplay rules or board rendering, inspect `BoardStateMachine`, `Game`, `Board`, and related piece modules; ensure new logic stays deterministic because `hexchess-board.ts` assumes immutable board operations.
- Any change that affects attributes or public methods should also update type definitions (`*.d.ts`) and documentation.
- Keep canvas rendering performant: avoid allocations inside `_drawBoardCanvas` loops, respect `_scheduleRedraw`.
- If adding CSS properties or modifying default palette, update README and docs to describe customization hooks.
- Run `npm run build && npm run test` after major logic changes; `npm run docs` if docs or custom elements manifest is touched.
- Respect existing dark/light mode handling; when adding styles, provide fallbacks for base and themed custom properties.

