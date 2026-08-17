import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

export function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const date = now
    ? now.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })
    : "--";
  const time = now
    ? now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
    : "--:--:--";

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5">
      <Clock className="size-3.5 text-primary" />
      <div className="leading-tight">
        <p className="font-mono text-xs text-foreground tabular-nums">{time}</p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{date}</p>
      </div>
    </div>
  );
}
