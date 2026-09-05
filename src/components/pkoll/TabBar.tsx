import { Link } from "@tanstack/react-router";
import { Map, UserRound, LifeBuoy } from "lucide-react";

const tabs = [
  { to: "/", label: "Karta", icon: Map },
  { to: "/konto", label: "Mitt konto", icon: UserRound },
  { to: "/info", label: "Info & hjälp", icon: LifeBuoy },
] as const;

export function TabBar() {
  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="glass pointer-events-auto flex w-[min(24rem,calc(100%-1.5rem))] items-center gap-1 rounded-3xl p-1.5 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.8)]">
        {tabs.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="tap group relative flex flex-1 flex-col items-center gap-1 rounded-[1.35rem] px-2 py-2.5 text-[0.68rem] font-semibold text-muted-foreground"
            activeProps={{
              className: "bg-secondary text-foreground shadow-inner",
            }}
          >
            <Icon className="size-5" strokeWidth={2.1} />
            <span className="tracking-tight">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
