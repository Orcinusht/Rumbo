import { useEffect } from 'react';

// Module-level counter so stacked overlays (e.g. the AI suggestion sheet
// opened on top of the goal wizard) only unlock once the last one closes.
let lockCount = 0;
let savedScrollY = 0;

// Pins the background in place while an overlay is open. A plain
// `overflow: hidden` on the body isn't enough on mobile Safari/Chrome —
// touches starting on a fixed-position overlay can still rubber-band the
// page behind it. Freezing body position (and restoring scroll on unlock)
// is the reliable cross-browser fix.
export function useScrollLock() {
  useEffect(() => {
    if (lockCount === 0) {
      savedScrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${savedScrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
    }
    lockCount += 1;
    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        window.scrollTo(0, savedScrollY);
      }
    };
  }, []);
}
