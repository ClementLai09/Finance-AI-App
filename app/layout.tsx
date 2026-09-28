import "./globals.css";
import { AppShell } from "./components/app-shell";

export const metadata = {
  title: "Finance AI App",
  description: "Personal finance tracking and analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
