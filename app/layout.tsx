import "./globals.css";
import type { Metadata, Viewport } from "next";
import { AppShell } from "./components/app-shell";
import { createClient } from "../lib/supabase/server";

export const metadata: Metadata = {
  title: "Finance AI App",
  description: "Personal finance tracking and analysis",
  applicationName: "Finance AI App",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Finance AI",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#047857",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  return (
    <html lang="en">
      <body>
        <AppShell isAuthenticated={Boolean(data?.claims)}>{children}</AppShell>
      </body>
    </html>
  );
}
