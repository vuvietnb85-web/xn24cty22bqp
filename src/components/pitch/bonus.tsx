import { useEffect } from "react";
import { createPortal } from "react-dom";

const CLIENT = "BAAIfuQli_a3Qud-8CIRqCRCeohqtiW29_i2Txx2rQM35pqMc-pbCIZX6L8tx1zbyOj_vp8AUE_dpSqOhc";
const BUTTON = "T7AZ748Y27248";
const BOX = "paypal-container-T7AZ748Y27248";

declare global {
  interface Window {
    paypal?: {
      HostedButtons: (opts: { hostedButtonId: string }) => { render: (selector: string) => Promise<void> };
    };
  }
}

export function PaypalBonus({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    let dead = false;
    const paint = () => {
      if (dead || !window.paypal?.HostedButtons) return;
      const box = document.getElementById(BOX);
      if (!box) return;
      box.replaceChildren();
      void window.paypal.HostedButtons({ hostedButtonId: BUTTON }).render(`#${BOX}`);
    };
    if (window.paypal?.HostedButtons) {
      paint();
      return () => {
        dead = true;
      };
    }
    let script = document.getElementById("paypal-sdk-hosted") as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = "paypal-sdk-hosted";
      script.async = true;
      script.src = `https://www.paypal.com/sdk/js?client-id=${CLIENT}&components=hosted-buttons&disable-funding=venmo&currency=USD`;
      document.body.appendChild(script);
    }
    script.addEventListener("load", paint);
    return () => {
      dead = true;
      script?.removeEventListener("load", paint);
    };
  }, []);

  return createPortal(
    <div className="fixed inset-x-0 bottom-0 z-[42] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto w-full max-w-sm rounded-2xl border-2 border-gold bg-surface p-3 shadow-[0_-8px_28px_rgba(0,0,0,.45)]">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-display text-2xl tracking-widest text-gold">BONUS</p>
          <button type="button" aria-label="Đóng bonus" onClick={onClose} className="grid h-8 w-8 place-items-center text-xl text-gold">
            ×
          </button>
        </div>
        <div id={BOX} className="min-h-11" />
      </div>
    </div>,
    document.body,
  );
}
