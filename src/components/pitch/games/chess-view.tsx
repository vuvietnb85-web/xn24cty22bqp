import { useEffect, useMemo, useRef, useState } from "react";
import { chessKey, chessStatus, legalChess, playChess, startChess, type ChessMove, type ChessState } from "@/lib/games/chess";
import { GameBar, type GameTab } from "./game-bar";

const FULL: Record<number, string> = { 1: "Tốt", 2: "Mã", 3: "Tượng", 4: "Xe", 5: "Hậu", 6: "Vua" };

function ChessMan({ kind, white }: { kind: number; white: boolean }) {
  const fill = white ? "#fbf8f2" : "#1a1614";
  const stroke = white ? "#3d2914" : "#1a1614";
  const body = (() => {
    if (kind === 1) {
      return (
        <>
          <circle cx="20" cy="11" r="5.5" />
          <path d="M14.5 17.5h11L29 32H11z" />
          <rect x="9" y="32" width="22" height="4.2" rx="1" />
        </>
      );
    }
    if (kind === 2) {
      return (
        <>
          <path d="M28 33c1-7 3-9 3-15 0-3-1.4-5-3-6.5 2-.2 3.2-1.6 3.2-3.2-3.2 1.2-5 .2-6.6-1.6-3.4 1.6-6.4 4.6-8 6.4l-3.2 4.6 2.2 2.6-3.4 3.2 1.6 5.2H12c0 2 2 4 6 4h8c2 0 2.4-1.4 2-2.7z" />
          <rect x="8" y="33" width="24" height="4" rx="1" />
        </>
      );
    }
    if (kind === 3) {
      return (
        <>
          <circle cx="20" cy="5.5" r="2.2" />
          <path d="M20 8c-5 3.4-7.2 8-5.6 14L11 32h18l-3.4-10C27.2 16 25 11.4 20 8z" />
          <rect x="9" y="32" width="22" height="4.2" rx="1" />
        </>
      );
    }
    if (kind === 4) {
      return (
        <>
          <path d="M8 6h6v5h4V6h4v5h4V6h6v6H8zM10 12h20l3 16H7z" />
          <rect x="6" y="28" width="28" height="4" rx="1" />
          <rect x="7" y="33" width="26" height="3.4" rx="1" />
        </>
      );
    }
    if (kind === 5) {
      return (
        <>
          <circle cx="8" cy="8" r="2.1" />
          <circle cx="15" cy="5" r="2.1" />
          <circle cx="25" cy="5" r="2.1" />
          <circle cx="32" cy="8" r="2.1" />
          <path d="M8 10.2 12 18h16l4-7.8-5.2 4.6L20 8l-6.8 8.8zM13 18l-2 14h18l-2-14z" />
          <rect x="8" y="32" width="24" height="4.2" rx="1" />
        </>
      );
    }
    return (
      <>
        <path d="M18 2h4v3h3v4h-3v3h-4V9h-3V5h3z" />
        <path d="M11 14h18l-2 6H13zM13 20l-2 12h18L27 20z" />
        <rect x="8" y="32" width="24" height="4.2" rx="1" />
      </>
    );
  })();
  return (
    <svg viewBox="0 0 40 40" className="size-[92%]" aria-hidden="true">
      <g fill={fill} stroke={stroke} strokeWidth={white ? 1.15 : 0.45} strokeLinejoin="round">
        {body}
      </g>
    </svg>
  );
}

function repeatsOf(keys: string[], state: ChessState): number {
  const key = chessKey(state);
  return keys.filter((item) => item === key).length;
}

