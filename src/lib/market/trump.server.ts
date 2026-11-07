import type { TrumpTick } from "@/lib/football/types";

const BASE = "https://data-api.binance.vision";

let tickCache: { exp: number; data: TrumpTick } | null = null;
let sparkCache: { exp: number; spark: number[] } | null = null;

async function getJson(path: string): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(`${BASE}${path}`, { signal: ctrl.signal, headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`binance ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function sparkline(): Promise<number[]> {
  if (sparkCache && sparkCache.exp > Date.now()) return sparkCache.spark;
  const raw = await getJson("/api/v3/klines?symbol=TRUMPUSDT&interval=1m&limit=48");
  const spark = Array.isArray(raw)
    ? raw
        .map((row) => (Array.isArray(row) ? Number(row[4]) : NaN))
        .filter((n) => Number.isFinite(n))
    : [];
  sparkCache = { exp: Date.now() + 30_000, spark };
  return spark;
}

export async function loadTrump(): Promise<TrumpTick> {
  if (tickCache && tickCache.exp > Date.now()) return tickCache.data;
  const [ticker, spark] = await Promise.all([
    getJson("/api/v3/ticker/24hr?symbol=TRUMPUSDT"),
    sparkline().catch(() => sparkCache?.spark ?? []),
  ]);
  if (typeof ticker !== "object" || ticker === null) throw new Error("ticker");
  const t = ticker as Record<string, unknown>;
  const num = (k: string) => {
    const n = Number(t[k]);
    return Number.isFinite(n) ? n : 0;
  };
  const data: TrumpTick = {
    price: num("lastPrice"),
    change: num("priceChange"),
    changePct: num("priceChangePercent"),
    high: num("highPrice"),
    low: num("lowPrice"),
    volume: num("volume"),
    quoteVolume: num("quoteVolume"),
    spark,
    updatedAt: new Date().toISOString(),
  };
  tickCache = { exp: Date.now() + 1500, data };
  return data;
}
