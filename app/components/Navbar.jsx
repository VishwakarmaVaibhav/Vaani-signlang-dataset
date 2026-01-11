"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { translations } from "../lib/translations";
import ThemeSwitcher from "./ThemeSwitcher";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const [lang, setLang] = useState("en");
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLang(localStorage.getItem("lang") || "en");
  }, []);

  if (!mounted) return null;

  const t = translations[lang] || translations.en;

  return (
    <nav className="fixed top-6 inset-x-0 z-[100] px-4 sm:px-8">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-2.5 rounded-2xl bg-[var(--bg)]/70 backdrop-blur-2xl border border-[var(--border)] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-500">
        
        {/* LEFT: VAIBHAV'S IDENTITY & LOGO */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-xl shadow-lg flex items-center justify-center transform group-hover:rotate-12 transition-all duration-300">
               <span className="text-white font-black text-xl italic">V</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lr font-black text-[var(--text)] leading-none tracking-tight uppercase italic">
              {t.appName}
              </h1>
              
            </div>
          </Link>

        </div>

        {/* CENTER/RIGHT: LINKS & SETTINGS */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Social Links - Premium Tile Style */}
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
              className="px-4 py-2 rounded-xl bg-[var(--text)] text-[var(--bg)] font-black text-[10px] uppercase tracking-tighter hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              Connect
            </a>
          </div>

          {/* Settings Toggle */}
          <div className="relative">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${
                isOpen 
                  ? 'bg-[var(--text)] text-[var(--bg)] shadow-inner' 
                  : 'hover:bg-[var(--card)] text-[var(--text)]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 12h9.75M10.5 18h9.75M3 6h3m-3 12h3m0-6h-3" />
              </svg>
              <span className="hidden md:block text-xs font-black uppercase tracking-tighter">{t.language}</span>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-64 p-5 rounded-[2rem] bg-[var(--card)] border border-[var(--border)] shadow-2xl z-[110]"
                >
                  <div className="space-y-6">
                    <LanguageSwitcher />
                    <div className="h-[1px] bg-[var(--border)]" />
                    <ThemeSwitcher />
                    
                    {/* Project Starter acknowledgement */}
                    <div className="pt-2">
                       <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Contributors</p>
                       <div className="flex -space-x-2">
                          {[1,2,3].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-[var(--card)] bg-gradient-to-tr from-blue-400 to-indigo-600" />
                          ))}
                          <div className="w-6 h-6 rounded-full border-2 border-[var(--card)] bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-[8px] font-bold">+12</div>
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