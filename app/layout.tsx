import "./globals.css";
import { AppShell } from "./components/app-shell";
import { createClient } from "../lib/supabase/server";

export const metadata = {
  title: "Finance AI App",
  description: "Personal finance tracking and analysis",
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
