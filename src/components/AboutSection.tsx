import { Truck, Palette, MessageCircle } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const features = [
  { icon: Truck, title: "Envíos a todo Uruguay", description: "Llegamos a cada rincón del país con tu pedido." },
  { icon: Palette, title: "Diseños únicos", description: "Anime, gaming, arte urbano y moda contemporánea." },
  { icon: MessageCircle, title: "Atención personalizada", description: "Te asesoramos para crear el producto perfecto." },
];

const AboutSection = () => (
  <section id="nosotros" className="py-24 bg-muted/30">
    <div className="container mx-auto px-4">
      <ScrollReveal>
        <h2 className="font-display text-5xl md:text-6xl text-center mb-4 text-foreground">
          ¿Quiénes <span className="text-primary">somos</span>?
        </h2>
        <p className="text-center text-muted-foreground font-body text-lg mb-16 max-w-2xl mx-auto leading-relaxed">
          Gate es una tienda online uruguaya con base en Montevideo. Nos especializamos en productos
          personalizados con diseños únicos — desde cultura anime y gaming hasta arte contemporáneo y
          moda urbana. Hacemos envíos a todo el país.
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <ScrollReveal key={f.title} delay={i * 150}>
            <div className="bg-card border border-border rounded-lg p-8 text-center transition-all duration-300 hover:glow-border hover:scale-[1.02]">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-primary/10 mb-5">
                <f.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-xl text-foreground mb-2">{f.title}</h3>
              <p className="font-body text-muted-foreground text-sm">{f.description}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);

export default AboutSection;
