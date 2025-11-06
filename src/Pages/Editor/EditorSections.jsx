

// // src/Pages/Editor/EditorSections.jsx
// import { useEffect, useMemo, useState } from "react";
// import useSession from "../../hooks/useSession";
// import {
//   listAllSections, createSection, setSectionActive, updateSection, removeSection
// } from "../../services/sectionService";
// import "./Editor.css";

// function Pill({ activa }){
//   const v = !!activa;
//   return <span className={`pill ${v ? "publicado" : "desactivada"}`}>{v ? "Activa" : "Inactiva"}</span>;
// }

// export default function EditorSections(){
//   const ses = useSession();
//   const isEditor = ["editor","admin"].includes(String(ses?.rol||"").toLowerCase());

//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");

//   // filtros
//   const [q, setQ] = useState("");
//   const [estado, setEstado] = useState("Todas"); // Todas | Activas | Inactivas

//   // formulario crear
//   const [f, setF] = useState({ nombre:"", slug:"", descripcion:"", orden:0, activa:true });

//   async function load(){
//     setErr(""); setLoading(true);
//     try{
//       const data = await listAllSections(2000);
//       setRows(Array.isArray(data) ? data : []);
//     }catch(e){
//       console.error(e);
//       setErr("No se pudieron cargar las secciones.");
//     }finally{ setLoading(false); }
//   }
//   useEffect(()=>{ load(); },[]);

//   const list = useMemo(()=>{
//     const t = q.trim().toLowerCase();
//     return rows.filter(s=>{
//       const okEstado = estado==="Todas" ? true : (estado==="Activas" ? s.activa : !s.activa);
//       const hay = (s.nombre||"")+" "+(s.slug||"")+" "+(s.descripcion||"");
//       return okEstado && (!t || hay.toLowerCase().includes(t));
//     });
//   }, [rows, q, estado]);

//   async function onCreate(e){
//     e?.preventDefault?.();
//     if(!isEditor) return alert("No autorizado.");
//     if(!f.nombre.trim()) return alert("Pon un nombre.");
//     try{
//       await createSection(f);
//       setF({ nombre:"", slug:"", descripcion:"", orden:0, activa:true });
//       await load();
//     }catch(e){ console.error(e); alert("No se pudo crear la sección."); }
//   }

//   async function onToggle(s){
//     if(!isEditor) return alert("No autorizado.");
//     const next = !s.activa;
//     if(!window.confirm(`${next ? "Activar" : "Desactivar"} la sección ${s.nombre}?`)) return;
//     await setSectionActive(s.id, next);
//     await load();
//   }

//   async function onEdit(s){
//     if(!isEditor) return alert("No autorizado.");
//     const nombre = prompt("Nuevo nombre:", s.nombre) ?? s.nombre;
//     const slug = prompt("Slug (url, ej. cultura):", s.slug) ?? s.slug;
//     const ordenStr = prompt("Orden (número, menor aparece primero):", String(s.orden ?? 0)) ?? String(s.orden ?? 0);
//     const descripcion = prompt("Descripción breve:", s.descripcion||"") ?? (s.descripcion||"");
//     const orden = Number(ordenStr);
//     await updateSection(s.id, { nombre, slug, descripcion, orden: Number.isFinite(orden)?orden:s.orden });
//     await load();
//   }

//   async function onDelete(s){
//     if(!isEditor) return alert("No autorizado.");
//     if(!window.confirm(`Eliminar la sección "${s.nombre}"? Esta acción no se puede deshacer.`)) return;
//     await removeSection(s.id);
//     await load();
//   }

//   return (
//     <main className="container ed-wrap">
//       <header className="ed-head">
//         <div className="lh">
//           <h1>Secciones</h1>
//           <p className="muted">Crea, activa/desactiva, edita o elimina secciones (Cultura, Deportes, Salud, etc.).</p>
//         </div>
//       </header>

//       {/* Crear nueva */}
//       <form className="card form" onSubmit={onCreate} style={{marginBottom:12}}>
//         <div className="grid-6">
//           <label>
//             <div>Nombre</div>
//             <input
//               value={f.nombre}
//               onChange={e=>setF(v=>({...v, nombre:e.target.value}))}
//               placeholder="Cultura"
//               required
//             />
//           </label>
//           <label>
//             <div>Slug</div>
//             <input
//               value={f.slug}
//               onChange={e=>setF(v=>({...v, slug:e.target.value}))}
//               placeholder="cultura"
//             />
//           </label>
//           <label>
//             <div>Descripción</div>
//             <input
//               value={f.descripcion}
//               onChange={e=>setF(v=>({...v, descripcion:e.target.value}))}
//               placeholder="Opcional"
//             />
//           </label>
//           <label>
//             <div>Orden</div>
//             <input
//               type="number"
//               value={f.orden}
//               onChange={e=>setF(v=>({...v, orden:Number(e.target.value)}))}
//             />
//           </label>
//           <label className="chk">
//             <input
//               type="checkbox"
//               checked={f.activa}
//               onChange={e=>setF(v=>({...v, activa:e.target.checked}))}
//             />
//             <span>Activa al crear</span>
//           </label>
//           <div className="right">
//             <button className="btn primary" type="submit">+ Crear sección</button>
//           </div>
//         </div>
//       </form>

