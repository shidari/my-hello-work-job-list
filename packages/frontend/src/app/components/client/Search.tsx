"use client";

import { safeParse } from "@/util";
import "./index.css";
export function Search() {
	return (
		<form
			className="search"
			onSubmit={(e) => {
				e.preventDefault();
				const formData = new FormData(e.currentTarget);
				const JSONBody = formData.get("JSONBody");
				if (!JSONBody) {
					alert("JSONBodyが空です");
					return;
				}
				const r = safeParse(JSONBody.toString());
				r.match(
					(v) => {
						fetch("/api/search", { method: "POST" })
							.then((res) => res.json())
							.then((data) => console.log(data));
					},
					(err) => {
						alert(err.message);
					},
				);
			}}
		>
			<div className="search-body">
				<label htmlFor="JSONBody">Body(JSON):</label>
				<textarea id="JSONBody" name="JSONBody" />
			</div>
			<input type="submit" value={"送信"} />
		</form>
	);
}
