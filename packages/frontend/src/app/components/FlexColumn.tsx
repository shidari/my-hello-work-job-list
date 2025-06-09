import "./index.css";
export function FlexColumn({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <div className="flex-column">{children}</div>;
}