//       {/* Filtros */}
//       <div className="ed-filters">
//         <input
//           className="inp"
//           placeholder="Buscar por nombre/slug…"
//           value={q}
//           onChange={e=>setQ(e.target.value)}
//           style={{minWidth:260}}
//         />
//         <select className="inp" value={estado} onChange={e=>setEstado(e.target.value)}>
//           {["Todas","Activas","Inactivas"].map(x=><option key={x} value={x}>{x}</option>)}
//         </select>
//         <button className="btn ghost" onClick={load}>Actualizar</button>
//         <span className="muted" style={{marginLeft:8}}>
//           Mostrando <strong>{list.length}</strong> sección(es)
//         </span>
//       </div>

//       {err && <div className="alert error">{err}</div>}

//       {loading ? <p>Cargando…</p> : (
//         <div className="ed-table">
//           <div className="ed-row header">
//             <div>Estado</div>
//             <div>Nombre</div>
//             <div>Slug</div>
//             <div>Descripción</div>
//             <div>Orden</div>
//             <div className="right">Acciones</div>
//           </div>

//           {list.map(s=>(
//             <div key={s.id} className="ed-row">
//               <div><Pill activa={!!s.activa} /></div>
//               <div className="title">{s.nombre}</div>
//               <div className="mono">{s.slug}</div>
//               <div className="muted cell-ellipsis" title={s.descripcion||""}>{s.descripcion || "-"}</div>
//               <div>{s.orden ?? "-"}</div>
//               <div className="right actions">
//                 <div className="statebar">
//                   <button className="chip xs act-edit" onClick={()=>onEdit(s)}>Editar</button>
//                   <button
//                     className={`chip xs ${s.activa ? "act-disable" : "act-publish"}`}
//                     onClick={()=>onToggle(s)}
//                   >
//                     {s.activa ? "Desactivar" : "Activar"}
//                   </button>
//                   <button className="chip xs act-danger" onClick={()=>onDelete(s)}>Eliminar</button>
//                 </div>
//               </div>
//             </div>
//           ))}

//           {!list.length && !loading && <div className="empty">No hay secciones.</div>}
//         </div>
//       )}
//     </main>
//   );
// }


// src/Pages/Editor/EditorSections.jsx
import { useEffect, useMemo, useState } from "react";
import useSession from "../../hooks/useSession";
import {
  listAllSections, createSection, setSectionActive, updateSection, removeSection
} from "../../services/sectionService";
import "./Editor.css";

function Pill({ activa }){
  const v = !!activa;
  return <span className={`pill ${v ? "publicado" : "desactivada"}`}>{v ? "Activa" : "Inactiva"}</span>;
}

