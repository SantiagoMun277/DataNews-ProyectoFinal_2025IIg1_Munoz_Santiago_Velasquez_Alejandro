import { useEffect, useState } from "react";
import { listPublishedLatest } from "../../services/newsService";
import Loading from "../../Components/UI/Loading.jsx";
import { pingFirestore } from "../../services/diagnostics";
import NewsCardWide from "../../Components/NewsCardWide/NewsCardWide";
import "./Home.css";

export default function Home(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    useEffect(() => {
    window.scrollTo(0, 0);
    const el = document.activeElement;
    if (el && typeof el.blur === "function") el.blur();
  }, []);


  useEffect(()=>{
    (async ()=>{
      try{
        const ping = await pingFirestore();
        if (!ping.ok) {
          console.error('[Diagnostics] Firestore no responde:', ping);
          setError(`${ping.code || 'error'}: ${ping.message}`);
          setLoading(false);
          return;
        }
        const all = await listPublishedLatest(200);
        setItems(all);
      }catch(e){
        console.error(e);
        setError('No se pudieron cargar las noticias (revisa reglas de Firestore)');
      }finally{
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="container">
      <h1 className="page-title">Últimas noticias</h1>
      {loading && <Loading />}
      {error && (
        <p>Problema al leer Firestore: {error}. Verifica reglas y configuración.</p>
      )}
      {!loading && !error && items.length === 0 && (
        <p>No hay noticias publicadas por el momento.</p>
      )}
      <div className="grid">
        {items.map(n => <NewsCardWide key={n.id} n={n} />)}
      </div>
    </main>
  );
}
