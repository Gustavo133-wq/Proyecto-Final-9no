import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Save } from "lucide-react";
import { apiClient } from "@/core/lib/apiClient";
import type { AppUser } from "@/modules/users/pages/UsersPage";

const MODULES = [
  { key: "docentes",    label: "Docentes" },
  { key: "contratos",   label: "Contratos" },
  { key: "asignaturas", label: "Asignaturas" },
  { key: "reportes",    label: "Reportes" },
  { key: "usuarios",    label: "Usuarios" },
];

const ACTIONS: Record<string, { key: string; label: string }[]> = {
  docentes:    [{ key: "view", label: "Ver" }, { key: "create", label: "Crear" }, { key: "edit", label: "Editar" }, { key: "delete", label: "Eliminar" }],
  contratos:   [{ key: "view", label: "Ver" }, { key: "create", label: "Crear" }, { key: "edit", label: "Editar" }, { key: "delete", label: "Eliminar" }, { key: "download", label: "Descargar" }],
  asignaturas: [{ key: "view", label: "Ver" }, { key: "create", label: "Crear" }, { key: "edit", label: "Editar" }, { key: "delete", label: "Eliminar" }],
  reportes:    [{ key: "view", label: "Ver" }, { key: "download", label: "Descargar" }],
  usuarios:    [{ key: "view", label: "Ver" }, { key: "create", label: "Crear" }, { key: "edit", label: "Editar" }, { key: "delete", label: "Eliminar" }],
};

type PermMap = Record<string, Record<string, "own" | "all">>;

export function UserPermissionsModal({ user, onClose }: { user: AppUser; onClose: () => void }) {
  const [perms, setPerms]   = useState<PermMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    apiClient.get(`/users/${user.id}/permissions/`).then(({ data }) => {
      const map: PermMap = {};
      for (const p of data) {
        if (!map[p.module]) map[p.module] = {};
        map[p.module][p.action] = p.scope;
      }
      setPerms(map);
    }).finally(() => setLoading(false));
  }, [user.id]);

  const toggle = (mod: string, act: string) => {
    setPerms((prev) => {
      const next = structuredClone(prev);
      if (next[mod]?.[act]) {
        delete next[mod][act];
        if (Object.keys(next[mod]).length === 0) delete next[mod];
      } else {
        if (!next[mod]) next[mod] = {};
        next[mod][act] = "own";
      }
      return next;
    });
  };

  const setScope = (mod: string, act: string, scope: "own" | "all") => {
    setPerms((prev) => ({ ...prev, [mod]: { ...prev[mod], [act]: scope } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const permissions = Object.entries(perms).flatMap(([module, actions]) =>
        Object.entries(actions).map(([action, scope]) => ({ module, action, scope }))
      );
      await apiClient.put(`/users/${user.id}/permissions/`, { permissions });
      onClose();
    } finally { setSaving(false); }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className="w-full max-w-xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
        style={{ animation: "fadeUp 0.3s ease both", background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>Permisos de Acceso</p>
            <h2 className="text-base font-bold mt-0.5" style={{ color: "var(--text)" }}>{user.first_name} {user.last_name}</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>@{user.username}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: "var(--text-muted)" }}>
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex justify-center py-10">
              <span className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {MODULES.map(({ key: mod, label: modLabel }) => (
                <div key={mod} className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                  <div className="px-4 py-2.5" style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{modLabel}</p>
                  </div>
                  <div>
                    {ACTIONS[mod].map(({ key: act, label: actLabel }) => {
                      const active = !!perms[mod]?.[act];
                      const scope  = perms[mod]?.[act] ?? "own";
                      return (
                        <div
                          key={act}
                          className="flex items-center justify-between px-4 py-2.5"
                          style={{ borderBottom: "1px solid var(--border)" }}
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggle(mod, act)}
                              className="w-4 h-4 rounded transition-all flex items-center justify-center"
                              style={{
                                background: active ? "var(--accent)" : "transparent",
                                border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`,
                              }}
                            >
                              {active && <span className="w-2 h-0.5 bg-white" style={{ height: "1.5px", width: "8px" }} />}
                            </button>
                            <span className="text-sm" style={{ color: "var(--text)" }}>{actLabel}</span>
                          </div>
                          {active && (
                            <div className="flex gap-1">
                              {(["own", "all"] as const).map((s) => (
                                <button
                                  key={s}
                                  onClick={() => setScope(mod, act, s)}
                                  className="text-xs font-medium px-2.5 py-1 rounded-full transition-all"
                                  style={scope === s
                                    ? { background: "var(--accent-glow)", color: "var(--accent)", border: "1px solid var(--accent-dim)" }
                                    : { color: "var(--text-muted)", border: "1px solid var(--border)" }
                                  }
                                >
                                  {s === "own" ? "Propios" : "Todos"}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 px-6 py-4 shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors"
            style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-elevated)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-60"
            style={{ background: "var(--accent)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-light)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent)"; }}
          >
            {saving
              ? <span className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
              : <><Save size={14} />Guardar Permisos</>
            }
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}