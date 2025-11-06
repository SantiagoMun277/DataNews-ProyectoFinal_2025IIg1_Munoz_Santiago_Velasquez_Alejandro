import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { listPublishedBySection } from "../../services/newsService";
import NewsCardWide from "../../Components/NewsCardWide/NewsCardWide.jsx";
import Loading from "../../Components/UI/Loading.jsx";

export default function Section(){
  const { slug } = useParams();
  const [items, setItems] = useState(null);

  useEffect(()=>{ listPublishedBySection(slug).then(setItems).catch(()=>setItems([])); }, [slug]);

  return (
    <main className="container">
      <h1 className="page-title">{slug.charAt(0).toUpperCase() + slug.slice(1)}</h1>
      {items === null ? <Loading /> : null}
      {items && items.length === 0 && (
        <p>No hay noticias publicadas en esta sección.</p>
      )}
      <div className="grid">
        {(items || []).map(n => <NewsCardWide key={n.id} n={n} />)}
      </div>
    </main>
  );
}
