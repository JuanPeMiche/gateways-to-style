import { Settings } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => (
  <section
    id="inicio"
    className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gear-pattern"
  >
    {/* Large rotating gear background */}
    <Settings className="absolute text-primary/5 w-[600px] h-[600px] animate-gear-spin pointer-events-none" />

    <div className="relative z-10 container mx-auto px-4 text-center">
      <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-foreground leading-none mb-6 text-glow">
        Llevá tu estilo
        <br />
        <span className="text-secondary">al límite</span>
      </h1>
      <p className="font-body text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 font-medium">
        Remeras, tazas, portarretratos y más — diseños únicos con envíos a todo Uruguay
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/catalogo"
          className="px-8 py-4 bg-primary text-primary-foreground font-body font-bold text-lg uppercase tracking-wider hover:bg-primary/80 transition-all duration-200 glow-border border border-primary"
        >
          Ver productos
        </Link>
        <a
          href="#contacto"
          className="px-8 py-4 border border-secondary/50 text-secondary font-body font-bold text-lg uppercase tracking-wider hover:border-secondary hover:bg-secondary/10 transition-all duration-200"
        >
          Contactanos
        </a>
      </div>
    </div>

    {/* Bottom gradient fade */}
    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
  </section>
);

export default HeroSection;
