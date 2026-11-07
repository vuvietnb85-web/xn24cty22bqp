import { createFileRoute } from "@tanstack/react-router";

const MIRRORS = ["https://de1.api.radio-browser.info", "https://nl1.api.radio-browser.info"];
const DENY = ["freem3u", "zmdcdn.me", "dpdns.org", "dethich.pw", "watchtivo", "vnns.net", "malimarcdn"];

type Row = {
  name?: string;
  url_resolved?: string;
  url?: string;
  bitrate?: number;
  codec?: string;
  country?: string;
  countrycode?: string;
  hls?: number;
  lastcheckok?: number;
  clickcount?: number;
};

const cache = new Map<string, { exp: number; body: unknown }>();

function blocked(src: string): boolean {
  const lower = src.toLowerCase();
  return DENY.some((bit) => lower.includes(bit));
}

function publicUrl(raw: string): URL | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) return null;
  if (/^(127\.|10\.|192\.168\.|169\.254\.|0\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(host)) return null;
  if (blocked(raw)) return null;
  return url;
}

async function radio(params: URLSearchParams): Promise<Row[]> {
  const path = `/json/stations/search?${params}`;
  for (const base of MIRRORS) {
    try {
      const res = await fetch(base + path, { headers: { "user-agent": "San24/1.0", accept: "application/json" } });
      if (!res.ok) continue;
      const data = (await res.json()) as Row[];
      if (Array.isArray(data)) return data;
    } catch {
      /* mirror kế */
    }
  }
  throw new Error("máy chủ đài không trả lời");
}

function score(row: Row, save: boolean, q: string): number {
  const kbps = row.bitrate || 0;
  const src = row.url_resolved || row.url || "";
  const hls = row.hls === 1 || src.includes(".m3u8");
  let value = 0;
  if (row.lastcheckok === 1) value += 40;
  if (hls) value += 28;
  if (row.countrycode === "VN") value += q ? 12 : 36;
  value += Math.min(row.clickcount || 0, 4000) / 120;
  if ((row.codec || "").toUpperCase().includes("AAC")) value += 6;
  if (save) {
    if (kbps >= 48 && kbps <= 128) value += 32;
    else if (kbps > 128 && kbps <= 192) value += 18;
    else if (kbps > 192 && kbps <= 256) value += 8;
    else if (kbps > 320) value -= 30;
  } else if (kbps >= 128 && kbps <= 256) value += 14;
  return value;
}

function toStation(row: Row, save: boolean, q: string) {
  const src = row.url_resolved || row.url || "";
  return {
    name: (row.name || "Đài").slice(0, 64),
    src,
    kbps: typeof row.bitrate === "number" ? row.bitrate : 0,
    codec: row.codec || "",
    country: row.countrycode || "",
    hls: row.hls === 1 || src.includes(".m3u8"),
    score: score(row, save, q),
  };
}

function pickVariant(text: string, base: string, save: boolean): { src: string; kbps: number } | null {
  const lines = text.split(/\r?\n/);
  const ladder: { kbps: number; src: string }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] || "";
    if (!line.includes("BANDWIDTH")) continue;
    const match = line.match(/BANDWIDTH=(\d+)/);
    const next = lines.slice(i + 1).find((item) => item && !item.startsWith("#"));
    if (!match || !next) continue;
    const abs = new URL(next.trim(), base).href;
    if (!publicUrl(abs)) continue;
    ladder.push({ kbps: Math.round(Number(match[1]) / 1000), src: abs });
  }
  if (!ladder.length) return null;
  const cap = save ? 450 : 1200;
  const under = ladder.filter((item) => item.kbps <= cap).sort((a, b) => b.kbps - a.kbps);
  const chosen = under[0] || ladder.sort((a, b) => a.kbps - b.kbps)[0];
  return chosen || null;
}

async function probe(raw: string, save: boolean) {
  const url = publicUrl(raw);
  if (!url) return { error: "Luồng không hợp lệ." };
  const res = await fetch(url, {
    headers: { "user-agent": "San24/1.0", range: "bytes=0-4096" },
    signal: AbortSignal.timeout(6000),
    redirect: "follow",
  });
  const cors = (res.headers.get("access-control-allow-origin") || "").length > 0;
  const type = res.headers.get("content-type") || "";
  const looksPlaylist = url.pathname.includes(".m3u8") || type.includes("mpegurl") || type.includes("mpegURL");
  if (!looksPlaylist) {
    await res.body?.cancel();
    return { src: url.href, kbps: 0, heavy: false, cors, hls: false };
  }
  const text = await res.text();
  const variant = pickVariant(text, res.url || url.href, save);
  const kbps = variant?.kbps || 0;
  return {
    src: variant?.src || url.href,
    kbps,
    heavy: kbps > 700,
    cors,
    hls: true,
  };
}

export const Route = createFileRoute("/api/air")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const query = new URL(request.url);
        const probeUrl = query.searchParams.get("probe");
        const save = query.searchParams.get("save") !== "0";
        if (probeUrl) {
          const key = `p:${save ? 1 : 0}:${probeUrl}`;
          const hit = cache.get(key);
          if (hit && hit.exp > Date.now()) return Response.json(hit.body);
          try {
            const body = await probe(probeUrl.slice(0, 500), save);
            if ("error" in body) return Response.json(body, { status: 400 });
            cache.set(key, { exp: Date.now() + 3 * 60_000, body });
            return Response.json(body);
          } catch {
            return Response.json({ error: "Không dò được luồng." }, { status: 502 });
          }
        }

        const q = (query.searchParams.get("q") || "").slice(0, 40);
        const key = `s:${save ? 1 : 0}:${q}`;
        const hit = cache.get(key);
        if (hit && hit.exp > Date.now()) {
          return Response.json(hit.body, { headers: { "cache-control": "public, max-age=120" } });
        }
        try {
          const base = new URLSearchParams({ hidebroken: "true", order: "clickcount", reverse: "true", limit: "30" });
          const vn = new URLSearchParams(base);
          vn.set("countrycode", "VN");
          if (q) vn.set("name", q);
          const jobs = [radio(vn)];
          if (q) {
            const world = new URLSearchParams(base);
            world.set("name", q);
            jobs.push(radio(world));
          }
          const groups = await Promise.all(jobs);
          const seen = new Set<string>();
          const stations = groups
            .flat()
            .map((row) => toStation(row, save, q))
            .filter((station) => station.src.startsWith("http") && !blocked(station.src) && publicUrl(station.src))
            .filter((station) => (seen.has(station.src) ? false : seen.add(station.src)))
            .sort((a, b) => b.score - a.score)
            .slice(0, 18)
            .map(({ score: _score, ...station }) => station);
          const body = { stations };
          cache.set(key, { exp: Date.now() + 10 * 60_000, body });
          return Response.json(body, { headers: { "cache-control": "public, max-age=120" } });
        } catch {
          return Response.json({ error: "Không lấy được danh sách đài." }, { status: 502 });
        }
      },
    },
  },
});