export default function EditorSections(){
  const ses = useSession();
  const isEditor = ["editor","admin"].includes(String(ses?.rol||"").toLowerCase());

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // filtros
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("Todas"); // Todas | Activas | Inactivas

  // formulario crear
  const [f, setF] = useState({ nombre:"", slug:"", descripcion:"", orden:0, activa:true });

  async function load(){
    setErr(""); setLoading(true);
    try{
      const data = await listAllSections(2000);
      setRows(Array.isArray(data) ? data : []);
    }catch(e){
      console.error(e);
      setErr("No se pudieron cargar las secciones.");
    }finally{ setLoading(false); }
  }
  useEffect(()=>{ load(); },[]);

  const list = useMemo(()=>{
    const t = q.trim().toLowerCase();
    return rows.filter(s=>{
      const okEstado = estado==="Todas" ? true : (estado==="Activas" ? s.activa : !s.activa);
      const hay = (s.nombre||"")+" "+(s.slug||"")+" "+(s.descripcion||"");
      return okEstado && (!t || hay.toLowerCase().includes(t));
    });
  }, [rows, q, estado]);

  async function onCreate(e){
    e?.preventDefault?.();
    if(!isEditor) return alert("No autorizado.");
    if(!f.nombre.trim()) return alert("Pon un nombre.");
    try{
      await createSection(f);
      setF({ nombre:"", slug:"", descripcion:"", orden:0, activa:true });
      await load();
    }catch(e){ console.error(e); alert("No se pudo crear la sección."); }
  }

  async function onToggle(s){
    if(!isEditor) return alert("No autorizado.");
    const next = !s.activa;
    if(!window.confirm(`${next ? "Activar" : "Desactivar"} la sección ${s.nombre}?`)) return;
    await setSectionActive(s.id, next);
    await load();
  }

  async function onEdit(s){
    if(!isEditor) return alert("No autorizado.");
    const nombre = prompt("Nuevo nombre:", s.nombre) ?? s.nombre;
    const slug = prompt("Slug (url, ej. cultura):", s.slug) ?? s.slug;
    const ordenStr = prompt("Orden (número, menor aparece primero):", String(s.orden ?? 0)) ?? String(s.orden ?? 0);
    const descripcion = prompt("Descripción breve:", s.descripcion||"") ?? (s.descripcion||"");
    const orden = Number(ordenStr);
    await updateSection(s.id, { nombre, slug, descripcion, orden: Number.isFinite(orden)?orden:s.orden });
    await load();
  }

  async function onDelete(s){
    if(!isEditor) return alert("No autorizado.");
    if(!window.confirm(`Eliminar la sección "${s.nombre}"? Esta acción no se puede deshacer.`)) return;
    await removeSection(s.id);
    await load();
  }

  return (
    <main className="container ed-wrap">
      <header className="ed-head">
        <div className="lh">
          <h1>Secciones</h1>
          <p className="muted">Crea, activa/desactiva, edita o elimina secciones (Cultura, Deportes, Salud, etc.).</p>
        </div>
      </header>

      {/* Crear nueva */}
      <form className="card form" onSubmit={onCreate} style={{marginBottom:12}}>
        <div className="grid cols-6 gap-12">
          <label className="col-span-2 md:col-span-3 sm:col-span-6">
            <div>Nombre</div>
            <input
              value={f.nombre}
              onChange={e=>setF(v=>({...v, nombre:e.target.value}))}
              placeholder="Cultura"
              required
            />
          </label>

          <label className="col-span-2 md:col-span-3 sm:col-span-6">
            <div>Slug</div>
            <input
              value={f.slug}
              onChange={e=>setF(v=>({...v, slug:e.target.value}))}
              placeholder="cultura"
            />
          </label>

          <label className="col-span-3 md:col-span-6 sm:col-span-6">
            <div>Descripción</div>
            <input
              value={f.descripcion}
              onChange={e=>setF(v=>({...v, descripcion:e.target.value}))}
              placeholder="Opcional"
            />
          </label>

          <label className="col-span-1 md:col-span-2 sm:col-span-3">
            <div>Orden</div>
            <input
              type="number"
              value={f.orden}
              onChange={e=>setF(v=>({...v, orden:Number(e.target.value)}))}
            />
          </label>

          <label className="chk col-span-2 md:col-span-2 sm:col-span-3" style={{alignSelf:"end"}}>
            <input
              type="checkbox"
              checked={f.activa}
              onChange={e=>setF(v=>({...v, activa:e.target.checked}))}
            />
            <span>Activa al crear</span>
          </label>

          <div className="right col-span-2 md:col-span-2 sm:col-span-6" style={{alignSelf:"end"}}>
            <button className="btn primary" type="submit">+ Crear sección</button>
          </div>
        </div>
      </form>

      {/* Filtros */}
      <div className="ed-filters">
        <input
          className="inp"
          placeholder="Buscar por nombre/slug…"
          value={q}
          onChange={e=>setQ(e.target.value)}
          style={{minWidth:260}}
        />
        <select className="inp" value={estado} onChange={e=>setEstado(e.target.value)}>
          {["Todas","Activas","Inactivas"].map(x=><option key={x} value={x}>{x}</option>)}
        </select>
        <button className="btn ghost" onClick={load}>Actualizar</button>
        <span className="muted" style={{marginLeft:8}}>
          Mostrando <strong>{list.length}</strong> sección(es)
        </span>
      </div>

      {err && <div className="alert error">{err}</div>}

      {loading ? <p>Cargando…</p> : (
        <div className="ed-table sections">
          <div className="ed-row header">
            <div>Estado</div>
            <div>Nombre</div>
            <div>Slug</div>
            <div className="hide-sm">Descripción</div>
            <div className="hide-sm">Orden</div>
            <div className="right">Acciones</div>
          </div>

          {list.map(s=>(
            <div key={s.id} className="ed-row">
              <div><Pill activa={!!s.activa} /></div>
              <div className="title">{s.nombre}</div>
              <div className="mono">{s.slug}</div>
              <div className="muted cell-ellipsis hide-sm" title={s.descripcion||""}>{s.descripcion || "-"}</div>
              <div className="hide-sm">{s.orden ?? "-"}</div>

              <div className="right actions">
                <div className="statebar">
                  <button className="chip xs act-edit" onClick={()=>onEdit(s)}>Editar</button>
                  <button
                    className={`chip xs ${s.activa ? "act-disable" : "act-publish"}`}
                    onClick={()=>onToggle(s)}
                  >
                    {s.activa ? "Desactivar" : "Activar"}
                  </button>
                  <button className="chip xs act-danger" onClick={()=>onDelete(s)}>Eliminar</button>
                </div>
              </div>
            </div>
          ))}

          {!list.length && !loading && <div className="empty">No hay secciones.</div>}
        </div>
      )}
    </main>
  );
}
