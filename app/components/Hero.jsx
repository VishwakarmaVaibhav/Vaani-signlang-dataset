"use client";
import { useRef, useState, useLayoutEffect, useEffect } from "react";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";
import { translations } from "../lib/translations";
import LiveStats from "./LiveStats";

export default function Hero() {
  const router = useRouter();
  const [lang, setLang] = useState("en");
  const [mounted, setMounted] = useState(false);
  const cardRef = useRef(null);
  const handRef = useRef(null);

  useEffect(() => {
    setLang(localStorage.getItem("lang") || "en");
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!mounted) return;

    let ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.from(cardRef.current, {
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
      })
      .from(".hero-text", {
        y: 20,
        opacity: 0,
        stagger: 0.25,
        duration: 0.9,
        clearProps: "opacity,y" 
      }, "-=0.6")
      .from(handRef.current, {
        scale: 0.5,
        rotate: -20,
        opacity: 0,
        duration: 1,
        ease: "back.out(1.7)",
      }, "-=0.4");
    }, cardRef);

    return () => ctx.revert();
  }, [mounted]);

  const handleStart = (e) => {
    e.preventDefault();
    gsap.to(cardRef.current, {
      scale: 0.95,
      opacity: 0,
      duration: 0.45,
      onComplete: () => router.push("/form"),
    });
  };

  if (!mounted) return null;

  const t = translations[lang] || translations.en;

  return (
    <div className="relative min-h-[92vh] flex items-center justify-center pt-25 pb-20 md:pt-30 overflow-hidden bg-[var(--bg)]">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/20 blur-[100px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500/20 blur-[100px] rounded-full" />

      <div
        ref={cardRef}
        className="relative z-10 max-w-5xl w-full mx-6 p-10 md:p-20 rounded-[48px] bg-[var(--card)] border border-[var(--border)] backdrop-blur-3xl shadow-2xl flex flex-col md:flex-row items-center gap-12 transition-colors"
      >
        <div className="flex-1 text-left">
          <div className="hero-text inline-flex items-center gap-2 pr-4 py-1.5 mb-8 rounded-full text-xs font-bold tracking-widest uppercase">
            
            <LiveStats />
          </div>

          <h1 className="hero-text text-5xl md:text-7xl font-black text-[var(--text)] leading-none mb-6">
            {t.helpTeach} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
              {t.machinesToSign}
            </span>
          </h1>

          <p className="hero-text text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-lg">
            {t.heroSubtitle}
          </p>

          <button
            onClick={handleStart}
            className="hero-text group relative z-50 px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black rounded-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
          >
            <span className="relative z-10">{t.startBtn}</span>
            <svg
              className="w-6 h-6 transform group-hover:translate-x-1 transition-transform relative z-10"
              fill="none"
              stroke="white" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>

        <div className="relative">
          <img
            ref={handRef}
            src="/hand.svg"
            alt="Hand Gesture"
            className="relative w-64 md:w-96 drop-shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
}