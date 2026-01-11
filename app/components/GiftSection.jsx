"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const translations = {
  en: {
    legend: "You're a Legend!",
    thankYou: "You've successfully contributed to the sign language dataset.",
    customWordGift: "Your Custom Word Gift",
    generatingGift: "Generating your gift...",
    downloadPhoto: "Download Word Photo",
    startNewWord: "Start New Word",
    backToHome: "Back to Homepage",
    downloading: "Downloading..."
  },
  hi: {
    legend: "आप एक लेजेंड हैं!",
    thankYou: "आपने सांकेतिक भाषा डेटासेट में सफलतापूर्वक योगदान दिया है।",
    customWordGift: "आपका कस्टम वर्ड गिफ्ट",
    generatingGift: "आपका उपहार बना रहा है...",
    downloadPhoto: "वर्ड फोटो डाउनलोड करें",
    startNewWord: "नया शब्द शुरू करें",
    backToHome: "होमपेज पर वापस जाएं",
    downloading: "डाउनलोड हो रहा है..."
  },
  mr: {
    legend: "तुम्ही एक दिग्गज आहात!",
    thankYou: "तुम्ही सांकेतिक भाषा डेटासेटमध्ये यशस्वीरित्या योगदान दिले आहे.",
    customWordGift: "तुमची कस्टम वर्ड भेट",
    generatingGift: "तुमची भेट तयार करत आहे...",
    downloadPhoto: "वर्ड फोटो डाउनलोड करा",
    startNewWord: "नवीन शब्द सुरू करा",
    backToHome: "होमपेजवर परत जा",
    downloading: "डाउनलोड करत आहे..."
  }
};

export default function GiftSection({ captures, word, onReset }) {
  const router = useRouter();
  const [lang, setLang] = useState("en");
  const canvasRef = useRef(null);
  const [compositeImageUrl, setCompositeImageUrl] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setLang(localStorage.getItem("lang") || "en");
  }, []);

  const t = translations[lang] || translations.en;

  useEffect(() => {
    const drawCompositeImage = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");

      // Setup High-Res Dimensions
      const imgWidth = 400;
      const imgHeight = 500;
      const padding = 24;
      const topMargin = 140;
      const bottomMargin = 120;

      canvas.width = (captures.length * imgWidth) + ((captures.length + 1) * padding);
      canvas.height = imgHeight + topMargin + bottomMargin;

      // 1. White Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Load Images with strict CORS handling
      const loadImg = (cap) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.setAttribute('crossOrigin', 'anonymous'); 
          
         // Only add a timestamp for Supabase URLs (http), not Base64 data
    if (cap.imageUrl && cap.imageUrl.startsWith("http")) {
      const connector = cap.imageUrl.includes('?') ? '&' : '?';
      img.src = `${cap.imageUrl}${connector}t=${Date.now()}`;
    } else {
      img.src = cap.imageUrl;
    }

    img.onload = () => resolve({ img, letter: cap.letter });
    img.onerror = () => resolve({ img: null, letter: cap.letter });
  });
      };

      const loadedImages = await Promise.all(captures.map(loadImg));

      // 3. Draw Brand Header
      ctx.fillStyle = "#111827";
      ctx.font = "bold 55px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`VAANI: ${word.toUpperCase()}`, canvas.width / 2, 85);

      // 4. Draw Cards
      let currentX = padding;
      loadedImages.forEach(({ img, letter }) => {
        // Draw Card Shadow/Bg
        ctx.fillStyle = "#f3f4f6";
        if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(currentX, topMargin, imgWidth, imgHeight, 24);
            ctx.fill();
        } else {
            ctx.fillRect(currentX, topMargin, imgWidth, imgHeight);
        }

        if (img) {
          ctx.save();
          if (ctx.roundRect) {
              ctx.beginPath();
              ctx.roundRect(currentX, topMargin, imgWidth, imgHeight, 24);
              ctx.clip();
          }
          ctx.drawImage(img, currentX, topMargin, imgWidth, imgHeight);
          ctx.restore();
        }

        // Letter Label
        ctx.fillStyle = "#2563eb";
        ctx.font = "black 80px Arial";
        ctx.textAlign = "center";
        ctx.fillText(letter, currentX + imgWidth / 2, topMargin + imgHeight + 85);

        currentX += imgWidth + padding;
      });

      // 5. Signature
      ctx.fillStyle = "#9ca3af";
      ctx.font = "500 22px Arial";
      ctx.textAlign = "right";
      ctx.fillText("Research by Vaibhav Vishwakarma • Vaani Labs", canvas.width - padding, canvas.height - 35);

      // 6. Convert to URL
      try {
        const dataUrl = canvas.toDataURL("image/png", 1.0);
        setCompositeImageUrl(dataUrl);
      } catch (e) {
        console.error("Security Error: Canvas tainted by CORS", e);
      }
    };

    if (captures.length > 0) drawCompositeImage();
  }, [captures, word]);

  const handleDownload = () => {
    if (!compositeImageUrl) return;
    setDownloading(true);
    const link = document.createElement("a");
    link.href = compositeImageUrl;
    link.download = `Vaani-Gift-${word.toUpperCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloading(false), 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-6xl mx-auto p-6 mt-25 bg-[var(--card)] border border-[var(--border)] rounded-[3rem] shadow-2xl text-center space-y-8"
    >
      {/* Celebration Header */}
      <div className="space-y-2">
        <h2 className="text-5xl font-black bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          {t.legend}
        </h2>
        <p className="text-gray-500 font-medium">{t.thankYou}</p>
      </div>

      {/* The Visual Result */}
      <div className="relative group">
        <div className="flex items-center justify-center gap-2 mb-4 text-xl font-bold text-[var(--text)]">
          <span>🎁</span> {t.customWordGift}
        </div>

        <div className="bg-gray-50 dark:bg-black/20 p-4 sm:p-8 rounded-[2rem] border-2 border-dashed border-[var(--border)] overflow-x-auto custom-scrollbar">
          {compositeImageUrl ? (
            <div className="min-w-[600px] py-4">
              <motion.img
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                src={compositeImageUrl}
                className="mx-auto shadow-2xl rounded-2xl border border-gray-200"
                alt="Your Gesture Word"
              />
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-4">
               <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent animate-spin rounded-full" />
               <p className="font-bold">{t.generatingGift}</p>
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
        <button
          onClick={handleDownload}
          disabled={!compositeImageUrl || downloading}
          className="py-5 bg-blue-600 text-white rounded-3xl font-black text-xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {downloading ? t.downloading : t.downloadPhoto}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        </button>

        <button
          onClick={onReset}
          className="py-5 bg-[var(--card)] border-2 border-[var(--border)] text-[var(--text)] rounded-3xl font-black text-xl hover:bg-[var(--bg)] transition-all flex items-center justify-center gap-3"
        >
          {t.startNewWord}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>

      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />
      
      <button onClick={() => router.push("/")} className="text-gray-400 hover:text-blue-500 font-bold transition-colors">
        {t.backToHome}
      </button>
    </motion.div>
  );
}