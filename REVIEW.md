# REVIEW.md

What matters when reviewing this repo.

- Failure here looks like: a route that answers wrong, or a test that passes without proving the change.
- Ask for a file and line as evidence, never a guess from a name.
- Flag any change to `.github/`, `.claude/` or `scripts/` from an agent PR: agents aren't meant to edit those.
- At most 3 nits per PR. Skip formatting (biome owns it).
- Start the summary with a count of findings. Say plainly when there's nothing to fix.
