import { createFileRoute } from "@tanstack/react-router";
import { VTV_IDS } from "@/lib/air/vtv";

const PLAYBACK = "https://api.vtvdigital.org/live-channel/v21.0/playback/source";
const cache = new Map<string, { exp: number; body: unknown }>();

function allowedHost(src: string): boolean {
  try {
    const host = new URL(src).hostname;
    return host.endsWith(".vtvdigital.vn") || host.endsWith(".vtv.vn") || host === "vtv-live-push-token.akamaized.net";
  } catch {
    return false;
  }
}

function lowestKbps(text: string): number {
  const values = [...text.matchAll(/BANDWIDTH=(\d+)/g)].map((match) => Number(match[1]));
  if (!values.length) return 0;
  return Math.round(Math.min(...values) / 1000);
}

async function fresh(id: string) {
  const res = await fetch(PLAYBACK, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      origin: "https://vtvgo.vn",
      referer: "https://vtvgo.vn/",
      "user-agent": "San24/1.0",
    },
    body: JSON.stringify({ id, platform: "webPC" }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error("vtv");
  const data = (await res.json()) as {
    data?: {
      sourceModes?: {
        multiSource?: { drmTypeID?: string; sources?: { url?: string }[] }[];
      }[];
    };
  };
  const source = data.data?.sourceModes?.[0]?.multiSource?.[0];
  const src = source?.sources?.[0]?.url || "";
  if (source?.drmTypeID && source.drmTypeID !== "none") throw new Error("drm");
  if (!src.startsWith("https://") || !allowedHost(src)) throw new Error("host");
  let kbps = 0;
  try {
    const playlist = await fetch(src, { headers: { "user-agent": "San24/1.0" }, signal: AbortSignal.timeout(8000) });
    if (playlist.ok) kbps = lowestKbps(await playlist.text());
  } catch {
    kbps = 0;
  }
  return { src, kbps: kbps || 1500, heavy: (kbps || 1500) > 700 };
}

export const Route = createFileRoute("/api/vtv")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const id = new URL(request.url).searchParams.get("id") || "";
        if (!VTV_IDS.has(id)) return Response.json({ error: "Kênh VTV không có trong danh sách quốc gia." }, { status: 400 });
        const hit = cache.get(id);
        if (hit && hit.exp > Date.now()) return Response.json(hit.body);
        try {
          const body = await fresh(id);
          cache.set(id, { exp: Date.now() + 90_000, body });
          return Response.json(body);
        } catch {
          return Response.json({ error: "VTVgo không trả sóng kênh này lúc này." }, { status: 502 });
        }
      },
    },
  },
});
