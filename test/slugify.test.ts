import { expect, it } from "vitest";
import { slugify } from "../src/slugify.js";

it("lowercases and joins words with dashes", () => {
	expect(slugify("Hello World")).toBe("hello-world");
});

it("trims leading and trailing separators", () => {
	expect(slugify("  --Hi there!  ")).toBe("hi-there");
});
