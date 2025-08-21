// src/pages/Admin.tsx
import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/client';
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
      await addDoc(collection(db, 'products'), {
        nombre,
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
    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-white text-center">Panel Admin - Agregar Producto</h2>
      <form onSubmit={handleAdd} className="space-y-4">
        {/* inputs iguales */}
      </form>
    </div>
  );
}
