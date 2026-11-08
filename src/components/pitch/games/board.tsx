import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChessView } from "./chess-view";
import type { GameTab } from "./game-bar";
import { SudokuView } from "./sudoku-view";
import { XiangqiView } from "./xiangqi-view";

export function GameGate({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<GameTab>("chess");
  useEffect(() => {
    window.dispatchEvent(new Event("san24-game-open"));
  }, []);
  const props = { tab, onTab: setTab, onClose };
  return createPortal(
    <div className="fixed inset-x-0 bottom-0 z-[38] h-[50dvh] border-t-2 border-gold bg-bg pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_28px_rgba(0,0,0,.4)]">
      {tab === "chess" ? <ChessView {...props} /> : null}
      {tab === "xiangqi" ? <XiangqiView {...props} /> : null}
      {tab === "sudoku" ? <SudokuView {...props} /> : null}
    </div>,
    document.body,
  );
}
