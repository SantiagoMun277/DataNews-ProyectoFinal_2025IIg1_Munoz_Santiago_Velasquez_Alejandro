import { Link, useNavigate } from "react-router-dom";
import img404 from "../../assets/404.png";

export default function NotFound() {
  const nav = useNavigate();
  const goBack = () => (window.history.length > 1 ? nav(-1) : nav("/"));

  return (
    <main className="container" style={{ textAlign: "center", padding: "48px 12px" }}>
      <img
        src={img404}
        alt="Página no encontrada"
        style={{ maxWidth: 420, width: "100%", borderRadius: 12, opacity: 0.95 }}
      />
      <h1 style={{ marginTop: 16, marginBottom: 8 }}>Página no encontrada</h1>
      <p className="muted" style={{ marginBottom: 20 }}>
        La ruta solicitada no existe o cambió de ubicación.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <button className="btn ghost" onClick={goBack}>Volver</button>
        <Link className="btn" to="/">Ir al inicio</Link>
      </div>
    </main>
  );
}

