import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, FileText, BookOpen,
  ClipboardList, Bell, ChevronDown, LogOut, Menu, User, GraduationCap
} from "lucide-react";
import { useAuthStore } from "@/core/store/authStore";

const ALL_NAV_ITEMS = [
  { to: "/",           icon: LayoutDashboard, label: "Dashboard",    end: true,  module: null },
  { to: "/docentes",   icon: GraduationCap,   label: "Docentes",     module: "docentes" },
  { to: "/asignaturas",icon: BookOpen,         label: "Asignaturas",  module: "asignaturas" },
  { to: "/contratos",  icon: ClipboardList,    label: "Contratos",    module: "contratos" },
  { to: "/reportes",   icon: FileText,         label: "Reportes",     module: "reportes" },
  { to: "/usuarios",   icon: Users,            label: "Usuarios",     module: "usuarios" },
];

export function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  const navItems = ALL_NAV_ITEMS.filter(({ module }) => {
    if (!module) return true;
    if (user?.is_admin) return true;
    return user?.permissions && module in user.permissions;
  });

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col shrink-0 transition-all duration-300"
        style={{
          width: sidebarOpen ? "260px" : "68px",
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-4 h-16 shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            <GraduationCap size={18} />
          </div>
          {sidebarOpen && (
            <div>
              <p className="text-xs font-semibold tracking-wide" style={{ color: "var(--text-muted)" }}>
                EMI Cochabamba
              </p>
              <p className="text-sm font-bold leading-tight" style={{ color: "var(--text)" }}>
                Contratación Docente
              </p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-2 py-4 flex-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg text-sm font-medium transition-all group relative
                ${sidebarOpen ? "px-3 py-2.5" : "px-0 py-2.5 justify-center"}
                ${isActive
                  ? "text-[var(--accent)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`
              }
              style={({ isActive }) => isActive
                ? { background: "var(--accent-glow)", border: "1px solid var(--accent-dim)" }
                : { border: "1px solid transparent" }
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && sidebarOpen && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                      style={{ background: "var(--accent)" }}
                    />
                  )}
                  <Icon size={17} className="shrink-0" />
                  {sidebarOpen && <span>{label}</span>}
                  {!sidebarOpen && (
                    <span
                      className="absolute left-full ml-3 px-3 py-1.5 text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity shadow-lg"
                      style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text)" }}
                    >
                      {label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className={`px-2 pb-4 shrink-0 ${!sidebarOpen ? "flex justify-center" : ""}`}>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-all
            ${sidebarOpen ? "w-full px-3 py-2.5" : "px-2.5 py-2.5"}`}
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--danger)";
              e.currentTarget.style.background = "rgba(192,57,43,0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <LogOut size={17} className="shrink-0" />
            {sidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header
          className="h-16 flex items-center justify-between px-6 shrink-0"
          style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-elevated)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2">
            <button
              className="relative p-2 rounded-lg transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-elevated)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <Bell size={19} />
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2"
                style={{ background: "var(--accent)", borderColor: "var(--bg-surface)" }}
              />
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors"
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-elevated)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
                  style={{ background: "var(--accent-glow)", color: "var(--accent)", border: "1px solid var(--accent-dim)" }}
                >
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium leading-none mb-0.5" style={{ color: "var(--text)" }}>
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs leading-none" style={{ color: "var(--text-muted)" }}>
                    {user?.is_admin ? "Administrador" : "Usuario"}
                  </p>
                </div>
                <ChevronDown
                  size={14}
                  style={{ color: "var(--text-muted)", transform: profileOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div
                    className="absolute right-0 top-full mt-2 w-52 rounded-xl shadow-xl z-50 overflow-hidden"
                    style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
                  >
                    <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                      <p className="text-sm font-medium" style={{ color: "var(--text)" }}>@{user?.username}</p>
                      <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-3 text-sm transition-colors"
                      style={{ color: "var(--danger)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(192,57,43,0.06)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <LogOut size={14} />
                      Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-8" style={{ background: "var(--bg)" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}