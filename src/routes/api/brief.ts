import { createFileRoute } from "@tanstack/react-router";
import { briefMatch } from "@/lib/football/brief.server";

export const Route = createFileRoute("/api/brief")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ ok: false, error: "Yêu cầu không hợp lệ." }, { status: 400 });
        }
        const league = typeof body === "object" && body && "league" in body ? String((body as { league: unknown }).league) : "";
        const id = typeof body === "object" && body && "id" in body ? String((body as { id: unknown }).id) : "";
        if (!/^[a-z0-9._-]{2,40}$/.test(league) || !/^\d{4,16}$/.test(id)) {
          return Response.json({ ok: false, error: "Thiếu trận." }, { status: 400 });
        }
        try {
          const result = await briefMatch(league, id);
          return Response.json(result, { status: result.ok ? 200 : 502 });
        } catch {
          return Response.json({ ok: false, error: "Nhận định lỗi." }, { status: 502 });
        }
      },
    },
  },
});
