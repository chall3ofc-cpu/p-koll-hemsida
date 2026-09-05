import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Send } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/info")({
  head: () => ({
    meta: [
      { title: "Info & hjälp — parkeringsskyltar och felrapport | P-Koll" },
      {
        name: "description",
        content:
          "Förstå svenska parkeringsskyltar, rapportera fel regler på en gata och se P-Kolls städdags-widget för tidningar och kommuner.",
      },
      { property: "og:title", content: "Info & hjälp | P-Koll" },
      {
        property: "og:description",
        content: "Skyltguide, felrapportering och städdags-widget för partners.",
      },
    ],
  }),
  component: InfoPage,
});

const rules = [
  {
    q: "Vad betyder P-skiva?",
    a: "Du parkerar gratis men måste ställa in ankomsttiden på en p-skiva i vindrutan. Tiden på skylten är hur länge du får stå.",
  },
  {
    q: "Gul skylt med kryss — vad gäller?",
    a: "Förbud att parkera. Du får stanna kort för av- och påstigning om inget stopplförbud gäller.",
  },
  {
    q: "Datumparkering",
    a: "Udda datum: förbud på sidan med udda husnummer natten mot det datumet. Jämna datum tvärtom.",
  },
  {
    q: "Städdag / servicedag",
    a: "Under de tider som anges måste gatan vara tom för renhållning. Bilen bogseras annars på din bekostnad.",
  },
  {
    q: "Boendeparkering",
    a: "Med giltigt tillstånd i din zon betalar du en kraftigt rabatterad taxa på gator märkta för boende.",
  },
];

function InfoPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="h-full overflow-y-auto px-5 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
      <h1 className="text-3xl font-bold">Info & hjälp</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Guider, felrapportering och samarbeten.
      </p>

      <section className="mt-6 rounded-3xl border border-hairline bg-surface p-4">
        <h2 className="text-sm font-bold">Felrapportering</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Stämmer inte reglerna på en gata? Tipsa oss så rättar vi snabbt.
        </p>
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <Input placeholder="Gata och stad" className="bg-surface-2" aria-label="Gata och stad" />
          <Textarea
            placeholder="Vad är fel? T.ex. fel taxa eller saknad städdag."
            className="min-h-24 bg-surface-2"
            aria-label="Beskrivning"
          />
          <button
            type="submit"
            className="tap flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground"
          >
            <Send className="size-4" /> Skicka rapport
          </button>
          {sent && (
            <p className="animate-pk-rise rounded-2xl bg-success/12 px-4 py-3 text-sm text-success">
              Tack! Vi granskar din rapport inom 24 timmar.
            </p>
          )}
        </form>
      </section>

      <section className="mt-8">
        <h2 className="px-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Snabbguide till skyltarna
        </h2>
        <Accordion type="single" collapsible className="mt-3 rounded-3xl border border-hairline bg-surface px-4">
          {rules.map((r) => (
            <AccordionItem key={r.q} value={r.q} className="border-hairline">
              <AccordionTrigger className="text-left text-sm font-semibold">{r.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{r.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="mt-8 rounded-3xl border border-hairline bg-surface p-4">
        <h2 className="text-sm font-bold">P-Koll för tidningar & kommuner</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Bädda in vår städdags-widget på er sajt — alltid uppdaterad, gratis för lokaltidningar.
        </p>

        <div className="mt-4 rounded-2xl border border-hairline bg-[oklch(0.14_0.02_265)] p-4">
          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground">
            Städdag denna vecka
          </p>
          <div className="mt-3 space-y-2">
            {[
              { s: "Vasagatan 1–40", t: "Torsdag 08–12", c: "text-danger bg-danger/12" },
              { s: "Odengatan 12–60", t: "Fredag 00–06", c: "text-warning bg-warning/12" },
              { s: "Sveavägen 90–120", t: "Ingen städning", c: "text-success bg-success/12" },
            ].map((row) => (
              <div
                key={row.s}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-surface-2 px-3 py-2.5"
              >
                <span className="min-w-0 truncate text-sm">{row.s}</span>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold ${row.c}`}>
                  {row.t}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[0.65rem] text-muted-foreground">Drivs av P-Koll</p>
        </div>

        <a
          href="mailto:info@p-koll.se"
          className="tap mt-4 flex items-center justify-center gap-2 rounded-2xl border border-hairline py-3 text-sm font-semibold text-primary"
        >
          <Mail className="size-4" /> info@p-koll.se
        </a>
      </section>
    </div>
  );
}
