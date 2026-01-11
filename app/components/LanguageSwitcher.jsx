"use client";
import { useEffect, useState } from "react";

export default function LanguageSwitcher() {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    setLang(localStorage.getItem("lang") || "en");
  }, []);

  const languages = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी" },
    { code: "mr", label: "मराठी" },
  ];

  const handleChange = (code) => {
    localStorage.setItem("lang", code);
    setLang(code);
    window.location.reload();
  };

  return (
    <select
      value={lang}
      onChange={(e) => handleChange(e.target.value)}
      className="px-3 py-1 bg-[var(--card)] border border-[var(--border)] rounded text-[var(--text)] hover:bg-[var(--bg)] transition"
    >
      {languages.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  );
}
