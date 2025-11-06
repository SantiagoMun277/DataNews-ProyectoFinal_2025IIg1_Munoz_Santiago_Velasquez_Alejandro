
// // src/services/sectionService.js
// import { db } from "../FirebaseConfig/FirebaseConfig";
// import {
//   collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
//   query, where, orderBy, limit
// } from "firebase/firestore";

// const COL = "secciones";
// const colRef = collection(db, COL);

// /* ---------- helpers ---------- */
// function normalize(d){
//   const data = d.data ? d.data() : d;
//   return { id: d.id ?? data.id, ...data };
// }
// function slugify(s){
//   return String(s||"")
//     .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
//     .toLowerCase().trim()
//     .replace(/[^a-z0-9]+/g,"-")
//     .replace(/(^-|-$)/g,"");
// }

// /* ---------- lecturas ---------- */
// export async function listActiveSections(top = 100){
//   try{
//     const s = await getDocs(
//       query(colRef, where("activa","==", true), orderBy("orden","asc"), limit(top))
//     );
//     return s.docs.map(d=>normalize({id:d.id, ...d.data()}));
//   }catch{
//     const s = await getDocs(query(colRef, where("activa","==", true), limit(top)));
//     const rows = s.docs.map(d=>normalize({id:d.id, ...d.data()}));
//     rows.sort((a,b)=>(a.orden??9999)-(b.orden??9999));
//     return rows;
//   }
// }

// /** ✅ todas (activas e inactivas) */
// export async function listAllSections(top = 1000){
//   try{
//     const s = await getDocs(query(colRef, orderBy("orden","asc"), limit(top)));
//     return s.docs.map(d=>normalize({id:d.id, ...d.data()}));
//   }catch{
//     const s = await getDocs(query(colRef, limit(top)));
//     const rows = s.docs.map(d=>normalize({id:d.id, ...d.data()}));
//     rows.sort((a,b)=>(a.orden??9999)-(b.orden??9999));
//     return rows;
//   }
// }

// /* ---------- escrituras (Editor/Admin según rules) ---------- */
// export async function createSection({ nombre, slug, descripcion = "", orden = 0, activa = true }){
//   const payload = {
//     nombre: (nombre||"").trim(),
//     slug: (slug||slugify(nombre)).trim(),
//     descripcion: (descripcion||"").trim(),
//     orden: Number.isFinite(orden) ? Number(orden) : 0,
//     activa: !!activa,
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//   };
//   const ref = await addDoc(colRef, payload);
//   return { id: ref.id, ...payload };
// }

// export async function updateSection(id, patch){
//   const data = { ...patch, updatedAt: new Date().toISOString() };
//   if (data.nombre && !data.slug) data.slug = slugify(data.nombre);
//   await updateDoc(doc(db, COL, id), data);
//   return true;
// }

// export async function setSectionActive(id, activa){
//   await updateSection(id, { activa: !!activa });
//   return true;
// }

// export async function removeSection(id){
//   await deleteDoc(doc(db, COL, id));
//   return true;
// }

// export async function getSection(id){
//   const snap = await getDoc(doc(db, COL, id));
//   return snap.exists() ? normalize({id:snap.id, ...snap.data()}) : null;
// }


// src/services/sectionService.js
import { db } from "../FirebaseConfig/FirebaseConfig";
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, writeBatch
} from "firebase/firestore";

const COL = "secciones";
const colRef = collection(db, COL);

/* ---------- helpers ---------- */
function normalize(d){
  const data = d.data ? d.data() : d;
  return { id: d.id ?? data.id, ...data };
}
function slugify(s){
  return String(s||"")
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g,"-")
    .replace(/(^-|-$)/g,"");
}

/* =========================================================
   LECTURAS
   ========================================================= */
export async function listActiveSections(top = 100){
  try{
    const s = await getDocs(
      query(colRef, where("activa","==", true), orderBy("orden","asc"), limit(top))
    );
    return s.docs.map(d=>normalize({id:d.id, ...d.data()}));
  }catch{
    const s = await getDocs(query(colRef, where("activa","==", true), limit(top)));
    const rows = s.docs.map(d=>normalize({id:d.id, ...d.data()}));
    rows.sort((a,b)=>(a.orden??9999)-(b.orden??9999));
    return rows;
  }
}

/** ✅ todas (activas e inactivas) */
export async function listAllSections(top = 1000){
  try{
    const s = await getDocs(query(colRef, orderBy("orden","asc"), limit(top)));
    return s.docs.map(d=>normalize({id:d.id, ...d.data()}));
  }catch{
    const s = await getDocs(query(colRef, limit(top)));
    const rows = s.docs.map(d=>normalize({id:d.id, ...d.data()}));
    rows.sort((a,b)=>(a.orden??9999)-(b.orden??9999));
    return rows;
  }
}

