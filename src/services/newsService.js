


// // src/services/newsService.js
// import { db } from "../FirebaseConfig/FirebaseConfig";
// import {
//   collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
//   query, where, limit, orderBy, serverTimestamp, startAfter // 👈 agregado startAfter
// } from "firebase/firestore";

// const COL = "noticias";
// const colRef = collection(db, COL);

// /* -----------------------------------------------------------
//    Helpers (compatibilidad de estados/fechas)
// ----------------------------------------------------------- */
// const EST_CANO = ["borrador","edicion","terminada","publicado","desactivada"];
// const MAPEOS = {
//   "Borrador":"borrador",
//   "Edición":"edicion", "Edicion":"edicion",
//   "Terminada":"terminada", "Terminado":"terminada",
//   "Publicado":"publicado", "Publicada":"publicado",
//   "Desactivado":"desactivada", "Desactivada":"desactivada"
// };

// function canonEstado(v){
//   if(!v) return "edicion";
//   const s = String(v).trim();
//   const low = s.toLowerCase();
//   if(EST_CANO.includes(low)) return low;
//   if(MAPEOS[s]) return MAPEOS[s];
//   return low;
// }

// function normalizeDoc(d){
//   const data = d.data ? d.data() : d;
//   return {
//     ...data,
//     id: d.id ?? data.id,
//     estado: canonEstado(data.estado),
//   };
// }

// function tsOrderVal(x){
//   try{
//     if(!x) return 0;
//     if(typeof x === "number") return x;
//     if(x.toMillis) return x.toMillis();
//     const n = Date.parse(x);
//     return isNaN(n) ? 0 : n;
//   }catch{ return 0; }
// }

// /* ============================================================
//    LECTURAS (público)
//    ============================================================ */
// export async function listPublishedLatest(n = 20){
//   try{
//     const qy = query(
//       colRef,
//       where("estado","in",["publicado","Publicado"]),
//       orderBy("createdAt","desc"),
//       limit(n)
//     );
//     const s = await getDocs(qy);
//     return s.docs.map(d => normalizeDoc({id:d.id, ...d.data()}));
//   }catch{
//     const s = await getDocs(query(colRef, limit(n)));
//     return s.docs
//       .map(d => normalizeDoc({id:d.id, ...d.data()}))
//       .filter(r => r.estado === "publicado");
//   }
// }

// export async function listPublishedBySection(slug, n = 6){
//   try{
//     const qy = query(
//       colRef,
//       where("categoriaSlug","==", slug),
//       where("estado","in",["publicado","Publicado"]),
//       orderBy("createdAt","desc"),
//       limit(n)
//     );
//     const s = await getDocs(qy);
//     return s.docs.map(d => normalizeDoc({id:d.id, ...d.data()}));
//   }catch{
//     const s = await getDocs(query(colRef, where("categoriaSlug","==", slug), limit(n)));
//     return s.docs
//       .map(d => normalizeDoc({id:d.id, ...d.data()}))
//       .filter(r => r.estado === "publicado")
//       .sort((a,b)=>tsOrderVal(b.createdAt) - tsOrderVal(a.createdAt))
//       .slice(0,n);
//   }
// }

// export async function getNewsById(id){
//   const snap = await getDoc(doc(db, COL, id));
//   return snap.exists() ? normalizeDoc({ id:snap.id, ...snap.data() }) : null;
// }

// export async function listLatest(n = 20){
//   try{
//     const s = await getDocs(query(colRef, orderBy("createdAt","desc"), limit(n)));
//     return s.docs.map(d => normalizeDoc({id:d.id, ...d.data()}));
//   }catch{
//     const s = await getDocs(query(colRef, limit(n)));
//     return s.docs
//       .map(d => normalizeDoc({id:d.id, ...d.data()}))
//       .sort((a,b)=>tsOrderVal(b.createdAt) - tsOrderVal(a.createdAt));
//   }
// }

// export async function listBySection(slug, n = 20){
//   try{
//     const qy = query(colRef, where("categoriaSlug","==", slug), orderBy("createdAt","desc"), limit(n));
//     const s = await getDocs(qy);
//     return s.docs.map(d => normalizeDoc({id:d.id, ...d.data()}));
//   }catch{
//     const s = await getDocs(query(colRef, where("categoriaSlug","==", slug), limit(n)));
//     return s.docs
//       .map(d => normalizeDoc({id:d.id, ...d.data()}))
//       .sort((a,b)=>tsOrderVal(b.createdAt) - tsOrderVal(a.createdAt));
//   }
// }

