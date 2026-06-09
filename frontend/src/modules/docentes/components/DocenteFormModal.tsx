import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Save } from "lucide-react";
import { apiClient } from "@/core/lib/apiClient";
import type { Docente } from "@/modules/docentes/pages/DocentesPage";

const GRADOS = ["ING.", "LIC.", "MSC.", "MGS.", "PHD.", "DR.", "CNL. DAEN", "OTRO"];

interface Props { docente: Docente | null; onClose: () => void; onSaved: () => void; }

export function DocenteFormModal({ docente, onClose, onSaved }: Props) {
  const isEdit = !!docente;
  const [form, setForm] = useState({
    grado:       docente?.grado       ?? "ING.",
    nombres:     docente?.nombres     ?? "",
    apellidos:   docente?.apellidos   ?? "",
    ci:          docente?.ci          ?? "",
    correo:      docente?.correo      ?? "",
    telefono:    docente?.telefono    ?? "",
    especialidad: docente?.especialidad ?? "",
    descripcion: docente?.descripcion ?? "",
    activo:      docente?.activo      ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      isEdit
        ? await apiClient.patch(`/docentes/${docente.id}/`, form)
        : await apiClient.post("/docentes/", form);
      onSaved();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: Record<string, string[]> } })?.response?.data;
      setError(msg ? Object.values(msg).flat().join(" ") : "Error al guardar.");
    } finally { setLoading(false); }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-2xl shadow-2xl max-h-[90vh] flex flex-col"
        style={{ animation: "fadeUp 0.3s ease both", background: "var(--bg-surface)", border: "1px solid var(--border)" }}>

        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
              {isEdit ? "Editar" : "Nuevo"} Docente
            </p>
            <h2 className="text-base font-bold mt-0.5" style={{ color: "var(--text)" }}>
              {isEdit ? docente.nombre_completo : "Registrar docente"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: "var(--text-muted)" }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4 overflow-y-auto">
          {/* Grado */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Grado Académico</label>
            <select value={form.grado} onChange={(e) => set("grado", e.target.value)}
              className="px-3 py-2.5 text-sm rounded-xl outline-none"
              style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
              onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; }}
              onBlur={(e)  => { e.target.style.borderColor = "var(--border)"; }}
            >
              {GRADOS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Apellidos" value={form.apellidos} onChange={(v) => set("apellidos", v)} required />
            <Field label="Nombres"   value={form.nombres}   onChange={(v) => set("nombres", v)}   required />
          </div>
          <Field label="Cédula de Identidad" value={form.ci} onChange={(v) => set("ci", v)} required />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Correo"   value={form.correo}   onChange={(v) => set("correo", v)}   type="email" />
            <Field label="Teléfono" value={form.telefono} onChange={(v) => set("telefono", v)} />
          </div>
          <Field label="Especialidad" value={form.especialidad} onChange={(v) => set("especialidad", v)}
            placeholder="Ej: Redes, Bases de Datos, IA..." />

          {/* Descripción — textarea */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Descripción / Perfil profesional
            </label>
            <textarea value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)}
              rows={3} placeholder="Competencias y experiencia del docente..."
              className="px-3 py-2.5 text-sm rounded-xl outline-none resize-none"
              style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
              onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
              onBlur={(e)  => { e.target.style.borderColor = "var(--border)";  e.target.style.boxShadow = "none"; }}
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div onClick={() => set("activo", !form.activo)}
              className="w-10 h-5 rounded-full transition-colors relative shrink-0"
              style={{ background: form.activo ? "var(--accent)" : "var(--border)" }}>
              <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                style={{ left: form.activo ? "21px" : "2px" }} />
            </div>
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>Docente activo</span>
          </label>

          {error && (
            <p className="text-sm px-3 py-2 rounded-xl"
              style={{ color: "var(--danger)", background: "rgba(192,57,43,0.06)", border: "1px solid rgba(192,57,43,0.2)" }}>
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium rounded-xl"
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