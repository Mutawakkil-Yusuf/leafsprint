"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { unlockAudio } from "@/lib/sounds";
import { IconBranch, IconFlag, IconShelf, IconSprout } from "./icons";

const TABS = [
  { href: "/", label: "Today", icon: IconSprout },
  { href: "/shelf", label: "Shelf", icon: IconShelf },
  { href: "/garden", label: "Garden", icon: IconBranch },
  { href: "/sprints", label: "Sprints", icon: IconFlag },
];

function TabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center pointer-events-none"
    >
      <div className="pointer-events-auto m-3 safe-b">
        <div className="flex items-center gap-1 rounded-full border border-line bg-card/95 p-1.5 shadow-[0_10px_30px_-12px_rgba(35,31,24,0.25)] backdrop-blur">
          {TABS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-[15px] transition-colors duration-200 ${
                  active
                    ? "bg-leaf text-paper"
                    : "text-muted hover:text-ink"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span className={active ? "font-semibold" : ""}>{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

/** Chrome for tabbed pages (the reader renders full-bleed, outside this). */
export function AppChrome({ children }: { children: React.ReactNode }) {
  // browsers only allow audio after a gesture — unlock on the first one
  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex-1 px-5 pt-6 pb-28 md:px-8">{children}</main>
      <TabBar />
    </div>
  );
}
