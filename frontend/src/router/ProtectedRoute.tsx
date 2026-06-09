import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/core/store/authStore";

interface Props { children: React.ReactNode; module?: string; }

export function ProtectedRoute({ children, module }: Props) {
  const { token, user } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (module && !user?.is_admin) {
    const hasAccess = user?.permissions && module in user.permissions;
    if (!hasAccess) return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}