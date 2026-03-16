import { Link } from "react-router-dom";
import productRemeras from "@/assets/product-remeras.jpg";
import productTazas from "@/assets/product-tazas.jpg";
import productPortarretratos from "@/assets/product-portarretratos.jpg";
import productOtros from "@/assets/product-otros.jpg";
import ScrollReveal from "./ScrollReveal";

const products = [
  {
    name: "Remeras",
    description: "Diseños anime, gaming y arte urbano impresos en remeras de alta calidad.",
    image: productRemeras,
  },
  {
    name: "Tazas",
    description: "Tazas personalizadas con los diseños más creativos para tu día a día.",
    image: productTazas,
  },
  {
    name: "Portarretratos",
    description: "Enmarcá tus momentos con estilos únicos y personalizados.",
    image: productPortarretratos,
  },
  {
    name: "Otros Productos",
    description: "Stickers, fundas, accesorios y mucho más con diseño propio.",
    image: productOtros,
  },
];

const ProductsSection = () => (
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, i) => (
          <ScrollReveal key={product.name} delay={i * 100}>
            <div className="group bg-card border border-border rounded-lg overflow-hidden transition-all duration-300 hover:glow-border-intense hover:scale-[1.02]">
              <div className="aspect-square overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <h3 className="font-display text-2xl text-foreground mb-2">{product.name}</h3>
                <p className="font-body text-muted-foreground text-sm leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>
          </ScrollReveal>
        ))}
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

export default ProductsSection;
