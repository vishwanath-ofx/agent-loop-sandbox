# AGENTS.md

Instructions for coding agents in this repo. It's a toy sandbox for testing the Linear → agent → PR → review loop.

## Commands

Node 26, pnpm 12.4.1.

```sh
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

`pnpm lint:fix` formats and fixes lint. Tests are Vitest, in `test/`.

## Conventions

- Match the code around you. Comments say why, not what.
- Every behavior change comes with a test that fails without it.
- Keep the diff to what the issue asks. No drive-by refactors.
- Don't touch `.github/`, `.claude/`, `scripts/`, `package.json` or the lockfile unless the issue is explicitly about them.
