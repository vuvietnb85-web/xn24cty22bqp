import { createFileRoute } from "@tanstack/react-router";
import { loadStandings } from "@/lib/football/espn.server";

export const Route = createFileRoute("/api/standings")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const league = new URL(request.url).searchParams.get("league") || "eng.1";
        try {
          const groups = await loadStandings(league);
          return Response.json({ groups }, { headers: { "cache-control": "public, max-age=60" } });
        } catch {
          return Response.json({ error: "Không tải được bảng xếp hạng." }, { status: 502 });
        }
      },
    },
  },
});
