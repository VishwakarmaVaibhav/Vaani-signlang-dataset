"use client";
import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import AdminActions from "../components/AdminActions";
import JSZip from "jszip";

export default function AdminPanel() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [images, setImages] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]); // RESTORED: Multi-select state

  const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // Logic to handle selection
  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Improved Delete: Supports both single and bulk
  const deleteSelected = async () => {
    const targets = selectedIds.length > 0 ? selectedIds : [];
    if (targets.length === 0) return;
    
    if (!confirm(`Permanently delete ${targets.length} images?`)) return;

    setLoading(true);
    const selectedImages = images.filter(img => targets.includes(img.id));
    const paths = selectedImages.map(img => img.image_url.split('gestures/')[1]);

    try {
      const { error: storageError } = await supabase.storage.from("gestures").remove(paths);
      if (storageError) throw storageError;

      const { error: dbError } = await supabase.from("gesture_images").delete().in("id", targets);
      if (dbError) throw dbError;

      setImages(prev => prev.filter(img => !targets.includes(img.id)));
      setSelectedIds([]);
    } catch (err) {
      alert("Delete Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // WORKING ZIP EXPORT
  const handleZipExport = async () => {
    const targets = selectedIds.length > 0 
      ? images.filter(img => selectedIds.includes(img.id)) 
      : (filter === "ALL" ? images : images.filter(img => img.letter === filter));

    if (targets.length === 0) return alert("No images to export.");

    setLoading(true);
    const zip = new JSZip();
    
    try {
      const promises = targets.map(async (img) => {
        const response = await fetch(img.image_url);
        const blob = await response.blob();
        zip.file(`${img.letter}_${img.id.slice(0, 5)}.png`, blob);
      });

      await Promise.all(promises);
      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vaani_dataset_${filter}.zip`;
      a.click();
    } catch (err) {
      alert("ZIP Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode === process.env.NEXT_PUBLIC_ADMIN_PASSCODE) {
      setIsAdmin(true);
      fetchImages();
    } else {
      alert("Invalid Access Code!");
    }
  };

  async function fetchImages() {
    setLoading(true);
    const { data, error } = await supabase
      .from("gesture_images")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setImages(data);
    setLoading(false);
  }

  const filteredImages = filter === "ALL" 
    ? images 
    : images.filter(img => img.letter === filter);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
        <motion.form 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          onSubmit={handleLogin} 
          className="p-6 sm:p-10 bg-[#111] rounded-[2rem] border border-white/10 shadow-2xl text-center w-full max-w-md"
        >
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center font-black italic text-3xl">V</div>
          <h2 className="text-3xl font-black mb-6 italic uppercase">Vaani Admin</h2>
          <input type="password" placeholder="ACCESS CODE" className="w-full p-4 bg-black border border-white/10 rounded-xl mb-4 text-center text-lg outline-none focus:border-blue-500" onChange={(e) => setPasscode(e.target.value)} />
          <button className="w-full py-4 bg-blue-600 rounded-xl font-black uppercase">Enter Studio</button>
        </motion.form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] p-4 sm:p-6 pt-24 sm:pt-32">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black text-[var(--text)] italic uppercase tracking-tighter">Dataset Lab</h1>
            <p className="text-blue-500 text-xs font-black uppercase tracking-[0.2em] mt-1">Total: {images.length} | Selected: {selectedIds.length}</p>
          </div>
          
          <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex gap-2 min-w-max bg-[var(--card)] p-2 rounded-2xl border border-[var(--border)]">
              <button onClick={() => setFilter("ALL")} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${filter === "ALL" ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>ALL</button>
              {alphabets.map(char => (
                <button key={char} onClick={() => setFilter(char)} className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${filter === char ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>{char}</button>
              ))}
            </div>
          </div>
        </header>

        <AdminActions 
          data={images} 
          onFilter={setImages} 
          selectedCount={selectedIds.length}
          onDeleteSelected={deleteSelected} 
          onExportZip={handleZipExport}
        />

        {loading ? (
            <div className="flex justify-center py-20 italic font-black text-blue-500 animate-pulse">PROCESSING DATA...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-6">
            {filteredImages.map((img) => {
              const isSelected = selectedIds.includes(img.id);
              return (
                <div 
                  key={img.id} 
                  onClick={() => toggleSelect(img.id)}
                  className={`group relative aspect-[4/5] bg-[var(--card)] border rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer transition-all ${isSelected ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-[var(--border)]'}`}
                >
                  <img src={img.image_url} className={`w-full h-full object-cover ${isSelected ? 'scale-105' : ''}`} loading="lazy" />
                  
                  {/* Selection Indicator */}
                  <div className={`absolute top-3 left-3 w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-black/20 border-white/50'}`}>
                    {isSelected && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>}
                  </div>

                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/40 backdrop-blur-md rounded-md text-white text-[10px] font-black">{img.letter}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}