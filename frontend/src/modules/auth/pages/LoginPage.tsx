import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, GraduationCap } from "lucide-react";
import { apiClient } from "@/core/lib/apiClient";
import { useAuthStore } from "@/core/store/authStore";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await apiClient.post("/auth/login/", { username, password });
      setAuth(data.access, data.refresh, data.user);
      navigate("/");
    } catch {
      setError("Usuario o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg)" }}
    >
      <div className="w-full max-w-[420px]" style={{ animation: "fadeUp 0.4s ease both" }}>

        {/* Logo */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: "var(--accent)" }}
          >
            <GraduationCap size={28} color="#fff" />
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
              Escuela Militar de Ingeniería
            </p>
            <h1 className="text-xl font-bold mt-0.5" style={{ color: "var(--text)" }}>
              Contratación Docente
            </h1>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 shadow-sm"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
        >
          <h2 className="text-base font-semibold mb-1" style={{ color: "var(--text)" }}>
            Iniciar Sesión
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            Accede con tus credenciales institucionales
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="nombre de usuario"
                required
                className="w-full px-4 py-3 text-sm rounded-xl outline-none transition-all"
                style={{
                  background: "var(--bg)",
                  border: "1.5px solid var(--border)",
                  color: "var(--text)",
                }}
                onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 text-sm rounded-xl outline-none transition-all pr-11"
                  style={{
                    background: "var(--bg)",
                    border: "1.5px solid var(--border)",
                    color: "var(--text)",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                style={{
                  background: "rgba(192,57,43,0.06)",
                  border: "1px solid rgba(192,57,43,0.2)",
                  color: "var(--danger)",
                }}
              >
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-semibold rounded-xl text-white transition-all mt-1 disabled:opacity-60"
              style={{ background: "var(--accent)", boxShadow: "0 4px 14px var(--accent-glow)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-light)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent)"; }}
            >
              {loading
                ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : "Ingresar al Sistema"
              }
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-5" style={{ color: "var(--text-muted)", opacity: 0.6 }}>
          EMI Cochabamba · Sistema de uso institucional
        </p>
      </div>
    </div>
  );
}