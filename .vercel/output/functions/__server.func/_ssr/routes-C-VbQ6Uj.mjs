import { i as __toESM } from "../_runtime.mjs";
import { d as require_react_dom, q as require_react, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Star, c as Play, d as ChevronLeft, f as Activity, i as Table2, l as Pause, n as Trophy, o as Search, s as Radio, t as X, u as Newspaper } from "../_libs/lucide-react.mjs";
import { a as leagueBySlug, i as LEAGUE_GROUPS, n as VTV_CHANNELS, o as previewPathPrefix, r as LEAGUES } from "./router-CyGCp9XL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-C-VbQ6Uj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_react_dom = require_react_dom();
function apiUrl(path) {
	if (typeof window === "undefined") return path;
	return `${previewPathPrefix(window.location.hostname, window.location.pathname) ?? ""}${path}`;
}
var KEY = "san24-trump-pos";
function money(n) {
	if (!Number.isFinite(n)) return "—";
	return n.toLocaleString("en-US", {
		minimumFractionDigits: 3,
		maximumFractionDigits: 4
	});
}
function compact(n) {
	if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
	if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
	return n.toFixed(0);
}
function Spark({ values, up }) {
	if (values.length < 2) return null;
	const min = Math.min(...values);
	const span = Math.max(...values) - min || 1;
	const w = 120;
	const h = 36;
	const d = values.map((v, i) => {
		const x = i / (values.length - 1) * w;
		const y = h - (v - min) / span * 34 - 1;
		return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
	}).join(" ");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: `0 0 ${w} ${h}`,
		className: "mt-2 h-9 w-full",
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d,
			fill: "none",
			stroke: up ? "var(--color-up)" : "var(--color-live)",
			strokeWidth: "1.6"
		})
	});
}
function TrumpSticker() {
	const [tick, setTick] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [flash, setFlash] = (0, import_react.useState)(null);
	const [pos, setPos] = (0, import_react.useState)(null);
	const prev = (0, import_react.useRef)(null);
	const drag = (0, import_react.useRef)(null);
	const posRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		try {
			const raw = localStorage.getItem(KEY);
			if (raw) setPos(JSON.parse(raw));
		} catch {}
	}, []);
	(0, import_react.useEffect)(() => {
		let stop = false;
		const pull = async () => {
			try {
				const res = await fetch(apiUrl("/api/trump"));
				if (!res.ok) throw new Error("bad");
				const data = await res.json();
				if (stop) return;
				if (prev.current !== null && data.price !== prev.current) {
					setFlash(data.price > prev.current ? "up" : "down");
					window.setTimeout(() => setFlash(null), 700);
				}
				prev.current = data.price;
				setTick(data);
				setError("");
			} catch {
				if (!stop) setError("Mất giá");
			}
		};
		pull();
		const id = window.setInterval(() => void pull(), 2e3);
		return () => {
			stop = true;
			window.clearInterval(id);
		};
	}, []);
	const up = (tick?.change ?? 0) >= 0;
	const place = pos;
	const suppressClick = (0, import_react.useRef)(false);
	const onPointerDown = (e) => {
		const el = e.currentTarget;
		el.setPointerCapture(e.pointerId);
		const rect = el.getBoundingClientRect();
		const origin = place ?? {
			x: rect.left,
			y: rect.top
		};
		drag.current = {
			dx: e.clientX - origin.x,
			dy: e.clientY - origin.y,
			ox: origin.x,
			oy: origin.y,
			moved: false
		};
	};
	const onPointerMove = (e) => {
		if (!drag.current) return;
		const x = Math.max(8, Math.min(window.innerWidth - 92, e.clientX - drag.current.dx));
		const y = Math.max(8, Math.min(window.innerHeight - 92, e.clientY - drag.current.dy));
		if (Math.abs(x - drag.current.ox) + Math.abs(y - drag.current.oy) > 6) drag.current.moved = true;
		const next = {
			x,
			y
		};
		posRef.current = next;
		setPos(next);
	};
	const onPointerUp = () => {
		const moved = drag.current?.moved ?? false;
		drag.current = null;
		if (moved && posRef.current) {
			suppressClick.current = true;
			localStorage.setItem(KEY, JSON.stringify(posRef.current));
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed z-50 touch-none",
		style: place ? {
			left: place.x,
			top: place.y
		} : {
			right: 12,
			bottom: 96
		},
		onPointerDown,
		onPointerMove,
		onPointerUp,
		onClick: () => {
			if (suppressClick.current) {
				suppressClick.current = false;
				return;
			}
			setOpen((v) => !v);
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			"aria-label": "Giá TRUMP USDT trên Binance",
			className: "w-20 rounded-full border border-gold bg-surface px-1 py-3 text-center shadow-lg " + (flash === "up" ? "ring-2 ring-up" : flash === "down" ? "ring-2 ring-live" : ""),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display block text-xs tracking-widest text-gold",
					children: "TRUMP"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display block text-lg leading-none text-fg",
					children: tick ? money(tick.price) : "…"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-xs font-semibold " + (up ? "text-up" : "text-live"),
					children: tick ? `${up ? "+" : ""}${tick.changePct.toFixed(2)}%` : error || "USDT"
				})
			]
		}), open && tick ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-2 w-44 rounded-2xl border border-line bg-surface p-3 text-left shadow-xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-sm tracking-wide text-gold-soft",
					children: "TRUMP / USDT"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: "Binance · 24 giờ"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spark, {
					values: tick.spark,
					up
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-muted",
							children: "Cao"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "text-right text-fg",
							children: money(tick.high)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-muted",
							children: "Thấp"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "text-right text-fg",
							children: money(tick.low)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-muted",
							children: "Khối"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "text-right text-fg",
							children: compact(tick.quoteVolume)
						})
					]
				})
			]
		}) : null]
	});
}
/** Official public streams only. Nominal kbps is the published ladder, used for the data budget. */
var AIR_CHANNELS = [
	{
		id: "vov1",
		name: "VOV1",
		group: "VOV",
		src: "https://str.vov.gov.vn/vovlive/vov1vov5Vietnamese.sdp_aac/playlist.m3u8",
		kind: "hls",
		kbps: 256,
		picture: false
	},
	{
		id: "vov2",
		name: "VOV2",
		group: "VOV",
		src: "https://str.vov.gov.vn/vovlive/vov2.sdp_aac/playlist.m3u8",
		kind: "hls",
		kbps: 256,
		picture: false
	},
	{
		id: "vov3",
		name: "VOV3",
		group: "VOV",
		src: "https://str.vov.gov.vn/vovlive/vov3.sdp_aac/playlist.m3u8",
		kind: "hls",
		kbps: 256,
		picture: false
	},
	{
		id: "vov5",
		name: "VOV5 đối ngoại",
		group: "VOV",
		src: "https://str.vov.gov.vn/vovlive/vov5.sdp_aac/playlist.m3u8",
		kind: "hls",
		kbps: 256,
		picture: false
	},
	{
		id: "vov-gthn",
		name: "VOV Giao thông Hà Nội",
		group: "VOV",
		src: "https://play.vovgiaothong.vn/live/gthn/playlist.m3u8",
		kind: "hls",
		kbps: 231,
		picture: false
	},
	{
		id: "vov-gthcm",
		name: "VOV Giao thông TP.HCM",
		group: "VOV",
		src: "https://play.vovgiaothong.vn/live/gthcm/playlist.m3u8",
		kind: "hls",
		kbps: 231,
		picture: false
	},
	{
		id: "rfi",
		name: "RFI Tiếng Việt",
		group: "Toàn cầu",
		src: "https://rfienvietnamien64k.ice.infomaniak.ch/rfienvietnamien-64.mp3",
		kind: "audio",
		kbps: 64,
		picture: false
	},
	{
		id: "rva",
		name: "RVA Tiếng Việt",
		group: "Toàn cầu",
		src: "https://livestream.rvasia.org:8443/Vietnamese.mp3",
		kind: "audio",
		kbps: 64,
		picture: false
	},
	{
		id: "th-cantho",
		name: "TH Cần Thơ",
		group: "Hình",
		src: "https://live.canthotv.vn/live/tv/playlist.m3u8",
		kind: "hls",
		kbps: 3390,
		picture: true
	}
];
function mbPerHour(kbps) {
	if (!kbps) return 0;
	return kbps * 3600 / 8 / 1e3;
}
var chain = null;
var bound = null;
function build(el) {
	const ctx = new AudioContext();
	const source = ctx.createMediaElementSource(el);
	const shelves = [
		{
			type: "highpass",
			f: 70,
			g: 0
		},
		{
			type: "lowshelf",
			f: 140,
			g: 3.2
		},
		{
			type: "peaking",
			f: 280,
			g: 1.4,
			q: .8
		},
		{
			type: "peaking",
			f: 2500,
			g: 2.6,
			q: .9
		},
		{
			type: "peaking",
			f: 6800,
			g: -2.2,
			q: 1.1
		},
		{
			type: "highshelf",
			f: 10500,
			g: 1
		}
	].map((spec) => {
		const node = ctx.createBiquadFilter();
		node.type = spec.type;
		node.frequency.value = spec.f;
		node.gain.value = spec.g;
		if (spec.q) node.Q.value = spec.q;
		return {
			node,
			on: spec.g
		};
	});
	const comp = ctx.createDynamicsCompressor();
	comp.threshold.value = -20;
	comp.knee.value = 12;
	comp.ratio.value = 3.2;
	comp.attack.value = .01;
	comp.release.value = .24;
	const makeup = ctx.createGain();
	makeup.gain.value = 1.2;
	const limit = ctx.createDynamicsCompressor();
	limit.threshold.value = -1.5;
	limit.knee.value = 0;
	limit.ratio.value = 20;
	limit.attack.value = .003;
	limit.release.value = .08;
	let head = source;
	for (const shelf of shelves) {
		head.connect(shelf.node);
		head = shelf.node;
	}
	head.connect(comp).connect(makeup).connect(limit).connect(ctx.destination);
	return {
		ctx,
		makeup,
		shelves,
		comp,
		limit
	};
}
async function engageTone(el, on) {
	if (bound !== el) {
		chain = build(el);
		bound = el;
	}
	if (!chain) return;
	if (chain.ctx.state === "suspended") await chain.ctx.resume();
	chain.makeup.gain.value = on ? 1.2 : 1;
	for (const shelf of chain.shelves) {
		if (shelf.node.type === "highpass") continue;
		shelf.node.gain.value = on ? shelf.on : 0;
	}
	chain.comp.ratio.value = on ? 3.2 : 1;
	chain.comp.threshold.value = on ? -20 : 0;
	chain.limit.ratio.value = on ? 20 : 1;
	chain.limit.threshold.value = on ? -1.5 : 0;
}
var SAVE_KEY = "san24-air-save";
var TONE_KEY = "san24-air-tone";
var HEAVY_KBPS = 700;
function formatKb(usedBytes) {
	if (usedBytes < 1048576) return `${Math.max(1, Math.round(usedBytes / 1024))} KB`;
	return `${(usedBytes / 1048576).toFixed(1)} MB`;
}
function pickLevel(levels, save) {
	const cap = (save ? 450 : 1200) * 1e3;
	let under = -1;
	let underBr = -1;
	let lowest = 0;
	let lowestBr = Number.POSITIVE_INFINITY;
	levels.forEach((level, index) => {
		const br = level.bitrate || 0;
		if (br && br < lowestBr) {
			lowestBr = br;
			lowest = index;
		}
		if (br && br <= cap && br > underBr) {
			underBr = br;
			under = index;
		}
	});
	return under >= 0 ? under : lowest;
}
function AirDeck() {
	const rawRef = (0, import_react.useRef)(null);
	const toneRef = (0, import_react.useRef)(null);
	const activeRef = (0, import_react.useRef)(null);
	const hlsRef = (0, import_react.useRef)(null);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [save, setSave] = (0, import_react.useState)(true);
	const [tone, setTone] = (0, import_react.useState)(true);
	const [query, setQuery] = (0, import_react.useState)("");
	const [current, setCurrent] = (0, import_react.useState)(null);
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(null);
	const [used, setUsed] = (0, import_react.useState)(0);
	const [extras, setExtras] = (0, import_react.useState)([]);
	const [levelKbps, setLevelKbps] = (0, import_react.useState)(0);
	const [mounted, setMounted] = (0, import_react.useState)(false);
	const [processed, setProcessed] = (0, import_react.useState)(false);
	const [vtvBusy, setVtvBusy] = (0, import_react.useState)("");
	const rateRef = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		setMounted(true);
		if (localStorage.getItem(SAVE_KEY) === "0") setSave(false);
		if (localStorage.getItem(TONE_KEY) === "0") setTone(false);
		if (navigator.connection?.saveData) setSave(true);
	}, []);
	(0, import_react.useEffect)(() => {
		localStorage.setItem(SAVE_KEY, save ? "1" : "0");
	}, [save]);
	(0, import_react.useEffect)(() => {
		localStorage.setItem(TONE_KEY, tone ? "1" : "0");
	}, [tone]);
	(0, import_react.useEffect)(() => {
		let stop = false;
		const timer = window.setTimeout(() => {
			const q = query.trim();
			(async () => {
				try {
					const params = new URLSearchParams({ save: save ? "1" : "0" });
					if (q) {
						params.set("q", q);
						params.set("world", "1");
					}
					const res = await fetch(apiUrl(`/api/air?${params}`));
					if (!res.ok) return;
					const body = await res.json();
					if (!stop && body.stations) setExtras(body.stations.slice(0, 18));
				} catch {}
			})();
		}, query.trim() ? 320 : 0);
		return () => {
			stop = true;
			window.clearTimeout(timer);
		};
	}, [query, save]);
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => {
			const video = activeRef.current;
			if (!video || video.paused || !rateRef.current) return;
			setUsed((n) => n + rateRef.current / 8);
		}, 1e3);
		return () => window.clearInterval(id);
	}, []);
	(0, import_react.useEffect)(() => {
		const onHide = () => {
			const video = activeRef.current;
			if (document.hidden && video && !video.paused) video.pause();
		};
		document.addEventListener("visibilitychange", onHide);
		return () => document.removeEventListener("visibilitychange", onHide);
	}, []);
	(0, import_react.useEffect)(() => {
		return () => {
			hlsRef.current?.destroy();
		};
	}, []);
	const stopMedia = () => {
		hlsRef.current?.destroy();
		hlsRef.current = null;
		for (const video of [rawRef.current, toneRef.current]) {
			if (!video) continue;
			video.pause();
			video.removeAttribute("src");
			video.load();
		}
		activeRef.current = null;
		setPlaying(false);
		setProcessed(false);
		rateRef.current = 0;
	};
	const attach = async (channel, force = false) => {
		stopMedia();
		setError("");
		setNote("");
		setCurrent(channel);
		setLevelKbps(channel.kbps);
		rateRef.current = channel.kbps * 1e3;
		let src = channel.src;
		let cors = false;
		let kbps = channel.kbps;
		const hlsLike = channel.kind === "hls" || src.includes(".m3u8");
		try {
			const res = await fetch(apiUrl(`/api/air?probe=${encodeURIComponent(src)}&save=${save ? "1" : "0"}`));
			if (res.ok) {
				const probed = await res.json();
				if (probed.src) src = probed.src;
				if (probed.kbps) kbps = probed.kbps;
				cors = Boolean(probed.cors);
				if (kbps) {
					setLevelKbps(kbps);
					rateRef.current = kbps * 1e3;
				}
				if (save && probed.heavy && (channel.picture || kbps > HEAVY_KBPS) && !force) {
					setPending({
						...channel,
						src,
						kbps
					});
					setOpen(true);
					return;
				}
			}
		} catch {}
		const useTone = tone && cors;
		const video = (useTone ? toneRef.current : rawRef.current) || rawRef.current;
		if (!video) return;
		activeRef.current = video;
		setProcessed(useTone);
		if (!useTone && tone) setNote("Đài không mở xử lý âm. Đang phát thẳng.");
		const start = () => {
			video.play().then(async () => {
				setPlaying(true);
				if (useTone) await engageTone(video, true);
				if ("mediaSession" in navigator) navigator.mediaSession.metadata = new MediaMetadata({
					title: channel.name,
					artist: "SÂN 24"
				});
			}).catch(() => setError("Trình duyệt chặn phát. Chạm nút phát trên khung sóng."));
		};
		if (!hlsLike) {
			video.src = src;
			video.onloadeddata = start;
			return;
		}
		const { default: HlsLib } = await import("../_libs/hls.js.mjs").then((n) => n.t);
		if (HlsLib.isSupported()) {
			const hls = new HlsLib({
				capLevelToPlayerSize: true,
				startLevel: 0,
				maxBufferLength: save ? 6 : 16,
				maxMaxBufferLength: save ? 10 : 28,
				backBufferLength: 0,
				maxBufferSize: save ? 6e6 : 2e7
			});
			hlsRef.current = hls;
			hls.loadSource(src);
			hls.attachMedia(video);
			hls.on(HlsLib.Events.MANIFEST_PARSED, (_, data) => {
				const index = pickLevel(data.levels, save);
				hls.currentLevel = index;
				const next = Math.round((data.levels[index]?.bitrate || kbps * 1e3) / 1e3);
				if (next) {
					setLevelKbps(next);
					rateRef.current = next * 1e3;
				}
				start();
			});
			hls.on(HlsLib.Events.ERROR, (_, data) => {
				if (!data.fatal) return;
				if (data.type === HlsLib.ErrorTypes.NETWORK_ERROR) hls.startLoad();
				else {
					setError("Mất sóng. Thử đài khác.");
					stopMedia();
				}
			});
			return;
		}
		if (video.canPlayType("application/vnd.apple.mpegurl")) {
			video.src = src;
			video.onloadeddata = start;
			return;
		}
		setError("Máy này không phát được HLS.");
	};
	const choose = (channel, force = false) => {
		if (save && channel.picture && channel.kbps > HEAVY_KBPS && !force) {
			setPending(channel);
			setOpen(true);
			return;
		}
		setPending(null);
		attach(channel, force);
	};
	const openVtv = async (id, name) => {
		setVtvBusy(id);
		setError("");
		try {
			const res = await fetch(apiUrl(`/api/vtv?id=${encodeURIComponent(id)}`));
			const body = await res.json();
			if (!res.ok || !body.src) {
				setError(body.error || "Không lấy được sóng VTV.");
				return;
			}
			choose({
				id: `vtv-${id}`,
				name,
				group: "Hình",
				src: body.src,
				kind: "hls",
				kbps: body.kbps || 1500,
				picture: true
			});
		} catch {
			setError("Không nối được VTVgo.");
		} finally {
			setVtvBusy("");
		}
	};
	const toggle = () => {
		const video = activeRef.current;
		if (!video || !current) {
			setOpen(true);
			return;
		}
		if (video.paused) video.play().then(() => setPlaying(true));
		else {
			video.pause();
			setPlaying(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick: () => setOpen(true),
		className: "grid size-11 shrink-0 place-items-center rounded-full border border-line bg-surface",
		"aria-label": "Mở sóng VOV và truyền hình",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-4 " + (playing ? "text-gold" : "text-muted") })
	}), mounted ? (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed bottom-24 left-3 z-40 flex items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative h-16 w-28 overflow-hidden rounded-xl border border-gold bg-surface shadow-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
					ref: rawRef,
					playsInline: true,
					className: "h-full w-full object-cover " + (processed ? "hidden" : "")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
					ref: toneRef,
					playsInline: true,
					crossOrigin: "anonymous",
					className: "h-full w-full object-cover " + (processed ? "" : "hidden")
				}),
				!current?.picture ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "pointer-events-none absolute inset-0 grid place-items-center bg-bg/80 font-display text-sm tracking-widest text-gold",
					children: current ? current.name.slice(0, 8) : "SÓNG"
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: toggle,
					className: "absolute bottom-1 right-1 grid size-8 place-items-center rounded-full bg-bg/80 text-gold",
					"aria-label": playing ? "Tạm dừng sóng" : "Phát sóng",
					children: playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3" })
				})
			]
		}), current ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-36",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "truncate text-xs font-semibold text-fg",
				children: current.name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted",
				children: [
					levelKbps ? `${levelKbps} kb/s` : "đang nối",
					" · ",
					formatKb(used),
					processed ? " · ấm" : ""
				]
			})]
		}) : null]
	}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-40 overflow-y-auto bg-bg px-4 pb-28 pt-[max(1rem,env(safe-area-inset-top))]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto w-full max-w-5xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-3xl text-gold",
						children: "Sóng"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setOpen(false),
						className: "h-11 px-3 text-sm font-semibold text-gold-soft",
						children: "Đóng"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Dò luồng công khai, khóa mức thấp trước khi phát. Khung góc dưới vẫn chạy khi bạn xem tỉ số."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: query,
					onChange: (e) => setQuery(e.target.value),
					placeholder: "Tìm đài, HLS, nước",
					className: "mt-3 h-11 w-full rounded-2xl border border-line bg-surface px-3 text-sm outline-none"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-3 flex h-11 items-center justify-between rounded-2xl border border-line bg-surface px-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tiết kiệm 4G — mức thấp, bộ đệm ngắn" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: save,
						onChange: (e) => setSave(e.target.checked),
						className: "size-5 accent-gold"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-2 flex h-11 items-center justify-between rounded-2xl border border-line bg-surface px-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Nghe ấm +20% — nén, lời rõ, trần đỉnh" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: tone,
						onChange: (e) => setTone(e.target.checked),
						className: "size-5 accent-gold"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-muted",
					children: "Hồ sơ nghe trên máy: trầm vừa, tiếng lời nổi, nén rồi nâng 20%. Đài không cho đọc sóng thì phát thẳng."
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-gold-soft",
					children: error
				}) : null,
				note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: note
				}) : null,
				pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 rounded-2xl border border-gold bg-surface p-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						pending.name,
						" khoảng ",
						mbPerHour(pending.kbps).toFixed(0),
						" MB/giờ. Chế độ tiết kiệm không tự phát mức này."
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => choose(pending, true),
						className: "mt-2 h-11 rounded-full bg-gold px-4 font-semibold text-bg",
						children: "Vẫn phát"
					})]
				}) : null,
				[
					"VOV",
					"Toàn cầu",
					"Hình"
				].map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-sm tracking-widest text-muted",
						children: group === "Hình" ? "Truyền hình công cộng" : group
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 grid grid-cols-2 gap-2",
						children: AIR_CHANNELS.filter((c) => c.group === group).map((channel) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => choose(channel),
							className: "h-14 rounded-2xl border px-3 text-left text-sm font-semibold " + (current?.id === channel.id ? "border-gold bg-raise text-gold-soft" : "border-line bg-surface text-fg"),
							children: [channel.name, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mt-0.5 block text-xs font-normal text-muted",
								children: [
									channel.picture ? "có hình" : "tiếng",
									" · ",
									channel.kbps,
									" kb/s · ~",
									mbPerHour(channel.kbps).toFixed(0),
									" MB/giờ"
								]
							})]
						}, channel.id))
					})]
				}, group)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-sm tracking-widest text-muted",
						children: "VTV quốc gia"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 grid grid-cols-2 gap-2",
						children: VTV_CHANNELS.map((channel) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: vtvBusy === channel.id,
							onClick: () => void openVtv(channel.id, channel.name),
							className: "h-12 rounded-2xl border px-3 text-left text-sm font-semibold " + (current?.id === `vtv-${channel.id}` ? "border-gold bg-raise text-gold-soft" : "border-line bg-surface text-fg"),
							children: vtvBusy === channel.id ? "Đang lấy sóng…" : channel.name
						}, channel.id))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-sm tracking-widest text-muted",
						children: query.trim() ? "Kết quả dò toàn cầu" : "Đài khác trong nước"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 grid gap-2",
						children: extras.map((station) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => choose({
								id: station.src,
								name: station.name,
								group: "VOV",
								src: station.src,
								kind: station.hls || station.src.includes(".m3u8") ? "hls" : "audio",
								kbps: station.kbps || (save ? 64 : 128),
								picture: false
							}),
							className: "flex h-12 items-center justify-between rounded-2xl border border-line bg-surface px-3 text-left text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "truncate font-semibold",
								children: [station.name, station.country ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-2 font-normal text-muted",
									children: station.country
								}) : null]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "shrink-0 text-xs text-muted",
								children: [station.hls ? "HLS · " : "", station.kbps ? `${station.kbps} kb/s` : station.codec || "đài"]
							})]
						}, station.src))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-muted",
					children: "VTV lấy từ VTVgo, sóng rõ, không khóa DRM. Link có hạn vài giờ nên mỗi lần bấm là xin lại. VTVcab trả phí không có ở đây."
				})
			]
		})
	}) : null] }), document.body) : null] });
}
var PREF_KEY = "san24-prefs";
var VN_LEAGUES = /* @__PURE__ */ new Set([
	"aff.championship",
	"afc.champions",
	"afc.asian.cup",
	"fifa.worldq.afc",
	"fifa.friendly"
]);
function vnKey(offset) {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Ho_Chi_Minh",
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).format(/* @__PURE__ */ new Date()).split("-").map(Number);
	const dt = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + offset));
	const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
	const dd = String(dt.getUTCDate()).padStart(2, "0");
	return `${dt.getUTCFullYear()}${mm}${dd}`;
}
function dayLabel(key) {
	const dt = new Date(Date.UTC(Number(key.slice(0, 4)), Number(key.slice(4, 6)) - 1, Number(key.slice(6, 8)), 5));
	return new Intl.DateTimeFormat("vi-VN", {
		timeZone: "Asia/Ho_Chi_Minh",
		weekday: "short",
		day: "2-digit",
		month: "2-digit"
	}).format(dt);
}
function kickLabel(iso) {
	if (!iso) return "";
	return new Intl.DateTimeFormat("vi-VN", {
		timeZone: "Asia/Ho_Chi_Minh",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false
	}).format(new Date(iso));
}
function whenLabel(iso) {
	if (!iso) return "";
	return new Intl.DateTimeFormat("vi-VN", {
		timeZone: "Asia/Ho_Chi_Minh",
		day: "2-digit",
		month: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false
	}).format(new Date(iso));
}
function useClock() {
	const [text, setText] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const tick = () => setText(new Intl.DateTimeFormat("vi-VN", {
			timeZone: "Asia/Ho_Chi_Minh",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: false
		}).format(/* @__PURE__ */ new Date()));
		tick();
		const id = window.setInterval(tick, 1e3);
		return () => window.clearInterval(id);
	}, []);
	return text;
}
function Crest({ src, label }) {
	const [ok, setOk] = (0, import_react.useState)(true);
	if (!src || !ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "grid size-9 shrink-0 place-items-center rounded-full bg-raise font-display text-sm text-gold",
		children: label.slice(0, 3)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src,
		alt: "",
		className: "size-9 shrink-0 object-contain",
		referrerPolicy: "no-referrer",
		onError: () => setOk(false)
	});
}
function isVietnam(m) {
	const blob = `${m.home.name} ${m.away.name}`.toLowerCase();
	return VN_LEAGUES.has(m.league) || /vietnam|việt|viet nam/.test(blob);
}
function PitchMap({ formation, players }) {
	const starters = players.filter((p) => p.starter).sort((a, b) => a.place - b.place);
	const nums = formation.split("-").map((n) => Number.parseInt(n, 10)).filter((n) => n > 0);
	const count = nums.reduce((a, b) => a + b, 0);
	if (starters.length < 11 || count !== 10) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "space-y-1",
		children: players.slice(0, 16).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex items-center gap-2 text-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "w-6 font-display text-gold",
					children: p.jersey
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-fg",
					children: p.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "ml-auto text-xs text-muted",
					children: p.starter ? p.position : "dự bị"
				})
			]
		}, `${p.jersey}-${p.name}`))
	});
	const gk = starters[0];
	let cursor = 1;
	const ordered = [...nums.map((n) => {
		const row = starters.slice(cursor, cursor + n);
		cursor += n;
		return row;
	})].reverse();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-line bg-raise/70 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-2 text-center font-display text-sm tracking-widest text-gold",
			children: formation
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-2",
			children: [ordered.map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-around gap-1",
				children: row.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "w-14 text-center text-xs leading-tight text-fg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mx-auto grid size-7 place-items-center rounded-full bg-bg font-display text-gold",
						children: p.jersey
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 block truncate",
						children: p.name.split(" ").slice(-1)
					})]
				}, p.name))
			}, i)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "w-14 text-center text-xs text-fg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mx-auto grid size-7 place-items-center rounded-full bg-gold font-display text-bg",
						children: gk.jersey
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 block truncate",
						children: gk.name.split(" ").slice(-1)
					})]
				})
			})]
		})]
	});
}
function PitchApp() {
	const clock = useClock();
	const [tab, setTab] = (0, import_react.useState)("live");
	const [chip, setChip] = (0, import_react.useState)("all");
	const [league, setLeague] = (0, import_react.useState)("world");
	const [day, setDay] = (0, import_react.useState)(0);
	const [query, setQuery] = (0, import_react.useState)("");
	const [searching, setSearching] = (0, import_react.useState)(false);
	const [matches, setMatches] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)("");
	const [updated, setUpdated] = (0, import_react.useState)("");
	const [saved, setSaved] = (0, import_react.useState)({});
	const [flashed, setFlashed] = (0, import_react.useState)({});
	const [picker, setPicker] = (0, import_react.useState)(false);
	const [open, setOpen] = (0, import_react.useState)(null);
	const [detail, setDetail] = (0, import_react.useState)(null);
	const [detailError, setDetailError] = (0, import_react.useState)("");
	const [sheetTab, setSheetTab] = (0, import_react.useState)("flow");
	const [brief, setBrief] = (0, import_react.useState)("");
	const [briefBusy, setBriefBusy] = (0, import_react.useState)(false);
	const [groups, setGroups] = (0, import_react.useState)([]);
	const [tableError, setTableError] = (0, import_react.useState)("");
	const [articles, setArticles] = (0, import_react.useState)([]);
	const [newsError, setNewsError] = (0, import_react.useState)("");
	const scores = (0, import_react.useRef)({});
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		try {
			const raw = localStorage.getItem(PREF_KEY);
			if (!raw) return;
			const parsed = JSON.parse(raw);
			if (parsed.league) setLeague(parsed.league);
			if (parsed.saved) setSaved(parsed.saved);
		} catch {}
		setHydrated(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!hydrated) return;
		localStorage.setItem(PREF_KEY, JSON.stringify({
			league,
			saved
		}));
	}, [
		hydrated,
		league,
		saved
	]);
	const date = vnKey(day);
	(0, import_react.useEffect)(() => {
		let stop = false;
		setLoading(true);
		const pull = async () => {
			try {
				const res = await fetch(apiUrl(`/api/board?league=${encodeURIComponent(league)}&date=${date}`));
				if (!res.ok) throw new Error("bad");
				const body = await res.json();
				if (stop) return;
				const nextFlash = {};
				for (const m of body.matches) {
					const sig = `${m.home.score}-${m.away.score}`;
					const prev = scores.current[m.id];
					if (prev && prev !== sig && m.state === "in") nextFlash[m.id] = true;
					scores.current[m.id] = sig;
				}
				if (Object.keys(nextFlash).length) {
					setFlashed(nextFlash);
					window.setTimeout(() => setFlashed({}), 4e3);
				}
				setMatches(body.matches);
				setUpdated(body.updatedAt);
				setError("");
				setSaved((cur) => {
					const copy = { ...cur };
					let changed = false;
					for (const m of body.matches) if (copy[m.id]) {
						copy[m.id] = m;
						changed = true;
					}
					return changed ? copy : cur;
				});
			} catch {
				if (!stop) setError("Không tải được tỉ số. Kiểm tra mạng rồi thử lại.");
			} finally {
				if (!stop) setLoading(false);
			}
		};
		pull();
		const id = window.setInterval(() => {
			if (document.visibilityState === "visible") pull();
		}, 2e4);
		return () => {
			stop = true;
			window.clearInterval(id);
		};
	}, [league, date]);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		let stop = false;
		const pull = async () => {
			try {
				const res = await fetch(apiUrl(`/api/match?league=${encodeURIComponent(open.league)}&id=${open.id}`));
				if (!res.ok) throw new Error("bad");
				const body = await res.json();
				if (!stop) {
					setDetail(body);
					setDetailError("");
				}
			} catch {
				if (!stop) setDetailError("Chưa mở được chi tiết trận.");
			}
		};
		pull();
		const id = window.setInterval(() => {
			if (open.state === "in" && document.visibilityState === "visible") pull();
		}, 2e4);
		return () => {
			stop = true;
			window.clearInterval(id);
		};
	}, [open]);
	(0, import_react.useEffect)(() => {
		if (tab !== "table") return;
		const slug = league === "world" ? "eng.1" : league;
		let stop = false;
		(async () => {
			try {
				const res = await fetch(apiUrl(`/api/standings?league=${encodeURIComponent(slug)}`));
				if (!res.ok) throw new Error("bad");
				const body = await res.json();
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
	(0, import_react.useEffect)(() => {
		if (tab !== "news") return;
		let stop = false;
		(async () => {
			try {
				const res = await fetch(apiUrl(`/api/news?league=${encodeURIComponent(league)}`));
				if (!res.ok) throw new Error("bad");
				const body = await res.json();
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
	const leagueName = league === "world" ? "Toàn cầu" : leagueBySlug(league)?.name ?? league;
	const liveCount = matches.filter((m) => m.state === "in").length;
	const shown = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		return (tab === "saved" ? Object.values(saved) : matches).filter((m) => {
			if (chip === "in" && m.state !== "in") return false;
			if (chip === "pre" && m.state !== "pre") return false;
			if (chip === "post" && m.state !== "post") return false;
			if (chip === "vn" && !isVietnam(m)) return false;
			if (!q) return true;
			return `${m.home.name} ${m.away.name} ${m.leagueName}`.toLowerCase().includes(q);
		});
	}, [
		matches,
		saved,
		tab,
		chip,
		query
	]);
	const askBrief = async () => {
		if (!open) return;
		setBriefBusy(true);
		setBrief("");
		try {
			const body = await (await fetch(apiUrl("/api/brief"), {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					league: open.league,
					id: open.id
				})
			})).json();
			setBrief(body.ok ? body.text ?? "" : body.error ?? "Không tạo được nhận định.");
		} catch {
			setBrief("Không tạo được nhận định.");
		} finally {
			setBriefBusy(false);
		}
	};
	const openMatch = (m) => {
		setOpen(m);
		setDetail(null);
		setBrief("");
		setSheetTab("flow");
		setDetailError("");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-30 border-b border-line bg-bg/95 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto w-full max-w-5xl px-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-end justify-between gap-3 pb-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-3xl leading-none tracking-wide text-gold",
							children: "SÂN 24"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted",
							children: ["Bóng đá thế giới · giờ Việt Nam ", clock]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-2xl leading-none text-fg",
								children: liveCount
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs tracking-wide text-live",
								children: "đang đá"
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 pb-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setPicker(true),
								className: "flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full border border-line bg-surface px-3 text-left",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "size-4 shrink-0 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate text-sm font-semibold",
									children: leagueName
								})]
							}),
							searching ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex h-11 w-40 items-center gap-2 rounded-full border border-line bg-surface px-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4 shrink-0 text-muted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									autoFocus: true,
									value: query,
									onChange: (e) => setQuery(e.target.value),
									placeholder: "Tìm đội",
									className: "w-full bg-transparent text-sm text-fg outline-none placeholder:text-muted"
								})]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": "Tìm đội",
								onClick: () => setSearching(true),
								className: "grid size-11 shrink-0 place-items-center rounded-full border border-line bg-surface",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4 text-muted" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AirDeck, {})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto w-full max-w-5xl px-4 pb-28",
				children: [
					tab === "live" || tab === "saved" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "-mx-4 flex gap-2 overflow-x-auto px-4 py-3",
							children: [
								-1,
								0,
								1,
								2
							].map((offset) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									setDay(offset);
									setTab("live");
								},
								className: "h-10 shrink-0 rounded-full px-3 text-sm font-semibold " + (day === offset && tab === "live" ? "bg-gold text-bg" : "bg-surface text-fg"),
								children: offset === 0 ? "Hôm nay" : dayLabel(vnKey(offset))
							}, offset))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-3 flex gap-2 overflow-x-auto",
							children: [
								["all", "Tất cả"],
								["in", "Đang đá"],
								["pre", "Sắp đá"],
								["post", "Đã xong"],
								["vn", "Việt Nam"]
							].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setChip(id),
								className: "h-9 shrink-0 rounded-full border px-3 text-sm " + (chip === id ? "border-gold bg-raise text-gold-soft" : "border-line text-muted"),
								children: label
							}, id))
						}),
						loading && matches.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-3",
							children: [
								0,
								1,
								2,
								3
							].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-24 animate-pulse rounded-2xl bg-surface" }, i))
						}) : null,
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-3 rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-gold-soft",
							children: error
						}) : null,
						!loading && shown.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-line bg-surface px-4 py-8 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-xl text-fg",
								children: "Không có trận khớp bộ lọc"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted",
								children: chip === "vn" ? "Hôm nay không có trận đội tuyển hoặc giải ASEAN/AFC trong nguồn. V-League chưa có feed công khai — chọn vòng loại châu Á hoặc ngày khác." : "Đổi ngày hoặc giải. Tỉ số tự làm mới mỗi 20 giây khi trận đang diễn ra."
							})]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "grid gap-3 lg:grid-cols-2",
							children: shown.map((m) => {
								const starred = Boolean(saved[m.id]);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "rounded-2xl border bg-surface " + (m.state === "in" ? "border-gold/70" : "border-line") + (flashed[m.id] ? " score-flash" : ""),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => openMatch(m),
										className: "block w-full px-3 py-3 text-left",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mb-2 flex items-center justify-between text-xs text-muted",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: m.leagueName }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: m.state === "in" ? "font-semibold text-live" : "",
													children: [m.state === "in" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mr-1 inline-block size-1.5 rounded-full bg-live live-dot align-middle" }) : null, m.state === "pre" ? kickLabel(m.kickoff) : m.statusLabel]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeamLine, {
												side: m.home,
												live: m.state !== "pre"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeamLine, {
												side: m.away,
												live: m.state !== "pre"
											}),
											m.broadcasts.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-2 text-xs text-muted",
												children: ["Đài: ", m.broadcasts.join(" · ")]
											}) : null
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex justify-end border-t border-line px-2 py-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											"aria-label": starred ? "Bỏ lưu trận" : "Lưu trận",
											onClick: () => setSaved((cur) => {
												const next = { ...cur };
												if (next[m.id]) delete next[m.id];
												else next[m.id] = m;
												return next;
											}),
											className: "grid size-11 place-items-center",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: starred ? "size-5 fill-gold text-gold" : "size-5 text-muted" })
										})
									})]
								}) }, `${m.league}-${m.id}`);
							})
						}),
						updated ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 text-center text-xs text-muted",
							children: [
								"Cập nhật ",
								kickLabel(updated),
								" · Nguồn tỉ số công khai ESPN · Không phát luồng lậu"
							]
						}) : null
					] }) : null,
					tab === "table" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "pt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "font-display text-2xl text-fg",
								children: ["Bảng xếp hạng · ", league === "world" ? "Ngoại hạng Anh" : leagueName]
							}),
							league === "world" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: "Đang xem thế giới thì bảng mặc định là Ngoại hạng Anh. Chọn một giải để đổi bảng."
							}) : null,
							tableError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-sm text-gold-soft",
								children: tableError
							}) : null,
							groups.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 overflow-x-auto rounded-2xl border border-line",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "bg-raise px-3 py-2 font-display text-sm tracking-wide text-gold",
									children: g.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
									className: "w-full text-left text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
										className: "text-xs text-muted",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-2 py-2 font-medium",
												children: "#"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-2 py-2 font-medium",
												children: "Đội"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-2 py-2 font-medium",
												children: "Tr"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-2 py-2 font-medium",
												children: "T"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-2 py-2 font-medium",
												children: "H"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-2 py-2 font-medium",
												children: "B"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-2 py-2 font-medium",
												children: "HS"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-2 py-2 font-medium",
												children: "Đ"
											})
										] })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: g.rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-t border-line",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-2 py-2 text-muted",
												children: r.rank
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-2 py-2",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "inline-flex items-center gap-2",
													children: [r.logo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
														src: r.logo,
														alt: "",
														className: "size-5 object-contain",
														referrerPolicy: "no-referrer"
													}) : null, r.team]
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-2 py-2",
												children: r.played
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-2 py-2",
												children: r.w
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-2 py-2",
												children: r.d
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-2 py-2",
												children: r.l
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-2 py-2",
												children: r.gd
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-2 py-2 font-semibold text-gold",
												children: r.pts
											})
										]
									}, `${g.name}-${r.team}`)) })]
								})]
							}, g.name))
						]
					}) : null,
					tab === "news" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "space-y-3 pt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl",
								children: "Tin sân cỏ"
							}),
							newsError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-gold-soft",
								children: newsError
							}) : null,
							articles.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: a.href || void 0,
								target: "_blank",
								rel: "noreferrer",
								className: "block overflow-hidden rounded-2xl border border-line bg-surface",
								children: [a.image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: a.image,
									alt: "",
									className: "h-40 w-full object-cover",
									referrerPolicy: "no-referrer"
								}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold leading-snug",
											children: a.title
										}),
										a.summary ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 line-clamp-3 text-sm text-muted",
											children: a.summary
										}) : null,
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-xs text-muted",
											children: a.published ? whenLabel(a.published) : ""
										})
									]
								})]
							}, a.id))
						]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/95 px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur-md",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-4",
					children: [
						[
							"live",
							"Trực tiếp",
							Activity
						],
						[
							"table",
							"Bảng",
							Table2
						],
						[
							"news",
							"Tin",
							Newspaper
						],
						[
							"saved",
							"Đã lưu",
							Star
						]
					].map(([id, label, Icon]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setTab(id),
						className: "flex h-14 flex-col items-center justify-center gap-0.5 text-xs " + (tab === id ? "text-gold" : "text-muted"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" }), label]
					}, id))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrumpSticker, {}),
			picker ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed inset-0 z-40 overflow-y-auto bg-bg px-4 pb-10 pt-[max(1rem,env(safe-area-inset-top))]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-3xl",
							children: "Chọn giải"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "Đóng",
							onClick: () => setPicker(false),
							className: "grid size-11 place-items-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							setLeague("world");
							setPicker(false);
							setTab("live");
						},
						className: "mb-4 flex h-12 w-full items-center rounded-2xl border border-gold bg-surface px-4 font-semibold text-gold-soft",
						children: "Toàn cầu — các giải lớn cùng lúc"
					}),
					LEAGUE_GROUPS.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mb-2 font-display text-sm tracking-widest text-muted",
							children: group
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-2 gap-2",
							children: LEAGUES.filter((l) => l.group === group).map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									setLeague(l.slug);
									setPicker(false);
									setTab("live");
								},
								className: "h-12 rounded-2xl border px-3 text-left text-sm font-semibold " + (league === l.slug ? "border-gold bg-raise text-gold-soft" : "border-line bg-surface text-fg"),
								children: l.name
							}, l.slug))
						})]
					}, group)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "V-League chưa có trong nguồn tỉ số công khai này. Đội tuyển nằm ở ASEAN, Asian Cup, vòng loại World Cup châu Á và giao hữu."
					})
				]
			}) : null,
			open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed inset-0 z-40 overflow-y-auto bg-bg px-4 pb-16 pt-[max(0.75rem,env(safe-area-inset-top))]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setOpen(null),
						className: "mb-3 flex h-11 items-center gap-1 text-sm text-gold-soft",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" }), "Danh sách"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							(detail ?? open).leagueName,
							" · ",
							(detail ?? open).venue || "Sân chưa rõ"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeamBlock, { side: (detail ?? open).home }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-4xl " + ((detail ?? open).state === "in" ? "text-live" : "text-fg"),
									children: (detail ?? open).state === "pre" ? kickLabel(open.kickoff) : `${(detail ?? open).home.score}–${(detail ?? open).away.score}`
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: (detail ?? open).statusLabel
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeamBlock, { side: (detail ?? open).away })
						]
					}),
					(detail ?? open).broadcasts.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-center text-sm text-muted",
						children: ["Phát chính thức trên ", (detail ?? open).broadcasts.join(", ")]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => void askBrief(),
							disabled: briefBusy,
							className: "h-11 flex-1 rounded-full bg-gold text-sm font-semibold text-bg disabled:opacity-60",
							children: briefBusy ? "Đang viết…" : "Nhận định ngắn"
						})
					}),
					brief ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 rounded-2xl border border-line bg-surface p-3 text-sm leading-relaxed",
						children: brief
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex gap-2",
						children: [
							["flow", "Diễn biến"],
							["xi", "Đội hình"],
							["stats", "Số liệu"],
							["watch", "Xem"]
						].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setSheetTab(id),
							className: "h-10 flex-1 rounded-full text-sm font-semibold " + (sheetTab === id ? "bg-raise text-gold-soft" : "text-muted"),
							children: label
						}, id))
					}),
					detailError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-gold-soft",
						children: detailError
					}) : null,
					!detail && !detailError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-4 h-40 animate-pulse rounded-2xl bg-surface" }) : null,
					detail && sheetTab === "flow" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 space-y-3",
						children: [
							detail.timeline.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: "Chưa có sự kiện. Trận sắp đá hoặc nguồn chưa cập nhật."
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "space-y-2",
								children: detail.timeline.map((ev, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex gap-3 rounded-xl bg-surface px-3 py-2 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-10 shrink-0 font-display text-gold",
										children: ev.minute || "•"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: ev.kind === "goal" ? "text-gold-soft" : ev.kind === "red" ? "text-live" : "text-fg",
										children: ev.label
									}), ev.player ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-muted",
										children: [" · ", ev.player]
									}) : null] })]
								}, `${ev.minute}-${ev.player}-${i}`))
							}),
							detail.notes.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "mb-2 font-display text-lg",
									children: "Tường thuật"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mb-2 text-xs text-muted",
									children: "Tiếng Anh từ nguồn phát."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "space-y-2",
									children: detail.notes.map((n, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "text-sm leading-relaxed text-fg",
										children: [n.minute ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mr-2 font-display text-gold",
											children: n.minute
										}) : null, n.text]
									}, i))
								})
							] }) : null
						]
					}) : null,
					detail && sheetTab === "xi" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid gap-4",
						children: detail.homeDetail.players.length + detail.awayDetail.players.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Đội hình công bố gần giờ bóng lăn."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideXi, {
							title: detail.home.name,
							formation: detail.homeDetail.formation,
							players: detail.homeDetail.players,
							form: detail.homeDetail.form
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideXi, {
							title: detail.away.name,
							formation: detail.awayDetail.formation,
							players: detail.awayDetail.players,
							form: detail.awayDetail.form
						})] })
					}) : null,
					detail && sheetTab === "stats" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-4 space-y-3",
						children: [detail.stats.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "text-sm text-muted",
							children: "Chưa có số liệu trận."
						}) : null, detail.stats.map((s) => {
							const total = s.homeNum + s.awayNum || 1;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-1 flex justify-between text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: s.home }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted",
										children: s.label
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: s.away })
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex h-1.5 overflow-hidden rounded-full bg-raise",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "bg-gold",
									style: { width: `${s.homeNum / total * 100}%` }
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "bg-line",
									style: { width: `${s.awayNum / total * 100}%` }
								})]
							})] }, s.key);
						})]
					}) : null,
					detail && sheetTab === "watch" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm leading-relaxed text-muted",
								children: "Clip dưới đây là highlight chính thức khi nguồn có file. Trận bản quyền đầy đủ phát trên đài ghi ở đầu trang, không nhúng luồng lậu."
							}),
							detail.clips.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-fg",
								children: "Chưa có clip cho trận này."
							}) : null,
							detail.clips.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
								className: "overflow-hidden rounded-2xl border border-line bg-surface",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
									controls: true,
									playsInline: true,
									poster: c.thumb || void 0,
									src: c.src,
									className: "aspect-video w-full bg-black"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", {
									className: "p-3 text-sm",
									children: c.title
								})]
							}, c.src)),
							detail.watchUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: detail.watchUrl,
								target: "_blank",
								rel: "noreferrer",
								className: "inline-flex h-11 items-center text-sm font-semibold text-gold",
								children: "Mở trang trận trên ESPN"
							}) : null
						]
					}) : null
				]
			}) : null
		]
	});
}
function TeamLine({ side, live }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3 py-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crest, {
				src: side.logo,
				label: side.abbr || side.short
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-0 flex-1 truncate text-base font-semibold",
				children: side.short || side.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-display text-2xl leading-none",
				children: live ? side.score : ""
			})
		]
	});
}
function TeamBlock({ side }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crest, {
			src: side.logo,
			label: side.abbr || side.short
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm font-semibold leading-tight",
			children: side.short || side.name
		})]
	});
}
function SideXi({ title, formation, players, form }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-2 flex items-center justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "font-semibold",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "flex gap-1",
			children: form.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid size-5 place-items-center rounded-full text-xs font-semibold " + (m === "W" ? "bg-up text-bg" : m === "L" ? "bg-live text-fg" : "bg-raise text-muted"),
				children: m
			}, i))
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PitchMap, {
		formation,
		players
	})] });
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PitchApp, {});
}
//#endregion
export { Home as component };
