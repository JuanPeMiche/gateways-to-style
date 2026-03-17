import logoImage from "@/assets/logo-gate01.png";

const GateLogo = ({ className = "" }: { className?: string }) => (
  <a href="#inicio" className={`flex items-center group ${className}`}>
    <img
      src={logoImage}
      alt="Gate01 Logo"
      className="h-[38px] md:h-[48px] w-auto object-contain transition-all duration-200 group-hover:brightness-110"
    />
  </a>
);

export default GateLogo;
