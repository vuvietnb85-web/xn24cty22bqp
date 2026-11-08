export type ChessMove = { from: number; to: number; promo: number };

export type ChessState = {
  board: number[];
  side: 1 | -1;
  castle: number;
  ep: number;
  half: number;
  full: number;
};

type Pos = { b: Int8Array; side: number; castle: number; ep: number; half: number; full: number };
type Undo = {
  capture: number;
  capSq: number;
  castle: number;
  ep: number;
  half: number;
  full: number;
  piece: number;
  rookFrom: number;
  rookTo: number;
};

const SQUARES: number[] = [];
for (let rank = 0; rank < 8; rank += 1) for (let file = 0; file < 8; file += 1) SQUARES.push(rank * 16 + file);

const KNIGHT = [14, 18, 31, 33, -14, -18, -31, -33];
const BISHOP = [15, 17, -15, -17];
const ROOK = [16, -16, 1, -1];
const KING = [15, 17, -15, -17, 16, -16, 1, -1];
const MATE = 100000;

const VAL = [0, 100, 320, 330, 500, 900, 20000];
const PST = [
  [] as number[],
  [0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30, 20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5, -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0],
  [-50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30, 0, 10, 15, 15, 10, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20, -40, -50, -40, -30, -30, -30, -30, -40, -50],
  [-20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 10, 10, 5, 0, -10, -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20, -10, -10, -10, -10, -10, -10, -20],
  [0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0],
  [-20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 5, 5, 5, 0, -10, -5, 0, 5, 5, 5, 5, 0, -5, 0, 0, 5, 5, 5, 5, 0, -5, -10, 5, 5, 5, 5, 5, 0, -10, -10, 0, 5, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10, -10, -20],
  [-30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20, -20, -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20],
];
const KING_END = [-50, -40, -30, -20, -20, -30, -40, -50, -30, -20, -10, 0, 0, -10, -20, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -30, 0, 0, 0, 0, -30, -30, -50, -30, -30, -30, -30, -30, -30, -50];

function load(state: ChessState): Pos {
  return { b: Int8Array.from(state.board), side: state.side, castle: state.castle, ep: state.ep, half: state.half, full: state.full };
}

function dump(pos: Pos): ChessState {
  return { board: Array.from(pos.b), side: pos.side as 1 | -1, castle: pos.castle, ep: pos.ep, half: pos.half, full: pos.full };
}

function clearCastle(castle: number, sq: number): number {
  if (sq === 7) return castle & ~1;
  if (sq === 0) return castle & ~2;
  if (sq === 119) return castle & ~4;
  if (sq === 112) return castle & ~8;
  if (sq === 4) return castle & ~3;
  if (sq === 116) return castle & ~12;
  return castle;
}

export function attacked(board: Int8Array, sq: number, by: number): boolean {
  for (const df of [-1, 1]) {
    const from = sq - by * 16 + df;
    if ((from & 0x88) === 0 && board[from] === by) return true;
  }
  for (const d of KNIGHT) {
    const from = sq + d;
    if ((from & 0x88) === 0 && board[from] === by * 2) return true;
  }
  for (const d of KING) {
    const from = sq + d;
    if ((from & 0x88) === 0 && board[from] === by * 6) return true;
  }
  for (const d of BISHOP) {
    let to = sq + d;
    while ((to & 0x88) === 0) {
      const piece = board[to];
      if (piece) {
        if (piece === by * 3 || piece === by * 5) return true;
        break;
      }
      to += d;
    }
  }
  for (const d of ROOK) {
    let to = sq + d;
    while ((to & 0x88) === 0) {
      const piece = board[to];
      if (piece) {
        if (piece === by * 4 || piece === by * 5) return true;
        break;
      }
      to += d;
    }
  }
  return false;
}

function kingAt(board: Int8Array, side: number): number {
  const king = side * 6;
  for (const sq of SQUARES) if (board[sq] === king) return sq;
  return -1;
}

