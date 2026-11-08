export type XqMove = { from: number; to: number };

export type XqState = { board: number[]; side: 1 | -1; half: number };

const VAL = [0, 600, 270, 120, 120, 100000, 300, 70];
const HORSE = [
  { lr: 0, lf: 1, steps: [[1, 2], [-1, 2]] },
  { lr: 0, lf: -1, steps: [[1, -2], [-1, -2]] },
  { lr: 1, lf: 0, steps: [[2, 1], [2, -1]] },
  { lr: -1, lf: 0, steps: [[-2, 1], [-2, -1]] },
];
const ELE = [
  { er: 1, ef: 1, tr: 2, tf: 2 },
  { er: 1, ef: -1, tr: 2, tf: -2 },
  { er: -1, ef: 1, tr: -2, tf: 2 },
  { er: -1, ef: -1, tr: -2, tf: -2 },
];

function on(r: number, f: number): boolean {
  return r >= 0 && r < 10 && f >= 0 && f < 9;
}

function palace(side: number, r: number, f: number): boolean {
  if (f < 3 || f > 5) return false;
  return side > 0 ? r <= 2 : r >= 7;
}

function faces(board: number[]): boolean {
  let red = -1;
  let black = -1;
  for (let i = 0; i < 90; i += 1) {
    if (board[i] === 5) red = i;
    else if (board[i] === -5) black = i;
  }
  if (red < 0 || black < 0 || red % 9 !== black % 9) return false;
  const file = red % 9;
  for (let rank = Math.floor(red / 9) + 1; rank < Math.floor(black / 9); rank += 1) {
    if (board[rank * 9 + file]) return false;
  }
  return true;
}

function ortho(board: number[], from: number, dr: number, df: number, cannon: boolean): number[] {
  const out: number[] = [];
  let rank = Math.floor(from / 9) + dr;
  let file = (from % 9) + df;
  while (on(rank, file) && board[rank * 9 + file] === 0) {
    out.push(rank * 9 + file);
    rank += dr;
    file += df;
  }
  if (!on(rank, file)) return out;
  if (!cannon) {
    if (board[rank * 9 + file] * board[from] < 0) out.push(rank * 9 + file);
    return out;
  }
  rank += dr;
  file += df;
  while (on(rank, file) && board[rank * 9 + file] === 0) {
    rank += dr;
    file += df;
  }
  if (on(rank, file) && board[rank * 9 + file] * board[from] < 0) out.push(rank * 9 + file);
  return out;
}

function pseudo(board: number[], side: number): XqMove[] {
  const out: XqMove[] = [];
  for (let from = 0; from < 90; from += 1) {
    const piece = board[from];
    if (piece * side <= 0) continue;
    const r = Math.floor(from / 9);
    const f = from % 9;
    const abs = Math.abs(piece);
    const add = (nr: number, nf: number) => {
      if (!on(nr, nf)) return;
      const to = nr * 9 + nf;
      if (board[to] * side > 0) return;
      out.push({ from, to });
    };
    if (abs === 1 || abs === 6) {
      const dirs = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ];
      for (const [dr, df] of dirs) {
        for (const to of ortho(board, from, dr, df, abs === 6)) out.push({ from, to });
      }
    } else if (abs === 2) {
      for (const leg of HORSE) {
        const lr = r + leg.lr;
        const lf = f + leg.lf;
        if (!on(lr, lf) || board[lr * 9 + lf]) continue;
        for (const [dr, df] of leg.steps) add(r + dr, f + df);
      }
    } else if (abs === 3) {
      for (const jump of ELE) {
        const nr = r + jump.tr;
        const nf = f + jump.tf;
        if ((side > 0 && nr > 4) || (side < 0 && nr < 5)) continue;
        const er = r + jump.er;
        const ef = f + jump.ef;
        if (!on(er, ef) || board[er * 9 + ef]) continue;
        add(nr, nf);
      }
    } else if (abs === 4 || abs === 5) {
      const steps = abs === 5 ? [[1, 0], [-1, 0], [0, 1], [0, -1]] : [[1, 1], [1, -1], [-1, 1], [-1, -1]];
      for (const [dr, df] of steps) {
        const nr = r + dr;
        const nf = f + df;
        if (palace(side, nr, nf)) add(nr, nf);
      }
    } else {
      const fwd = side > 0 ? 1 : -1;
      add(r + fwd, f);
      const crossed = side > 0 ? r >= 5 : r <= 4;
      if (crossed) {
        add(r, f - 1);
        add(r, f + 1);
      }
    }
  }
  return out;
}

