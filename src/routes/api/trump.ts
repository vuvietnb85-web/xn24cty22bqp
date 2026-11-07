import { createFileRoute } from "@tanstack/react-router";
import { loadTrump } from "@/lib/market/trump.server";

export const Route = createFileRoute("/api/trump")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const tick = await loadTrump();
          return Response.json(tick, { headers: { "cache-control": "no-store" } });
        } catch {
          return Response.json({ error: "Không lấy được giá Binance." }, { status: 502 });
        }
      },
    },
  },
});
