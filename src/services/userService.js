// src/services/userService.js
import { db } from "../FirebaseConfig/FirebaseConfig";
import {
  collection, doc, getDocs, updateDoc, deleteDoc,
  orderBy, limit, startAfter, query
} from "firebase/firestore";

const COL = "usuarios";
const colRef = collection(db, COL);

function norm(d){
  const data = d.data();
  return { id: d.id, ...data };
}
function ts(v){
  try{
    if(!v) return 0;
    if (typeof v?.toMillis === "function") return v.toMillis();
    const n = Date.parse(v);
    return isNaN(n) ? 0 : n;
  }catch{ return 0; }
}

export async function listAllUsers(top = 2000){
  const out = [];
  let last = null;
  const CHUNK = 500;

  while(out.length < top){
    const qy = last
      ? query(colRef, orderBy("__name__"), startAfter(last), limit(Math.min(CHUNK, top - out.length)))
      : query(colRef, orderBy("__name__"), limit(Math.min(CHUNK, top)));

    const s = await getDocs(qy);
    if (s.empty) break;
    out.push(...s.docs.map(norm));
    last = s.docs[s.docs.length - 1];
  }

  // ordenar por createdAt si existe
  out.sort((a,b)=> ts(b.createdAt) - ts(a.createdAt));
  return out;
}

export async function setUserRole(uid, newRole){
  await updateDoc(doc(db, COL, uid), { rol: String(newRole||"reportero") });
  return true;
}

export async function setUserActive(uid, active){
  await updateDoc(doc(db, COL, uid), { activo: !!active });
  return true;
}

export async function removeUser(uid){
  await deleteDoc(doc(db, COL, uid));
  return true;
}
