"use client";
import { motion } from "framer-motion";

export default function Loader({ message = "Processing..." }) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="flex flex-col items-center gap-6">
        {/* HIGH-END SVG LOADER */}
        <svg width="80" height="80" viewBox="0 0 50 50" className="drop-shadow-2xl">
          <motion.circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0, rotate: 0 }}
            animate={{ 
              pathLength: [0.2, 0.5, 0.2], 
              rotate: 360 
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
          <circle cx="25" cy="25" r="20" fill="none" stroke="white" strokeWidth="4" className="opacity-10" />
        </svg>

        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="text-white font-black tracking-widest uppercase text-xs"
        >
          {message}
        </motion.p>
      </div>
    </div>
  );
}