import { Effect } from "effect";
import type { Browser } from "playwright";
import { NewPageError } from "../error";

export function createPage(browser: Browser) {
	return Effect.tryPromise({
		try: () => browser.newPage(),
		catch: (e) =>
			new NewPageError({ message: `unexpected error.\n${String(e)}` }),
	});
}
