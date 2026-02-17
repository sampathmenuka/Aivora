"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <button className="rounded border border-border px-3 py-1 text-sm">Theme</button>;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded border border-border px-3 py-1 text-sm hover:bg-muted"
    >
      {isDark ? "Light" : "Dark"}
    </button>
  );
}
