import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meridian Advisors AI — M365 Intelligence Platform",
  description:
    "AI-powered workspace for Meridian Advisors. Draft documents, compose emails, search institutional knowledge — all connected to Microsoft 365.",
  keywords: ["real estate", "AI", "Microsoft 365", "advisory", "knowledge base"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