// export async function getNews(id){ return getNewsById(id); }

// /* ============================================================
//    UTILIDADES PARA PANEL DEL EDITOR
//    ============================================================ */
// /** Lista para el panel del editor con búsqueda y filtro por estado (si lo pasas). */
// export async function listNews({ q = "", estado = "*", top = 100 } = {}){
//   const conds = [];
//   if(estado !== "*" && estado)
//     conds.push(where("estado","in",[estado, estado[0]?.toUpperCase()+estado.slice(1)]));
//   try{
//     const s = await getDocs(query(colRef, ...conds, orderBy("createdAt","desc"), limit(top)));
//     let rows = s.docs.map(d => normalizeDoc({id:d.id, ...d.data()}));
//     if(q){
//       const qq = q.toLowerCase();
//       rows = rows.filter(r => (r.titulo||"").toLowerCase().includes(qq));
//     }
//     return rows;
//   }catch{
//     const s = await getDocs(query(colRef, ...conds, limit(top)));
//     let rows = s.docs.map(d => normalizeDoc({id:d.id, ...d.data()}));
//     rows.sort((a,b)=>tsOrderVal(b.createdAt) - tsOrderVal(a.createdAt));
//     if(q){
//       const qq = q.toLowerCase();
//       rows = rows.filter(r => (r.titulo||"").toLowerCase().includes(qq));
//     }
//     return rows;
//   }
// }

// /** ✅ Lista general para el Panel del Editor (sin filtrar por estado) con fallback y paginación */
// export async function listAllNews({ onlyMine = null, estados = [], top = 2000 } = {}){
//   const conds = [];
//   if (onlyMine) conds.push(where("autorUid","==", onlyMine));
//   // NO filtramos por estado aquí; el filtro se aplica en la UI.

//   // 1) Intento rápido con createdAt (requiere índice si hay otros where)
//   try {
//     const s = await getDocs(query(colRef, ...conds, orderBy("createdAt","desc"), limit(top)));
//     return s.docs.map(d => normalizeDoc({ id:d.id, ...d.data() }));
//   } catch {
//     // 2) Fallback: pagina por __name__ para traer TODO sin índices adicionales
//     const out = [];
//     let last = null;
//     const CHUNK = 500;
//     while (out.length < top) {
//       const qy = last
//         ? query(colRef, ...conds, orderBy("__name__"), startAfter(last), limit(Math.min(CHUNK, top - out.length)))
//         : query(colRef, ...conds, orderBy("__name__"), limit(Math.min(CHUNK, top)));
//       const s = await getDocs(qy);
//       if (s.empty) break;
//       out.push(...s.docs.map(d => normalizeDoc({ id:d.id, ...d.data() })));
//       last = s.docs[s.docs.length - 1];
//     }
//     // ordena por createdAt si existe, para mantener consistencia visual
//     out.sort((a,b)=>tsOrderVal(b.createdAt) - tsOrderVal(a.createdAt));
//     return out;
//   }
// }

// /** Crear noticia (editor) */
// export async function createNews({ autorUid, autorNombre, ...data }){
//   const now = serverTimestamp();
//   const payload = {
//     ...data,
//     autorUid, autorNombre,
//     estado: canonEstado(data.estado || "edicion"),
//     createdAt: now, updatedAt: now,
//     // compat
//     fechaCreacion: now, fechaActualizacion: now,
//   };
//   const ref = await addDoc(colRef, payload);
//   return { id: ref.id, ...payload };
// }

// /** Editar noticia */
// export async function updateNews(id, data){
//   const now = serverTimestamp();
//   const patch = {
//     ...data,
//     ...(data.estado ? { estado: canonEstado(data.estado) } : {}),
//     updatedAt: now,
//     fechaActualizacion: now,
//   };
//   await updateDoc(doc(db, COL, id), patch);
// }

// /** Cambiar estado (Publicar/Desactivar/etc.) */
// export async function updateStatus(id, nuevoEstado){
//   const now = serverTimestamp();
//   await updateDoc(doc(db, COL, id), {
//     estado: canonEstado(nuevoEstado),
//     updatedAt: now,
//     fechaActualizacion: now,
//   });
// }

