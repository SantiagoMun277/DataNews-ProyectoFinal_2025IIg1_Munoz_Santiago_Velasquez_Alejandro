

import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react"; 
import { logout } from "../../services/authService";
import ProfileModal from "../Account/ProfileModal"; 
import logo from "../../assets/logo.png";
import "./ReporterHeader.css"; // estilos específicos del header de reportero

export default function ReporterHeader(){
  const [openProfile, setOpenProfile] = useState(false); 
  const session = JSON.parse(localStorage.getItem("dn_session") || "null");
  const nav = useNavigate();

  const onLogout = async () => {
    await logout();
    localStorage.removeItem("dn_session");
    nav("/");
  };

  return (
    <>
      <header className="site-header reporter">
        {/* Fila 1: logo centrado, usuario a la izquierda y cerrar sesión a la derecha */}
        <div className="top-bar">
          <div className="top-inner">
            {/* izquierda: usuario */}
            <div
              className="user-chip"
              onClick={()=>setOpenProfile(true)}        //  AÑADIDO (abre modal)
              role="button" tabIndex={0}               //  AÑADIDO (accesible, sin cambiar estructura)
              style={{ cursor: "pointer" }}            //  AÑADIDO (feedback visual)
              title="Configurar perfil"
            >
              <div className="avatar" aria-hidden>👤</div>
              <div>
                <strong>{session?.displayName || "Reportero"}</strong>
                <div className="muted">{session?.email}</div>
              </div>
            </div>

            {/* centro: logo */}
            <div className="brand">
              <img src={logo} alt="DataNews" />
            </div>

            {/* derecha: cerrar sesión */}
            <div className="actions">
              <button className="btn ghost" onClick={onLogout}>Cerrar sesión</button>
            </div>
          </div>
        </div>

        {/* Fila 2: navegación (igual estilo a la pública) */}
        <nav className="main-nav">
          <div className="nav-inner">
            <NavLink to="/reportero" end>Crear</NavLink>
            <NavLink to="/reportero/mis-noticias">Mis noticias</NavLink>
          </div>
        </nav>
      </header>

      {/*  AÑADIDO: Modal de Perfil (no cambia tu header) */}
      <ProfileModal
        open={openProfile}
        onClose={()=>setOpenProfile(false)}
        session={session}
      />
    </>
  );
}
