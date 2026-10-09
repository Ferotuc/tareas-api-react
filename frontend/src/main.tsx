import { useEffect, useState, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { Check, ClipboardList, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import { request, type Task, type TaskInput } from './api';
import './style.css';
const empty: TaskInput = { title: '', description: '', completed: false };
function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState<TaskInput>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  async function load() {
    setLoading(true); setError('');
    try { setTasks(await request<Task[]>()); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo conectar'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  async function mutate(action: () => Promise<void>) {
    setBusy(true); setError(''); setSuccess('');
    try { await action(); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo conectar'); }
    finally { setBusy(false); }
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    void mutate(async () => {
      const task = await request<Task>(editing ? `/${editing}` : '', editing ? 'PATCH' : 'POST', form);
      setTasks(current => editing ? current.map(t => t.id === task.id ? task : t) : [...current, task]);
      setSuccess(editing ? 'Cambios guardados' : 'Tarea creada'); setEditing(null); setForm(empty);
    });
  }
  return <main>
    <header><div className="brand"><ClipboardList size={26}/><span>Mi espacio</span></div><a href="http://localhost:3000/docs" target="_blank" rel="noreferrer">API / Swagger</a></header>
    <section className="heading"><div><p className="eyebrow">ORGANIZACION PERSONAL</p><h1>Tareas</h1><p className="muted">{tasks.filter(t => !t.completed).length} pendientes · {tasks.filter(t => t.completed).length} completadas</p></div><button title="Actualizar colección" aria-label="Actualizar colección" onClick={() => void load()} disabled={busy || loading}><RefreshCw size={18}/></button></section>
    {error && <div className="notice error" role="alert">{error}</div>}
    {success && <div className="notice success" role="status"><Check size={18}/>{success}</div>}
    <div className="layout"><section className="collection" aria-busy={loading}>
      <h2>Mi lista <span>{tasks.length}</span></h2>
      {loading ? <p role="status">Cargando tareas...</p> : tasks.length === 0 ? <div className="empty"><ClipboardList size={42}/><h3>Todo por empezar</h3><p>Tu lista de tareas está vacía.</p></div> : <ul>{tasks.map(task => <li key={task.id}>
        <input aria-label={`Completar ${task.title}`} type="checkbox" checked={task.completed} disabled={busy || loading} onChange={() => void mutate(async () => { const updated = await request<Task>(`/${task.id}`, 'PATCH', { completed: !task.completed }); setTasks(current => current.map(t => t.id === updated.id ? updated : t)); setSuccess('Estado actualizado'); })}/>
        <div className="task"><h3 className={task.completed ? 'done' : ''}>{task.title}</h3><p>{task.description || 'Sin descripción'}</p></div>
        <button title="Editar" aria-label={`Editar ${task.title}`} disabled={busy} onClick={() => { setEditing(task.id); setForm({ title: task.title, description: task.description, completed: task.completed }); setSuccess(''); }}><Pencil size={17}/></button>
        <button title="Eliminar" aria-label={`Eliminar ${task.title}`} disabled={busy} onClick={() => { if (window.confirm(`¿Eliminar "${task.title}"?`)) void mutate(async () => { await request<void>(`/${task.id}`, 'DELETE'); setTasks(current => current.filter(t => t.id !== task.id)); if (editing === task.id) { setEditing(null); setForm(empty); } setSuccess('Tarea eliminada'); }); }}><Trash2 size={17}/></button>
      </li>)}</ul>}
    </section><aside><h2>{editing ? 'Editar tarea' : 'Nueva tarea'}</h2><form onSubmit={submit}>
      <fieldset disabled={busy || loading}><label>Título<input required minLength={3} maxLength={80} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="¿Qué necesitas hacer?"/></label>
      <label>Descripción<textarea maxLength={300} rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Añade los detalles"/></label>
      <label className="check"><input type="checkbox" checked={form.completed} onChange={e => setForm({ ...form, completed: e.target.checked })}/>Completada</label>
      <button className="primary" type="submit">{editing ? <Check size={18}/> : <Plus size={18}/>} {busy ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear tarea'}</button>
      {editing && <button className="cancel" type="button" onClick={() => { setEditing(null); setForm(empty); }}><X size={16}/>Cancelar</button>}</fieldset>
    </form></aside></div><footer>Mi espacio · Tareas</footer>
  </main>;
}
createRoot(document.getElementById('root')!).render(<App/>);
