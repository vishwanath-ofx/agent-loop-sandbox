// Turns a title into a URL slug: "Hello World" -> "hello-world".
export function slugify(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z]+/g, "-")
		.replace(/^-|-$/g, "");
}
