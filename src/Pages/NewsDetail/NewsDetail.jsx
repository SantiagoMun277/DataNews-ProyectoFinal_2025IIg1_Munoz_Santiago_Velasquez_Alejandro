
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getNews } from "../../services/newsService";
import { formatDate } from "../../utils/formatDate";
import Loading from "../../Components/UI/Loading.jsx";
import placeholder from "../../assets/placeholder.jpg";
import "./NewsDetailContent.css"; // 👈 importa el CSS externo

export default function NewsDetail(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [n, setN] = useState(null);
  const [error, setError] = useState(null);

  useEffect(()=>{
    const realId = decodeURIComponent(id || "");

    getNews(realId)
      .then((data)=>{
        const estado = String(data?.estado ?? "")
          .normalize("NFD").replace(/\p{Diacritic}/gu, "")
          .trim().toLowerCase();

        if (data && estado === "publicado") setN(data);
        else setError("Noticia no disponible");
      })
      .catch(()=>setError("No se pudo cargar la noticia"));
  }, [id]);

  if (error) return <main className="container"><p>{error}</p></main>;
  if (!n)    return <main className="container"><Loading /></main>;

  const onImgError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = placeholder;
  };

  // --- helpers para mostrar HTML o texto plano sin desbordes
  function escapeHtml(txt){
    return String(txt)
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;")
      .replace(/'/g,"&#39;");
  }
  function toSafeHtml(content){
    const raw = String(content ?? "").trim();
    if (!raw) return '<p class="muted">Sin contenido.</p>';

    // Si parece HTML, úsalo
    const looksHtml = /<\/?[a-z][\s\S]*>/i.test(raw);
    if (looksHtml) return raw;

    // Texto plano → escapar y respetar saltos de línea
    const esc = escapeHtml(raw).replace(/\r?\n/g, "<br/>");
    return `<p>${esc}</p>`;
  }

  const html = toSafeHtml(n.contenidoHTML);

  return (
    <main className="container article">
      <button className="btn ghost" onClick={()=>navigate(-1)}>← Volver</button>
      <h1 className="article-title">{n.titulo}</h1>
      <p className="article-sub">{n.bajante}</p>

      <img
        className="article-img"
        src={n.imagenUrl || placeholder}
        alt={n.titulo}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={onImgError}
      />

      <div className="article-meta">
        <span className="chip">{n.categoriaSlug}</span>
        <span>• Por {n.autorNombre}</span>
      </div>

      <div className="article-content" dangerouslySetInnerHTML={{__html: html}} />

      <footer className="article-footer">
        <small>Creación: {formatDate(n.fechaCreacion)}</small>
        <small>Actualización: {formatDate(n.fechaActualizacion)}</small>
      </footer>
    </main>
  );
}
