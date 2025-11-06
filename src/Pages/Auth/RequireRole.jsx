// src/components/auth/RequireRole.jsx
import { Navigate, useLocation } from "react-router-dom";

/**
 * Protege rutas por rol.
 * roles: string | string[]  (p.ej. 'editor' o ['editor','admin'])
 */
export default function RequireRole({ roles, children }) {
  const loc = useLocation();
  const session = JSON.parse(localStorage.getItem("dn_session") || "null");

  // normaliza
  const need = Array.isArray(roles) ? roles : [roles];
  const ok =
    !!session &&
    !!session.rol &&
    need.map(r => String(r).toLowerCase()).includes(String(session.rol).toLowerCase());

  return ok ? children : <Navigate to="/login" state={{ from: loc }} replace />;
}
