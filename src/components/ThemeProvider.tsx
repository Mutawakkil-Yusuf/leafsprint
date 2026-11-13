"use client";

import { useEffect } from "react";
import { ensureProfile } from "@/lib/db";

/**
 * Applies the profile theme to <html data-theme>. light | night | system.
 * Other components dispatch "leafsprint-theme" after changing the profile.
 */
export function ThemeProvider() {
  useEffect(() => {
    const apply = async () => {
      const profile = await ensureProfile();
      const system = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "night"
        : "light";
      const theme = profile.theme === "system" ? system : profile.theme;
      document.documentElement.dataset.theme = theme;
    };
    void apply();

    const onSystemChange = (e: MediaQueryListEvent) => {
      void ensureProfile().then((profile) => {
        if (profile.theme === "system") {
          document.documentElement.dataset.theme = e.matches ? "night" : "light";
        }
      });
    };
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", onSystemChange);

    window.addEventListener("leafsprint-theme", apply);
    return () => {
      mq.removeEventListener("change", onSystemChange);
      window.removeEventListener("leafsprint-theme", apply);
    };
  }, []);
  return null;
}
