import { useEffect } from 'react';

interface LightboxProps {
  images: string[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function Lightbox({ images, index, onClose, onPrev, onNext }: LightboxProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  if (!images || images.length === 0) return null;

  return (
    <div className="lightbox-overlay" role="dialog" aria-modal="true" aria-label="Imagen en pantalla completa">
      <button className="lightbox-close" onClick={onClose} aria-label="Cerrar">✕</button>

      <button className="lightbox-nav left" onClick={onPrev} aria-label="Imagen anterior">◀</button>
      <div className="lightbox-content">
        <img src={images[index]} alt={`Imagen ${index + 1}`} className="lightbox-img" />
        <div className="lightbox-caption">{index + 1} / {images.length}</div>
      </div>
      <button className="lightbox-nav right" onClick={onNext} aria-label="Siguiente imagen">▶</button>
    </div>
  );
}
