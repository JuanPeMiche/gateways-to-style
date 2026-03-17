import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { login, isAuthenticated } from "@/lib/adminAuth";
import logoImage from "@/assets/logo-gate01.png";
import { useEffect } from "react";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) navigate("/admin/dashboard", { replace: true });
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    if (login(user, pass)) {
      navigate("/admin/dashboard", { replace: true });
    } else {
      setError(true);
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
          <label className="font-body text-sm text-muted-foreground">Usuario</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full bg-input border border-border rounded-md pl-10 pr-4 py-2.5 font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              placeholder="Usuario"
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
          className="w-full py-3 bg-primary text-primary-foreground font-body font-bold uppercase tracking-wider rounded-md hover:bg-primary/80 transition-colors"
        >
          Ingresar
        </button>

        {error && (
          <p className="text-center text-destructive font-body text-sm">
            Usuario o contraseña incorrectos
          </p>
        )}
      </form>
    </div>
  );
};

export default AdminLogin;
