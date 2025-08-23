import { Link } from 'react-router-dom';
import { Menu, X, ShoppingCart, Heart } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import logo from '../assets/logo.svg';
import bigLogo from '../assets/logotipo.svg';

export default function NavbarMobile() {
  const [open, setOpen] = useState(false);
  const count = useCartStore((s) => s.items.length);
  const wishCount = useWishlistStore((s) => s.items.length);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const previousActive = document.activeElement as HTMLElement | null;

    // find first focusable element inside overlay
    const container = overlayRef.current;
    const focusable = container?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable && focusable.length ? focusable[0] : null;
    const last = focusable && focusable.length ? focusable[focusable.length - 1] : null;

    // move focus into overlay
    first?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        return;
      }

      if (e.key === 'Tab') {
        if (!first || !last) return;
        // trap focus
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            (last as HTMLElement).focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            (first as HTMLElement).focus();
          }
        }
      }
    }

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      // restore previous focus
      if (previousActive && typeof previousActive.focus === 'function') {
        previousActive.focus();
      }
    };
  }, [open]);

  return (
  <div className="nav-inner container-max h-full flex items-center justify-between relative">
      <Link to="/" className="logo" aria-label="Ir al inicio">
        <picture>
          <source srcSet={bigLogo} media="(min-width:992px)" />
          <img src={logo} alt="Click&Go" className="h-7 object-contain" />
        </picture>
      </Link>

  <div className="flex items-center gap-3 relative">
        <Link to="/carrito" className="relative p-2 rounded mobile-action" aria-label="Carrito">
          <ShoppingCart size={20} className="cart-icon" />
          {count > 0 && (
            <span className={`absolute -top-2 -right-2 bg-yellow-400 text-black rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold`}>{count}</span>
          )}
        </Link>

        <Link to="/wishlist" className="relative p-2 rounded mobile-action" aria-label="Favoritos">
          <Heart size={18} className="heart-icon" />
          {wishCount > 0 && <span className="absolute -top-2 -right-2 bg-white text-black rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold border">{wishCount}</span>}
        </Link>

        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setOpen(v => !v)}
          className="p-2 rounded-md border border-yellow-400/40 bg-blue-600/80 hover:bg-blue-500 focus:ring-2 focus:ring-yellow-400 text-yellow-300 hover:text-yellow-200 transition-colors mobile-action menu-toggle"
          aria-label="Abrir menú"
          aria-expanded={open}
          aria-controls="mobile-menu"
          title="Menú"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
          <span className="sr-only">{open ? 'Cerrar menú' : 'Abrir menú'}</span>
        </button>
      </div>
      {open && (
        <div className="desktop-popover-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div
            ref={overlayRef}
            id="mobile-popover-menu"
            role="menu"
            aria-label="Menú de navegación"
            className="desktop-popover"
          >
            <Link to="/catalogo" onClick={() => setOpen(false)} role="menuitem" className="desktop-popover-link">Catálogo</Link>
            <Link to="/pedidos" onClick={() => setOpen(false)} role="menuitem" className="desktop-popover-link">Pedidos</Link>
            <Link to="/admin" onClick={() => setOpen(false)} role="menuitem" className="desktop-popover-link">Admin</Link>
            <Link to="/cuenta" onClick={() => setOpen(false)} role="menuitem" className="desktop-popover-link text-center">Cuenta</Link>
            <button onClick={() => setOpen(false)} className="desktop-popover-link text-center" role="menuitem">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
