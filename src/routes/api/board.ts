import { createFileRoute } from "@tanstack/react-router";
import { loadBoard } from "@/lib/football/espn.server";

export const Route = createFileRoute("/api/board")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const league = url.searchParams.get("league") || "world";
        const date = url.searchParams.get("date") || "";
        if (!/^\d{8}$/.test(date)) {
          return Response.json({ error: "Thiếu ngày." }, { status: 400 });
        }
        try {
          const body = await loadBoard(league, date);
          return Response.json(
            { ...body, league, date, updatedAt: new Date().toISOString() },
            { headers: { "cache-control": "no-store" } },
          );
        } catch {
          return Response.json({ error: "Không tải được tỉ số." }, { status: 502 });
        }
      },
    },
  },
});
