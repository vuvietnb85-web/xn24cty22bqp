import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { apiUrl } from "@/lib/api-url";
import type { TrumpTick } from "@/lib/football/types";

type Drag = { dx: number; dy: number; ox: number; oy: number; moved: boolean };

type Pos = { x: number; y: number };

const KEY = "san24-trump-pos";

function money(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 4 });
}

function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(0);
}

function Spark({ values, up }: { values: number[]; up: boolean }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const w = 120;
  const h = 36;
  const d = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / span) * (h - 2) - 1;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 h-9 w-full" aria-hidden="true">
      <path d={d} fill="none" stroke={up ? "var(--color-up)" : "var(--color-live)"} strokeWidth="1.6" />
    </svg>
  );
}

export function TrumpSticker() {
  const [tick, setTick] = useState<TrumpTick | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const [pos, setPos] = useState<Pos | null>(null);
  const prev = useRef<number | null>(null);
  const drag = useRef<Drag | null>(null);
  const posRef = useRef<Pos | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setPos(JSON.parse(raw) as Pos);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let stop = false;
    const pull = async () => {
      try {
        const res = await fetch(apiUrl("/api/trump"));
        if (!res.ok) throw new Error("bad");
        const data = (await res.json()) as TrumpTick;
        if (stop) return;
        if (prev.current !== null && data.price !== prev.current) {
          setFlash(data.price > prev.current ? "up" : "down");
          window.setTimeout(() => setFlash(null), 700);
        }
        prev.current = data.price;
        setTick(data);
        setError("");
      } catch {
        if (!stop) setError("Mất giá");
      }
    };
    void pull();
    const id = window.setInterval(() => void pull(), 2000);
    return () => {
      stop = true;
      window.clearInterval(id);
    };
  }, []);

  const up = (tick?.change ?? 0) >= 0;
  const place = pos;

  const suppressClick = useRef(false);

  const onPointerDown = (e: ReactPointerEvent) => {
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    const rect = el.getBoundingClientRect();
    const origin = place ?? { x: rect.left, y: rect.top };
    drag.current = { dx: e.clientX - origin.x, dy: e.clientY - origin.y, ox: origin.x, oy: origin.y, moved: false };
  };
  const onPointerMove = (e: ReactPointerEvent) => {
    if (!drag.current) return;
    const x = Math.max(8, Math.min(window.innerWidth - 92, e.clientX - drag.current.dx));
    const y = Math.max(8, Math.min(window.innerHeight - 92, e.clientY - drag.current.dy));
    if (Math.abs(x - drag.current.ox) + Math.abs(y - drag.current.oy) > 6) drag.current.moved = true;
    const next = { x, y };
    posRef.current = next;
    setPos(next);
  };
  const onPointerUp = () => {
    const moved = drag.current?.moved ?? false;
    drag.current = null;
    if (moved && posRef.current) {
      suppressClick.current = true;
      localStorage.setItem(KEY, JSON.stringify(posRef.current));
    }
  };

  return (
    <div
      className="fixed z-50 touch-none"
      style={place ? { left: place.x, top: place.y } : { right: 12, bottom: 96 }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={() => {
        if (suppressClick.current) {
          suppressClick.current = false;
          return;
        }
        setOpen((v) => !v);
      }}
    >
      <button
        type="button"
        aria-label="Giá TRUMP USDT trên Binance"
        className={
          "w-20 rounded-full border border-gold bg-surface px-1 py-3 text-center shadow-lg " +
          (flash === "up" ? "ring-2 ring-up" : flash === "down" ? "ring-2 ring-live" : "")
        }
      >
        <span className="font-display block text-xs tracking-widest text-gold">TRUMP</span>
        <span className="font-display block text-lg leading-none text-fg">{tick ? money(tick.price) : "…"}</span>
        <span className={"block text-xs font-semibold " + (up ? "text-up" : "text-live")}>
          {tick ? `${up ? "+" : ""}${tick.changePct.toFixed(2)}%` : error || "USDT"}
        </span>
      </button>
      {open && tick ? (
        <div className="mt-2 w-44 rounded-2xl border border-line bg-surface p-3 text-left shadow-xl">
          <p className="font-display text-sm tracking-wide text-gold-soft">TRUMP / USDT</p>
          <p className="text-xs text-muted">Binance · 24 giờ</p>
          <Spark values={tick.spark} up={up} />
          <dl className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
            <dt className="text-muted">Cao</dt>
            <dd className="text-right text-fg">{money(tick.high)}</dd>
            <dt className="text-muted">Thấp</dt>
            <dd className="text-right text-fg">{money(tick.low)}</dd>
            <dt className="text-muted">Khối</dt>
            <dd className="text-right text-fg">{compact(tick.quoteVolume)}</dd>
          </dl>
        </div>
      ) : null}
    </div>
  );
}
