"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="flex items-center justify-start gap-3 w-full p-2.5 rounded-md text-xs font-sans font-semibold transition-all text-neutral-500 hover:bg-neutral-250/20 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/30 dark:hover:text-neutral-100"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <>
          <Sun className="h-5 w-5 text-amber-500 shrink-0" />
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="h-5 w-5 text-indigo-500 shrink-0" />
          <span>Dark Mode</span>
        </>
      )}
    </button>
  );
}
