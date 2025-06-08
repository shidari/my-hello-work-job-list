import type { Metadata } from "next";
import "./globals.css";
import { Container } from "./components/Container";
export const metadata: Metadata = {
	title: "ハローワーククローラー",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja">
			<body>
				{/* mainをここに入れるかどうか */}
				<Container>{children}</Container>
			</body>
		</html>
	);
}
