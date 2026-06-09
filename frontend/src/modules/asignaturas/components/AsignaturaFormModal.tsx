import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Save } from "lucide-react";
import { apiClient } from "@/core/lib/apiClient";
import type { Asignatura } from "@/modules/asignaturas/pages/AsignaturasPage";

interface Props { asignatura: Asignatura | null; onClose: () => void; onSaved: () => void; }

export function AsignaturaFormModal({ asignatura, onClose, onSaved }: Props) {
  const isEdit = !!asignatura;
  const [form, setForm] = useState({
    nombre:            asignatura?.nombre            ?? "",
    codigo:            asignatura?.codigo            ?? "",
    semestre:          asignatura?.semestre?.toString() ?? "",
    horas_teoria:      asignatura?.horas_teoria?.toString()      ?? "0",
    horas_laboratorio: asignatura?.horas_laboratorio?.toString() ?? "0",
    descripcion:       asignatura?.descripcion ?? "",
    activa:            asignatura?.activa ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const payload = {
        ...form,
        semestre:          form.semestre ? parseInt(form.semestre) : null,
        horas_teoria:      parseInt(form.horas_teoria),
        horas_laboratorio: parseInt(form.horas_laboratorio),
      };
      isEdit
        ? await apiClient.patch(`/asignaturas/${asignatura.id}/`, payload)
        : await apiClient.post("/asignaturas/", payload);
      onSaved();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: Record<string, string[]> } })?.response?.data;
      setError(msg ? Object.values(msg).flat().join(" ") : "Error al guardar.");
    } finally { setLoading(false); }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-2xl shadow-2xl"
        style={{ animation: "fadeUp 0.3s ease both", background: "var(--bg-surface)", border: "1px solid var(--border)" }}>

        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
              {isEdit ? "Editar" : "Nueva"} Asignatura
            </p>
            <h2 className="text-base font-bold mt-0.5" style={{ color: "var(--text)" }}>
              {isEdit ? asignatura.nombre : "Registrar asignatura"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: "var(--text-muted)" }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <Field label="Nombre" value={form.nombre} onChange={(v) => set("nombre", v)} required />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Código"   value={form.codigo}   onChange={(v) => set("codigo", v)} />
            <Field label="Semestre" value={form.semestre} onChange={(v) => set("semestre", v)} type="number" placeholder="1-10" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Horas Teoría" value={form.horas_teoria} onChange={(v) => set("horas_teoria", v)} type="number" />
            <Field label="Horas Lab"    value={form.horas_laboratorio} onChange={(v) => set("horas_laboratorio", v)} type="number" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Descripción</label>
            <textarea value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)}
              rows={3} placeholder="Objetivos y contenido mínimo..."
              className="px-3 py-2.5 text-sm rounded-xl outline-none resize-none"
              style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
              onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; }}
              onBlur={(e)  => { e.target.style.borderColor = "var(--border)"; }}
            />
          </div>

          {error && <p className="text-sm px-3 py-2 rounded-xl" style={{ color: "var(--danger)", background: "rgba(192,57,43,0.06)", border: "1px solid rgba(192,57,43,0.2)" }}>{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-medium rounded-xl"
              style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-elevated)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >Cancelar</button>
            <button type="submit" disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-60"
              style={{ background: "var(--accent)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-light)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent)"; }}
            >
              {loading ? <span className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={14} />{isEdit ? "Guardar" : "Registrar"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

function Field({ label, value, onChange, type = "text", required = false, placeholder = "" }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        required={required} placeholder={placeholder}
        className="px-3 py-2.5 text-sm rounded-xl outline-none"
        style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
        onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
        onBlur={(e)  => { e.target.style.borderColor = "var(--border)";  e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}