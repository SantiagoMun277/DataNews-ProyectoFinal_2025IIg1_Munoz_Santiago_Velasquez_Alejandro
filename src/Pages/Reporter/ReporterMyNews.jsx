

// src/Pages/Reporter/ReporterMyNews.jsx
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listMyNews, updateStatus, deleteNews } from '../../services/newsService';

//  Convierte Timestamp/ISO/Date/number a milisegundos
function toMillis(v){
  try{
    if (!v) return 0;
    if (typeof v?.toDate === 'function') return v.toDate().getTime(); // Firestore Timestamp
    if (v instanceof Date) return v.getTime();
    if (typeof v === 'number') return v;
    if (typeof v === 'string') return Date.parse(v) || 0;
  }catch{}
  return 0;
}

export default function ReporterMyNews(){
  const session = JSON.parse(localStorage.getItem('dn_session') || 'null');
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  // estilos inline para que SIEMPRE se vean
  const btnBase = {
    minWidth: 116, padding: '8px 12px', borderRadius: 10, fontWeight: 600,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    lineHeight: 1, textDecoration: 'none', borderWidth: 1, borderStyle: 'solid', cursor: 'pointer',
  };
  const btnEdit   = { ...btnBase, background:'#ffedd5', borderColor:'#f59e0b', color:'#92400e' };
  const btnFinish = { ...btnBase, background:'#e0f2fe', borderColor:'#38bdf8', color:'#075985' };
  const btnDanger = { ...btnBase, background:'#fee2e2', borderColor:'#ef4444', color:'#7f1d1d' };

  async function load(){
    if (!session?.uid) return;
    setLoading(true);
    try{
      const data = await listMyNews(session.uid);
      // Ordenar por fecha de creación DESC robusto
      data.sort((a,b)=>{
        const A = toMillis(a.createdAt || a.fechaCreacion);
        const B = toMillis(b.createdAt || b.fechaCreacion);
        return B - A;
      });
      setRows(data);
    } finally {
      setLoading(false);
    }
  }
  useEffect(()=>{ load(); /* eslint-disable-line */ },[]);

  const filtered = useMemo(()=>{
    const t = q.trim().toLowerCase();
    return t ? rows.filter(r => (r.titulo||'').toLowerCase().includes(t)) : rows;
  },[rows,q]);

  const onFinish = async (id)=>{
    await updateStatus(id, 'Terminado');
    await load();
  };

  // ⬇ BORRADO DEFINITIVO
  const onDelete = async (id)=>{
    if (!confirm('¿Eliminar definitivamente esta noticia? Esta acción NO se puede deshacer.')) return;
    await deleteNews(id);
    await load();
  };

  const badgeClass = (estado='')=>{
    const e = (estado || '').toLowerCase();
    if (e === 'publicado')   return 'badge ok';
    if (e === 'terminado')   return 'badge warn';
    if (e === 'desactivado') return 'badge muted';
    return 'badge';
  };

  return (
    <div>
      <h2 style={{marginBottom:4}}>Panel de edición</h2>
      <p className="muted" style={{marginTop:0, marginBottom:12}}>
        Todas las noticias de este usuario
      </p>

      {/* Buscador */}
      <div className="form-row" style={{marginBottom:14}}>
        <input
          placeholder="Buscar por título"
          value={q}
          onChange={e=>setQ(e.target.value)}
          style={{maxWidth:360}}
        />
      </div>

      {/* Tabla */}
      {loading ? <p>Cargando…</p> : (
        <div className="card" style={{padding:0}}>
          <table className="table" style={{margin:0}}>
            <thead>
              <tr>
                <th style={{width:140}}>Estado</th>
                <th>Título</th>
                <th style={{width:180}}>Categoría</th>
                <th style={{width:360}}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(n=>(
                <tr key={n.id}>
                  <td><span className={badgeClass(n.estado)}>{n.estado || 'Edición'}</span></td>
                  <td>{n.titulo || '(Sin título)'}</td>
                  <td>{n.categoriaSlug || '-'}</td>
                  <td>
                    <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                      <Link className="btn" to={`/reportero/editar/${n.id}`} style={btnEdit}>
                        Editar
                      </Link>
                      {(n.estado!=='Terminado' && n.estado!=='Publicado') &&
                        <button type="button" className="btn" onClick={()=>onFinish(n.id)} style={btnFinish}>
                          Terminado
                        </button>}
                      <button type="button" className="btn" onClick={()=>onDelete(n.id)} style={btnDanger}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={4} style={{textAlign:'center', padding:'18px'}}>Sin resultados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
