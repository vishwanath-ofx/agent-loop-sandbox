import {
	createServer,
	type IncomingMessage,
	type ServerResponse,
} from "node:http";

const LANDING_PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Agent Loop Sandbox</title>
</head>
<body>
<h1>Agent Loop Sandbox</h1>
<p>A toy repo for testing the Linear → agent → PR → review loop.</p>
<h2>How the loop works</h2>
<p>Coming soon.</p>
</body>
</html>
`;

export function handle(req: IncomingMessage, res: ServerResponse): void {
	const url = new URL(req.url ?? "/", "http://localhost");
	if (req.method === "GET" && url.pathname === "/") {
		res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
		res.end(LANDING_PAGE);
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
	if (req.method === "GET" && url.pathname === "/time") {
		res.writeHead(200, { "content-type": "application/json" });
		res.end(JSON.stringify({ epochMs: Date.now() }));
		return;
	}
	res.writeHead(404, { "content-type": "text/plain" });
	res.end("not found");
}

if (import.meta.url === `file://${process.argv[1]}`) {
	createServer(handle).listen(Number(process.env.PORT ?? 3000));
}
