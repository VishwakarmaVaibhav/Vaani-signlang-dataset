"use client"
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

const GraffitiDoodle = ({ className, children }) => (
    <div className={`absolute pointer-events-none opacity-10 dark:opacity-20 text-[var(--text)] select-none ${className}`}>
      {children}
    </div>
  );
  
  const BackgroundGraffiti = () => (
    <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
      {/* 1. Grain/Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
      
      {/* 2. Abstract Blob Gradient */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[var(--primary)] opacity-5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[var(--secondary)] opacity-5 rounded-full blur-[100px]" />
  
      {/* 3. Graffiti SVGs */}
      {/* Crown - Top Left */}
      <GraffitiDoodle className="top-10 left-10 rotate-[-12deg]">
        <svg width="120" height="120" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 50 L25 20 L40 50 L60 10 L80 50 L95 20 L95 80 L10 80 Z" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="25" cy="15" r="3" fill="currentColor"/>
          <circle cx="60" cy="5" r="3" fill="currentColor"/>
          <circle cx="95" cy="15" r="3" fill="currentColor"/>
        </svg>
      </GraffitiDoodle>
  
      {/* Arrow - Middle Right */}
      <GraffitiDoodle className="top-1/2 right-10 rotate-[15deg]">
        <svg width="150" height="80" viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 25 Q 50 10, 90 25" strokeLinecap="round" />
          <path d="M80 15 L90 25 L80 35" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15 35 L25 25 L15 15" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
        </svg>
      </GraffitiDoodle>
  
      {/* Scribble - Bottom Left */}
      <GraffitiDoodle className="bottom-20 left-20 rotate-[180deg]">
        <svg width="200" height="200" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 50 C 20 40, 30 60, 40 50 C 50 40, 60 60, 70 50 C 80 40, 90 60, 95 50" strokeLinecap="round" />
          <path d="M15 60 C 25 50, 35 70, 45 60 C 55 50, 65 70, 75 60" strokeLinecap="round" opacity="0.7"/>
        </svg>
      </GraffitiDoodle>
  
      {/* Star - Top Right */}
      <GraffitiDoodle className="top-20 right-32 rotate-[45deg]">
         <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
           <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinejoin="round" />
         </svg>
      </GraffitiDoodle>
    </div>
  );

  export default BackgroundGraffiti;