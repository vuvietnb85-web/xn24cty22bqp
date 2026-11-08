import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { Pause, Play, Plus, Minus, Radio } from "lucide-react";
import { apiUrl } from "@/lib/api-url";
import { AIR_CHANNELS, mbPerHour, type AirChannel } from "@/lib/air/catalog";
import { VTV_CHANNELS } from "@/lib/air/vtv";
import { engageTone, holdTone } from "@/lib/air/tone";

type Extra = { name: string; src: string; kbps: number; codec: string; country?: string; hls?: boolean };

const SAVE_KEY = "san24-air-save";
const TONE_KEY = "san24-air-tone";
const FRAME_KEY = "san24-air-frame";
const HEAVY_KBPS = 700;
const MIN_W = 112;

type Frame = { x: number; y: number; w: number };

function clampFrame(frame: Frame): Frame {
  const limit = Math.min(720, Math.max(MIN_W, window.innerWidth - 16));
  const w = Math.min(Math.max(MIN_W, frame.w), limit);
  const h = (w * 9) / 16;
  const x = Math.min(Math.max(frame.x, 24 - w), window.innerWidth - 64);
  const y = Math.min(Math.max(frame.y, 24 - h), window.innerHeight - 64);
  return { x, y, w };
}

function defaultFrame(): Frame {
  return clampFrame({ x: 12, y: window.innerHeight - 188, w: 148 });
}

function formatKb(usedBytes: number): string {
  if (usedBytes < 1024 * 1024) return `${Math.max(1, Math.round(usedBytes / 1024))} KB`;
  return `${(usedBytes / (1024 * 1024)).toFixed(1)} MB`;
}

