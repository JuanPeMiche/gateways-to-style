import { Settings } from "lucide-react";

const GateLogo = ({ className = "" }: { className?: string }) => (
  <a href="#inicio" className={`flex items-center gap-2 group ${className}`}>
    <Settings className="w-8 h-8 text-primary transition-transform duration-500 group-hover:rotate-90" />
    <span className="font-display text-3xl tracking-widest text-foreground">GATE</span>
  </a>
);

export default GateLogo;
