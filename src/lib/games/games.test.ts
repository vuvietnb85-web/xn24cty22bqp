import assert from "node:assert/strict";
import test from "node:test";
import { chessStatus, emptyChess, legalChess, perftChess, playChess, startChess, thinkChess, type ChessState } from "./chess.ts";
import { clueCount, easyBySingles, generateHard } from "./sudoku.ts";
import { legalXq, perftXq, playXq, startXq, xqStatus } from "./xiangqi.ts";

test("cờ vua: khai cuộc đúng số nước", () => {
  const start = startChess();
  assert.equal(perftChess(start, 1), 20);
  assert.equal(perftChess(start, 2), 400);
  assert.equal(perftChess(start, 3), 8902);
});

test("cờ vua: nhập thành, bắt tốt qua đường, chiếu hết một nước", () => {
  const castle = emptyChess();
  castle.board[4] = 6;
  castle.board[7] = 4;
  castle.board[0] = 4;
  castle.castle = 3;
  const moves = legalChess(castle).map((move) => move.to);
  assert.ok(moves.includes(6));
  assert.ok(moves.includes(2));
  castle.board[116] = -4;
  castle.board[117] = 0;
  const blocked = legalChess(castle).map((move) => move.to);
  assert.equal(blocked.includes(6), false);

  const ep = emptyChess();
  ep.board[4] = 6;
  ep.board[116] = -6;
  ep.board[4 * 16 + 4] = 1;
  ep.board[6 * 16 + 3] = -1;
  ep.side = -1;
  const after = playChess(ep, { from: 6 * 16 + 3, to: 4 * 16 + 3, promo: 0 });
  const takes = legalChess(after).find((move) => move.to === 5 * 16 + 3 && move.from === 4 * 16 + 4);
  assert.ok(takes);
  const done = playChess(after, takes);
  assert.equal(done.board[4 * 16 + 3], 0);
  assert.equal(done.board[5 * 16 + 3], 1);

  const mate: ChessState = emptyChess();
  mate.board[5 * 16 + 6] = 6;
  mate.board[5 * 16 + 7] = 5;
  mate.board[7 * 16 + 7] = -6;
  const hit = thinkChess(mate, 200);
  assert.ok(hit);
  const finished = chessStatus(playChess(mate, hit), 1);
  assert.equal(finished.text, "Chiếu hết · Trắng thắng");
});

test("cờ tướng: khai cuộc 44 nước và luật chặn", () => {
  const start = startXq();
  assert.equal(perftXq(start, 1), 44);
  assert.equal(perftXq(start, 2), 1920);
  const board = start.board.slice();
  board[10] = 7;
  const blocked = { board, side: 1 as const, half: 0 };
  assert.equal(legalXq(blocked).filter((move) => move.from === 1).length, 0);

  const face = Array<number>(90).fill(0);
  face[4] = 5;
  face[85] = -5;
  face[40] = 1;
  const state = { board: face, side: 1 as const, half: 0 };
  assert.equal(
    legalXq(state).some((move) => move.from === 40 && move.to % 9 !== 4),
    false,
  );
  assert.equal(xqStatus(playXq(start, legalXq(start)[0]), 1).over, false);
});

test("sudoku siêu khó có một nghiệm và không giải bằng nước đơn", () => {
  const pack = generateHard();
  const clues = clueCount(pack.puzzle);
  assert.equal(easyBySingles(pack.puzzle), false);
  assert.equal(pack.puzzle.filter((cell, index) => cell !== 0 && cell !== pack.solution[index]).length, 0);
  const grid = pack.puzzle.slice();
  const solve = (index: number): boolean => {
    if (index === 81) return true;
    if (grid[index]) return solve(index + 1);
    for (let digit = 1; digit <= 9; digit += 1) {
      const row = Math.floor(index / 9);
      const col = index % 9;
      let ok = true;
      for (let i = 0; i < 9; i += 1) {
        if (grid[row * 9 + i] === digit || grid[i * 9 + col] === digit) ok = false;
      }
      const start = Math.floor(row / 3) * 27 + Math.floor(col / 3) * 3;
      for (let r = 0; r < 3; r += 1) for (let c = 0; c < 3; c += 1) if (grid[start + r * 9 + c] === digit) ok = false;
      if (!ok) continue;
      grid[index] = digit;
      if (solve(index + 1)) return true;
      grid[index] = 0;
    }
    return false;
  };
  assert.equal(solve(0), true);
  assert.deepEqual(grid, pack.solution);
});
