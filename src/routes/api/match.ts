import { createFileRoute } from "@tanstack/react-router";
import { loadMatch } from "@/lib/football/espn.server";

export const Route = createFileRoute("/api/match")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const league = url.searchParams.get("league") || "";
        const id = url.searchParams.get("id") || "";
        try {
          const match = await loadMatch(league, id);
          if (!match) return Response.json({ error: "Không thấy trận." }, { status: 404 });
          return Response.json(match, { headers: { "cache-control": "no-store" } });
        } catch {
          return Response.json({ error: "Không tải được trận." }, { status: 502 });
        }
      },
    },
  },
});
