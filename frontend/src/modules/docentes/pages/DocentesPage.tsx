import { useEffect, useState } from "react";
import { UserPlus, Search, Pencil, Trash2, GraduationCap } from "lucide-react";
import { apiClient } from "@/core/lib/apiClient";
import { DocenteFormModal } from "@/modules/docentes/components/DocenteFormModal";

export interface Docente {
  id: number;
  grado: string;
  nombre_completo: string;
  nombres: string;
  apellidos: string;
  ci: string;
  correo: string;
  telefono: string;
  especialidad: string;
  descripcion: string;
  activo: boolean;
}

const COL = "2fr 120px 1fr 1fr 1.5fr 80px 90px";

export function DocentesPage() {
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Docente | null>(null);

  const fetchDocentes = async () => {
    setLoading(true);
    try { const { data } = await apiClient.get("/docentes/"); setDocentes(data); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDocentes(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este docente?")) return;
    await apiClient.delete(`/docentes/${id}/`);
    fetchDocentes();
  };

  const filtered = docentes.filter((d) =>
    `${d.nombre_completo} ${d.ci} ${d.especialidad} ${d.correo}`
      .toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5" style={{ animation: "fadeUp 0.4s ease both" }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>
            Gestión
          </p>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Docentes</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            Registro de docentes contratados — EMI Cochabamba
          </p>
        </div>
        <button
          onClick={() => { setSelected(null); setFormOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl shrink-0"
          style={{ background: "var(--accent)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-light)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent)"; }}
        >
          <UserPlus size={15} /> Nuevo Docente
        </button>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
        <input
          type="text" placeholder="Buscar por nombre, CI, correo o especialidad..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 text-sm rounded-xl outline-none"
          style={{ background: "var(--bg-surface)", border: "1.5px solid var(--border)", color: "var(--text)" }}
          onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
          onBlur={(e)  => { e.target.style.borderColor = "var(--border)";  e.target.style.boxShadow = "none"; }}
        />
      </div>

      {/* Tabla */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
        {/* Cabecera */}
        <div
          className="grid text-xs font-semibold uppercase tracking-wider px-6 py-3"
          style={{ gridTemplateColumns: COL, color: "var(--text-muted)", borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}
        >
          <span>Docente</span>
          <span>CI</span>
          <span>Correo</span>
          <span>Teléfono</span>
          <span>Especialidad / Perfil</span>
          <span>Estado</span>
          <span className="text-right">Acciones</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="w-6 h-6 rounded-full border-2 animate-spin"
              style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <GraduationCap size={32} style={{ color: "var(--text-muted)", opacity: 0.3 }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Sin docentes registrados</p>
          </div>
        ) : filtered.map((d) => (
          <div
            key={d.id}
            className="grid items-center px-6 py-4 group"
            style={{ gridTemplateColumns: COL, borderBottom: "1px solid var(--border)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            {/* Nombre */}
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                {d.grado} {d.nombre_completo}
              </p>
            </div>

            {/* CI */}
            <p className="text-sm font-mono" style={{ color: "var(--text-muted)" }}>{d.ci}</p>

            {/* Correo */}
            <p className="text-sm truncate pr-2" style={{ color: "var(--text-muted)" }}>
              {d.correo || "—"}
            </p>

            {/* Teléfono */}
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {d.telefono || "—"}
            </p>

            {/* Especialidad + descripción truncada */}
            <div>
              <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>
                {d.especialidad || "—"}
              </p>
              {d.descripcion && (
                <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                  {d.descripcion}
                </p>
              )}
            </div>

            {/* Estado */}
            <div>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={d.activo
                  ? { background: "rgba(22,163,74,0.08)", color: "var(--success)", border: "1px solid rgba(22,163,74,0.2)" }
                  : { background: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }
                }
              >
                {d.activo ? "Activo" : "Inactivo"}
              </span>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => { setSelected(d); setFormOpen(true); }}
                className="p-1.5 rounded-lg" style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.background = "var(--accent-glow)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
              ><Pencil size={14} /></button>
              <button
                onClick={() => handleDelete(d.id)}
                className="p-1.5 rounded-lg" style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.background = "rgba(192,57,43,0.06)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
              ><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        {filtered.length} docente{filtered.length !== 1 ? "s" : ""}
      </p>

      {formOpen && (
        <DocenteFormModal
          docente={selected}
          onClose={() => setFormOpen(false)}
          onSaved={() => { setFormOpen(false); fetchDocentes(); }}
        />
      )}
    </div>
  );
}