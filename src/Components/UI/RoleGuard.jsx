import { useAuth } from "../../FirebaseConfig/AuthContext";
export default function RoleGuard({ roles = [], children }) {
  const { profile } = useAuth();
  if (!profile) return null;
  return roles.includes(profile.rol) ? children : null;
}
