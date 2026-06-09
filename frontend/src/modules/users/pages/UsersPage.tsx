import { useEffect, useState } from "react";
import { UserPlus, Search, Shield, ShieldOff, Pencil, Trash2, Key } from "lucide-react";
import { apiClient } from "@/core/lib/apiClient";
import { UserFormModal } from "@/modules/users/components/UserFormModal";
import { UserPermissionsModal } from "@/modules/users/components/UserPermissionsModal";

export interface AppUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_admin: boolean;
  is_active: boolean;
  permissions: Record<string, Record<string, string>> | null;
}

export function UsersPage() {
  const [users, setUsers]       = useState<AppUser[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [permsOpen, setPermsOpen] = useState(false);
  const [selected, setSelected] = useState<AppUser | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try { const { data } = await apiClient.get("/users/"); setUsers(data); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este usuario?")) return;
    await apiClient.delete(`/users/${id}/`);
    fetchUsers();
  };

  const filtered = users.filter((u) =>
    `${u.first_name} ${u.last_name} ${u.username} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5" style={{ animation: "fadeUp 0.4s ease both" }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>
            Administración
          </p>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Usuarios</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            Gestión de acceso y permisos del sistema
          </p>
        </div>
        <button
          onClick={() => { setSelected(null); setFormOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-all shrink-0"
          style={{ background: "var(--accent)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-light)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent)"; }}
        >
          <UserPlus size={15} />
          Nuevo Usuario
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
        <input
          type="text"
          placeholder="Buscar por nombre, usuario o correo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 text-sm rounded-xl outline-none transition-all"
          style={{ background: "var(--bg-surface)", border: "1.5px solid var(--border)", color: "var(--text)" }}
          onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
          onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
        <div
          className="grid text-xs font-semibold uppercase tracking-wider px-6 py-3"
          style={{ gridTemplateColumns: "1fr 1fr 160px 120px 100px", color: "var(--text-muted)", borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}
        >
          <span>Nombre</span>
          <span>Correo</span>
          <span>Teléfono</span>
          <span>Tipo</span>
          <span className="text-right">Acciones</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span
              className="w-6 h-6 rounded-full border-2 animate-spin"
              style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }}
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-sm" style={{ color: "var(--text-muted)" }}>
            Sin resultados
          </div>
        ) : (
          filtered.map((u) => (
            <div
              key={u.id}
              className="grid items-center px-6 py-4 group transition-colors"
              style={{
                gridTemplateColumns: "1fr 1fr 160px 120px 100px",
                borderBottom: "1px solid var(--border)",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                  {u.first_name} {u.last_name}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>@{u.username}</p>
              </div>
              <p className="text-sm truncate pr-4" style={{ color: "var(--text-muted)" }}>{u.email}</p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>{u.phone || "—"}</p>
              <div>
                {u.is_admin ? (
                  <span
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: "var(--accent-glow)", color: "var(--accent)", border: "1px solid var(--accent-dim)" }}
                  >
                    <Shield size={10} /> Admin
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{ background: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                  >
                    <ShieldOff size={10} /> Usuario
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                {!u.is_admin && (
                  <button
                    onClick={() => { setSelected(u); setPermsOpen(true); }}
                    className="p-1.5 rounded-lg transition-colors"
                    title="Permisos"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.background = "var(--accent-glow)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
                  >
                    <Key size={14} />
                  </button>
                )}
                <button
                  onClick={() => { setSelected(u); setFormOpen(true); }}
                  className="p-1.5 rounded-lg transition-colors"
                  title="Editar"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.background = "var(--bg-elevated)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(u.id)}
                  className="p-1.5 rounded-lg transition-colors"
                  title="Eliminar"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.background = "rgba(192,57,43,0.06)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        {filtered.length} usuario{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
      </p>

      {formOpen && (
        <UserFormModal user={selected} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); fetchUsers(); }} />
      )}
      {permsOpen && selected && (
        <UserPermissionsModal user={selected} onClose={() => setPermsOpen(false)} />
      )}
    </div>
  );
}