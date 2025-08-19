import { FC, FormEvent, useState } from 'react';

const AdminProductForm: FC = () => {
  const [nombre, setNombre] = useState('');
  // Más states para precio, stock, etc.

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Llama a Cloud Function o Firestore addDoc
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre del producto"
        className="w-full p-2 border rounded"
      />
      {/* Más inputs */}
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Guardar Producto
      </button>
    </form>
  );
};

export default AdminProductForm;