import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, ClipboardList, Eye } from "lucide-react";
import { apiClient } from "@/core/lib/apiClient";
import { ContratoFormModal } from "@/modules/contratos/components/ContratoFormModal";

export interface Contrato {
  id: number;
  docente: number;
  docente_nombre: string;
  asignatura: number;
  asignatura_nombre: string;
  modalidad: "TEORIA" | "LABORATORIO";
  monto: string;
  gestion: number;
  estado: string;
  nro_contrato: string;
}

const ESTADO_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  ACTIVO:     { bg: "rgba(22,163,74,0.08)",   color: "var(--success)",  border: "rgba(22,163,74,0.2)" },
  PENDIENTE:  { bg: "rgba(217,119,6,0.08)",   color: "var(--warning)",  border: "rgba(217,119,6,0.2)" },
  FINALIZADO: { bg: "var(--bg-elevated)",     color: "var(--text-muted)", border: "var(--border)" },
  ANULADO:    { bg: "rgba(192,57,43,0.06)",   color: "var(--danger)",   border: "rgba(192,57,43,0.2)" },
};

export function ContratosPage() {
  const [contratos, setContratos]   = useState<Contrato[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [filtroEstado, setFiltro]   = useState("");
  const [filtroModalidad, setFiltroM] = useState("");
  const [formOpen, setFormOpen]     = useState(false);
  const [selected, setSelected]     = useState<Contrato | null>(null);

  const fetchContratos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search)         params.append("q", search);
      if (filtroEstado)   params.append("estado", filtroEstado);
      if (filtroModalidad) params.append("modalidad", filtroModalidad);
      const { data } = await apiClient.get(`/contratos/?${params}`);
      setContratos(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchContratos(); }, [search, filtroEstado, filtroModalidad]);

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este contrato?")) return;
    await apiClient.delete(`/contratos/${id}/`);
    fetchContratos();
  };

  return (
    <div className="flex flex-col gap-5" style={{ animation: "fadeUp 0.4s ease both" }}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>Gestión</p>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Contratos</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>Registro de contrataciones docentes por gestión</p>
        </div>
        <button onClick={() => { setSelected(null); setFormOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl shrink-0"
          style={{ background: "var(--accent)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-light)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent)"; }}
        ><Plus size={15} /> Nuevo Contrato</button>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input type="text" placeholder="Buscar docente, asignatura o Nº contrato..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-sm rounded-xl outline-none"
            style={{ background: "var(--bg-surface)", border: "1.5px solid var(--border)", color: "var(--text)" }}
            onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
            onBlur={(e)  => { e.target.style.borderColor = "var(--border)";  e.target.style.boxShadow = "none"; }}
          />
        </div>
        {[
          { value: filtroEstado,    onChange: setFiltro,  options: ["", "ACTIVO", "PENDIENTE", "FINALIZADO", "ANULADO"], placeholder: "Estado" },
          { value: filtroModalidad, onChange: setFiltroM, options: ["", "TEORIA", "LABORATORIO"],                         placeholder: "Modalidad" },
        ].map(({ value, onChange, options, placeholder }) => (
          <select key={placeholder} value={value} onChange={(e) => onChange(e.target.value)}
            className="px-3 py-3 text-sm rounded-xl outline-none"
            style={{ background: "var(--bg-surface)", border: "1.5px solid var(--border)", color: value ? "var(--text)" : "var(--text-muted)" }}
          >
            {options.map((o) => <option key={o} value={o}>{o || placeholder}</option>)}
          </select>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
        <div className="grid text-xs font-semibold uppercase tracking-wider px-6 py-3"
          style={{ gridTemplateColumns: "2fr 2fr 110px 100px 90px 100px 90px", color: "var(--text-muted)", borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}>
          <span>Docente</span><span>Asignatura</span><span>Modalidad</span><span>Monto</span><span>Gestión</span><span>Estado</span><span className="text-right">Acciones</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
          </div>
        ) : contratos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <ClipboardList size={32} style={{ color: "var(--text-muted)", opacity: 0.3 }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Sin contratos registrados</p>
          </div>
        ) : contratos.map((c) => {
          const estilo = ESTADO_STYLE[c.estado] ?? ESTADO_STYLE.PENDIENTE;
          return (
            <div key={c.id} className="grid items-center px-6 py-4 group"
              style={{ gridTemplateColumns: "2fr 2fr 110px 100px 90px 100px 90px", borderBottom: "1px solid var(--border)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <p className="text-sm font-semibold truncate pr-2" style={{ color: "var(--text)" }}>{c.docente_nombre}</p>
              <p className="text-sm truncate pr-2" style={{ color: "var(--text-muted)" }}>{c.asignatura_nombre}</p>
              <span className="text-xs font-medium px-2 py-1 rounded-full"
                style={c.modalidad === "LABORATORIO"
                  ? { background: "rgba(124,58,237,0.08)", color: "#7c3aed", border: "1px solid rgba(124,58,237,0.2)" }
                  : { background: "var(--accent-glow)", color: "var(--accent)", border: "1px solid var(--accent-dim)" }
                }
              >{c.modalidad === "LABORATORIO" ? "Lab" : "Teoría"}</span>
              <p className="text-sm font-mono" style={{ color: "var(--text)" }}>Bs. {parseFloat(c.monto).toLocaleString()}</p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>{c.gestion}</p>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: estilo.bg, color: estilo.color, border: `1px solid ${estilo.border}` }}
              >{c.estado}</span>
              <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setSelected(c); setFormOpen(true); }}
                  className="p-1.5 rounded-lg" style={{ color: "var(--text-muted)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.background = "var(--accent-glow)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
                ><Pencil size={14} /></button>
                <button onClick={() => handleDelete(c.id)}
                  className="p-1.5 rounded-lg" style={{ color: "var(--text-muted)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.background = "rgba(192,57,43,0.06)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
                ><Trash2 size={14} /></button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{contratos.length} contrato{contratos.length !== 1 ? "s" : ""}</p>

      {formOpen && (
        <ContratoFormModal contrato={selected} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); fetchContratos(); }} />
      )}
    </div>
  );
}