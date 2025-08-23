// src/pages/Admin.tsx
import { useState } from 'react';
// Firestore accessed lazily to avoid bundling SDK
import { useAuthStore } from '../stores/authStore';

export default function Admin() {
  const { user } = useAuthStore();
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState(0);
  const [stock, setStock] = useState(0);
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('');
  const [imagenes, setImagenes] = useState('');

  if (user?.rol !== 'admin') return <p className="text-center text-red-500 mt-10">Acceso denegado.</p>;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { getDb } = await import('../firebase/lazyClient');
      const db = await getDb();
  const { collection, addDoc } = await import('firebase/firestore');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await addDoc(collection(db as any, 'products'), {
        nombre,
        nombreLower: nombre.toLowerCase(),
        precio,
        stock,
        descripcion,
        categoria,
        imagenes: imagenes.split(',').map(img => img.trim()),
        activo: true,
        creadoEn: new Date(),
      });
      alert('Producto agregado!');
      setNombre(''); setPrecio(0); setStock(0); setDescripcion(''); setCategoria(''); setImagenes('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      alert('Error: ' + message);
    }
  };

  return (
    <div className="container-max py-10 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Panel de administración</h1>
          <p className="text-slate-600 mt-2 text-sm">Añade productos de forma rápida. Mantén la vista simple y clara.</p>
        </header>
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm animate-slide-up">
              <h2 className="text-base font-semibold text-slate-800 mb-4">Nuevo producto</h2>
              <form onSubmit={handleAdd} className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700">Nombre</label>
                    <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del producto" className="input-modern bg-slate-900/70" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700">Categoría</label>
                    <input value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="Ej: electrónica" className="input-modern bg-slate-900/70" />
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700">Precio</label>
                    <input type="number" min={0} step={0.01} value={precio} onChange={(e) => setPrecio(Number(e.target.value))} placeholder="0.00" className="input-modern bg-slate-900/70" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700">Stock</label>
                    <input type="number" min={0} value={stock} onChange={(e) => setStock(Number(e.target.value))} placeholder="0" className="input-modern bg-slate-900/70" />
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-1">
                    <label className="text-sm font-medium text-slate-700">Imágenes (coma)</label>
                    <input value={imagenes} onChange={(e) => setImagenes(e.target.value)} placeholder="url1, url2" className="input-modern bg-slate-900/70" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700">Descripción</label>
                  <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción detallada del producto" className="input-modern textarea-modern bg-slate-900/70" />
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button type="submit" className="btn-modern-primary sm:w-56">Agregar producto</button>
                  <button type="button" onClick={() => { setNombre(''); setPrecio(0); setStock(0); setDescripcion(''); setCategoria(''); setImagenes(''); }} className="btn-modern-secondary sm:w-40">Limpiar</button>
                </div>
              </form>
            </div>
          </div>
          <aside className="md:col-span-1 animate-slide-up">
            <div className="form-surface p-6">
              <h2 className="text-lg font-semibold mb-4 text-slate-50">Consejos</h2>
              <ul className="text-sm space-y-3 text-slate-200">
                <li>Incluye al menos 1-2 imágenes claras.</li>
                <li>Usa una categoría consistente (mismo nombre exacto).</li>
                <li>Stock 0 ocultará el producto al quedarse sin unidades.</li>
                <li>Precio admite decimales (usa punto).</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
