import { createFileRoute } from "@tanstack/react-router";
import { loadNews } from "@/lib/football/espn.server";

export const Route = createFileRoute("/api/news")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const league = new URL(request.url).searchParams.get("league") || "world";
        try {
          const articles = await loadNews(league);
          return Response.json({ articles }, { headers: { "cache-control": "public, max-age=60" } });
        } catch {
          return Response.json({ error: "Không tải được tin." }, { status: 502 });
        }
      },
    },
  },
});
