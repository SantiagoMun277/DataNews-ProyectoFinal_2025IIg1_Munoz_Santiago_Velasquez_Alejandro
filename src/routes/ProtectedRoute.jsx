import { Navigate } from "react-router-dom";
import useSession from "../hooks/useSession";

export default function ProtectedRoute({ allow = [], children }){
  const { isLogged, role } = useSession();
  if (!isLogged) return <Navigate to="/login" replace />;
  if (allow.length && !allow.includes(role)) return <Navigate to="/" replace />;
  return children;
}
