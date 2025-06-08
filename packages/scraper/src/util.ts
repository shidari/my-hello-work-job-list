import { type Result, err, ok } from "neverthrow";
import type { ErrorMessage } from "./type";

export const fetchHTML: (url: string) => Promise<Result<string, ErrorMessage>> =
	async (url: string) => {
		try {
			new URL(url);
		} catch {
			return err(`URL Error: url=${url}`);
		}
		try {
			const res = await fetch(url);
			if (!res.ok) {
				return err("fetch failed error");
			}
			const html = await res.text();
			return ok(html);
		} catch {
			return err("fetch unknown error");
		}
	};
