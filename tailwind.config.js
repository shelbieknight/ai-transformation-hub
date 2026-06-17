# AI Transformation Hub

A concept prototype of an **AI transformation operating system** for a marketing org. It models how a single owner would run the function's AI program end to end: capturing requests, prioritizing them, shipping agents, and driving adoption, with governance and value reporting built in.

Built by Shelbie Knight as a portfolio piece. **All data in the app is illustrative sample data**, names, numbers, and agents are invented to demonstrate the system, not to report real results.

## What it demonstrates

- **Intake** — anyone in marketing can surface a pain point, idea, or request, with the discovery source captured.
- **Triage** — score open requests with a prioritization method you can switch by context (RICE, ICE, Value/Effort, WSJF, MoSCoW). A strategic override (sponsor ask, compliance, security, unblocks others) and a 100x flag pin items above any score, because judgment sits above the framework.
- **Pipeline** — track initiatives across their lifecycle: Backlog, Prototyping, Live, Sunset.
- **Agent fleet** — every shipped agent, tracked for **production readiness** across the lifecycle (context, guardrails, cost/latency limits, fallback, human-in-the-loop, monitoring), not just whether it launched.
- **Champions** — a peer network with explicit team coverage.
- **Employee leaderboard** — adoption turned into recognition, with tool use synced automatically and other activity logged manually.
- **Executive summary** — value delivered, adoption, and governance health, with transparent, editable assumptions behind every number.

## Run locally

Requires Node 18+.

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

## Build

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build locally
```

## Deploy to GitHub Pages

`vite.config.js` uses `base: "./"` (relative paths), so the build works from any project-site subpath without hardcoding the repo name.

Quickest path:

1. `npm run build`
2. Publish the `dist/` folder to a `gh-pages` branch. A common one-liner using the `gh-pages` package:
   ```bash
   npm install --save-dev gh-pages
   npx gh-pages -d dist
   ```
3. In the repo's **Settings → Pages**, set the source to the `gh-pages` branch.

It also deploys cleanly to Vercel or Netlify with zero config (build command `npm run build`, output `dist`).

## Persistence

Your edits are saved to the browser's `localStorage` only (no backend). Use **Reset to sample data** on the Executive summary to restore the original state. The same component also runs as a Claude artifact, where it transparently uses that runtime's storage instead.

## Tech

React 18, Vite, Tailwind CSS, lucide-react. Single-component app in `src/App.jsx`.
