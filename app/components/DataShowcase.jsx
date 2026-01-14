"use client";
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

// --- CSS Styles for the Marquee ---
// We inject these styles dynamically or you can put them in global.css
const marqueeStyle = `
  @keyframes marquee-left {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes marquee-right {
    0% { transform: translateX(-50%); }
    100% { transform: translateX(0); }
  }
  .animate-marquee-left {
    animation: marquee-left linear infinite;
    will-change: transform; /* Forces GPU Layer */
  }
  .animate-marquee-right {
    animation: marquee-right linear infinite;
    will-change: transform; /* Forces GPU Layer */
  }
`;

const generateMockImages = () => {
  return Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    src: `https://picsum.photos/seed/${i * 123}/200/200` // Reduced resolution request
  }));
};

const ImageCard = ({ src }) => {
  return (
    // OPTIMIZATION 1: Removed backdrop-blur (It kills FPS on marquees)
    // OPTIMIZATION 2: Added translate-z-0 to force hardware acceleration
    <div className="relative group w-32 h-32 md:w-48 md:h-48 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#111] transition-all duration-300 ease-out hover:scale-110 hover:z-50 hover:border-[var(--primary)] transform-gpu">
      
      <img
        src={src}
        alt="Dataset Sample"
        // OPTIMIZATION 3: 'decoding="async"' keeps UI smooth while image parses
        decoding="async"
        loading="lazy"
        className="w-full h-full object-cover filter grayscale contrast-125 transition-all duration-300 group-hover:filter-none"
      />
      
      {/* Lighter shine effect */}
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

const MarqueeRow = ({ images, direction = "left", duration = "40s" }) => {
  return (
    <div className="flex overflow-hidden relative w-full py-4 mask-gradient">
      {/* CSS Mask for smoother fade edges (Replacing the div gradients) */}
      <style>{`
        .mask-gradient {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
      `}</style>

      <div
        className={`flex gap-4 md:gap-6 px-4 w-max ${
          direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
        }`}
        style={{ animationDuration: duration }}
      >
        {/* Render images twice for seamless loop */}
        {[...images, ...images].map((img, idx) => (
          <ImageCard key={`${img.id}-${idx}`} src={img.src} />
        ))}
      </div>
    </div>
  );
};

export default function DatasetShowcase({ captures = [] }) {
  const validCaptures = captures.filter(c => c.imageUrl).map((c, i) => ({ id: i, src: c.imageUrl }));
  
  // OPTIMIZATION 4: Cap the image count. Rendering 300+ DOM nodes causes lag.
  // We keep the array small enough to loop seamlessly but not huge.
  const displayImages = validCaptures.length > 5 
    ? validCaptures.slice(0, 30) 
    : [...validCaptures, ...generateMockImages()].slice(0, 30);

  const row1 = displayImages.slice(0, 10);
  const row2 = displayImages.slice(10, 20);
  const row3 = displayImages.slice(20, 30);

  // Helper to fill small arrays
  const ensureLength = (arr) => {
    if (arr.length === 0) return generateMockImages().slice(0, 10);
    while (arr.length < 10) arr = [...arr, ...arr];
    return arr.slice(0, 15); // Cap max items per row
  };

  return (
    <section className="relative w-full py-24 overflow-hidden bg-[var(--bg)]">
      <style>{marqueeStyle}</style>

      {/* Header */}
      <div className="relative z-20 text-center mb-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-[var(--primary)] font-bold tracking-widest uppercase text-sm mb-2 block">
            The Library of Babel
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-[var(--text)] mb-4">
            A Living <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">Archive</span>
          </h2>
          <p className="text-[var(--text)] opacity-60 max-w-xl mx-auto">
            Hundreds of hands, thousands of stories.
          </p>
        </motion.div>
      </div>

      {/* OPTIMIZATION 5: 'transform-gpu' forces the browser to use the video card */}
      <div className="relative w-full -rotate-3 scale-110 hover:rotate-0 transition-transform duration-700 ease-out origin-center py-10 transform-gpu will-change-transform">
        
        {/* Row 1: Left */}
        <MarqueeRow images={ensureLength(row1)} direction="left" duration="45s" />
        
        {/* Row 2: Right */}
        <MarqueeRow images={ensureLength(row2)} direction="right" duration="35s" />
        
        {/* Row 3: Left */}
        <MarqueeRow images={ensureLength(row3)} direction="left" duration="50s" />

      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[var(--bg)] to-transparent z-20 pointer-events-none" />

    </section>
  );
}