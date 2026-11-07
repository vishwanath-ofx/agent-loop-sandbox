import { expect, it } from "vitest";
// @ts-expect-error plain .mjs script, no types
import { fileChanges } from "../scripts/signed-commit.mjs";

it("maps git name-status to additions and deletions", () => {
	const out = fileChanges(
		"M\0src/a.ts\0A\0test/b.ts\0D\0old.ts\0",
		(p: string) => `content of ${p}`,
	);
	expect(out.deletions).toEqual([{ path: "old.ts" }]);
	expect(out.additions).toEqual([
		{
			path: "src/a.ts",
			contents: Buffer.from("content of src/a.ts").toString("base64"),
		},
		{
			path: "test/b.ts",
			contents: Buffer.from("content of test/b.ts").toString("base64"),
		},
	]);
});
