import { useState, useRef, useEffect, memo } from "react";
import { getSrcSet, ImageSize } from "@/lib/imageOptimizer";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Sizes attribute for responsive images */
  sizes?: string;
  /** Which size preset to use as primary src */
  preset?: "CARD_SM" | "CARD_MD" | "CARD_LG" | "COVER" | "FULL" | "THUMB" | "ADMIN_COVER";
}

const LazyImage = memo(({ src, alt, className = "", sizes, preset = "CARD_MD" }: LazyImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Get optimized URL based on preset
  const optimizedSrc = ImageSize[preset](src);
  const srcSet = getSrcSet(src, [300, 400, 600]);

  return (
    <div ref={ref} className="w-full h-full relative">
      {/* Shimmer skeleton */}
      {!loaded && (
        <div className="absolute inset-0 animate-shimmer rounded" />
      )}
      {inView && (
        <img
          src={optimizedSrc}
          srcSet={srcSet || undefined}
          sizes={sizes}
          alt={alt}
          className={`${className} ${loaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
});

LazyImage.displayName = "LazyImage";
export default LazyImage;
