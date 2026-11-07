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

it("answers hello on /", async () => {
	const res = await fetch(`${base}/`);
	expect(res.status).toBe(200);
	expect(await res.text()).toBe("hello");
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

it("answers the current time on /time", async () => {
	const res = await fetch(`${base}/time`);
	expect(res.status).toBe(200);
	expect(res.headers.get("content-type")).toBe("application/json");
	const body = (await res.json()) as { epochMs: unknown };
	expect(typeof body.epochMs).toBe("number");
	expect(Math.abs((body.epochMs as number) - Date.now())).toBeLessThan(5000);
});

it("404s unknown paths", async () => {
	expect((await fetch(`${base}/nope`)).status).toBe(404);
});
