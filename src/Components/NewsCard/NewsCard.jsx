import { Link } from "react-router-dom";
import { formatDate } from "../../utils/formatDate";

export default function NewsCard({ n }){
  return (
    <article className="card">
      <Link to={`/noticia/${n.id}`} className="card-media">
        <img src={n.imagenUrl} alt={n.titulo} className="card-img" />
      </Link>
      <div className="card-body">
        <div className="card-meta">
          <span className="chip">{n.categoriaSlug}</span>
          <span>• {n.autorNombre}</span>
          {n.fechaActualizacion ? (<span className="muted">{formatDate(n.fechaActualizacion)}</span>) : null}
        </div>
        <Link className="card-title" to={`/noticia/${n.id}`}>{n.titulo}</Link>
        <p className="card-sub">{n.bajante}</p>
      </div>
    </article>
  );
}

