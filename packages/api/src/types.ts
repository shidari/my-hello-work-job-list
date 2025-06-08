import { Str } from "chanfana";
import type { Context } from "hono";
import { z } from "zod";

export type AppContext = Context<{ Bindings: Env }>;

export const JobDescription = z.object({
	companyName: Str(),
	jobTitle: Str(),
	employmentType: z.enum(["正社員", "パート"]),
	workPlace: Str(), // 任意の就業場所を文字列で入力
});
