import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Settings } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import GateLogo from "@/components/GateLogo";
import { getPublishedProducts, CATEGORIES, type Product } from "@/lib/productStore";

const allFilters = ["Todos", ...CATEGORIES] as const;

const Catalogo = () => {
  const [active, setActive] = useState("Todos");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoverImageIdx, setHoverImageIdx] = useState(0);

  useEffect(() => {
    const load = () => setProducts(getPublishedProducts());
    load();
    window.addEventListener("gate01_products_updated", load);
    return () => window.removeEventListener("gate01_products_updated", load);
  }, []);

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

  const filtered = products
    .filter((i) => active === "Todos" || i.category === active)
    .filter((i) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
      );
    });

  // Check if a category has published products
  const categoryHasProducts = (cat: string) =>
    cat === "Todos"
      ? products.length > 0
      : products.some((p) => p.category === cat);

  const showEmpty =
    active !== "Todos" && !categoryHasProducts(active) && !search.trim();

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
        <ScrollReveal>
          <h1 className="font-display text-5xl md:text-7xl text-center mb-4 text-foreground">
            Nuestro <span className="text-primary">Catálogo</span>
          </h1>
          <p className="text-center text-muted-foreground font-body text-lg mb-12 max-w-xl mx-auto">
            Explorá todos nuestros productos personalizados. ¿Te gusta algo? Escribinos por WhatsApp.
          </p>
        </ScrollReveal>

        {/* Search */}
        <ScrollReveal delay={50}>
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
        </ScrollReveal>

        {/* Category filters */}
        <ScrollReveal delay={100}>
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {allFilters.map((cat) => (
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
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Empty state for category */}
        {showEmpty ? (
          <div className="text-center py-20">
            <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30 animate-pulse" />
            <p className="font-body text-muted-foreground text-lg">
              Próximamente productos en esta categoría
            </p>
          </div>
        ) : filtered.length === 0 && search.trim() ? (
          <div className="text-center py-16">
            <p className="font-body text-muted-foreground text-lg">
              No se encontraron productos para "{search}"
            </p>
          </div>
        ) : filtered.length === 0 && active === "Todos" ? (
          <div className="text-center py-20">
            <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30 animate-pulse" />
            <p className="font-body text-muted-foreground text-lg">
              Próximamente productos disponibles
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item, i) => {
              const isHovered = hoveredId === item.id;
              const imgIdx = isHovered ? hoverImageIdx % Math.max(item.images.length, 1) : 0;
              return (
                <ScrollReveal key={item.id} delay={i * 80}>
                  <div
                    className="group bg-card border border-border rounded-lg overflow-hidden transition-all duration-300 hover:glow-border-intense hover:scale-[1.02]"
                    onMouseEnter={() => { setHoveredId(item.id); setHoverImageIdx(0); }}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div className="relative h-[260px] overflow-hidden bg-muted">
                      {item.images.length > 0 ? (
                        <>
                          <img
                            src={item.images[imgIdx]}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                          {item.images.length > 1 && (
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
                        <div className="w-full h-full flex items-center justify-center bg-[hsl(0_0%_10%)]">
                          <Settings className="w-10 h-10 text-muted-foreground/20" />
                        </div>
                      )}
                      {/* Category badge */}
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-primary text-primary-foreground font-body text-[10px] font-bold uppercase tracking-wider rounded-full">
                        {item.category}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-xl text-foreground mb-1">{item.name}</h3>
                      {item.description && (
                        <p className="font-body text-muted-foreground text-sm mb-2">{item.description}</p>
                      )}
                      {item.price !== null && (
                        <p className="font-body text-secondary font-bold">${item.price} UYU</p>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <ScrollReveal delay={200}>
          <div className="text-center mt-16 bg-card border border-border rounded-lg p-10">
            <h2 className="font-display text-3xl text-foreground mb-3">
              ¿No encontrás lo que buscás?
            </h2>
            <p className="font-body text-muted-foreground mb-6">
              Hacemos productos 100% personalizados. Mandanos tu idea y lo creamos para vos.
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
        </ScrollReveal>
      </div>
    </div>
  );
};

export default Catalogo;
