#!/usr/bin/env node
// Minimal Linear client for the agent workflow.
//   pick                 claim the oldest Todo issue in $LINEAR_PROJECT: move it to In Progress, print id= and identifier=
//   show <id>            print the issue as markdown
//   comment <id>         post stdin as a comment
//   status <id> <name>   move the issue to that workflow status (id may be an identifier like PLA-123)
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

async function setStatus(id, name) {
	const d = await gql(
		`query($id: String!, $name: String!, $team: String!) {
			issue(id: $id) { id }
			workflowStates(filter: { name: { eq: $name }, team: { key: { eq: $team } } }) { nodes { id } }
		}`,
		{ id, name, team: TEAM },
	);
	const stateId = d.workflowStates.nodes[0]?.id;
	if (!stateId) throw new Error(`status ${name} not found in team ${TEAM}`);
	await gql(
		`mutation($id: String!, $s: String!) { issueUpdate(id: $id, input: { stateId: $s }) { success } }`,
		{
			id: d.issue.id,
			s: stateId,
		},
	);
}

const [cmd, arg, arg2] = process.argv.slice(2);

if (cmd === "pick") {
	const d = await gql(
		`query($project: String!) {
			issues(first: 50, orderBy: createdAt, filter: {
				project: { name: { eq: $project } },
				state: { name: { eq: "Todo" } }
			}) { nodes { id identifier } }
		}`,
		{ project: PROJECT },
	);
	// Linear returns newest first; take the oldest so issues are worked in the order they were created.
	const issue = d.issues.nodes.at(-1);
	if (!issue) process.exit(0); // nothing to do: empty outputs skip the fix job
	await setStatus(issue.id, "In Progress");
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
} else if (cmd === "status") {
	await setStatus(arg, arg2);
} else {
	console.error(
		"usage: linear.mjs pick | show <id> | comment <id> < body | status <id> <name>",
	);
	process.exit(2);
}
