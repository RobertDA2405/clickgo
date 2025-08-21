// src/components/Navbar.tsx
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const cartCount = useCartStore((s) =>
    s.items.reduce((sum, it) => sum + it.cantidad, 0)
  );
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const closeMenu = () => setOpen(false);
  const onLogout = async () => {
    await logout();
    closeMenu();
    navigate('/');
  };

  const linkBase =
    'px-3 py-2 rounded-md text-sm font-medium hover:text-blue-300 hover:bg-gray-700';
  const linkActive = 'text-blue-300 bg-gray-700';

  return (
    <header className="sticky top-0 z-50 bg-gray-800/95 backdrop-blur supports-[backdrop-filter]:bg-gray-800/75 text-white shadow">
      <nav className="max-w-7xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" onClick={closeMenu} className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 font-bold">
                CG
              </span>
              <span className="text-xl font-bold">ClickGO</span>
            </Link>
          </div>

          {/* Menú desktop */}
          <ul className="hidden md:flex items-center gap-1">
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : ''}`
                }
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/catalogo"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : ''}`
                }
              >
                Catálogo
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/carrito"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : ''}`
                }
              >
                Carrito
                {cartCount > 0 && (
                  <span className="ml-2 inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-blue-500 text-xs px-1">
                    {cartCount}
                  </span>
                )}
              </NavLink>
            </li>
            {user && (
              <li>
                <NavLink
                  to="/pedidos"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? linkActive : ''}`
                  }
                >
                  Pedidos
                </NavLink>
              </li>
            )}
            {user?.rol === 'admin' && (
              <li>
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? linkActive : ''}`
                  }
                >
                  Admin
                </NavLink>
              </li>
            )}
          </ul>

          {/* Área de usuario (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm opacity-90 truncate max-w-[160px]">
                  Hola, {user.nombre}
                </span>
                <button
                  onClick={onLogout}
                  className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <Link
                to="/cuenta"
                className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>

          {/* Botón hamburguesa (móvil) */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-controls="mobile-menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Abrir menú</span>
            {/* icono hamburguesa */}
            <svg
              className={`h-6 w-6 ${open ? 'hidden' : 'block'}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
              />
            </svg>
            {/* icono cerrar */}
            <svg
              className={`h-6 w-6 ${open ? 'block' : 'hidden'}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Menú móvil */}
        <div id="mobile-menu" className={`${open ? 'block' : 'hidden'} md:hidden pb-3`}>
          <ul className="flex flex-col gap-1 pt-2 border-t border-gray-700">
            <li>
              <NavLink
                to="/"
                end
                onClick={closeMenu}
                className={({ isActive }) =>
                  `block ${linkBase} ${isActive ? linkActive : ''}`
                }
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/catalogo"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `block ${linkBase} ${isActive ? linkActive : ''}`
                }
              >
                Catálogo
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/carrito"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `block ${linkBase} ${isActive ? linkActive : ''}`
                }
              >
                Carrito
                {cartCount > 0 && (
                  <span className="ml-2 inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-blue-500 text-xs px-1">
                    {cartCount}
                  </span>
                )}
              </NavLink>
            </li>
            {user && (
              <li>
                <NavLink
                  to="/pedidos"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `block ${linkBase} ${isActive ? linkActive : ''}`
                  }
                >
                  Pedidos
                </NavLink>
              </li>
            )}
            {user?.rol === 'admin' && (
              <li>
                <NavLink
                  to="/admin"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `block ${linkBase} ${isActive ? linkActive : ''}`
                  }
                >
                  Admin
                </NavLink>
              </li>
            )}
          </ul>

          <div className="mt-3 border-t border-gray-700 pt-3">
            {user ? (
              <button
                onClick={onLogout}
                className="w-full bg-red-500 hover:bg-red-600 px-3 py-2 rounded"
              >
                Cerrar Sesión
              </button>
            ) : (
              <Link
                to="/cuenta"
                onClick={closeMenu}
                className="block bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded text-center"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