function apply(pos: Pos, move: ChessMove): Undo {
  const undo: Undo = {
    capture: pos.b[move.to],
    capSq: move.to,
    castle: pos.castle,
    ep: pos.ep,
    half: pos.half,
    full: pos.full,
    piece: pos.b[move.from],
    rookFrom: -1,
    rookTo: -1,
  };
  const piece = undo.piece;
  pos.b[move.from] = 0;
  if (Math.abs(piece) === 1 && move.to === pos.ep && pos.ep >= 0) {
    undo.capSq = pos.side > 0 ? move.to - 16 : move.to + 16;
    undo.capture = pos.b[undo.capSq];
    pos.b[undo.capSq] = 0;
  }
  pos.b[move.to] = move.promo ? move.promo * pos.side : piece;
  if (Math.abs(piece) === 6 && Math.abs((move.to & 7) - (move.from & 7)) === 2) {
    undo.rookFrom = (move.to & 7) === 6 ? move.from + 3 : move.from - 4;
    undo.rookTo = (move.to & 7) === 6 ? move.from + 1 : move.from - 1;
    pos.b[undo.rookTo] = pos.b[undo.rookFrom];
    pos.b[undo.rookFrom] = 0;
  }
  pos.castle = clearCastle(clearCastle(pos.castle, move.from), undo.capSq);
  pos.ep = Math.abs(piece) === 1 && Math.abs(move.to - move.from) === 32 ? (move.from + move.to) >> 1 : -1;
  pos.half = Math.abs(piece) === 1 || undo.capture ? 0 : pos.half + 1;
  if (pos.side < 0) pos.full += 1;
  pos.side = -pos.side;
  return undo;
}

function unmake(pos: Pos, move: ChessMove, undo: Undo) {
  pos.side = -pos.side;
  pos.castle = undo.castle;
  pos.ep = undo.ep;
  pos.half = undo.half;
  pos.full = undo.full;
  if (undo.rookFrom >= 0) {
    pos.b[undo.rookFrom] = pos.b[undo.rookTo];
    pos.b[undo.rookTo] = 0;
  }
  pos.b[move.from] = undo.piece;
  pos.b[move.to] = undo.capSq === move.to ? undo.capture : 0;
  if (undo.capSq !== move.to) pos.b[undo.capSq] = undo.capture;
}

function pushPawn(pos: Pos, out: ChessMove[], from: number, to: number, capture: boolean) {
  if (to & 0x88) return;
  const dest = pos.b[to];
  if (capture) {
    const epOk = to === pos.ep && pos.ep >= 0;
    if (!epOk && (dest === 0 || dest * pos.side > 0)) return;
  } else if (dest) return;
  if ((to >> 4) === (pos.side > 0 ? 7 : 0)) {
    out.push({ from, to, promo: 5 }, { from, to, promo: 2 }, { from, to, promo: 4 }, { from, to, promo: 3 });
    return;
  }
  out.push({ from, to, promo: 0 });
}

function pseudo(pos: Pos): ChessMove[] {
  const out: ChessMove[] = [];
  const dir = pos.side * 16;
  for (const from of SQUARES) {
    const piece = pos.b[from];
    if (piece * pos.side <= 0) continue;
    const abs = Math.abs(piece);
    if (abs === 1) {
      pushPawn(pos, out, from, from + dir, false);
      if ((from >> 4) === (pos.side > 0 ? 1 : 6) && pos.b[from + dir] === 0) pushPawn(pos, out, from, from + dir * 2, false);
      pushPawn(pos, out, from, from + dir - 1, true);
      pushPawn(pos, out, from, from + dir + 1, true);
    } else if (abs === 2) {
      for (const d of KNIGHT) {
        const to = from + d;
        if ((to & 0x88) === 0 && pos.b[to] * pos.side <= 0) out.push({ from, to, promo: 0 });
      }
    } else if (abs === 6) {
      for (const d of KING) {
        const to = from + d;
        if ((to & 0x88) === 0 && pos.b[to] * pos.side <= 0) out.push({ from, to, promo: 0 });
      }
    } else {
      const dirs = abs === 3 ? BISHOP : abs === 4 ? ROOK : KING;
      for (const d of dirs) {
        let to = from + d;
        while ((to & 0x88) === 0) {
          if (pos.b[to] * pos.side > 0) break;
          out.push({ from, to, promo: 0 });
          if (pos.b[to]) break;
          to += d;
        }
      }
    }
  }
  const castle = (bit: number, kingTo: number, empty: number[], pass: number[]) => {
    if ((pos.castle & bit) === 0) return;
    if (empty.some((sq) => pos.b[sq])) return;
    if (pass.some((sq) => attacked(pos.b, sq, -pos.side))) return;
    out.push({ from: pass[0], to: kingTo, promo: 0 });
  };
  if (pos.side > 0) {
    castle(1, 6, [5, 6], [4, 5, 6]);
    castle(2, 2, [1, 2, 3], [4, 3, 2]);
  } else {
    castle(4, 118, [117, 118], [116, 117, 118]);
    castle(8, 114, [113, 114, 115], [116, 115, 114]);
  }
  return out;
}

