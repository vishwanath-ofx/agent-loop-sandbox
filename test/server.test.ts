import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, expect, it } from "vitest";
import { handle } from "../src/server.js";

const server = createServer(handle);
let base = "";

beforeAll(async () => {
	await new Promise<void>((resolve) => server.listen(0, resolve));
	base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
afterAll(() => server.close());

it("serves the landing page on /", async () => {
	const res = await fetch(`${base}/`);
	expect(res.status).toBe(200);
	expect(res.headers.get("content-type")).toBe("text/html; charset=utf-8");
	expect(await res.text()).toContain("How the loop works");
});

it("answers ok JSON on /health", async () => {
	const res = await fetch(`${base}/health`);
	expect(res.status).toBe(200);
	expect(res.headers.get("content-type")).toBe("application/json");
	expect(await res.json()).toEqual({ ok: true });
});

it("answers the version JSON on /version", async () => {
	const res = await fetch(`${base}/version`);
	expect(res.status).toBe(200);
	expect(res.headers.get("content-type")).toBe("application/json");
	expect(await res.json()).toEqual({ version: "0.1.0" });
});

it("404s unknown paths", async () => {
	expect((await fetch(`${base}/nope`)).status).toBe(404);
});
