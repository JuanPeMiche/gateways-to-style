import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Settings, Loader2 } from "lucide-react";
import GateLogo from "@/components/GateLogo";
import {
  getPublishedProductsPaginated,
  getCategoryCounts,
  CATEGORIES,
  PAGE_SIZE,
  type Product,
} from "@/lib/productStore";

const allFilters = ["Todos", ...CATEGORIES] as const;

const Catalogo = () => {
  const [active, setActive] = useState("Todos");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoverImageIdx, setHoverImageIdx] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Load counts once
  useEffect(() => {
    getCategoryCounts().then(setCounts).catch(console.error);
  }, []);

  // Reset when filter or search changes
  useEffect(() => {
    setProducts([]);
    setPage(0);
    setHasMore(true);
    setInitialLoad(true);
  }, [active, debouncedSearch]);

  // Fetch page
  const fetchPage = useCallback(
    async (pageNum: number) => {
      setLoading(true);
      try {
        const { products: newProducts, hasMore: more } =
          await getPublishedProductsPaginated(
            pageNum,
            active,
            debouncedSearch || undefined
          );
        setProducts((prev) =>
          pageNum === 0 ? newProducts : [...prev, ...newProducts]
        );
        setHasMore(more);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    },
    [active, debouncedSearch]
  );

  useEffect(() => {
    fetchPage(page);
  }, [page, fetchPage]);

  // Infinite scroll observer
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  // Cycle images on hover
  useEffect(() => {
    if (!hoveredId) return;
    const product = products.find((p) => p.id === hoveredId);
    if (!product || product.images.length <= 1) return;
    const interval = setInterval(() => {
      setHoverImageIdx((prev) => (prev + 1) % product.images.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [hoveredId, products]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-primary/30 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-secondary transition-colors font-body font-semibold uppercase tracking-wider text-sm"
          >
            <ArrowLeft size={18} />
            Volver
          </Link>
          <Link to="/">
            <GateLogo />
          </Link>
          <a
            href="https://wa.me/59892365380"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-primary text-primary-foreground font-body font-bold text-xs uppercase tracking-wider border border-primary hover:bg-primary/80 transition-all duration-200"
          >
            Consultar
          </a>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <h1 className="font-display text-5xl md:text-7xl text-center mb-4 text-foreground">
          Nuestro <span className="text-primary">Catálogo</span>
        </h1>
        <p className="text-center text-muted-foreground font-body text-lg mb-10 max-w-xl mx-auto">
          Explorá todos nuestros productos personalizados. ¿Te gusta algo?
          Escribinos por WhatsApp.
        </p>

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full bg-card border border-border rounded-lg pl-12 pr-4 py-3 font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>

        {/* Category filters with counts */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {allFilters.map((cat) => {
            const count = counts[cat] ?? 0;
            return (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`px-5 py-2 font-body font-bold text-sm uppercase tracking-wider rounded-full border transition-all duration-200 ${
                  active === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-transparent text-muted-foreground border-border hover:border-secondary hover:text-secondary"
                }`}
              >
                {cat}
                {count > 0 && (
                  <span className="ml-2 text-xs opacity-70">({count})</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Initial loading */}
        {initialLoad ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="font-body text-muted-foreground text-lg">
              {debouncedSearch
                ? `No se encontraron productos para "${debouncedSearch}"`
                : "Próximamente productos en esta categoría"}
            </p>
          </div>
        ) : (
          <>
            {/* Product count */}
            <p className="text-center text-muted-foreground font-body text-sm mb-6">
              {products.length}
              {hasMore ? "+" : ""} productos
            </p>

            {/* Product grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((item) => {
                const isHovered = hoveredId === item.id;
                const imgIdx = isHovered
                  ? hoverImageIdx % Math.max(item.images.length, 1)
                  : 0;
                return (
                  <div
                    key={item.id}
                    className="group bg-card border border-border rounded-lg overflow-hidden transition-all duration-300 hover:glow-border-intense hover:scale-[1.02]"
                    onMouseEnter={() => {
                      setHoveredId(item.id);
                      setHoverImageIdx(0);
                    }}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      {item.images.length > 0 ? (
                        <>
                          <img
                            src={item.images[imgIdx]}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                            decoding="async"
                          />
                          {item.images.length > 1 && (
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                              {item.images.map((_, di) => (
                                <span
                                  key={di}
                                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                    di === imgIdx
                                      ? "bg-primary"
                                      : "bg-white/40"
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
                        {item.name}
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
              })}
            </div>

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-4" />

            {loading && !initialLoad && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}

            {!hasMore && products.length > 0 && (
              <p className="text-center text-muted-foreground/50 font-body text-sm py-8">
                — Fin del catálogo —
              </p>
            )}
          </>
        )}

        {/* CTA */}
        <div className="text-center mt-16 bg-card border border-border rounded-lg p-10">
          <h2 className="font-display text-3xl text-foreground mb-3">
            ¿No encontrás lo que buscás?
          </h2>
          <p className="font-body text-muted-foreground mb-6">
            Hacemos productos 100% personalizados. Mandanos tu idea y lo creamos
            para vos.
          </p>
          <a
            href="https://wa.me/59892365380"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 bg-primary text-primary-foreground font-body font-bold uppercase tracking-wider hover:bg-primary/80 transition-all duration-200 glow-border border border-primary"
          >
            Escribinos por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default Catalogo;
