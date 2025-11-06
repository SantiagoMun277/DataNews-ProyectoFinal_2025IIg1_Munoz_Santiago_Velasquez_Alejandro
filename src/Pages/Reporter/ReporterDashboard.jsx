// src/Pages/Editor/EditorDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { listAllNews, updateStatus } from "../../services/newsService";
import useSession from "../../hooks/useSession";
import "./Editor.css";

const ESTADOS = ["Todos","Edición","Terminado","Publicado","Desactivado"];

function toCanon(v){
  if(!v) return "";
  const s = String(v).trim().toLowerCase();
  if (s === "edicion" || s === "edición") return "edicion";
  if (s === "terminada" || s === "terminado") return "terminada";
  if (s === "publicado" || s === "publicada") return "publicado";
  if (s === "desactivado" || s === "desactivada") return "desactivada";
  return s;
}

function StatusPill({ value }){
  const v = toCanon(value||"");
  const label =
    v==="edicion" ? "Edición" :
    v==="terminada" ? "Terminado" :
    v==="publicado" ? "Publicado" :
    v==="desactivada" ? "Desactivado" :
    (value || "Edición");
  return <span className={`pill ${v}`}>{label}</span>;
}

export default function EditorDashboard(){
  const ses = useSession();
  const [rows, setRows]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Filtros UI
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("Todos");

  const isEditor = ["editor","admin"].includes(String(ses?.rol||"").toLowerCase());

  async function load(){
    setErr(""); setLoading(true);
    try {
      const data = await listAllNews({ onlyMine: null, top: 5000 });
      setRows(Array.isArray(data) ? data : []);
      console.log("[EditorDashboard] total traídas:", data?.length ?? 0);
    } catch (e){
      console.error(e);
      setErr("No se pudo cargar el listado.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(()=>{ load(); /* eslint-disable-line */ }, []);

  const estadoCanon = toCanon(estado);
  const filtered = useMemo(()=>{
    const term = q.trim().toLowerCase();
    return rows.filter(r=>{
      const e = toCanon(r.estado);
      const okEstado = estadoCanon === "" || estadoCanon === "todos" ? true : (e === estadoCanon);
      const okTitulo = !term ? true : (String(r.titulo||"").toLowerCase().includes(term));
      return okEstado && okTitulo;
    });
  }, [rows, q, estadoCanon]);

  async function handleStatus(n, nuevo){
    const nuevoCanon = toCanon(nuevo);
    if (nuevoCanon === "publicado") {
      if (!isEditor) return alert("No autorizado para publicar.");
      if (toCanon(n.estado) !== "terminada") {
        return alert("Solo se pueden publicar noticias en estado 'Terminado'.");
      }
    }
    await updateStatus(n.id, nuevo);
    await load();
  }

  return (
    <main className="container ed-wrap">
      <header className="ed-head">
        <div className="lh">
          <h1>Panel de noticias</h1>
          <p className="muted">El editor ve todas las noticias; filtra por estado y título.</p>
        </div>
      </header>

      <div className="ed-filters">
        <input
          className="inp"
          placeholder="Buscar por título…"
          value={q}
          onChange={e=>setQ(e.target.value)}
        />
        <select className="inp" value={estado} onChange={e=>setEstado(e.target.value)}>
          {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn ghost" onClick={load}>Actualizar</button>
        <span className="muted" style={{marginLeft:8}}>
          Mostrando <strong>{filtered.length}</strong> noticia(s)
        </span>
      </div>

      {err && <div className="alert error">{err}</div>}

      {loading ? <p>Cargando…</p> : (
        <div className="ed-table">
          <div className="ed-row header">
            <div>Estado</div>
            <div>Título</div>
            <div>Categoría</div>
            <div>Autor</div>
            <div className="right">Acciones</div>
          </div>

          {filtered.map(n => {
            const e = toCanon(n.estado);
            const canPublishNow = isEditor && (e === "terminada");
            const isPublished    = (e === "publicado");

            return (
              <div key={n.id} className="ed-row">
                <div><StatusPill value={n.estado||"edicion"} /></div>

                <div className="title">
                  {n.titulo || "(sin título)"} <small className="muted">ID {n.id.slice(0,7)}…</small>
                </div>

                <div>{n.categoriaSlug || "-"}</div>
                <div>{n.autorNombre || "-"}</div>

                <div className="right actions">
                  <div className="statebar">
                    {/* EDITAR (ruta del admin) */}
                    <a className="chip xs" href={`/admin/noticias/${n.id}`}>Editar</a>

                    {/* PUBLICAR (solo si está Terminado) */}
                    <button
                      className={`chip xs ${canPublishNow ? "green" : "disabled"}`}
                      onClick={()=>canPublishNow && handleStatus(n, "Publicado")}
                      disabled={!canPublishNow}
                      title={canPublishNow ? "Publicar esta noticia" : "Solo si el estado es 'Terminado'."}
                    >
                      Publicar
                    </button>

                    {/* DESACTIVAR (solo si está Publicado) */}
                    <button
                      className="chip xs gray"
                      onClick={()=>handleStatus(n, "Desactivado")}
                      disabled={!isPublished}
                      title={isPublished ? "Desactivar publicación" : "Solo para noticias publicadas."}
                    >
                      Desactivar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {!filtered.length && !loading && (
            <div className="empty">No hay noticias con esos filtros.</div>
          )}
        </div>
      )}
    </main>
  );
}
