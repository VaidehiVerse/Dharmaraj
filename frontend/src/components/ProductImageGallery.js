import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

export default function ProductImageGallery({ images, productName }) {
  const [active, setActive] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "trimSnaps",
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActive(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    setActive(0);
    emblaApi?.scrollTo(0, true);
  }, [images, emblaApi]);

  const scrollTo = useCallback(
    (index) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi],
  );

  if (!images?.length) return null;

  return (
    <div data-testid="product-gallery">
      <div
        className="relative aspect-square bg-white border border-[var(--drj-gold)] overflow-hidden"
        data-testid="product-main-image"
      >
        <div className="pointer-events-none absolute inset-10 rounded-full bg-[var(--drj-gold-soft)] opacity-40" />
        <div ref={emblaRef} className="h-full touch-pan-y overflow-hidden">
          <div className="flex h-full">
            {images.map((img, i) => (
              <div
                key={`${img}-${i}`}
                className="relative flex h-full min-w-0 shrink-0 grow-0 basis-full items-center justify-center"
              >
                <img
                  src={img}
                  alt={productName}
                  className="relative z-10 h-[94%] w-[94%] max-h-full max-w-full object-contain"
                  style={{ filter: "drop-shadow(0 28px 50px rgba(212,175,55,0.4))" }}
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="mt-4 grid gap-3"
        style={{ gridTemplateColumns: `repeat(${Math.min(images.length, 3)}, minmax(0, 1fr))` }}
      >
        {images.map((img, i) => (
          <button
            key={`${img}-thumb-${i}`}
            type="button"
            onClick={() => scrollTo(i)}
            className={`flex aspect-square items-center justify-center overflow-hidden border transition-colors ${
              active === i ? "border-gold" : "border-[var(--drj-line)]"
            } bg-cream`}
            data-testid={`product-thumb-${i}`}
            aria-label={`View image ${i + 1}`}
            aria-current={active === i ? "true" : undefined}
          >
            <img
              src={img}
              alt=""
              className="pointer-events-none h-[92%] w-[92%] max-h-full max-w-full object-contain"
              draggable={false}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
