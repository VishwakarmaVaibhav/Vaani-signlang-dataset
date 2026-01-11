"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CameraPopup from "./CameraPopup";
import { useRouter, usePathname } from "next/navigation";
import GiftSection from "./GiftSection";

const translations = {
  en: {
    studioConfig: "Studio Config",
    enterWord: "ENTER WORD",
    customWord: "Custom Word",
    randomMix: "Random Mix",
    letter: "Letter",
    of: "of",
    recordGesture: "Record Gesture",
    sessionProgress: "Session Progress",
    recording: "Recording",
    waiting: "Waiting",
    completed: "Completed",
    referencePose: "Reference Pose",
    enterWordFirst: "Please enter a word first"
  },
  hi: {
    studioConfig: "स्टूडियो कॉन्फ़िग",
    enterWord: "शब्द दर्ज करें",
    customWord: "कस्टम शब्द",
    randomMix: "रैंडम मिक्स",
    letter: "अक्षर",
    of: "का",
    recordGesture: "इशारा रिकॉर्ड करें",
    sessionProgress: "सत्र प्रगति",
    recording: "रिकॉर्डिंग",
    waiting: "प्रतीक्षा",
    completed: "पूर्ण",
    referencePose: "संदर्भ मुद्रा",
    enterWordFirst: "कृपया पहले एक शब्द दर्ज करें"
  }
};
export default function UploadWizard() {
  const router = useRouter();
  const pathname = usePathname();
  const [lang, setLang] = useState("en");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [session, setSession] = useState({
    active: false,
    letters: [],
    currentIndex: 0,
    captures: [],
    showCamera: false,
    word: ""
  });
  const [inputWord, setInputWord] = useState("");

  // Function to handle the actual leaving action
  const confirmExit = () => {
    setShowExitModal(false);
    router.push("/");
  };

  // 1. Logic for Internal Back Button and Navbar Logo
  // We use a useEffect to "push" a fake state into the browser history.
  // When the user clicks "Back" or a Link, we catch it.
  useEffect(() => {
    const userId = localStorage.getItem("USER_ID");
  
  if (!userId) {
    // If somehow middleware was bypassed, this is the second layer of defense
    router.replace("/form"); 
  } else {
    setIsAuthorized(true);
  }
    setLang(localStorage.getItem("lang") || "en");

    // Standard Browser Tab Close Protection
    const handleBeforeUnload = (e) => {
      if (session.active && session.active !== "complete") {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [session.active, router]);

  // 2. Handle the "Custom Back Trigger" from Config or Studio
  const handleRequestGoHome = (e) => {
    if (e) e.preventDefault();
    if (session.active || inputWord.length > 0) {
      setShowExitModal(true);
    } else {
      router.push("/");
    }
  };

  if (!isAuthorized) return null;

  const t = translations[lang] || translations.en;

  const startSession = (wordString) => {
    const rawLetters = (wordString === "RANDOM" 
      ? "ABCDE".split("").sort(() => 0.5 - Math.random()).join("")
      : wordString
    ).toUpperCase().replace(/[^A-Z]/g, "").split("");
    
    const uniqueLetters = [...new Set(rawLetters)];
    if (uniqueLetters.length === 0) return alert(t.enterWordFirst);
    
    setSession({ 
      active: true, 
      letters: uniqueLetters, 
      currentIndex: 0, 
      captures: [], 
      showCamera: false,
      word: wordString.toUpperCase()
    });
  };

  const handleCameraCapture = async (imageData) => {
    const userId = localStorage.getItem("USER_ID") || "anon";
    const currentLetter = session.letters[session.currentIndex];

    try {
      const res = await fetch("/api/uploadImage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData, letter: currentLetter, userId: userId }),
      });
      const out = await res.json();
      if (!out.success) throw new Error(out.error || "Upload failed");

      // Logic to either add new capture or update existing one (Edit mode)
      const existingIndex = session.captures.findIndex(c => c.letter === currentLetter);
      let newCaptures = [...session.captures];
      
      if (existingIndex !== -1) {
        newCaptures[existingIndex] = { letter: currentLetter, imageUrl: imageData };
      } else {
        newCaptures.push({ letter: currentLetter, imageUrl: imageData });
      }

      // Check if we are editing an old one or moving forward
      const isLastLetter = session.currentIndex >= session.letters.length - 1;
      const allDone = newCaptures.length === session.letters.length;

      if (allDone && isLastLetter) {
        setSession(s => ({ ...s, captures: newCaptures, showCamera: false, active: "complete" }));
      } else {
        setSession(s => ({ 
            ...s, 
            captures: newCaptures, 
            currentIndex: Math.min(s.currentIndex + 1, s.letters.length - 1), 
            showCamera: false 
        }));
      }
    } catch (err) {
      alert("Upload Error: " + err.message);
    }
  };

  const editCapture = (index) => {
    setSession(s => ({ ...s, currentIndex: index, showCamera: true }));
  };

  if (session.active === "complete") {
    return <GiftSection captures={session.captures} word={session.word} onReset={() => setSession({active: false})} />;
  }

  return (
    <div className="h-[calc(100vh-100px)] pt-24 pb-4 px-6 bg-[var(--bg)] overflow-hidden relative">
      
      {/* EXIT CONFIRMATION OVERLAY */}
      <AnimatePresence>
        {showExitModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }}
              className="bg-[var(--card)] p-8 rounded-[2.5rem] max-w-sm text-center shadow-2xl border border-[var(--border)]"
            >
              <div className="text-5xl mb-4 text-pink-500">🥺</div>
              <h3 className="text-2xl font-black mb-2 text-[var(--text)] tracking-tight italic">Wait! Don't go...</h3>
              
              <div className="text-4xl mb-4 animate-bounce">✨</div>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Each gesture you capture brings us one step closer to making technology 
                accessible for everyone. 
                {session.active && (
                   <span className="block mt-2 font-bold text-blue-600">
                     Only {session.letters.length - session.captures.length} more images left!
                   </span>
                )}
              </p>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setShowExitModal(false)}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg hover:scale-[1.02] transition-transform"
                >
                  I'll Stay & Finish! ✨
                </button>
                <button 
                  onClick={confirmExit}
                  className="w-full py-2 text-gray-400 text-xs font-semibold hover:text-red-500 transition-colors"
                >
                  Leave anyway
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!session.active ? (
          <motion.div 
            key="config"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto text-center space-y-6 pt-10"
          >
            <h2 className="text-5xl font-black text-[var(--text)] tracking-tighter italic">Studio Config</h2>
            <div className="p-3 rounded-[2.5rem] bg-[var(--card)] border border-[var(--border)] shadow-xl ring-8 ring-blue-500/5 text-[var(--text)]">
              <input
                value={inputWord}
                className="w-full p-4 bg-transparent text-center text-3xl font-black uppercase tracking-widest outline-none"
                placeholder={t.enterWord}
                onChange={(e) => setInputWord(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <button onClick={() => startSession(inputWord)} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold">{t.customWord}</button>
              <button onClick={() => startSession("RANDOM")} className="flex-1 py-4 bg-[var(--card)] text-[var(--text)] border border-[var(--border)] rounded-2xl font-bold">{t.randomMix}</button>
            </div>
            
            {/* UPDATED BACK BUTTON */}
            <button 
              onClick={handleRequestGoHome} 
              className="text-xs text-gray-400 hover:text-blue-500 underline transition-colors"
            >
              ← Back to Home
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="studio"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto h-full grid lg:grid-cols-[1fr_360px] gap-6"
          >
            {/* 1. COMPACT WORKSPACE */}
            <div className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-[2.5rem] shadow-sm flex flex-col justify-between overflow-hidden">
              <div className="flex justify-between items-center">
                {/* UPDATED STUDIO BACK BUTTON */}
                <button 
                   onClick={handleRequestGoHome}
                   className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                </button>
                
                <div className="text-right">
                    <p className="text-gray-400 text-[10px] font-bold uppercase mb-1">{t.of} {session.letters.length}</p>
                    <div className="h-2 w-32 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border border-[var(--border)]">
                        <motion.div 
                            className="h-full bg-blue-600" 
                            animate={{ width: `${((session.captures.length) / session.letters.length) * 100}%` }} 
                        />
                    </div>
                </div>
              </div>

              <div className="text-center">
                  <span className="text-blue-500 font-bold uppercase tracking-widest text-[10px]">{t.letter}</span>
                  <h3 className="text-6xl font-black text-[var(--text)] tracking-tighter leading-none italic">"{session.letters[session.currentIndex]}"</h3>
              </div>

              <div className="relative flex-1 my-4 max-h-[350px] aspect-[4/5] mx-auto rounded-[2rem] bg-gray-50 dark:bg-black/20 border border-[var(--border)] flex items-center justify-center overflow-hidden group">
                <img src={`/gestures/${session.letters[session.currentIndex]}.png`} className="h-full w-full object-contain p-6" alt="Ref" />
              </div>

              <button 
                onClick={() => setSession(s => ({...s, showCamera: true}))}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
              >
                <span>{session.captures.find(c => c.letter === session.letters[session.currentIndex]) ? 'Retake Photo' : t.recordGesture}</span>
              </button>
            </div>

            {/* 2. THE FILMSTRIP (PREVIEWS) */}
            <div className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-[2.5rem] flex flex-col h-full">
               <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-4">{t.sessionProgress}</h4>
               
               <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                  {session.letters.map((l, i) => {
                    const cap = session.captures.find(c => c.letter === l);
                    const isCurrent = i === session.currentIndex;

                    return (
                      <div 
                        key={i} 
                        onClick={() => editCapture(i)} // Trigger Retake on Click
                        className={`relative cursor-pointer rounded-2xl border transition-all duration-300 overflow-hidden flex items-center p-2 gap-3 group
                          ${isCurrent ? 'border-blue-500 bg-blue-500/5 ring-4 ring-blue-500/5' : 'border-[var(--border)] bg-transparent'}
                          ${cap ? 'hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10' : ''}
                        `}
                      >
                        <div className={`w-14 h-16 rounded-xl flex-shrink-0 flex items-center justify-center border overflow-hidden
                          ${cap ? 'border-green-500' : 'border-dashed border-gray-300'}
                        `}>
                          {cap ? (
                            <img src={cap.imageUrl} className="w-full h-full object-cover" alt={l} />
                          ) : (
                            <span className={`text-xl font-black ${isCurrent ? 'text-blue-500' : 'text-gray-200'}`}>{l}</span>
                          )}
                        </div>

                        <div className="flex-1">
                           <p className={`text-sm font-black ${isCurrent ? 'text-blue-500' : 'text-[var(--text)]'}`}>Letter {l}</p>
                           <p className="text-[8px] font-bold uppercase text-gray-400 tracking-widest">{cap ? "Click to Retake" : isCurrent ? "Active" : "Queued"}</p>
                        </div>

                        {cap && (
                           <div className="mr-1 group-hover:hidden">
                             <div className="bg-green-500 text-white p-1 rounded-full">
                               <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                             </div>
                           </div>
                        )}
                        
                        <div className="hidden group-hover:block mr-2">
                           <span className="text-[10px] font-bold text-blue-500">RETAKE 🔄</span>
                        </div>
                      </div>
                    );
                  })}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {session.showCamera && (
        <CameraPopup 
          letter={session.letters[session.currentIndex]} 
          onClose={() => setSession(s => ({...s, showCamera: false}))}
          onCaptured={handleCameraCapture}
        />
      )}
    </div>
  );
}