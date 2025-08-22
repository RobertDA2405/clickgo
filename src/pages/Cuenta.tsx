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
      <div className="text-center mt-10 max-w-md mx-auto p-6 bg-white rounded-lg shadow-md"> {/* Cambio: White fondo, sombra */}
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Bienvenido, {user.nombre}</h2> {/* Cambio: Dark text */}
        <p className="text-gray-600">Email: {user.email}</p> {/* Cambio: Gray */}
        <p className="text-gray-600">Rol: {user.rol}</p>
        <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded mt-4 hover:bg-red-600 transition-colors"> {/* Cambio: Hover */}
          Cerrar Sesión
        </button>
        <button
          onClick={() => {
            if (confirm('¿Seguro?')) deleteAccount();
          }}
          className="bg-gray-500 text-white px-4 py-2 rounded mt-4 ml-4 hover:bg-gray-600 transition-colors"
        >
          Borrar Cuenta
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md"> {/* Cambio: White, sombra */}
      <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center"> {/* Cambio: Dark text */}
        {isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && (
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error && <p className="text-red-500 text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-400 text-gray-900 px-4 py-2 rounded hover:bg-yellow-500 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Cargando...' : (isRegister ? 'Registrar' : 'Iniciar Sesión')}
        </button>
      </form>
      <button
        onClick={() => setIsRegister(!isRegister)}
        className="text-blue-600 w-full mt-4 text-center hover:text-blue-700 transition-colors"
      >
        {isRegister ? 'Ya tengo cuenta' : 'Crear nueva cuenta'}
      </button>
    </div>
  );
};