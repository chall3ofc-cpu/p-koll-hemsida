import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search,
  UserRound,
  Share2,
  X,
  MessageCircle,
  Smartphone,
  LocateFixed,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { MapCanvas } from "@/components/pkoll/MapCanvas";
import { CameraOverlay } from "@/components/pkoll/CameraOverlay";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "P-Koll — Smart parkeringshjälp i mobilen" },
      {
        name: "description",
        content:
          "P-Koll visar direkt om du får parkera, vad det kostar och när städdagen kommer. Fota skylten och få svar av AI.",
      },
      { property: "og:title", content: "P-Koll — Smart parkeringshjälp i mobilen" },
      {
        property: "og:description",
        content: "Se taxa, städdagar och lediga zoner på kartan. Fota skylten, få svar direkt.",
      },
    ],
  }),
  component: KartaPage,
});

function formatFuture(minutes: number) {
  const d = new Date();
  d.setMinutes(d.getMinutes() + minutes);
  return d.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
}

function KartaPage() {
  const [minutes, setMinutes] = useState(0);
  const [camera, setCamera] = useState(false);
  const [share, setShare] = useState(false);
  
  // Styr om bottenpanelen är utfälld eller minimerad
  const [isExpanded, setIsExpanded] = useState(true);

  const free = minutes > 120;
  const timeLabel = useMemo(
    () => (minutes === 0 ? "Just nu" : `Framspolat till kl. ${formatFuture(minutes)}`),
    [minutes],
  );

  return (
    <div className="relative flex h-full flex-col">
      {/* Map area — keep clean for real map injection */}
      <div className="absolute inset-0">
        <MapCanvas />
      </div>

      {/* Header */}
      <header className="relative z-20 flex items-center gap-2 px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="glass flex min-w-0 flex-1 items-center gap-2 rounded-2xl px-4 py-3 shadow-xl">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Sök adress, gata eller stad..."
            aria-label="Sök adress, gata eller stad"
          />
        </div>
        <Link
          to="/konto"
          aria-label="Mitt konto"
          className="tap glass grid size-12 shrink-0 place-items-center rounded-2xl text-primary shadow-xl"
        >
          <UserRound className="size-5" />
        </Link>
      </header>

      {/* Bottom sheet & Controls container */}
      <div className="relative z-20 mt-auto flex flex-col w-full">
        {/* Knappraden ovanför panelen (Bara centrera-knappen till höger nu) */}
        <div className="flex justify-end px-4 pb-3">
          <button
            type="button"
            aria-label="Centrera kartan på min position"
            className="tap glass grid size-12 place-items-center rounded-2xl text-primary shadow-xl"
          >
            <LocateFixed className="size-5" />
          </button>
        </div>

        {/* Bottenpanelen med inbyggd slide-animering och anpassad höjd för att inte krocka med TabBar */}
        <section 
          className={`glass rounded-t-[2rem] px-5 pb-[calc(6.5rem+env(safe-area-inset-bottom))] shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.9)] transition-all duration-500 ease-in-out flex flex-col ${
            isExpanded ? "max-h-[58vh] pt-3" : "h-[135px] pt-2 pb-16 overflow-hidden border-b-0"
          }`}
        >
          {/* Centrerad knapp i toppen — Trycks upp säkert över nav-baren när panelen stängs */}
          <div className="w-full flex justify-center pt-1 pb-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? "Dölj parkeringsinfo" : "Visa parkeringsinfo"}
              className={`tap flex items-center justify-center h-8 px-6 rounded-full shadow-lg text-white font-semibold text-[11px] uppercase tracking-wider transition-all duration-300 transform active:scale-95 ${
                isExpanded 
                  ? "bg-rose-600 hover:bg-rose-500 shadow-rose-950/20" 
                  : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/45 border border-emerald-400/20 animate-pulse"
              }`}
            >
              <span className="mr-1">{isExpanded ? "Dölj info" : "Visa info"}</span>
              {isExpanded ? <ChevronDown className="size-3.5 animate-bounce" /> : <ChevronUp className="size-3.5" />}
            </button>
          </div>

          {/* Allt detta innehåll döljs mjukt när panelen är minimerad */}
          <div className={`flex-1 overflow-y-auto space-y-4 transition-opacity duration-300 custom-scrollbar ${
            isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}>
            {/* Status card */}
            <div
              className={`spring rounded-3xl border p-5 text-center ${
                free
                  ? "border-success/30 bg-success/10"
                  : "border-warning/30 bg-warning/10"
              }`}
            >
              {free ? (
                <>
                  <p className="font-display text-2xl font-bold text-success">🟢 Ledigt & Gratis!</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Ingen avgift på Vasagatan vid kl. {formatFuture(minutes)}. Du kan stå kvar till
                    måndag 09:00.
                  </p>
                </>
              ) : (
                <>
                  <span className="inline-flex items-center gap-2 rounded-full bg-warning/20 px-4 py-2 font-display text-lg font-bold text-warning">
                    🟡 Taxa 3 (20 kr/tim)
                  </span>
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <p>Just nu fram till 19:00.</p>
                    <p>Efter 19:00: Gratis till måndag 09:00.</p>
                    <p className="text-danger">Obs! Städdag torsdagar 08–12.</p>
                  </div>
                </>
              )}
            </div>

            {/* Payment apps */}
            <div className="grid grid-cols-2 gap-3">
              <button className="tap rounded-2xl border border-hairline bg-surface-2 px-3 py-3.5 text-sm font-semibold">
                <span className="block text-[0.65rem] uppercase tracking-widest text-muted-foreground">
                  Zon 4021
                </span>
                Betala med EasyPark
              </button>
              <button className="tap rounded-2xl border border-hairline bg-surface-2 px-3 py-3.5 text-sm font-semibold">
                <span className="block text-[0.65rem] uppercase tracking-widest text-muted-foreground">
                  Zon 4021
                </span>
                Betala med Parkster
              </button>
            </div>

            {/* Dela plats */}
            <button
              onClick={() => setShare(true)}
              className="tap flex w-full items-center justify-center gap-2 rounded-2xl border border-hairline py-3 text-sm font-semibold text-muted-foreground"
            >
              <Share2 className="size-4" /> Dela plats
            </button>

            {/* Time travel */}
            <div className="rounded-3xl bg-surface-2/60 p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <h2 className="truncate text-sm font-semibold">Tidsresa</h2>
                <span className="spring shrink-0 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                  {timeLabel}
                </span>
              </div>
              <Slider
                className="mt-5"
                value={[minutes]}
                onValueChange={(v) => setMinutes(v ?? 0)}
                min={0}
                max={240}
                step={60}
                aria-label="Tidsresa"
              />
              <div className="mt-3 flex justify-between text-[0.68rem] font-medium text-muted-foreground">
                {["Nu", "+1h", "+2h", "+3h", "+4h"].map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
            </div>

            {/* Primary CTA */}
            <button
              onClick={() => setCamera(true)}
              className="tap glow-primary w-full rounded-3xl bg-primary py-5 font-display text-lg font-bold tracking-tight text-primary-foreground"
            >
              📸 FOTA SKYLT (AI)
            </button>
          </div>
        </section>
      </div>

      {camera && <CameraOverlay onClose={() => setCamera(false)} />}

      {share && (
        <div className="fixed inset-0 z- flex items-end justify-center bg-black/60 backdrop-blur-sm">
          <div className="animate-pk-rise w-full max-w-[28rem] rounded-t-[2rem] border-t border-hairline bg-surface p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <h2 className="truncate text-lg font-bold">Dela den gröna zonen</h2>
              <button
                onClick={() => setShare(false)}
                aria-label="Stäng"
                className="tap grid size-9 shrink-0 place-items-center rounded-full bg-secondary"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Skicka den här gröna zonen till en vän via WhatsApp eller SMS.
            </p>
            <div className="mt-4 rounded-2xl bg-surface-2 p-4 text-sm">
              <p className="font-semibold">Vasagatan, Stockholm</p>
              <p className="text-muted-foreground">Gratis efter 19:00 — p-koll.se/z/4021</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button className="tap flex items-center justify-center gap-2 rounded-2xl bg-success/15 py-3.5 text-sm font-semibold text-success">
                <MessageCircle className="size-4" /> WhatsApp
              </button>
              <button className="tap flex items-center justify-center gap-2 rounded-2xl bg-primary/15 py-3.5 text-sm font-semibold text-primary">
                <Smartphone className="size-4" /> SMS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
