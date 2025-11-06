

// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { registerUser } from "../../services/authService";
// import logo from "../../assets/logo.png";
// import { User as UserIcon, Mail, Lock, Eye, EyeOff, FileEdit } from "lucide-react"; // 👈 íconos
// import "./Login.css"; // reutiliza los estilos del login

// export default function Register(){
//   const nav = useNavigate();
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [pass1, setPass1] = useState("");
//   const [pass2, setPass2] = useState("");
//   const [show, setShow]   = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [err, setErr] = useState("");

//   const onSubmit = async (e) => {
//     e.preventDefault();
//     setErr("");

//     if (!name.trim()) return setErr("Ingresa tu nombre.");
//     if (pass1.length < 6) return setErr("La contraseña debe tener al menos 6 caracteres.");
//     if (pass1 !== pass2)  return setErr("Las contraseñas no coinciden.");

//     setLoading(true);
//     try {
//       await registerUser({
//         email: email.trim(),
//         password: pass1,
//         displayName: name.trim()
//       });
//       nav("/login"); // al terminar, envía a iniciar sesión
//     } catch (e) {
//       const msg =
//         e.code === "auth/email-already-in-use" ? "Ese correo ya está registrado." :
//         e.code === "auth/invalid-email"        ? "Correo inválido." :
//         "No se pudo crear la cuenta.";
//       setErr(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="login-wrap">
//       <header className="login-header">
//         <img src={logo} alt="DataNews" className="login-logo" />
//       </header>

//       <form className="login-card" onSubmit={onSubmit}>
//         <div className="avatar" aria-hidden="true">
//           <FileEdit className="icon-svg" />
//         </div>
//         <h1>Crear Cuenta</h1>
//         <p className="muted">Regístrate en el sistema CMS</p>

//         {err && <div className="form-error">{err}</div>}

//         <label className="field">
//           <span>Nombre Completo</span>
//           <div className="input-icon">
//             <UserIcon className="icon-svg" aria-hidden />
//             <input
//               type="text"
//               placeholder="Juan Pérez"
//               value={name}
//               onChange={e=>setName(e.target.value)}
//               autoComplete="name"
//               required
//             />
//           </div>
//         </label>

//         <label className="field">
//           <span>Correo Electrónico</span>
//           <div className="input-icon">
//             <Mail className="icon-svg" aria-hidden />
//             <input
//               type="email"
//               placeholder="usuario@datanews.com"
//               value={email}
//               onChange={e=>setEmail(e.target.value)}
//               autoComplete="email"
//               required
//             />
//           </div>
//         </label>

//         <label className="field">
//           <span>Contraseña</span>
//           <div className="input-icon">
//             <Lock className="icon-svg" aria-hidden />
//             <input
//               type={show ? "text" : "password"}
//               placeholder="••••••"
//               value={pass1}
//               onChange={e=>setPass1(e.target.value)}
//               autoComplete="new-password"
//               required
//             />
//             <button
//               type="button"
//               className="toggle-pass"
//               onClick={()=>setShow(s=>!s)}
//               aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
//               title={show ? "Ocultar contraseña" : "Mostrar contraseña"}
//             >
//               {show ? <EyeOff className="icon-svg" /> : <Eye className="icon-svg" />}
//             </button>
//           </div>
//         </label>

//         <label className="field">
//           <span>Confirmar Contraseña</span>
//           <div className="input-icon">
//             <Lock className="icon-svg" aria-hidden />
//             <input
//               type={show ? "text" : "password"}
//               placeholder="••••••"
//               value={pass2}
//               onChange={e=>setPass2(e.target.value)}
//               autoComplete="new-password"
//               required
//             />
//           </div>
//         </label>

//         <button className="btn-primary" disabled={loading}>
//           {loading ? "Creando cuenta..." : "Crear Cuenta"}
//         </button>

//         <p className="login-links">
//           ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
//         </p>
//       </form>
//     </div>
//   );
// }

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../services/authService";
import logo from "../../assets/logo.png";
import { User as UserIcon, Mail, Lock, Eye, EyeOff, FileEdit } from "lucide-react";
import BackToHome from "../../Components/UI/BackToHome.jsx"; // 👈 botón reutilizable
import "./Login.css"; // reutiliza estilos

export default function Register(){
  const nav = useNavigate();
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [pass1, setPass1] = useState("");
  const [pass2, setPass2] = useState("");
  const [show, setShow]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!name.trim()) return setErr("Ingresa tu nombre.");
    if (pass1.length < 6) return setErr("La contraseña debe tener al menos 6 caracteres.");
    if (pass1 !== pass2)  return setErr("Las contraseñas no coinciden.");

    setLoading(true);
    try {
      await registerUser({
        email: email.trim(),
        password: pass1,
        displayName: name.trim(),
      });
      nav("/login");
    } catch (e) {
      const msg =
        e.code === "auth/email-already-in-use" ? "Ese correo ya está registrado." :
        e.code === "auth/invalid-email"        ? "Correo inválido." :
        "No se pudo crear la cuenta.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <header className="login-header">
        <img src={logo} alt="DataNews" className="login-logo" />
      </header>

      {/* ← Botón centrado para volver a Inicio */}
      <div className="back-row">
        <BackToHome />
      </div>

      <form className="login-card" onSubmit={onSubmit}>
        <div className="avatar" aria-hidden="true">
          <FileEdit className="icon-svg" />
        </div>
        <h1>Crear Cuenta</h1>
        <p className="muted">Regístrate en el sistema CMS</p>

        {err && <div className="form-error">{err}</div>}

        <label className="field">
          <span>Nombre Completo</span>
          <div className="input-icon">
            <UserIcon className="icon-svg" aria-hidden />
            <input
              type="text"
              placeholder="Juan Pérez"
              value={name}
              onChange={e=>setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>
        </label>

        <label className="field">
          <span>Correo Electrónico</span>
          <div className="input-icon">
            <Mail className="icon-svg" aria-hidden />
            <input
              type="email"
              placeholder="usuario@datanews.com"
              value={email}
              onChange={e=>setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
        </label>

        <label className="field">
          <span>Contraseña</span>
          <div className="input-icon">
            <Lock className="icon-svg" aria-hidden />
            <input
              type={show ? "text" : "password"}
              placeholder="••••••"
              value={pass1}
              onChange={e=>setPass1(e.target.value)}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="toggle-pass"
              onClick={()=>setShow(s=>!s)}
              aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
              title={show ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {show ? <EyeOff className="icon-svg" /> : <Eye className="icon-svg" />}
            </button>
          </div>
        </label>

        <label className="field">
          <span>Confirmar Contraseña</span>
          <div className="input-icon">
            <Lock className="icon-svg" aria-hidden />
            <input
              type={show ? "text" : "password"}
              placeholder="••••••"
              value={pass2}
              onChange={e=>setPass2(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
        </label>

        <button className="btn-primary" disabled={loading}>
          {loading ? "Creando cuenta..." : "Crear Cuenta"}
        </button>

        <p className="login-links">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </p>
      </form>
    </div>
  );
}
