import { Navigate } from "react-router-dom";
import useSession from "../../hooks/useSession";

export default function ProtectedRoute({ children, allow = [] }) {
  const s = useSession();
  if (!s?.uid) return <Navigate to="/login" replace />;
  if (allow.length && !allow.includes(s.rol)) {
    // si no tiene el rol permitido, mándalo al inicio
    return <Navigate to="/" replace />;
  }
  return children;
}
