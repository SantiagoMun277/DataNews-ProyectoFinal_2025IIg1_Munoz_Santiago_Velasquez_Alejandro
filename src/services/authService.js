


// src/services/authService.js
import { auth, db } from "../FirebaseConfig/FirebaseConfig";
import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile,
  // 👇 AÑADIDO
  sendPasswordResetEmail,
  // 👇 AÑADIDOS (para cambiar contraseña con reauth)
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

function normEmail(e) {
  return (e || "").trim().toLowerCase();
}

function mapAuthError(err) {
  const code = err?.code || "";
  if (code.includes("invalid-credential") || code.includes("wrong-password")) {
    return "Correo o contraseña inválidos.";
  }
  if (code.includes("user-not-found")) {
    return "No existe una cuenta con ese correo.";
  }
  if (code.includes("too-many-requests")) {
    return "Demasiados intentos. Intenta más tarde.";
  }
  return err.message || "Error de autenticación.";
}
// 👇 Pega esto en cualquier parte del archivo (por ejemplo debajo de logout)
export async function signOutIfDifferentEmail(targetEmail) {
  const cur = auth.currentUser;
  const want = (targetEmail || "").trim().toLowerCase();
  if (cur && cur.email && cur.email.toLowerCase() !== want) {
    // hay sesión de otro usuario en este mismo origen → ciérrala
    await signOut(auth);
    try { localStorage.removeItem("dn_session"); } catch {}
  }
}

/** LOGIN */
export async function loginWithEmail(email, password) {
  try {
    const { user } = await signInWithEmailAndPassword(
      auth,
      normEmail(email),
      password
    );

    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);

    // Si no hay perfil en Firestore, devolvemos mínimos desde Auth
    if (!snap.exists()) {
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "Usuario",
        rol: "reportero",
        activo: true,
      };
    }

    const perfil = snap.data();

    if (perfil.activo === false) {
      await signOut(auth);
      const e = new Error("Tu usuario está inactivo. Contacta al editor.");
      e.code = "user/inactive";
      throw e;
    }

    return {
      uid: user.uid,
      email: perfil.email || user.email,
      displayName: perfil.displayName || user.displayName || "Usuario",
      rol: perfil.rol || "reportero",
      activo: perfil.activo !== false,
    };
  } catch (err) {
    // Propagamos un error limpio
    const e = new Error(mapAuthError(err));
    e.code = err?.code;
    throw e;
  }
}

/** LOGOUT */
export async function logout() {
  await signOut(auth);
}

/** REGISTER (opcional, por si lo necesitas ya) */
export async function registerUser({ email, password, displayName }) {
  const { user } = await createUserWithEmailAndPassword(
    auth,
    normEmail(email),
    password
  );

  if (displayName) {
    await updateProfile(user, { displayName });
  }

  await setDoc(doc(db, "usuarios", user.uid), {
    uid: user.uid,
    email: normEmail(email),
    displayName: displayName || user.displayName || email.split("@")[0],
    rol: "reportero",       // por ahora fijo; luego podrás cambiar desde un panel
    activo: true,
    createdAt: serverTimestamp(),
  });

  return user.uid;
}

/** 👇 AÑADIDO: Recuperar contraseña por correo */
export async function resetPassword(email) {
  const e = normEmail(email);
  if (!e) {
    const err = new Error("Debes indicar un correo.");
    err.code = "missing-email";
    throw err;
  }
  await sendPasswordResetEmail(auth, e);
  return true;
}

/* =========================================================
   👇 AÑADIDOS sin tocar lo existente
   - updateDisplayName: cambia el nombre visible del usuario
   - changePassword: cambia contraseña con reautenticación
   ========================================================= */

/** Actualiza el nombre visible en Firebase Auth y (si existe) en la colección usuarios/{uid}. */
export async function updateDisplayName(newName) {
  const user = auth.currentUser;
  if (!user) throw new Error("No hay sesión activa.");
  const name = (newName || "").trim();
  if (!name) throw new Error("El nombre no puede estar vacío.");

  // Auth
  await updateProfile(user, { displayName: name });

  // Firestore (merge si existe el doc)
  try {
    await setDoc(
      doc(db, "usuarios", user.uid),
      { displayName: name, nombre: name, updatedAt: serverTimestamp() },
      { merge: true }
    );
  } catch (_) { /* opcional: ignorar si no existe */ }

  // Refrescar cache local (dn_session) si la usas en el header
  try {
    const s = JSON.parse(localStorage.getItem("dn_session") || "null") || {};
    localStorage.setItem("dn_session", JSON.stringify({ ...s, displayName: name, nombre: name }));
  } catch (_) {}

  return true;
}

/** Cambia la contraseña pidiendo la contraseña actual para reautenticar. */
export async function changePassword(currentPassword, newPassword) {
  const user = auth.currentUser;
  if (!user) throw new Error("No hay sesión activa.");
  if (!currentPassword || !newPassword) {
    throw new Error("Debes completar todos los campos de contraseña.");
  }
  if (newPassword.length < 6) {
    throw new Error("La nueva contraseña debe tener al menos 6 caracteres.");
  }

  // Reautenticación necesaria antes de updatePassword
  const cred = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, cred);
  await updatePassword(user, newPassword);

  return true;
}
