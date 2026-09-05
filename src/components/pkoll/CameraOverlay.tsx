import { useEffect, useState, useRef } from "react";
import { Camera, ShieldCheck, Clock, RefreshCw, AlertTriangle, ArrowLeft } from "lucide-react";

export function CameraOverlay({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<"camera" | "analyzing" | "result">("camera");
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [aiResponse, setAiResponse] = useState({
    isParkingSign: false,
    allowedNow: false,
    humanSummary: "Analyserar...",
    nextEvent: "Hämtar data..."
  });

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      } catch (err) {
        setCameraError("Kunde inte komma åt kameran. Kontrollera dina behörigheter.");
      }
    }

    if (phase === "camera") {
      startCamera();
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [phase]);

  const capturePhoto = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL("image/jpeg");
      setCapturedImage(imageDataUrl);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      setPhase("analyzing");

      // SKARPT ANROP TILL DIN NYA SÄKRA BACKEND-SERVER
      try {
        const currentDayTime = new Date().toLocaleString("sv-SE");
        
        const response = await fetch("/api/interpret-sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: imageDataUrl, time: currentDayTime })
        });
        
        if (!response.ok) throw new Error("Serverfel");
        
        const aiData = await response.json();
        setAiResponse(aiData);
      } catch (e) {
        console.error("Det gick inte att nå AI-servern:", e);
        setAiResponse({
          isParkingSign: false,
          allowedNow: false,
          humanSummary: "Kunde inte tolka bilden. Kontrollera att din OpenAI-nyckel är inlagd på Vercel och har pengar på saldot.",
          nextEvent: ""
        });
      } finally {
        setPhase("result");
      }
    }
  };

  return (
    <div className="fixed inset-0 h-screen w-screen z-50 flex justify-center bg-slate-950 overflow-hidden">
      <div className="relative flex h-full w-full max-w-[28rem] flex-col bg-black">
        
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-4 bg-gradient-to-b from-black/80 to-transparent">
          <button
            type="button"
            onClick={onClose}
            className="tap flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 backdrop-blur border border-slate-800 text-sm font-semibold text-white shadow-lg active:scale-95 transition-transform"
          >
            <ArrowLeft className="size-4 text-sky-400" />
            <span>Tillbaka</span>
          </button>
        </div>

        {phase !== "result" ? (
          <div className="flex flex-1 flex-col h-full justify-between">
            <div className="relative flex-1 bg-black flex items-center justify-center">
              
              {phase === "camera" && !cameraError && (
                <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 h-full w-full object-cover" />
              )}

              {phase === "analyzing" && capturedImage && (
                <img src={capturedImage} alt="Skylt" className="absolute inset-0 h-full w-full object-cover opacity-70" />
              )}

              {cameraError && (
                <div className="z-10 text-center px-6 space-y-3">
                  <p className="text-sm text-rose-400 font-semibold">{cameraError}</p>
                </div>
              )}

              {!cameraError && (
                <div className="absolute inset-x-8 inset-y-28 rounded-3xl border-2 border-sky-500/50 z-10 bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] pointer-events-none">
                  <div className="animate-pk-scan absolute inset-x-0 top-1/2 h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_15px_#38bdf8]" />
                  
                  {phase === "analyzing" && (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-950/90 backdrop-blur border border-sky-500/30 px-5 py-3 rounded-2xl flex items-center gap-2 shadow-2xl">
                      <RefreshCw className="size-4 text-sky-400 animate-spin" />
                      <span className="text-xs font-bold uppercase tracking-wider text-sky-400">P-Koll läser skylt...</span>
                    </div>
                  )}
                </div>
              )}

              <p className="absolute inset-x-0 bottom-6 text-center text-xs text-slate-300 font-medium z-10 bg-slate-950/70 py-2 max-w-[18rem] mx-auto rounded-full border border-slate-900/40 backdrop-blur-sm">
                {phase === "analyzing" ? "AI analyserar text och tider…" : "Rama in parkeringsskylten i rutan"}
              </p>
            </div>
            {/* Kameraavtryckaren */}
            <div className="grid place-items-center pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-6 bg-slate-950 border-t border-slate-900/60 z-30 shrink-0">
              <button
                type="button"
                onClick={capturePhoto}
                disabled={phase === "analyzing" || !!cameraError}
                aria-label="Ta bild på skylten"
                className="tap grid size-20 place-items-center rounded-full border-4 border-white bg-white/10 hover:bg-white/20 active:scale-95 disabled:opacity-40 transition-all shadow-2xl"
              >
                <div className="size-14 rounded-full bg-white flex items-center justify-center shadow-lg">
                  <Camera className="size-6 text-slate-950" />
                </div>
              </button>
            </div>
          </div>
        ) : (
          /* FULLSKÄRMS AI-RESULTAT — Helt baserat på äkta data från OpenAI på servern */
          <div className="flex flex-1 flex-col justify-end p-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 h-full">
            <div className={`animate-pk-rise rounded-3xl border p-6 shadow-2xl space-y-4 bg-slate-900/90 backdrop-blur-md ${
              !aiResponse.isParkingSign 
                ? "border-amber-500/30" 
                : aiResponse.allowedNow 
                  ? "border-emerald-500/30" 
                  : "border-rose-500/30"
            }`}>
              
              <div className={`flex items-center gap-2 ${
                !aiResponse.isParkingSign 
                  ? "text-amber-400" 
                  : aiResponse.allowedNow 
                    ? "text-emerald-400" 
                    : "text-rose-400"
              }`}>
                {(!aiResponse.isParkingSign || !aiResponse.allowedNow) ? (
                  <AlertTriangle className="size-5 animate-pulse" />
                ) : (
                  <ShieldCheck className="size-5 animate-pulse" />
                )}
                <span className={`text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
                  !aiResponse.isParkingSign 
                    ? "bg-amber-500/10 border-amber-500/20" 
                    : aiResponse.allowedNow 
                      ? "bg-emerald-500/10 border-emerald-500/20" 
                      : "bg-rose-500/10 border-rose-500/20"
                }`}>
                  {!aiResponse.isParkingSign ? "P-Koll Avvikelse" : "P-Koll AI Svar"}
                </span>
              </div>
              
              <div>
                <h2 className={`text-2xl font-black tracking-tight ${
                  !aiResponse.isParkingSign 
                    ? "text-amber-400" 
                    : aiResponse.allowedNow 
                      ? "text-emerald-400" 
                      : "text-rose-400"
                }`}>
                  {!aiResponse.isParkingSign 
                    ? "Kunde inte tolka" 
                    : aiResponse.allowedNow 
                      ? "Ja, du får stå här!" 
                      : "Nej, du får inte stå här!"}
                </h2>
                <p className="mt-1 text-sm text-slate-300 leading-relaxed">
                  {aiResponse.humanSummary}
                </p>
              </div>

              {aiResponse.isParkingSign && aiResponse.nextEvent && (
                <div className={`flex items-start gap-3 rounded-2xl p-4 border ${
                  aiResponse.allowedNow 
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400" 
                    : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                }`}>
                  <Clock className="size-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold">{aiResponse.nextEvent}</p>
                    <p className="text-[11px] opacity-70 mt-0.5">Beräknat säkert via P-Koll API-server.</p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                className="tap w-full rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white py-4 font-bold tracking-wide shadow-lg shadow-sky-500/10 transition active:scale-[0.99]"
              >
                {!aiResponse.isParkingSign ? "Försök igen" : "Tillbaka till kartan"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
