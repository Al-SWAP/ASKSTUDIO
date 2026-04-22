# Screenshots

This directory contains UI/UX screenshots of the AskStudio applications.

## Current Screenshots

| Filename | App | Screen |
|---|---|---|
| `swap-interface.svg` | `apps/web` | Main swap card with token inputs, route info, and slippage control |
| `token-selector.svg` | `apps/web` | Token selector modal with search and source badges |
| `swap-confirmed.svg` | `apps/web` | Swap card after a successful transaction with Solscan link |
| `admin-dashboard.svg` | `apps/admin` | Admin dashboard — fee config + RPC health overview |
| `admin-analytics.svg` | `apps/admin` | Analytics page — stat cards + recent swaps table |
| `admin-rpc.svg` | `apps/admin` | RPC Health Monitor — endpoint status + latency + pin control |
| `admin-tokens.svg` | `apps/admin` | Token Management — blacklist view + add/remove form |
| `dev-tools.svg` | `apps/dev` | Developer tools home — tool grid + terminal |

## Naming Convention

Screenshots should be named descriptively using lowercase and hyphens:

```
<app>-<screen-or-feature>.svg
```

## Adding Real Screenshots

To replace the SVG mockups with real browser screenshots:

1. Run `pnpm dev` to start the development servers.
2. Navigate to the relevant screen in your browser.
3. Take a screenshot at **1280×800** resolution.
4. Save as a `.png` file (e.g. `swap-interface.png`).
5. Update the `README.md` references from `.svg` to `.png`.

## Mobile Screenshots

For mobile screenshots, use an iOS or Android simulator and export at **390×844** (iPhone 14) or **360×800** (Android).

Name them:

```
mobile-swap-screen.png
mobile-wallet-connect.png
```