// /* ============================================================
//    UTILIDADES PARA PANEL DEL REPORTERO (compat)
//    ============================================================ */
// export async function createDraftNews(payload, user){
//   const now = serverTimestamp();
//   const data = {
//     titulo: (payload.titulo || "").trim(),
//     bajante: (payload.bajante || "").trim(),
//     contenidoHTML: payload.contenidoHTML || "",
//     categoriaSlug: payload.categoriaSlug || "general",
//     imagenUrl: payload.imagenUrl || "",
//     autorUid: payload.autorUid ?? user?.uid ?? null,
//     autorNombre: payload.autorNombre ?? user?.displayName ?? user?.email ?? "Usuario",
//     estado: canonEstado(payload.estado || "edicion"),
//     activo: true,
//     createdAt: payload.createdAt ?? now,
//     updatedAt: payload.updatedAt ?? now,
//     fechaCreacion: now,
//     fechaActualizacion: now,
//   };
//   const ref = await addDoc(colRef, data);
//   return { id: ref.id, ...data };
// }

// export async function listMyNews(uid, top = 100){
//   return listMineForReporter(uid, top);
// }

// export async function listMineForReporter(autorUid, top = 100){
//   if (!autorUid) return [];
//   try {
//     const s = await getDocs(
//       query(colRef, where("autorUid","==", autorUid), orderBy("createdAt","desc"), limit(top))
//     );
//     return s.docs.map(d => normalizeDoc({id:d.id, ...d.data()}));
//   } catch {
//     const s = await getDocs(query(colRef, where("autorUid","==", autorUid), limit(top)));
//     const rows = s.docs.map(d => normalizeDoc({id:d.id, ...d.data()}));
//     rows.sort((a,b)=>tsOrderVal(b.createdAt) - tsOrderVal(a.createdAt));
//     return rows;
//   }
// }

// /** Eliminado suave */
// export async function softDeleteNews(id, uid){
//   const now = serverTimestamp();
//   await updateDoc(doc(db, COL, id), {
//     estado: "desactivada",
//     activo: false,
//     eliminadoPor: uid || null,
//     updatedAt: now,
//     fechaActualizacion: now,
//   });
//   return true;
// }

// /** 🔥 Borrado definitivo */
// export async function deleteNews(id){
//   await deleteDoc(doc(db, COL, id));
//   return true;
// }

// export const hardDeleteNews = deleteNews;

// /* ============================================================
//    STORAGE (stub)
//    ============================================================ */
// export function uploadNewsImage() {
//   throw new Error("Subida a Storage deshabilitada por ahora. Usa imagenUrl (string).");
// }


// src/services/newsService.js
import { db } from "../FirebaseConfig/FirebaseConfig";
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, limit, orderBy, serverTimestamp, startAfter
} from "firebase/firestore";

const COL = "noticias";
const colRef = collection(db, COL);

/* -----------------------------------------------------------
   Helpers (compatibilidad de estados/fechas)
----------------------------------------------------------- */
const EST_CANO = ["borrador","edicion","terminada","publicado","desactivada"];
const MAPEOS = {
  "Borrador":"borrador",
  "Edición":"edicion", "Edicion":"edicion",
  "Terminada":"terminada", "Terminado":"terminada",
  "Publicado":"publicado", "Publicada":"publicado",
  "Desactivado":"desactivada", "Desactivada":"desactivada"
};

function canonEstado(v){
  if(!v) return "edicion";
  const s = String(v).trim();
  const low = s.toLowerCase();
  if(EST_CANO.includes(low)) return low;
  if(MAPEOS[s]) return MAPEOS[s];
  return low;
}

function normalizeDoc(d){
  const data = d.data ? d.data() : d;
  return {
    ...data,
    id: d.id ?? data.id,
    estado: canonEstado(data.estado),
  };
}

function tsOrderVal(x){
  try{
    if(!x) return 0;
    if(typeof x === "number") return x;
    if(x?.toMillis) return x.toMillis();
    const n = Date.parse(x);
    return isNaN(n) ? 0 : n;
  }catch{ return 0; }
}

/* ============================================================
   LECTURAS (público)
   ============================================================ */
