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
    const root = document.documentElement;
    
    if (mode === "system") {
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.setAttribute("data-theme", systemPrefersDark ? "dark" : "light");
    } else {
      // This simple line handles 'light', 'dark', 'earthy', 'cyber', 'sunset' automatically
      root.setAttribute("data-theme", mode);
    }
  };

  const handleThemeChange = (mode) => {
    setTheme(mode);
    localStorage.setItem("theme", mode);
    applyTheme(mode);
  };

  return (
    <div className="flex flex-col gap-2 text-[var(--text)]">
      <label className="font-bold text-xs uppercase tracking-wider opacity-60">
        Appearance
      </label>

      <div className="relative">
        <select
          value={theme}
          onChange={(e) => handleThemeChange(e.target.value)}
          className="w-full appearance-none px-4 py-3 rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--text)] font-medium focus:ring-2 focus:ring-[var(--primary)] focus:outline-none transition-all cursor-pointer shadow-sm"
        >
          <option value="system">💻 System Default</option>
          <option value="light">☀️ Light Mode</option>
          <option value="dark">🌑 Dark Mode</option>
          <option value="earthy">🌿 Earthy Theme</option>
          <option value="cyber">🔮 Cyberpunk</option>
          <option value="sunset">🌅 Sunset Retro</option>
        </select>
        
        {/* Custom Arrow Icon for nicer UI */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text)] opacity-50">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
    </div>
  );
}