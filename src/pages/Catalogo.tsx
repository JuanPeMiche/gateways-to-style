import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import GateLogo from "@/components/GateLogo";

import productRemeras from "@/assets/product-remeras.jpg";
import productTazas from "@/assets/product-tazas.jpg";
import productPortarretratos from "@/assets/product-portarretratos.jpg";
import productOtros from "@/assets/product-otros.jpg";
import catalogHoodie from "@/assets/catalog-hoodie.jpg";
import catalogTotebag from "@/assets/catalog-totebag.jpg";
import catalogStickers from "@/assets/catalog-stickers.jpg";
import catalogPhonecase from "@/assets/catalog-phonecase.jpg";

const categories = ["Todos", "Remeras", "Tazas", "Portarretratos", "Accesorios"];

const catalogItems = [
  { name: "Remera Neon V", category: "Remeras", image: productRemeras, description: "Diseño cyberpunk con detalles neón" },
  { name: "Taza Anime Girl", category: "Tazas", image: productTazas, description: "Ilustración anime en taza cerámica" },
  { name: "Portarretrato LED", category: "Portarretratos", image: productPortarretratos, description: "Marco con bordes iluminados violeta" },
  { name: "Pack Variado", category: "Accesorios", image: productOtros, description: "Stickers, fundas y más con diseño propio" },
  { name: "Hoodie Pentagram", category: "Remeras", image: catalogHoodie, description: "Hoodie con diseño cyberpunk exclusivo" },
  { name: "Tote Bag Anime", category: "Accesorios", image: catalogTotebag, description: "Bolsa de tela con ilustración anime" },
  { name: "Stickers Pack", category: "Accesorios", image: catalogStickers, description: "Pack de stickers anime coleccionables" },
  { name: "Funda Neon", category: "Accesorios", image: catalogPhonecase, description: "Funda de celular con arte neón" },
];

const Catalogo = () => {
  const [active, setActive] = useState("Todos");
  const filtered = active === "Todos" ? catalogItems : catalogItems.filter((i) => i.category === active);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-primary/30 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-secondary transition-colors font-body font-semibold uppercase tracking-wider text-sm">
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

        {/* Category filters */}
        <ScrollReveal delay={100}>
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`px-5 py-2 font-body font-bold text-sm uppercase tracking-wider border transition-all duration-200 ${
                  active === cat
                    ? "bg-primary text-primary-foreground border-primary glow-border"
                    : "bg-transparent text-muted-foreground border-border hover:border-secondary hover:text-secondary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((item, i) => (
            <ScrollReveal key={item.name} delay={i * 80}>
              <div className="group bg-card border border-border rounded-lg overflow-hidden transition-all duration-300 hover:glow-border-intense hover:scale-[1.02]">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <span className="inline-block font-body text-xs uppercase tracking-wider text-secondary mb-2">
                    {item.category}
                  </span>
                  <h3 className="font-display text-xl text-foreground mb-1">{item.name}</h3>
                  <p className="font-body text-muted-foreground text-sm">{item.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

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
