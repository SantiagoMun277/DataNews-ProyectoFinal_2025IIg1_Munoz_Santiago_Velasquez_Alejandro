
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";                     // 👈 AÑADIDO
import useSession from "../../hooks/useSession";
import { listAllUsers, setUserRole, setUserActive, removeUser } from "../../services/userService";
import { logout } from "../../services/authService";                 // 👈 AÑADIDO
import "./Editor.css";

const ROLES = ["Todos","editor","reportero"];

export default function EditorUsers(){
  const ses = useSession();
  const nav = useNavigate();                                         // 👈 AÑADIDO
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [rol, setRol] = useState("Todos");

  const isEditor = ["editor","admin"].includes(String(ses?.rol||"").toLowerCase());

  // 👇 AÑADIDO: centraliza manejo de "Missing or insufficient permissions"
  async function handlePermError(e, fallbackMsg = "No se pudo ejecutar la acción.") {
    const msg = String(e?.message || "");
    const code = String(e?.code || "");
    const isPerm = code === "permission-denied" || msg.includes("Missing or insufficient permissions");
    if (isPerm) {
      try { await logout(); } catch(_) {}
      try { localStorage.removeItem("dn_session"); } catch(_) {}
      alert("Tu sesión no tiene permisos para esta acción (puede ser otra cuenta iniciada en esta pestaña). Vuelve a iniciar sesión.");
      nav("/login", { replace: true });
      return true; // ya manejado
    } else {
      console.error(e);
      setErr(fallbackMsg);
      return false;
    }
  }

  async function load(){
    setErr(""); setLoading(true);
    try{
      const data = await listAllUsers(5000);
      setRows(Array.isArray(data) ? data : []);
    }catch(e){
      const handled = await handlePermError(e, "No se pudo cargar el listado de usuarios (revisa reglas).");
      if (!handled) console.error(e);
    }finally{ setLoading(false); }
  }
  useEffect(()=>{ load(); /* eslint-disable-line react-hooks/exhaustive-deps */ },[]);

  const filtered = useMemo(()=>{
    const t = q.trim().toLowerCase();
    return rows.filter(u=>{
      const okRol = (rol==="Todos") ? true : (String(u.rol||"").toLowerCase() === rol);
      const hay = (u.displayName||"") + " " + (u.email||"") + " " + (u.uid||u.id||"");
      return okRol && (!t || hay.toLowerCase().includes(t));
    });
  },[rows, q, rol]);

  async function onRole(u, newRole){
    if (!isEditor) return alert("No autorizado.");
    if (!window.confirm(`Cambiar rol de ${u.displayName || u.email} a ${newRole}?`)) return;
    try{
      await setUserRole(u.id, newRole);
      await load();
    }catch(e){
      const handled = await handlePermError(e, "No se pudo cambiar el rol.");
      if (!handled) console.error(e);
    }
  }

  async function onToggleActive(u){
    if (!isEditor) return alert("No autorizado.");
    const next = !u.activo;
    if (!window.confirm(`${next ? "Activar" : "Desactivar"} la cuenta de ${u.displayName || u.email}?`)) return;
    try{
      await setUserActive(u.id, next);
      await load();
    }catch(e){
      const handled = await handlePermError(e, "No se pudo cambiar el estado de la cuenta.");
      if (!handled) console.error(e);
    }
  }

  async function onDelete(u){
    if (!isEditor) return alert("No autorizado.");
    if (!window.confirm(`Eliminar el usuario ${u.displayName || u.email}? Esta acción no se puede deshacer.`)) return;
    try{
      await removeUser(u.id);
      await load();
    }catch(e){
      const handled = await handlePermError(e, "No se pudo eliminar el usuario.");
      if (!handled) console.error(e);
    }
  }

  return (
    <main className="container ed-wrap">
      <header className="ed-head">
        <div className="lh">
          <h1>Gestionar usuarios</h1>
          <p className="muted">Busca, filtra por rol y cambia rol/estado. Solo Editor.</p>
        </div>
      </header>

      {/* Filtros */}
      <div className="ed-filters">
        <input
          className="inp"
          placeholder="Buscar por nombre, email o UID…"
          value={q}
          onChange={e=>setQ(e.target.value)}
          style={{minWidth:280}}
        />
        <select className="inp" value={rol} onChange={e=>setRol(e.target.value)}>
          {ROLES.map(r => <option key={r} value={r}>{r[0].toUpperCase()+r.slice(1)}</option>)}
        </select>
        <button className="btn ghost" onClick={load}>Actualizar</button>
        <span className="muted" style={{marginLeft:8}}>
          Mostrando <strong>{filtered.length}</strong> usuario(s)
        </span>
      </div>

      {err && <div className="alert error">{err}</div>}

      {loading ? <p>Cargando…</p> : (
        <div className="users-table">
          {/* Encabezado */}
          <div className="users-row header">
            <div>Tipo</div>
            <div>Nombre</div>
            <div>Email</div>
            <div>UID</div>
            <div>Fecha registro</div>
            <div className="right">Acción</div>
          </div>

          {/* Filas */}
          {filtered.map(u=>{
            const created = u.createdAt?.toDate ? u.createdAt.toDate() : (u.createdAt ? new Date(u.createdAt) : null);
            const f = created && !isNaN(created) ? created.toLocaleString() : "-";
            const activo = !!u.activo;
            const rolVal = String(u.rol||"reportero").toLowerCase();

            return (
              <div key={u.id} className={`users-row ${activo ? "" : "muted"}`}>
                <div className="cell" data-label="Tipo">
                  <span className={`pill ${rolVal==="editor" ? "publicado" : "edicion"}`}>
                    {rolVal}
                  </span>
                </div>

                <div className="cell cell-ellipsis" data-label="Nombre" title={u.displayName || "(sin nombre)"}>
                  <strong>{u.displayName || "(sin nombre)"}</strong>
                </div>

                <div className="cell cell-ellipsis" data-label="Email" title={u.email || "-"}>
                  {u.email || "-"}
                </div>

                <div className="cell cell-ellipsis mono" data-label="UID" title={u.uid || u.id}>
                  {u.uid || u.id}
                </div>

                <div className="cell cell-ellipsis" data-label="Fecha registro" title={f}>
                  {f}
                </div>

                <div className="cell right actions" data-label="Acción">
                  <div className="statebar wrap">
                    <select
                      className="chip xs act-edit"
                      value={rolVal}
                      onChange={e=>onRole(u, e.target.value)}
                    >
                      <option value="editor">Editor</option>
                      <option value="reportero">Reportero</option>
                    </select>

                    <button
                      className={`chip xs ${activo ? "act-disable" : "act-publish"}`}
                      onClick={()=>onToggleActive(u)}
                      title={activo ? "Desactivar cuenta" : "Activar cuenta"}
                    >
                      {activo ? "Desactivar" : "Activar"}
                    </button>
{/* 
                    <button
                      className="chip xs act-danger"
                      onClick={()=>onDelete(u)}
                      title="Eliminar usuario"
                    >
                      Eliminar
                    </button> */}
                  </div>
                </div>
              </div>
            );
          })}

          {!filtered.length && !loading && (
            <div className="empty">No hay usuarios con esos filtros.</div>
          )}
        </div>
      )}
    </main>
  );
}
