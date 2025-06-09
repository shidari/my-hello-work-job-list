// 関数をtsxで動かすためだけ

import { scrapeJobDescription } from "./scraper";
import { fetchHTML } from "./util";

async function main() {
	const url =
		"https://www.hellowork.mhlw.go.jp/kensaku/GECA110010.do?screenId=GECA110010&action=dispDetailBtn&kJNo=0101022679151&kJKbn=1&jGSHNo=0Zg%2FbCxKtXqpa7DTzggfbQ%3D%3D&fullPart=2&iNFTeikyoRiyoDtiID=&kSNo=&newArrived=&tatZngy=1&shogaiKbn=0";
	const result = (await fetchHTML(url)).andThen(scrapeJobDescription);

	if (result.isOk()) {
		console.dir(result.value, { depth: null });
	} else {
		console.log("エラー");
	}
}

main();
