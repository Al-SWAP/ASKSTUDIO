# Contributing to AskStudio

Thank you for your interest in contributing to AskStudio! This document explains how to set up your environment, the conventions we follow, and the process for submitting contributions.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Workspace Structure](#workspace-structure)
- [Development Workflow](#development-workflow)
- [Coding Conventions](#coding-conventions)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

---

## Code of Conduct

By participating in this project you agree to abide by our Code of Conduct: be respectful, constructive, and inclusive in all interactions.

---

## Getting Started

### Prerequisites

| Tool | Minimum Version |
|---|---|
| Node.js | 20.0.0 |
| pnpm | 9.0.0 |
| Git | any recent |

### Fork & Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/<your-username>/ASKSTUDIO.git
cd ASKSTUDIO

# Add the upstream remote
git remote add upstream https://github.com/Al-SWAP/ASKSTUDIO.git
```

### Install Dependencies

```bash
pnpm install
```

### Configure Environment

```bash
cp .env.example .env.local
# Edit .env.local with your RPC endpoints and other values
```

---

## Workspace Structure

AskStudio uses **pnpm workspaces** and **Turborepo**. Changes in one package are immediately visible to all apps that depend on it — no build step required for type-checking during development.

```
askstudio/
├── apps/          # Application targets (web, admin, dev, mobile, desktop)
├── packages/      # Shared libraries (config, web3, tokens, dex, ui)
├── program/       # Anchor on-chain program (Rust/Cargo)
└── docs/          # Documentation
```

Run commands across all packages with Turborepo:

```bash
pnpm build         # Build everything
pnpm type-check    # TypeScript type-check across workspace
pnpm lint          # Lint across workspace
pnpm dev           # Start all dev servers in parallel
```

Or target a specific package/app:

```bash
pnpm --filter @askstudio/dex       type-check
pnpm --filter @askstudio/web       dev
pnpm --filter @askstudio/admin     build
```

---

## Development Workflow

1. **Sync with upstream** before starting work:

   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch** from `main`:

   ```bash
   git checkout -b feat/your-feature-name
   # or for bug fixes:
   git checkout -b fix/short-description
   ```

3. **Make your changes.** Keep each PR focused on a single concern.

4. **Validate your changes** before opening a PR:

   ```bash
   pnpm type-check
   pnpm lint
   ```

5. **Commit** using the [Conventional Commits](#commit-messages) format.

6. **Push** and open a pull request against `main`.

---

## Coding Conventions

### TypeScript

- All code must be written in TypeScript with strict mode enabled.
- Prefer explicit return types on exported functions.
- Use `bigint` for token amounts and fee math (avoids floating-point precision loss with u64 values).
- Use `string` for `QuoteParams.amount` when passing amounts to the Jupiter API.

### Package Exports

- Each package uses `main: "./src/index.ts"` — no pre-build step is needed for type-checking.
- Export only public API from `src/index.ts`; keep implementation details internal.

### Shared Utilities

- Use `combineSignals()` from `@askstudio/web3` (re-exported by `@askstudio/tokens`) instead of `AbortSignal.any()` directly for cross-browser compatibility.
- Use `validatePublicKey()` from `@askstudio/web3` for Solana address validation.

### Next.js Apps

- Use `force-dynamic` export for routes that read live data.
- Admin routes call data functions directly (no HTTP fetch to self) for server-side rendering.
- Use the Zustand store in `apps/web/store` for client-side state.

### Styling

- Use TailwindCSS utility classes. Avoid inline styles.
- Follow the glass-morphism design language used in `apps/web`.

### Error Handling

- Never throw from async route handlers without catching — return appropriate HTTP status codes.
- Middleware must fail closed: return 401 when wallet whitelist is empty in production.

---

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short description>

[optional body]

[optional footer(s)]
```

**Types:**

| Type | When to use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Code change that is neither a fix nor a feature |
| `test` | Adding or updating tests |
| `chore` | Tooling, config, dependency updates |
| `perf` | Performance improvement |

**Scope** (optional): package or app name, e.g. `dex`, `web`, `admin`, `tokens`, `web3`, `program`.

**Examples:**

```
feat(dex): add fallback route retry on quote failure
fix(web3): handle timeout in rpc health check
docs: update README installation steps
chore(deps): upgrade next to 14.2.4
```

---

## Pull Request Process

1. Ensure `pnpm type-check` and `pnpm lint` both pass with no new errors.
2. Fill in the pull request template completely.
3. Keep PRs focused — one concern per PR makes review faster.
4. Reference any related issues using `Closes #<issue-number>` in the PR body.
5. Request review from at least one maintainer.
6. Address all review comments before the PR is merged.
7. PRs are merged with a **squash merge** to keep the history clean.

---

## Reporting Bugs

Open an issue using the **Bug Report** template and include:

- A clear, descriptive title.
- Steps to reproduce the bug.
- Expected behaviour vs. actual behaviour.
- Your environment (OS, Node version, browser/wallet).
- Any relevant error messages or screenshots.

---

## Requesting Features

Open an issue using the **Feature Request** template and include:

- A clear, descriptive title.
- The problem you want to solve (not just the solution).
- A proposed solution or API (if you have one).
- Any alternatives you've considered.

---

Thank you for contributing to AskStudio! 🙏
