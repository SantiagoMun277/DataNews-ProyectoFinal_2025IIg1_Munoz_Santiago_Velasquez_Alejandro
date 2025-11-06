import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { listActiveSections } from "../../services/sectionService";
import logo from "../../assets/logo.png";
import "./Header.css";

export default function Header() {
  const [sections, setSections] = useState([]);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    listActiveSections()
      .then(setSections)
      .catch(() => setSections([]));
  }, []);

  const staticLinks = [
    { slug: 'cultura', nombre: 'Cultura' },
    { slug: 'deportes', nombre: 'Deportes' },
    { slug: 'salud', nombre: 'Salud' },
    { slug: 'tecnologia', nombre: 'Tecnología' },
  ];
  const merged = [
    ...staticLinks,
    ...sections.filter(s => !staticLinks.some(x => x.slug === s.slug)),
  ];

  // Alternativa estable: usa scroll con umbrales + requestAnimationFrame (sin parpadeo)
  useEffect(() => {
    const ENTER_AT = 100; // px para activar compacto
    const EXIT_AT = 30;   // px para volver a expandido
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY || document.documentElement.scrollTop || 0;
        setCompact(prev => {
          if (!prev && y > ENTER_AT) return true;
          if (prev && y < EXIT_AT) return false;
          return prev;
        });
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`site-header${compact ? ' compact' : ''}`}>
      {/* Fila 1: logo centrado + botones a la derecha */}
      <div className="top-bar">
        <div className="top-inner">
          <div className="brand">
            <img src={logo} alt="DataNews" />
          </div>
          <div className="actions">
            <Link className="btn ghost" to="/login">Iniciar sesión</Link>
            <Link className="btn" to="/register">Registrarse</Link>
          </div>
        </div>
      </div>

      {/* Fila 2: navegación */}
      <nav className="main-nav">
        <div className="nav-inner">
          <NavLink to="/" end>Inicio</NavLink>
          {merged.map(sec => (
            <NavLink key={sec.slug} to={`/seccion/${sec.slug}`}>
              {sec.nombre}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}
