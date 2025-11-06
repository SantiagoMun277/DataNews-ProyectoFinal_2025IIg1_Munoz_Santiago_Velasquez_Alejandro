

// src/Pages/Auth/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginWithEmail, resetPassword, logout } from "../../services/authService";
import logo from "../../assets/logo.png";
import { Mail, Lock, Eye, EyeOff, User as UserIcon } from "lucide-react";
import BackToHome from "../../Components/UI/BackToHome.jsx";
import "./Login.css";

export default function Login(){
  const nav = useNavigate();
  const [email, setEmail]   = useState("");
  const [pass,  setPass]    = useState("");
  const [show,  setShow]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [lastCode, setLastCode] = useState("");

  useEffect(()=>{
    (async ()=>{
      try { await logout(); } catch(_) {}
      try { localStorage.removeItem("dn_session"); } catch(_) {}
    })();
  },[]);

  async function logoutSafe(){
    try { await logout(); } catch(_) {}
    try { localStorage.removeItem("dn_session"); } catch(_) {}
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setErr(""); setInfo(""); setLastCode("");

    // 👇 Validación: ambos campos obligatorios
    const emailNorm = email.trim().toLowerCase();
    const passNorm  = pass.trim();
    if (!emailNorm || !passNorm) {
      setErr("Por favor completa el correo y la contraseña.");
      setLastCode("form/empty");
      return;
    }

    setLoading(true);
    try {
      // cerrar sesión previa si la hubiera
      await logoutSafe();

      const session = await loginWithEmail(emailNorm, passNorm);
      localStorage.setItem("dn_session", JSON.stringify(session));
      if (session.rol === "editor")      nav("/admin");
      else if (session.rol === "reportero") nav("/reportero");
      else nav("/");
    } catch (e) {
      const msg =
        e.code === "auth/invalid-credential" ? "Credenciales inválidas." :
        e.code === "auth/user-not-found"     ? "Usuario no encontrado." :
        e.code === "user/inactive"           ? e.message :
        "No se pudo iniciar sesión.";
      setErr(msg);
      setLastCode(e?.code || "");
    } finally {
      setLoading(false);
    }
  };

  const onRecover = async () => {
    if (loading) return;
    setErr(""); setInfo(""); setLastCode("");
    try {
      const e = email.trim().toLowerCase() || prompt("Escribe tu correo registrado:");
      if (!e) return;
      await resetPassword(e);
      setInfo(`Te enviamos un enlace de recuperación a: ${e}`);
    } catch (e) {
      const msg =
        e.code === "auth/user-not-found" ? "Ese correo no está registrado." :
        e.message === "missing-email"    ? "Debes indicar un correo." :
        "No fue posible enviar el correo de recuperación.";
      setErr(msg);
      setLastCode(e?.code || "");
    }
  };

  const isInactive = lastCode === "user/inactive" || /inactivo/i.test(err);

  return (
    <div className="login-wrap">
      <header className="login-header">
        <img src={logo} alt="DataNews" className="login-logo" />
      </header>

      <div className="back-row">
        <BackToHome />
      </div>

      <form className="login-card" onSubmit={onSubmit} noValidate>
        <div className="avatar" aria-hidden="true">
          <UserIcon className="icon-svg" />
        </div>
        <h1>Iniciar sesión</h1>

        {err && <div className="form-error">{err}</div>}
        {isInactive && (
          <div className="form-info">
            <strong>Tu cuenta está inactiva.</strong><br/>
            Pídele a un <em>Editor</em> que te active desde el panel de usuarios.<br/>
            Si ya te activaron, recarga la página o intenta de nuevo.
          </div>
        )}
        {info && <div className="form-info">{info}</div>}

        {/* Usuario (email) */}
        <label className="field">
          <span>Usuario (email)</span>
          <div className="input-icon">
            <Mail className="icon-svg" aria-hidden />
            <input
              type="email"
              placeholder="reportero@datanews.com"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              required
              autoComplete="username"
              autoFocus
              aria-invalid={lastCode === "form/empty" && !email.trim()}
              disabled={loading}
              title="Ingresa tu correo"
            />
          </div>
        </label>

        {/* Contraseña */}
        <label className="field">
          <span>Contraseña</span>
          <div className="input-icon">
            <Lock className="icon-svg" aria-hidden />
            <input
              type={show ? "text" : "password"}
              placeholder="••••••"
              value={pass}
              onChange={(e)=>setPass(e.target.value)}
              required
              autoComplete="current-password"
              aria-invalid={lastCode === "form/empty" && !pass.trim()}
              disabled={loading}
              title="Ingresa tu contraseña"
            />
            <button
              type="button"
              className="toggle-pass"
              onClick={()=>setShow(s=>!s)}
              aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
              title={show ? "Ocultar contraseña" : "Mostrar contraseña"}
              disabled={loading}
            >
              {show ? <EyeOff className="icon-svg" /> : <Eye className="icon-svg" />}
            </button>
          </div>
        </label>

        <button
          className="btn-primary"
          disabled={loading}
          aria-busy={loading}
          title="Ingresar"
        >
          {loading ? "Entrando..." : "Iniciar sesión"}
        </button>

        <p className="login-links">
          ¿No tienes cuenta? <Link to="/register">Registrarse</Link>
        </p>

        <p className="login-links small">
          ¿Olvidaste tu contraseña?{" "}
          <button
            type="button"
            className="linklike"
            onClick={onRecover}
            disabled={loading}
          >
            Recuperarla por correo
          </button>
        </p>
      </form>
    </div>
  );
}
