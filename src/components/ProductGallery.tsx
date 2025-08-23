// Import swiper and styles locally to keep them out of the main bundle until this component loads
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, Zoom } from 'swiper/modules';
import type SwiperClass from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';

interface Props {
  images: string[];
  onImageClick: (index: number) => void;
  setThumbsSwiper: (s: SwiperClass | null) => void;
}

export default function ProductGallery({ images, onImageClick, setThumbsSwiper }: Props) {
  return (
    <>
      <Swiper
        modules={[Navigation, Thumbs, Zoom]}
        navigation
        thumbs={{ swiper: undefined as unknown as SwiperClass }}
        zoom={{ maxRatio: 2 }}
        className="mb-4"
      >
        {images.map((src, idx) => (
          <SwiperSlide key={idx}>
      <div className="product-gallery bg-gray-100 p-3 rounded flex items-center justify-center swiper-zoom-container" style={{ minHeight: 220 }}>
              <img
                onClick={() => onImageClick(idx)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onImageClick(idx); } }}
                tabIndex={0}
                src={src}
                alt={`imagen-${idx}`}
        className="w-full max-w-[720px] max-h-[30vh] object-contain cursor-zoom-in"
                loading="lazy"
                data-swiper-zoom="true"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="mt-3">
        <Swiper
          onSwiper={setThumbsSwiper}
          modules={[Thumbs]}
          slidesPerView={4}
          spaceBetween={8}
          watchSlidesProgress
          className="mt-2"
        >
          {images.map((src, idx) => (
            <SwiperSlide key={idx} className="product-thumb opacity-90 flex items-center justify-center">
              <div className="p-0.5 bg-white rounded shadow-sm">
                <img src={src} alt={`thumb-${idx}`} className="w-20 h-12 object-cover rounded" loading="lazy" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  );
}
