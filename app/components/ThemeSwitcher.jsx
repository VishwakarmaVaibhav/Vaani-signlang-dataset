"use client";

import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState("system");

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "system";
    setTheme(saved);
    applyTheme(saved);
  }, []);

  const applyTheme = (mode) => {
    if (mode === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } 
    else if (mode === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } 
    else if (mode === "earthy") {
      document.documentElement.setAttribute("data-theme", "earthy");
    }
    else {
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.setAttribute(
        "data-theme",
        systemPrefersDark ? "dark" : "light"
      );
    }
  };

  const handleThemeChange = (mode) => {
    setTheme(mode);
    localStorage.setItem("theme", mode);
    applyTheme(mode);
  };

  return (
    <div className="flex flex-col gap-1 text-[var(--text)]">
      <label className="font-semibold text-sm">Theme</label>

      <select
        value={theme}
        onChange={(e) => handleThemeChange(e.target.value)}
        className="px-3 py-2 rounded bg-[var(--card)] border border-[var(--border)]"
      >
        <option value="system">System Default</option>
        <option value="light">Light Mode</option>
        <option value="dark">Dark Mode</option>
        <option value="earthy">Earthy Theme 🌿</option>
      </select>
    </div>
  );
}
