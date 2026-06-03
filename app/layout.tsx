import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shyc — Text to Component",
  description: "Create text-to-ui-component",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