function inCheck(pos: Pos): boolean {
  const king = kingAt(pos.b, pos.side);
  return king < 0 || attacked(pos.b, king, -pos.side);
}

export function legalChess(state: ChessState): ChessMove[] {
  const pos = load(state);
  return legal(pos);
}

function legal(pos: Pos): ChessMove[] {
  const out: ChessMove[] = [];
  for (const move of pseudo(pos)) {
    const undo = apply(pos, move);
    const king = kingAt(pos.b, -pos.side);
    const bad = king < 0 || attacked(pos.b, king, pos.side);
    unmake(pos, move, undo);
    if (!bad) out.push(move);
  }
  return out;
}

function evaluate(pos: Pos): number {
  let queens = 0;
  let score = 0;
  let whiteBishops = 0;
  let blackBishops = 0;
  for (const sq of SQUARES) if (Math.abs(pos.b[sq]) === 5) queens += 1;
  for (const sq of SQUARES) {
    const piece = pos.b[sq];
    if (!piece) continue;
    const abs = Math.abs(piece);
    const idx = piece > 0 ? (7 - (sq >> 4)) * 8 + (sq & 7) : (sq >> 4) * 8 + (sq & 7);
    const table = abs === 6 && queens === 0 ? KING_END : PST[abs];
    score += (VAL[abs] + table[idx]) * Math.sign(piece);
    if (piece === 3) whiteBishops += 1;
    if (piece === -3) blackBishops += 1;
  }
  if (whiteBishops >= 2) score += 30;
  if (blackBishops >= 2) score -= 30;
  return score * pos.side;
}

function tactical(pos: Pos, move: ChessMove): boolean {
  if (move.promo) return true;
  if (pos.b[move.to]) return true;
  return Math.abs(pos.b[move.from]) === 1 && move.to === pos.ep;
}

export function playChess(state: ChessState, move: ChessMove): ChessState {
  const pos = load(state);
  apply(pos, move);
  return dump(pos);
}

export function chessKey(state: ChessState): string {
  let key = `${state.side}|${state.castle}|${state.ep}|`;
  for (const sq of SQUARES) if (state.board[sq]) key += `${sq}:${state.board[sq]},`;
  return key;
}

export function chessStatus(state: ChessState, repeats: number): { over: boolean; text: string } {
  const moves = legalChess(state);
  const name = state.side > 0 ? "Trắng" : "Đen";
  const other = state.side > 0 ? "Đen" : "Trắng";
  if (!moves.length) {
    const pos = load(state);
    if (inCheck(pos)) return { over: true, text: `Chiếu hết · ${other} thắng` };
    return { over: true, text: "Hòa · hết nước" };
  }
  if (repeats >= 3) return { over: true, text: "Hòa · lặp thế 3 lần" };
  if (state.half >= 100) return { over: true, text: "Hòa · 50 nước không ăn" };
  const rest: number[] = [];
  for (const sq of SQUARES) {
    const abs = Math.abs(state.board[sq]);
    if (abs && abs !== 6) rest.push(abs);
  }
  if (rest.length === 0 || (rest.length === 1 && (rest[0] === 2 || rest[0] === 3))) return { over: true, text: "Hòa · không đủ lực" };
  const pos = load(state);
  if (inCheck(pos)) return { over: false, text: `${name} đang bị chiếu` };
  return { over: false, text: `${name} đi` };
}

