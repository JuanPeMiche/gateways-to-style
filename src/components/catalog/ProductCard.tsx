import { memo, useState, useEffect, useCallback } from "react";
import { Settings } from "lucide-react";
import LazyImage from "./LazyImage";
import type { Product } from "@/lib/productStore";

interface ProductCardProps {
  item: Product;
  searchQuery?: string;
}

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-transparent text-primary font-bold">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

const ProductCard = memo(({ item, searchQuery }: ProductCardProps) => {
  const [hovered, setHovered] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    if (!hovered || item.images.length <= 1) return;
    const interval = setInterval(() => {
      setImgIdx((prev) => (prev + 1) % item.images.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [hovered, item.images.length]);

  const handleEnter = useCallback(() => {
    setHovered(true);
    setImgIdx(0);
  }, []);
  const handleLeave = useCallback(() => setHovered(false), []);

  const currentImg = item.images[hovered ? imgIdx : 0];

  return (
    <div
      className="group bg-card border border-border rounded-lg overflow-hidden transition-all duration-300 hover:glow-border-intense hover:scale-[1.02]"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {item.images.length > 0 ? (
          <>
            <LazyImage
              src={currentImg}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {item.images.length > 1 && hovered && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {item.images.map((_, di) => (
                  <span
                    key={di}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      di === imgIdx ? "bg-primary" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Settings className="w-8 h-8 text-muted-foreground/20" />
          </div>
        )}
        <span className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-primary-foreground font-body text-[9px] font-bold uppercase tracking-wider rounded-full">
          {item.category}
        </span>
      </div>
      <div className="p-3">
        <h3 className="font-display text-sm text-foreground leading-tight mb-1 truncate">
          {highlightMatch(item.name, searchQuery || "")}
        </h3>
        {item.description && (
          <p className="font-body text-muted-foreground text-xs line-clamp-2 mb-1">
            {item.description}
          </p>
        )}
        {item.price !== null && (
          <p className="font-body text-secondary font-bold text-sm">
            ${item.price} UYU
          </p>
        )}
      </div>
    </div>
  );
});

ProductCard.displayName = "ProductCard";
export default ProductCard;
