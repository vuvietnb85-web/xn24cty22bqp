import { thinkXq, type XqState } from "./xiangqi";

addEventListener("message", (event: MessageEvent<{ id: number; state: XqState; ms: number }>) => {
  const move = thinkXq(event.data.state, event.data.ms);
  postMessage({ id: event.data.id, move });
});
