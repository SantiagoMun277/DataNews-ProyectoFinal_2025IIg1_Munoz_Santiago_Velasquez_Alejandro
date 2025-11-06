import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "./FirebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=> {
    const unsub = onAuthStateChanged(auth, async (u)=>{
      setUser(u);
      if (u) {
        const snap = await getDoc(doc(db, "usuarios", u.uid));
        setProfile(snap.exists() ? snap.data() : null);
      } else setProfile(null);
      setLoading(false);
    });
    return unsub;
  }, []);

  const logout = () => signOut(auth);
  return <Ctx.Provider value={{ user, profile, loading, logout }}>{children}</Ctx.Provider>;
}