export async function listPublishedLatest(n = 20){
  try{
    const qy = query(
      colRef,
      where("estado","in",["publicado","Publicado"]),
      orderBy("createdAt","desc"),
      limit(n)
    );
    const s = await getDocs(qy);
    return s.docs.map(d => normalizeDoc({id:d.id, ...d.data()}));
  }catch{
    const s = await getDocs(query(colRef, limit(n)));
    return s.docs
      .map(d => normalizeDoc({id:d.id, ...d.data()}))
      .filter(r => r.estado === "publicado");
  }
}

export async function listPublishedBySection(slug, n = 6){
  try{
    const qy = query(
      colRef,
      where("categoriaSlug","==", slug),
      where("estado","in",["publicado","Publicado"]),
      orderBy("createdAt","desc"),
      limit(n)
    );
    const s = await getDocs(qy);
    return s.docs.map(d => normalizeDoc({id:d.id, ...d.data()}));
  }catch{
    const s = await getDocs(query(colRef, where("categoriaSlug","==", slug), limit(n)));
    return s.docs
      .map(d => normalizeDoc({id:d.id, ...d.data()}))
      .filter(r => r.estado === "publicado")
      .sort((a,b)=>tsOrderVal(b.createdAt) - tsOrderVal(a.createdAt))
      .slice(0,n);
  }
}

export async function getNewsById(id){
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists() ? normalizeDoc({ id:snap.id, ...snap.data() }) : null;
}

export async function listLatest(n = 20){
  try{
    const s = await getDocs(query(colRef, orderBy("createdAt","desc"), limit(n)));
    return s.docs.map(d => normalizeDoc({id:d.id, ...d.data()}));
  }catch{
    const s = await getDocs(query(colRef, limit(n)));
    return s.docs
      .map(d => normalizeDoc({id:d.id, ...d.data()}))
      .sort((a,b)=>tsOrderVal(b.createdAt) - tsOrderVal(a.createdAt));
  }
}

export async function listBySection(slug, n = 20){
  try{
    const qy = query(colRef, where("categoriaSlug","==", slug), orderBy("createdAt","desc"), limit(n));
    const s = await getDocs(qy);
    return s.docs.map(d => normalizeDoc({id:d.id, ...d.data()}));
  }catch{
    const s = await getDocs(query(colRef, where("categoriaSlug","==", slug), limit(n)));
    return s.docs
      .map(d => normalizeDoc({id:d.id, ...d.data()}))
      .sort((a,b)=>tsOrderVal(b.createdAt) - tsOrderVal(a.createdAt));
  }
}

export async function getNews(id){ return getNewsById(id); }

/* ============================================================
   UTILIDADES PARA PANEL DEL EDITOR
   ============================================================ */
export async function listNews({ q = "", estado = "*", top = 100 } = {}){
  const conds = [];
  if(estado !== "*" && estado)
    conds.push(where("estado","in",[estado, estado[0]?.toUpperCase()+estado.slice(1)]));
  try{
    const s = await getDocs(query(colRef, ...conds, orderBy("createdAt","desc"), limit(top)));
    let rows = s.docs.map(d => normalizeDoc({id:d.id, ...d.data()}));
    if(q){
      const qq = q.toLowerCase();
      rows = rows.filter(r => (r.titulo||"").toLowerCase().includes(qq));
    }
    return rows;
  }catch{
    const s = await getDocs(query(colRef, ...conds, limit(top)));
    let rows = s.docs.map(d => normalizeDoc({id:d.id, ...d.data()}));
    rows.sort((a,b)=>tsOrderVal(b.createdAt) - tsOrderVal(a.createdAt));
    if(q){
      const qq = q.toLowerCase();
      rows = rows.filter(r => (r.titulo||"").toLowerCase().includes(qq));
    }
    return rows;
  }
}

