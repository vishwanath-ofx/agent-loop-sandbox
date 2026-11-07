import {
	createServer,
	type IncomingMessage,
	type ServerResponse,
} from "node:http";

export function handle(req: IncomingMessage, res: ServerResponse): void {
	const url = new URL(req.url ?? "/", "http://localhost");
	if (req.method === "GET" && url.pathname === "/") {
		res.writeHead(200, { "content-type": "text/plain" });
		res.end("hello");
		return;
	}
	res.writeHead(404, { "content-type": "text/plain" });
	res.end("not found");
}

if (import.meta.url === `file://${process.argv[1]}`) {
	createServer(handle).listen(Number(process.env.PORT ?? 3000));
}