function pickLevel(levels: { bitrate: number }[], save: boolean): number {
  const cap = (save ? 450 : 1200) * 1000;
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

export function AirDeck() {
  const rawRef = useRef<HTMLVideoElement>(null);
  const toneRef = useRef<HTMLVideoElement>(null);
  const activeRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<{ destroy: () => void } | null>(null);
  const [open, setOpen] = useState(false);
  const [save, setSave] = useState(true);
  const [tone, setTone] = useState(true);
  const [query, setQuery] = useState("");
  const [current, setCurrent] = useState<AirChannel | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState<AirChannel | null>(null);
  const [used, setUsed] = useState(0);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [levelKbps, setLevelKbps] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [vtvBusy, setVtvBusy] = useState("");
  const [frame, setFrame] = useState<Frame | null>(null);
  const rateRef = useRef(0);
  const wantPlay = useRef(false);
  const resumeTries = useRef(0);
  const frameRef = useRef<Frame | null>(null);
  const dragRef = useRef<{ kind: "move" | "size"; px: number; py: number; x: number; y: number; w: number } | null>(null);
  const pinchRef = useRef<{ dist: number; w: number; x: number; y: number } | null>(null);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem(SAVE_KEY) === "0") setSave(false);
    if (localStorage.getItem(TONE_KEY) === "0") setTone(false);
    const link = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (link?.saveData) setSave(true);
    try {
      const raw = localStorage.getItem(FRAME_KEY);
      setFrame(raw ? clampFrame(JSON.parse(raw) as Frame) : defaultFrame());
    } catch {
      setFrame(defaultFrame());
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(SAVE_KEY, save ? "1" : "0");
  }, [save]);

  useEffect(() => {
    localStorage.setItem(TONE_KEY, tone ? "1" : "0");
  }, [tone]);

  useEffect(() => {
    if (!frame) return;
    frameRef.current = frame;
    localStorage.setItem(FRAME_KEY, JSON.stringify(frame));
  }, [frame]);

  useEffect(() => {
    const onResize = () => {
      setFrame((currentFrame) => (currentFrame ? clampFrame(currentFrame) : currentFrame));
    };
    window.addEventListener("resize", onResize);
    const lift = () => {
      setFrame((currentFrame) => {
        if (!currentFrame) return currentFrame;
        const height = (currentFrame.w * 9) / 16;
        if (currentFrame.y + height < window.innerHeight * 0.48) return currentFrame;
        return clampFrame({ ...currentFrame, y: 8 });
      });
    };
    window.addEventListener("san24-game-open", lift);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("san24-game-open", lift);
    };
  }, []);

  useEffect(() => {
    let stop = false;
    const timer = window.setTimeout(() => {
      const q = query.trim();
      void (async () => {
        try {
          const params = new URLSearchParams({ save: save ? "1" : "0" });
          if (q) {
            params.set("q", q);
            params.set("world", "1");
          }
          const res = await fetch(apiUrl(`/api/air?${params}`));
          if (!res.ok) return;
          const body = (await res.json()) as { stations?: Extra[] };
          if (!stop && body.stations) setExtras(body.stations.slice(0, 18));
        } catch {
          /* danh sách phụ không chặn đài VOV */
        }
      })();
    }, query.trim() ? 320 : 0);
    return () => {
      stop = true;
      window.clearTimeout(timer);
    };
  }, [query, save]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const video = activeRef.current;
      if (!video || video.paused || !rateRef.current) return;
      setUsed((n) => n + rateRef.current / 8);
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onPause = () => {
      if (!document.hidden || !wantPlay.current || resumeTries.current >= 2) return;
      resumeTries.current += 1;
      const video = activeRef.current;
      if (!video) return;
      void holdTone();
      void video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    };
    const onVis = () => {
      if (!document.hidden) resumeTries.current = 0;
      void holdTone();
      const video = activeRef.current;
      if (!video) return;
      if (document.hidden) {
        if (!video.paused && "mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";
        return;
      }
      if (wantPlay.current && video.paused) {
        void video.play().then(() => setPlaying(true)).catch(() => setNote("Mở khóa rồi chạm phát nếu máy đã cắt tiếng."));
      }
    };
    const videos = [rawRef.current, toneRef.current];
    for (const video of videos) video?.addEventListener("pause", onPause);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pageshow", onVis);
    return () => {
      for (const video of videos) video?.removeEventListener("pause", onPause);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pageshow", onVis);
    };
  }, [frame]);

  useEffect(() => {
    return () => {
      hlsRef.current?.destroy();
    };
  }, []);

  const stopMedia = () => {
    wantPlay.current = false;
    if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "none";
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

  const attach = async (channel: AirChannel, force = false) => {
    stopMedia();
    setError("");
    setNote("");
    setCurrent(channel);
    setLevelKbps(channel.kbps);
    rateRef.current = channel.kbps * 1000;

    let src = channel.src;
    let cors = false;
    let kbps = channel.kbps;
    const hlsLike = channel.kind === "hls" || src.includes(".m3u8");
    try {
      const res = await fetch(apiUrl(`/api/air?probe=${encodeURIComponent(src)}&save=${save ? "1" : "0"}`));
      if (res.ok) {
        const probed = (await res.json()) as { src?: string; kbps?: number; heavy?: boolean; cors?: boolean };
        if (probed.src) src = probed.src;
        if (probed.kbps) kbps = probed.kbps;
        cors = Boolean(probed.cors);
        if (kbps) {
          setLevelKbps(kbps);
          rateRef.current = kbps * 1000;
        }
        if (save && probed.heavy && (channel.picture || kbps > HEAVY_KBPS) && !force) {
          setPending({ ...channel, src, kbps });
          setOpen(true);
          return;
        }
      }
    } catch {
      /* phát URL gốc nếu máy dò bận */
    }

    const useTone = tone && cors;
    const video = (useTone ? toneRef.current : rawRef.current) || rawRef.current;
    if (!video) return;
    activeRef.current = video;
    setProcessed(useTone);
    if (!useTone && tone) setNote("Đài không mở xử lý âm. Đang phát thẳng.");

    const start = () => {
      void video
        .play()
        .then(async () => {
          wantPlay.current = true;
          setPlaying(true);
          if (useTone) await engageTone(video, true);
          if ("mediaSession" in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
              title: channel.name,
              artist: "SÂN 24",
              album: "Phát khi tắt màn hình",
            });
            navigator.mediaSession.playbackState = "playing";
          }
        })
        .catch(() => setError("Trình duyệt chặn phát. Chạm nút phát trên khung sóng."));
    };

    if (!hlsLike) {
      video.src = src;
      video.onloadeddata = start;
      return;
    }

    const { default: HlsLib } = await import("hls.js");
    if (HlsLib.isSupported()) {
      const hls = new HlsLib({
        capLevelToPlayerSize: true,
        startLevel: 0,
        maxBufferLength: save ? 6 : 16,
        maxMaxBufferLength: save ? 10 : 28,
        backBufferLength: 0,
        maxBufferSize: save ? 6 * 1000 * 1000 : 20 * 1000 * 1000,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(HlsLib.Events.MANIFEST_PARSED, (_, data) => {
        const index = pickLevel(data.levels, save);
        hls.currentLevel = index;
        const next = Math.round((data.levels[index]?.bitrate || kbps * 1000) / 1000);
        if (next) {
          setLevelKbps(next);
          rateRef.current = next * 1000;
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

  const choose = (channel: AirChannel, force = false) => {
    if (save && channel.picture && channel.kbps > HEAVY_KBPS && !force) {
      setPending(channel);
      setOpen(true);
      return;
    }
    setPending(null);
    void attach(channel, force);
  };

  const openVtv = async (id: string, name: string) => {
    setVtvBusy(id);
    setError("");
    try {
      const res = await fetch(apiUrl(`/api/vtv?id=${encodeURIComponent(id)}`));
      const body = (await res.json()) as { src?: string; kbps?: number; error?: string };
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
        picture: true,
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
    if (video.paused) {
      wantPlay.current = true;
      void video.play().then(() => {
        setPlaying(true);
        if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";
      });
    } else {
      wantPlay.current = false;
      video.pause();
      setPlaying(false);
      if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
    }
  };

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const session = navigator.mediaSession;
    const play = () => {
      const video = activeRef.current;
      if (!video) return;
      wantPlay.current = true;
      void video.play().then(() => {
        setPlaying(true);
        session.playbackState = "playing";
      });
    };
    const pause = () => {
      wantPlay.current = false;
      activeRef.current?.pause();
      setPlaying(false);
      session.playbackState = "paused";
    };
    try {
      session.setActionHandler("play", play);
      session.setActionHandler("pause", pause);
      session.setActionHandler("stop", () => {
        wantPlay.current = false;
        stopMedia();
      });
    } catch {
      /* máy không nhận nút khóa màn hình */
    }
    return () => {
      try {
        session.setActionHandler("play", null);
        session.setActionHandler("pause", null);
        session.setActionHandler("stop", null);
      } catch {
        /* bỏ qua */
      }
    };
    // stopMedia đổi theo render; handler đọc ref nên chỉ gắn một lần
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const place = (next: Frame) => {
    const clamped = clampFrame(next);
    frameRef.current = clamped;
    setFrame(clamped);
  };

  const onFrameDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* vẫn kéo được khi trình duyệt không giữ con trỏ */
    }
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const base = frameRef.current;
    if (!base) return;
    if (pointersRef.current.size >= 2) {
      const [a, b] = [...pointersRef.current.values()];
      pinchRef.current = { dist: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), w: base.w, x: base.x, y: base.y };
      dragRef.current = null;
      return;
    }
    const resize = (event.target as HTMLElement).dataset.resize === "1";
    dragRef.current = { kind: resize ? "size" : "move", px: event.clientX, py: event.clientY, x: base.x, y: base.y, w: base.w };
  };

  const onFrameMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const point = pointersRef.current.get(event.pointerId);
    if (point) {
      point.x = event.clientX;
      point.y = event.clientY;
    }
    if (pointersRef.current.size >= 2 && pinchRef.current) {
      const [a, b] = [...pointersRef.current.values()];
      const dist = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
      place({ x: pinchRef.current.x, y: pinchRef.current.y, w: pinchRef.current.w * (dist / pinchRef.current.dist) });
      return;
    }
    const drag = dragRef.current;
    if (!drag) return;
    if (drag.kind === "move") place({ x: drag.x + event.clientX - drag.px, y: drag.y + event.clientY - drag.py, w: drag.w });
    else place({ x: drag.x, y: drag.y, w: drag.w + event.clientX - drag.px });
  };

  const onFrameUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(event.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
    dragRef.current = null;
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-surface"
        aria-label="Mở sóng VOV và truyền hình"
      >
        <Radio className={"size-4 " + (playing ? "text-gold" : "text-muted")} />
      </button>

      {mounted
        ? createPortal(
            <>
              {frame ? (
              <div
                className="fixed z-[45] touch-none"
                style={{ left: frame.x, top: frame.y, width: frame.w }}
                onPointerDown={onFrameDown}
                onPointerMove={onFrameMove}
                onPointerUp={onFrameUp}
                onPointerCancel={onFrameUp}
              >
                <div className="relative overflow-hidden rounded-xl border border-gold bg-surface shadow-lg" style={{ height: Math.round((frame.w * 9) / 16) }}>
                  <video ref={rawRef} playsInline className={"h-full w-full object-cover " + (processed ? "hidden" : "")} />
                  <video
                    ref={toneRef}
                    playsInline
                    crossOrigin="anonymous"
                    className={"h-full w-full object-cover " + (processed ? "" : "hidden")}
                  />
                  {!current?.picture ? (
                    <span className="pointer-events-none absolute inset-0 grid place-items-center bg-bg/80 font-display text-sm tracking-widest text-gold">
                      {current ? current.name.slice(0, 10) : "SÓNG"}
                    </span>
                  ) : null}
                  {current ? (
                    <p className="pointer-events-none absolute bottom-1 left-10 right-8 truncate text-[10px] font-semibold text-gold-soft">
                      {current.name}
                      {levelKbps ? ` · ${levelKbps}` : ""} · {formatKb(used)}
                    </p>
                  ) : null}
                  <div className="absolute left-1 top-1 flex gap-1">
                    <button type="button" onClick={() => frame && place({ ...frame, w: frame.w - 48 })} className="grid size-8 place-items-center rounded-full bg-bg/80 text-gold" aria-label="Thu nhỏ màn phát">
                      <Minus className="size-3" />
                    </button>
                    <button type="button" onClick={() => frame && place({ ...frame, w: frame.w + 64 })} className="grid size-8 place-items-center rounded-full bg-bg/80 text-gold" aria-label="Phóng to màn phát">
                      <Plus className="size-3" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={toggle}
                    className="absolute bottom-1 left-1 grid size-8 place-items-center rounded-full bg-bg/80 text-gold"
                    aria-label={playing ? "Tạm dừng sóng" : "Phát sóng"}
                  >
                    {playing ? <Pause className="size-3" /> : <Play className="size-3" />}
                  </button>
                  <span
                    data-resize="1"
                    className="absolute bottom-0 right-0 size-8 cursor-nwse-resize"
                    aria-hidden="true"
                  >
                    <span className="absolute bottom-1 right-1 size-3 border-b-2 border-r-2 border-gold" />
                  </span>
                </div>
              </div>
              ) : null}

              {open ? (
                <div className="fixed inset-0 z-40 overflow-y-auto bg-bg px-4 pb-28 pt-[max(1rem,env(safe-area-inset-top))]">
                  <div className="mx-auto w-full max-w-5xl">
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="font-display text-3xl text-gold">Sóng</h2>
                      <button type="button" onClick={() => setOpen(false)} className="h-11 px-3 text-sm font-semibold text-gold-soft">
                        Đóng
                      </button>
                    </div>
                    <p className="text-sm text-muted">
                      Kéo khung phát để đổi chỗ. Nút cộng trừ, hai ngón hoặc góc phải dưới để phóng. Tắt màn hình vẫn phát.
                    </p>
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Tìm đài, HLS, nước"
                      className="mt-3 h-11 w-full rounded-2xl border border-line bg-surface px-3 text-sm outline-none"
                    />
                    <label className="mt-3 flex h-11 items-center justify-between rounded-2xl border border-line bg-surface px-3 text-sm">
                      <span>Tiết kiệm 4G — mức thấp, bộ đệm ngắn</span>
                      <input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} className="size-5 accent-gold" />
                    </label>
                    <label className="mt-2 flex h-11 items-center justify-between rounded-2xl border border-line bg-surface px-3 text-sm">
                      <span>Nghe ấm +20% — nén, lời rõ, trần đỉnh</span>
                      <input type="checkbox" checked={tone} onChange={(e) => setTone(e.target.checked)} className="size-5 accent-gold" />
                    </label>
                    <p className="mt-2 text-xs text-muted">
                      Hồ sơ nghe trên máy: trầm vừa, tiếng lời nổi, nén rồi nâng 20%. Đài không cho đọc sóng thì phát thẳng.
                    </p>
                    {error ? <p className="mt-3 text-sm text-gold-soft">{error}</p> : null}
                    {note ? <p className="mt-2 text-sm text-muted">{note}</p> : null}
                    {pending ? (
                      <div className="mt-3 rounded-2xl border border-gold bg-surface p-3 text-sm">
                        <p>
                          {pending.name} khoảng {mbPerHour(pending.kbps).toFixed(0)} MB/giờ. Chế độ tiết kiệm không tự phát mức này.
                        </p>
                        <button
                          type="button"
                          onClick={() => choose(pending, true)}
                          className="mt-2 h-11 rounded-full bg-gold px-4 font-semibold text-bg"
                        >
                          Vẫn phát
                        </button>
                      </div>
                    ) : null}
                    {(["VOV", "Toàn cầu", "Hình"] as const).map((group) => (
                      <section key={group} className="mt-4">
                        <h3 className="font-display text-sm tracking-widest text-muted">
                          {group === "Hình" ? "Truyền hình công cộng" : group}
                        </h3>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {AIR_CHANNELS.filter((c) => c.group === group).map((channel) => (
                            <button
                              key={channel.id}
                              type="button"
                              onClick={() => choose(channel)}
                              className={
                                "h-14 rounded-2xl border px-3 text-left text-sm font-semibold " +
                                (current?.id === channel.id ? "border-gold bg-raise text-gold-soft" : "border-line bg-surface text-fg")
                              }
                            >
                              {channel.name}
                              <span className="mt-0.5 block text-xs font-normal text-muted">
                                {channel.picture ? "có hình" : "tiếng"} · {channel.kbps} kb/s · ~{mbPerHour(channel.kbps).toFixed(0)} MB/giờ
                              </span>
                            </button>
                          ))}
                        </div>
                      </section>
                    ))}
                    <section className="mt-4">
                      <h3 className="font-display text-sm tracking-widest text-muted">VTV quốc gia</h3>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {VTV_CHANNELS.map((channel) => (
                          <button
                            key={channel.id}
                            type="button"
                            disabled={vtvBusy === channel.id}
                            onClick={() => void openVtv(channel.id, channel.name)}
                            className={
                              "h-12 rounded-2xl border px-3 text-left text-sm font-semibold " +
                              (current?.id === `vtv-${channel.id}` ? "border-gold bg-raise text-gold-soft" : "border-line bg-surface text-fg")
                            }
                          >
                            {vtvBusy === channel.id ? "Đang lấy sóng…" : channel.name}
                          </button>
                        ))}
                      </div>
                    </section>
                    <section className="mt-4">
                      <h3 className="font-display text-sm tracking-widest text-muted">
                        {query.trim() ? "Kết quả dò toàn cầu" : "Đài khác trong nước"}
                      </h3>
                      <div className="mt-2 grid gap-2">
                        {extras.map((station) => (
                          <button
                            key={station.src}
                            type="button"
                            onClick={() =>
                              choose({
                                id: station.src,
                                name: station.name,
                                group: "VOV",
                                src: station.src,
                                kind: station.hls || station.src.includes(".m3u8") ? "hls" : "audio",
                                kbps: station.kbps || (save ? 64 : 128),
                                picture: false,
                              })
                            }
                            className="flex h-12 items-center justify-between rounded-2xl border border-line bg-surface px-3 text-left text-sm"
                          >
                            <span className="truncate font-semibold">
                              {station.name}
                              {station.country ? <span className="ml-2 font-normal text-muted">{station.country}</span> : null}
                            </span>
                            <span className="shrink-0 text-xs text-muted">
                              {station.hls ? "HLS · " : ""}
                              {station.kbps ? `${station.kbps} kb/s` : station.codec || "đài"}
                            </span>
                          </button>
                        ))}
                      </div>
                    </section>
                    <p className="mt-4 text-sm text-muted">
                      VTV lấy từ VTVgo, sóng rõ, không khóa DRM. Link có hạn vài giờ nên mỗi lần bấm là xin lại. VTVcab trả phí không có ở đây.
                    </p>
                  </div>
                </div>
              ) : null}
            </>,
            document.body,
          )
        : null}
    </>
  );
}
