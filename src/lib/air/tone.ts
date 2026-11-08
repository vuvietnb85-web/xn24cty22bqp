type Chain = {
  ctx: AudioContext;
  makeup: GainNode;
  shelves: { node: BiquadFilterNode; on: number }[];
  comp: DynamicsCompressorNode;
  limit: DynamicsCompressorNode;
};

let chain: Chain | null = null;
let bound: HTMLMediaElement | null = null;

function build(el: HTMLMediaElement): Chain {
  const ctx = new AudioContext();
  const source = ctx.createMediaElementSource(el);
  const specs: { type: BiquadFilterType; f: number; g: number; q?: number }[] = [
    { type: "highpass", f: 70, g: 0 },
    { type: "lowshelf", f: 140, g: 3.2 },
    { type: "peaking", f: 280, g: 1.4, q: 0.8 },
    { type: "peaking", f: 2500, g: 2.6, q: 0.9 },
    { type: "peaking", f: 6800, g: -2.2, q: 1.1 },
    { type: "highshelf", f: 10500, g: 1 },
  ];
  const shelves = specs.map((spec) => {
    const node = ctx.createBiquadFilter();
    node.type = spec.type;
    node.frequency.value = spec.f;
    node.gain.value = spec.g;
    if (spec.q) node.Q.value = spec.q;
    return { node, on: spec.g };
  });
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -20;
  comp.knee.value = 12;
  comp.ratio.value = 3.2;
  comp.attack.value = 0.01;
  comp.release.value = 0.24;
  const makeup = ctx.createGain();
  makeup.gain.value = 1.2;
  const limit = ctx.createDynamicsCompressor();
  limit.threshold.value = -1.5;
  limit.knee.value = 0;
  limit.ratio.value = 20;
  limit.attack.value = 0.003;
  limit.release.value = 0.08;
  let head: AudioNode = source;
  for (const shelf of shelves) {
    head.connect(shelf.node);
    head = shelf.node;
  }
  head.connect(comp).connect(makeup).connect(limit).connect(ctx.destination);
  return { ctx, makeup, shelves, comp, limit };
}

export async function holdTone(): Promise<void> {
  if (!chain || chain.ctx.state !== "suspended") return;
  try {
    await chain.ctx.resume();
  } catch {
    /* máy khóa có thể giữ im cho đến khi mở màn hình */
  }
}

export async function engageTone(el: HTMLMediaElement, on: boolean): Promise<void> {
  if (bound !== el) {
    chain = build(el);
    bound = el;
  }
  if (!chain) return;
  if (chain.ctx.state === "suspended") await chain.ctx.resume();
  chain.makeup.gain.value = on ? 1.2 : 1;
  for (const shelf of chain.shelves) {
    if (shelf.node.type === "highpass") continue;
    shelf.node.gain.value = on ? shelf.on : 0;
  }
  chain.comp.ratio.value = on ? 3.2 : 1;
  chain.comp.threshold.value = on ? -20 : 0;
  chain.limit.ratio.value = on ? 20 : 1;
  chain.limit.threshold.value = on ? -1.5 : 0;
}
