import { useParams } from "react-router-dom";
// firebase lazy client used via dynamic helpers
import { useCartStore } from "../stores/cartStore";
import { useWishlistStore } from '../stores/wishlistStore';

import React, { Suspense, useEffect, useRef, useState } from 'react';
const Lightbox = React.lazy(() => import('../components/Lightbox'));
const ProductGallery = React.lazy(() => import('../components/ProductGallery'));
import type SwiperClass from 'swiper';

interface ProductoData {
  id: string;
  nombre: string;
  descripcion?: string;
  precio?: number;
  imagenes?: string[];
  stock?: number;
}

const Producto = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id ? decodeURIComponent(params.id) : undefined;
  const [producto, setProducto] = useState<ProductoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addItem = useCartStore((s) => s.addItem);
  const isFavorite = useWishlistStore(s => s.isFavorite);
  const toggleFavorite = useWishlistStore(s => s.toggle);
  const [adding, setAdding] = useState(false);
  const [announce, setAnnounce] = useState<string | null>(null);
  const addButtonRef = useRef<HTMLButtonElement | null>(null);
  // We only need the setter to pass down to the gallery component; the actual swiper instance isn't read here
  const [, setThumbsSwiper] = useState<SwiperClass | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
      (async () => {
        try {
          setError(null);
          const p = await (await import('../firebase/lazyClient')).getProductById(id as string);
          if (p) setProducto(p as ProductoData);
          else setError('Producto no encontrado');
        } finally {
          setLoading(false);
        }
      })();
  }, [id]);

  // focus the Add button when product loads
  useEffect(() => {
    if (producto && addButtonRef.current) {
      addButtonRef.current.focus();
    }
  }, [producto]);

  if (loading) return <p className="text-center mt-10">Cargando producto...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;
  if (!producto) return <p className="text-center mt-10">Producto no encontrado.</p>;

  const images = producto.imagenes && producto.imagenes.length > 0 ? producto.imagenes : ["/vite.svg"];

  return (
    <>
  <div className="container-max bg-white rounded-lg p-6 mt-8 product-detail safe-pad">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start justify-center">
        <div className="md:col-span-2 flex justify-center">
          <Suspense fallback={<div className="h-80 bg-gray-100 animate-pulse rounded" /> }>
            <div className="w-full max-w-2xl">{/* reduce gallery max width for better proportions */}
              <ProductGallery images={images} onImageClick={(idx) => { setLightboxIndex(idx); setLightboxOpen(true); }} setThumbsSwiper={setThumbsSwiper} />
            </div>
          </Suspense>
        </div>
        <div className="md:col-span-1 product-side flex justify-center px-4 md:px-8">{/* add horizontal padding so content isn't flush to edge */}
          <div className="w-full max-w-xs md:max-w-sm">
          <nav className="text-sm text-gray-500 mb-2">
            <a href="/" className="hover:underline">Home</a> &nbsp;/&nbsp; <a href="/catalogo" className="hover:underline">Catálogo</a> &nbsp;/&nbsp; <span className="text-gray-800">{producto.nombre}</span>
          </nav>
          <div className="sticky-buy bg-white p-4 rounded shadow-sm text-center md:text-left" style={{ maxWidth: 360 }}>
            <h1 className="text-lg md:text-xl font-bold mb-2">{producto.nombre}</h1>
            <p className="text-gray-700 mb-3 text-sm">{producto.descripcion}</p>
            <p className="text-xl md:text-2xl font-extrabold text-gray-900 mb-2">${(producto.precio ?? 0).toFixed(2)}</p>
            <div className="text-sm text-gray-700 mb-4">
              {typeof producto.stock === 'number' ? (
                producto.stock > 0 ? (
                  <span className="text-green-600 font-medium">En stock: {producto.stock}</span>
                ) : (
                  <span className="text-red-600 font-medium">Agotado</span>
                )
              ) : (
                <span className="text-gray-600">Stock: no disponible</span>
              )}
            </div>
            <div className="flex gap-3 items-center justify-center md:justify-start mt-2">
              <button
                onClick={() => {
                  toggleFavorite(producto.id);
                  setAnnounce(isFavorite(producto.id) ? 'Eliminado de favoritos' : 'Añadido a favoritos');
                }}
                aria-pressed={isFavorite(producto.id)}
                aria-label={isFavorite(producto.id) ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                title={isFavorite(producto.id) ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border bg-white hover:bg-gray-50 shadow-sm flex-shrink-0"
              >
                {isFavorite(producto.id) ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#EF4444" aria-hidden>
                    <path d="M20.8 4.6c-1.5-1.4-3.9-1.4-5.4.1l-.9.8-.9-.8c-1.5-1.5-3.9-1.5-5.4-.1-1.6 1.5-1.7 4-.2 5.6l7.4 7.8 7.4-7.8c1.5-1.6 1.4-4.1-.2-5.6z" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M20.8 4.6c-1.5-1.4-3.9-1.4-5.4.1l-.9.8-.9-.8c-1.5-1.5-3.9-1.5-5.4-.1-1.6 1.5-1.7 4-.2 5.6l7.4 7.8 7.4-7.8c1.5-1.6 1.4-4.1-.2-5.6z" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <button
                ref={addButtonRef}
                onClick={async () => {
                  if (producto.stock === 0 || adding) return;
                  setAdding(true);
                  try {
                    const ok = await addItem({ productId: producto.id, nombre: producto.nombre, precio: producto.precio ?? 0, cantidad: 1 });
                    const { toastSuccess, toastError } = await import('../utils/toast');
                    if (ok) toastSuccess('Producto añadido al carrito');
                    else {
                      toastError('No se pudo añadir el producto (stock insuficiente)');
                      setAnnounce('No hay suficiente stock para añadir este producto.');
                    }
                  } catch (err) {
                    const { toastError } = await import('../utils/toast');
                    toastError(err instanceof Error ? err.message : 'Error añadiendo al carrito');
                    setAnnounce(err instanceof Error ? err.message : 'Error añadiendo al carrito');
                  } finally {
                    setAdding(false);
                  }
                }}
                aria-busy={adding}
                aria-disabled={producto.stock === 0 || adding}
                className={`flex-1 inline-flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 py-3 px-4 rounded shadow transition-colors font-semibold ${producto.stock === 0 || adding ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={producto.stock === 0 || adding}
              >
                {adding ? 'Añadiendo...' : 'Añadir al carrito'}
              </button>
            </div>
            {/* Accessibility: polite live region for screen reader announcements */}
            <div aria-live="polite" className="sr-only" role="status">{announce ?? ''}</div>
            <div className="mt-3 text-sm text-gray-600">Envío y devoluciones: revisa las políticas en la sección correspondiente.</div>
          </div>
          </div>
        </div>
      </div>
    </div>
  <div className="page-bottom-spacer" aria-hidden />
  {lightboxOpen && (
    <Suspense fallback={null}>
      <Lightbox
        images={images}
        index={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        onPrev={() => setLightboxIndex((i) => (i - 1 + images.length) % images.length)}
        onNext={() => setLightboxIndex((i) => (i + 1) % images.length)}
      />
    </Suspense>
  )}
    </>
  );
};

export default Producto;
// Add a small spacer component for short pages (rendered by the page itself)
export const PageBottomSpacer = () => <div className="page-bottom-spacer" aria-hidden />;
