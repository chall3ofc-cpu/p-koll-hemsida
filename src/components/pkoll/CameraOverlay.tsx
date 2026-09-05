import { useEffect, useState } from "react";
import { X, Camera, ShieldCheck, Clock } from "lucide-react";

export function CameraOverlay({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<"camera" | "analyzing" | "result">("camera");

  useEffect(() => {
    if (phase !== "analyzing") return;
    const t = setTimeout(() => setPhase("result"), 1600);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div className="fixed inset-0 z-[60] flex justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative flex w-full max-w-[28rem] flex-col bg-[oklch(0.09_0.015_265)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Stäng kameran"
          className="tap glass absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-10 grid size-10 place-items-center rounded-full"
        >
          <X className="size-5" />
        </button>

        {phase !== "result" ? (
          <div className="flex flex-1 flex-col">
            <div className="relative flex-1 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_40%,oklch(0.3_0.02_260),oklch(0.12_0.015_265))]" />
              <div className="absolute inset-x-10 inset-y-24 rounded-3xl border-2 border-foreground/30">
                <div className="animate-pk-scan absolute inset-x-0 top-1/2 h-24 bg-gradient-to-b from-transparent via-primary/35 to-transparent" />
                <div className="absolute left-1/2 top-1/2 w-40 -translate-x-1/2 -translate-y-1/2 rotate-[-2deg] rounded-xl bg-foreground/90 p-3 text-center shadow-2xl">
                  <p className="text-[0.6rem] font-bold text-background">P-SKIVA</p>
                  <p className="font-display text-2xl font-black text-background">2 tim</p>
                  <p className="text-[0.6rem] font-semibold text-background/70">Vard 8–18</p>
                </div>
              </div>
              <p className="absolute inset-x-0 bottom-6 text-center text-xs text-muted-foreground">
                {phase === "analyzing"
                  ? "AI analyserar skylten…"
                  : "Rikta kameran mot parkeringsskylten"}
              </p>
            </div>
            <div className="grid place-items-center pb-[max(2rem,env(safe-area-inset-bottom))] pt-6">
              <button
                type="button"
                onClick={() => setPhase("analyzing")}
                disabled={phase === "analyzing"}
                aria-label="Ta bild på skylten"
                className="tap grid size-20 place-items-center rounded-full border-4 border-foreground/80 bg-foreground/10 disabled:opacity-60"
              >
                <Camera className="size-7" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col justify-end p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <div className="animate-pk-rise rounded-3xl border border-success/30 bg-surface p-5 shadow-2xl">
              <div className="flex items-center gap-2 text-success">
                <ShieldCheck className="size-5" />
                <span className="text-xs font-bold uppercase tracking-widest">AI-svar</span>
              </div>
              <h2 className="mt-3 text-2xl font-bold text-success">Ja, du får stå här!</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Men glöm inte P-skivan. Ställ in ankomsttid direkt.
              </p>
              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-warning/10 p-4 text-warning">
                <Clock className="size-5 shrink-0" />
                <p className="text-sm font-semibold">
                  Du måste flytta bilen senast kl. 14:15.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="tap mt-5 w-full rounded-2xl bg-primary py-3.5 font-semibold text-primary-foreground"
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
