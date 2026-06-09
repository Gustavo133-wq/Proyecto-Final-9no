import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, BookOpen } from "lucide-react";
import { apiClient } from "@/core/lib/apiClient";
import { AsignaturaFormModal } from "@/modules/asignaturas/components/AsignaturaFormModal";

export interface Asignatura {
  id: number;
  nombre: string;
  codigo: string;
  semestre: number | null;
  horas_teoria: number;
  horas_laboratorio: number;
  descripcion: string;
  activa: boolean;
}

export function AsignaturasPage() {
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [formOpen, setFormOpen]       = useState(false);
  const [selected, setSelected]       = useState<Asignatura | null>(null);

  const fetchAsignaturas = async () => {
    setLoading(true);
    try { const { data } = await apiClient.get("/asignaturas/"); setAsignaturas(data); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAsignaturas(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta asignatura?")) return;
    await apiClient.delete(`/asignaturas/${id}/`);
    fetchAsignaturas();
  };

  const filtered = asignaturas.filter((a) =>
    `${a.nombre} ${a.codigo}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5" style={{ animation: "fadeUp 0.4s ease both" }}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>Gestión</p>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Asignaturas</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>Catálogo de materias — Carrera de Ingeniería de Sistemas</p>
        </div>
        <button onClick={() => { setSelected(null); setFormOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl shrink-0"
          style={{ background: "var(--accent)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-light)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent)"; }}
        ><Plus size={15} /> Nueva Asignatura</button>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
        <input type="text" placeholder="Buscar por nombre o código..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 text-sm rounded-xl outline-none"
          style={{ background: "var(--bg-surface)", border: "1.5px solid var(--border)", color: "var(--text)" }}
          onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
          onBlur={(e)  => { e.target.style.borderColor = "var(--border)";  e.target.style.boxShadow = "none"; }}
        />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
        <div className="grid text-xs font-semibold uppercase tracking-wider px-6 py-3"
          style={{ gridTemplateColumns: "2fr 100px 60px 60px 60px 1.5fr 90px", color: "var(--text-muted)", borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}>
          <span>Asignatura</span><span>Código</span><span>Sem.</span><span>T.H.</span><span>L.H.</span><span>Descripción</span><span className="text-right">Acciones</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <BookOpen size={32} style={{ color: "var(--text-muted)", opacity: 0.3 }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Sin asignaturas registradas</p>
          </div>
        ) : filtered.map((a) => (
          <div key={a.id} className="grid items-center px-6 py-4 group"
            style={{ gridTemplateColumns: "2fr 100px 60px 60px 60px 1.5fr 90px", borderBottom: "1px solid var(--border)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{a.nombre}</p>
                {!a.activa && <span className="text-xs" style={{ color: "var(--text-muted)" }}>Inactiva</span>}
            </div>
            <p className="text-sm font-mono" style={{ color: "var(--text-muted)" }}>{a.codigo || "—"}</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{a.semestre ?? "—"}</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{a.horas_teoria} hrs.</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{a.horas_laboratorio} hrs.</p>
            <p className="text-sm truncate pr-2" style={{ color: "var(--text-muted)" }}>{a.descripcion || "—"}</p>
            <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => { setSelected(a); setFormOpen(true); }}
                className="p-1.5 rounded-lg" style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.background = "var(--accent-glow)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
              ><Pencil size={14} /></button>
              <button onClick={() => handleDelete(a.id)}
                className="p-1.5 rounded-lg" style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.background = "rgba(192,57,43,0.06)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
              ><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{filtered.length} asignatura{filtered.length !== 1 ? "s" : ""}</p>

      {formOpen && (
        <AsignaturaFormModal asignatura={selected} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); fetchAsignaturas(); }} />
      )}
    </div>
  );
}