import { useEffect, useState } from "react";

/** `true` quando a página foi rolada mais que `offset` px a partir do topo. */
export function useScrolled(offset = 8) {
  const [scrolled, setScrolled] = useState(() => window.scrollY > offset);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > offset);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [offset]);

  return scrolled;
}
