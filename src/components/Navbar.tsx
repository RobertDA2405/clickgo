// src/components/Navbar.tsx
import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <nav className="bg-white text-gray-900 shadow-lg sticky top-0 z-50"> {/* Cambio: White fondo, dark text */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold text-blue-600 hover:text-blue-700"
            onClick={closeMenu}
          >
            ClickGO {/* Cambio: Acento azul, hover */}
          </Link>

          {/* Botón hamburguesa (solo móvil) */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="p-2 rounded hover:bg-gray-100 focus:outline-none transition-colors"
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Links desktop */}
          <ul className="hidden md:flex items-center gap-6">
            <li>
              <Link to="/" className="hover:text-blue-600 transition-colors"> {/* Cambio: Hover */}
                Home
              </Link>
            </li>
            <li>
              <Link to="/catalogo" className="hover:text-blue-600 transition-colors">
                Catálogo
              </Link>
            </li>
            <li>
              <Link to="/carrito" className="hover:text-blue-600 transition-colors">
                Carrito
              </Link>
            </li>
            {user && (
              <li>
                <Link to="/pedidos" className="hover:text-blue-600 transition-colors">
                  Pedidos
                </Link>
              </li>
            )}
            {user?.rol === "admin" && (
              <li>
                <Link to="/admin" className="hover:text-blue-600 transition-colors">
                  Admin
                </Link>
              </li>
            )}
          </ul>

          {/* Área usuario desktop */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600"> {/* Cambio: Gray */}
                  Hola, {user.nombre}
                </span>
                <button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white transition-colors"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <Link
                to="/cuenta"
                className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white transition-colors"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {open && (
        <div className="md:hidden bg-white px-4 pb-4 space-y-2"> {/* Cambio: White fondo */}
          <Link
            to="/"
            onClick={closeMenu}
            className="block px-3 py-2 rounded hover:bg-gray-100 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/catalogo"
            onClick={closeMenu}
            className="block px-3 py-2 rounded hover:bg-gray-100 transition-colors"
          >
            Catálogo
          </Link>
          <Link
            to="/carrito"
            onClick={closeMenu}
            className="block px-3 py-2 rounded hover:bg-gray-100 transition-colors"
          >
            Carrito
          </Link>
          {user && (
            <Link
              to="/pedidos"
              onClick={closeMenu}
              className="block px-3 py-2 rounded hover:bg-gray-100 transition-colors"
            >
              Pedidos
            </Link>
          )}
          {user?.rol === "admin" && (
            <Link
              to="/admin"
              onClick={closeMenu}
              className="block px-3 py-2 rounded hover:bg-gray-100 transition-colors"
            >
              Admin
            </Link>
          )}

          <div className="pt-3 border-t border-gray-300">
            {user ? (
              <button
                onClick={() => {
                  logout();
                  closeMenu();
                }}
                className="w-full bg-red-500 hover:bg-red-600 px-3 py-2 rounded transition-colors text-white text-left"
              >
                Cerrar Sesión
              </button>
            ) : (
              <Link
                to="/cuenta"
                onClick={closeMenu}
                className="block bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded transition-colors text-white"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}