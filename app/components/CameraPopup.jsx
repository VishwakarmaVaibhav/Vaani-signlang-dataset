"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "./Loader"; // Ensure this component exists

const translations = {
  en: {
    capturingLetter: "Capturing Letter",
    guideOpacity: "Guide Opacity",
    loading: "Loading Camera...",
    confirm: "Confirm Image",
    retake: "Retake Photo",
    bgNote: "Note: Please keep the background plain for better accuracy.",
    galleryFallback: "Or Upload from Gallery",
    cameraError: "Camera access denied or not supported.",
    uploading: "Uploading to Database..."
  },
  hi: {
    capturingLetter: "अक्षर कैप्चर करना",
    guideOpacity: "गाइड अपारदर्शिता",
    loading: "कैमरा लोड हो रहा है...",
    confirm: "छवि की पुष्टि करें",
    retake: "फिर से फोटो लें",
    bgNote: "नोट: बेहतर सटीकता के लिए कृपया बैकग्राउंड को सादा रखें।",
    galleryFallback: "या गैलरी से अपलोड करें",
    cameraError: "कैमरा एक्सेस अस्वीकार कर दिया गया।",
    uploading: "डेटा अपलोड हो रहा है..."
  },
  mr: {
    capturingLetter: "अक्षर कॅप्चर करत आहे",
    guideOpacity: "मार्गदर्शक पारदर्शकता",
    loading: "कॅमेरा लोड होत आहे...",
    confirm: "प्रतिमा निश्चित करा",
    retake: "फोटो पुन्हा घ्या",
    bgNote: "टीप: अधिक अचूकतेसाठी कृपया पार्श्वभूमी साधी ठेवा.",
    galleryFallback: "किंवा गॅलरीतून अपलोड करा",
    cameraError: "कॅमेरा प्रवेश नाकारला गेला आहे किंवा समर्थित नाही.",
    uploading: "डेटाबेसमध्ये अपलोड होत आहे..."
  }
  
};

export default function CameraPopup({ letter, onClose, onCaptured }) {
  const [lang, setLang] = useState("en");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const timerRunning = useRef(false);
  
  const [facingMode, setFacingMode] = useState("user");
  const [guideOpacity, setGuideOpacity] = useState(0.4);
  const [timer, setTimer] = useState(0);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [referenceImage, setReferenceImage] = useState(null);
  const [processing, setProcessing] = useState(false); // Manages the SVG Loader

  useEffect(() => {
    setLang(localStorage.getItem("lang") || "en");
    setReferenceImage(`/gestures/${letter}.png`);
  }, [letter]);

  const t = translations[lang] || translations.en;

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setIsCameraReady(false);
    setError(null);
    stopCamera();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setIsCameraReady(true);
      }
    } catch (err) {
      console.error("Camera Error:", err);
      setError(true);
    }
  }, [facingMode, stopCamera]);

  // Handle Countdown Timer
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0 && isCameraReady && !capturedImage && timerRunning.current) {
      captureImage();
      timerRunning.current = false;
    }
    return () => clearInterval(interval);
  }, [timer, isCameraReady, capturedImage]);

  const startCountdown = () => {
    if (!isCameraReady || timer > 0) return;
    timerRunning.current = true;
    setTimer(3);
  };

  useEffect(() => {
    if (!capturedImage) startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera, capturedImage]);

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    const videoHeight = video.videoHeight;
    const videoWidth = video.videoWidth;
    const targetWidth = videoHeight * 0.8; // 4:5
    const startX = (videoWidth - targetWidth) / 2;

    canvas.width = targetWidth;
    canvas.height = videoHeight;

    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    
    ctx.drawImage(video, startX, 0, targetWidth, videoHeight, 0, 0, targetWidth, videoHeight);
    setCapturedImage(canvas.toDataURL("image/png"));
    stopCamera();
  };

  /**
   * ACTUAL CONFIRMATION LOGIC
   * This handles the async upload to the database
   */
  const handleConfirmSave = async () => {
    setProcessing(true);
    try {
      // Logic passed from UploadWizard (fetch call)
      await onCaptured(capturedImage); 
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save image. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target.result);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* PROCESSING OVERLAY */}
      <AnimatePresence>
        {processing && <Loader message={t.uploading} />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/95 backdrop-blur-md z-[9999] flex items-center justify-center p-2 md:p-4"
      >
        <div className="w-full max-w-md bg-[#111] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl border border-white/10 max-h-[90vh]">
          
          {/* Header */}
          <div className="p-4 flex justify-between items-center text-white shrink-0">
            <button onClick={() => { stopCamera(); onClose(); }} className="p-2 bg-white/10 rounded-full active:scale-90">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="text-center">
              <h3 className="text-[10px] uppercase tracking-widest text-gray-400">{t.capturingLetter}</h3>
              <p className="text-2xl font-black">{letter}</p>
            </div>
            <button onClick={() => setFacingMode(f => f === "user" ? "environment" : "user")} className="p-2 bg-white/10 rounded-full active:scale-90">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </div>

          {/* Viewport */}
          <div className="relative aspect-[4/5] w-full bg-black overflow-hidden flex items-center justify-center">
            {capturedImage ? (
              <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
            ) : error ? (
              <div className="flex flex-col items-center p-6 text-center text-gray-400">
                 <svg className="w-12 h-12 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                 <p className="text-sm font-medium">{t.cameraError}</p>
                 <button onClick={() => fileInputRef.current.click()} className="mt-4 bg-blue-600 px-6 py-2 rounded-full text-white font-bold">{t.galleryFallback}</button>
              </div>
            ) : (
              <>
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }} />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6" style={{ opacity: guideOpacity }}>
                  <img src={referenceImage} alt="Guide" className="w-full h-full object-contain mix-blend-screen" />
                </div>
                <AnimatePresence>
                  {timer > 0 && (
                    <motion.span key={timer} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.5, opacity: 0 }} className="absolute text-9xl font-bold text-white z-20">
                      {timer}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 bg-black/50 backdrop-blur-md space-y-4 shrink-0">
            {capturedImage ? (
              <div className="flex gap-4">
                <button onClick={() => { setCapturedImage(null); setTimer(0); }} className="flex-1 py-4 bg-white/10 text-white rounded-2xl font-bold">{t.retake}</button>
                <button onClick={handleConfirmSave} className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-bold">{t.confirm}</button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6">
                <div className="w-full flex items-center gap-4 text-white">
                  <input type="range" min="0" max="0.8" step="0.1" value={guideOpacity} onChange={(e) => setGuideOpacity(parseFloat(e.target.value))} className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none accent-blue-600" />
                </div>

                <div className="flex flex-col items-center gap-4 w-full">
                  <button onClick={startCountdown} disabled={!isCameraReady || timer > 0} className="w-16 h-16 bg-white rounded-full border-4 border-gray-500 active:scale-90 disabled:opacity-20" />
                  <button onClick={() => fileInputRef.current.click()} className="text-xs font-bold text-blue-500">{t.galleryFallback}</button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
                <p className="text-[10px] text-gray-500 text-center">{t.bgNote}</p>
              </div>
            )}
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </motion.div>
    </>
  );
}