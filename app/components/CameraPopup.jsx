"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "./Loader";
import HandProcessor from "./HandProcessor";

const translations = {
  en: {
    capturingLetter: "Capturing Letter",
    loading: "Loading Camera...",
    confirm: "Confirm Image",
    retake: "Retake Photo",
    bgNote: "Note: Keep background plain for better accuracy.",
    cameraError: "Camera access denied.",
    uploading: "Uploading...",
    makeThisSign: "Make this sign",
    opacity: "Opacity"
  },
  hi: {
    capturingLetter: "अक्षर कैप्चर करना",
    loading: "कैमरा लोड हो रहा है...",
    confirm: "पुष्टि करें",
    retake: "रीटेक",
    bgNote: "नोट: बेहतर सटीकता के लिए बैकग्राउंड सादा रखें।",
    cameraError: "कैमरा एक्सेस अस्वीकार।",
    uploading: "अपलोड हो रहा है...",
    makeThisSign: "यह मुद्रा बनाएं",
    opacity: "अपारदर्शिता"
  },
  mr: {
    capturingLetter: "अक्षर कॅप्चर",
    loading: "कॅमेरा लोड होत आहे...",
    confirm: "निश्चित करा",
    retake: "पुन्हा घ्या",
    bgNote: "टीप: अचूकतेसाठी पार्श्वभूमी साधी ठेवा.",
    cameraError: "कॅमेरा प्रवेश नाकारला.",
    uploading: "अपलोड होत आहे...",
    makeThisSign: "ही खूण करा",
    opacity: "पारदर्शकता"
  }
};

