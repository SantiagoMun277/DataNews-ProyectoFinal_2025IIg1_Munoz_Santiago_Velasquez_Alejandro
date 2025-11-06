import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Blurea el elemento activo y opcionalmente hace scroll al top
 * en cada cambio de ruta.
 */
export default function FocusReset({ scrollToTop = true }) {
  const loc = useLocation();

  useEffect(() => {
    // Quita el foco de lo que sea que quedó activo (links del header, etc.)
    const el = document.activeElement;
    if (el && typeof el.blur === "function") el.blur();

    // (opcional) vuelve al inicio de la página
    if (scrollToTop) {
      // usa RAF para que ocurra después del render
      requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
    }
  }, [loc.key]); // se dispara en cada navegación

  return null;
}