function kingIndex(board: number[], side: number): number {
  return board.indexOf(side * 5);
}

function squareAttacked(board: number[], idx: number, by: number): boolean {
  const rank = Math.floor(idx / 9);
  const file = idx % 9;
  const orthogonal = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  for (const [dr, df] of orthogonal) {
    let row = rank + dr;
    let col = file + df;
    let screen = false;
    while (on(row, col)) {
      const piece = board[row * 9 + col];
      if (!piece) {
        row += dr;
        col += df;
        continue;
      }
      if (!screen) {
        if (piece === by) return true;
        if (piece === by * 5 && file === col) return true;
        if (piece === by * 5 && Math.abs(row - rank) + Math.abs(col - file) === 1 && palace(by, row, col) && palace(by, rank, file)) return true;
        if (piece === by * 7) {
          const forward = by > 0 ? 1 : -1;
          const crossed = by > 0 ? row >= 5 : row <= 4;
          if ((row + forward === rank && col === file) || (crossed && row === rank && Math.abs(col - file) === 1)) return true;
        }
        screen = true;
        row += dr;
        col += df;
        continue;
      }
      if (piece === by * 6) return true;
      break;
    }
  }
  for (const leg of HORSE) {
    for (const [dr, df] of leg.steps) {
      const horseRank = rank - dr;
      const horseFile = file - df;
      if (!on(horseRank, horseFile) || board[horseRank * 9 + horseFile] !== by * 2) continue;
      const legRank = horseRank + leg.lr;
      const legFile = horseFile + leg.lf;
      if (on(legRank, legFile) && board[legRank * 9 + legFile] === 0) return true;
    }
  }
  for (const jump of ELE) {
    const elephantRank = rank - jump.tr;
    const elephantFile = file - jump.tf;
    if (!on(elephantRank, elephantFile) || board[elephantRank * 9 + elephantFile] !== by * 3) continue;
    if ((by > 0 && (elephantRank > 4 || rank > 4)) || (by < 0 && (elephantRank < 5 || rank < 5))) continue;
    if (board[(elephantRank + jump.er) * 9 + (elephantFile + jump.ef)] === 0) return true;
  }
  for (const [dr, df] of [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ]) {
    const advisorRank = rank + dr;
    const advisorFile = file + df;
    if (palace(by, advisorRank, advisorFile) && palace(by, rank, file) && board[advisorRank * 9 + advisorFile] === by * 4) return true;
  }
  return false;
}

export function legalXq(state: XqState): XqMove[] {
  const board = state.board;
  const out: XqMove[] = [];
  for (const move of pseudo(board, state.side)) {
    const piece = board[move.from];
    const captured = board[move.to];
    board[move.from] = 0;
    board[move.to] = piece;
    const king = kingIndex(board, state.side);
    const bad = king < 0 || faces(board) || squareAttacked(board, king, -state.side);
    board[move.to] = captured;
    board[move.from] = piece;
    if (!bad) out.push(move);
  }
  return out;
}

export function playXq(state: XqState, move: XqMove): XqState {
  const board = state.board.slice();
  const piece = board[move.from];
  const capture = board[move.to] !== 0;
  board[move.from] = 0;
  board[move.to] = piece;
  return { board, side: (state.side * -1) as 1 | -1, half: capture || Math.abs(piece) === 7 ? 0 : state.half + 1 };
}

export function xqKey(state: XqState): string {
  return `${state.side}|${state.board.join(",")}`;
}

export function xqStatus(state: XqState, repeats: number): { over: boolean; text: string } {
  const moves = legalXq(state);
  const name = state.side > 0 ? "Đỏ" : "Đen";
  const other = state.side > 0 ? "Đen" : "Đỏ";
  if (!moves.length) return { over: true, text: `Hết nước · ${other} thắng` };
  if (repeats >= 3) return { over: true, text: "Hòa · lặp thế 3 lần" };
  if (state.half >= 120) return { over: true, text: "Hòa · 60 nước không ăn" };
  const board = state.board;
  const king = kingIndex(board, state.side);
  if (squareAttacked(board, king, -state.side)) return { over: false, text: `${name} đang bị chiếu` };
  return { over: false, text: `${name} đi` };
}

