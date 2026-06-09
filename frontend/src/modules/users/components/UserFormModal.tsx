import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Save } from "lucide-react";
import { apiClient } from "@/core/lib/apiClient";
import type { AppUser } from "@/modules/users/pages/UsersPage";

interface Props {
  user: AppUser | null;
  onClose: () => void;
  onSaved: () => void;
}

export function UserFormModal({ user, onClose, onSaved }: Props) {
  const isEdit = !!user;
  const [form, setForm] = useState({
    username:   user?.username   ?? "",
    email:      user?.email      ?? "",
    first_name: user?.first_name ?? "",
    last_name:  user?.last_name  ?? "",
    phone:      user?.phone      ?? "",
    is_admin:   user?.is_admin   ?? false,
    password:   "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const payload: Record<string, unknown> = { ...form };
      if (isEdit && !payload.password) delete payload.password;
      isEdit
        ? await apiClient.patch(`/users/${user.id}/`, payload)
        : await apiClient.post("/users/", payload);
      onSaved();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: Record<string, string[]> } })?.response?.data;
      setError(msg ? Object.values(msg).flat().join(" ") : "Error al guardar.");
    } finally { setLoading(false); }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
        style={{ animation: "fadeUp 0.3s ease both", background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
              {isEdit ? "Editar" : "Nuevo"} Usuario
            </p>
            <h2 className="text-base font-bold mt-0.5" style={{ color: "var(--text)" }}>
              {isEdit ? `${user.first_name} ${user.last_name}` : "Crear cuenta de acceso"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--text-muted)" }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre"   value={form.first_name} onChange={(v) => set("first_name", v)} required />
            <Field label="Apellido" value={form.last_name}  onChange={(v) => set("last_name", v)}  required />
          </div>
          <Field label="Usuario" value={form.username} onChange={(v) => set("username", v)} required disabled={isEdit} />
          <Field label="Correo"  value={form.email}    onChange={(v) => set("email", v)} type="email" required />
          <Field label="Teléfono" value={form.phone}   onChange={(v) => set("phone", v)} />
          <Field
            label={isEdit ? "Nueva contraseña (vacío = sin cambio)" : "Contraseña"}
            type="password" value={form.password} onChange={(v) => set("password", v)} required={!isEdit}
          />

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => set("is_admin", !form.is_admin)}
              className="w-10 h-5 rounded-full transition-colors relative shrink-0"
              style={{ background: form.is_admin ? "var(--accent)" : "var(--border)" }}
            >
              <span
                className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                style={{ left: form.is_admin ? "21px" : "2px" }}
              />
            </div>
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>Administrador del sistema</span>
          </label>

          {error && (
            <p
              className="text-sm px-3 py-2 rounded-xl"
              style={{ color: "var(--danger)", background: "rgba(192,57,43,0.06)", border: "1px solid rgba(192,57,43,0.2)" }}
            >
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors"
              style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-elevated)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-60"
              style={{ background: "var(--accent)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-light)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent)"; }}
            >
              {loading
                ? <span className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
                : <><Save size={14} />{isEdit ? "Guardar" : "Crear usuario"}</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

function Field({ label, value, onChange, type = "text", required = false, disabled = false }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{label}</label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        required={required} disabled={disabled}
        className="px-3 py-2.5 text-sm rounded-xl outline-none transition-all disabled:opacity-40"
        style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
        onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
        onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}