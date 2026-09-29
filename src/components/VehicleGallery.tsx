"use client";

import Image from "next/image";
import { useRef, useState, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { VehicleImage } from "@/lib/vehicles";

type VehicleGalleryProps = {
  images: VehicleImage[];
  name: string;
};

/**
 * Touch-friendly gallery: swipe on mobile, buttons + keyboard on desktop.
 * Designed for multiple images even when only one is available today.
 */
export function VehicleGallery({ images, name }: VehicleGalleryProps) {
  const [index, setIndex] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  if (images.length === 0) return null;
  const safeIndex = Math.min(index, images.length - 1);
  const current = images[safeIndex];
  const multiple = images.length > 1;

  const goTo = (next: number) => {
    setIndex(((next % images.length) + images.length) % images.length);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!multiple) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(safeIndex - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(safeIndex + 1);
    }
  };

  const controlClass =
    "inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line-strong bg-night/80 text-cream transition-colors duration-200 hover:border-line-gold hover:text-gold";

  return (
    <div>
      <div
        // touch-pan-y: the browser keeps vertical page scrolling, we get horizontal swipes.
        className="relative aspect-[16/10] touch-pan-y overflow-hidden rounded-lg border border-line bg-coal shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]"
        onKeyDown={onKeyDown}
        onTouchStart={(e) => {
          const t = e.touches[0];
          touchStart.current = { x: t.clientX, y: t.clientY };
        }}
        onTouchCancel={() => {
          touchStart.current = null;
        }}
        onTouchEnd={(e) => {
          const start = touchStart.current;
          touchStart.current = null;
          if (!start || !multiple) return;
          const t = e.changedTouches[0];
          const dx = t.clientX - start.x;
          const dy = t.clientY - start.y;
          // Only a mostly-horizontal swipe switches the picture.
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) goTo(safeIndex + (dx < 0 ? 1 : -1));
        }}
      >
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          fill
          priority
          sizes="(min-width: 1024px) 56vw, 100vw"
          className="object-cover"
        />
        {multiple && (
          <>
            <div className="absolute inset-y-0 left-3 flex items-center">
              <button
                type="button"
                onClick={() => goTo(safeIndex - 1)}
                aria-label="Image précédente"
                className={controlClass}
              >
                <ChevronLeft className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="absolute inset-y-0 right-3 flex items-center">
              <button
                type="button"
                onClick={() => goTo(safeIndex + 1)}
                aria-label="Image suivante"
                className={controlClass}
              >
                <ChevronRight className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <p className="absolute bottom-3 right-3 rounded-md bg-night/80 px-2.5 py-1 text-[12px] font-semibold tracking-[0.08em] text-cream">
              {safeIndex + 1} / {images.length}
            </p>
          </>
        )}
      </div>

      {multiple && (
        <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
          {images.map((image, i) => (
            <button
              key={image.src}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`${name} — image ${i + 1}`}
              aria-current={i === safeIndex}
              className={`relative aspect-[16/10] overflow-hidden rounded-md border transition-colors duration-200 ${
                i === safeIndex
                  ? "border-gold"
                  : "border-line hover:border-line-gold"
              }`}
            >
              <Image
                src={image.src}
                alt=""
                fill
                loading="lazy"
                sizes="15vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        Image {safeIndex + 1} sur {images.length} : {current.alt}
      </p>
    </div>
  );
}
