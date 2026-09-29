"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { LogoutButton } from "./logout-button";

const sections = [
  { label: "Dashboard", href: "/" },
  { label: "Transactions", href: "/transactions" },
  { label: "Categories", href: "/categories" },
  { label: "Budgets", href: "/budgets" },
  { label: "Savings Goals", href: "/savings-goals" },
  { label: "AI Analysis", href: "/ai-analysis" },
];

function SectionNavigation({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className={mobile ? "flex gap-1" : "space-y-1"}>
      {sections.map((section) => {
        const isActive =
          section.href === "/"
            ? pathname === "/"
            : pathname.startsWith(section.href);

        return (
          <Link
            key={section.href}
            href={section.href}
            aria-current={isActive ? "page" : undefined}
            className={`${
              mobile
                ? "shrink-0 rounded-lg px-3 py-2 text-sm"
                : "block rounded-lg px-3 py-2.5 text-sm"
            } ${
              isActive
                ? "bg-emerald-50 font-semibold text-emerald-800"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({
  children,
  isAuthenticated,
}: {
  children: ReactNode;
  isAuthenticated: boolean;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 lg:flex">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white px-5 py-7 lg:flex lg:flex-col">
        <Link href="/" className="mb-10 px-3 text-lg font-bold tracking-tight">
          Finance AI
        </Link>
        {!isAuthPage && <SectionNavigation />}
        <p className="mt-auto px-3 pt-10 text-xs leading-5 text-slate-400">
          A simple space to understand your financial habits.
        </p>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
            <Link href="/" className="text-lg font-bold tracking-tight lg:hidden">
              Finance AI
            </Link>
            <p className="hidden text-sm font-medium text-slate-500 lg:block">
              {isAuthPage ? "Finance AI" : "Personal finance overview"}
            </p>
            <div className="flex items-center gap-3">
              {isAuthenticated && <LogoutButton />}
              {!isAuthPage && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                  Preview
                </span>
              )}
            </div>
          </div>
          {!isAuthPage && (
            <div className="overflow-x-auto border-t border-slate-100 px-3 py-2 lg:hidden">
              <SectionNavigation mobile />
            </div>
          )}
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
