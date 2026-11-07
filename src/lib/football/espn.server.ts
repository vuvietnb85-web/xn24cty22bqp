import { WORLD_SLUGS, isKnownLeague, leagueBySlug } from "@/lib/football/catalog";
import type {
  Article,
  Clip,
  MatchCard,
  MatchDetail,
  Note,
  PlayerLine,
  Side,
  SideDetail,
  StandingGroup,
  StatLine,
  TimelineItem,
} from "@/lib/football/types";

type Dict = Record<string, unknown>;

const mem = new Map<string, { exp: number; data: unknown }>();

function isDict(v: unknown): v is Dict {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function str(v: unknown, fallback = ""): string {
  if (typeof v === "string") return v;
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return fallback;
}

function arr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

async function espn(path: string): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 9000);
  try {
    const res = await fetch(`https://site.api.espn.com${path}`, {
      signal: ctrl.signal,
      headers: { accept: "application/json" },
    });
    if (!res.ok) throw new Error(`espn ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = mem.get(key);
  if (hit && hit.exp > Date.now()) return Promise.resolve(hit.data as T);
  return load().then((data) => {
    mem.set(key, { exp: Date.now() + ttlMs, data });
    return data;
  });
}

const STATUS_VI: Record<string, string> = {
  STATUS_SCHEDULED: "Sắp đá",
  STATUS_IN_PROGRESS: "Đang đá",
  STATUS_FIRST_HALF: "Hiệp 1",
  STATUS_SECOND_HALF: "Hiệp 2",
  STATUS_HALFTIME: "Nghỉ giữa",
  STATUS_EXTRA_TIME: "Hiệp phụ",
  STATUS_HALFTIME_ET: "Nghỉ hiệp phụ",
  STATUS_PENALTIES: "Luân lưu",
  STATUS_FULL_TIME: "Hết giờ",
  STATUS_FINAL: "Kết thúc",
  STATUS_FINAL_PEN: "Kết thúc (pen)",
  STATUS_FINAL_AET: "Hết hiệp phụ",
  STATUS_POSTPONED: "Hoãn",
  STATUS_CANCELED: "Hủy",
  STATUS_SUSPENDED: "Tạm dừng",
  STATUS_DELAYED: "Trễ giờ",
  STATUS_ABANDONED: "Bỏ dở",
};

function statusOf(raw: unknown): { state: MatchCard["state"]; name: string; label: string; clock: string } {
  const status = isDict(raw) ? raw : {};
  const type = isDict(status.type) ? status.type : {};
  const name = str(type.name, "STATUS_SCHEDULED");
  const stateRaw = str(type.state, "pre");
  const state: MatchCard["state"] = stateRaw === "in" ? "in" : stateRaw === "post" ? "post" : "pre";
  const clock = str(status.displayClock);
  const label = STATUS_VI[name] ?? (state === "in" ? "Đang đá" : state === "post" ? "Kết thúc" : "Sắp đá");
  const shown = state === "in" && clock && clock !== "0'" ? clock : label;
  return { state, name, label: shown, clock };
}

function sideOf(raw: unknown): Side {
  const c = isDict(raw) ? raw : {};
  const team = isDict(c.team) ? c.team : {};
  return {
    id: str(team.id),
    name: str(team.displayName, "—"),
    short: str(team.shortDisplayName, str(team.displayName, "—")),
    abbr: str(team.abbreviation),
    logo: logoOf(team),
    score: str(c.score, "0"),
  };
}

function logoOf(team: Dict): string {
  const direct = str(team.logo);
  if (direct) return direct;
  const logos = arr(team.logos).filter(isDict);
  return logos.length ? str(logos[0].href) : "";
}

function broadcastsOf(comp: Dict): string[] {
  const names = new Set<string>();
  for (const item of [...arr(comp.broadcasts), ...arr(comp.geoBroadcasts)]) {
    if (!isDict(item)) continue;
    for (const n of arr(item.names)) {
      const s = str(n).trim();
      if (s) names.add(s);
    }
  }
  return [...names].slice(0, 4);
}

function watchUrlOf(event: Dict): string {
  for (const link of arr(event.links)) {
    if (!isDict(link)) continue;
    const href = str(link.href);
    if (href.startsWith("http") && !href.includes("draftkings") && !href.includes("sportsbook")) return href;
  }
  return "";
}

function cardFromEvent(event: unknown, league: string): MatchCard | null {
  if (!isDict(event)) return null;
  const comp = arr(event.competitions).find(isDict);
  if (!comp) return null;
  const comps = arr(comp.competitors).filter(isDict);
  const home = sideOf(comps.find((c) => str(c.homeAway) === "home") ?? comps[0]);
  const away = sideOf(comps.find((c) => str(c.homeAway) === "away") ?? comps[1]);
  if (!home.name || home.name === "—") return null;
  const st = statusOf(comp.status ?? event.status);
  const venue = isDict(comp.venue) ? comp.venue : isDict(event.venue) ? event.venue : {};
  const meta = leagueBySlug(league);
  return {
    id: str(event.id),
    league,
    leagueName: meta?.short ?? league,
    kickoff: str(event.date),
    state: st.state,
    statusName: st.name,
    statusLabel: st.label,
    clock: st.clock,
    home,
    away,
    venue: str(venue.fullName),
    broadcasts: broadcastsOf(comp),
    watchUrl: watchUrlOf(event),
  };
}

function peopleOf(raw: Dict): string {
  const names: string[] = [];
  for (const a of arr(raw.athletesInvolved)) {
    if (!isDict(a)) continue;
    const n = str(a.shortName) || str(a.displayName);
    if (n) names.push(n);
  }
  for (const p of arr(raw.participants)) {
    if (!isDict(p)) continue;
    const a = isDict(p.athlete) ? p.athlete : p;
    const n = str(a.shortName) || str(a.displayName);
    if (n && !names.includes(n)) names.push(n);
  }
  return names.join(" · ");
}

function kindOf(text: string, raw: Dict): { kind: TimelineItem["kind"]; label: string } | null {
  const lower = text.toLowerCase();
  if (/delay|kickoff|end regular|start 2nd|full time|end of/.test(lower)) return null;
  if (raw.scoringPlay === true || lower === "goal" || lower.includes("own goal")) {
    if (lower.includes("miss")) return { kind: "other", label: "Đá hỏng" };
    return {
      kind: "goal",
      label: raw.ownGoal === true || lower.includes("own goal") ? "Phản lưới" : lower.includes("penalty") ? "Phạt đền" : "Bàn thắng",
    };
  }
  if (raw.redCard === true || lower.includes("red card")) return { kind: "red", label: "Thẻ đỏ" };
  if (raw.yellowCard === true || lower.includes("yellow card")) return { kind: "yellow", label: "Thẻ vàng" };
  if (lower.includes("substitution")) return { kind: "sub", label: "Thay người" };
  if (lower.includes("halftime")) return { kind: "other", label: "Nghỉ giữa" };
  if (!text) return null;
  return { kind: "other", label: text };
}

function itemFrom(raw: Dict): TimelineItem | null {
  const type = isDict(raw.type) ? raw.type : {};
  const text = str(type.text) || str(raw.text);
  const mapped = kindOf(text, raw);
  if (!mapped) return null;
  const clock = isDict(raw.clock) ? raw.clock : {};
  const team = isDict(raw.team) ? raw.team : {};
  return {
    minute: str(clock.displayValue),
    kind: mapped.kind,
    label: mapped.label,
    player: peopleOf(raw) || str(raw.shortText),
    teamId: str(team.id),
    score: "",
  };
}

function timelineFrom(rows: unknown[]): TimelineItem[] {
  const tagged: { order: number; item: TimelineItem }[] = [];
  for (const raw of rows) {
    if (!isDict(raw)) continue;
    const item = itemFrom(raw);
    if (!item) continue;
    const clock = isDict(raw.clock) ? raw.clock : {};
    tagged.push({ order: typeof clock.value === "number" ? clock.value : tagged.length, item });
  }
  tagged.sort((a, b) => a.order - b.order);
  return tagged.map((t) => t.item);
}

const STAT_VI: Record<string, string> = {
  possessionPct: "Kiểm soát bóng",
  shotsTotal: "Số cú sút",
  shotsOnTarget: "Sút trúng đích",
  cornerKicks: "Phạt góc",
  foulsCommitted: "Phạm lỗi",
  yellowCards: "Thẻ vàng",
  redCards: "Thẻ đỏ",
  saves: "Cản phá",
  offsides: "Việt vị",
  totalPasses: "Đường chuyền",
};

function numOf(display: string): number {
  const n = Number.parseFloat(display.replace("%", "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function statsOf(box: unknown, homeId: string, awayId: string): StatLine[] {
  if (!isDict(box)) return [];
  const teams = arr(box.teams).filter(isDict);
  const pick = (id: string) => teams.find((t) => isDict(t.team) && str(t.team.id) === id);
  const home = pick(homeId);
  const away = pick(awayId);
  if (!home || !away) return [];
  const map = (team: Dict) => {
    const out = new Map<string, string>();
    for (const s of arr(team.statistics)) {
      if (!isDict(s)) continue;
      out.set(str(s.name), str(s.displayValue));
    }
    return out;
  };
  const h = map(home);
  const a = map(away);
  const lines: StatLine[] = [];
  for (const [key, label] of Object.entries(STAT_VI)) {
    if (!h.has(key) && !a.has(key)) continue;
    const hv = h.get(key) ?? "0";
    const av = a.get(key) ?? "0";
    lines.push({ key, label, home: hv, away: av, homeNum: numOf(hv), awayNum: numOf(av) });
  }
  return lines;
}

function playersOf(rosterBlock: unknown): { formation: string; players: PlayerLine[] } {
  if (!isDict(rosterBlock)) return { formation: "", players: [] };
  const players: PlayerLine[] = [];
  for (const raw of arr(rosterBlock.roster)) {
    if (!isDict(raw)) continue;
    const athlete = isDict(raw.athlete) ? raw.athlete : {};
    const pos = isDict(raw.position) ? raw.position : {};
    players.push({
      name: str(athlete.shortName) || str(athlete.displayName, "Cầu thủ"),
      jersey: str(raw.jersey),
      position: str(pos.abbreviation) || str(pos.displayName),
      starter: raw.starter === true,
      place: typeof raw.formationPlace === "number" ? raw.formationPlace : 99,
    });
  }
  return { formation: str(rosterBlock.formation), players };
}

function formOf(block: unknown): string[] {
  if (!isDict(block)) return [];
  const marks: string[] = [];
  for (const ev of arr(block.events)) {
    if (!isDict(ev)) continue;
    const g = str(ev.gameResult).toUpperCase();
    if (g === "W" || g === "D" || g === "L") marks.push(g);
  }
  return marks.slice(0, 5);
}

function clipsOf(videos: unknown): Clip[] {
  const clips: Clip[] = [];
  for (const raw of arr(videos)) {
    if (!isDict(raw)) continue;
    const links = isDict(raw.links) ? raw.links : {};
    const source = isDict(links.source) ? links.source : {};
    const mobile = isDict(links.mobile) ? links.mobile : {};
    const mobileSource = isDict(mobile.source) ? mobile.source : {};
    const hd = isDict(source.HD) ? source.HD : {};
    const src = str(hd.href) || str(source.href) || str(mobileSource.href);
    if (!src.endsWith(".mp4") && !src.includes(".mp4")) continue;
    clips.push({
      title: str(raw.headline, "Clip"),
      thumb: str(raw.thumbnail),
      src,
    });
  }
  return clips.slice(0, 4);
}

function notesOf(commentary: unknown): Note[] {
  const notes: Note[] = [];
  for (const raw of arr(commentary)) {
    if (!isDict(raw)) continue;
    const text = str(raw.text).trim();
    if (!text) continue;
    const time = isDict(raw.time) ? str(raw.time.displayValue) : "";
    notes.push({ minute: time, text });
  }
  return notes.slice(-18).reverse();
}

function detailSide(base: Side, roster: { formation: string; players: PlayerLine[] }, form: string[]): SideDetail {
  return { ...base, formation: roster.formation, players: roster.players, form };
}

export async function loadBoard(league: string, date: string): Promise<{ matches: MatchCard[]; failed: string[] }> {
  const slugs = league === "world" ? WORLD_SLUGS : isKnownLeague(league) ? [league] : [];
  if (!slugs.length) return { matches: [], failed: [] };
  const failed: string[] = [];
  const batches = await Promise.all(
    slugs.map(async (slug) => {
      try {
        const data = await cached(`board:${slug}:${date}`, 20_000, () =>
          espn(`/apis/site/v2/sports/soccer/${slug}/scoreboard?dates=${date}`),
        );
        const events = isDict(data) ? arr(data.events) : [];
        return events.map((ev) => cardFromEvent(ev, slug)).filter((m): m is MatchCard => !!m && !!m.id);
      } catch {
        failed.push(slug);
        return [];
      }
    }),
  );
  const matches = batches.flat();
  matches.sort((a, b) => {
    const rank = (s: MatchCard["state"]) => (s === "in" ? 0 : s === "pre" ? 1 : 2);
    const d = rank(a.state) - rank(b.state);
    if (d) return d;
    return a.kickoff.localeCompare(b.kickoff);
  });
  return { matches, failed };
}

export async function loadMatch(league: string, id: string): Promise<MatchDetail | null> {
  if (!isKnownLeague(league) || !/^\d{4,16}$/.test(id)) return null;
  const ttl = 15_000;
  const data = await cached(`match:${league}:${id}`, ttl, () =>
    espn(`/apis/site/v2/sports/soccer/${league}/summary?event=${id}`),
  );
  if (!isDict(data)) return null;
  const header = isDict(data.header) ? data.header : {};
  const comp = arr(header.competitions).find(isDict);
  if (!comp) return null;
  const eventLike: Dict = {
    id,
    date: str(comp.date),
    competitions: [comp],
    status: comp.status,
    links: arr(header.links),
  };
  const card = cardFromEvent(eventLike, league);
  if (!card) return null;
  const rosters = arr(data.rosters).filter(isDict);
  const homeRoster = rosters.find((r) => str(r.homeAway) === "home") ?? rosters[0];
  const awayRoster = rosters.find((r) => str(r.homeAway) === "away") ?? rosters[1];
  const forms = arr(data.lastFiveGames).filter(isDict);
  const formFor = (teamId: string) => {
    const block = forms.find((f) => isDict(f.team) && str((f.team as Dict).id) === teamId);
    return formOf(block);
  };
  const homeP = playersOf(homeRoster);
  const awayP = playersOf(awayRoster);
  return {
    ...card,
    timeline: (() => {
      const fromKeys = timelineFrom(arr(data.keyEvents));
      const fromDetails = timelineFrom(arr(comp.details));
      return fromKeys.length >= fromDetails.length ? fromKeys : fromDetails;
    })(),
    homeDetail: detailSide(card.home, homeP, formFor(card.home.id)),
    awayDetail: detailSide(card.away, awayP, formFor(card.away.id)),
    stats: statsOf(data.boxscore, card.home.id, card.away.id),
    clips: clipsOf(data.videos),
    notes: notesOf(data.commentary),
  };
}

function statNum(stats: Map<string, string>, name: string): string {
  return stats.get(name) ?? "—";
}

export async function loadStandings(league: string): Promise<StandingGroup[]> {
  if (!isKnownLeague(league)) return [];
  const data = await cached(`table:${league}`, 120_000, () =>
    espn(`/apis/v2/sports/soccer/${league}/standings`),
  );
  if (!isDict(data)) return [];
  const children = arr(data.children).filter(isDict);
  const blocks = children.length ? children : [data];
  const groups: StandingGroup[] = [];
  for (const block of blocks) {
    const standings = isDict(block.standings) ? block.standings : block;
    if (!isDict(standings)) continue;
    const rows = [];
    for (const entry of arr(standings.entries)) {
      if (!isDict(entry)) continue;
      const team = isDict(entry.team) ? entry.team : {};
      const stats = new Map<string, string>();
      for (const s of arr(entry.stats)) {
        if (!isDict(s)) continue;
        stats.set(str(s.name), str(s.displayValue));
      }
      rows.push({
        rank: statNum(stats, "rank"),
        team: str(team.shortDisplayName) || str(team.displayName, "—"),
        logo: logoOf(team),
        played: statNum(stats, "gamesPlayed"),
        w: statNum(stats, "wins"),
        d: statNum(stats, "ties"),
        l: statNum(stats, "losses"),
        gd: statNum(stats, "pointDifferential"),
        pts: statNum(stats, "points"),
      });
    }
    if (rows.length) groups.push({ name: str(block.name) || str(standings.name) || "Bảng", rows });
  }
  return groups;
}

export async function loadNews(league: string): Promise<Article[]> {
  const slugs = league === "world" ? ["eng.1", "uefa.champions", "esp.1"] : isKnownLeague(league) ? [league] : ["eng.1"];
  const packs = await Promise.all(
    slugs.map(async (slug) => {
      try {
        const data = await cached(`news:${slug}`, 180_000, () =>
          espn(`/apis/site/v2/sports/soccer/${slug}/news?limit=8`),
        );
        return isDict(data) ? arr(data.articles) : [];
      } catch {
        return [];
      }
    }),
  );
  const seen = new Set<string>();
  const articles: Article[] = [];
  for (const raw of packs.flat()) {
    if (!isDict(raw)) continue;
    const id = str(raw.id);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const images = arr(raw.images).filter(isDict);
    const links = isDict(raw.links) ? raw.links : {};
    const web = isDict(links.web) ? links.web : {};
    articles.push({
      id,
      title: str(raw.headline, "Tin bóng đá"),
      summary: str(raw.description),
      image: images.length ? str(images[0].url) : "",
      published: str(raw.published),
      href: str(web.href),
    });
  }
  articles.sort((a, b) => b.published.localeCompare(a.published));
  return articles.slice(0, 18);
}
