// // src/Components/Account/ProfileModal.jsx
// import { useState } from "react";
// import { changePassword, updateDisplayName } from "../../services/authService";
// import "./ProfileModal.css";

// export default function ProfileModal({ open, onClose, session }) {
//   const [name, setName] = useState(session?.displayName || session?.nombre || "");
//   const email = session?.email || "";
//   const [savingName, setSavingName] = useState(false);
//   const [msgName, setMsgName] = useState("");

//   const [currPass, setCurrPass] = useState("");
//   const [newPass, setNewPass] = useState("");
//   const [confirmPass, setConfirmPass] = useState("");
//   const [savingPass, setSavingPass] = useState(false);
//   const [msgPass, setMsgPass] = useState("");

//   if (!open) return null;

//   const onSaveName = async (e) => {
//     e.preventDefault();
//     setMsgName("");
//     if (!name.trim()) return setMsgName("El nombre no puede estar vacío.");
//     try {
//       setSavingName(true);
//       await updateDisplayName(name.trim());
//       setMsgName("Nombre actualizado ✅");
//     } catch (err) {
//       setMsgName(err?.message || "No se pudo actualizar el nombre.");
//     } finally {
//       setSavingName(false);
//     }
//   };

//   const onSavePass = async (e) => {
//     e.preventDefault();
//     setMsgPass("");
//     if (!currPass || !newPass || !confirmPass) return setMsgPass("Completa todos los campos.");
//     if (newPass.length < 6) return setMsgPass("La nueva contraseña debe tener al menos 6 caracteres.");
//     if (newPass !== confirmPass) return setMsgPass("La confirmación no coincide.");
//     try {
//       setSavingPass(true);
//       await changePassword(currPass, newPass);
//       setMsgPass("Contraseña actualizada ✅");
//       setCurrPass(""); setNewPass(""); setConfirmPass("");
//     } catch (err) {
//       // Errores comunes: auth/wrong-password, auth/too-many-requests
//       setMsgPass(err?.message || "No se pudo cambiar la contraseña.");
//     } finally {
//       setSavingPass(false);
//     }
//   };

//   return (
//     <div className="modal-backdrop" onClick={onClose}>
//       <div className="modal-card" onClick={(e)=>e.stopPropagation()}>
//         <div className="modal-header">
//           <div className="modal-avatar" aria-hidden>👤</div>
//           <div>
//             <strong>{session?.displayName || session?.nombre || "Usuario"}</strong>
//             <div className="muted">{email}</div>
//           </div>
//           <button className="icon-btn" onClick={onClose} aria-label="Cerrar">✕</button>
//         </div>

//         {/* Cambiar nombre */}
//         <section className="modal-section">
//           <h3>Nombre</h3>
//           <form onSubmit={onSaveName} className="form-grid">
//             <label>Nombre visible</label>
//             <input
//               type="text"
//               value={name}
//               onChange={(e)=>setName(e.target.value)}
//               placeholder="Tu nombre"
//             />
//             <label>Correo (no editable)</label>
//             <input type="email" value={email} disabled />
//             <div className="row end">
//               <button className="btn" disabled={savingName}>{savingName ? "Guardando..." : "Guardar cambios"}</button>
//               <button type="button" className="btn ghost" onClick={onClose}>Cancelar</button>
//             </div>
//             {!!msgName && <p className="form-msg">{msgName}</p>}
//           </form>
//         </section>

//         <hr />

//         {/* Cambiar contraseña */}
//         <section className="modal-section">
//           <h3>Contraseña</h3>
//           <form onSubmit={onSavePass} className="form-grid">
//             <label>Contraseña actual</label>
//             <input type="password" value={currPass} onChange={(e)=>setCurrPass(e.target.value)} />
//             <label>Nueva contraseña</label>
//             <input type="password" value={newPass} onChange={(e)=>setNewPass(e.target.value)} />
//             <label>Confirmar contraseña</label>
//             <input type="password" value={confirmPass} onChange={(e)=>setConfirmPass(e.target.value)} />
//             <div className="row end">
//               <button className="btn" disabled={savingPass}>{savingPass ? "Guardando..." : "Actualizar contraseña"}</button>
//               <button type="button" className="btn ghost" onClick={onClose}>Cancelar</button>
//             </div>
//             {!!msgPass && <p className="form-msg">{msgPass}</p>}
//           </form>
//         </section>
//       </div>
//     </div>
//   );
// }

// src/Components/Account/ProfileModal.jsx
import { useState } from "react";
import { changePassword, updateDisplayName } from "../../services/authService";
import "./ProfileModal.css";

