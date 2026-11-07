#!/usr/bin/env node
// Minimal Linear client for the agent workflow.
//   pick            claim the oldest agent-ready issue in $LINEAR_PROJECT: swap its label to agent-working, print id= and identifier=
//   show <id>       print the issue as markdown
//   comment <id>    post stdin as a comment
const KEY = process.env.LINEAR_API_KEY;
const PROJECT = process.env.LINEAR_PROJECT ?? "Agent Loop Sandbox";
const TEAM = process.env.LINEAR_TEAM ?? "PLA";
if (!KEY) throw new Error("LINEAR_API_KEY is not set");

async function gql(query, variables = {}) {
	const res = await fetch("https://api.linear.app/graphql", {
		method: "POST",
		headers: { "content-type": "application/json", authorization: KEY },
		body: JSON.stringify({ query, variables }),
	});
	const json = await res.json();
	if (!res.ok || json.errors)
		throw new Error(
			`Linear API: ${res.status} ${JSON.stringify(json.errors ?? json)}`,
		);
	return json.data;
}

async function labelId(name) {
	const d = await gql(
		`query($name: String!, $team: String!) { issueLabels(filter: { name: { eq: $name }, team: { key: { eq: $team } } }) { nodes { id } } }`,
		{ name, team: TEAM },
	);
	const id = d.issueLabels.nodes[0]?.id;
	if (!id) throw new Error(`label ${name} not found in team ${TEAM}`);
	return id;
}

const [cmd, arg] = process.argv.slice(2);

if (cmd === "pick") {
	const d = await gql(
		`query($project: String!) {
			issues(first: 1, orderBy: createdAt, filter: {
				project: { name: { eq: $project } },
				labels: { name: { eq: "agent-ready" } },
				state: { type: { nin: ["completed", "canceled"] } }
			}) { nodes { id identifier } }
		}`,
		{ project: PROJECT },
	);
	const issue = d.issues.nodes[0];
	if (!issue) process.exit(0); // nothing to do: empty outputs skip the fix job
	const [ready, working] = await Promise.all([
		labelId("agent-ready"),
		labelId("agent-working"),
	]);
	await gql(
		`mutation($id: String!, $l: String!) { issueAddLabel(id: $id, labelId: $l) { success } }`,
		{ id: issue.id, l: working },
	);
	await gql(
		`mutation($id: String!, $l: String!) { issueRemoveLabel(id: $id, labelId: $l) { success } }`,
		{ id: issue.id, l: ready },
	);
	console.log(`id=${issue.id}\nidentifier=${issue.identifier}`);
} else if (cmd === "show") {
	const d = await gql(
		`query($id: String!) { issue(id: $id) { identifier title description } }`,
		{ id: arg },
	);
	const i = d.issue;
	console.log(`# ${i.identifier}: ${i.title}\n\n${i.description ?? ""}`);
} else if (cmd === "comment") {
	const chunks = [];
	for await (const c of process.stdin) chunks.push(c);
	await gql(
		`mutation($id: String!, $body: String!) { commentCreate(input: { issueId: $id, body: $body }) { success } }`,
		{
			id: arg,
			body: Buffer.concat(chunks).toString(),
		},
	);
} else {
	console.error("usage: linear.mjs pick | show <id> | comment <id> < body");
	process.exit(2);
}
