
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const Navbar = () => {
  const { user, logout } = useAuthStore();

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between">
      <ul className="flex gap-4">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/catalogo">Catálogo</Link></li>
        <li><Link to="/carrito">Carrito</Link></li>
      </ul>

      <div>
        {user ? (
          <>
            <span className="mr-4">Hola, {user.nombre}</span>
            <button onClick={logout} className="bg-red-500 px-3 py-1 rounded">Salir</button>
          </>
        ) : (
          <Link to="/cuenta" className="bg-green-500 px-3 py-1 rounded">Iniciar sesión</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
