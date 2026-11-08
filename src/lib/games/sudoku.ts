export type SudokuPack = { puzzle: number[]; solution: number[] };

function boxOf(index: number): number {
  return Math.floor(index / 27) * 3 + Math.floor((index % 9) / 3);
}

function candidates(grid: number[], index: number): number[] {
  if (grid[index]) return [];
  const used = new Set<number>();
  const row = Math.floor(index / 9) * 9;
  const col = index % 9;
  for (let i = 0; i < 9; i += 1) {
    used.add(grid[row + i]);
    used.add(grid[col + i * 9]);
  }
  const start = Math.floor(index / 27) * 27 + Math.floor((index % 9) / 3) * 3;
  for (let r = 0; r < 3; r += 1) for (let c = 0; c < 3; c += 1) used.add(grid[start + r * 9 + c]);
  const out: number[] = [];
  for (let digit = 1; digit <= 9; digit += 1) if (!used.has(digit)) out.push(digit);
  return out;
}

function count(grid: number[], limit: number): number {
  let index = -1;
  let best: number[] = [];
  for (let i = 0; i < 81; i += 1) {
    if (grid[i]) continue;
    const options = candidates(grid, i);
    if (options.length === 0) return 0;
    if (index < 0 || options.length < best.length) {
      index = i;
      best = options;
      if (options.length === 1) break;
    }
  }
  if (index < 0) return 1;
  let found = 0;
  for (const digit of best) {
    grid[index] = digit;
    found += count(grid, limit - found);
    grid[index] = 0;
    if (found >= limit) return found;
  }
  return found;
}

function shuffle<T>(list: T[]): T[] {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = copy[i];
    copy[i] = copy[j];
    copy[j] = swap;
  }
  return copy;
}

function fill(grid: number[]): boolean {
  const index = grid.findIndex((cell) => cell === 0);
  if (index < 0) return true;
  for (const digit of shuffle(candidates(grid, index))) {
    grid[index] = digit;
    if (fill(grid)) return true;
    grid[index] = 0;
  }
  return false;
}

function singles(grid: number[]): boolean {
  const work = grid.slice();
  let moved = true;
  while (moved) {
    moved = false;
    for (let i = 0; i < 81; i += 1) {
      if (work[i]) continue;
      const options = candidates(work, i);
      if (options.length === 1) {
        work[i] = options[0];
        moved = true;
      }
    }
    for (let digit = 1; digit <= 9; digit += 1) {
      for (let unit = 0; unit < 9; unit += 1) {
        const rows: number[] = [];
        const cols: number[] = [];
        const boxes: number[] = [];
        for (let i = 0; i < 9; i += 1) {
          const row = unit * 9 + i;
          const col = i * 9 + unit;
          const box = Math.floor(unit / 3) * 27 + (unit % 3) * 3 + Math.floor(i / 3) * 9 + (i % 3);
          if (!work[row] && candidates(work, row).includes(digit)) rows.push(row);
          if (!work[col] && candidates(work, col).includes(digit)) cols.push(col);
          if (!work[box] && candidates(work, box).includes(digit)) boxes.push(box);
        }
        if (rows.length === 1) {
          work[rows[0]] = digit;
          moved = true;
        }
        if (cols.length === 1) {
          work[cols[0]] = digit;
          moved = true;
        }
        if (boxes.length === 1) {
          work[boxes[0]] = digit;
          moved = true;
        }
      }
    }
  }
  return work.every((cell) => cell > 0);
}

export function generateHard(): SudokuPack {
  const started = Date.now();
  let fallback: SudokuPack | null = null;
  while (Date.now() - started < 1200) {
    const solution = Array<number>(81).fill(0);
    if (!fill(solution)) continue;
    const puzzle = solution.slice();
    let clues = 81;
    for (const index of shuffle([...Array(81).keys()])) {
      if (clues <= 23) break;
      const saved = puzzle[index];
      puzzle[index] = 0;
      if (count(puzzle.slice(), 2) === 1) clues -= 1;
      else puzzle[index] = saved;
    }
    const pack = { puzzle: puzzle.slice(), solution };
    fallback = pack;
    if (clues <= 26 && !singles(puzzle)) return pack;
  }
  if (fallback) return fallback;
  const solution = Array<number>(81).fill(0);
  fill(solution);
  return { puzzle: solution.slice(), solution };
}

export function easyBySingles(puzzle: number[]): boolean {
  return singles(puzzle);
}

export function clueCount(puzzle: number[]): number {
  return puzzle.filter((cell) => cell > 0).length;
}

export function boxIndex(index: number): number {
  return boxOf(index);
}
