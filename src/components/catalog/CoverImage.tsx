import { useState, useEffect } from "react";
import { optimizedImageUrl, type ImageVariant } from "@/lib/imageUrl";

interface CoverImageProps {
  /** Raw storage URL. */
  src: string;
  alt: string;
  variant?: ImageVariant;
  className?: string;
  /** Rendered when both the optimized and original sources fail. */
  fallback: React.ReactNode;
}

/**
 * Category cover image with graceful degradation.
 *
 * A handful of legacy uploads are too large for Supabase's transformation
 * endpoint (HTTP 400 "source image resolution is too large"). Those used to
 * leave a broken-image icon on the home page, because this section rendered a
 * bare <img> with no error handling. Now a failed transform falls back to the
 * original, and a failed original falls back to the category icon.
 */
const CoverImage = ({
  src,
  alt,
  variant = "card",
  className = "",
  fallback,
}: CoverImageProps) => {
  const optimized = optimizedImageUrl(src, variant);
  const [current, setCurrent] = useState(optimized);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrent(optimizedImageUrl(src, variant));
    setFailed(false);
  }, [src, variant]);

  if (failed) return <>{fallback}</>;

  return (
    <img
      src={current}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => {
        // The transformed variant failed — try the original once, then give up.
        if (current !== src) setCurrent(src);
        else setFailed(true);
      }}
    />
  );
};

export default CoverImage;
