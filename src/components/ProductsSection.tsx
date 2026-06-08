import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Shirt, ScrollText, Monitor, Frame, Package, Gift } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { supabase } from "@/integrations/supabase/client";
import { retryQuery } from "@/lib/retryQuery";

const categoryMeta = [
  {
    name: "Remeras",
    description: "Diseños anime, gaming y arte urbano impresos en remeras de alta calidad.",
    icon: Shirt,
  },
  {
    name: "Scrolls",
    description: "Impresiones artísticas en formato scroll para decorar tus espacios.",
    icon: ScrollText,
  },
  {
    name: "Mousepads",
    description: "Mousepads personalizados con diseños únicos para tu setup.",
    icon: Monitor,
  },
  {
    name: "Cuadros de Cerámica",
    description: "Arte impreso en cerámica con acabados de alta calidad.",
    icon: Frame,
  },
  {
    name: "Combos",
    description: "Packs especiales combinando nuestros mejores productos.",
    icon: Package,
  },
  {
    name: "Box Regalo",
    description: "Cajas de regalo listas para sorprender con estilo propio.",
    icon: Gift,
  },
];

const ProductsSection = () => {
  const [images, setImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchImages = async () => {
      // First try custom covers from category_covers table (with retry)
      const { data: coverData } = await retryQuery<{ category: string; image_url: string }[]>(
        () =>
          supabase
            .from("category_covers")
            .select("category, image_url") as any
      );

      const map: Record<string, string> = {};
      if (coverData) {
        for (const row of coverData) {
          map[row.category] = row.image_url;
        }
      }

      // Fill remaining categories with first product image as fallback
      const missingCategories = categoryMeta
        .map((c) => c.name)
        .filter((name) => !map[name]);

      if (missingCategories.length > 0) {
        const { data } = await retryQuery<{ category: string; images: string[] }[]>(
          () =>
            supabase
              .from("products")
              .select("category, images")
              .eq("visible", true)
              .order("created_at", { ascending: false }) as any
        );

        if (data) {
          for (const row of data) {
            if (missingCategories.includes(row.category) && !map[row.category] && row.images?.length > 0) {
              map[row.category] = row.images[0];
            }
          }
        }
      }

      setImages(map);
    };
    fetchImages();
  }, []);

  return (
    <section id="productos" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <h2 className="font-display text-5xl md:text-6xl text-center mb-4 text-foreground">
            Nuestros <span className="text-primary">Productos</span>
          </h2>
          <p className="text-center text-muted-foreground font-body text-lg mb-16 max-w-xl mx-auto">
            Productos personalizados con diseños que te representan
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryMeta.map((product, i) => {
            const img = images[product.name];
            return (
              <ScrollReveal key={product.name} delay={i * 100}>
                <Link
                  to={`/catalogo?cat=${encodeURIComponent(product.name)}`}
                  className="group bg-card border border-border rounded-lg overflow-hidden transition-all duration-300 hover:glow-border-intense hover:scale-[1.02] flex flex-col h-full block"
                >
                  <div className="p-5 h-[100px] flex flex-col justify-center">
                    <h3 className="font-display text-2xl text-foreground mb-1">
                      {product.name}
                    </h3>
                    <p className="font-body text-muted-foreground text-sm leading-relaxed line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                  <div className="flex-1 min-h-[220px] overflow-hidden bg-muted flex items-center justify-center relative">
                    {img ? (
                      <img
                        src={img}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <product.icon className="w-16 h-16 text-muted-foreground/40 group-hover:text-primary transition-colors duration-300" />
                    )}
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/catalogo"
            className="inline-block px-8 py-3 border border-secondary text-secondary font-body font-bold uppercase tracking-wider hover:bg-secondary hover:text-secondary-foreground transition-all duration-200"
          >
            Ver más
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
