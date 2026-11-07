import {
	createServer,
	type IncomingMessage,
	type ServerResponse,
} from "node:http";

const landingPage = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>agent-loop-sandbox</title>
</head>
<body>
<h1>agent-loop-sandbox</h1>
<p>A toy repo for testing an issue → agent → PR → review loop end to end.</p>
<h2>How the loop works</h2>
<ol>
<li>An issue is filed (in Linear, or on GitHub with the <code>agent</code> label).</li>
<li>The agent reads the issue, makes the smallest fix, and adds a test.</li>
<li>A pull request is opened and CI runs.</li>
<li>Review and required checks gate the merge; then it deploys.</li>
</ol>
</body>
</html>
`;

export function handle(req: IncomingMessage, res: ServerResponse): void {
	const url = new URL(req.url ?? "/", "http://localhost");
	if (req.method === "GET" && url.pathname === "/") {
		res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
		res.end(landingPage);
		return;
	}
	if (req.method === "GET" && url.pathname === "/health") {
		res.writeHead(200, { "content-type": "application/json" });
		res.end(JSON.stringify({ ok: true }));
		return;
	}
	if (req.method === "GET" && url.pathname === "/version") {
		res.writeHead(200, { "content-type": "application/json" });
		res.end(JSON.stringify({ version: "0.1.0" }));
		return;
	}
	res.writeHead(404, { "content-type": "text/plain" });
	res.end("not found");
}

if (import.meta.url === `file://${process.argv[1]}`) {
	createServer(handle).listen(Number(process.env.PORT ?? 3000));
}
