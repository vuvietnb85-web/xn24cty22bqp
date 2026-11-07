import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ChevronLeft,
  Newspaper,
  Search,
  Star,
  Table2,
  Trophy,
  X,
} from "lucide-react";
import { apiUrl } from "@/lib/api-url";
import { LEAGUE_GROUPS, LEAGUES, leagueBySlug } from "@/lib/football/catalog";
import type { Article, MatchCard, MatchDetail, PlayerLine, StandingGroup } from "@/lib/football/types";
import { TrumpSticker } from "@/components/pitch/sticker";
import { AirDeck } from "@/components/pitch/air";

type Tab = "live" | "table" | "news" | "saved";
type Chip = "all" | "in" | "pre" | "post" | "vn";

const PREF_KEY = "san24-prefs";
const VN_LEAGUES = new Set(["aff.championship", "afc.champions", "afc.asian.cup", "fifa.worldq.afc", "fifa.friendly"]);

function vnKey(offset: number): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date())
    .split("-")
    .map(Number);
  const dt = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + offset));
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${dt.getUTCFullYear()}${mm}${dd}`;
}

function dayLabel(key: string): string {
  const dt = new Date(Date.UTC(Number(key.slice(0, 4)), Number(key.slice(4, 6)) - 1, Number(key.slice(6, 8)), 5));
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(dt);
}

function kickLabel(iso: string): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

function whenLabel(iso: string): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

function useClock(): string {
  const [text, setText] = useState("");
  useEffect(() => {
    const tick = () =>
      setText(
        new Intl.DateTimeFormat("vi-VN", {
          timeZone: "Asia/Ho_Chi_Minh",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date()),
      );
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return text;
}

function Crest({ src, label }: { src: string; label: string }) {
  const [ok, setOk] = useState(true);
  if (!src || !ok) {
    return (
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-raise font-display text-sm text-gold">
        {label.slice(0, 3)}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt=""
      className="size-9 shrink-0 object-contain"
      referrerPolicy="no-referrer"
      onError={() => setOk(false)}
    />
  );
}

function isVietnam(m: MatchCard): boolean {
  const blob = `${m.home.name} ${m.away.name}`.toLowerCase();
  return VN_LEAGUES.has(m.league) || /vietnam|việt|viet nam/.test(blob);
}

function PitchMap({ formation, players }: { formation: string; players: PlayerLine[] }) {
  const starters = players.filter((p) => p.starter).sort((a, b) => a.place - b.place);
  const nums = formation.split("-").map((n) => Number.parseInt(n, 10)).filter((n) => n > 0);
  const count = nums.reduce((a, b) => a + b, 0);
  if (starters.length < 11 || count !== 10) {
    return (
      <ul className="space-y-1">
        {players.slice(0, 16).map((p) => (
          <li key={`${p.jersey}-${p.name}`} className="flex items-center gap-2 text-sm">
            <span className="w-6 font-display text-gold">{p.jersey}</span>
            <span className="text-fg">{p.name}</span>
            <span className="ml-auto text-xs text-muted">{p.starter ? p.position : "dự bị"}</span>
          </li>
        ))}
      </ul>
    );
  }
  const gk = starters[0];
  let cursor = 1;
  const lines = nums.map((n) => {
    const row = starters.slice(cursor, cursor + n);
    cursor += n;
    return row;
  });
  const ordered = [...lines].reverse();
  return (
    <div className="rounded-2xl border border-line bg-raise/70 p-3">
      <p className="mb-2 text-center font-display text-sm tracking-widest text-gold">{formation}</p>
      <div className="space-y-2">
        {ordered.map((row, i) => (
          <div key={i} className="flex justify-around gap-1">
            {row.map((p) => (
              <span key={p.name} className="w-14 text-center text-xs leading-tight text-fg">
                <span className="mx-auto grid size-7 place-items-center rounded-full bg-bg font-display text-gold">{p.jersey}</span>
                <span className="mt-1 block truncate">{p.name.split(" ").slice(-1)}</span>
              </span>
            ))}
          </div>
        ))}
        <div className="flex justify-center">
          <span className="w-14 text-center text-xs text-fg">
            <span className="mx-auto grid size-7 place-items-center rounded-full bg-gold font-display text-bg">{gk.jersey}</span>
            <span className="mt-1 block truncate">{gk.name.split(" ").slice(-1)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export function PitchApp() {
  const clock = useClock();
  const [tab, setTab] = useState<Tab>("live");
  const [chip, setChip] = useState<Chip>("all");
  const [league, setLeague] = useState("world");
  const [day, setDay] = useState(0);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [matches, setMatches] = useState<MatchCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updated, setUpdated] = useState("");
  const [saved, setSaved] = useState<Record<string, MatchCard>>({});
  const [flashed, setFlashed] = useState<Record<string, boolean>>({});
  const [picker, setPicker] = useState(false);
  const [open, setOpen] = useState<MatchCard | null>(null);
  const [detail, setDetail] = useState<MatchDetail | null>(null);
  const [detailError, setDetailError] = useState("");
  const [sheetTab, setSheetTab] = useState<"flow" | "xi" | "stats" | "watch">("flow");
  const [brief, setBrief] = useState("");
  const [briefBusy, setBriefBusy] = useState(false);
  const [groups, setGroups] = useState<StandingGroup[]>([]);
  const [tableError, setTableError] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [newsError, setNewsError] = useState("");
  const scores = useRef<Record<string, string>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREF_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { league?: string; saved?: Record<string, MatchCard> };
      if (parsed.league) setLeague(parsed.league);
      if (parsed.saved) setSaved(parsed.saved);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(PREF_KEY, JSON.stringify({ league, saved }));
  }, [hydrated, league, saved]);

  const date = vnKey(day);

  useEffect(() => {
    let stop = false;
    setLoading(true);
    const pull = async () => {
      try {
        const res = await fetch(apiUrl(`/api/board?league=${encodeURIComponent(league)}&date=${date}`));
        if (!res.ok) throw new Error("bad");
        const body = (await res.json()) as { matches: MatchCard[]; updatedAt: string };
        if (stop) return;
        const nextFlash: Record<string, boolean> = {};
        for (const m of body.matches) {
          const sig = `${m.home.score}-${m.away.score}`;
          const prev = scores.current[m.id];
          if (prev && prev !== sig && m.state === "in") nextFlash[m.id] = true;
          scores.current[m.id] = sig;
        }
        if (Object.keys(nextFlash).length) {
          setFlashed(nextFlash);
          window.setTimeout(() => setFlashed({}), 4000);
        }
        setMatches(body.matches);
        setUpdated(body.updatedAt);
        setError("");
        setSaved((cur) => {
          const copy = { ...cur };
          let changed = false;
          for (const m of body.matches) {
            if (copy[m.id]) {
              copy[m.id] = m;
              changed = true;
            }
          }
          return changed ? copy : cur;
        });
      } catch {
        if (!stop) setError("Không tải được tỉ số. Kiểm tra mạng rồi thử lại.");
      } finally {
        if (!stop) setLoading(false);
      }
    };
    void pull();
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void pull();
    }, 20000);
    return () => {
      stop = true;
      window.clearInterval(id);
    };
  }, [league, date]);

  useEffect(() => {
    if (!open) return;
    let stop = false;
    const pull = async () => {
      try {
        const res = await fetch(apiUrl(`/api/match?league=${encodeURIComponent(open.league)}&id=${open.id}`));
        if (!res.ok) throw new Error("bad");
        const body = (await res.json()) as MatchDetail;
        if (!stop) {
          setDetail(body);
          setDetailError("");
        }
      } catch {
        if (!stop) setDetailError("Chưa mở được chi tiết trận.");
      }
    };
    void pull();
    const id = window.setInterval(() => {
      if (open.state === "in" && document.visibilityState === "visible") void pull();
    }, 20000);
    return () => {
      stop = true;
      window.clearInterval(id);
    };
  }, [open]);

  useEffect(() => {
    if (tab !== "table") return;
    const slug = league === "world" ? "eng.1" : league;
    let stop = false;
    void (async () => {
      try {
        const res = await fetch(apiUrl(`/api/standings?league=${encodeURIComponent(slug)}`));
        if (!res.ok) throw new Error("bad");
        const body = (await res.json()) as { groups: StandingGroup[] };
        if (!stop) {
          setGroups(body.groups);
          setTableError(body.groups.length ? "" : "Giải này chưa có bảng.");
        }
      } catch {
        if (!stop) setTableError("Không tải được bảng xếp hạng.");
      }
    })();
    return () => {
      stop = true;
    };
  }, [tab, league]);

  useEffect(() => {
    if (tab !== "news") return;
    let stop = false;
    void (async () => {
      try {
        const res = await fetch(apiUrl(`/api/news?league=${encodeURIComponent(league)}`));
        if (!res.ok) throw new Error("bad");
        const body = (await res.json()) as { articles: Article[] };
        if (!stop) {
          setArticles(body.articles);
          setNewsError(body.articles.length ? "" : "Chưa có tin.");
        }
      } catch {
        if (!stop) setNewsError("Không tải được tin.");
      }
    })();
    return () => {
      stop = true;
    };
  }, [tab, league]);

  const leagueName = league === "world" ? "Toàn cầu" : (leagueBySlug(league)?.name ?? league);
  const liveCount = matches.filter((m) => m.state === "in").length;

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = tab === "saved" ? Object.values(saved) : matches;
    return pool.filter((m) => {
      if (chip === "in" && m.state !== "in") return false;
      if (chip === "pre" && m.state !== "pre") return false;
      if (chip === "post" && m.state !== "post") return false;
      if (chip === "vn" && !isVietnam(m)) return false;
      if (!q) return true;
      return `${m.home.name} ${m.away.name} ${m.leagueName}`.toLowerCase().includes(q);
    });
  }, [matches, saved, tab, chip, query]);

  const askBrief = async () => {
    if (!open) return;
    setBriefBusy(true);
    setBrief("");
    try {
      const res = await fetch(apiUrl("/api/brief"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ league: open.league, id: open.id }),
      });
      const body = (await res.json()) as { ok: boolean; text?: string; error?: string };
      setBrief(body.ok ? (body.text ?? "") : (body.error ?? "Không tạo được nhận định."));
    } catch {
      setBrief("Không tạo được nhận định.");
    } finally {
      setBriefBusy(false);
    }
  };

  const openMatch = (m: MatchCard) => {
    setOpen(m);
    setDetail(null);
    setBrief("");
    setSheetTab("flow");
    setDetailError("");
  };

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/95 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md">
        <div className="mx-auto w-full max-w-5xl px-4">
        <div className="flex items-end justify-between gap-3 pb-3">
          <div>
            <p className="font-display text-3xl leading-none tracking-wide text-gold">SÂN 24</p>
            <p className="mt-1 text-sm text-muted">Bóng đá thế giới · giờ Việt Nam {clock}</p>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl leading-none text-fg">{liveCount}</p>
            <p className="text-xs tracking-wide text-live">đang đá</p>
          </div>
        </div>
        <div className="flex items-center gap-2 pb-3">
          <button
            type="button"
            onClick={() => setPicker(true)}
            className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full border border-line bg-surface px-3 text-left"
          >
            <Trophy className="size-4 shrink-0 text-gold" />
            <span className="truncate text-sm font-semibold">{leagueName}</span>
          </button>
          {searching ? (
            <label className="flex h-11 w-40 items-center gap-2 rounded-full border border-line bg-surface px-3">
              <Search className="size-4 shrink-0 text-muted" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm đội"
                className="w-full bg-transparent text-sm text-fg outline-none placeholder:text-muted"
              />
            </label>
          ) : (
            <button
              type="button"
              aria-label="Tìm đội"
              onClick={() => setSearching(true)}
              className="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-surface"
            >
              <Search className="size-4 text-muted" />
            </button>
          )}
          <AirDeck />
        </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-28">
        {tab === "live" || tab === "saved" ? (
          <>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 py-3">
              {[-1, 0, 1, 2].map((offset) => (
                <button
                  key={offset}
                  type="button"
                  onClick={() => {
                    setDay(offset);
                    setTab("live");
                  }}
                  className={
                    "h-10 shrink-0 rounded-full px-3 text-sm font-semibold " +
                    (day === offset && tab === "live" ? "bg-gold text-bg" : "bg-surface text-fg")
                  }
                >
                  {offset === 0 ? "Hôm nay" : dayLabel(vnKey(offset))}
                </button>
              ))}
            </div>
            <div className="mb-3 flex gap-2 overflow-x-auto">
              {(
                [
                  ["all", "Tất cả"],
                  ["in", "Đang đá"],
                  ["pre", "Sắp đá"],
                  ["post", "Đã xong"],
                  ["vn", "Việt Nam"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setChip(id)}
                  className={
                    "h-9 shrink-0 rounded-full border px-3 text-sm " +
                    (chip === id ? "border-gold bg-raise text-gold-soft" : "border-line text-muted")
                  }
                >
                  {label}
                </button>
              ))}
            </div>
            {loading && matches.length === 0 ? (
              <div className="space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-2xl bg-surface" />
                ))}
              </div>
            ) : null}
            {error ? <p className="mb-3 rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-gold-soft">{error}</p> : null}
            {!loading && shown.length === 0 ? (
              <div className="rounded-2xl border border-line bg-surface px-4 py-8 text-center">
                <p className="font-display text-xl text-fg">Không có trận khớp bộ lọc</p>
                <p className="mt-2 text-sm text-muted">
                  {chip === "vn"
                    ? "Hôm nay không có trận đội tuyển hoặc giải ASEAN/AFC trong nguồn. V-League chưa có feed công khai — chọn vòng loại châu Á hoặc ngày khác."
                    : "Đổi ngày hoặc giải. Tỉ số tự làm mới mỗi 20 giây khi trận đang diễn ra."}
                </p>
              </div>
            ) : null}
            <ul className="grid gap-3 lg:grid-cols-2">
              {shown.map((m) => {
                const starred = Boolean(saved[m.id]);
                return (
                  <li key={`${m.league}-${m.id}`}>
                    <article
                      className={
                        "rounded-2xl border bg-surface " +
                        (m.state === "in" ? "border-gold/70" : "border-line") +
                        (flashed[m.id] ? " score-flash" : "")
                      }
                    >
                      <button type="button" onClick={() => openMatch(m)} className="block w-full px-3 py-3 text-left">
                        <div className="mb-2 flex items-center justify-between text-xs text-muted">
                          <span>{m.leagueName}</span>
                          <span className={m.state === "in" ? "font-semibold text-live" : ""}>
                            {m.state === "in" ? (
                              <span className="mr-1 inline-block size-1.5 rounded-full bg-live live-dot align-middle" />
                            ) : null}
                            {m.state === "pre" ? kickLabel(m.kickoff) : m.statusLabel}
                          </span>
                        </div>
                        <TeamLine side={m.home} live={m.state !== "pre"} />
                        <TeamLine side={m.away} live={m.state !== "pre"} />
                        {m.broadcasts.length ? (
                          <p className="mt-2 text-xs text-muted">Đài: {m.broadcasts.join(" · ")}</p>
                        ) : null}
                      </button>
                      <div className="flex justify-end border-t border-line px-2 py-1">
                        <button
                          type="button"
                          aria-label={starred ? "Bỏ lưu trận" : "Lưu trận"}
                          onClick={() =>
                            setSaved((cur) => {
                              const next = { ...cur };
                              if (next[m.id]) delete next[m.id];
                              else next[m.id] = m;
                              return next;
                            })
                          }
                          className="grid size-11 place-items-center"
                        >
                          <Star className={starred ? "size-5 fill-gold text-gold" : "size-5 text-muted"} />
                        </button>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
            {updated ? (
              <p className="mt-4 text-center text-xs text-muted">
                Cập nhật {kickLabel(updated)} · Nguồn tỉ số công khai ESPN · Không phát luồng lậu
              </p>
            ) : null}
          </>
        ) : null}

        {tab === "table" ? (
          <section className="pt-4">
            <h2 className="font-display text-2xl text-fg">
              Bảng xếp hạng · {league === "world" ? "Ngoại hạng Anh" : leagueName}
            </h2>
            {league === "world" ? (
              <p className="mt-1 text-sm text-muted">Đang xem thế giới thì bảng mặc định là Ngoại hạng Anh. Chọn một giải để đổi bảng.</p>
            ) : null}
            {tableError ? <p className="mt-4 text-sm text-gold-soft">{tableError}</p> : null}
            {groups.map((g) => (
              <div key={g.name} className="mt-4 overflow-x-auto rounded-2xl border border-line">
                <p className="bg-raise px-3 py-2 font-display text-sm tracking-wide text-gold">{g.name}</p>
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-muted">
                    <tr>
                      <th className="px-2 py-2 font-medium">#</th>
                      <th className="px-2 py-2 font-medium">Đội</th>
                      <th className="px-2 py-2 font-medium">Tr</th>
                      <th className="px-2 py-2 font-medium">T</th>
                      <th className="px-2 py-2 font-medium">H</th>
                      <th className="px-2 py-2 font-medium">B</th>
                      <th className="px-2 py-2 font-medium">HS</th>
                      <th className="px-2 py-2 font-medium">Đ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.rows.map((r) => (
                      <tr key={`${g.name}-${r.team}`} className="border-t border-line">
                        <td className="px-2 py-2 text-muted">{r.rank}</td>
                        <td className="px-2 py-2">
                          <span className="inline-flex items-center gap-2">
                            {r.logo ? <img src={r.logo} alt="" className="size-5 object-contain" referrerPolicy="no-referrer" /> : null}
                            {r.team}
                          </span>
                        </td>
                        <td className="px-2 py-2">{r.played}</td>
                        <td className="px-2 py-2">{r.w}</td>
                        <td className="px-2 py-2">{r.d}</td>
                        <td className="px-2 py-2">{r.l}</td>
                        <td className="px-2 py-2">{r.gd}</td>
                        <td className="px-2 py-2 font-semibold text-gold">{r.pts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </section>
        ) : null}

        {tab === "news" ? (
          <section className="space-y-3 pt-4">
            <h2 className="font-display text-2xl">Tin sân cỏ</h2>
            {newsError ? <p className="text-sm text-gold-soft">{newsError}</p> : null}
            {articles.map((a) => (
              <a
                key={a.id}
                href={a.href || undefined}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded-2xl border border-line bg-surface"
              >
                {a.image ? <img src={a.image} alt="" className="h-40 w-full object-cover" referrerPolicy="no-referrer" /> : null}
                <div className="p-3">
                  <p className="font-semibold leading-snug">{a.title}</p>
                  {a.summary ? <p className="mt-1 line-clamp-3 text-sm text-muted">{a.summary}</p> : null}
                  <p className="mt-2 text-xs text-muted">{a.published ? whenLabel(a.published) : ""}</p>
                </div>
              </a>
            ))}
          </section>
        ) : null}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/95 px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur-md">
        <div className="grid grid-cols-4">
          {(
            [
              ["live", "Trực tiếp", Activity],
              ["table", "Bảng", Table2],
              ["news", "Tin", Newspaper],
              ["saved", "Đã lưu", Star],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={"flex h-14 flex-col items-center justify-center gap-0.5 text-xs " + (tab === id ? "text-gold" : "text-muted")}
            >
              <Icon className="size-5" />
              {label}
            </button>
          ))}
        </div>
      </nav>

      <TrumpSticker />

      {picker ? (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-bg px-4 pb-10 pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-3xl">Chọn giải</h2>
            <button type="button" aria-label="Đóng" onClick={() => setPicker(false)} className="grid size-11 place-items-center">
              <X />
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setLeague("world");
              setPicker(false);
              setTab("live");
            }}
            className="mb-4 flex h-12 w-full items-center rounded-2xl border border-gold bg-surface px-4 font-semibold text-gold-soft"
          >
            Toàn cầu — các giải lớn cùng lúc
          </button>
          {LEAGUE_GROUPS.map((group) => (
            <section key={group} className="mb-4">
              <h3 className="mb-2 font-display text-sm tracking-widest text-muted">{group}</h3>
              <div className="grid grid-cols-2 gap-2">
                {LEAGUES.filter((l) => l.group === group).map((l) => (
                  <button
                    key={l.slug}
                    type="button"
                    onClick={() => {
                      setLeague(l.slug);
                      setPicker(false);
                      setTab("live");
                    }}
                    className={
                      "h-12 rounded-2xl border px-3 text-left text-sm font-semibold " +
                      (league === l.slug ? "border-gold bg-raise text-gold-soft" : "border-line bg-surface text-fg")
                    }
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            </section>
          ))}
          <p className="text-sm text-muted">
            V-League chưa có trong nguồn tỉ số công khai này. Đội tuyển nằm ở ASEAN, Asian Cup, vòng loại World Cup châu Á và giao hữu.
          </p>
        </div>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-bg px-4 pb-16 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <button type="button" onClick={() => setOpen(null)} className="mb-3 flex h-11 items-center gap-1 text-sm text-gold-soft">
            <ChevronLeft className="size-5" />
            Danh sách
          </button>
          <p className="text-sm text-muted">{(detail ?? open).leagueName} · {(detail ?? open).venue || "Sân chưa rõ"}</p>
          <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <TeamBlock side={(detail ?? open).home} />
            <div className="text-center">
              <p className={"font-display text-4xl " + ((detail ?? open).state === "in" ? "text-live" : "text-fg")}>
                {(detail ?? open).state === "pre" ? kickLabel(open.kickoff) : `${(detail ?? open).home.score}–${(detail ?? open).away.score}`}
              </p>
              <p className="text-xs text-muted">{(detail ?? open).statusLabel}</p>
            </div>
            <TeamBlock side={(detail ?? open).away} />
          </div>
          {(detail ?? open).broadcasts.length ? (
            <p className="mt-3 text-center text-sm text-muted">Phát chính thức trên {(detail ?? open).broadcasts.join(", ")}</p>
          ) : null}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => void askBrief()}
              disabled={briefBusy}
              className="h-11 flex-1 rounded-full bg-gold text-sm font-semibold text-bg disabled:opacity-60"
            >
              {briefBusy ? "Đang viết…" : "Nhận định ngắn"}
            </button>
          </div>
          {brief ? <p className="mt-3 rounded-2xl border border-line bg-surface p-3 text-sm leading-relaxed">{brief}</p> : null}
          <div className="mt-4 flex gap-2">
            {(
              [
                ["flow", "Diễn biến"],
                ["xi", "Đội hình"],
                ["stats", "Số liệu"],
                ["watch", "Xem"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setSheetTab(id)}
                className={"h-10 flex-1 rounded-full text-sm font-semibold " + (sheetTab === id ? "bg-raise text-gold-soft" : "text-muted")}
              >
                {label}
              </button>
            ))}
          </div>
          {detailError ? <p className="mt-4 text-sm text-gold-soft">{detailError}</p> : null}
          {!detail && !detailError ? <div className="mt-4 h-40 animate-pulse rounded-2xl bg-surface" /> : null}
          {detail && sheetTab === "flow" ? (
            <div className="mt-4 space-y-3">
              {detail.timeline.length === 0 ? <p className="text-sm text-muted">Chưa có sự kiện. Trận sắp đá hoặc nguồn chưa cập nhật.</p> : null}
              <ul className="space-y-2">
                {detail.timeline.map((ev, i) => (
                  <li key={`${ev.minute}-${ev.player}-${i}`} className="flex gap-3 rounded-xl bg-surface px-3 py-2 text-sm">
                    <span className="w-10 shrink-0 font-display text-gold">{ev.minute || "•"}</span>
                    <span>
                      <span className={ev.kind === "goal" ? "text-gold-soft" : ev.kind === "red" ? "text-live" : "text-fg"}>
                        {ev.label}
                      </span>
                      {ev.player ? <span className="text-muted"> · {ev.player}</span> : null}
                    </span>
                  </li>
                ))}
              </ul>
              {detail.notes.length ? (
                <div>
                  <h3 className="mb-2 font-display text-lg">Tường thuật</h3>
                  <p className="mb-2 text-xs text-muted">Tiếng Anh từ nguồn phát.</p>
                  <ul className="space-y-2">
                    {detail.notes.map((n, i) => (
                      <li key={i} className="text-sm leading-relaxed text-fg">
                        {n.minute ? <span className="mr-2 font-display text-gold">{n.minute}</span> : null}
                        {n.text}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
          {detail && sheetTab === "xi" ? (
            <div className="mt-4 grid gap-4">
              {detail.homeDetail.players.length + detail.awayDetail.players.length === 0 ? (
                <p className="text-sm text-muted">Đội hình công bố gần giờ bóng lăn.</p>
              ) : (
                <>
                  <SideXi title={detail.home.name} formation={detail.homeDetail.formation} players={detail.homeDetail.players} form={detail.homeDetail.form} />
                  <SideXi title={detail.away.name} formation={detail.awayDetail.formation} players={detail.awayDetail.players} form={detail.awayDetail.form} />
                </>
              )}
            </div>
          ) : null}
          {detail && sheetTab === "stats" ? (
            <ul className="mt-4 space-y-3">
              {detail.stats.length === 0 ? <li className="text-sm text-muted">Chưa có số liệu trận.</li> : null}
              {detail.stats.map((s) => {
                const total = s.homeNum + s.awayNum || 1;
                return (
                  <li key={s.key}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{s.home}</span>
                      <span className="text-muted">{s.label}</span>
                      <span>{s.away}</span>
                    </div>
                    <div className="flex h-1.5 overflow-hidden rounded-full bg-raise">
                      <span className="bg-gold" style={{ width: `${(s.homeNum / total) * 100}%` }} />
                      <span className="bg-line" style={{ width: `${(s.awayNum / total) * 100}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : null}
          {detail && sheetTab === "watch" ? (
            <div className="mt-4 space-y-4">
              <p className="text-sm leading-relaxed text-muted">
                Clip dưới đây là highlight chính thức khi nguồn có file. Trận bản quyền đầy đủ phát trên đài ghi ở đầu trang, không nhúng luồng lậu.
              </p>
              {detail.clips.length === 0 ? <p className="text-sm text-fg">Chưa có clip cho trận này.</p> : null}
              {detail.clips.map((c) => (
                <figure key={c.src} className="overflow-hidden rounded-2xl border border-line bg-surface">
                  <video controls playsInline poster={c.thumb || undefined} src={c.src} className="aspect-video w-full bg-black" />
                  <figcaption className="p-3 text-sm">{c.title}</figcaption>
                </figure>
              ))}
              {detail.watchUrl ? (
                <a href={detail.watchUrl} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center text-sm font-semibold text-gold">
                  Mở trang trận trên ESPN
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function TeamLine({ side, live }: { side: MatchCard["home"]; live: boolean }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <Crest src={side.logo} label={side.abbr || side.short} />
      <span className="min-w-0 flex-1 truncate text-base font-semibold">{side.short || side.name}</span>
      <span className="font-display text-2xl leading-none">{live ? side.score : ""}</span>
    </div>
  );
}

function TeamBlock({ side }: { side: MatchCard["home"] }) {
  return (
    <div className="flex flex-col items-center text-center">
      <Crest src={side.logo} label={side.abbr || side.short} />
      <p className="mt-2 text-sm font-semibold leading-tight">{side.short || side.name}</p>
    </div>
  );
}

function SideXi({
  title,
  formation,
  players,
  form,
}: {
  title: string;
  formation: string;
  players: PlayerLine[];
  form: string[];
}) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <span className="flex gap-1">
          {form.map((m, i) => (
            <span
              key={i}
              className={
                "grid size-5 place-items-center rounded-full text-xs font-semibold " +
                (m === "W" ? "bg-up text-bg" : m === "L" ? "bg-live text-fg" : "bg-raise text-muted")
              }
            >
              {m}
            </span>
          ))}
        </span>
      </div>
      <PitchMap formation={formation} players={players} />
    </section>
  );
}
