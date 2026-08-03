import { useEffect } from "react";

/**
 * useSwipe — rileva swipe orizzontali su touch screen.
 *
 * Opzioni:
 * - onSwipeLeft:  richiamata quando lo swipe va verso sinistra (dx < 0)
 * - onSwipeRight: richiamata quando lo swipe va verso destra (dx > 0)
 * - threshold:    distanza minima in px per considerarlo swipe (default 60)
 * - edge:          se > 0, il gesto deve iniziare entro `edge` px dal bordo sinistro
 *                 (utile per aprire un drawer dalla soglia)
 * - disabled:      disabilita il rilevamento
 * - guardInteractive: se true (default), ignora i gesti che iniziano su elementi
 *                 interattivi (link, bottoni, input) o marcati [data-no-swipe],
 *                 così da non interferire con tocchi/tap normali
 */
export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  threshold = 60,
  edge = 0,
  disabled = false,
  guardInteractive = true,
}) {
  useEffect(() => {
    if (disabled) return;
    let startX = 0;
    let startY = 0;
    let tracking = false;

    const onStart = (e) => {
      if (e.touches.length > 1) {
        tracking = false;
        return;
      }
      const t = e.touches[0];
      if (edge > 0 && t.clientX > edge) {
        tracking = false;
        return;
      }
      if (guardInteractive && edge === 0) {
        const el = e.target;
        if (el && el.closest && el.closest("a,button,input,textarea,select,label,[data-no-swipe]")) {
          tracking = false;
          return;
        }
      }
      startX = t.clientX;
      startY = t.clientY;
      tracking = true;
    };

    const onEnd = (e) => {
      if (!tracking) return;
      tracking = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (Math.abs(dx) > threshold && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx > 0) onSwipeRight && onSwipeRight();
        else onSwipeLeft && onSwipeLeft();
      }
    };

    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchend", onEnd);
    };
  }, [onSwipeLeft, onSwipeRight, threshold, edge, disabled, guardInteractive]);
}