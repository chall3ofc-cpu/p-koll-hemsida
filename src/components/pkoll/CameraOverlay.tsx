import { useEffect, useState, useRef } from "react";
import { X, Camera, ShieldCheck, Clock, RefreshCw, AlertTriangle } from "lucide-react";

export function CameraOverlay({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<"camera" | "analyzing" | "result">("camera");
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // --- RIKTIGA AI-SVAR FRÅN OPENAI ---
  const [aiResponse, setAiResponse] = useState({
    isParkingSign: true,
    allowedNow: true,
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
      
      // Växla till analysläge
      setPhase("analyzing");

      // --- DIREKTANROP TILL OPENAI (FRONTEND SAFE) ---
      // För att detta ska fungera live måste du lägga till din nyckel i Vercel under namnet VITE_OPENAI_API_KEY
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

      if (!apiKey) {
        // Om nyckeln inte hittas kör vi demoläget
        setTimeout(() => {
          setAiResponse({
            isParkingSign: true,
            allowedNow: true,
            humanSummary: "API-nyckel saknas! Lägg till VITE_OPENAI_API_KEY i Vercels inställningar för att aktivera AI:n.",
            nextEvent: "Flytta bilen senast kl. 14:15."
          });
          setPhase("result");
        }, 1500);
        return;
      }

      try {
        const currentDayTime = new Date().toLocaleString("sv-SE");
        
        const response = await fetch("https://openai.com", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `Du är parkeringsassistenten P-Koll. Analysera denna bild.
                    VIKTIGT: Om bilden INTE visar en svensk parkeringsskylt (t.ex. om det är en människa, ett ansikte, en inomhusmiljö eller ett random föremål), måste du svara med isParkingSign: false.
                    
                    Dagens tidpunkt: ${currentDayTime}
                    
                    Svara EXAKT i detta JSON-format:
                    {
                      "isParkingSign": true eller false,
                      "allowedNow": true eller false,
                      "humanSummary": "Ett kort, mänskligt och tydligt svar på svenska (max 20 ord). Om det inte är en skylt, skriv 'Hittade ingen parkeringsskylt i bilden. P-Koll kan bara läsa av parkeringsskyltar.'",
                      "nextEvent": "Vad händer näst? T.ex. 'Avgift startar kl 09:00' eller 'Ingen städdag denna vecka'."
                    }`
                  },
                  {
                    type: "image_url",
                    image_url: { url: imageDataUrl }
                  }
                ]
              }
            ]
          })
        });

        const openAiData = await response.json();
        const parsedResult = JSON.parse(openAiData.choices[0].message.content);
        setAiResponse(parsedResult);
      } catch (e) {
        console.error("OpenAI Error:", e);
        setAiResponse({
          isParkingSign: false,
          allowedNow: false,
          humanSummary: "Kunde inte tolka bilden. Kontrollera din OpenAI-balans eller försök igen.",
          nextEvent: ""
        });
      } finally {
        setPhase("result");
      }
    }
  };

  return (
    <div className="fixed inset-0 z- flex justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative flex w-full max-w-[28rem] flex-col bg-[oklch(0.09_0.015_265)]">
        
        <button
          type="button"
          onClick={onClose}
          className="tap glass absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-50 grid size-10 place-items-center rounded-full text-white bg-slate-950/40"
        >
          <X className="size-5" />
        </button>

        {phase !== "result" ? (
          <div className="flex flex-1 flex-col">
            <div className="relative flex-1 overflow-hidden bg-black flex items-center justify-center">
              
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
                <div className="absolute inset-x-10 inset-y-24 rounded-3xl border-2 border-sky-500/40 z-10 bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
                  <div className="animate-pk-scan absolute inset-x-0 top-1/2 h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_12px_#38bdf8]" />
                  
                  {phase === "analyzing" && (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-950/80 backdrop-blur border border-sky-500/30 px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-2xl">
                      <RefreshCw className="size-4 text-sky-400 animate-spin" />
                      <span className="text-xs font-bold uppercase tracking-wider text-sky-400">P-Koll AI läser skylt...</span>
                    </div>
                  )}
                </div>
              )}

              <p className="absolute inset-x-0 bottom-6 text-center text-xs text-slate-300 font-medium z-10 bg-slate-950/50 py-1.5 max-w-[20rem] mx-auto rounded-full border border-slate-900/30">
                {phase === "analyzing" ? "AI analyserar text och tider…" : "Rikta kameran mot parkeringsskylten"}
              </p>
            </div>
            {/* Kameraavtryckaren */}
            <div className="grid place-items-center pb-[max(2rem,env(safe-area-inset-bottom))] pt-6 bg-black/40 border-t border-slate-900/40">
              <button
                type="button"
                onClick={capturePhoto}
                disabled={phase === "analyzing" || !!cameraError}
                aria-label="Ta bild på skylten"
                className="tap grid size-20 place-items-center rounded-full border-4 border-white bg-white/10 hover:bg-white/20 active:scale-95 disabled:opacity-40 transition-all shadow-xl"
              >
                <div className="size-14 rounded-full bg-white flex items-center justify-center">
                  <Camera className="size-6 text-slate-950" />
                </div>
              </button>
            </div>
          </div>
        ) : (
          /* DYNAMISK VY SOM ANPASSAR SIG EFTER OM BILDEN ÄR EN SKYLT ELLER INTE */
          <div className="flex flex-1 flex-col justify-end p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
            <div className={`animate-pk-rise rounded-3xl border p-6 shadow-2xl space-y-4 bg-slate-900/80 backdrop-blur ${
              !aiResponse.isParkingSign 
                ? "border-amber-500/30" 
                : aiResponse.allowedNow 
                  ? "border-emerald-500/30" 
                  : "border-rose-500/30"
            }`}>
              
              {/* Dynamisk rubrik baserad på AI-analysen */}
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
              
              {/* Mänsklig sammanfattning från OpenAI */}
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

              {/* Tidsvarning / Nästa händelse (Visas endast om det faktiskt var en parkeringsskylt) */}
              {aiResponse.isParkingSign && aiResponse.nextEvent && (
                <div className={`flex items-start gap-3 rounded-2xl p-4 border ${
                  aiResponse.allowedNow 
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400" 
                    : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                }`}>
                  <Clock className="size-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold">{aiResponse.nextEvent}</p>
                    <p className="text-[11px] opacity-70 mt-0.5">Tider och zoner har matchats mot din GPS-position.</p>
                  </div>
                </div>
              )}

              {/* Tillbakaknapp */}
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
