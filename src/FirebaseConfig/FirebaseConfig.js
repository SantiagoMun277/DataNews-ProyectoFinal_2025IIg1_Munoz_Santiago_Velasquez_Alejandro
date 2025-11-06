
// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// 👇 AÑADIDO: initializeFirestore para setear opciones sin romper lo actual
import { getFirestore, initializeFirestore } from "firebase/firestore";
// (opcional para el futuro) import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAQxI2C717S5d2HAPhDIB97pp1m7Ag9K6o",
  authDomain: "cms-noticias-datanews.firebaseapp.com",
  projectId: "cms-noticias-datanews",
  storageBucket: "cms-noticias-datanews.firebasestorage.app",
  messagingSenderId: "819998494121",
  appId: "1:819998494121:web:68c6fc8062c6bfba3208b8",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

//  AÑADIDO: intenta usar initializeFirestore con opciones “safe” en dev.
// Si falla (o si ya está inicializado), hace fallback a getFirestore (tu comportamiento actual).
let _db;
try {
  _db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true, // elige transporte estable (útil en localhost/proxys)
    useFetchStreams: false,                  // evita fetch streams que suelen mostrar 400 terminate
  });
} catch (_) {
  _db = getFirestore(app);
}
export const db = _db;

// export const storage = getStorage(app); // <- lo usaremos cuando actives Blaze
export default app;
