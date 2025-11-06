import { Link } from "react-router-dom";

export default function BackToHome({ className = "" }) {
  return (
    <Link to="/" className={`btn-back ${className}`} aria-label="Volver al inicio">
      ← Volver al inicio
    </Link>
  );
}
