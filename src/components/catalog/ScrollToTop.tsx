import { useState, useEffect, useCallback } from "react";
import { ArrowUp } from "lucide-react";

interface ScrollToTopProps {
  targetId: string;
}

const ScrollToTop = ({ targetId }: ScrollToTopProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollUp = useCallback(() => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
  }, [targetId]);

  if (!visible) return null;

  return (
    <button
      onClick={scrollUp}
      aria-label="Volver arriba"
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/80 transition-all duration-200 animate-in fade-in"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};

export default ScrollToTop;
