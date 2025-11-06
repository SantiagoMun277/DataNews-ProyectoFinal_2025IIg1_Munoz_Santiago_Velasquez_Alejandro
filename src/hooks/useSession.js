// Lee/escribe la mini-sesión que guardas en localStorage ("dn_session")
import { useMemo } from "react";

export function getSession() {
  try {
    const raw = localStorage.getItem("dn_session");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
export function setSession(s) {
  localStorage.setItem("dn_session", JSON.stringify(s || {}));
}
export function clearSession() {
  localStorage.removeItem("dn_session");
}

export default function useSession() {
  const session = useMemo(() => getSession(), []);
  return session; // { uid, email, displayName, rol, activo }
}
