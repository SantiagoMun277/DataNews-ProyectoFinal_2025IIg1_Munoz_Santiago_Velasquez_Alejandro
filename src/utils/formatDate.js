// Convierte el timestamp de Firestore o una fecha JS a objeto Date
export function tsToDate(ts) {
  if (!ts) return null;
  // Firestore timestamp con .toDate()
  if (ts.toDate) return ts.toDate();
  // Firestore timestamp con .seconds
  if (ts.seconds) return new Date(ts.seconds * 1000);
  // Si ya es una Date normal o string
  return new Date(ts);
}

// Formatea la fecha a texto legible en español
export function formatDate(ts) {
  const d = tsToDate(ts);
  if (!d || isNaN(d)) return "";
  return d.toLocaleString("es-CO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
