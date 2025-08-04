"use client";
import { useRouter } from "next/navigation";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };
  return (
    <div>
      <button type="button" onClick={handleBack}>
        戻る
      </button>
      <div>{children}</div>
    </div>
  );
}
