import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/client";
import { useCartStore } from "../stores/cartStore";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, Zoom } from 'swiper/modules';
import type SwiperClass from 'swiper';
import Lightbox from '../components/Lightbox';

interface ProductoData {
  id: string;
  nombre: string;
  descripcion?: string;
  precio?: number;
  imagenes?: string[];
}

const Producto = () => {
  const { id } = useParams();
  const [producto, setProducto] = useState<ProductoData | null>(null);
  const [loading, setLoading] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    (async () => {
      try {
        const ref = doc(db, "products", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as Record<string, unknown>;
          setProducto({
            id: snap.id,
            nombre: typeof data.nombre === "string" ? data.nombre : "",
            descripcion: typeof data.descripcion === "string" ? data.descripcion : "",
            precio: typeof data.precio === "number" ? data.precio : (typeof data.precio === "string" ? Number(data.precio) || 0 : 0),
            imagenes: Array.isArray(data.imagenes) ? data.imagenes.filter((i): i is string => typeof i === "string") : [],
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Cargando producto...</p>;
  if (!producto) return <p className="text-center mt-10">Producto no encontrado.</p>;

  const images = producto.imagenes && producto.imagenes.length > 0 ? producto.imagenes : ["/vite.svg"];

  return (
    <>
    <div className="container-max bg-white rounded-lg p-6 mt-8 product-detail">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2">
          <Swiper
            modules={[Navigation, Thumbs, Zoom]}
            navigation
            thumbs={{ swiper: thumbsSwiper as unknown as SwiperClass }}
            zoom={{ maxRatio: 2 }}
            className="mb-4"
          >
            {images.map((src, idx) => (
              <SwiperSlide key={idx}>
                <div className="product-gallery bg-gray-100 p-4 rounded flex items-center justify-center swiper-zoom-container">
                  <img onClick={() => { setLightboxIndex(idx); setLightboxOpen(true); }} src={src} alt={`${producto.nombre} ${idx + 1}`} className="w-full max-h-[60vh] object-contain cursor-zoom-in" loading="lazy" data-swiper-zoom="true" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="mt-3">
            <Swiper
              onSwiper={setThumbsSwiper}
              modules={[Thumbs]}
              slidesPerView={4}
              watchSlidesProgress
              className="mt-2"
            >
              {images.map((src, idx) => (
                <SwiperSlide key={idx} className="product-thumb opacity-90">
                  <div className="p-1 bg-white rounded">
                    <img src={src} alt={`thumb-${idx}`} className="w-full h-16 object-cover rounded" loading="lazy" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        <div className="md:col-span-1 product-side">
          <nav className="text-sm text-gray-500 mb-2">
            <a href="/" className="hover:underline">Home</a> &nbsp;/&nbsp; <a href="/catalogo" className="hover:underline">Catálogo</a> &nbsp;/&nbsp; <span className="text-gray-800">{producto.nombre}</span>
          </nav>
          <div className="sticky-buy bg-white p-4 rounded shadow-sm">
            <h1 className="text-xl font-bold mb-2">{producto.nombre}</h1>
            <p className="text-gray-700 mb-4 text-sm">{producto.descripcion}</p>
            <p className="text-2xl font-extrabold text-gray-900 mb-4">${(producto.precio ?? 0).toFixed(2)}</p>
            <div className="flex gap-3">
              <button
                onClick={() => addItem({ productId: producto.id, nombre: producto.nombre, precio: producto.precio ?? 0, cantidad: 1 })}
                className="w-full inline-flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 py-3 px-4 rounded shadow transition-colors font-semibold"
              >
                Añadir al carrito
              </button>
            </div>
            <div className="mt-3 text-sm text-gray-600">Envío y devoluciones: revisa las políticas en la sección correspondiente.</div>
          </div>
        </div>
      </div>
    </div>
      {lightboxOpen && (
        <Lightbox
          images={images}
          index={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onPrev={() => setLightboxIndex((i) => (i - 1 + images.length) % images.length)}
          onNext={() => setLightboxIndex((i) => (i + 1) % images.length)}
        />
      )}
    </>
  );
};

export default Producto;
