export type Side = {
  id: string;
  name: string;
  short: string;
  abbr: string;
  logo: string;
  score: string;
};

export type MatchCard = {
  id: string;
  league: string;
  leagueName: string;
  kickoff: string;
  state: "pre" | "in" | "post";
  statusName: string;
  statusLabel: string;
  clock: string;
  home: Side;
  away: Side;
  venue: string;
  broadcasts: string[];
  watchUrl: string;
};

export type TimelineItem = {
  minute: string;
  kind: "goal" | "yellow" | "red" | "sub" | "other";
  label: string;
  player: string;
  teamId: string;
  score: string;
};

export type PlayerLine = {
  name: string;
  jersey: string;
  position: string;
  starter: boolean;
  place: number;
};

export type SideDetail = Side & {
  formation: string;
  players: PlayerLine[];
  form: string[];
};

export type StatLine = {
  key: string;
  label: string;
  home: string;
  away: string;
  homeNum: number;
  awayNum: number;
};

export type Clip = {
  title: string;
  thumb: string;
  src: string;
};

export type Note = {
  minute: string;
  text: string;
};

export type MatchDetail = MatchCard & {
  timeline: TimelineItem[];
  homeDetail: SideDetail;
  awayDetail: SideDetail;
  stats: StatLine[];
  clips: Clip[];
  notes: Note[];
};

export type StandingRow = {
  rank: string;
  team: string;
  logo: string;
  played: string;
  w: string;
  d: string;
  l: string;
  gd: string;
  pts: string;
};

export type StandingGroup = {
  name: string;
  rows: StandingRow[];
};

export type Article = {
  id: string;
  title: string;
  summary: string;
  image: string;
  published: string;
  href: string;
};

export type TrumpTick = {
  price: number;
  change: number;
  changePct: number;
  high: number;
  low: number;
  volume: number;
  quoteVolume: number;
  spark: number[];
  updatedAt: string;
};
