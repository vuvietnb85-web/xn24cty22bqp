import { loadMatch } from "@/lib/football/espn.server";

const cache = new Map<string, { exp: number; text: string }>();

export async function briefMatch(league: string, id: string): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const key = `${league}:${id}`;
  const hit = cache.get(key);
  if (hit && hit.exp > Date.now()) return { ok: true, text: hit.text };

  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return { ok: false, error: "Nhận định AI chưa bật trên môi trường này." };

  const match = await loadMatch(league, id);
  if (!match) return { ok: false, error: "Không lấy được dữ liệu trận." };

  const facts = [
    `${match.home.name} ${match.home.score}-${match.away.score} ${match.away.name}`,
    `Giải: ${match.leagueName}. Trạng thái: ${match.statusLabel}.`,
    match.venue ? `Sân: ${match.venue}.` : "",
    match.timeline.length
      ? `Sự kiện: ${match.timeline
          .slice(0, 12)
          .map((e) => `${e.minute} ${e.label} ${e.player}`.trim())
          .join("; ")}`
      : "Chưa có sự kiện.",
    match.stats.length
      ? `Số liệu: ${match.stats
          .slice(0, 6)
          .map((s) => `${s.label} ${s.home}-${s.away}`)
          .join("; ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4.5",
      max_tokens: 220,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "Bạn là biên tập viên bóng đá, viết tiếng Việt. Chỉ dùng số liệu được đưa. Không bịa tỉ số, cầu thủ hay phút. Bốn câu ngắn, không markdown, không lời chào.",
        },
        { role: "user", content: facts },
      ],
    }),
  });
  if (!res.ok) return { ok: false, error: "Không tạo được nhận định lúc này." };
  const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = body.choices?.[0]?.message?.content?.trim() ?? "";
  if (!text) return { ok: false, error: "Nhận định trống." };
  cache.set(key, { exp: Date.now() + 30 * 60_000, text });
  return { ok: true, text };
}
