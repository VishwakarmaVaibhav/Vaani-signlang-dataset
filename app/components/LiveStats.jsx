// components/LiveStats.jsx
"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function LiveStats() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function fetchCount() {
      try {
        const { count: total, error } = await supabase
          .from("gesture_images") // FIXED: Matches your SQL schema exactly
          .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        setCount(total || 0);
      } catch (err) {
        console.error("Count Fetch Error:", err.message);
      }
    }

    // CRITICAL: Call the function immediately on mount
    fetchCount();

    // Setup Realtime listener
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gesture_images' }, 
      () => fetchCount())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 shadow-sm">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
      </span>
      <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
        {count.toLocaleString()} Images Collected
      </span>
    </div>
  );
}