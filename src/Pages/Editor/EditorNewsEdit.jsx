


// // src/Pages/Editor/EditorNewsEdit.jsx
// import { useEffect, useRef, useState, useMemo } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { getNews, updateNews, updateStatus } from "../../services/newsService";
// import { listActiveSections } from "../../services/sectionService";
// import "./Editor.css";

// /* ===== Helpers de fecha (Timestamp o ISO) ===== */
// function toDateObj(v){ if(!v) return null; if(typeof v?.toDate==='function') return v.toDate(); const d=new Date(v); return isNaN(d)?null:d; }
// function ymd(d){ if(!d) return ""; const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,"0"); const da=String(d.getDate()).padStart(2,"0"); return `${y}-${m}-${da}`; }
// function hm(d){ if(!d) return ""; const h=String(d.getHours()).padStart(2,"0"); const mi=String(d.getMinutes()).padStart(2,"0"); return `${h}:${mi}`; }

// function toCanonEstado(v){
//   if(!v) return "";
//   const s = String(v).trim().toLowerCase();
//   if (s==="publicado" || s==="publicada") return "publicado";
//   if (s==="desactivado" || s==="desactivada") return "desactivada";
//   if (s==="terminado" || s==="terminada") return "terminada";
//   if (s==="edicion" || s==="edición") return "edicion";
//   return s;
// }

// function Pill({ estado }){
//   const v = toCanonEstado(estado);
//   const label =
//     v==="publicado"   ? "Publicado" :
//     v==="desactivada" ? "Desactivado" :
//     v==="terminada"   ? "Terminado"  :
//     v==="edicion"     ? "Edición"    :
//     (estado || "Edición");
//   return <span className={`pill ${v}`}>{label}</span>;
// }

// export default function EditorNewsEdit(){
//   const { id } = useParams();
//   const nav = useNavigate();

//   const [n, setN] = useState(null);
//   const [sections, setSections] = useState([]);
//   const [saving, setSaving] = useState(false);
//   const [changingState, setChangingState] = useState(false);
//   const [err, setErr] = useState("");

//   const urlInputRef = useRef(null);

//   // 🔙 Volver al panel (historial si existe, si no, ruta fija del panel)
//   const goBackToPanel = ()=>{
//     if (window.history.length > 1) {
//       nav(-1);
//     } else {
//       nav("/editor", { replace: true }); // ← ajusta si tu panel es /editor/panel
//     }
//   };

//   // Cargar secciones + noticia
//   useEffect(()=>{
//     let alive = true;
//     (async ()=>{
//       try{
//         const [secs, news] = await Promise.all([
//           listActiveSections().catch(()=>[]),
//           getNews(id)
//         ]);
//         if(!alive) return;
//         setSections(secs || []);
//         setN(news);
//       }catch(e){
//         setErr("No se pudo cargar la noticia.");
//       }
//     })();
//     return ()=>{ alive=false; };
//   },[id]);

//   const created = useMemo(()=>toDateObj(n?.createdAt || n?.fechaCreacion),[n]);
//   const updated = useMemo(()=>toDateObj(n?.updatedAt || n?.fechaActualizacion),[n]);

//   if (err) return <div className="alert error">{err}</div>;
//   if (!n)  return <p>Cargando…</p>;

//   // Guardar contenido (no toca autor ni estado aquí)
//   const onSave = async ()=>{
//     setSaving(true);
//     try{
//       await updateNews(id, {
//         titulo: n.titulo || "",
//         bajante: n.bajante || "",
//         categoriaSlug: n.categoriaSlug || "",
//         contenidoHTML: n.contenidoHTML || "",
//         imagenUrl: n.imagenUrl || "",
//       });
//       alert("Cambios guardados.");
//     }catch(e){
//       console.error(e);
//       alert("No se pudo guardar. Revisa la consola y las reglas.");
//     }finally{
//       setSaving(false);
//     }
//   };

//   // Cambiar estado (solo Publicado / Desactivado)
//   const setEstado = async (nuevo)=>{
//     setChangingState(true);
//     try{
//       await updateStatus(id, nuevo);
//       const fresh = await getNews(id);
//       setN(fresh);
//     }catch(e){
//       console.error(e);
//       alert("No se pudo cambiar el estado. Verifica reglas y permisos.");
//     }finally{
//       setChangingState(false);
//     }
//   };

//   const pasteDemo = ()=>{
//     const demo = "https://picsum.photos/seed/datanews/1200/700";
//     setN(v=>({...v, imagenUrl: demo }));
//     setTimeout(()=>urlInputRef.current?.focus(),0);
//   };

