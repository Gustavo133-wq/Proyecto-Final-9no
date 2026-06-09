import { useEffect, useState } from "react";
import { GraduationCap, ClipboardList, BookOpen, Users, Activity, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/core/lib/apiClient";
import { useAuthStore } from "@/core/store/authStore";

export function DashboardPage() {
  const { user } = useAuthStore();
  const [totalUsuarios, setTotalUsuarios] = useState<number | null>(null);

  useEffect(() => {
    if (user?.is_admin) {
      apiClient.get("/users/").then(({ data }) => setTotalUsuarios(data.length)).catch(() => setTotalUsuarios(0));
    }
  }, [user]);

  const cards = [
    { label: "Docentes Registrados",  value: "—", icon: GraduationCap, color: "var(--accent)",   bg: "var(--accent-glow)",   soon: true },
    { label: "Contratos Activos",      value: "—", icon: ClipboardList,  color: "#16a34a",          bg: "rgba(22,163,74,0.08)", soon: true },
    { label: "Asignaturas",            value: "—", icon: BookOpen,        color: "var(--warning)",   bg: "rgba(217,119,6,0.08)", soon: true },
    { label: "Usuarios del Sistema",   value: totalUsuarios ?? "—", icon: Users, color: "#7c3aed", bg: "rgba(124,58,237,0.08)", soon: false },
  ];

  const systemStatus = [
    { label: "Backend API",      ok: true },
    { label: "Base de Datos",    ok: true },
    { label: "Motor Workflow",   ok: false },
    { label: "Módulo Reportes",  ok: false },
  ];

  return (
    <div className="flex flex-col gap-6" style={{ animation: "fadeUp 0.4s ease both" }}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>
          Panel de Control
        </p>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
          Bienvenido, {user?.first_name}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Sistema de Gestión de Contratación Docente — EMI Cochabamba
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color, bg, soon }, i) => (
          <div
            key={label}
            className="rounded-2xl p-5 transition-all hover:shadow-md"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              animation: `fadeUp 0.4s ease ${i * 0.07}s both`,
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon size={18} style={{ color }} />
              </div>
              {soon && (
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}
                >
                  Próximo
                </span>
              )}
            </div>
            <p
              className="text-3xl font-bold leading-none mb-1"
              style={{ color: soon ? "var(--text-muted)" : "var(--text)" }}
            >
              {value}
            </p>
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div
          className="xl:col-span-2 rounded-2xl p-5"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Activity size={15} style={{ color: "var(--accent)" }} />
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Actividad Reciente
            </p>
          </div>
          <div className="flex flex-col items-center justify-center h-28">
            <p className="text-sm" style={{ color: "var(--text-muted)", opacity: 0.5 }}>
              Sin actividad registrada aún
            </p>
          </div>
        </div>

        <div
          className="rounded-2xl p-5"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2 mb-5">
            <CheckCircle2 size={15} style={{ color: "var(--accent)" }} />
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Estado del Sistema
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {systemStatus.map(({ label, ok }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>{label}</span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: ok ? "var(--success)" : "#d1d5db",
                      boxShadow: ok ? "0 0 6px var(--success)" : "none",
                    }}
                  />
                  <span className="text-xs font-medium" style={{ color: ok ? "var(--success)" : "var(--text-muted)" }}>
                    {ok ? "Operativo" : "Pendiente"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}