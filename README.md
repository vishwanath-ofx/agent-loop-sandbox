# agent-loop-sandbox

A toy repo for testing a Linear → Claude → PR → review loop end to end. Public, so keep issues toy-only: Actions logs are readable by anyone.

```
Linear issue labeled agent-ready (project "Agent Loop Sandbox")
  → linear-agent.yml (every 15 min, or Run workflow)
  → Claude fixes it (/fix-linear-issue), file tools + pnpm checks only
  → PR opened, CI + gitleaks dispatched, result commented on the issue
  → main ruleset: required checks, code owner review, resolved threads
  → squash merge → deploy-prod.yml (needs the production reviewer)
```

Secrets: `ANTHROPIC_API_KEY`, `LINEAR_API_KEY`. To go through Vercel AI Gateway instead of Anthropic, set the repo variable `ANTHROPIC_BASE_URL=https://ai-gateway.vercel.sh` and put the gateway key in `ANTHROPIC_API_KEY`.

Merge agent PRs with **squash**: main requires signed commits, and the agent's commits aren't signed.
