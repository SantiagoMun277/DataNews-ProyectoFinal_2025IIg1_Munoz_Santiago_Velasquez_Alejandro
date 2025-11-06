import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "../FirebaseConfig/FirebaseConfig";

// Pings Firestore by reading 1 doc from 'noticias'.
// Returns { ok:true, count } or { ok:false, code, message }.
export async function pingFirestore() {
  try {
    const q = query(collection(db, "noticias"), limit(1));
    const snap = await getDocs(q);
    return { ok: true, count: snap.size };
  } catch (e) {
    console.error("[Diagnostics] Firestore ping error:", e);
    return { ok: false, code: e.code || "unknown", message: e.message || String(e) };
  }
}

