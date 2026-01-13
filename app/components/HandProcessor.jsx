"use client";
import { useEffect, useRef, useState } from "react";

// Singleton instance
let globalHands = null;
let initPromise = null;

export default function HandProcessor({ videoRef, canvasRef, isReady, facingMode, onModelReady }) {
  const [modelLoaded, setModelLoaded] = useState(false);
  const isRunning = useRef(false);
  const processingRef = useRef(false);

  // We use this function to attach the 'onResults' listener to the NEW refs
  const setupResultsListener = (handsInstance, currentVideoRef, currentCanvasRef) => {
    handsInstance.onResults((results) => {
      // 1. Get the CURRENT refs from this specific render cycle
      const video = currentVideoRef.current;
      const canvas = currentCanvasRef.current;

      // 2. Strict Safety Checks
      if (!video || !canvas || video.videoWidth === 0) return;

      // 3. Resize Canvas if needed
      if (canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      const ctx = canvas.getContext("2d");
      ctx.save();

      // 4. Mirroring
      if (facingMode === "user") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      // 5. Draw Green Screen Background
      ctx.fillStyle = "#00FF00";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 6. Draw Hands (Cutout)
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        results.multiHandLandmarks.forEach((landmarks) => {
          const xs = landmarks.map((p) => p.x * canvas.width);
          const ys = landmarks.map((p) => p.y * canvas.height);

          const padding = 60;
          const minX = Math.max(0, Math.min(...xs) - padding);
          const maxX = Math.min(canvas.width, Math.max(...xs) + padding);
          const minY = Math.max(0, Math.min(...ys) - padding);
          const maxY = Math.min(canvas.height, Math.max(...ys) + padding);

          ctx.save();
          ctx.beginPath();
          ctx.rect(minX, minY, maxX - minX, maxY - minY);
          ctx.clip();
          ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
          
          ctx.restore();
        });
      }

      ctx.restore();
      processingRef.current = false;
    });
  };

  useEffect(() => {
    const initAI = async () => {
      // CASE 1: AI is already running (User switched letters)
      if (globalHands) {
        // *** CRITICAL FIX: Update the listener to point to the NEW video/canvas ***
        setupResultsListener(globalHands, videoRef, canvasRef);
        setModelLoaded(true);
        onModelReady();
        return;
      }

      // CASE 2: AI is initializing (First load)
      if (initPromise) {
        await initPromise;
        // After waiting, update listener for this component instance
        if (globalHands) {
           setupResultsListener(globalHands, videoRef, canvasRef);
           setModelLoaded(true);
           onModelReady();
        }
        return;
      }

      // CASE 3: Fresh Start
      initPromise = (async () => {
        if (!window.Hands) {
          const script = document.createElement("script");
          script.src = "/mediapipe/hands/hands.js";
          script.async = true;
          await new Promise((r) => { script.onload = r; document.head.appendChild(script); });
        }

        const hands = new window.Hands({
          locateFile: (file) => `/mediapipe/hands/${file}`,
        });

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        await hands.initialize();
        globalHands = hands;
        return hands;
      })();

      try {
        const hands = await initPromise;
        // Apply listener for the first time
        setupResultsListener(hands, videoRef, canvasRef);
        setModelLoaded(true);
        onModelReady();
      } catch (error) {
        console.error("AI Init Error:", error);
      }
    };

    initAI();
  }, [facingMode]); // Re-run if camera flips

  // --- Processing Loop ---
  useEffect(() => {
    // Wait for everything to be ready
    if (!modelLoaded || !isReady || !videoRef.current) return;

    isRunning.current = true;
    processingRef.current = false;

    const run = async () => {
      // Get the CURRENT video element
      const video = videoRef.current;

      // STOP if component unmounted or video is gone
      if (!isRunning.current || !globalHands || !video) return;

      // Only process if video has data
      if (video.readyState >= 2 && !processingRef.current) {
        processingRef.current = true;
        try {
          await globalHands.send({ image: video });
        } catch (e) {
          console.warn("AI Dropped Frame:", e);
          processingRef.current = false;
        }
      }

      if (isRunning.current) {
        requestAnimationFrame(run);
      }
    };

    run();

    return () => {
      isRunning.current = false;
    };
  }, [modelLoaded, isReady]); // Dependencies ensures loop restarts if state changes

  return null;
}