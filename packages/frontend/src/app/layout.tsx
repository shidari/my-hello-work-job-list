import type { Metadata } from "next";
export const metadata: Metadata = {
	title: "ハローワーククローラー",
};

export default function RootLayout({
	children,
	modal,
}: Readonly<{
	children: React.ReactNode;
	modal: React.ReactNode;
}>) {
	return (
		<html lang="ja">
			<body style={{ height: "100vh", margin: "0" }}>
				{/* mainをここに入れるかどうか */}
				{children}
				{modal}
				<div id="modal-root" />
			</body>
		</html>
	);
}
