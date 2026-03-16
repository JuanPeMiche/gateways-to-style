import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import GateLogo from "./GateLogo";

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Productos", href: "#productos" },
  { label: "Sobre Nosotros", href: "#nosotros" },
  { label: "Contacto", href: "#contacto" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-lg border-b border-primary/30"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between py-4 px-4">
        <GateLogo />

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-body text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#productos"
            className="ml-2 px-5 py-2 bg-primary text-primary-foreground font-body font-bold text-sm uppercase tracking-wider border border-primary hover:bg-secondary transition-all duration-200 glow-border"
          >
            Ver catálogo
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-foreground"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-lg border-t border-primary/20 px-4 pb-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-3 font-body text-lg font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#productos"
            onClick={() => setMobileOpen(false)}
            className="mt-3 block text-center px-5 py-3 bg-primary text-primary-foreground font-body font-bold text-sm uppercase tracking-wider"
          >
            Ver catálogo
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
