import { useEffect, useState, useRef } from "react";
import { X, Camera, ShieldCheck, Clock, RefreshCw } from "lucide-react";

export function CameraOverlay({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<"camera" | "analyzing" | "result">("camera");
  
  // --- RIKTIG KAMERA-LOGIK ---
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Starta telefonens/datorns bakkamera automatiskt när overlayen öppnas
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" }, // "environment" tvingar mobilen att välja bakkameran!
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false // Vi behöver inget ljud för att läsa av en p-skylt
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      } catch (err) {
        console.error("Kunde inte starta kameran:", err);
        setCameraError("Kunde inte komma åt kameran. Kontrollera dina behörigheter.");
      }
    }

    if (phase === "camera") {
      startCamera();
    }

    // Stäng av kameran direkt när komponenten stängs så att inte batteriet dras i bakgrunden
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [phase]);

  // AI-analys timer (simulerar processandet efter att bilden tagits)
  useEffect(() => {
    if (phase !== "analyzing") return;
    const t = setTimeout(() => setPhase("result"), 2200);
    return () => clearTimeout(t);
  }, [phase]);

  // Funktion för att "frysa" videon och ta en riktig bild ur strömmen
  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Rita av exakt vad kameran visar just nu på canvasen
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Spara bilden som en Base64-textsträng (denna skickas sen live till OpenAI)
      const imageDataUrl = canvas.toDataURL("image/jpeg");
      setCapturedImage(imageDataUrl);
      
      // Stäng av live-strömmen eftersom vi nu har tagit bilden
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Gå vidare till AI-analysen
      setPhase("analyzing");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative flex w-full max-w-[28rem] flex-col bg-[oklch(0.09_0.015_265)]">
        
        {/* Stäng-knapp */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Stäng kameran"
          className="tap glass absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-50 grid size-10 place-items-center rounded-full text-white bg-slate-950/40"
        >
          <X className="size-5" />
        </button>

        {phase !== "result" ? (
          <div className="flex flex-1 flex-col">
            <div className="relative flex-1 overflow-hidden bg-black flex items-center justify-center">
              
              {/* VYN NÄR KAMERAN ÄR LIVE OCH SÖKER */}
              {phase === "camera" && !cameraError && (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}

              {/* VYN NÄR BILDEN ÄR TAGEN OCH ANALYSERAS */}
              {phase === "analyzing" && capturedImage && (
                <img 
                  src={capturedImage} 
                  alt="Fångad parkeringsskylt" 
                  className="absolute inset-0 h-full w-full object-cover opacity-70"
                />
              )}

              {/* Om användaren nekat kamerabehörighet visas detta felmeddelande */}
              {cameraError && (
                <div className="z-10 text-center px-6 space-y-3">
                  <p className="text-sm text-rose-400 font-semibold">{cameraError}</p>
                  <p className="text-xs text-muted-foreground">Klicka på kameratillåtelsen i din webbläsares adressfält.</p>
                </div>
              )}

              {/* Din snygga scanningsram ovanpå kamerabilden */}
              {!cameraError && (
                <div className="absolute inset-x-10 inset-y-24 rounded-3xl border-2 border-sky-500/40 z-10 bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
                  {/* Den lysande scanningslinjen */}
                  <div className="animate-pk-scan absolute inset-x-0 top-1/2 h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_12px_#38bdf8]" />
                  
                  {phase === "analyzing" && (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-950/80 backdrop-blur border border-sky-500/30 px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-2xl">
                      <RefreshCw className="size-4 text-sky-400 animate-spin" />
                      <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Tolkning pågår...</span>
                    </div>
                  )}
                </div>
              )}

              <p className="absolute inset-x-0 bottom-6 text-center text-xs text-slate-300 font-medium z-10 drop-shadow-md bg-slate-950/50 py-1.5 max-w-[20rem] mx-auto rounded-full border border-slate-900/30">
                {phase === "analyzing"
                  ? "P-Koll AI analyserar text och tider…"
                  : "Centrera parkeringsskylten i ramen"}
              </p>
            </div>
            {/* Kameraavtryckaren (Knappen i botten) */}
            <div className="grid place-items-center pb-[max(2rem,env(safe-area-inset-bottom))] pt-6 bg-black/40 border-t border-slate-900/40">
              <button
                type="button"
                onClick={capturePhoto}
                disabled={phase === "analyzing" || !!cameraError}
                aria-label="Ta bild på skylten"
                className="tap grid size-20 place-items-center rounded-full border-4 border-white bg-white/10 hover:bg-white/20 active:scale-95 disabled:opacity-40 transition-all shadow-xl"
              >
                <div className="size-14 rounded-full bg-white flex items-center justify-center text-slate-950 font-bold">
                  <Camera className="size-6 text-slate-950" />
                </div>
              </button>
            </div>
          </div>
        ) : (
          /* VYN SOM VISAR AI-SVARET NÄR BILDEN HAR ANALYSERATS */
          <div className="flex flex-1 flex-col justify-end p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
            <div className="animate-pk-rise rounded-3xl border border-emerald-500/30 bg-slate-900/80 backdrop-blur p-6 shadow-2xl space-y-4">
              
              {/* Grönt framgångshuvud */}
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="size-5 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  P-Koll AI Svar
                </span>
              </div>
              
              {/* Mänskligt svar */}
              <div>
                <h2 className="text-2xl font-black text-emerald-400 tracking-tight">Ja, du får stå här!</h2>
                <p className="mt-1 text-sm text-slate-300 leading-relaxed">
                  Men glöm inte P-skivan. Du behöver ställa in din ankomsttid direkt i bilrutan.
                </p>
              </div>

              {/* Tidsvarning */}
              <div className="flex items-start gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-amber-400">
                <Clock className="size-5 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold">Flytta bilen senast kl. 14:15</p>
                  <p className="text-[11px] text-amber-400/70 mt-0.5">Efter det startar den tidsbegränsade avgiften på gatan.</p>
                </div>
              </div>

              {/* Tillbakaknapp */}
              <button
                type="button"
                onClick={onClose}
                className="tap w-full rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white py-4 font-bold tracking-wide shadow-lg shadow-sky-500/10 transition active:scale-[0.99]"
              >
                Tillbaka till kartan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
