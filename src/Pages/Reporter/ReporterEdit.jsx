

import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getNews, updateNews } from '../../services/newsService';
import { listActiveSections } from '../../services/sectionService';
import './ReporterEdit.css'; // ← agregado para estilos propios

/* Helpers fechas (Timestamp o ISO) */
function toDateObj(v){ if(!v) return null; if(typeof v?.toDate==='function') return v.toDate(); const d=new Date(v); return isNaN(d)?null:d; }
function ymd(d){ if(!d) return ''; const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const da=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${da}`; }
function hm(d){ if(!d) return ''; const h=String(d.getHours()).padStart(2,'0'); const mi=String(d.getMinutes()).padStart(2,'0'); return `${h}:${mi}`; }

export default function ReporterEdit(){
  const { id } = useParams();
  const nav = useNavigate();
  const [n, setN] = useState(null);
  const [sections, setSections] = useState([]);
  const [saving, setSaving] = useState(false);
  const urlInputRef = useRef(null);

  useEffect(()=>{
    listActiveSections().then(setSections).catch(()=>setSections([]));
    getNews(id).then(setN);
  },[id]);

  if (!n) return <p>Cargando…</p>;

  const created = toDateObj(n.createdAt || n.fechaCreacion);
  const updated = toDateObj(n.updatedAt || n.fechaActualizacion);

  const onPasteSample = ()=>{
    const demo = 'https://picsum.photos/seed/datanews/1200/700';
    setN(v=>({...v, imagenUrl: demo }));
    setTimeout(()=>urlInputRef.current?.focus(),0);
  };

  const onSave = async ()=>{
    setSaving(true);
    try{
      await updateNews(id, {
        titulo: n.titulo || '',
        bajante: n.bajante || '',
        categoriaSlug: n.categoriaSlug || '',
        contenidoHTML: n.contenidoHTML || '',
        imagenUrl: n.imagenUrl || '',
        estado: n.estado || 'Edición',
      });
      nav('/reportero/mis-noticias');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="reporter-edit">
      {/* Encabezado */}
      <div className="edit-head">
        <Link className="btn ghost" to="/reportero/mis-noticias">← Atrás</Link>
        <span className="badge">{n.estado || 'Edición'}</span>
      </div>

      {/* Layout 2 columnas */}
      <div className="edit-grid">
        {/* Columna izquierda */}
        <div>
          <div className="form-row">
            <label>
              <div>Título</div>
              <input
                value={n.titulo || ''}
                onChange={e=>setN(v=>({...v, titulo:e.target.value}))}
                placeholder="Título de la noticia"
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              <div>Subtítulo / Bajante</div>
              <input
                value={n.bajante || ''}
                onChange={e=>setN(v=>({...v, bajante:e.target.value}))}
                placeholder="Una frase que resuma la noticia"
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              <div>Categoría</div>
              <select
                value={n.categoriaSlug || ''}
                onChange={e=>setN(v=>({...v, categoriaSlug:e.target.value}))}
              >
                <option value="">Seleccione…</option>
                {sections.map(s=>(
                  <option key={s.slug} value={s.slug}>{s.nombre}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>
              <div>Estado</div>
              <select
                value={n.estado || 'Edición'}
                onChange={e=>setN(v=>({...v, estado:e.target.value}))}
              >
                <option>Edición</option>
                <option>Terminado</option>
              </select>
            </label>
          </div>

          {/* Fechas (solo lectura) */}
          <div className="form-row" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
            <label>
              <div>Fecha creación</div>
              <input type="date" value={ymd(created)} readOnly/>
            </label>
            <label>
              <div>Hora</div>
              <input type="time" value={hm(created)} readOnly/>
            </label>
          </div>

          <div className="form-row" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
            <label>
              <div>Fecha actualización</div>
              <input type="date" value={ymd(updated)} readOnly/>
            </label>
            <label>
              <div>Hora</div>
              <input type="time" value={hm(updated)} readOnly/>
            </label>
          </div>
        </div>

        {/* Columna derecha */}
        <div>
          <div className="form-row">
            <label>
              <div>Contenido</div>
              <textarea
                value={n.contenidoHTML || ''}
                onChange={e=>setN(v=>({...v, contenidoHTML:e.target.value}))}
                placeholder="Escribe el cuerpo de la noticia (puedes pegar HTML simple)…"
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              <div>Imagen (URL)</div>
              <div className="img-row">
                <input
                  ref={urlInputRef}
                  value={n.imagenUrl || ''}
                  onChange={e=>setN(v=>({...v, imagenUrl: e.target.value}))}
                  placeholder="https://…"
                />
                <button type="button" className="btn" onClick={onPasteSample}>Demo</button>
              </div>
            </label>
          </div>

          <div className="form-row" style={{ marginTop:12 }}>
            <label>
              <div>Autor</div>
              <input readOnly value={n.autorNombre || 'Autor'} />
            </label>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="edit-actions">
        <button
          className="btn primary"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
}
