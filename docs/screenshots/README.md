# Screenshots

This directory contains UI/UX screenshots of the AskStudio applications.

## Naming Convention

Screenshots should be named descriptively using lowercase and hyphens:

```
<app>-<screen-or-feature>.png
```

## Required Screenshots

The following screenshots are referenced in the root [`README.md`](../../README.md):

| Filename | App | Description |
|---|---|---|
| `swap-interface.png` | `apps/web` | Main swap card with token inputs and quote |
| `route-details.png` | `apps/web` | Expanded route information panel |
| `token-selector.png` | `apps/web` | Token selector modal with search |
| `admin-dashboard.png` | `apps/admin` | Admin dashboard showing fee config and RPC health |
| `dev-tools.png` | `apps/dev` | Developer tools page |

## Adding Screenshots

1. Run the application locally (`pnpm dev`).
2. Navigate to the relevant screen.
3. Take a screenshot at **1280×800** resolution (or higher) in light or dark mode.
4. Save as a `.png` file using the naming convention above.
5. Place the file in this directory.
6. Commit the file and open a pull request.

## Mobile Screenshots

For mobile screenshots, use an iOS or Android simulator and export at **390×844** (iPhone 14) or **360×800** (Android).

Name them:

```
mobile-swap-screen.png
mobile-wallet-connect.png
```
