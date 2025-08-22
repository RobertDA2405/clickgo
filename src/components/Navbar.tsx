// src/components/Navbar.tsx
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useState, useEffect } from "react";
import { Menu, X, ShoppingCart } from "lucide-react";
import MiniCart from "./MiniCart";
import { useCartStore } from "../stores/cartStore";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const count = useCartStore((s) => s.items.length);
  const items = useCartStore((s) => s.items);
  const [showPreview, setShowPreview] = useState(false);

  const closeMenu = () => setOpen(false);

  // lock body scrolling when mobile menu is open
  useEffect(() => {
    if (!open) return; // only lock when menu opens
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  return (
    <nav className="main-nav bg-white text-gray-900 shadow-lg fixed top-0 left-0 right-0" style={{height: 'var(--nav-height)', zIndex: 'var(--z-nav)'}}> 
      <div className="nav-inner container-max h-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="logo text-base md:text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors" onClick={closeMenu}>
            ClickGo
          </Link>

          {/* Links desktop (inline) */}
          <div className="navbar-links hidden md:flex items-center gap-6" role="menubar">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <Link to="/catalogo" className="hover:text-blue-600 transition-colors">Catálogo</Link>
            <Link to="/carrito" className="hover:text-blue-600 transition-colors">Carrito</Link>
            {user && <Link to="/pedidos" className="hover:text-blue-600 transition-colors">Pedidos</Link>}
            {user?.rol === "admin" && <Link to="/admin" className="hover:text-blue-600 transition-colors">Admin</Link>}
          </div>

          {/* Área usuario desktop + search + cart */}
          <div className="hidden md:flex items-center gap-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigate(`/catalogo?q=${encodeURIComponent(search)}`);
              }}
              className="flex items-center bg-gray-100 rounded overflow-hidden"
            >
              <input
                className="px-3 py-1 w-56 bg-transparent placeholder-gray-500 focus:outline-none"
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar productos"
              />
            </form>

            {user ? (
              <Link to="/cuenta" className="text-sm text-white hover:underline">
                Hola, {user.nombre}
              </Link>
            ) : (
              <Link to="/cuenta" className="login-link px-3 py-1 rounded text-white transition-colors">
                Iniciar Sesión
              </Link>
            )}

            {/* Cart icon + preview */}
            <div className="relative ml-2 cart-trigger" onMouseEnter={() => setShowPreview(true)} onMouseLeave={() => setShowPreview(false)}>
              <Link to="/carrito" className="relative">
                <ShoppingCart size={22} className="text-gray-700" />
                {count > 0 && (
                  <span id="cart-badge" aria-live="polite" className={`absolute -top-2 -right-3 bg-yellow-400 text-gray-900 rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold cart-badge ${items.length>0? 'pulse':''}`}>
                    {count}
                  </span>
                )}
              </Link>

              {showPreview && <div className="cart-preview"><MiniCart /></div>}
            </div>
          </div>

          {/* Botón hamburguesa (solo mobile) */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="p-2 rounded hover:bg-gray-100 focus:outline-none transition-colors"
              aria-label="Abrir menú"
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
      </div>
    </div>
      {/* Menú móvil (overlay) */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40" aria-hidden={open ? 'false' : 'true'}>
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => setOpen(false)} />
          <div className="mobile-overlay-pane bg-white p-4 space-y-2 shadow-lg" role="dialog" aria-modal="true">
            <Link to="/" onClick={closeMenu} className="block px-3 py-2 rounded hover:bg-gray-100 transition-colors" autoFocus>
              Home
            </Link>
            <Link to="/catalogo" onClick={closeMenu} className="block px-3 py-2 rounded hover:bg-gray-100 transition-colors">Catálogo</Link>
            <Link to="/carrito" onClick={closeMenu} className="block px-3 py-2 rounded hover:bg-gray-100 transition-colors">Carrito</Link>
            {user && <Link to="/pedidos" onClick={closeMenu} className="block px-3 py-2 rounded hover:bg-gray-100 transition-colors">Pedidos</Link>}
            {user?.rol === "admin" && <Link to="/admin" onClick={closeMenu} className="block px-3 py-2 rounded hover:bg-gray-100 transition-colors">Admin</Link>}

            <div className="pt-3 border-t border-gray-300">
              {user ? (
                <button onClick={() => { logout(); closeMenu(); }} className="w-full bg-red-500 hover:bg-red-600 px-3 py-2 rounded transition-colors text-white text-left">Cerrar Sesión</button>
              ) : (
                <Link to="/cuenta" onClick={closeMenu} className="block bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded transition-colors text-white">Iniciar Sesión</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}