import { i as __toESM } from "../_runtime.mjs";
import { _ as lazyRouteComponent, b as useRouter, f as Scripts, g as Outlet, h as createRouter, p as HeadContent, q as require_react, v as createFileRoute, x as require_jsx_runtime, y as createRootRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as TriangleAlert } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-CyGCp9XL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* Path-based preview hosts serve the dev server under `/{port_id}/` and strip
* that prefix before forwarding, so SSR sees `/` while the browser URL keeps the
* prefix. TanStack Start resets `basepath` on hydration, so a `rewrite` keeps
* client routing and generated links aligned with the public URL.
*/
var PATH_BASED_PREVIEW_HOSTS = /* @__PURE__ */ new Set([
	"preview.grok.genai.mil",
	"preview.grok.mil",
	"preview.grokgsac.com"
]);
var PORT_ID_PREFIX = /^\/hds-[a-z0-9]+-\d+-[a-z0-9]+(?=\/|$)/i;
function previewPathPrefix(hostname, pathname) {
	if (!PATH_BASED_PREVIEW_HOSTS.has(hostname.toLowerCase())) return void 0;
	return PORT_ID_PREFIX.exec(pathname)?.[0];
}
function prefixRewrite(prefix) {
	return {
		input: ({ url }) => {
			if (url.pathname === prefix) url.pathname = "/";
			else if (url.pathname.startsWith(`${prefix}/`)) url.pathname = url.pathname.slice(prefix.length);
			return url;
		},
		output: ({ url }) => {
			url.pathname = `${prefix}${url.pathname}`;
			return url;
		}
	};
}
function previewPathRewrite() {
	if (typeof window === "undefined") return void 0;
	const prefix = previewPathPrefix(window.location.hostname, window.location.pathname);
	return prefix ? prefixRewrite(prefix) : void 0;
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var styles_default = "/assets/styles-B72ma1Rc.css";
var APP_NAME = "SÂN 24";
var Route$9 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "Tỉ số trực tiếp bóng đá toàn cầu, clip chính thức và sticker giá TRUMP/USDT từ Binance."
			},
			{
				name: "theme-color",
				content: "#071018"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Source+Sans+3:wght@400;600;700&display=swap"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "vi",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var $$splitComponentImporter = () => import("./routes-C-VbQ6Uj.mjs");
var Route$8 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var MIRRORS = ["https://de1.api.radio-browser.info", "https://nl1.api.radio-browser.info"];
var DENY = [
	"freem3u",
	"zmdcdn.me",
	"dpdns.org",
	"dethich.pw",
	"watchtivo",
	"vnns.net",
	"malimarcdn"
];
var cache$2 = /* @__PURE__ */ new Map();
function blocked(src) {
	const lower = src.toLowerCase();
	return DENY.some((bit) => lower.includes(bit));
}
function publicUrl(raw) {
	let url;
	try {
		url = new URL(raw);
	} catch {
		return null;
	}
	if (url.protocol !== "https:" && url.protocol !== "http:") return null;
	const host = url.hostname.toLowerCase();
	if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) return null;
	if (/^(127\.|10\.|192\.168\.|169\.254\.|0\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(host)) return null;
	if (blocked(raw)) return null;
	return url;
}
async function radio(params) {
	const path = `/json/stations/search?${params}`;
	for (const base of MIRRORS) try {
		const res = await fetch(base + path, { headers: {
			"user-agent": "San24/1.0",
			accept: "application/json"
		} });
		if (!res.ok) continue;
		const data = await res.json();
		if (Array.isArray(data)) return data;
	} catch {}
	throw new Error("máy chủ đài không trả lời");
}
function score(row, save, q) {
	const kbps = row.bitrate || 0;
	const src = row.url_resolved || row.url || "";
	const hls = row.hls === 1 || src.includes(".m3u8");
	let value = 0;
	if (row.lastcheckok === 1) value += 40;
	if (hls) value += 28;
	if (row.countrycode === "VN") value += q ? 12 : 36;
	value += Math.min(row.clickcount || 0, 4e3) / 120;
	if ((row.codec || "").toUpperCase().includes("AAC")) value += 6;
	if (save) {
		if (kbps >= 48 && kbps <= 128) value += 32;
		else if (kbps > 128 && kbps <= 192) value += 18;
		else if (kbps > 192 && kbps <= 256) value += 8;
		else if (kbps > 320) value -= 30;
	} else if (kbps >= 128 && kbps <= 256) value += 14;
	return value;
}
function toStation(row, save, q) {
	const src = row.url_resolved || row.url || "";
	return {
		name: (row.name || "Đài").slice(0, 64),
		src,
		kbps: typeof row.bitrate === "number" ? row.bitrate : 0,
		codec: row.codec || "",
		country: row.countrycode || "",
		hls: row.hls === 1 || src.includes(".m3u8"),
		score: score(row, save, q)
	};
}
function pickVariant(text, base, save) {
	const lines = text.split(/\r?\n/);
	const ladder = [];
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i] || "";
		if (!line.includes("BANDWIDTH")) continue;
		const match = line.match(/BANDWIDTH=(\d+)/);
		const next = lines.slice(i + 1).find((item) => item && !item.startsWith("#"));
		if (!match || !next) continue;
		const abs = new URL(next.trim(), base).href;
		if (!publicUrl(abs)) continue;
		ladder.push({
			kbps: Math.round(Number(match[1]) / 1e3),
			src: abs
		});
	}
	if (!ladder.length) return null;
	const cap = save ? 450 : 1200;
	return ladder.filter((item) => item.kbps <= cap).sort((a, b) => b.kbps - a.kbps)[0] || ladder.sort((a, b) => a.kbps - b.kbps)[0] || null;
}
async function probe(raw, save) {
	const url = publicUrl(raw);
	if (!url) return { error: "Luồng không hợp lệ." };
	const res = await fetch(url, {
		headers: {
			"user-agent": "San24/1.0",
			range: "bytes=0-4096"
		},
		signal: AbortSignal.timeout(6e3),
		redirect: "follow"
	});
	const cors = (res.headers.get("access-control-allow-origin") || "").length > 0;
	const type = res.headers.get("content-type") || "";
	if (!(url.pathname.includes(".m3u8") || type.includes("mpegurl") || type.includes("mpegURL"))) {
		await res.body?.cancel();
		return {
			src: url.href,
			kbps: 0,
			heavy: false,
			cors,
			hls: false
		};
	}
	const variant = pickVariant(await res.text(), res.url || url.href, save);
	const kbps = variant?.kbps || 0;
	return {
		src: variant?.src || url.href,
		kbps,
		heavy: kbps > 700,
		cors,
		hls: true
	};
}
var Route$7 = createFileRoute("/api/air")({ server: { handlers: { GET: async ({ request }) => {
	const query = new URL(request.url);
	const probeUrl = query.searchParams.get("probe");
	const save = query.searchParams.get("save") !== "0";
	if (probeUrl) {
		const key = `p:${save ? 1 : 0}:${probeUrl}`;
		const hit = cache$2.get(key);
		if (hit && hit.exp > Date.now()) return Response.json(hit.body);
		try {
			const body = await probe(probeUrl.slice(0, 500), save);
			if ("error" in body) return Response.json(body, { status: 400 });
			cache$2.set(key, {
				exp: Date.now() + 18e4,
				body
			});
			return Response.json(body);
		} catch {
			return Response.json({ error: "Không dò được luồng." }, { status: 502 });
		}
	}
	const q = (query.searchParams.get("q") || "").slice(0, 40);
	const key = `s:${save ? 1 : 0}:${q}`;
	const hit = cache$2.get(key);
	if (hit && hit.exp > Date.now()) return Response.json(hit.body, { headers: { "cache-control": "public, max-age=120" } });
	try {
		const base = new URLSearchParams({
			hidebroken: "true",
			order: "clickcount",
			reverse: "true",
			limit: "30"
		});
		const vn = new URLSearchParams(base);
		vn.set("countrycode", "VN");
		if (q) vn.set("name", q);
		const jobs = [radio(vn)];
		if (q) {
			const world = new URLSearchParams(base);
			world.set("name", q);
			jobs.push(radio(world));
		}
		const groups = await Promise.all(jobs);
		const seen = /* @__PURE__ */ new Set();
		const body = { stations: groups.flat().map((row) => toStation(row, save, q)).filter((station) => station.src.startsWith("http") && !blocked(station.src) && publicUrl(station.src)).filter((station) => seen.has(station.src) ? false : seen.add(station.src)).sort((a, b) => b.score - a.score).slice(0, 18).map(({ score: _score, ...station }) => station) };
		cache$2.set(key, {
			exp: Date.now() + 6e5,
			body
		});
		return Response.json(body, { headers: { "cache-control": "public, max-age=120" } });
	} catch {
		return Response.json({ error: "Không lấy được danh sách đài." }, { status: 502 });
	}
} } } });
var LEAGUES = [
	{
		slug: "eng.1",
		name: "Ngoại hạng Anh",
		short: "NHA",
		group: "Đỉnh cao châu Âu"
	},
	{
		slug: "esp.1",
		name: "La Liga",
		short: "La Liga",
		group: "Đỉnh cao châu Âu"
	},
	{
		slug: "ger.1",
		name: "Bundesliga",
		short: "Bundesliga",
		group: "Đỉnh cao châu Âu"
	},
	{
		slug: "ita.1",
		name: "Serie A",
		short: "Serie A",
		group: "Đỉnh cao châu Âu"
	},
	{
		slug: "fra.1",
		name: "Ligue 1",
		short: "Ligue 1",
		group: "Đỉnh cao châu Âu"
	},
	{
		slug: "uefa.champions",
		name: "UEFA Champions League",
		short: "C1",
		group: "Đỉnh cao châu Âu"
	},
	{
		slug: "uefa.europa",
		name: "UEFA Europa League",
		short: "C2",
		group: "Đỉnh cao châu Âu"
	},
	{
		slug: "uefa.europa.conf",
		name: "UEFA Conference League",
		short: "C3",
		group: "Đỉnh cao châu Âu"
	},
	{
		slug: "por.1",
		name: "Primeira Liga",
		short: "Bồ Đào Nha",
		group: "Châu Âu"
	},
	{
		slug: "ned.1",
		name: "Eredivisie",
		short: "Hà Lan",
		group: "Châu Âu"
	},
	{
		slug: "bel.1",
		name: "Pro League Bỉ",
		short: "Bỉ",
		group: "Châu Âu"
	},
	{
		slug: "sco.1",
		name: "Premiership Scotland",
		short: "Scotland",
		group: "Châu Âu"
	},
	{
		slug: "tur.1",
		name: "Süper Lig",
		short: "Thổ Nhĩ Kỳ",
		group: "Châu Âu"
	},
	{
		slug: "eng.2",
		name: "Championship Anh",
		short: "Hạng Nhì Anh",
		group: "Châu Âu"
	},
	{
		slug: "eng.fa",
		name: "FA Cup",
		short: "FA Cup",
		group: "Châu Âu"
	},
	{
		slug: "uefa.nations",
		name: "UEFA Nations League",
		short: "Nations",
		group: "Châu Âu"
	},
	{
		slug: "uefa.euro",
		name: "Euro",
		short: "Euro",
		group: "Châu Âu"
	},
	{
		slug: "gre.1",
		name: "Super League Hy Lạp",
		short: "Hy Lạp",
		group: "Châu Âu"
	},
	{
		slug: "aut.1",
		name: "Bundesliga Áo",
		short: "Áo",
		group: "Châu Âu"
	},
	{
		slug: "den.1",
		name: "Superliga Đan Mạch",
		short: "Đan Mạch",
		group: "Châu Âu"
	},
	{
		slug: "swe.1",
		name: "Allsvenskan",
		short: "Thụy Điển",
		group: "Châu Âu"
	},
	{
		slug: "nor.1",
		name: "Eliteserien",
		short: "Na Uy",
		group: "Châu Âu"
	},
	{
		slug: "rus.1",
		name: "Ngoại hạng Nga",
		short: "Nga",
		group: "Châu Âu"
	},
	{
		slug: "jpn.1",
		name: "J1 League",
		short: "J-League",
		group: "Châu Á"
	},
	{
		slug: "ksa.1",
		name: "Saudi Pro League",
		short: "Ả Rập Xê Út",
		group: "Châu Á"
	},
	{
		slug: "chn.1",
		name: "Chinese Super League",
		short: "Trung Quốc",
		group: "Châu Á"
	},
	{
		slug: "ind.1",
		name: "Indian Super League",
		short: "Ấn Độ",
		group: "Châu Á"
	},
	{
		slug: "aus.1",
		name: "A-League",
		short: "Úc",
		group: "Châu Á"
	},
	{
		slug: "afc.champions",
		name: "AFC Champions League Elite",
		short: "C1 châu Á",
		group: "Châu Á"
	},
	{
		slug: "afc.asian.cup",
		name: "Asian Cup",
		short: "Asian Cup",
		group: "Châu Á"
	},
	{
		slug: "aff.championship",
		name: "ASEAN Championship",
		short: "ASEAN",
		group: "Châu Á"
	},
	{
		slug: "fifa.worldq.afc",
		name: "Vòng loại World Cup — AFC",
		short: "VL World Cup Á",
		group: "Châu Á"
	},
	{
		slug: "usa.1",
		name: "MLS",
		short: "MLS",
		group: "Châu Mỹ"
	},
	{
		slug: "mex.1",
		name: "Liga MX",
		short: "Mexico",
		group: "Châu Mỹ"
	},
	{
		slug: "bra.1",
		name: "Brasileirão",
		short: "Brazil",
		group: "Châu Mỹ"
	},
	{
		slug: "arg.1",
		name: "Liga Profesional",
		short: "Argentina",
		group: "Châu Mỹ"
	},
	{
		slug: "conmebol.libertadores",
		name: "Copa Libertadores",
		short: "Libertadores",
		group: "Châu Mỹ"
	},
	{
		slug: "conmebol.sudamericana",
		name: "Copa Sudamericana",
		short: "Sudamericana",
		group: "Châu Mỹ"
	},
	{
		slug: "conmebol.america",
		name: "Copa América",
		short: "Copa América",
		group: "Châu Mỹ"
	},
	{
		slug: "rsa.1",
		name: "Premiership Nam Phi",
		short: "Nam Phi",
		group: "Châu Phi"
	},
	{
		slug: "caf.champions",
		name: "CAF Champions League",
		short: "C1 châu Phi",
		group: "Châu Phi"
	},
	{
		slug: "caf.nations",
		name: "CAN",
		short: "CAN",
		group: "Châu Phi"
	},
	{
		slug: "fifa.world",
		name: "World Cup",
		short: "World Cup",
		group: "Quốc tế"
	},
	{
		slug: "fifa.cwc",
		name: "FIFA Club World Cup",
		short: "Club WC",
		group: "Quốc tế"
	},
	{
		slug: "fifa.friendly",
		name: "Giao hữu quốc tế",
		short: "Giao hữu",
		group: "Quốc tế"
	},
	{
		slug: "fifa.worldq.uefa",
		name: "Vòng loại World Cup — UEFA",
		short: "VL WC Âu",
		group: "Quốc tế"
	},
	{
		slug: "fifa.worldq.conmebol",
		name: "Vòng loại World Cup — Nam Mỹ",
		short: "VL WC Nam Mỹ",
		group: "Quốc tế"
	},
	{
		slug: "fifa.worldq.concacaf",
		name: "Vòng loại World Cup — CONCACAF",
		short: "VL WC Bắc Mỹ",
		group: "Quốc tế"
	},
	{
		slug: "fifa.worldq.caf",
		name: "Vòng loại World Cup — CAF",
		short: "VL WC Phi",
		group: "Quốc tế"
	}
];
var WORLD_SLUGS = [
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
	"fifa.world"
];
var bySlug = new Map(LEAGUES.map((l) => [l.slug, l]));
function leagueBySlug(slug) {
	return bySlug.get(slug);
}
function isKnownLeague(slug) {
	return bySlug.has(slug);
}
var LEAGUE_GROUPS = [...new Set(LEAGUES.map((l) => l.group))];
var mem = /* @__PURE__ */ new Map();
function isDict(v) {
	return typeof v === "object" && v !== null && !Array.isArray(v);
}
function str(v, fallback = "") {
	if (typeof v === "string") return v;
	if (typeof v === "number" && Number.isFinite(v)) return String(v);
	return fallback;
}
function arr(v) {
	return Array.isArray(v) ? v : [];
}
async function espn(path) {
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), 9e3);
	try {
		const res = await fetch(`https://site.api.espn.com${path}`, {
			signal: ctrl.signal,
			headers: { accept: "application/json" }
		});
		if (!res.ok) throw new Error(`espn ${res.status}`);
		return await res.json();
	} finally {
		clearTimeout(timer);
	}
}
function cached(key, ttlMs, load) {
	const hit = mem.get(key);
	if (hit && hit.exp > Date.now()) return Promise.resolve(hit.data);
	return load().then((data) => {
		mem.set(key, {
			exp: Date.now() + ttlMs,
			data
		});
		return data;
	});
}
var STATUS_VI = {
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
	STATUS_ABANDONED: "Bỏ dở"
};
function statusOf(raw) {
	const status = isDict(raw) ? raw : {};
	const type = isDict(status.type) ? status.type : {};
	const name = str(type.name, "STATUS_SCHEDULED");
	const stateRaw = str(type.state, "pre");
	const state = stateRaw === "in" ? "in" : stateRaw === "post" ? "post" : "pre";
	const clock = str(status.displayClock);
	const label = STATUS_VI[name] ?? (state === "in" ? "Đang đá" : state === "post" ? "Kết thúc" : "Sắp đá");
	return {
		state,
		name,
		label: state === "in" && clock && clock !== "0'" ? clock : label,
		clock
	};
}
function sideOf(raw) {
	const c = isDict(raw) ? raw : {};
	const team = isDict(c.team) ? c.team : {};
	return {
		id: str(team.id),
		name: str(team.displayName, "—"),
		short: str(team.shortDisplayName, str(team.displayName, "—")),
		abbr: str(team.abbreviation),
		logo: logoOf(team),
		score: str(c.score, "0")
	};
}
function logoOf(team) {
	const direct = str(team.logo);
	if (direct) return direct;
	const logos = arr(team.logos).filter(isDict);
	return logos.length ? str(logos[0].href) : "";
}
function broadcastsOf(comp) {
	const names = /* @__PURE__ */ new Set();
	for (const item of [...arr(comp.broadcasts), ...arr(comp.geoBroadcasts)]) {
		if (!isDict(item)) continue;
		for (const n of arr(item.names)) {
			const s = str(n).trim();
			if (s) names.add(s);
		}
	}
	return [...names].slice(0, 4);
}
function watchUrlOf(event) {
	for (const link of arr(event.links)) {
		if (!isDict(link)) continue;
		const href = str(link.href);
		if (href.startsWith("http") && !href.includes("draftkings") && !href.includes("sportsbook")) return href;
	}
	return "";
}
function cardFromEvent(event, league) {
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
		watchUrl: watchUrlOf(event)
	};
}
function peopleOf(raw) {
	const names = [];
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
function kindOf(text, raw) {
	const lower = text.toLowerCase();
	if (/delay|kickoff|end regular|start 2nd|full time|end of/.test(lower)) return null;
	if (raw.scoringPlay === true || lower === "goal" || lower.includes("own goal")) {
		if (lower.includes("miss")) return {
			kind: "other",
			label: "Đá hỏng"
		};
		return {
			kind: "goal",
			label: raw.ownGoal === true || lower.includes("own goal") ? "Phản lưới" : lower.includes("penalty") ? "Phạt đền" : "Bàn thắng"
		};
	}
	if (raw.redCard === true || lower.includes("red card")) return {
		kind: "red",
		label: "Thẻ đỏ"
	};
	if (raw.yellowCard === true || lower.includes("yellow card")) return {
		kind: "yellow",
		label: "Thẻ vàng"
	};
	if (lower.includes("substitution")) return {
		kind: "sub",
		label: "Thay người"
	};
	if (lower.includes("halftime")) return {
		kind: "other",
		label: "Nghỉ giữa"
	};
	if (!text) return null;
	return {
		kind: "other",
		label: text
	};
}
function itemFrom(raw) {
	const mapped = kindOf(str((isDict(raw.type) ? raw.type : {}).text) || str(raw.text), raw);
	if (!mapped) return null;
	const clock = isDict(raw.clock) ? raw.clock : {};
	const team = isDict(raw.team) ? raw.team : {};
	return {
		minute: str(clock.displayValue),
		kind: mapped.kind,
		label: mapped.label,
		player: peopleOf(raw) || str(raw.shortText),
		teamId: str(team.id),
		score: ""
	};
}
function timelineFrom(rows) {
	const tagged = [];
	for (const raw of rows) {
		if (!isDict(raw)) continue;
		const item = itemFrom(raw);
		if (!item) continue;
		const clock = isDict(raw.clock) ? raw.clock : {};
		tagged.push({
			order: typeof clock.value === "number" ? clock.value : tagged.length,
			item
		});
	}
	tagged.sort((a, b) => a.order - b.order);
	return tagged.map((t) => t.item);
}
var STAT_VI = {
	possessionPct: "Kiểm soát bóng",
	shotsTotal: "Số cú sút",
	shotsOnTarget: "Sút trúng đích",
	cornerKicks: "Phạt góc",
	foulsCommitted: "Phạm lỗi",
	yellowCards: "Thẻ vàng",
	redCards: "Thẻ đỏ",
	saves: "Cản phá",
	offsides: "Việt vị",
	totalPasses: "Đường chuyền"
};
function numOf(display) {
	const n = Number.parseFloat(display.replace("%", "").replace(",", "."));
	return Number.isFinite(n) ? n : 0;
}
function statsOf(box, homeId, awayId) {
	if (!isDict(box)) return [];
	const teams = arr(box.teams).filter(isDict);
	const pick = (id) => teams.find((t) => isDict(t.team) && str(t.team.id) === id);
	const home = pick(homeId);
	const away = pick(awayId);
	if (!home || !away) return [];
	const map = (team) => {
		const out = /* @__PURE__ */ new Map();
		for (const s of arr(team.statistics)) {
			if (!isDict(s)) continue;
			out.set(str(s.name), str(s.displayValue));
		}
		return out;
	};
	const h = map(home);
	const a = map(away);
	const lines = [];
	for (const [key, label] of Object.entries(STAT_VI)) {
		if (!h.has(key) && !a.has(key)) continue;
		const hv = h.get(key) ?? "0";
		const av = a.get(key) ?? "0";
		lines.push({
			key,
			label,
			home: hv,
			away: av,
			homeNum: numOf(hv),
			awayNum: numOf(av)
		});
	}
	return lines;
}
function playersOf(rosterBlock) {
	if (!isDict(rosterBlock)) return {
		formation: "",
		players: []
	};
	const players = [];
	for (const raw of arr(rosterBlock.roster)) {
		if (!isDict(raw)) continue;
		const athlete = isDict(raw.athlete) ? raw.athlete : {};
		const pos = isDict(raw.position) ? raw.position : {};
		players.push({
			name: str(athlete.shortName) || str(athlete.displayName, "Cầu thủ"),
			jersey: str(raw.jersey),
			position: str(pos.abbreviation) || str(pos.displayName),
			starter: raw.starter === true,
			place: typeof raw.formationPlace === "number" ? raw.formationPlace : 99
		});
	}
	return {
		formation: str(rosterBlock.formation),
		players
	};
}
function formOf(block) {
	if (!isDict(block)) return [];
	const marks = [];
	for (const ev of arr(block.events)) {
		if (!isDict(ev)) continue;
		const g = str(ev.gameResult).toUpperCase();
		if (g === "W" || g === "D" || g === "L") marks.push(g);
	}
	return marks.slice(0, 5);
}
function clipsOf(videos) {
	const clips = [];
	for (const raw of arr(videos)) {
		if (!isDict(raw)) continue;
		const links = isDict(raw.links) ? raw.links : {};
		const source = isDict(links.source) ? links.source : {};
		const mobile = isDict(links.mobile) ? links.mobile : {};
		const mobileSource = isDict(mobile.source) ? mobile.source : {};
		const src = str((isDict(source.HD) ? source.HD : {}).href) || str(source.href) || str(mobileSource.href);
		if (!src.endsWith(".mp4") && !src.includes(".mp4")) continue;
		clips.push({
			title: str(raw.headline, "Clip"),
			thumb: str(raw.thumbnail),
			src
		});
	}
	return clips.slice(0, 4);
}
function notesOf(commentary) {
	const notes = [];
	for (const raw of arr(commentary)) {
		if (!isDict(raw)) continue;
		const text = str(raw.text).trim();
		if (!text) continue;
		const time = isDict(raw.time) ? str(raw.time.displayValue) : "";
		notes.push({
			minute: time,
			text
		});
	}
	return notes.slice(-18).reverse();
}
function detailSide(base, roster, form) {
	return {
		...base,
		formation: roster.formation,
		players: roster.players,
		form
	};
}
async function loadBoard(league, date) {
	const slugs = league === "world" ? WORLD_SLUGS : isKnownLeague(league) ? [league] : [];
	if (!slugs.length) return {
		matches: [],
		failed: []
	};
	const failed = [];
	const matches = (await Promise.all(slugs.map(async (slug) => {
		try {
			const data = await cached(`board:${slug}:${date}`, 2e4, () => espn(`/apis/site/v2/sports/soccer/${slug}/scoreboard?dates=${date}`));
			return (isDict(data) ? arr(data.events) : []).map((ev) => cardFromEvent(ev, slug)).filter((m) => !!m && !!m.id);
		} catch {
			failed.push(slug);
			return [];
		}
	}))).flat();
	matches.sort((a, b) => {
		const rank = (s) => s === "in" ? 0 : s === "pre" ? 1 : 2;
		const d = rank(a.state) - rank(b.state);
		if (d) return d;
		return a.kickoff.localeCompare(b.kickoff);
	});
	return {
		matches,
		failed
	};
}
async function loadMatch(league, id) {
	if (!isKnownLeague(league) || !/^\d{4,16}$/.test(id)) return null;
	const data = await cached(`match:${league}:${id}`, 15e3, () => espn(`/apis/site/v2/sports/soccer/${league}/summary?event=${id}`));
	if (!isDict(data)) return null;
	const header = isDict(data.header) ? data.header : {};
	const comp = arr(header.competitions).find(isDict);
	if (!comp) return null;
	const card = cardFromEvent({
		id,
		date: str(comp.date),
		competitions: [comp],
		status: comp.status,
		links: arr(header.links)
	}, league);
	if (!card) return null;
	const rosters = arr(data.rosters).filter(isDict);
	const homeRoster = rosters.find((r) => str(r.homeAway) === "home") ?? rosters[0];
	const awayRoster = rosters.find((r) => str(r.homeAway) === "away") ?? rosters[1];
	const forms = arr(data.lastFiveGames).filter(isDict);
	const formFor = (teamId) => {
		return formOf(forms.find((f) => isDict(f.team) && str(f.team.id) === teamId));
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
		notes: notesOf(data.commentary)
	};
}
function statNum(stats, name) {
	return stats.get(name) ?? "—";
}
async function loadStandings(league) {
	if (!isKnownLeague(league)) return [];
	const data = await cached(`table:${league}`, 12e4, () => espn(`/apis/v2/sports/soccer/${league}/standings`));
	if (!isDict(data)) return [];
	const children = arr(data.children).filter(isDict);
	const blocks = children.length ? children : [data];
	const groups = [];
	for (const block of blocks) {
		const standings = isDict(block.standings) ? block.standings : block;
		if (!isDict(standings)) continue;
		const rows = [];
		for (const entry of arr(standings.entries)) {
			if (!isDict(entry)) continue;
			const team = isDict(entry.team) ? entry.team : {};
			const stats = /* @__PURE__ */ new Map();
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
				pts: statNum(stats, "points")
			});
		}
		if (rows.length) groups.push({
			name: str(block.name) || str(standings.name) || "Bảng",
			rows
		});
	}
	return groups;
}
async function loadNews(league) {
	const slugs = league === "world" ? [
		"eng.1",
		"uefa.champions",
		"esp.1"
	] : isKnownLeague(league) ? [league] : ["eng.1"];
	const packs = await Promise.all(slugs.map(async (slug) => {
		try {
			const data = await cached(`news:${slug}`, 18e4, () => espn(`/apis/site/v2/sports/soccer/${slug}/news?limit=8`));
			return isDict(data) ? arr(data.articles) : [];
		} catch {
			return [];
		}
	}));
	const seen = /* @__PURE__ */ new Set();
	const articles = [];
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
			href: str(web.href)
		});
	}
	articles.sort((a, b) => b.published.localeCompare(a.published));
	return articles.slice(0, 18);
}
var Route$6 = createFileRoute("/api/board")({ server: { handlers: { GET: async ({ request }) => {
	const url = new URL(request.url);
	const league = url.searchParams.get("league") || "world";
	const date = url.searchParams.get("date") || "";
	if (!/^\d{8}$/.test(date)) return Response.json({ error: "Thiếu ngày." }, { status: 400 });
	try {
		const body = await loadBoard(league, date);
		return Response.json({
			...body,
			league,
			date,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, { headers: { "cache-control": "no-store" } });
	} catch {
		return Response.json({ error: "Không tải được tỉ số." }, { status: 502 });
	}
} } } });
var cache$1 = /* @__PURE__ */ new Map();
async function briefMatch(league, id) {
	const key = `${league}:${id}`;
	const hit = cache$1.get(key);
	if (hit && hit.exp > Date.now()) return {
		ok: true,
		text: hit.text
	};
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "Nhận định AI chưa bật trên môi trường này."
	};
	const match = await loadMatch(league, id);
	if (!match) return {
		ok: false,
		error: "Không lấy được dữ liệu trận."
	};
	const facts = [
		`${match.home.name} ${match.home.score}-${match.away.score} ${match.away.name}`,
		`Giải: ${match.leagueName}. Trạng thái: ${match.statusLabel}.`,
		match.venue ? `Sân: ${match.venue}.` : "",
		match.timeline.length ? `Sự kiện: ${match.timeline.slice(0, 12).map((e) => `${e.minute} ${e.label} ${e.player}`.trim()).join("; ")}` : "Chưa có sự kiện.",
		match.stats.length ? `Số liệu: ${match.stats.slice(0, 6).map((s) => `${s.label} ${s.home}-${s.away}`).join("; ")}` : ""
	].filter(Boolean).join("\n");
	const res = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "grok-4.5",
			max_tokens: 220,
			temperature: .3,
			messages: [{
				role: "system",
				content: "Bạn là biên tập viên bóng đá, viết tiếng Việt. Chỉ dùng số liệu được đưa. Không bịa tỉ số, cầu thủ hay phút. Bốn câu ngắn, không markdown, không lời chào."
			}, {
				role: "user",
				content: facts
			}]
		})
	});
	if (!res.ok) return {
		ok: false,
		error: "Không tạo được nhận định lúc này."
	};
	const text = (await res.json()).choices?.[0]?.message?.content?.trim() ?? "";
	if (!text) return {
		ok: false,
		error: "Nhận định trống."
	};
	cache$1.set(key, {
		exp: Date.now() + 18e5,
		text
	});
	return {
		ok: true,
		text
	};
}
var Route$5 = createFileRoute("/api/brief")({ server: { handlers: { POST: async ({ request }) => {
	let body;
	try {
		body = await request.json();
	} catch {
		return Response.json({
			ok: false,
			error: "Yêu cầu không hợp lệ."
		}, { status: 400 });
	}
	const league = typeof body === "object" && body && "league" in body ? String(body.league) : "";
	const id = typeof body === "object" && body && "id" in body ? String(body.id) : "";
	if (!/^[a-z0-9._-]{2,40}$/.test(league) || !/^\d{4,16}$/.test(id)) return Response.json({
		ok: false,
		error: "Thiếu trận."
	}, { status: 400 });
	try {
		const result = await briefMatch(league, id);
		return Response.json(result, { status: result.ok ? 200 : 502 });
	} catch {
		return Response.json({
			ok: false,
			error: "Nhận định lỗi."
		}, { status: 502 });
	}
} } } });
var Route$4 = createFileRoute("/api/match")({ server: { handlers: { GET: async ({ request }) => {
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
} } } });
var Route$3 = createFileRoute("/api/news")({ server: { handlers: { GET: async ({ request }) => {
	const league = new URL(request.url).searchParams.get("league") || "world";
	try {
		const articles = await loadNews(league);
		return Response.json({ articles }, { headers: { "cache-control": "public, max-age=60" } });
	} catch {
		return Response.json({ error: "Không tải được tin." }, { status: 502 });
	}
} } } });
var Route$2 = createFileRoute("/api/standings")({ server: { handlers: { GET: async ({ request }) => {
	const league = new URL(request.url).searchParams.get("league") || "eng.1";
	try {
		const groups = await loadStandings(league);
		return Response.json({ groups }, { headers: { "cache-control": "public, max-age=60" } });
	} catch {
		return Response.json({ error: "Không tải được bảng xếp hạng." }, { status: 502 });
	}
} } } });
var BASE = "https://data-api.binance.vision";
var tickCache = null;
var sparkCache = null;
async function getJson(path) {
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), 6e3);
	try {
		const res = await fetch(`${BASE}${path}`, {
			signal: ctrl.signal,
			headers: { accept: "application/json" }
		});
		if (!res.ok) throw new Error(`binance ${res.status}`);
		return await res.json();
	} finally {
		clearTimeout(timer);
	}
}
async function sparkline() {
	if (sparkCache && sparkCache.exp > Date.now()) return sparkCache.spark;
	const raw = await getJson("/api/v3/klines?symbol=TRUMPUSDT&interval=1m&limit=48");
	const spark = Array.isArray(raw) ? raw.map((row) => Array.isArray(row) ? Number(row[4]) : NaN).filter((n) => Number.isFinite(n)) : [];
	sparkCache = {
		exp: Date.now() + 3e4,
		spark
	};
	return spark;
}
async function loadTrump() {
	if (tickCache && tickCache.exp > Date.now()) return tickCache.data;
	const [ticker, spark] = await Promise.all([getJson("/api/v3/ticker/24hr?symbol=TRUMPUSDT"), sparkline().catch(() => sparkCache?.spark ?? [])]);
	if (typeof ticker !== "object" || ticker === null) throw new Error("ticker");
	const t = ticker;
	const num = (k) => {
		const n = Number(t[k]);
		return Number.isFinite(n) ? n : 0;
	};
	const data = {
		price: num("lastPrice"),
		change: num("priceChange"),
		changePct: num("priceChangePercent"),
		high: num("highPrice"),
		low: num("lowPrice"),
		volume: num("volume"),
		quoteVolume: num("quoteVolume"),
		spark,
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	tickCache = {
		exp: Date.now() + 1500,
		data
	};
	return data;
}
var Route$1 = createFileRoute("/api/trump")({ server: { handlers: { GET: async () => {
	try {
		const tick = await loadTrump();
		return Response.json(tick, { headers: { "cache-control": "no-store" } });
	} catch {
		return Response.json({ error: "Không lấy được giá Binance." }, { status: 502 });
	}
} } } });
/** National VTV channels the public VTVgo catalog marks as free (mustLogin: false). */
var VTV_CHANNELS = [
	{
		id: "1",
		name: "VTV1"
	},
	{
		id: "2",
		name: "VTV2"
	},
	{
		id: "3",
		name: "VTV3"
	},
	{
		id: "4",
		name: "VTV4"
	},
	{
		id: "5",
		name: "VTV5"
	},
	{
		id: "7",
		name: "VTV5 Tây Nam Bộ"
	},
	{
		id: "163",
		name: "VTV5 Tây Nguyên"
	},
	{
		id: "13",
		name: "VTV6"
	},
	{
		id: "27",
		name: "VTV7"
	},
	{
		id: "36",
		name: "VTV8"
	},
	{
		id: "39",
		name: "VTV9"
	},
	{
		id: "6",
		name: "VTV10"
	},
	{
		id: "vietnamtoday",
		name: "Vietnam Today"
	}
];
var VTV_IDS = new Set(VTV_CHANNELS.map((channel) => channel.id));
var PLAYBACK = "https://api.vtvdigital.org/live-channel/v21.0/playback/source";
var cache = /* @__PURE__ */ new Map();
function allowedHost(src) {
	try {
		const host = new URL(src).hostname;
		return host.endsWith(".vtvdigital.vn") || host.endsWith(".vtv.vn") || host === "vtv-live-push-token.akamaized.net";
	} catch {
		return false;
	}
}
function lowestKbps(text) {
	const values = [...text.matchAll(/BANDWIDTH=(\d+)/g)].map((match) => Number(match[1]));
	if (!values.length) return 0;
	return Math.round(Math.min(...values) / 1e3);
}
async function fresh(id) {
	const res = await fetch(PLAYBACK, {
		method: "POST",
		headers: {
			accept: "application/json",
			"content-type": "application/json",
			origin: "https://vtvgo.vn",
			referer: "https://vtvgo.vn/",
			"user-agent": "San24/1.0"
		},
		body: JSON.stringify({
			id,
			platform: "webPC"
		}),
		signal: AbortSignal.timeout(8e3)
	});
	if (!res.ok) throw new Error("vtv");
	const source = (await res.json()).data?.sourceModes?.[0]?.multiSource?.[0];
	const src = source?.sources?.[0]?.url || "";
	if (source?.drmTypeID && source.drmTypeID !== "none") throw new Error("drm");
	if (!src.startsWith("https://") || !allowedHost(src)) throw new Error("host");
	let kbps = 0;
	try {
		const playlist = await fetch(src, {
			headers: { "user-agent": "San24/1.0" },
			signal: AbortSignal.timeout(8e3)
		});
		if (playlist.ok) kbps = lowestKbps(await playlist.text());
	} catch {
		kbps = 0;
	}
	return {
		src,
		kbps: kbps || 1500,
		heavy: (kbps || 1500) > 700
	};
}
var Route = createFileRoute("/api/vtv")({ server: { handlers: { GET: async ({ request }) => {
	const id = new URL(request.url).searchParams.get("id") || "";
	if (!VTV_IDS.has(id)) return Response.json({ error: "Kênh VTV không có trong danh sách quốc gia." }, { status: 400 });
	const hit = cache.get(id);
	if (hit && hit.exp > Date.now()) return Response.json(hit.body);
	try {
		const body = await fresh(id);
		cache.set(id, {
			exp: Date.now() + 9e4,
			body
		});
		return Response.json(body);
	} catch {
		return Response.json({ error: "VTVgo không trả sóng kênh này lúc này." }, { status: 502 });
	}
} } } });
var rootRouteChildren = {
	IndexRoute: Route$8.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$9
	}),
	ApiAirRoute: Route$7.update({
		id: "/api/air",
		path: "/api/air",
		getParentRoute: () => Route$9
	}),
	ApiBoardRoute: Route$6.update({
		id: "/api/board",
		path: "/api/board",
		getParentRoute: () => Route$9
	}),
	ApiBriefRoute: Route$5.update({
		id: "/api/brief",
		path: "/api/brief",
		getParentRoute: () => Route$9
	}),
	ApiMatchRoute: Route$4.update({
		id: "/api/match",
		path: "/api/match",
		getParentRoute: () => Route$9
	}),
	ApiNewsRoute: Route$3.update({
		id: "/api/news",
		path: "/api/news",
		getParentRoute: () => Route$9
	}),
	ApiStandingsRoute: Route$2.update({
		id: "/api/standings",
		path: "/api/standings",
		getParentRoute: () => Route$9
	}),
	ApiTrumpRoute: Route$1.update({
		id: "/api/trump",
		path: "/api/trump",
		getParentRoute: () => Route$9
	}),
	ApiVtvRoute: Route.update({
		id: "/api/vtv",
		path: "/api/vtv",
		getParentRoute: () => Route$9
	})
};
var routeTree = Route$9._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		rewrite: previewPathRewrite(),
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { leagueBySlug as a, LEAGUE_GROUPS as i, VTV_CHANNELS as n, previewPathPrefix as o, LEAGUES as r, router_exports as t };
