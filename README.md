# Game of Life

Interactive [Conway’s Game of Life](https://conwaylife.com/wiki/Conway%27s_Game_of_Life) in the browser: a large canvas grid, playback controls, classic patterns, and optional toroidal edges.

Built with **Vue 3**, **Vite**, **TypeScript**, and **Pinia**. Core simulation logic lives in plain TS (`src/engine/`) with Vitest specs; the Pinia store manages grid buffers and UI-facing actions; rendering uses a 2D canvas.

## Features

- **Simulation:** Run / pause, single-step, clear; adjustable step interval (ms).
- **Topology:** Toggle toroidal (wrapping) vs finite grid edges.
- **Editing:** Paint or erase cells by dragging on the canvas.
- **Grid:** Resize the field (existing pattern can stay centered where possible).
- **Seeding:** Random fill by density; built-in named presets; paste **RLE** pattern text (LifeWiki-style).
- **Stagnation:** Optional auto-pause when population stops changing for N generations.

## Requirements

- **Node.js** `^20.19.0` or `>=22.12.0` (see `package.json` → `engines`).

## Scripts

```sh
npm install
npm run dev          # dev server + HMR
npm run build        # vue-tsc + production bundle
npm run preview      # serve production build locally
npm run test         # Vitest (engine unit tests)
npm run lint         # ESLint + oxlint
```

## Project layout

| Path | Role |
|------|------|
| `src/engine/` | Pure GoL stepping, helpers, RLE decode, presets — tested |
| `src/stores/gameOfLife.ts` | Grid double-buffer, mutations, playback/stagnation |
| `src/composables/useSimulationLoop.ts` | `requestAnimationFrame` timing loop |
| `src/components/LifeCanvas.vue` | Canvas drawing + pointer interaction |
| `src/components/game/` | Toolbar panels, HUD, layout chrome |

## IDE

[VS Code](https://code.visualstudio.com/) + [Vue — Official (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar). Type-checking uses `vue-tsc`, not plain `tsc`, so editors benefit from Volar for `.vue` types.

Configuration reference: [Vite config](https://vite.dev/config/).
