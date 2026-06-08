import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Search, SearchX, Loader2 } from "lucide-react";
import GateLogo from "@/components/GateLogo";
import ProductCard from "@/components/catalog/ProductCard";
import ScrollToTop from "@/components/catalog/ScrollToTop";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, type Product } from "@/lib/productStore";
import { retryQuery } from "@/lib/retryQuery";
import { toast } from "sonner";

const allFilters = ["Todos", ...CATEGORIES] as const;
const BATCH_SIZE = 24;

const Catalogo = () => {
  const [searchParams] = useSearchParams();
  const initialCat = searchParams.get("cat") || "Todos";

  const [active, setActive] = useState(initialCat);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Debounce search — 250ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  // Load ALL published products once
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("visible", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setAllProducts(data as Product[]);
      }
      setInitialLoad(false);
    };
    load();
  }, []);

  // O(1) category grouping
  const categoryMap = useMemo(() => {
    const map: Record<string, Product[]> = { Todos: allProducts };
    for (const cat of CATEGORIES) map[cat] = [];
    for (const p of allProducts) {
      if (map[p.category]) map[p.category].push(p);
    }
    return map;
  }, [allProducts]);

  // Category counts
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const [key, arr] of Object.entries(categoryMap)) {
      c[key] = arr.length;
    }
    return c;
  }, [categoryMap]);

  // Filtered products — memoized
  const filtered = useMemo(() => {
    const base = categoryMap[active] || allProducts;
    if (!debouncedSearch.trim()) return base;
    const q = debouncedSearch.toLowerCase();
    return base.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [categoryMap, active, debouncedSearch, allProducts]);

  // Reset visible count when filter/search changes
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [active, debouncedSearch]);

  // Progressive load via intersection observer
  const hasMore = visibleCount < filtered.length;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore) {
          setVisibleCount((v) => Math.min(v + BATCH_SIZE, filtered.length));
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, filtered.length]);

  const visibleProducts = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount]
  );

  const handleCategoryChange = useCallback((cat: string) => {
    setActive(cat);
  }, []);

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

      <div id="catalog-top" className="container mx-auto px-4 py-12">
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
                onClick={() => handleCategoryChange(cat)}
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

        {/* Content */}
        {initialLoad ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <SearchX className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="font-body text-muted-foreground text-lg">
              No encontramos productos para tu búsqueda
            </p>
          </div>
        ) : (
          <>
            {/* Product count */}
            <p className="text-center text-muted-foreground font-body text-sm mb-6">
              Mostrando {Math.min(visibleCount, filtered.length)} de{" "}
              {filtered.length} productos
            </p>

            {/* Product grid with fade transition */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 transition-opacity duration-150">
              {visibleProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  searchQuery={debouncedSearch}
                />
              ))}
            </div>

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-4" />

            {hasMore && (
              <div className="flex justify-center py-8">
                <p className="font-body text-sm text-muted-foreground animate-pulse">
                  Cargando más productos...
                </p>
              </div>
            )}

            {!hasMore && filtered.length > 0 && (
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

      <ScrollToTop targetId="catalog-top" />
    </div>
  );
};

export default Catalogo;
