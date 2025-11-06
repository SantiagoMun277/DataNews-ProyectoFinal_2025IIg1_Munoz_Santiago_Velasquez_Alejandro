

// src/Components/Header/EditorHeader.jsx 
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react"; 
import { logout } from "../../services/authService";
import ProfileModal from "../Account/ProfileModal"; 
import logo from "../../assets/logo.png";
import "./ReporterHeader.css";

export default function EditorHeader(){
  const [openProfile, setOpenProfile] = useState(false); 
  const session = JSON.parse(localStorage.getItem("dn_session") || "null");
  const nav = useNavigate();
  const active = ({ isActive }) => (isActive ? "active" : undefined);

  const onLogout = async () => {
    await logout();
    localStorage.removeItem("dn_session");
    nav("/", { replace:true });
  };

  return (
    <>
      <header className="site-header reporter editor">
        <div className="top-bar">
          <div className="top-inner">
            <div
              className="user-chip"
              onClick={()=>setOpenProfile(true)}   
              role="button" tabIndex={0}           
              style={{ cursor: "pointer" }}       
              title="Configurar perfil"
            >
              <div className="avatar" aria-hidden>🛠️</div>
              <div>
                <strong>{session?.displayName || session?.nombre || "Editor"}</strong>
                <div className="muted">{session?.email}</div>
              </div>
            </div>
            <div className="brand"><img src={logo} alt="DataNews" /></div>
            <div className="actions">
              <button className="btn ghost" onClick={onLogout}>Cerrar sesión</button>
            </div>
          </div>
        </div>

        {/* SOLO estas 3 rutas */}
        <nav className="main-nav">
          <div className="nav-inner">
            <NavLink to="/admin" end className={active}>Panel de noticias</NavLink>
            <NavLink to="/admin/usuarios" className={active}>Usuarios</NavLink>
            <NavLink to="/admin/secciones" className={active}>Secciones</NavLink>
          </div>
        </nav>
      </header>

      {/*  AÑADIDO: Modal de Perfil (no altera tu header) */}
      <ProfileModal
        open={openProfile}
        onClose={()=>setOpenProfile(false)}
        session={session}
      />
    </>
  );
}
