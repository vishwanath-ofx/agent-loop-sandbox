# agent-loop-sandbox

A toy repo for testing a Linear → Claude → PR → review loop end to end. Public, so keep issues toy-only: Actions logs are readable by anyone.

```
Linear issue moved to Todo (project "Agent Loop Sandbox"); the agent moves it In Progress -> Code Review -> Done, or Blocked
  → linear-agent.yml (every 15 min, or Run workflow)
  → Claude fixes it (/fix-linear-issue), file tools + pnpm checks only
  → PR opened, CI + gitleaks dispatched, result commented on the issue
  → main ruleset: required checks, resolved threads; src/ and test/ auto-merge, CODEOWNERS paths need a person
  → squash merge → deploy-prod.yml: tests on main, then deploy (no approval)
```

Secrets: `ANTHROPIC_API_KEY`, `LINEAR_API_KEY`. To go through Vercel AI Gateway instead of Anthropic, set the repo variable `ANTHROPIC_BASE_URL=https://ai-gateway.vercel.sh` and put the gateway key in `ANTHROPIC_API_KEY`.

Main requires signed commits. The agent commits through GitHub's API (`scripts/signed-commit.mjs`), which GitHub signs; a plain `git push` from a runner would be unsigned and unmergeable.