//   const eCanon = toCanonEstado(n.estado);
//   const canPublish    = eCanon !== "publicado";
//   const canDeactivate = eCanon === "publicado";

//   return (
//     <div className="bg-white rounded-xl shadow p-6">
//       {/* Encabezado */}
//       <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
//         <div style={{display:"flex", gap:8, alignItems:"center"}}>
//           <button type="button" className="btn ghost" onClick={goBackToPanel}>← Volver</button>
//           <h2 className="text-lg font-semibold">Editar noticia</h2>
//         </div>
//         <Pill estado={n.estado} />
//       </div>
//       <p className="text-sm text-gray-600" style={{marginTop:-6}}>ID: {id}</p>

//       {/* Layout 2 columnas */}
//       <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:16, marginTop:12 }}>
//         {/* Columna izquierda */}
//         <div>
//           <div className="form-row">
//             <label>
//               <div>Título</div>
//               <input
//                 value={n.titulo || ""}
//                 onChange={e=>setN(v=>({...v, titulo:e.target.value}))}
//                 placeholder="Título de la noticia"
//               />
//             </label>
//           </div>

//           <div className="form-row">
//             <label>
//               <div>Subtítulo / Bajante</div>
//               <input
//                 value={n.bajante || ""}
//                 onChange={e=>setN(v=>({...v, bajante:e.target.value}))}
//                 placeholder="Una frase que resuma la noticia"
//               />
//             </label>
//           </div>

//           <div className="form-row">
//             <label>
//               <div>Categoría</div>
//               <select
//                 value={n.categoriaSlug || ""}
//                 onChange={e=>setN(v=>({...v, categoriaSlug:e.target.value}))}
//               >
//                 <option value="">Seleccione…</option>
//                 {sections.map(s=>(
//                   <option key={s.slug} value={s.slug}>{s.nombre}</option>
//                 ))}
//               </select>
//             </label>
//           </div>

//           {/* Autor solo lectura */}
//           <div className="form-row">
//             <label>
//               <div>Autor</div>
//               <input readOnly value={n.autorNombre || "Autor"} />
//             </label>
//           </div>

//           {/* Fechas (solo lectura) */}
//           <div className="form-row" style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
//             <label>
//               <div>Fecha creación</div>
//               <input type="date" value={ymd(created)} readOnly/>
//             </label>
//             <label>
//               <div>Hora</div>
//               <input type="time" value={hm(created)} readOnly/>
//             </label>
//           </div>

//           <div className="form-row" style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
//             <label>
//               <div>Fecha actualización</div>
//               <input type="date" value={ymd(updated)} readOnly/>
//             </label>
//             <label>
//               <div>Hora</div>
//               <input type="time" value={hm(updated)} readOnly/>
//             </label>
//           </div>
//         </div>

//         {/* Columna derecha */}
//         <div>
//           <div className="form-row">
//             <label>
//               <div>Contenido (HTML o texto)</div>
//               <textarea
//                 value={n.contenidoHTML || ""}
//                 onChange={e=>setN(v=>({...v, contenidoHTML:e.target.value}))}
//                 placeholder="Escribe el cuerpo de la noticia (puedes pegar HTML simple)…"
//                 style={{ minHeight:460, width:"100%", resize:"vertical", lineHeight:1.4 }}
//               />
//             </label>
//           </div>

//           <div className="form-row">
//             <label>
//               <div>Imagen (URL)</div>
//               <div style={{display:"flex", gap:8}}>
//                 <input
//                   ref={urlInputRef}
//                   value={n.imagenUrl || ""}
//                   onChange={e=>setN(v=>({...v, imagenUrl:e.target.value}))}
//                   placeholder="https://…"
//                 />
//                 <button type="button" className="btn" onClick={pasteDemo}>Demo</button>
//               </div>
//             </label>
//           </div>
//         </div>
//       </div>

//       {/* Acciones inferiores */}
//       <div style={{display:"flex", gap:12, marginTop:16, flexWrap:"wrap"}}>
//         {/* Guardar contenido */}
//         <button
//           className="btn primary"
//           onClick={onSave}
//           disabled={saving}
//           style={{minWidth:180, fontWeight:700}}
//         >
//           {saving ? "Guardando…" : "Guardar cambios"}
//         </button>

//         {/* Publicar */}
//         <button
//           className={`chip xs act-publish ${canPublish ? "" : "disabled"}`}
//           onClick={()=> canPublish && setEstado("Publicado")}
//           disabled={!canPublish || changingState}
//           title={canPublish ? "Publicar esta noticia" : "Ya está publicada"}
//         >
//           {changingState && canPublish ? "Cambiando…" : "Publicar"}
//         </button>

