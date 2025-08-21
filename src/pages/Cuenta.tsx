// src/pages/Cuenta.tsx
import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';

export default function Cuenta() {
  const { register, login, logout, deleteAccount, user, loading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      await register(email, password, nombre);
    } else {
      await login(email, password);
    }
  };

  if (loading) return <p className="text-center text-gray-600 mt-10">Cargando...</p>;

  if (user) {
    return (
      <div className="text-center mt-10">
        <h2 className="text-2xl font-bold mb-4">Bienvenido, {user.nombre}</h2>
        <p>Email: {user.email}</p>
        <p>Rol: {user.rol}</p>
        <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded mt-4">
          Cerrar Sesión
        </button>
        <button
          onClick={() => {
            if (confirm('¿Estás seguro de borrar tu cuenta? Esto es irreversible.')) {
              deleteAccount();
            }
          }}
          className="bg-gray-500 text-white px-4 py-2 rounded mt-4 ml-4"
        >
          Borrar Cuenta
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-white text-center">
        {isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && (
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre"
            className="w-full p-2 border rounded bg-gray-700 text-white"
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 border rounded bg-gray-700 text-white"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="w-full p-2 border rounded bg-gray-700 text-white"
        />
        {error && <p className="text-red-500 text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Cargando...' : (isRegister ? 'Registrar' : 'Iniciar Sesión')}
        </button>
      </form>
      <button
        onClick={() => setIsRegister(!isRegister)}
        className="text-blue-400 w-full mt-4 text-center"
      >
        {isRegister ? 'Ya tengo cuenta' : 'Crear nueva cuenta'}
      </button>
    </div>
  );
};