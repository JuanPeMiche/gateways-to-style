import { useState } from "react";
import { MessageCircle, Instagram, MapPin, Send } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const ContactSection = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = encodeURIComponent(`Hola Gate! Soy ${form.name} (${form.email}). ${form.message}`);
    window.open(`https://wa.me/59892365380?text=${msg}`, "_blank");
  };

  return (
    <section id="contacto" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <h2 className="font-display text-5xl md:text-6xl text-center mb-16 text-foreground">
            <span className="text-primary">Contactanos</span>
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {/* Info */}
          <ScrollReveal delay={100}>
            <div className="space-y-6">
              <a
                href="https://wa.me/59892365380"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-card border border-border rounded-lg p-5 transition-all duration-300 hover:border-whatsapp hover:shadow-[0_0_20px_hsl(142_70%_45%/0.3)]"
              >
                <div className="w-12 h-12 rounded-lg bg-whatsapp/10 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-whatsapp" />
                </div>
                <div>
                  <p className="font-body font-bold text-foreground">WhatsApp</p>
                  <p className="font-body text-muted-foreground text-sm">092 365 380</p>
                </div>
              </a>

              <a
                href="https://instagram.com/gate01.uy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-card border border-border rounded-lg p-5 transition-all duration-300 hover:glow-border"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Instagram className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-body font-bold text-foreground">@gate01.uy</p>
                  <p className="font-body text-muted-foreground text-sm">Anime, gaming, streetwear</p>
                </div>
              </a>

              <a
                href="https://instagram.com/gate.uy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-card border border-border rounded-lg p-5 transition-all duration-300 hover:glow-border"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Instagram className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-body font-bold text-foreground">@gate.uy</p>
                  <p className="font-body text-muted-foreground text-sm">Feminista, artístico</p>
                </div>
              </a>

              <div className="flex items-center gap-4 bg-card border border-border rounded-lg p-5">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-body font-bold text-foreground">Montevideo, Uruguay</p>
                  <p className="font-body text-muted-foreground text-sm">Envíos a todo el país</p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Form */}
          <ScrollReveal delay={200}>
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-8 space-y-5">
              <div>
                <label className="block font-body font-semibold text-sm text-foreground mb-2 uppercase tracking-wider">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-input border border-border rounded-sm px-4 py-3 font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="block font-body font-semibold text-sm text-foreground mb-2 uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-input border border-border rounded-sm px-4 py-3 font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <label className="block font-body font-semibold text-sm text-foreground mb-2 uppercase tracking-wider">
                  Mensaje
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-input border border-border rounded-sm px-4 py-3 font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                  placeholder="¿En qué podemos ayudarte?"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground font-body font-bold uppercase tracking-wider hover:bg-secondary transition-all duration-200 glow-border border border-primary"
              >
                <Send className="w-4 h-4" />
                Enviar mensaje
              </button>
            </form>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
