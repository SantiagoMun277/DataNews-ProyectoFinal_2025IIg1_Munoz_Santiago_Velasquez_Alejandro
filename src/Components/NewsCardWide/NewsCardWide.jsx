
import { Link } from "react-router-dom";
import { formatDate } from "../../utils/formatDate";
import placeholder from "../../assets/placeholder.jpg"; // 👈 NUEVO
import "./NewsCardWide.css";

/** Espera objeto noticia n con:
 * id, imagenUrl, titulo, bajante, autorNombre, fechaCreacion, categoriaSlug
 */
export default function NewsCardWide({ n }) {
  // 👇 handler para cuando falle la carga
  const onImgError = (e) => {
    e.currentTarget.onerror = null;      // evita loop
    e.currentTarget.src = placeholder;   // usa el placeholder
  };

  return (
    <article className="wcard">
      <Link to={`/noticia/${n.id}`} className="media">
        <img
          src={n.imagenUrl || placeholder}   // 👈 si viene vacío, usa placeholder
          alt={n.titulo}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={onImgError}               // 👈 si falla, reemplaza
        />
      </Link>

      <div className="body">
        <div className="meta-top">
          <span className="chip">{n.categoriaSlug}</span>
        </div>

        <Link to={`/noticia/${n.id}`} className="title">{n.titulo}</Link>
        <p className="sub">{n.bajante}</p>

        <div className="meta-bottom">
          <span className="author">Por {n.autorNombre}</span>
          <span className="date">Publicado: {formatDate(n.fechaCreacion)}</span>
        </div>
      </div>
    </article>
  );
}
