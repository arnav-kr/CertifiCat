import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource/dm-serif-display";
import "@/app/globals.css";
import { AuthProvider } from "@/providers/AuthContext";

export const metadata: Metadata = {
  title: "Admin Dashbaord",
  description: "The Certificat Cat Admin Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="en">
        <body
          className={`font-inter antialiased bg-neutral-50 dark:bg-neutral-950`}
        >
          {children}
        </body>
      </html>
    </AuthProvider>
  );
}
