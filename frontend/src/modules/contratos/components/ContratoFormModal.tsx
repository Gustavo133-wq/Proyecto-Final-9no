import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Save } from "lucide-react";
import { apiClient } from "@/core/lib/apiClient";
import type { Contrato } from "@/modules/contratos/pages/ContratosPage";

interface Props { contrato: Contrato | null; onClose: () => void; onSaved: () => void; }

export function ContratoFormModal({ contrato, onClose, onSaved }: Props) {
  const isEdit = !!contrato;
  const [docentes, setDocentes]       = useState<{ id: number; nombre_completo: string }[]>([]);
  const [asignaturas, setAsignaturas] = useState<{ id: number; nombre: string }[]>([]);
  const [form, setForm] = useState({
    docente:       contrato?.docente?.toString()    ?? "",
    asignatura:    contrato?.asignatura?.toString() ?? "",
    modalidad:     contrato?.modalidad  ?? "TEORIA",
    monto:         contrato?.monto      ?? "",
    gestion:       contrato?.gestion?.toString() ?? new Date().getFullYear().toString(),
    estado:        contrato?.estado     ?? "PENDIENTE",
    nro_contrato:  contrato?.nro_contrato ?? "",
    observaciones: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    apiClient.get("/docentes/").then(({ data }) => setDocentes(data));
    apiClient.get("/asignaturas/").then(({ data }) => setAsignaturas(data));
  }, []);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const payload = { ...form, docente: parseInt(form.docente), asignatura: parseInt(form.asignatura), gestion: parseInt(form.gestion) };
      isEdit
        ? await apiClient.patch(`/contratos/${contrato.id}/`, payload)
        : await apiClient.post("/contratos/", payload);
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
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>{isEdit ? "Editar" : "Nuevo"} Contrato</p>
            <h2 className="text-base font-bold mt-0.5" style={{ color: "var(--text)" }}>
              {isEdit ? `Contrato Nº${contrato.nro_contrato}` : "Registrar contrato"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: "var(--text-muted)" }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4 overflow-y-auto">
          {/* Docente */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Docente</label>
            <select value={form.docente} onChange={(e) => set("docente", e.target.value)} required
              className="px-3 py-2.5 text-sm rounded-xl outline-none"
              style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: form.docente ? "var(--text)" : "var(--text-muted)" }}
              onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; }}
              onBlur={(e)  => { e.target.style.borderColor = "var(--border)"; }}
            >
              <option value="">Seleccionar docente...</option>
              {docentes.map((d) => <option key={d.id} value={d.id}>{d.nombre_completo}</option>)}
            </select>
          </div>

          {/* Asignatura */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Asignatura</label>
            <select value={form.asignatura} onChange={(e) => set("asignatura", e.target.value)} required
              className="px-3 py-2.5 text-sm rounded-xl outline-none"
              style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: form.asignatura ? "var(--text)" : "var(--text-muted)" }}
              onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; }}
              onBlur={(e)  => { e.target.style.borderColor = "var(--border)"; }}
            >
              <option value="">Seleccionar asignatura...</option>
              {asignaturas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Modalidad */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Modalidad</label>
              <select value={form.modalidad} onChange={(e) => set("modalidad", e.target.value)}
                className="px-3 py-2.5 text-sm rounded-xl outline-none"
                style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
                onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; }}
                onBlur={(e)  => { e.target.style.borderColor = "var(--border)"; }}
              >
                <option value="TEORIA">Teoría</option>
                <option value="LABORATORIO">Laboratorio</option>
              </select>
            </div>
            {/* Estado */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Estado</label>
              <select value={form.estado} onChange={(e) => set("estado", e.target.value)}
                className="px-3 py-2.5 text-sm rounded-xl outline-none"
                style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
                onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; }}
                onBlur={(e)  => { e.target.style.borderColor = "var(--border)"; }}
              >
                {["PENDIENTE", "ACTIVO", "FINALIZADO", "ANULADO"].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Monto (Bs.)"  value={form.monto}        onChange={(v) => set("monto", v)}        type="number" required />
            <Field label="Gestión"      value={form.gestion}      onChange={(v) => set("gestion", v)}      type="number" required />
          </div>
          <Field label="Nº Contrato"    value={form.nro_contrato} onChange={(v) => set("nro_contrato", v)} />

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

function Field({ label, value, onChange, type = "text", required = false }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required}
        className="px-3 py-2.5 text-sm rounded-xl outline-none"
        style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
        onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
        onBlur={(e)  => { e.target.style.borderColor = "var(--border)";  e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}