//         {/* Desactivar */}
//         <button
//           className={`chip xs ${canDeactivate ? "act-disable" : "act-disable-off"}`}
//           onClick={()=> canDeactivate && setEstado("Desactivado")}
//           disabled={!canDeactivate || changingState}
//           title={canDeactivate ? "Desactivar publicación" : "Solo para noticias publicadas."}
//         >
//           {changingState && canDeactivate ? "Cambiando…" : "Desactivar"}
//         </button>

//       </div>
//     </div>
//   );
// }

// src/Pages/Editor/EditorNewsEdit.jsx
import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getNews, updateNews, updateStatus } from "../../services/newsService";
import { listActiveSections } from "../../services/sectionService";
import "./Editor.css";

/* ===== Helpers de fecha (Timestamp o ISO) ===== */
function toDateObj(v){ if(!v) return null; if(typeof v?.toDate==='function') return v.toDate(); const d=new Date(v); return isNaN(d)?null:d; }
function ymd(d){ if(!d) return ""; const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,"0"); const da=String(d.getDate()).padStart(2,"0"); return `${y}-${m}-${da}`; }
function hm(d){ if(!d) return ""; const h=String(d.getHours()).padStart(2,"0"); const mi=String(d.getMinutes()).padStart(2,"0"); return `${h}:${mi}`; }

function toCanonEstado(v){
  if(!v) return "";
  const s = String(v).trim().toLowerCase();
  if (s==="publicado" || s==="publicada") return "publicado";
  if (s==="desactivado" || s==="desactivada") return "desactivada";
  if (s==="terminado" || s==="terminada") return "terminada";
  if (s==="edicion" || s==="edición") return "edicion";
  return s;
}

function Pill({ estado }){
  const v = toCanonEstado(estado);
  const label =
    v==="publicado"   ? "Publicado" :
    v==="desactivada" ? "Desactivado" :
    v==="terminada"   ? "Terminado"  :
    v==="edicion"     ? "Edición"    :
    (estado || "Edición");
  return <span className={`pill ${v}`}>{label}</span>;
}

