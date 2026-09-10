import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { login, isAuthenticated } from "@/lib/adminAuth";
import logoImage from "@/assets/logo-gate01.png";
import { useEffect } from "react";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    isAuthenticated().then((authed) => {
      if (active && authed) navigate("/admin/dashboard", { replace: true });
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { ok, message } = await login(email, pass);
      if (ok) {
        navigate("/admin/dashboard", { replace: true });
      } else {
        setError(message || "No se pudo iniciar sesión");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <img src={logoImage} alt="Gate01" className="h-[48px] w-auto mb-10" />
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[400px] bg-card border border-border rounded-lg p-8 space-y-6"
      >
        <h1 className="font-display text-2xl text-foreground text-center">
          Panel de Administración
        </h1>

        <div className="space-y-1">
          <label className="font-body text-sm text-muted-foreground">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full bg-input border border-border rounded-md pl-10 pr-4 py-2.5 font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              placeholder="admin@ejemplo.com"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-body text-sm text-muted-foreground">Contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type={showPass ? "text" : "password"}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoComplete="current-password"
              className="w-full bg-input border border-border rounded-md pl-10 pr-10 py-2.5 font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              placeholder="Contraseña"
              required
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-primary text-primary-foreground font-body font-bold uppercase tracking-wider rounded-md hover:bg-primary/80 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? "Ingresando..." : "Ingresar"}
        </button>

        {error && (
          <p className="text-center text-destructive font-body text-sm">{error}</p>
        )}
      </form>
    </div>
  );
};

export default AdminLogin;
