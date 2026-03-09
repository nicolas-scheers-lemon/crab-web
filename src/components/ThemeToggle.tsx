"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      return stored ? stored === "dark" : true;
    }
    return true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark((prev) => !prev)}
      className="fixed top-8 right-8 z-50 p-2 text-sm font-medium
        bg-sand-100 text-black dark:bg-black dark:text-white
        border border-sand-200 dark:border-white
        hover:bg-sand-200 dark:hover:bg-zinc-700
        transition-colors cursor-pointer"
      aria-label="Toggle dark mode"
    >
      {dark ? "🦀" : "🦑"}
    </button>
  );
}