export function perftChess(state: ChessState, depth: number): number {
  if (depth === 0) return 1;
  const pos = load(state);
  let nodes = 0;
  for (const move of legal(pos)) {
    const undo = apply(pos, move);
    nodes += walk(pos, depth - 1);
    unmake(pos, move, undo);
  }
  return nodes;
}

function walk(pos: Pos, depth: number): number {
  if (depth === 0) return 1;
  let nodes = 0;
  for (const move of legal(pos)) {
    const undo = apply(pos, move);
    nodes += depth === 1 ? 1 : walk(pos, depth - 1);
    unmake(pos, move, undo);
  }
  return nodes;
}

export function startChess(): ChessState {
  const board = Array<number>(128).fill(0);
  const back = [4, 2, 3, 5, 6, 3, 2, 4];
  for (let file = 0; file < 8; file += 1) {
    board[file] = back[file];
    board[16 + file] = 1;
    board[96 + file] = -1;
    board[112 + file] = -back[file];
  }
  return { board, side: 1, castle: 15, ep: -1, half: 0, full: 1 };
}

export function emptyChess(): ChessState {
  return { board: Array<number>(128).fill(0), side: 1, castle: 0, ep: -1, half: 0, full: 1 };
}

export function thinkChess(state: ChessState, ms: number): ChessMove | null {
  const pos = load(state);
  const root = legal(pos);
  if (!root.length) return null;
  const killer: ChessMove[] = Array.from({ length: 48 }, () => ({ from: -1, to: -1, promo: 0 }));
  const deadline = Date.now() + ms;
  let best = root[0];
  let stop = false;
  const rank = (move: ChessMove, ply: number) => {
    let score = Math.abs(pos.b[move.to]) * 16 - Math.abs(pos.b[move.from]);
    if (move.promo === 5) score += 40;
    else if (move.promo) score += 12;
    if (killer[ply]?.from === move.from && killer[ply]?.to === move.to) score += 10;
    return score;
  };
  const negamax = (depth: number, alpha: number, beta: number, ply: number): number => {
    if (Date.now() > deadline) {
      stop = true;
      return 0;
    }
    if (pos.half >= 100) return 0;
    if (depth <= 0) return quiesce(alpha, beta, ply);
    const moves = legal(pos).sort((a, b) => rank(b, ply) - rank(a, ply));
    if (!moves.length) return inCheck(pos) ? -MATE + ply : 0;
    let bestScore = -MATE;
    for (const move of moves) {
      const undo = apply(pos, move);
      const score = -negamax(depth - 1, -beta, -alpha, ply + 1);
      unmake(pos, move, undo);
      if (stop) return 0;
      if (score > bestScore) bestScore = score;
      if (score > alpha) alpha = score;
      if (alpha >= beta) {
        if (!pos.b[move.to]) killer[ply] = move;
        break;
      }
    }
    return bestScore;
  };
  const quiesce = (alpha: number, beta: number, ply: number): number => {
    if (Date.now() > deadline || ply > 10) {
      if (Date.now() > deadline) stop = true;
      return evaluate(pos);
    }
    const stand = evaluate(pos);
    if (stand >= beta) return stand;
    if (stand > alpha) alpha = stand;
    for (const move of legal(pos)) {
      if (!tactical(pos, move)) continue;
      const undo = apply(pos, move);
      const score = -quiesce(-beta, -alpha, ply + 1);
      unmake(pos, move, undo);
      if (stop) return alpha;
      if (score >= beta) return score;
      if (score > alpha) alpha = score;
    }
    return alpha;
  };
  for (let depth = 1; depth <= 6 && !stop; depth += 1) {
    let local = best;
    let localScore = -MATE;
    const ordered = [best, ...root.filter((move) => move.from !== best.from || move.to !== best.to || move.promo !== best.promo)];
    let finished = true;
    for (const move of ordered) {
      if (Date.now() > deadline) {
        finished = false;
        break;
      }
      const undo = apply(pos, move);
      const score = -negamax(depth - 1, -MATE, MATE, 1);
      unmake(pos, move, undo);
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
