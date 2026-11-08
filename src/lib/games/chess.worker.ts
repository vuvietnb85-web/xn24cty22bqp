import { thinkChess, type ChessState } from "./chess";

addEventListener("message", (event: MessageEvent<{ id: number; state: ChessState; ms: number }>) => {
  const move = thinkChess(event.data.state, event.data.ms);
  postMessage({ id: event.data.id, move });
});
