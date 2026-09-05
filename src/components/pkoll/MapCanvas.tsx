/**
 * Placeholder for a real map. Keep this component's inner area free of heavy
 * elements — a real Mapbox/Google Maps canvas can replace <MapBackdrop /> later.
 */
function MapBackdrop() {
  return (
    <div className="absolute inset-0 bg-map">
      <div className="absolute inset-0 opacity-90">
        <svg className="size-full" viewBox="0 0 390 700" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="pk-fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.24 0.03 262)" />
              <stop offset="100%" stopColor="oklch(0.155 0.02 265)" />
            </linearGradient>
          </defs>
          <rect width="390" height="700" fill="url(#pk-fade)" />
          <g fill="var(--color-map-block)">
            {Array.from({ length: 26 }).map((_, i) => {
              const x = (i % 4) * 108 - 30 + ((i * 13) % 22);
              const y = Math.floor(i / 4) * 104 - 20 + ((i * 29) % 26);
              return (
                <rect
                  key={i}
                  x={x}
                  y={y}
                  width={62 + ((i * 17) % 40)}
                  height={54 + ((i * 23) % 44)}
                  rx="10"
                />
              );
            })}
          </g>
          <g stroke="var(--color-map-road)" fill="none" strokeLinecap="round">
            <path d="M-20 210 H410" strokeWidth="16" opacity="0.85" />
            <path d="M-20 470 H410" strokeWidth="12" opacity="0.7" />
            <path d="M120 -20 V720" strokeWidth="14" opacity="0.8" />
            <path d="M296 -20 V720" strokeWidth="9" opacity="0.6" />
            <path d="M-20 620 C 90 600, 150 520, 410 540" strokeWidth="8" opacity="0.5" />
          </g>
          <path
            d="M-20 40 C 120 90, 200 20, 410 70 L410 -20 L-20 -20 Z"
            fill="var(--color-map-water)"
            opacity="0.55"
          />
        </svg>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_35%,transparent_35%,oklch(0.11_0.018_265/0.85)_100%)]" />
    </div>
  );
}

export function MapCanvas() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <MapBackdrop />

      {/* Street label */}
      <div className="absolute left-1/2 top-[22%] -translate-x-1/2 animate-pk-rise">
        <div className="glass rounded-2xl px-4 py-2 text-center shadow-2xl">
          <p className="font-display text-sm font-semibold tracking-tight">Vasagatan</p>
          <p className="text-[0.68rem] text-muted-foreground">Stockholm</p>
        </div>
      </div>

      {/* User location dot */}
      <div className="absolute left-1/2 top-[33%] -translate-x-1/2 -translate-y-1/2">
        <span className="absolute inset-0 m-auto size-5 animate-pk-ping rounded-full bg-primary/60" />
        <span className="relative block size-5 rounded-full border-[3px] border-background bg-primary shadow-[0_0_24px_6px_color-mix(in_oklab,var(--primary)_45%,transparent)]" />
      </div>
    </div>
  );
}
