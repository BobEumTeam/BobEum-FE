import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "FoodBridge",
  description: "잉여 식품을 필요한 이웃과 연결하는 AI 매칭 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