// 👇 AÑADIDO: mapeo de errores de Firebase a mensajes claros
function prettyAuthMessage(err, fallback = "Ocurrió un error. Intenta de nuevo.") {
  const code = (err?.code || "").toLowerCase();

  // Password / reauth
  if (code.includes("invalid-credential") || code.includes("wrong-password")) {
    return "La contraseña actual es incorrecta.";
  }
  if (code.includes("requires-recent-login")) {
    return "Por seguridad, vuelve a iniciar sesión e inténtalo de nuevo.";
  }
  if (code.includes("too-many-requests")) {
    return "Demasiados intentos. Espera unos minutos e inténtalo nuevamente.";
  }
  if (code.includes("weak-password")) {
    return "La nueva contraseña es muy débil. Usa al menos 6 caracteres.";
  }

  // Red / clave
  if (code.includes("network-request-failed")) {
    return "Problema de conexión. Verifica tu internet e inténtalo otra vez.";
  }
  if (code.includes("invalid-api-key")) {
    return "La clave de la API no es válida (configuración).";
  }

  // Generales
  if (code.includes("user-not-found")) {
    return "No existe una cuenta con ese correo.";
  }
  if (code.includes("permission-denied")) {
    return "No tienes permisos para realizar esta acción.";
  }

  // Si Firebase trae un message legible, úsalo; si no, usa fallback
  return err?.message?.replace(/^Firebase:\s*Error\s*\([^)]+\)\.\s*/i, "").trim() || fallback;
}

export default function ProfileModal({ open, onClose, session }) {
  const [name, setName] = useState(session?.displayName || session?.nombre || "");
  const email = session?.email || "";
  const [savingName, setSavingName] = useState(false);
  const [msgName, setMsgName] = useState("");

  const [currPass, setCurrPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [savingPass, setSavingPass] = useState(false);
  const [msgPass, setMsgPass] = useState("");

  if (!open) return null;

  const onSaveName = async (e) => {
    e.preventDefault();
    setMsgName("");
    if (!name.trim()) return setMsgName("El nombre no puede estar vacío.");
    try {
      setSavingName(true);
      await updateDisplayName(name.trim());
      setMsgName("Nombre actualizado ✅");
    } catch (err) {
      setMsgName(prettyAuthMessage(err, "No se pudo actualizar el nombre."));
    } finally {
      setSavingName(false);
    }
  };

  const onSavePass = async (e) => {
    e.preventDefault();
    setMsgPass("");
    if (!currPass || !newPass || !confirmPass) return setMsgPass("Completa todos los campos.");
    if (newPass.length < 6) return setMsgPass("La nueva contraseña debe tener al menos 6 caracteres.");
    if (newPass !== confirmPass) return setMsgPass("La confirmación no coincide.");
    try {
      setSavingPass(true);
      await changePassword(currPass, newPass);
      setMsgPass("Contraseña actualizada ✅");
      setCurrPass(""); setNewPass(""); setConfirmPass("");
    } catch (err) {
      setMsgPass(prettyAuthMessage(err, "No se pudo cambiar la contraseña."));
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e)=>e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-avatar" aria-hidden>👤</div>
          <div>
            <strong>{session?.displayName || session?.nombre || "Usuario"}</strong>
            <div className="muted">{email}</div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {/* Cambiar nombre */}
        <section className="modal-section">
          <h3>Nombre</h3>
          <form onSubmit={onSaveName} className="form-grid">
            <label>Nombre visible</label>
            <input
              type="text"
              value={name}
              onChange={(e)=>setName(e.target.value)}
              placeholder="Tu nombre"
            />
            <label>Correo (no editable)</label>
            <input type="email" value={email} disabled />
            <div className="row end">
              <button className="btn" disabled={savingName}>{savingName ? "Guardando..." : "Guardar cambios"}</button>
              <button type="button" className="btn ghost" onClick={onClose}>Cancelar</button>
            </div>
            {!!msgName && <p className="form-msg" aria-live="polite">{msgName}</p>}
          </form>
        </section>

        <hr />

        {/* Cambiar contraseña */}
        <section className="modal-section">
          <h3>Contraseña</h3>
          <form onSubmit={onSavePass} className="form-grid">
            <label>Contraseña actual</label>
            <input type="password" value={currPass} onChange={(e)=>setCurrPass(e.target.value)} />
            <label>Nueva contraseña</label>
            <input type="password" value={newPass} onChange={(e)=>setNewPass(e.target.value)} />
            <label>Confirmar contraseña</label>
            <input type="password" value={confirmPass} onChange={(e)=>setConfirmPass(e.target.value)} />
            <div className="row end">
              <button className="btn" disabled={savingPass}>{savingPass ? "Guardando..." : "Actualizar contraseña"}</button>
              <button type="button" className="btn ghost" onClick={onClose}>Cancelar</button>
            </div>
            {!!msgPass && <p className="form-msg" aria-live="polite">{msgPass}</p>}
          </form>
        </section>
      </div>
    </div>
  );
}
