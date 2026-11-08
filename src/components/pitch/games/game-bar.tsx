import type { ReactNode } from "react";

const TABS = [
  { id: "chess", mark: "♔", label: "Cờ vua" },
  { id: "xiangqi", mark: "帥", label: "Cờ tướng" },
  { id: "sudoku", mark: "▦", label: "Sudoku" },
] as const;

export type GameTab = (typeof TABS)[number]["id"];

export function GameBar({
  tab,
  onTab,
  onClose,
  children,
}: {
  tab: GameTab;
  onTab: (tab: GameTab) => void;
  onClose: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex h-9 items-center gap-1 bg-gradient-to-b from-black/60 to-transparent px-1">
      {TABS.map((item) => (
        <button
          key={item.id}
          type="button"
          aria-label={item.label}
          onClick={() => onTab(item.id)}
          className={
            "pointer-events-auto grid h-7 w-7 place-items-center rounded-full text-sm " +
            (tab === item.id ? "bg-gold text-bg" : "bg-black/40 text-gold")
          }
        >
          {item.mark}
        </button>
      ))}
      <div className="pointer-events-auto ml-auto flex items-center gap-1">{children}</div>
      <button type="button" aria-label="Đóng" onClick={onClose} className="pointer-events-auto grid h-7 w-7 place-items-center text-xl leading-none text-gold">
        ×
      </button>
    </div>
  );
}