export function ChessView({ tab, onTab, onClose }: { tab: GameTab; onTab: (tab: GameTab) => void; onClose: () => void }) {
  const [user, setUser] = useState<1 | -1>(1);
  const [state, setState] = useState<ChessState>(startChess);
  const [keys, setKeys] = useState<string[]>(() => [chessKey(startChess())]);
  const [selected, setSelected] = useState<number | null>(null);
  const [promo, setPromo] = useState<ChessMove[] | null>(null);
  const [thinking, setThinking] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const idRef = useRef(0);
  const legal = useMemo(() => legalChess(state), [state]);
  const status = chessStatus(state, repeatsOf(keys, state));

  useEffect(() => {
    let worker: Worker | null = null;
    try {
      worker = new Worker(new URL("../../../lib/games/chess.worker.ts", import.meta.url), { type: "module" });
      worker.onmessage = (event: MessageEvent<{ id: number; move: ChessMove | null }>) => {
        if (event.data.id !== idRef.current || !event.data.move) {
          setThinking(false);
          return;
        }
        const move = event.data.move;
        setState((current) => {
          const next = playChess(current, move);
          setKeys((list) => [...list, chessKey(next)]);
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
      void import("@/lib/games/chess").then(({ thinkChess }) => {
        if (id !== idRef.current) return;
        const move = thinkChess(state, 280);
        setThinking(false);
        if (!move) return;
        const next = playChess(state, move);
        setState(next);
        setKeys((list) => [...list, chessKey(next)]);
      });
      return;
    }
    worker.postMessage({ id, state, ms: 1400 });
  }, [state, user, status.over]);

  const reset = (side: 1 | -1) => {
    idRef.current += 1;
    const next = startChess();
    setUser(side);
    setState(next);
    setKeys([chessKey(next)]);
    setSelected(null);
    setPromo(null);
    setThinking(false);
  };

  const commit = (move: ChessMove) => {
    const next = playChess(state, move);
    setState(next);
    setKeys((list) => [...list, chessKey(next)]);
    setSelected(null);
    setPromo(null);
  };

  const tap = (sq: number) => {
    if (thinking || status.over || state.side !== user) return;
    if (selected === null) {
      if (state.board[sq] * user > 0) setSelected(sq);
      return;
    }
    const choices = legal.filter((move) => move.from === selected && move.to === sq);
    if (!choices.length) {
      setSelected(state.board[sq] * user > 0 ? sq : null);
      return;
    }
    if (choices.length > 1) setPromo(choices);
    else commit(choices[0]);
  };

  const ranks = user > 0 ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const files = user > 0 ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  const targets = new Set(legal.filter((move) => move.from === selected).map((move) => move.to));

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col bg-[#3d4a32]">
      <div className="h-8 shrink-0" />
      <div className="relative min-h-0 flex-1" style={{ containerType: "size" }}>
      <div
        className="absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 grid-cols-8 grid-rows-8"
        style={{ width: "min(100cqw, 100cqh)", height: "min(100cqw, 100cqh)" }}
      >
        {ranks.map((rank) =>
          files.map((file) => {
            const sq = rank * 16 + file;
            const piece = state.board[sq];
            const dark = (rank + file) % 2 === 0;
            return (
              <button
                key={sq}
                type="button"
                onClick={() => tap(sq)}
                aria-label={`${String.fromCharCode(97 + file)}${rank + 1}${piece ? " " + FULL[Math.abs(piece)] : ""}`}
                className={"relative flex items-center justify-center " + (dark ? "bg-[#769656]" : "bg-[#eeeed2]") + (selected === sq ? " ring-2 ring-inset ring-[#fff4c2]" : "")}
              >
                {targets.has(sq) ? <span className={"absolute size-[18%] rounded-full " + (piece ? "bg-[#f4e4b2]/80" : "bg-black/35")} /> : null}
                {piece ? (
                  <span className="aspect-square h-[90%] max-w-[90%]">
                    <ChessMan kind={Math.abs(piece)} white={piece > 0} />
                  </span>
                ) : null}
              </button>
            );
          }),
        )}
      </div>
      </div>
      <GameBar tab={tab} onTab={onTab} onClose={onClose}>
        <button type="button" aria-label="Cầm trắng" onClick={() => reset(1)} className={"grid h-7 w-7 place-items-center rounded-full bg-[#f4f1ea] text-base text-[#1a1614] " + (user > 0 ? "ring-2 ring-gold" : "opacity-70")}>
          ♔
        </button>
        <button type="button" aria-label="Cầm đen" onClick={() => reset(-1)} className={"grid h-7 w-7 place-items-center rounded-full bg-[#1a1614] text-base text-[#f4f1ea] " + (user < 0 ? "ring-2 ring-gold" : "opacity-70")}>
          ♚
        </button>
        <button type="button" aria-label="Ván mới" onClick={() => reset(user)} className={"grid h-7 w-7 place-items-center rounded-full bg-black/40 text-lg text-gold " + (thinking ? "animate-spin" : "")}>
          ↻
        </button>
      </GameBar>
      {promo ? (
        <div className="absolute inset-x-0 bottom-1 z-20 flex justify-center gap-1">
          {promo.map((move) => (
            <button key={move.promo} type="button" aria-label={FULL[move.promo]} onClick={() => commit(move)} className="grid h-9 w-9 place-items-center rounded-full bg-[#eeeed2]">
              <span className="size-7">
                <ChessMan kind={move.promo} white />
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
