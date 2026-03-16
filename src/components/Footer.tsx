import { Instagram, MessageCircle } from "lucide-react";
import GateLogo from "./GateLogo";

const Footer = () => (
  <footer className="border-t border-primary/30 bg-card py-12">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div>
          <GateLogo />
          <p className="font-body text-muted-foreground mt-3 text-sm">
            Diseños que te representan
          </p>
        </div>

        <div>
          <h4 className="font-display text-lg text-foreground mb-4">Enlaces</h4>
          <div className="space-y-2">
            {["Inicio", "Productos", "Sobre Nosotros", "Contacto"].map((link) => (
              <a
                key={link}
                href={`#${link === "Inicio" ? "inicio" : link === "Productos" ? "productos" : link === "Sobre Nosotros" ? "nosotros" : "contacto"}`}
                className="block font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display text-lg text-foreground mb-4">Seguinos</h4>
          <div className="flex gap-3">
            <a
              href="https://instagram.com/gate01.uy"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border border-border rounded-sm flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all"
              aria-label="Instagram gate01.uy"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://instagram.com/gate.uy"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border border-border rounded-sm flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all"
              aria-label="Instagram gate.uy"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://wa.me/59892365380"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border border-border rounded-sm flex items-center justify-center text-muted-foreground hover:text-whatsapp hover:border-whatsapp transition-all"
              aria-label="WhatsApp"
            >
              <MessageCircle size={18} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-border mt-10 pt-6 text-center">
        <p className="font-body text-xs text-muted-foreground">
          © 2024 Gate UY. Todos los derechos reservados.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
