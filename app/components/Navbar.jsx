"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { translations } from "../lib/translations";
import ThemeSwitcher from "./ThemeSwitcher";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const [lang, setLang] = useState("en");
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef(null); // Ref for the dropdown

  useEffect(() => {
    setMounted(true);
    setLang(localStorage.getItem("lang") || "en");

    // Click Outside Logic
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) return null;

  const t = translations[lang] || translations.en;

  return (
    <nav className="fixed top-4 inset-x-0 z-[100] px-4 pointer-events-none">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-3 rounded-3xl bg-[var(--bg)]/80 backdrop-blur-xl border border-[var(--border)] shadow-lg pointer-events-auto transition-all duration-500">
        
        {/* LEFT: IDENTITY (Now visible on mobile) */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-xl shadow-lg flex items-center justify-center overflow-hidden transform group-hover:rotate-12 transition-all duration-300">
             <span className="text-white font-black text-xl italic z-10">V</span>
             {/* Shine effect */}
             <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </div>
          
          <div className="flex flex-col">
            {/* Removed 'hidden sm:block' so it shows on mobile */}
            <h1 className="text-lg md:text-xl font-black text-[var(--text)] leading-none tracking-tighter uppercase italic">
              {t.appName}
            </h1>
            <span className="text-[10px] font-bold text-[var(--text)] opacity-50 tracking-widest uppercase">
              Research Labs
            </span>
          </div>
        </Link>

        {/* RIGHT: CONTROLS */}
        <div className="flex items-center gap-3" ref={menuRef}>
          
          {/* Desktop Socials (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-2 border-r border-[var(--border)] pr-4 mr-2">
            <a 
              href="https://github.com/VishwakarmaVaibhav" 
              target="_blank" 
              className="p-2 rounded-xl text-[var(--text)] opacity-60 hover:opacity-100 hover:bg-[var(--card)] transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
            <a 
              href="https://www.linkedin.com/in/vishwakarmavaibhav/" 
              target="_blank" 
              className="px-4 py-2 rounded-xl bg-[var(--text)] text-[var(--bg)] font-black text-[10px] uppercase tracking-wide hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              Connect
            </a>
          </div>

          {/* Menu Toggle Button */}
          <div className="relative">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className={`flex items-center justify-center w-10 h-10 md:w-auto md:h-auto md:px-3 md:py-2 rounded-xl transition-all duration-300 ${
                isOpen 
                  ? 'bg-[var(--text)] text-[var(--bg)]' 
                  : 'hover:bg-[var(--card)] text-[var(--text)]'
              }`}
            >
              {/* Icon Animation: Hamburger <-> Close */}
              <div className="relative w-5 h-5 flex flex-col justify-center items-center gap-[5px]">
                <motion.span 
                  animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 5 : 0 }} 
                  className={`w-5 h-[2px] rounded-full transition-colors ${isOpen ? 'bg-[var(--bg)]' : 'bg-[var(--text)]'}`} 
                />
                <motion.span 
                  animate={{ opacity: isOpen ? 0 : 1 }} 
                  className="w-5 h-[2px] bg-[var(--text)] rounded-full" 
                />
                <motion.span 
                  animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -5 : 0 }} 
                  className={`w-5 h-[2px] rounded-full transition-colors ${isOpen ? 'bg-[var(--bg)]' : 'bg-[var(--text)]'}`} 
                />
              </div>
              
              <span className="hidden md:block ml-2 text-xs font-black uppercase tracking-wide">
                {isOpen ? 'Close' : 'Menu'}
              </span>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-72 p-1 rounded-[2.5rem] bg-[var(--card)] border border-[var(--border)] shadow-2xl z-[110] overflow-hidden"
                >
                  <div className="p-5 space-y-6">
                    <div className="space-y-4">
                      <LanguageSwitcher />
                      <ThemeSwitcher />
                    </div>

                    {/* Mobile Only: Social Links (Since they are hidden on top) */}
                    <div className="md:hidden pt-6 border-t border-[var(--border)]">
                      <p className="text-[10px] font-bold text-[var(--text)] opacity-40 uppercase tracking-widest mb-3">
                        Connect with me
                      </p>
                      <div className="flex gap-2">
                        <a 
                          href="https://github.com/VishwakarmaVaibhav" 
                          target="_blank"
                          className="flex-1 py-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] font-bold text-center hover:bg-[var(--border)] transition-all"
                        >
                          GitHub
                        </a>
                        <a 
                          href="https://www.linkedin.com/in/vishwakarmavaibhav/" 
                          target="_blank"
                          className="flex-1 py-3 rounded-xl bg-[var(--text)] text-[var(--bg)] font-bold text-center hover:opacity-90 transition-all"
                        >
                          LinkedIn
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
}