export default function EditorNewsEdit(){
  const { id } = useParams();
  const nav = useNavigate();

  const [n, setN] = useState(null);
  const [sections, setSections] = useState([]);
  const [saving, setSaving] = useState(false);
  const [changingState, setChangingState] = useState(false);
  const [err, setErr] = useState("");

  const urlInputRef = useRef(null);

  // 🔙 Volver al panel
  const goBackToPanel = ()=>{
    if (window.history.length > 1) nav(-1);
    else nav("/editor", { replace: true });
  };

  // Cargar secciones + noticia
  useEffect(()=>{
    let alive = true;
    (async ()=>{
      try{
        const [secs, news] = await Promise.all([
          listActiveSections().catch(()=>[]),
          getNews(id)
        ]);
        if(!alive) return;
        setSections(secs || []);
        setN(news);
      }catch(e){
        setErr("No se pudo cargar la noticia.");
      }
    })();
    return ()=>{ alive=false; };
  },[id]);

  const created = useMemo(()=>toDateObj(n?.createdAt || n?.fechaCreacion),[n]);
  const updated = useMemo(()=>toDateObj(n?.updatedAt || n?.fechaActualizacion),[n]);

  if (err) return <div className="alert error">{err}</div>;
  if (!n)  return <p>Cargando…</p>;

  // Guardar contenido (no toca autor ni estado aquí)
  const onSave = async ()=>{
    setSaving(true);
    try{
      await updateNews(id, {
        titulo: n.titulo || "",
        bajante: n.bajante || "",
        categoriaSlug: n.categoriaSlug || "",
        contenidoHTML: n.contenidoHTML || "",
        imagenUrl: n.imagenUrl || "",
      });
      alert("Cambios guardados.");
    }catch(e){
      console.error(e);
      alert("No se pudo guardar. Revisa la consola y las reglas.");
    }finally{
      setSaving(false);
    }
  };

  // Cambiar estado (solo Publicado / Desactivado)
  const setEstado = async (nuevo)=>{
    setChangingState(true);
    try{
      await updateStatus(id, nuevo);
      const fresh = await getNews(id);
      setN(fresh);
    }catch(e){
      console.error(e);
      alert("No se pudo cambiar el estado. Verifica reglas y permisos.");
    }finally{
      setChangingState(false);
    }
  };

  const pasteDemo = ()=>{
    const demo = "https://picsum.photos/seed/datanews/1200/700";
    setN(v=>({...v, imagenUrl: demo }));
    setTimeout(()=>urlInputRef.current?.focus(),0);
  };

  const eCanon = toCanonEstado(n.estado);
  const canPublish    = eCanon !== "publicado";
  const canDeactivate = eCanon === "publicado";

  return (
    <div className="bg-white rounded-xl shadow p-6">
      {/* Encabezado */}
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
        <div style={{display:"flex", gap:8, alignItems:"center"}}>
          <button type="button" className="btn ghost" onClick={goBackToPanel}>← Volver</button>
          <h2 className="text-lg font-semibold">Editar noticia</h2>
        </div>
        <Pill estado={n.estado} />
      </div>
      <p className="text-sm text-gray-600" style={{marginTop:-6}}>ID: {id}</p>

      {/* Layout 2 columnas */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:16, marginTop:12 }}>
        {/* Columna izquierda */}
        <div>
          <div className="form-row">
            <label>
              <div>Título</div>
              <input
                value={n.titulo || ""}
                onChange={e=>setN(v=>({...v, titulo:e.target.value}))}
                placeholder="Título de la noticia"
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              <div>Subtítulo / Bajante</div>
              <input
                value={n.bajante || ""}
                onChange={e=>setN(v=>({...v, bajante:e.target.value}))}
                placeholder="Una frase que resuma la noticia"
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              <div>Categoría</div>
              <select
                value={n.categoriaSlug || ""}
                onChange={e=>setN(v=>({...v, categoriaSlug:e.target.value}))}
              >
                <option value="">Seleccione…</option>
                {sections.map(s=>(
                  <option key={s.slug} value={s.slug}>{s.nombre}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Autor solo lectura (NO editable) */}
          <div className="form-row">
            <label>
              <div>Autor</div>
              <input readOnly value={n.autorNombre || "Autor"} />
            </label>
          </div>

          {/* Fechas (solo lectura) */}
          <div className="form-row" style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
            <label>
              <div>Fecha creación</div>
              <input type="date" value={ymd(created)} readOnly/>
            </label>
            <label>
              <div>Hora</div>
              <input type="time" value={hm(created)} readOnly/>
            </label>
          </div>

          <div className="form-row" style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
            <label>
              <div>Fecha actualización</div>
              <input type="date" value={ymd(updated)} readOnly/>
            </label>
            <label>
              <div>Hora</div>
              <input type="time" value={hm(updated)} readOnly/>
            </label>
          </div>
        </div>

        {/* 👇 span full width debajo: bloque naranja baja a la zona verde */}
        <div style={{ gridColumn: "1 / -1" }}>
          <div className="form-row">
            <label>
              <div>Contenido (HTML o texto)</div>
              <textarea
                value={n.contenidoHTML || ""}
                onChange={e=>setN(v=>({...v, contenidoHTML:e.target.value}))}
                placeholder="Escribe el cuerpo de la noticia (puedes pegar HTML simple)…"
                style={{ minHeight:460, width:"100%", resize:"vertical", lineHeight:1.4 }}
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              <div>Imagen (URL)</div>
              <div style={{display:"flex", gap:8}}>
                <input
                  ref={urlInputRef}
                  value={n.imagenUrl || ""}
                  onChange={e=>setN(v=>({...v, imagenUrl:e.target.value}))}
                  placeholder="https://…"
                />
                <button type="button" className="btn" onClick={pasteDemo}>Demo</button>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Acciones inferiores */}
      <div style={{display:"flex", gap:12, marginTop:16, flexWrap:"wrap"}}>
        <button
          className="btn primary"
          onClick={onSave}
          disabled={saving}
          style={{minWidth:180, fontWeight:700}}
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>

        <button
          className={`chip xs act-publish ${canPublish ? "" : "disabled"}`}
          onClick={()=> canPublish && setEstado("Publicado")}
          disabled={!canPublish || changingState}
          title={canPublish ? "Publicar esta noticia" : "Ya está publicada"}
        >
          {changingState && canPublish ? "Cambiando…" : "Publicar"}
        </button>

        <button
          className={`chip xs ${canDeactivate ? "act-disable" : "act-disable-off"}`}
          onClick={()=> canDeactivate && setEstado("Desactivado")}
          disabled={!canDeactivate || changingState}
          title={canDeactivate ? "Desactivar publicación" : "Solo para noticias publicadas."}
        >
          {changingState && canDeactivate ? "Cambiando…" : "Desactivar"}
        </button>
      </div>
    </div>
  );
}
