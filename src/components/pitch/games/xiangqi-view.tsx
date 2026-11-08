import { useEffect, useMemo, useRef, useState } from "react";
import { legalXq, playXq, startXq, xqKey, xqStatus, type XqMove, type XqState } from "@/lib/games/xiangqi";
import { GameBar, type GameTab } from "./game-bar";

const GLYPH: Record<number, string> = {
  1: "俥",
  2: "傌",
  3: "相",
  4: "仕",
  5: "帥",
  6: "炮",
  7: "兵",
  [-1]: "車",
  [-2]: "馬",
  [-3]: "象",
  [-4]: "士",
  [-5]: "將",
  [-6]: "砲",
  [-7]: "卒",
};

export function XiangqiView({ tab, onTab, onClose }: { tab: GameTab; onTab: (tab: GameTab) => void; onClose: () => void }) {
  const [user, setUser] = useState<1 | -1>(1);
  const [state, setState] = useState<XqState>(startXq);
  const [keys, setKeys] = useState<string[]>(() => [xqKey(startXq())]);
  const [selected, setSelected] = useState<number | null>(null);
  const [thinking, setThinking] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const idRef = useRef(0);
  const legal = useMemo(() => legalXq(state), [state]);
  const repeats = keys.filter((item) => item === xqKey(state)).length;
  const status = xqStatus(state, repeats);

  useEffect(() => {
    let worker: Worker | null = null;
    try {
      worker = new Worker(new URL("../../../lib/games/xiangqi.worker.ts", import.meta.url), { type: "module" });
      worker.onmessage = (event: MessageEvent<{ id: number; move: XqMove | null }>) => {
        if (event.data.id !== idRef.current || !event.data.move) {
          setThinking(false);
          return;
        }
        const move = event.data.move;
        setState((current) => {
          const next = playXq(current, move);
          setKeys((list) => [...list, xqKey(next)]);
          return next;
        });
        setThinking(false);
      };
      workerRef.current = worker;
    } catch {
      workerRef.current = null;
    }
    return () => worker?.terminate();
  }, []);

  useEffect(() => {
    if (status.over || state.side === user) return;
    const id = ++idRef.current;
    setThinking(true);
    const worker = workerRef.current;
    if (!worker) {
      void import("@/lib/games/xiangqi").then(({ thinkXq }) => {
        if (id !== idRef.current) return;
        const move = thinkXq(state, 280);
        setThinking(false);
        if (!move) return;
        const next = playXq(state, move);
        setState(next);
        setKeys((list) => [...list, xqKey(next)]);
      });
      return;
    }
    worker.postMessage({ id, state, ms: 1400 });
  }, [state, user, status.over]);

  const reset = (side: 1 | -1) => {
    idRef.current += 1;
    const next = startXq();
    setUser(side);
    setState(next);
    setKeys([xqKey(next)]);
    setSelected(null);
    setThinking(false);
  };

  const tap = (index: number) => {
    if (thinking || status.over || state.side !== user) return;
    if (selected === null) {
      if (state.board[index] * user > 0) setSelected(index);
      return;
    }
    const move = legal.find((item) => item.from === selected && item.to === index);
    if (!move) {
      setSelected(state.board[index] * user > 0 ? index : null);
      return;
    }
    const next = playXq(state, move);
    setState(next);
    setKeys((list) => [...list, xqKey(next)]);
    setSelected(null);
  };

  const ranks = user > 0 ? [9, 8, 7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const files = user > 0 ? [0, 1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1, 0];
  const targets = new Set(legal.filter((move) => move.from === selected).map((move) => move.to));
  const colOf = (file: number) => files.indexOf(file);
  const rowOf = (rank: number) => ranks.indexOf(rank);
  const line = "#4a2c16";

  const flowers = [
    ...[2, 7].flatMap((rank) => [1, 7].map((file) => ({ file, rank }))),
    ...[3, 6].flatMap((rank) => [0, 2, 4, 6, 8].map((file) => ({ file, rank }))),
  ];

  const flower = (x: number, y: number, edge: "left" | "right" | "mid") => {
    const d = 0.18;
    const a = 0.22;
    const dirs = edge === "left" ? ["ne", "se"] : edge === "right" ? ["nw", "sw"] : ["ne", "nw", "se", "sw"];
    return dirs.map((dir) => {
      const sx = dir.includes("e") ? 1 : -1;
      const sy = dir.includes("s") ? 1 : -1;
      const cx = x + sx * d;
      const cy = y + sy * d;
      return (
        <g key={`${x}-${y}-${dir}`}>
          <line x1={cx} y1={cy} x2={cx + sx * a} y2={cy} stroke={line} strokeWidth="0.035" />
          <line x1={cx} y1={cy} x2={cx} y2={cy + sy * a} stroke={line} strokeWidth="0.035" />
        </g>
      );
    });
  };

  const palace = (rankA: number, rankB: number) => {
    const y1 = rowOf(rankA);
    const y2 = rowOf(rankB);
    return (
      <g>
        <line x1={colOf(3)} y1={y1} x2={colOf(5)} y2={y2} stroke={line} strokeWidth="0.04" />
        <line x1={colOf(5)} y1={y1} x2={colOf(3)} y2={y2} stroke={line} strokeWidth="0.04" />
      </g>
    );
  };

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col bg-[#f3d7a4]">
      <div className="h-8 shrink-0" />
      <div className="relative min-h-0 flex-1" style={{ containerType: "size" }}>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: "min(100cqw, calc(100cqh * 8 / 10.35))", aspectRatio: "8 / 10.35" }}>
        <div className="absolute" style={{ inset: "1.5%" }}>
        <svg viewBox="0 0 8 9" preserveAspectRatio="none" className="h-full w-full" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((y) => <line key={`th${y}`} x1="0" y1={y} x2="8" y2={y} stroke={line} strokeWidth="0.04" />)}
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((x) => <line key={`tv${x}`} x1={x} y1="0" x2={x} y2="4" stroke={line} strokeWidth="0.04" />)}
              {[5, 6, 7, 8, 9].map((y) => <line key={`bh${y}`} x1="0" y1={y} x2="8" y2={y} stroke={line} strokeWidth="0.04" />)}
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((x) => <line key={`bv${x}`} x1={x} y1="5" x2={x} y2="9" stroke={line} strokeWidth="0.04" />)}
              <line x1="0" y1="4" x2="0" y2="5" stroke={line} strokeWidth="0.04" />
              <line x1="8" y1="4" x2="8" y2="5" stroke={line} strokeWidth="0.04" />
              {palace(0, 2)}
              {palace(9, 7)}
              {flowers.map(({ file, rank }) => {
                const x = colOf(file);
                const y = rowOf(rank);
                const edge = x === 0 ? "left" : x === 8 ? "right" : "mid";
                return <g key={`${file}-${rank}`}>{flower(x, y, edge)}</g>;
              })}
            </svg>
            <div className="pointer-events-none absolute inset-x-0 flex -translate-y-1/2 items-center justify-between px-[8%] font-serif text-[11px] tracking-[0.4em] text-[#6b3f22]" style={{ top: "50%" }}>
              <span>楚河</span>
              <span>漢界</span>
            </div>
            {ranks.map((rank, row) =>
              files.map((file, col) => {
                const index = rank * 9 + file;
                const piece = state.board[index];
                const aimed = targets.has(index);
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => tap(index)}
                    aria-label={`${file + 1} ${rank}`}
                    className="absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center"
                    style={{ left: `${(col / 8) * 100}%`, top: `${(row / 9) * 100}%`, width: "12.4%", aspectRatio: "1", containerType: "size" }}
                  >
                    {aimed && !piece ? <span className="size-[28%] rounded-full bg-[#4a2c16]/70" /> : null}
                    {piece ? (
                      <span
                        className="grid size-full place-items-center rounded-full border-[1.5px] bg-[#f7ead0] font-serif font-bold leading-none shadow-[0_1px_1px_rgba(60,30,10,.35)]"
                        style={{
                          color: piece > 0 ? "#c8102e" : "#161616",
                          borderColor: piece > 0 ? "#c8102e" : "#161616",
                          fontSize: "62cqw",
                          boxShadow: selected === index ? "0 0 0 2px #e8b00f" : undefined,
                        }}
                      >
                        {GLYPH[piece]}
                      </span>
                    ) : selected === index ? (
                      <span className="size-[34%] rounded-full bg-[#e8b00f]" />
                    ) : null}
                  </button>
                );
              }),
            )}
        </div>
      </div>
      </div>
      <GameBar tab={tab} onTab={onTab} onClose={onClose}>
        <button type="button" aria-label="Cầm đỏ" onClick={() => reset(1)} className={"grid h-7 w-7 place-items-center rounded-full border border-[#c8102e] bg-[#f7ead0] font-serif text-[11px] font-bold text-[#c8102e] " + (user > 0 ? "ring-2 ring-gold" : "opacity-70")}>
          帥
        </button>
        <button type="button" aria-label="Cầm đen" onClick={() => reset(-1)} className={"grid h-7 w-7 place-items-center rounded-full border border-[#161616] bg-[#f7ead0] font-serif text-[11px] font-bold text-[#161616] " + (user < 0 ? "ring-2 ring-gold" : "opacity-70")}>
          將
        </button>
        <button type="button" aria-label="Ván mới" onClick={() => reset(user)} className={"grid h-7 w-7 place-items-center rounded-full bg-black/40 text-lg text-gold " + (thinking ? "animate-spin" : "")}>
          ↻
        </button>
      </GameBar>
    </div>
  );
}
