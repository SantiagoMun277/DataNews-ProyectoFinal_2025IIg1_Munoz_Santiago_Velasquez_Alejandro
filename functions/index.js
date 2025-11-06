// /**
//  * Import function triggers from their respective submodules:
//  *
//  * const {onCall} = require("firebase-functions/v2/https");
//  * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
//  *
//  * See a full list of supported triggers at https://firebase.google.com/docs/functions
//  */

// const {setGlobalOptions} = require("firebase-functions");
// const {onRequest} = require("firebase-functions/https");
// const logger = require("firebase-functions/logger");

// // For cost control, you can set the maximum number of containers that can be
// // running at the same time. This helps mitigate the impact of unexpected
// // traffic spikes by instead downgrading performance. This limit is a
// // per-function limit. You can override the limit for each function using the
// // `maxInstances` option in the function's options, e.g.
// // `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// // NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// // functions should each use functions.runWith({ maxInstances: 10 }) instead.
// // In the v1 API, each function can only serve one request per container, so
// // this will be the maximum concurrent request count.
// setGlobalOptions({ maxInstances: 10 });

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started

// // exports.helloWorld = onRequest((request, response) => {
// //   logger.info("Hello logs!", {structuredData: true});
// //   response.send("Hello from Firebase!");
// // });
/**
 * Cloud Functions (CommonJS)
 * - adminDeleteUser: elimina usuario en Auth + /usuarios/{uid} en Firestore
 *   Solo permitido para quien tenga rol "editor" o "admin"
 */
// functions/index.js
const { setGlobalOptions } = require("firebase-functions");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

setGlobalOptions({ maxInstances: 10, region: "us-central1" });

// Inicializa Admin SDK una sola vez
try { admin.app(); } catch { admin.initializeApp(); }
const db = admin.firestore();

// Helpers
async function getCallerRole(contextAuth) {
  // 1) Primero intenta por custom claims
  const claimRol = contextAuth?.token?.rol;
  let rol = (claimRol || "").toString().toLowerCase();
  if (rol) return rol;

  // 2) Si no hay claim, mirar el doc del propio usuario
  const callerUid = contextAuth?.uid;
  if (!callerUid) return "reportero";

  const snap = await db.doc(`usuarios/${callerUid}`).get();
  rol = (snap.data()?.rol || "reportero").toString().toLowerCase();
  return rol;
}

/**
 * Handler que borra en Auth + Firestore.
 * Requiere editor/admin autenticado.
 */
const _deleteUserHandler = async (request) => {
  const { auth: contextAuth } = request;
  if (!contextAuth) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  }

  const rol = await getCallerRole(contextAuth);
  if (!["editor", "admin"].includes(rol)) {
    throw new HttpsError("permission-denied", "Solo Editor/Admin puede eliminar usuarios.");
  }

  const targetUid = (request.data?.uid || "").trim();
  if (!targetUid) {
    throw new HttpsError("invalid-argument", "Falta el uid del usuario a eliminar.");
  }

  // 1) Borra en Auth (si existe)
  try {
    // Revoca tokens por seguridad (opcional)
    try { await admin.auth().revokeRefreshTokens(targetUid); } catch (_) {}
    await admin.auth().deleteUser(targetUid);
  } catch (e) {
    if (e?.code !== "auth/user-not-found") {
      logger.error("Error al borrar en Auth:", e);
      throw new HttpsError("internal", "No se pudo eliminar en Auth.");
    }
  }

  // 2) Borra documento en Firestore (si existe)
  try {
    await db.doc(`usuarios/${targetUid}`).delete();
  } catch (e) {
    logger.warn("Doc usuarios/{uid} no existía:", targetUid);
  }

  logger.info(`Usuario ${targetUid} eliminado por ${contextAuth.uid} (${rol}).`);
  return { ok: true, deletedUid: targetUid };
};

// Tu nombre original…
exports.adminDeleteUser = onCall(_deleteUserHandler);

// …y un alias compatible con el cliente que llame "deleteAuthUser"
exports.deleteAuthUser = onCall(_deleteUserHandler);
