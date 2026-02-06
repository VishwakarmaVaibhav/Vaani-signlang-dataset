"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CameraPopup from "./CameraPopup";
import { useRouter, usePathname } from "next/navigation";
import GiftSection from "./GiftSection";
import BackgroundGraffiti from "./BackgroundGraffiti";


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
    completed: "Completed",
    enterWordFirst: "Please enter a word first",
    alreadyCaptured: "Already Captured"
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
    completed: "पूर्ण",
    enterWordFirst: "कृपया पहले एक शब्द दर्ज करें",
    alreadyCaptured: "पहले ही कैप्चर किया गया"
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
    captures: {}, // Using Object for repetitive letter logic
    showCamera: false,
    word: ""
  });
  const [inputWord, setInputWord] = useState("");
  const [letterStats, setLetterStats] = useState({});

  useEffect(() => {
    // Fetch stats on mount
    fetch("/api/letters/stats")
      .then(res => res.json())
      .then(data => {
        if (data.counts) setLetterStats(data.counts);
      })
      .catch(err => console.error("Failed to load stats", err));
  }, []);

  const confirmExit = () => {
    window.isNavigationBlocked = false;
    setShowExitModal(false);
    router.push("/");
  };

  useEffect(() => {
    const userId = localStorage.getItem("USER_ID");
    if (!userId) {
      router.replace("/form");
    } else {
      setIsAuthorized(true);
    }
    setLang(localStorage.getItem("lang") || "en");

    // Navigation Interception
    const handlePopState = (e) => {
      // If session is active, push state back to prevent leaving
      if (session.active && session.active !== "complete") {
        window.history.pushState(null, "", window.location.href);
        setShowExitModal(true);
      }
    };

    const handleNavbarExitRequest = () => {
      if (session.active && session.active !== "complete") {
        setShowExitModal(true);
      }
    };

    if (session.active && session.active !== "complete") {
      window.isNavigationBlocked = true;
      window.history.pushState(null, "", window.location.href);
      window.addEventListener("popstate", handlePopState);
      window.addEventListener("vaani:request-exit", handleNavbarExitRequest);
    } else {
      window.isNavigationBlocked = false;
    }

    const handleBeforeUnload = (e) => {
      if (session.active && session.active !== "complete") {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.isNavigationBlocked = false;
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("vaani:request-exit", handleNavbarExitRequest);
    };
  }, [session.active, router]);

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
    let rawLetters = [];

    if (wordString === "RANDOM") {
      // WEIGHTED RANDOM LOGIC
      const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ".split("");

      const selection = [];
      const targetCount = 5;

      // Deep copy to prevent mutations affecting subsequent picks in same loop if we adjusted stats
      // (Here we don't adjust stats until capture, so just reading is fine)
      const currentStats = { ...letterStats };

      for (let i = 0; i < targetCount; i++) {
        let totalWeight = 0;
        const weights = alphabet.map(char => {
          // Avoid picking same letter twice in one random session if possible
          if (selection.includes(char)) return { char, w: 0 };

          const count = currentStats[char] || 0;
          // Weigh inversely: 1 / (count + 1). 0 count = 1.0, 10 count = 0.09
          const w = 1 / (count + 1);
          totalWeight += w;
          return { char, w };
        });

        let random = Math.random() * totalWeight;
        let selectedChar = alphabet[Math.floor(Math.random() * alphabet.length)]; // Fallback

        for (const item of weights) {
          random -= item.w;
          if (random < 0) {
            selectedChar = item.char;
            break;
          }
        }
        selection.push(selectedChar);
      }

      rawLetters = selection;
    } else {
      rawLetters = wordString.toUpperCase().replace(/[^A-Z]/g, "").split("");
    }

    if (rawLetters.length === 0) return alert(t.enterWordFirst);

    setSession({
      active: true,
      letters: rawLetters,
      currentIndex: 0,
      captures: {},
      showCamera: false,
      word: wordString === "RANDOM" ? rawLetters.join("") : wordString.toUpperCase()
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

      // LOGIC CHANGE: repetitive letters handle
      const newCaptures = { ...session.captures, [currentLetter]: imageData };

      const uniqueLettersInWord = [...new Set(session.letters)];
      const isWordComplete = uniqueLettersInWord.every(l => newCaptures[l]);
      const nextIncompleteIndex = session.letters.findIndex((l, idx) => !newCaptures[l]);

      if (isWordComplete) {
        setSession(s => ({ ...s, captures: newCaptures, showCamera: false, active: "complete" }));
      } else {
        setSession(s => ({
          ...s,
          captures: newCaptures,
          currentIndex: nextIncompleteIndex !== -1 ? nextIncompleteIndex : s.currentIndex,
          showCamera: false
        }));
      }
    } catch (err) {
      alert("Upload Error: " + err.message);
    }
  };

  // RESTORED: Edit Image logic
  const editCapture = (index) => {
    setSession(s => ({ ...s, currentIndex: index, showCamera: true }));
  };

  const getCapturesArray = () => {
    return session.letters.map((l) => ({
      letter: l,
      imageUrl: session.captures[l]
    }));
  };

  if (session.active === "complete") {
    return <GiftSection captures={getCapturesArray()} word={session.word} onReset={() => setSession({ active: false })} />;
  }

  return (
    <div className="min-h-screen pt-20 lg:pt-24 pb-24 px-4 lg:px-6 bg-[var(--bg)] relative flex flex-col">

      <BackgroundGraffiti />

      {/* RESTORED: EXIT CONFIRMATION OVERLAY */}
      <AnimatePresence>
        {showExitModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[var(--card)] p-8 rounded-[2.5rem] max-w-sm text-center shadow-2xl border border-[var(--border)]">
              <div className="text-5xl mb-4 text-pink-500">🥺</div>
              <h3 className="text-2xl font-black mb-2 text-[var(--text)] tracking-tight italic">Wait! Don't go...</h3>
              <div className="text-4xl mb-4 animate-bounce">✨</div>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Each gesture you capture brings us one step closer to making technology accessible for everyone.
                {session.active && (
                  <span className="block mt-2 font-bold text-blue-600">
                    Only {session.letters.length - Object.keys(session.captures).length} more images left!
                  </span>
                )}
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={() => setShowExitModal(false)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg hover:scale-[1.02] transition-transform">I'll Stay & Finish! ✨</button>
                <button onClick={confirmExit} className="w-full py-2 text-gray-400 text-xs font-semibold hover:text-red-500 transition-colors">Leave anyway</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!session.active ? (
          <motion.div key="config" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl mx-auto text-center space-y-6 pt-10">
            <h2 className="text-5xl font-black text-[var(--text)] tracking-tighter italic">Studio Config</h2>
            <div className="p-3 rounded-[2.5rem] bg-[var(--card)] border border-[var(--border)] shadow-xl ring-8 ring-blue-500/5 text-[var(--text)]">
              <input value={inputWord} className="w-full p-4 bg-transparent text-center text-3xl font-black uppercase tracking-widest outline-none" placeholder={t.enterWord} onChange={(e) => setInputWord(e.target.value)} />
            </div>
            <div className="flex gap-4">
              <button onClick={() => startSession(inputWord)} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold">{t.customWord}</button>
              <button onClick={() => startSession("RANDOM")} className="flex-1 py-4 bg-[var(--card)] text-[var(--text)] border border-[var(--border)] rounded-2xl font-bold">{t.randomMix}</button>
            </div>
            <button onClick={handleRequestGoHome} className="text-xs text-gray-400 hover:text-blue-500 underline transition-colors">← Back to Home</button>
          </motion.div>
        ) : (
          <motion.div key="studio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto h-full grid lg:grid-cols-[1fr_360px] gap-6">

            {/* WORKSPACE */}
            <div className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-[2.5rem] shadow-sm flex flex-col justify-between overflow-hidden">
              <div className="flex justify-between items-center">
                <button onClick={handleRequestGoHome} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <div className="text-right">
                  <p className="text-gray-400 text-[10px] font-bold uppercase mb-1">{t.of} {session.letters.length}</p>
                  <div className="h-2 w-32 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border border-[var(--border)]">
                    <motion.div className="h-full bg-blue-600" animate={{ width: `${((Object.keys(session.captures).length) / [...new Set(session.letters)].length) * 100}%` }} />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <span className="text-blue-500 font-bold uppercase tracking-widest text-[10px]">{t.letter}</span>
                <h3 className="text-6xl font-black text-[var(--text)] tracking-tighter leading-none italic">"{session.letters[session.currentIndex]}"</h3>
              </div>

              <div className="relative flex-1 my-4 max-h-[350px] aspect-[4/5] mx-auto rounded-[2rem] bg-gray-50 dark:bg-black/20 border border-[var(--border)] flex items-center justify-center overflow-hidden group">
                <img src={`/gestures/${session.letters[session.currentIndex]}.png`} className="h-full w-full object-contain p-6" alt="Ref" />
                {session.captures[session.letters[session.currentIndex]] && (
                  <div className="absolute inset-0 bg-blue-600/10 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-xs font-bold">{t.alreadyCaptured}</span>
                  </div>
                )}
              </div>

              <button onClick={() => setSession(s => ({ ...s, showCamera: true }))} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                <span>{session.captures[session.letters[session.currentIndex]] ? 'Retake Photo' : t.recordGesture}</span>
              </button>
            </div>

            {/* FILMSTRIP (RESTORED) */}
            <div className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-[2.5rem] flex flex-col h-full">
              <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-4">{t.sessionProgress}</h4>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {session.letters.map((l, i) => {
                  const imgData = session.captures[l];
                  const isCurrent = i === session.currentIndex;
                  return (
                    <div key={i} onClick={() => editCapture(i)} className={`relative cursor-pointer rounded-2xl border transition-all duration-300 flex items-center p-3 gap-4 group ${isCurrent ? 'bg-blue-600 border-blue-600 shadow-xl scale-[1.02]' : 'bg-[var(--card)] border-[var(--border)] hover:bg-[var(--border)]/50'}`}>
                      <div className={`w-16 h-20 rounded-xl flex-shrink-0 flex items-center justify-center border-2 overflow-hidden bg-[var(--bg)] ${imgData ? 'border-green-500' : isCurrent ? 'border-white/30' : 'border-dashed border-gray-300 dark:border-gray-700'}`}>
                        {imgData ? <img src={imgData} className="w-full h-full object-cover" /> : <span className={`text-3xl font-black ${isCurrent ? 'text-blue-600' : 'text-gray-300'}`}>{l}</span>}
                      </div>
                      <div className="flex-1">
                        <p className={`text-xl font-black ${isCurrent ? 'text-white' : 'text-[var(--text)]'}`}>{t.letter} {l}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isCurrent ? 'text-blue-200' : imgData ? 'text-green-500' : 'text-gray-400'}`}>
                          {imgData ? "Captured" : isCurrent ? "Recording..." : "Queued"}
                        </p>
                      </div>
                      {imgData && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white p-1.5 rounded-full shadow-lg">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {session.showCamera && (
        <CameraPopup letter={session.letters[session.currentIndex]} onClose={() => setSession(s => ({ ...s, showCamera: false }))} onCaptured={handleCameraCapture} />
      )}
    </div>
  );
}