export function startXq(): XqState {
  const board = Array<number>(90).fill(0);
  const back = [1, 2, 3, 4, 5, 4, 3, 2, 1];
  for (let file = 0; file < 9; file += 1) {
    board[file] = back[file];
    board[81 + file] = -back[file];
    if (file % 2 === 0) {
      board[27 + file] = 7;
      board[54 + file] = -7;
    }
  }
  board[19] = 6;
  board[25] = 6;
  board[64] = -6;
  board[70] = -6;
  return { board, side: 1, half: 0 };
}

export function perftXq(state: XqState, depth: number): number {
  if (depth === 0) return 1;
  let nodes = 0;
  for (const move of legalXq(state)) nodes += perftXq(playXq(state, move), depth - 1);
  return nodes;
}

function evaluate(state: XqState): number {
  let score = 0;
  for (let i = 0; i < 90; i += 1) {
    const piece = state.board[i];
    if (!piece) continue;
    const side = Math.sign(piece);
    const rank = Math.floor(i / 9);
    const file = i % 9;
    const ownRank = side > 0 ? rank : 9 - rank;
    const abs = Math.abs(piece);
    let bonus = 0;
    if (abs === 7) bonus = ownRank * 10 + (ownRank >= 5 ? 50 : 0);
    else if (abs === 2) bonus = (4 - Math.abs(file - 4)) * 8 + ownRank * 3;
    else if (abs === 1) bonus = ownRank * 4 + (4 - Math.abs(file - 4)) * 2;
    else if (abs === 6) bonus = (4 - Math.abs(file - 4)) * 6 + ownRank;
    else if (abs === 5) bonus = file === 4 ? 12 : 0;
    score += (VAL[abs] + bonus) * side;
  }
  return score * state.side;
}

export function thinkXq(state: XqState, ms: number): XqMove | null {
  const root = legalXq(state);
  if (!root.length) return null;
  const deadline = Date.now() + ms;
  let best = root[0];
  let stop = false;
  const order = (moves: XqMove[], board: number[]) =>
    moves
      .map((move) => ({ move, s: Math.abs(board[move.to]) * 10 - Math.abs(board[move.from]) }))
      .sort((a, b) => b.s - a.s)
      .map((item) => item.move);
  const negamax = (node: XqState, depth: number, alpha: number, beta: number, ply: number): number => {
    if (Date.now() > deadline) {
      stop = true;
      return 0;
    }
    if (depth <= 0) return quiesce(node, alpha, beta, ply);
    const moves = order(legalXq(node), node.board);
    if (!moves.length) return -100000 + ply;
    if (node.half >= 120) return 0;
    let bestScore = -100000;
    for (const move of moves) {
      const score = -negamax(playXq(node, move), depth - 1, -beta, -alpha, ply + 1);
      if (stop) return 0;
      if (score > bestScore) bestScore = score;
      if (score > alpha) alpha = score;
      if (alpha >= beta) break;
    }
    return bestScore;
  };
  const quiesce = (node: XqState, alpha: number, beta: number, ply: number): number => {
    if (Date.now() > deadline || ply > 6) {
      if (Date.now() > deadline) stop = true;
      return evaluate(node);
    }
    const stand = evaluate(node);
    if (stand >= beta) return stand;
    if (stand > alpha) alpha = stand;
    for (const move of legalXq(node)) {
      if (!node.board[move.to]) continue;
      const score = -quiesce(playXq(node, move), -beta, -alpha, ply + 1);
      if (stop) return alpha;
      if (score >= beta) return score;
      if (score > alpha) alpha = score;
    }
    return alpha;
  };
  for (let depth = 1; depth <= 4 && !stop; depth += 1) {
    let local = best;
    let localScore = -100000;
    let finished = true;
    const ordered = [best, ...root.filter((move) => move.from !== best.from || move.to !== best.to)];
    for (const move of ordered) {
      if (Date.now() > deadline) {
        finished = false;
        break;
      }
      const score = -negamax(playXq(state, move), depth - 1, -100000, 100000, 1);
      if (stop) {
        finished = false;
        break;
      }
      if (score > localScore) {
        localScore = score;
        local = move;
      }
    }
    if (finished) best = local;
  }
  return best;
}