export default function CameraPopup({ letter, onClose, onCaptured }) {
  const [lang, setLang] = useState("en");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const timerRunning = useRef(false);
  const streamRef = useRef(null);
  const mountedRef = useRef(true);
  const cameraInitRef = useRef(0);
  
  const [segmentationReady, setSegmentationReady] = useState(false);
  const [facingMode, setFacingMode] = useState("user");
  const [showGuide, setShowGuide] = useState(true); // Default to true so they see it first
  const [guideOpacity, setGuideOpacity] = useState(0.5); // Default 50% opacity
  const [timer, setTimer] = useState(0);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [referenceImage, setReferenceImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    setLang(localStorage.getItem("lang") || "en");
    setReferenceImage(`/gestures/${letter}.png`);
    
    return () => {
      mountedRef.current = false;
    };
  }, [letter]);

  const t = translations[lang] || translations.en;

  // Auto-hide guide logic: Show initially, then hide after 4s if user doesn't interact
  useEffect(() => {
    if (isCameraReady && !capturedImage) {
      // Small delay to let user settle, then hide guide automatically
      // You can comment this out if you want it to stay open until clicked
      const timeout = setTimeout(() => {
        // setShowGuide(false); 
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [isCameraReady, capturedImage]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopCamera();
        onClose();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [onClose]);

  const startCountdown = () => {
    if (!isCameraReady || timer > 0) return;
    setShowGuide(false); // Hide guide when taking photo
    timerRunning.current = true;
    setTimer(3);
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.load();
    }
    setIsCameraReady(false);
  }, []);

  const captureImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    window.isCapturingVaani = true;

    requestAnimationFrame(() => {
      const finalImage = canvas.toDataURL("image/png");
      setCapturedImage(finalImage);
      window.isCapturingVaani = false;
      stopCamera();
    });
  }, [stopCamera]);

  const startCamera = useCallback(async () => {
    if (!mountedRef.current) return;
    setIsCameraReady(false);
    setCameraError(false);
    stopCamera();
    await new Promise(resolve => setTimeout(resolve, 100));
    if (!mountedRef.current) return;

    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (!mountedRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        const initVideo = () => {
          if (!videoRef.current || !mountedRef.current) return;
          videoRef.current.play().then(() => {
            const checkReady = () => {
              if (!videoRef.current || !mountedRef.current) return;
              if (videoRef.current.videoWidth > 0) setIsCameraReady(true);
              else requestAnimationFrame(checkReady);
            };
            checkReady();
          }).catch(() => setTimeout(initVideo, 200));
        };
        videoRef.current.onloadedmetadata = initVideo;
        if (videoRef.current.readyState >= 1) initVideo();
      }
    } catch (err) {
      if (mountedRef.current) {
        setCameraError(true);
        setIsCameraReady(false);
      }
    }
  }, [facingMode, stopCamera]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0 && isCameraReady && timerRunning.current) {
      setTimeout(() => {
        captureImage();
        timerRunning.current = false;
      }, 100);
    }
    return () => clearInterval(interval);
  }, [timer, isCameraReady, captureImage]);

  useEffect(() => {
    if (!capturedImage) {
      cameraInitRef.current += 1;
      const currentInit = cameraInitRef.current;
      startCamera();
      return () => {
        if (currentInit === cameraInitRef.current) stopCamera();
      };
    }
  }, [capturedImage, letter, facingMode]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const handleConfirmSave = async () => {
    setProcessing(true);
    try {
      await onCaptured(capturedImage);
    } catch (err) {
      alert("Failed to save image.");
    } finally {
      setProcessing(false);
    }
  };

  const handleFlipCamera = () => {
    if (!isCameraReady) return;
    setFacingMode(f => f === "user" ? "environment" : "user");
  };

  return (
    <>
      <AnimatePresence>
        {(processing || (!segmentationReady && !capturedImage && !cameraError)) && (
          <Loader message={processing ? t.uploading : "Syncing AI..."} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/95 backdrop-blur-md z-[9999] flex items-center justify-center p-2 md:p-4"
      >
        <div className="w-full max-w-md bg-[#111] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl border border-white/10 max-h-[90vh]">
          
          {/* Header */}
          <div className="p-4 flex justify-between items-center text-white shrink-0 bg-black/20">
            <button onClick={() => { stopCamera(); onClose(); }} className="p-2 bg-white/10 rounded-full active:scale-90 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center">
              <h3 className="text-[10px] uppercase tracking-widest text-gray-400">{t.capturingLetter}</h3>
              <p className="text-2xl font-black">{letter}</p>
            </div>
            <button
              onClick={handleFlipCamera}
              className={`p-2 bg-white/10 rounded-full active:scale-90 transition-transform ${!isCameraReady ? 'opacity-50' : ''}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Viewport */}
          <div className="relative aspect-[4/5] w-full bg-black overflow-hidden flex items-center justify-center group">
            {cameraError ? (
              <div className="text-white text-center">
                <p className="mb-4">{t.cameraError}</p>
                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 rounded-lg">Retry</button>
              </div>
            ) : capturedImage ? (
              <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
            ) : (
              <>
                {/* 1. Hidden Video Source */}
                <video ref={videoRef} autoPlay playsInline muted className="absolute opacity-0 pointer-events-none w-1 h-1" />

                {/* 2. Visible Canvas (AI Preview) */}
                <canvas ref={canvasRef} className={`w-full h-full object-contain transition-opacity duration-500 ${isCameraReady ? 'opacity-100' : 'opacity-0'}`} />

                {/* AI Processor */}
                <HandProcessor
                  videoRef={videoRef}
                  canvasRef={canvasRef}
                  isReady={isCameraReady}
                  timer={timer}
                  facingMode={facingMode}
                  onModelReady={() => setSegmentationReady(true)}
                />

                {/* 3. Reference Guide Overlay */}
                <AnimatePresence>
                  {isCameraReady && showGuide && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-20 flex flex-col items-center justify-between py-8 pointer-events-none"
                    >
                      {/* Top Instruction */}
                      <motion.div 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-white/10"
                      >
                        <p className="text-white font-bold text-lg">{t.makeThisSign}</p>
                      </motion.div>

                      {/* The Big Reference Image */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <img
                          src={referenceImage}
                          alt="Guide"
                          style={{ opacity: guideOpacity }}
                          className="w-full h-full object-contain p-8 mix-blend-screen drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-opacity duration-100"
                        />
                      </div>

                      {/* Opacity Slider */}
                      <div className="w-64 bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 pointer-events-auto">
                        <div className="flex justify-between text-xs text-gray-300 mb-2">
                          <span>{t.opacity}</span>
                          <span>{Math.round(guideOpacity * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.05"
                          value={guideOpacity}
                          onChange={(e) => setGuideOpacity(parseFloat(e.target.value))}
                          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 4. Guide Toggle Button (Miniature Image) */}
                {isCameraReady && (
                  <button
                    onClick={() => setShowGuide(!showGuide)}
                    className="absolute top-4 right-4 z-30 w-12 h-12 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 overflow-hidden active:scale-90 transition-all shadow-lg hover:border-white/50"
                  >
                    <img 
                      src={referenceImage} 
                      alt="Toggle Guide" 
                      className={`w-full h-full object-contain p-1 ${showGuide ? 'opacity-100 bg-white/10' : 'opacity-50'}`} 
                    />
                    {!showGuide && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-full h-[1px] bg-white/50 rotate-45 absolute" />
                      </div>
                    )}
                  </button>
                )}

                {/* Timer Animation */}
                <AnimatePresence>
                  {timer > 0 && (
                    <motion.div
                      key={timer}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.5, opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center z-[50] pointer-events-none"
                    >
                      <span className="text-[150px] font-black text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                        {timer}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 bg-[#161616] border-t border-white/5 space-y-4 shrink-0">
            {capturedImage ? (
              <div className="flex gap-4">
                <button
                  onClick={() => { setCapturedImage(null); setTimer(0); }}
                  className="flex-1 py-4 bg-white/10 text-white rounded-2xl font-bold active:scale-95 transition-transform"
                >
                  {t.retake}
                </button>
                <button
                  onClick={handleConfirmSave}
                  className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-bold active:scale-95 transition-transform shadow-lg shadow-green-900/30"
                >
                  {t.confirm}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6">
                <button
                  onClick={startCountdown}
                  disabled={!isCameraReady || timer > 0}
                  className={`w-20 h-20 rounded-full border-[6px] transition-all relative flex items-center justify-center group ${
                    timer > 0
                      ? 'bg-red-500 border-red-400 animate-pulse scale-110'
                      : isCameraReady
                      ? 'bg-white border-gray-300 hover:border-blue-400 hover:scale-105 active:scale-90 shadow-[0_0_30px_rgba(255,255,255,0.1)]'
                      : 'bg-gray-700 border-gray-800 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className={`w-16 h-16 rounded-full border-2 ${timer > 0 ? 'border-white/50' : 'border-black/10'}`} />
                </button>
                <p className="text-[11px] text-gray-500 text-center font-medium tracking-wide">{t.bgNote}</p>
              </div>
            )}
          </div>

        </div>
      </motion.div>
    </>
  );
}