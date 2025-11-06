

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDraftNews } from '../../services/newsService';
import { listActiveSections } from '../../services/sectionService';

function nowDate(){ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function nowTime(){ const d=new Date(); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; }
function toTimestamp(dateStr,timeStr){ try{ const [y,m,dd]=dateStr.split('-').map(Number); const [hh,mm]=timeStr.split(':').map(Number); return new Date(y,m-1,dd,hh,mm).toISOString(); }catch{ return new Date().toISOString(); } }

export default function ReporterCreate(){
  const nav = useNavigate();
  const session = JSON.parse(localStorage.getItem('dn_session') || 'null');

  const [sections, setSections] = useState([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    titulo: '',
    bajante: '',
    categoriaSlug: '',
    estado: 'Edición',
    contenidoHTML: '',
    imagenUrl: '',
    createdDate: nowDate(),
    createdTime: nowTime(),
    updatedDate: nowDate(),
    updatedTime: nowTime(),
  });

  useEffect(()=>{
    listActiveSections()
      .then(s=>setSections(s))
      .catch(()=>setSections([
        {slug:'cultura', nombre:'Cultura'},
        {slug:'deportes', nombre:'Deportes'},
        {slug:'salud', nombre:'Salud'},
        {slug:'tecnologia', nombre:'Tecnología'},
      ]));
  },[]);

  useEffect(()=>{
    const id=setInterval(()=> {
      setForm(v=>({...v, updatedDate:nowDate(), updatedTime:nowTime()}));
    }, 60000);
    return ()=> clearInterval(id);
  },[]);

  const onSubmit = async (e)=>{
    e.preventDefault();
    if(!form.titulo.trim() || !form.categoriaSlug){
      alert('Falta Título y/o Categoría');
      return;
    }

    const payload = {
      titulo: form.titulo.trim(),
      bajante: form.bajante.trim(),
      categoriaSlug: form.categoriaSlug,
      estado: form.estado,
      contenidoHTML: form.contenidoHTML,
      imagenUrl: form.imagenUrl,             // solo URL
      autorUid: session?.uid,
      autorNombre: session?.displayName || session?.email || 'Autor',
      createdAt: toTimestamp(form.createdDate, form.createdTime),
      updatedAt: toTimestamp(form.updatedDate, form.updatedTime),
    };

    console.log('[ReporterCreate] Payload a crear:', payload);

    setSaving(true);
    try{
      const result = await createDraftNews(payload);
      console.log('[ReporterCreate] Resultado createDraftNews:', result);
      alert('✅ Borrador creado correctamente');
      nav('/reportero/mis-noticias');
      // Si prefieres no redirigir, comenta la línea de arriba y usa:
      // setForm(f => ({ ...f, titulo:'', bajante:'', contenidoHTML:'', imagenUrl:'' }));
    }catch(err){
      console.error('[ReporterCreate] Error al crear borrador:', err);
      alert('❌ Error creando la noticia. Revisa la consola para detalles.');
    }finally{
      setSaving(false);
    }
  };

  const resetForm = ()=> setForm({
    titulo:'', bajante:'', categoriaSlug:'', estado:'Edición',
    contenidoHTML:'', imagenUrl:'',
    createdDate: nowDate(), createdTime: nowTime(),
    updatedDate: nowDate(), updatedTime: nowTime(),
  });

  return (
    <form className="form" onSubmit={onSubmit}>
      <h2 style={{ marginBottom: 12 }}>Crear noticia</h2>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:16 }}>
        {/* Columna izquierda */}
        <div>
          <div className="form-row">
            <label>
              <div>Título</div>
              <input
                value={form.titulo}
                onChange={e=>setForm(v=>({...v,titulo:e.target.value}))}
                required
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              <div>Subtítulo / Bajante</div>
              <input
                value={form.bajante}
                onChange={e=>setForm(v=>({...v,bajante:e.target.value}))}
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              <div>Categoría</div>
              <select
                value={form.categoriaSlug}
                onChange={e=>setForm(v=>({...v,categoriaSlug:e.target.value}))}
                required
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
                value={form.estado}
                onChange={e=>setForm(v=>({...v,estado:e.target.value}))}
              >
                <option>Edición</option>
                <option>Terminado</option>
              </select>
            </label>
          </div>

          <div className="form-row" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
            <label>
              <div>Fecha creación</div>
              <input type="date" value={form.createdDate}
                     onChange={e=>setForm(v=>({...v,createdDate:e.target.value}))}/>
            </label>
            <label>
              <div>Hora</div>
              <input type="time" value={form.createdTime}
                     onChange={e=>setForm(v=>({...v,createdTime:e.target.value}))}/>
            </label>
          </div>

          <div className="form-row" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
            <label>
              <div>Fecha actualización</div>
              <input type="date" value={form.updatedDate}
                     onChange={e=>setForm(v=>({...v,updatedDate:e.target.value}))}/>
            </label>
            <label>
              <div>Hora</div>
              <input type="time" value={form.updatedTime}
                     onChange={e=>setForm(v=>({...v,updatedTime:e.target.value}))}/>
            </label>
          </div>
        </div>

        {/* Columna derecha */}
        <div>
          <div className="form-row">
            <label>
              <div>Contenido</div>
              <textarea
                value={form.contenidoHTML}
                onChange={e=>setForm(v=>({...v,contenidoHTML:e.target.value}))}
                placeholder="Escribe el cuerpo de la noticia (puedes pegar HTML simple)…"
                style={{ minHeight: 460, width:'100%', resize:'vertical', lineHeight:1.4 }}
              />
            </label>
          </div>

          {/* Imagen: SOLO URL */}
          <div className="form-row">
            <label>
              <div>Imagen (URL)</div>
              <input
                value={form.imagenUrl}
                onChange={e=>setForm(v=>({...v,imagenUrl:e.target.value}))}
                placeholder="Pega una URL pública (https://...)"
              />
            </label>
          </div>

          <div style={{ fontSize:12, opacity:.8, marginTop:4 }}>
            ¿Necesitas un enlace público? Usa <a href="https://postimages.org/" target="_blank" rel="noreferrer">postimages.org</a>.
          </div>

          <div style={{ marginTop:8 }}>
            {form.imagenUrl ? <span className="badge ok">Imagen lista</span> : <span className="badge">Sin imagen</span>}
          </div>

          <div className="form-row" style={{ marginTop: 12 }}>
            <label>
              <div>Autor</div>
              <input readOnly value={session?.displayName || session?.email || 'Autor'}/>
            </label>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div style={{ display:'flex', gap:10, marginTop:16 }}>
        <button className="btn primary" disabled={saving}
                style={{ color:'#fff', fontWeight:700 }}>
          {saving ? 'Guardando…' : 'Guardar borrador'}
        </button>
        <button type="button" className="btn"
                style={{ color:'#111', fontWeight:600, background:'#f3f4f6' }}
                onClick={resetForm}>
          Limpiar
        </button>
      </div>
    </form>
  );
}
