import { memo } from "react";
import "./Footer.css";

function BackofficeFooter(){
  const year = new Date().getFullYear();
  return (
    <footer className="bo-footer">
      <div className="bo-inner container">
        <div className="bo-brand">
          <strong>DataNews</strong> • Panel
        </div>

        <div className="bo-meta">
          <span>© {year} DataNews</span>
          <span className="dot">•</span>
          <a href="/acerca" className="link">Acerca</a>
          <span className="dot">•</span>
          <a href="/contacto" className="link">Contacto</a>
          <span className="dot">•</span>
          <a href="/politica-privacidad" className="link">Privacidad</a>
        </div>
      </div>
    </footer>
  );
}

export default memo(BackofficeFooter);