/** 👉 obtener por id */
export async function getSection(id){
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists() ? normalize({id:snap.id, ...snap.data()}) : null;
}

/** 👉 obtener por slug (auxiliar para páginas públicas/admin) */
export async function getSectionBySlug(slug){
  const s = (slug || "").trim().toLowerCase();
  if (!s) return null;
  const qy = query(colRef, where("slug","==", s), limit(1));
  const snap = await getDocs(qy);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return normalize({ id: d.id, ...d.data() });
}

/* =========================================================
   CHEQUEOS DE DUPLICADOS (opcionales)
   ========================================================= */
export async function existsSectionSlug(slug, excludeId = null){
  const s = (slug || "").trim().toLowerCase();
  if (!s) return false;
  const qy = query(colRef, where("slug","==", s), limit(1));
  const snap = await getDocs(qy);
  if (snap.empty) return false;
  const d = snap.docs[0];
  return excludeId ? d.id !== excludeId : true;
}

export async function existsSectionName(nombre, excludeId = null){
  const n = (nombre || "").trim().toLowerCase();
  if (!n) return false;
  const qy = query(colRef, where("nombreLower","==", n), limit(1));
  const snap = await getDocs(qy);
  if (snap.empty) return false;
  const d = snap.docs[0];
  return excludeId ? d.id !== excludeId : true;
}

/* =========================================================
   ESCRITURAS (mantengo tus funciones tal cual)
   ========================================================= */
export async function createSection({ nombre, slug, descripcion = "", orden = 0, activa = true }){
  const payload = {
    nombre: (nombre||"").trim(),
    nombreLower: String(nombre||"").trim().toLowerCase(), // 👈 no afecta tu UI; útil para búsquedas
    slug: (slug||slugify(nombre)).trim(),
    descripcion: (descripcion||"").trim(),
    orden: Number.isFinite(orden) ? Number(orden) : 0,
    activa: !!activa,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const ref = await addDoc(colRef, payload);
  return { id: ref.id, ...payload };
}

export async function updateSection(id, patch){
  const data = { ...patch, updatedAt: new Date().toISOString() };
  if (data.nombre) {
    data.nombre = String(data.nombre).trim();
    data.nombreLower = data.nombre.toLowerCase(); // 👈 no rompe nada
  }
  if (data.nombre && !data.slug) data.slug = slugify(data.nombre);
  await updateDoc(doc(db, COL, id), data);
  return true;
}

export async function setSectionActive(id, activa){
  await updateSection(id, { activa: !!activa });
  return true;
}

export async function removeSection(id){
  await deleteDoc(doc(db, COL, id));
  return true;
}

/* =========================================================
   VARIANTES “STRICT” (no rompen tu flujo actual)
   - Validan duplicados de nombre/slug antes de crear/actualizar
   ========================================================= */

/** Crea sección validando que NO existan duplicados de slug o nombre. */
export async function createSectionStrict({ nombre, slug, descripcion = "", orden = 0, activa = true }){
  const nombreOk = (nombre||"").trim();
  const slugOk = (slug||slugify(nombreOk)).trim().toLowerCase();
  if (!nombreOk) throw new Error("El nombre es obligatorio.");

  if (await existsSectionName(nombreOk)) throw new Error("Ya existe una sección con ese nombre.");
  if (await existsSectionSlug(slugOk))  throw new Error("Ya existe una sección con ese slug.");

  return await createSection({ nombre: nombreOk, slug: slugOk, descripcion, orden, activa });
}

/** Actualiza sección validando duplicados (excluye la propia id). */
export async function updateSectionStrict(id, patch){
  const upd = { ...patch };
  if (upd.nombre) {
    const nombreOk = String(upd.nombre).trim();
    if (await existsSectionName(nombreOk, id)) throw new Error("Ese nombre ya está en uso.");
  }
  // si te pasan slug fijo, validalo; si no, y te pasan nombre, se generará en updateSection
  if (upd.slug) {
    const slugOk = String(upd.slug).trim().toLowerCase();
    if (await existsSectionSlug(slugOk, id)) throw new Error("Ese slug ya está en uso.");
  }
  return await updateSection(id, upd);
}

/* =========================================================
   ATAJOS ÚTILES
   ========================================================= */

/** Cambia activa <-> inactiva devolviendo el nuevo estado. */
export async function toggleSection(id){
  const cur = await getSection(id);
  const next = !(cur?.activa);
  await setSectionActive(id, next);
  return next;
}

/** Reordenar en lote: recibe array de { id, orden } */
export async function reorderSections(pares){
  if (!Array.isArray(pares) || !pares.length) return false;
  const batch = writeBatch(db);
  for (const { id, orden } of pares){
    const o = Number.isFinite(orden) ? Number(orden) : 0;
    batch.update(doc(db, COL, id), { orden: o, updatedAt: new Date().toISOString() });
  }
  await batch.commit();
  return true;
}
