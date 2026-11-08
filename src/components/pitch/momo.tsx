import { useEffect, useRef, useState } from "react";

const PHONE = "0988960419";

export function MomoSticker({ onDone }: { onDone: () => void }) {
  const [copied, setCopied] = useState(false);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const id = window.setTimeout(() => done.current(), 8000);
    return () => window.clearTimeout(id);
  }, []);

  const copy = () => {
    void navigator.clipboard?.writeText(PHONE).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 900);
      },
      () => setCopied(false),
    );
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Momo ${PHONE}`}
      className="momo-blink fixed bottom-24 left-2 z-50 w-[4.6rem] rounded-2xl border border-[#ffd1ea] bg-[#a50064] px-1 py-1.5 text-center shadow-lg"
    >
      <span className="momo-spark absolute -top-1 left-1 text-[10px] text-[#ffe27a]">✦</span>
      <span className="momo-spark absolute -top-1 right-1 text-[10px] text-white" style={{ animationDelay: "0.4s" }}>
        ✦
      </span>
      <span className="momo-spark absolute -right-1 bottom-2 text-[9px] text-[#ffe27a]" style={{ animationDelay: "0.8s" }}>
        ✦
      </span>
      <span className="font-display block text-[11px] tracking-widest text-white">{copied ? "ĐÃ CHÉP" : "MOMO"}</span>
      <span className="block text-[9px] font-semibold leading-tight text-[#ffe7f4]">{PHONE}</span>
    </button>
  );
}