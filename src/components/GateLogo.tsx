import logoImage from "@/assets/logo-gate01.jpg";

const GateLogo = ({ className = "" }: { className?: string }) => (
  <a href="#inicio" className={`flex items-center group ${className}`}>
    <img
      src={logoImage}
      alt="Gate01 Logo"
      className="h-[48px] md:h-[48px] h-[38px] w-auto object-contain transition-all duration-200 group-hover:brightness-[1.05]"
    />
  </a>
);

export default GateLogo;
