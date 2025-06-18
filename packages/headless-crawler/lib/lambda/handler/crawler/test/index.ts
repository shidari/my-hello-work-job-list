import { Effect } from "effect";
import { runnable } from "..";

async function main() {
	Effect.runPromise(runnable).then((jobNumbers) =>
		console.dir({ jobNumbers }, { depth: null }),
	);
}

main();
