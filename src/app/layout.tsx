import type { Metadata } from "next";
import '@fontsource-variable/inter';
import '@fontsource/dm-serif-display';
import "./globals.css";

export const metadata: Metadata = {
  title: "CertifiCat",
  description: "The Certificat Cat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-inter antialiased bg-neutral-50 dark:bg-neutral-950`}>{children}</body>
    </html>
  );
}
