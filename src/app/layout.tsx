import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Processminer v2 — Process Documentation",
  description: "AI-native banking process documentation (Deutsche Bank internal)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
