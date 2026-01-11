"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

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
  const [lang, setLang] = useState("en");
  const canvasRef = useRef(null);
  const [compositeImageUrl, setCompositeImageUrl] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setLang(localStorage.getItem("lang") || "en");
  }, []);

  const t = translations[lang];

  useEffect(() => {
    const drawCompositeImage = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      const imgWidth = 200;
      const imgHeight = 200;
      const padding = 10;

      canvas.width = captures.length * (imgWidth + padding) - padding;
      canvas.height = imgHeight + 80;

      // Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let currentX = 0;

      const loadedImages = await Promise.all(
        captures.map(cap => {
          return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => resolve({ img, letter: cap.letter });
            img.onerror = () => resolve({ img: null, letter: cap.letter });
            img.src = cap.imageUrl;
          });
        })
      );

      // Draw images
      loadedImages.forEach(({ img, letter }) => {
        if (img) {
          ctx.drawImage(img, currentX, 60, imgWidth, imgHeight);
          
          // Letter label
          ctx.fillStyle = "rgba(0,0,0,0.7)";
          ctx.fillRect(currentX, 60, imgWidth, 40);
          ctx.font = "bold 28px Arial";
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.fillText(letter, currentX + imgWidth / 2, 90);
        } else {
          ctx.fillStyle = "#f3f4f6";
          ctx.fillRect(currentX, 60, imgWidth, imgHeight);
          ctx.fillStyle = "#9ca3af";
          ctx.font = "bold 48px Arial";
          ctx.textAlign = "center";
          ctx.fillText("?", currentX + imgWidth / 2, 60 + imgHeight / 2);
        }
        currentX += imgWidth + padding;
      });

      // Title
      ctx.fillStyle = "#1f2937";
      ctx.font = "bold 36px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`GESTURE WORD: ${word.toUpperCase()}`, canvas.width / 2, 40);

      setCompositeImageUrl(canvas.toDataURL("image/png"));
    };

    drawCompositeImage();
  }, [captures, word]);

  const handleDownload = () => {
    if (!compositeImageUrl) return;
    setDownloading(true);
    
    const link = document.createElement("a");
    link.href = compositeImageUrl;
    link.download = `gesture-gift-${word.toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => setDownloading(false), 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-5xl mx-auto p-6 sm:p-8 lg:p-12 bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl text-center space-y-8 sm:space-y-10"
    >
      {/* Header */}
      <div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent mb-3">
          {t.legend}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">{t.thankYou}</p>
      </div>

      {/* Individual Previews */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {captures.map((cap, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="group relative rounded-2xl overflow-hidden border-2 border-[var(--border)] shadow-md hover:shadow-xl transition-shadow"
          >
            <img 
              src={cap.imageUrl} 
              alt={cap.letter} 
              className="w-full aspect-square object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent text-white py-2 font-bold text-lg">
              {cap.letter}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="h-px bg-[var(--border)]" />

      {/* Composite Gift */}
      <div className="space-y-6">
        <div className="flex items-center justify-center gap-2 text-xl sm:text-2xl font-bold text-[var(--text)]">
          <span className="text-3xl">🎁</span>
          {t.customWordGift}
        </div>

        <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl border-2 border-dashed border-[var(--border)] overflow-x-auto">
          {compositeImageUrl ? (
            <motion.img
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              src={compositeImageUrl}
              alt="Final Gesture Word"
              className="mx-auto max-h-[300px] shadow-2xl rounded-xl"
            />
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400">
              <svg className="animate-spin h-8 w-8 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {t.generatingGift}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-2xl mx-auto">
          <button
            onClick={handleDownload}
            disabled={!compositeImageUrl || downloading}
            className="flex-1 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-2xl font-bold shadow-xl shadow-green-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {downloading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t.downloading}
              </>
            ) : (
              <>
                {t.downloadPhoto}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </>
            )}
          </button>

          <button
            onClick={onReset}
            className="flex-1 px-8 py-4 bg-[var(--card)] hover:bg-[var(--border)] border-2 border-[var(--border)] text-[var(--text)] rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
          >
            {t.startNewWord}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Footer Link */}
      <div className="pt-6 border-t border-[var(--border)]">
        <a 
          href="/" 
          className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t.backToHome}
        </a>
      </div>
    </motion.div>
  );
}