import "./index.css";
export function FlexN({
	n,
	children,
}: Readonly<{
	n: number;
	children: React.ReactNode;
}>) {
	// 全部外部cssに統一したいけど、後回し
	return <div style={{ flex: n, minHeight: 0 }}>{children}</div>;
}
