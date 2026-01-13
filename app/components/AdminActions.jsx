"use client";
import { useState } from "react";

export default function AdminActions({ data, onFilter, selectedCount, onDeleteSelected, onExportZip }) {
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const handleDateFilter = () => {
    if (!dateRange.start || !dateRange.end) return;
    const filtered = data.filter(img => {
      const date = new Date(img.created_at).toISOString().split('T')[0];
      return date >= dateRange.start && date <= dateRange.end;
    });
    onFilter(filtered);
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] p-4 sm:p-6 rounded-[2rem] mb-10 flex flex-col md:flex-row gap-6 items-center justify-between shadow-sm">
      <div className="flex items-center gap-3 w-full md:w-auto">
        <input type="date" className="bg-[var(--bg)] border border-[var(--border)] p-2 rounded-xl text-[10px] font-bold text-[var(--text)] flex-1" onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
        <span className="text-gray-400 font-black">→</span>
        <input type="date" className="bg-[var(--bg)] border border-[var(--border)] p-2 rounded-xl text-[10px] font-bold text-[var(--text)] flex-1" onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
        <button onClick={handleDateFilter} className="bg-[var(--text)] text-[var(--bg)] px-4 py-2 rounded-xl text-[10px] font-black uppercase">Apply</button>
      </div>

      <div className="flex gap-3 w-full md:w-auto">
        {selectedCount > 0 && (
            <button onClick={onDeleteSelected} className="flex-1 md:flex-none px-5 py-3 bg-red-500/10 text-red-500 rounded-2xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">🗑️ Delete ({selectedCount})</button>
        )}
        <button onClick={onExportZip} className="flex-1 md:flex-none px-5 py-3 bg-purple-600/10 text-purple-600 rounded-2xl text-[10px] font-black uppercase hover:bg-purple-600 hover:text-white transition-all">📦 {selectedCount > 0 ? 'Zip Selected' : 'Zip Dataset'}</button>
      </div>
    </div>
  );
}