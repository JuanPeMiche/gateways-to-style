// Lazy image component with IntersectionObserver
import { useState, useRef, useEffect } from "react";
import { ImageOff } from "lucide-react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  /**
   * Original (untransformed) URL. If the optimized `src` fails — e.g. image
   * transformations unavailable — we retry with this before giving up, so a
   * broken CDN variant never leaves an empty card.
   */
  fallbackSrc?: string;
}

const LazyImage = ({ src, alt, className = "", fallbackSrc }: LazyImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Reset when the source changes (hover cycles through a product's images).
  useEffect(() => {
    setCurrentSrc(src);
    setLoaded(false);
    setFailed(false);
  }, [src]);

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

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      return;
    }
    setFailed(true);
  };

  return (
    <div ref={ref} className="w-full h-full relative">
      {!loaded && !failed && (
        <div className="absolute inset-0 animate-shimmer rounded" />
      )}
      {failed && (
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageOff className="w-8 h-8 text-muted-foreground/20" />
        </div>
      )}
      {inView && !failed && (
        <img
          src={currentSrc}
          alt={alt}
          className={`${className} ${loaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={handleError}
        />
      )}
    </div>
  );
};

export default LazyImage;
