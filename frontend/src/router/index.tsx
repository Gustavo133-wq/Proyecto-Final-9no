import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage }        from "@/modules/auth/pages/LoginPage";
import { DashboardPage }    from "@/modules/dashboard/pages/DashboardPage";
import { UsersPage }        from "@/modules/users/pages/UsersPage";
import { DocentesPage }     from "@/modules/docentes/pages/DocentesPage";
import { AsignaturasPage }  from "@/modules/asignaturas/pages/AsignaturasPage";
import { ContratosPage }    from "@/modules/contratos/pages/ContratosPage";
import { AppLayout }        from "@/core/components/AppLayout";
import { ProtectedRoute }   from "@/router/ProtectedRoute";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { index: true,       element: <DashboardPage /> },
      { path: "usuarios",  element: <ProtectedRoute module="usuarios"><UsersPage /></ProtectedRoute> },
      { path: "docentes",  element: <ProtectedRoute module="docentes"><DocentesPage /></ProtectedRoute> },
      { path: "asignaturas", element: <ProtectedRoute module="asignaturas"><AsignaturasPage /></ProtectedRoute> },
      { path: "contratos", element: <ProtectedRoute module="contratos"><ContratosPage /></ProtectedRoute> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);