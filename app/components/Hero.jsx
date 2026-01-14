"use client";
import { useRef, useState, useLayoutEffect, useEffect } from "react";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";
import { translations } from "../lib/translations";
import LiveStats from "./LiveStats";
import BackgroundGraffiti from "./BackgroundGraffiti";

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
        y: 80,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
      })
      .from(".hero-text", {
        y: 30,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: "back.out(1.2)"
      }, "-=0.8")
      .from(handRef.current, {
        x: 50,
        opacity: 0,
        duration: 1.2,
        ease: "power2.out",
      }, "-=1");
    }, cardRef);

    return () => ctx.revert();
  }, [mounted]);

  const handleStart = (e) => {
    e.preventDefault();
    gsap.to(cardRef.current, {
      scale: 0.9,
      opacity: 0,
      y: -50,
      duration: 0.5,
      ease: "power2.in",
      onComplete: () => router.push("/form"),
    });
  };

  if (!mounted) return null;

  const t = translations[lang] || translations.en;

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 overflow-hidden bg-[var(--bg)] transition-colors duration-500">
      
      {/* Background Elements */}
      <BackgroundGraffiti />
      
      {/* Dynamic Glow Orbs matching theme Primary/Secondary */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[var(--primary)] opacity-10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[var(--secondary)] opacity-10 blur-[120px] rounded-full pointer-events-none" />

      <div
        ref={cardRef}
        className="relative z-10 w-full max-w-6xl mx-4 p-8 md:p-16 rounded-[3rem] bg-[var(--card)]/60 border border-[var(--border)] backdrop-blur-xl shadow-2xl flex flex-col-reverse md:flex-row items-center gap-12 md:gap-20"
      >
        {/* Left Content */}
        <div className="flex-1 text-left space-y-8">
          
          {/* Badge */}
          <div className="hero-text inline-flex items-center gap-3 px-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-full shadow-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--primary)]"></span>
            </span>
            <LiveStats />
          </div>

          {/* Heading */}
          <h1 className="hero-text text-5xl md:text-7xl lg:text-8xl font-black text-[var(--text)] leading-[0.95] tracking-tight">
            {t.helpTeach} <br />
            <span className="text-[var(--primary)] selection:bg-[var(--secondary)] selection:text-white">
              {t.machinesToSign}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="hero-text text-lg md:text-xl text-[var(--text)] opacity-70 leading-relaxed max-w-lg font-medium">
            {t.heroSubtitle}
          </p>

          {/* CTA Button - The "Glitch-Free" Robust Button */}
          <div className="hero-text pt-4">
            <button
              onClick={handleStart}
              className="group relative inline-flex items-center justify-center px-10 py-5 font-bold text-white transition-all duration-200 bg-[var(--primary)] font-heading rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] hover:shadow-lg hover:shadow-[var(--primary)]/30 active:scale-95"
            >
              <span className="mr-3 text-lg">{t.startBtn}</span>
              <svg 
                className="w-6 h-6 transition-transform group-hover:translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              
              {/* Button Shine Effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />
            </button>
          </div>
        </div>

        {/* Right Image - Floating Animation */}
        <div className="relative flex-1 flex justify-center items-center">
          <div className="relative w-64 md:w-[28rem] aspect-square animate-float">
            {/* Hand Image */}
            <img
              ref={handRef}
              src="/hand.svg"
              alt="Hand Gesture 3D"
              className="w-full h-full object-contain drop-shadow-2xl"
              style={{ filter: "drop-shadow(0px 20px 40px rgba(0,0,0,0.15))" }}
            />
            
            {/* Decorative Circle behind hand */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--primary)] to-[var(--secondary)] rounded-full opacity-20 blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </div>
  );
}