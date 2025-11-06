import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { listActiveSections } from "../../services/sectionService";
import logo from "../../assets/logo.png";
import "./Footer.css";

/**
 * Footer de DataNews
 * Columna 1: Navegación (Inicio + secciones)
 * Columna 2: Marca (logo, frase, creadores, tipo de trabajo)
 * Columna 3: Contactos
 */
export default function Footer(){
  const [secs, setSecs] = useState([]);

  useEffect(() => {
    listActiveSections().then(setSecs).catch(() => {
      // Fallback por si Firestore aún no responde
      setSecs([
        { slug: "politica", nombre: "Política" },
        { slug: "deportes", nombre: "Deportes" },
        { slug: "salud", nombre: "Salud" },
        { slug: "tecnologia", nombre: "Tecnología" },
      ]);
    });
  }, []);

  return (
    <footer className="site-footer">
      <div className="wrap">
        {/* Columna izquierda: Navegación */}
        <div className="fcol navcol">
          <h4>Navegación</h4>
          <ul>
            <li><NavLink to="/" end>Inicio</NavLink></li>
            {secs.map(s => (
              <li key={s.slug}>
                <NavLink to={`/seccion/${s.slug}`}>{s.nombre}</NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Columna centro: Marca/Info */}
        <div className="fcol brandcol">
          <div className="brandline">
            <img src={logo} alt="DataNews" />
            <span>DataNews</span>
          </div>
          <p className="phrase">Frase del noticiero: información clara y al instante.</p>
          <div className="meta">
            <p><strong>Equipo:</strong>Alejandro Velasquez Hurtatis - Santiago Muñoz Muñoz</p>
            <p><strong>Tipo de trabajo:</strong> Proyecto académico</p>
          </div>
        </div>

        {/* Columna derecha: Contactos */}
        <div className="fcol contactcol">
          <h4>Contactos</h4>
          <ul>
            <li><a href="mailto:contacto@datanews.com">contacto@datanews.com</a></li>
            <li><a href="https://instagram.com/" target="_blank" rel="noreferrer">@datanews</a></li>
            <li><a href="https://x.com/" target="_blank" rel="noreferrer">X/Twitter</a></li>
          </ul>
        </div>
      </div>

      {/* barra inferior */}
      <div className="footbar">
        <div className="container footbar-inner">
          <span>© {new Date().getFullYear()} DataNews</span>
          <span className="sep">•</span>
          <span>
            <Link to="/">Inicio</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
