import { Navigate } from "react-router-dom";
import useSession from "../hooks/useSession";

export default function ProtectedRoute({ allow = [], children }){
  const session = useSession();

  // Derivar estado de sesión y rol desde el objeto de sesión persistido
  const isLogged = !!(session && session.uid);
  const role = String(session?.rol || "").toLowerCase();
  const allowCanon = Array.isArray(allow)
    ? allow.map(r => String(r || "").toLowerCase())
    : [];

  if (!isLogged) return <Navigate to="/login" replace />;
  if (allowCanon.length && !allowCanon.includes(role)) return <Navigate to="/" replace />;
  return children;
}
