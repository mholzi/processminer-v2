import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Processminer — Process Documentation",
  description: "AI-native process documentation with per-heading provenance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
