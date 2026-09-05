import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Car, Zap, Bike, Truck, Check, Accessibility } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/konto")({
  head: () => ({
    meta: [
      { title: "Mitt konto — anpassa dina p-regler | P-Koll" },
      {
        name: "description",
        content:
          "Ställ in fordonstyp, boendeparkering och handikapptillstånd så visar P-Koll rätt regler för just dig.",
      },
      { property: "og:title", content: "Mitt konto — anpassa dina p-regler | P-Koll" },
      {
        property: "og:description",
        content: "Fordonstyp, boendezon och tillstånd — kartan anpassas efter dina inställningar.",
      },
    ],
  }),
  component: KontoPage,
});

const vehicles = [
  { id: "bensin", label: "Bensin/Diesel", icon: Car },
  { id: "elbil", label: "Elbil", icon: Zap },
  { id: "mc", label: "MC", icon: Bike },
  { id: "lastbil", label: "Lastbil", icon: Truck },
] as const;

function KontoPage() {
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<string>("bensin");
  const [permit, setPermit] = useState(false);

  return (
    <div className="h-full overflow-y-auto px-5 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
      <h1 className="text-3xl font-bold">Mitt konto</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Anpassa reglerna så att kartan visar exakt vad som gäller för dig.
      </p>

      <section className="mt-6">
        <h2 className="px-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Fordonstyp
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {vehicles.map(({ id, label, icon: Icon }) => {
            const active = vehicle === id;
            return (
              <button
                key={id}
                onClick={() => setVehicle(id)}
                className={`tap spring flex items-center gap-3 rounded-2xl border p-4 text-left text-sm font-semibold ${
                  active
                    ? "border-primary/50 bg-primary/12 text-foreground"
                    : "border-hairline bg-surface text-muted-foreground"
                }`}
              >
                <Icon className={`size-5 shrink-0 ${active ? "text-primary" : ""}`} />
                <span className="min-w-0 truncate">{label}</span>
              </button>
            );
          })}
        </div>
        {vehicle === "elbil" && (
          <p className="animate-pk-rise mt-3 flex items-center gap-2 rounded-2xl bg-success/12 px-4 py-3 text-sm text-success">
            <Check className="size-4 shrink-0" />
            Laddplatser kommer nu lysa GRÖNT på kartan.
          </p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="px-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Boendeparkering
        </h2>
        <div className="mt-3 space-y-3 rounded-3xl border border-hairline bg-surface p-4">
          <div>
            <label className="text-xs text-muted-foreground" htmlFor="kommun">
              Kommun
            </label>
            <Input id="kommun" placeholder="Stockholm" className="mt-1 bg-surface-2" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground" htmlFor="zon">
              Zon
            </label>
            <Input id="zon" placeholder="Vasastan" className="mt-1 bg-surface-2" />
          </div>
          <p className="text-xs text-muted-foreground">
            Gator där ditt boendetillstånd gäller markeras gröna på kartan.
          </p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="px-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Tillstånd
        </h2>
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-3xl border border-hairline bg-surface p-4">
          <div className="flex min-w-0 items-center gap-3">
            <Accessibility className="size-5 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Handikapptillstånd</p>
              <p className="text-xs text-muted-foreground">Visar reserverade platser först.</p>
            </div>
          </div>
          <Switch checked={permit} onCheckedChange={setPermit} aria-label="Handikapptillstånd" />
        </div>
      </section>

      <button
        onClick={() => navigate({ to: "/" })}
        className="tap glow-primary mt-8 w-full rounded-3xl bg-primary py-4 font-display text-base font-bold text-primary-foreground"
      >
        Spara & Gå till Karta
      </button>
    </div>
  );
}
