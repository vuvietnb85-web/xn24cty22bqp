import { useEffect, useState } from "react";
import { generateHard, type SudokuPack } from "@/lib/games/sudoku";
import { GameBar, type GameTab } from "./game-bar";

function sameHouse(a: number, b: number): boolean {
  if (Math.floor(a / 9) === Math.floor(b / 9) || a % 9 === b % 9) return true;
  return Math.floor(a / 27) === Math.floor(b / 27) && Math.floor((a % 9) / 3) === Math.floor((b % 9) / 3);
}

export function SudokuView({ tab, onTab, onClose }: { tab: GameTab; onTab: (tab: GameTab) => void; onClose: () => void }) {
  const [pack, setPack] = useState<SudokuPack | null>(null);
  const [entry, setEntry] = useState<number[]>(() => Array<number>(81).fill(0));
  const [notes, setNotes] = useState<boolean[][]>(() => Array.from({ length: 81 }, () => Array<boolean>(10).fill(false)));
  const [noteMode, setNoteMode] = useState(false);
  const [selected, setSelected] = useState(0);
  const [checked, setChecked] = useState(false);
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    setPack(generateHard());
    setEntry(Array<number>(81).fill(0));
    setNotes(Array.from({ length: 81 }, () => Array<boolean>(10).fill(false)));
    setChecked(false);
    setSelected(0);
  }, [seed]);

  if (!pack) return <div className="h-full w-full bg-white" />;

  const valueAt = (index: number) => pack.puzzle[index] || entry[index];
  const conflict = (index: number) => {
    const value = valueAt(index);
    if (!value) return false;
    return pack.puzzle.some((_, other) => other !== index && valueAt(other) === value && sameHouse(index, other));
  };

  const write = (digit: number) => {
    if (pack.puzzle[selected]) return;
    setChecked(false);
    if (!digit) {
      setEntry((current) => current.map((value, index) => (index === selected ? 0 : value)));
      setNotes((current) => current.map((row, index) => (index === selected ? Array<boolean>(10).fill(false) : row)));
      return;
    }
    if (noteMode) {
      setNotes((current) => current.map((row, index) => (index === selected ? row.map((on, n) => (n === digit ? !on : on)) : row)));
      return;
    }
    setEntry((current) => current.map((value, index) => (index === selected ? digit : value)));
  };

  const wrong = checked ? entry.reduce((count, value, index) => count + (pack.puzzle[index] ? 0 : value !== pack.solution[index] ? 1 : 0), 0) : 0;

  return (
    <div className="relative h-full min-h-0 w-full bg-white">
      <div className="absolute inset-x-0 top-8 bottom-9" style={{ containerType: "size" }}>
        <div
          className="absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 grid-cols-9 grid-rows-9 border-2 border-[#1a1a1a]"
          style={{ width: "min(100cqw, 100cqh)", height: "min(100cqw, 100cqh)" }}
        >
        {pack.puzzle.map((given, index) => {
          const value = valueAt(index);
          const col = index % 9;
          const row = Math.floor(index / 9);
          const selRow = Math.floor(selected / 9);
          const selCol = selected % 9;
          const thickL = col === 3 || col === 6;
          const thickT = row === 3 || row === 6;
          const bad = conflict(index) || (checked && !given && entry[index] !== 0 && entry[index] !== pack.solution[index]);
          const onRow = row === selRow;
          const onCol = col === selCol;
          const wash = index === selected ? "bg-[#d6e8f8]" : onRow || onCol ? "bg-[#f4f7fa]" : "bg-white";
          return (
            <button
              key={index}
              type="button"
              onClick={() => setSelected(index)}
              className={
                "relative flex items-center justify-center border border-[#d0d0d0] font-sans " +
                wash +
                (thickL ? " border-l-2 border-l-[#1a1a1a]" : "") +
                (thickT ? " border-t-2 border-t-[#1a1a1a]" : "")
              }
            >
              {value ? (
                <span className={bad ? "font-semibold text-[#c0392b]" : given ? "font-bold text-[#111]" : "font-medium text-[#1a4f9c]"}>{value}</span>
              ) : (
                <span className="grid grid-cols-3 text-[7px] leading-none text-[#8a8a8a]">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                    <span key={digit}>{notes[index][digit] ? digit : ""}</span>
                  ))}
                </span>
              )}
            </button>
          );
        })}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 grid h-9 grid-cols-12">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
          <button key={digit} type="button" onClick={() => write(digit)} className="border-t border-[#1a1a1a] bg-white font-semibold text-[#111]">
            {digit}
          </button>
        ))}
        <button type="button" aria-label="Xóa" onClick={() => write(0)} className="border-t border-[#1a1a1a] bg-white text-[#5c6b7a]">
          ⌫
        </button>
        <button type="button" aria-label="Nháp" onClick={() => setNoteMode((on) => !on)} className={"border-t border-[#1a1a1a] " + (noteMode ? "bg-[#1a1a1a] text-white" : "bg-white text-[#111]")}>
          ✎
        </button>
        <button
          type="button"
          aria-label="Nộp"
          onClick={() => setChecked(true)}
          className={"border-t border-[#1a1a1a] font-bold " + (checked ? (wrong === 0 ? "bg-[#1f7a3a] text-white" : "bg-[#c0392b] text-white") : "bg-[#1a1a1a] text-white")}
        >
          ✓
        </button>
      </div>
      <GameBar tab={tab} onTab={onTab} onClose={onClose}>
        <button type="button" aria-label="Đề mới" onClick={() => setSeed((n) => n + 1)} className="grid h-7 w-7 place-items-center rounded-full bg-black/40 text-lg text-gold">
          ↻
        </button>
      </GameBar>
    </div>
  );
}