/** ✅ Lista TODAS las noticias escaneando por __name__ (independiente de createdAt) */
export async function listAllNews({ onlyMine = null, top = 5000 } = {}){
  const conds = [];
  if (onlyMine) conds.push(where("autorUid","==", onlyMine));

  const out = [];
  let last = null;
  const CHUNK = 500;

  while (out.length < top) {
    const qy = last
      ? query(colRef, ...conds, orderBy("__name__"), startAfter(last), limit(Math.min(CHUNK, top - out.length)))
      : query(colRef, ...conds, orderBy("__name__"), limit(Math.min(CHUNK, top)));
    const s = await getDocs(qy);
    if (s.empty) break;

    out.push(...s.docs.map(d => normalizeDoc({ id:d.id, ...d.data() })));
    last = s.docs[s.docs.length - 1];

    if (s.size < Math.min(CHUNK, top - out.length)) break;
  }

  // Ordena por fecha si existe; si no, por id (desc) para consistencia
  out.sort((a,b)=>{
    const A = tsOrderVal(a.createdAt || a.fechaCreacion);
    const B = tsOrderVal(b.createdAt || b.fechaCreacion);
    if (B !== A) return B - A;
    return String(b.id).localeCompare(String(a.id));
  });

  return out;
}

/** Crear noticia (editor) */
export async function createNews({ autorUid, autorNombre, ...data }){
  const now = serverTimestamp();
  const payload = {
    ...data,
    autorUid, autorNombre,
    estado: canonEstado(data.estado || "edicion"),
    createdAt: now, updatedAt: now,
    // compat
    fechaCreacion: now, fechaActualizacion: now,
  };
  const ref = await addDoc(colRef, payload);
  return { id: ref.id, ...payload };
}

/** Editar noticia */
export async function updateNews(id, data){
  const now = serverTimestamp();
  const patch = {
    ...data,
    ...(data.estado ? { estado: canonEstado(data.estado) } : {}),
    updatedAt: now,
    fechaActualizacion: now,
  };
  await updateDoc(doc(db, COL, id), patch);
}

/** Cambiar estado (Publicar/Desactivar/etc.) */
export async function updateStatus(id, nuevoEstado){
  const now = serverTimestamp();
  await updateDoc(doc(db, COL, id), {
    estado: canonEstado(nuevoEstado),
    updatedAt: now,
    fechaActualizacion: now,
  });
}

/* ============================================================
   UTILIDADES PARA PANEL DEL REPORTERO (compat)
   ============================================================ */
export async function createDraftNews(payload, user){
  const now = serverTimestamp();
  const data = {
    titulo: (payload.titulo || "").trim(),
    bajante: (payload.bajante || "").trim(),
    contenidoHTML: payload.contenidoHTML || "",
    categoriaSlug: payload.categoriaSlug || "general",
    imagenUrl: payload.imagenUrl || "",
    autorUid: payload.autorUid ?? user?.uid ?? null,
    autorNombre: payload.autorNombre ?? user?.displayName ?? user?.email ?? "Usuario",
    estado: canonEstado(payload.estado || "edicion"),
    activo: true,
    createdAt: payload.createdAt ?? now,
    updatedAt: payload.updatedAt ?? now,
    fechaCreacion: now,
    fechaActualizacion: now,
  };
  const ref = await addDoc(colRef, data);
  return { id: ref.id, ...data };
}

export async function listMyNews(uid, top = 100){
  return listMineForReporter(uid, top);
}

export async function listMineForReporter(autorUid, top = 100){
  if (!autorUid) return [];
  try {
    const s = await getDocs(
      query(colRef, where("autorUid","==", autorUid), orderBy("createdAt","desc"), limit(top))
    );
    return s.docs.map(d => normalizeDoc({id:d.id, ...d.data()}));
  } catch {
    const s = await getDocs(query(colRef, where("autorUid","==", autorUid), limit(top)));
    const rows = s.docs.map(d => normalizeDoc({id:d.id, ...d.data()}));
    rows.sort((a,b)=>tsOrderVal(b.createdAt) - tsOrderVal(a.createdAt));
    return rows;
  }
}

/** Eliminado suave */
export async function softDeleteNews(id, uid){
  const now = serverTimestamp();
  await updateDoc(doc(db, COL, id), {
    estado: "desactivada",
    activo: false,
    eliminadoPor: uid || null,
    updatedAt: now,
    fechaActualizacion: now,
  });
  return true;
}

/** 🔥 Borrado definitivo */
export async function deleteNews(id){
  await deleteDoc(doc(db, COL, id));
  return true;
}

export const hardDeleteNews = deleteNews;

/* ============================================================
   STORAGE (stub)
   ============================================================ */
export function uploadNewsImage() {
  throw new Error("Subida a Storage deshabilitada por ahora. Usa imagenUrl (string).");
}
