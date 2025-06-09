import { parseHTML } from "linkedom";
import { type Result, err, ok } from "neverthrow";
import type { ErrorMessage, Job } from "./type";

export const scrapeJobDescription: (html: string) => Result<Job, ErrorMessage> =
	(html: string) => {
		const jsdom = parseHTML(html);
		const doc = jsdom.window.document;
		const companyName = doc.querySelector("#ID_jgshMei")?.textContent;
		const jobTitle = doc.querySelector("#ID_sksu")?.textContent;
		const employmentType = doc.querySelector("#ID_kjKbn")?.textContent;
		const workPlace = doc.querySelector("#ID_shgBsJusho")?.textContent;
		if (!jobTitle) return err("not found jobTitle");
		if (!companyName) return err("not found companyName");
		if (!employmentType) return err("not found employmentType");
		if (!workPlace) return err("not found workplace");

		return ok({ companyName, jobTitle, employmentType, workPlace });
	};
