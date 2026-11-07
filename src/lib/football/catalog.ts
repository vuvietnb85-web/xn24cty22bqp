export type League = {
  slug: string;
  name: string;
  short: string;
  group: string;
};

export const LEAGUES: League[] = [
  { slug: "eng.1", name: "Ngoại hạng Anh", short: "NHA", group: "Đỉnh cao châu Âu" },
  { slug: "esp.1", name: "La Liga", short: "La Liga", group: "Đỉnh cao châu Âu" },
  { slug: "ger.1", name: "Bundesliga", short: "Bundesliga", group: "Đỉnh cao châu Âu" },
  { slug: "ita.1", name: "Serie A", short: "Serie A", group: "Đỉnh cao châu Âu" },
  { slug: "fra.1", name: "Ligue 1", short: "Ligue 1", group: "Đỉnh cao châu Âu" },
  { slug: "uefa.champions", name: "UEFA Champions League", short: "C1", group: "Đỉnh cao châu Âu" },
  { slug: "uefa.europa", name: "UEFA Europa League", short: "C2", group: "Đỉnh cao châu Âu" },
  { slug: "uefa.europa.conf", name: "UEFA Conference League", short: "C3", group: "Đỉnh cao châu Âu" },
  { slug: "por.1", name: "Primeira Liga", short: "Bồ Đào Nha", group: "Châu Âu" },
  { slug: "ned.1", name: "Eredivisie", short: "Hà Lan", group: "Châu Âu" },
  { slug: "bel.1", name: "Pro League Bỉ", short: "Bỉ", group: "Châu Âu" },
  { slug: "sco.1", name: "Premiership Scotland", short: "Scotland", group: "Châu Âu" },
  { slug: "tur.1", name: "Süper Lig", short: "Thổ Nhĩ Kỳ", group: "Châu Âu" },
  { slug: "eng.2", name: "Championship Anh", short: "Hạng Nhì Anh", group: "Châu Âu" },
  { slug: "eng.fa", name: "FA Cup", short: "FA Cup", group: "Châu Âu" },
  { slug: "uefa.nations", name: "UEFA Nations League", short: "Nations", group: "Châu Âu" },
  { slug: "uefa.euro", name: "Euro", short: "Euro", group: "Châu Âu" },
  { slug: "gre.1", name: "Super League Hy Lạp", short: "Hy Lạp", group: "Châu Âu" },
  { slug: "aut.1", name: "Bundesliga Áo", short: "Áo", group: "Châu Âu" },
  { slug: "den.1", name: "Superliga Đan Mạch", short: "Đan Mạch", group: "Châu Âu" },
  { slug: "swe.1", name: "Allsvenskan", short: "Thụy Điển", group: "Châu Âu" },
  { slug: "nor.1", name: "Eliteserien", short: "Na Uy", group: "Châu Âu" },
  { slug: "rus.1", name: "Ngoại hạng Nga", short: "Nga", group: "Châu Âu" },
  { slug: "jpn.1", name: "J1 League", short: "J-League", group: "Châu Á" },
  { slug: "ksa.1", name: "Saudi Pro League", short: "Ả Rập Xê Út", group: "Châu Á" },
  { slug: "chn.1", name: "Chinese Super League", short: "Trung Quốc", group: "Châu Á" },
  { slug: "ind.1", name: "Indian Super League", short: "Ấn Độ", group: "Châu Á" },
  { slug: "aus.1", name: "A-League", short: "Úc", group: "Châu Á" },
  { slug: "afc.champions", name: "AFC Champions League Elite", short: "C1 châu Á", group: "Châu Á" },
  { slug: "afc.asian.cup", name: "Asian Cup", short: "Asian Cup", group: "Châu Á" },
  { slug: "aff.championship", name: "ASEAN Championship", short: "ASEAN", group: "Châu Á" },
  { slug: "fifa.worldq.afc", name: "Vòng loại World Cup — AFC", short: "VL World Cup Á", group: "Châu Á" },
  { slug: "usa.1", name: "MLS", short: "MLS", group: "Châu Mỹ" },
  { slug: "mex.1", name: "Liga MX", short: "Mexico", group: "Châu Mỹ" },
  { slug: "bra.1", name: "Brasileirão", short: "Brazil", group: "Châu Mỹ" },
  { slug: "arg.1", name: "Liga Profesional", short: "Argentina", group: "Châu Mỹ" },
  { slug: "conmebol.libertadores", name: "Copa Libertadores", short: "Libertadores", group: "Châu Mỹ" },
  { slug: "conmebol.sudamericana", name: "Copa Sudamericana", short: "Sudamericana", group: "Châu Mỹ" },
  { slug: "conmebol.america", name: "Copa América", short: "Copa América", group: "Châu Mỹ" },
  { slug: "rsa.1", name: "Premiership Nam Phi", short: "Nam Phi", group: "Châu Phi" },
  { slug: "caf.champions", name: "CAF Champions League", short: "C1 châu Phi", group: "Châu Phi" },
  { slug: "caf.nations", name: "CAN", short: "CAN", group: "Châu Phi" },
  { slug: "fifa.world", name: "World Cup", short: "World Cup", group: "Quốc tế" },
  { slug: "fifa.cwc", name: "FIFA Club World Cup", short: "Club WC", group: "Quốc tế" },
  { slug: "fifa.friendly", name: "Giao hữu quốc tế", short: "Giao hữu", group: "Quốc tế" },
  { slug: "fifa.worldq.uefa", name: "Vòng loại World Cup — UEFA", short: "VL WC Âu", group: "Quốc tế" },
  { slug: "fifa.worldq.conmebol", name: "Vòng loại World Cup — Nam Mỹ", short: "VL WC Nam Mỹ", group: "Quốc tế" },
  { slug: "fifa.worldq.concacaf", name: "Vòng loại World Cup — CONCACAF", short: "VL WC Bắc Mỹ", group: "Quốc tế" },
  { slug: "fifa.worldq.caf", name: "Vòng loại World Cup — CAF", short: "VL WC Phi", group: "Quốc tế" },
];

export const WORLD_SLUGS = [
  "eng.1",
  "esp.1",
  "ger.1",
  "ita.1",
  "fra.1",
  "uefa.champions",
  "uefa.europa",
  "uefa.europa.conf",
  "por.1",
  "ned.1",
  "jpn.1",
  "ksa.1",
  "usa.1",
  "bra.1",
  "arg.1",
  "mex.1",
  "aus.1",
  "aff.championship",
  "afc.champions",
  "fifa.worldq.afc",
  "fifa.friendly",
  "fifa.world",
];

const bySlug = new Map(LEAGUES.map((l) => [l.slug, l]));

export function leagueBySlug(slug: string): League | undefined {
  return bySlug.get(slug);
}

export function isKnownLeague(slug: string): boolean {
  return bySlug.has(slug);
}

export const LEAGUE_GROUPS = [...new Set(LEAGUES.map((l) => l.group))];
