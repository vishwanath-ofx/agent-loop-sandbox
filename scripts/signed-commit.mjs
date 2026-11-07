#!/usr/bin/env node
// Commits the staged changes to a new branch through GitHub's createCommitOnBranch API, so GitHub signs the commit
// (main requires verified signatures, and a plain `git push` from the runner is unsigned).
//   node scripts/signed-commit.mjs <branch> <message>     env: GH_TOKEN, GITHUB_REPOSITORY, GITHUB_SHA
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

// Parses `git diff --cached --name-status -z --no-renames` into createCommitOnBranch fileChanges.
export function fileChanges(nameStatusZ, read = (p) => readFileSync(p)) {
	const parts = nameStatusZ.split("\0").filter(Boolean);
	const additions = [];
	const deletions = [];
	for (let i = 0; i < parts.length; i += 2) {
		const [status, path] = [parts[i], parts[i + 1]];
		if (status === "D") deletions.push({ path });
		else
			additions.push({
				path,
				contents: Buffer.from(read(path)).toString("base64"),
			});
	}
	return { additions, deletions };
}

async function gh(path, body) {
	const res = await fetch(`https://api.github.com${path}`, {
		method: "POST",
		headers: {
			authorization: `Bearer ${process.env.GH_TOKEN}`,
			"content-type": "application/json",
		},
		body: JSON.stringify(body),
	});
	const json = await res.json();
	if (!res.ok || json.errors)
		throw new Error(
			`GitHub API ${path}: ${res.status} ${JSON.stringify(json.errors ?? json)}`,
		);
	return json;
}

if (import.meta.main) {
	const [branch, message] = process.argv.slice(2);
	const { GITHUB_REPOSITORY: repo, GITHUB_SHA: base } = process.env;
	const changes = fileChanges(
		execFileSync(
			"git",
			["diff", "--cached", "--name-status", "-z", "--no-renames"],
			{ encoding: "utf8" },
		),
	);
	await gh(`/repos/${repo}/git/refs`, {
		ref: `refs/heads/${branch}`,
		sha: base,
	});
	const out = await gh("/graphql", {
		query: `mutation($input: CreateCommitOnBranchInput!) { createCommitOnBranch(input: $input) { commit { oid } } }`,
		variables: {
			input: {
				branch: { repositoryNameWithOwner: repo, branchName: branch },
				expectedHeadOid: base,
				message: { headline: message },
				fileChanges: changes,
			},
		},
	});
	console.log(out.data.createCommitOnBranch.commit.oid);
}
