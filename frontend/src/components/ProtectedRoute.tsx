import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Loading } from "../pages/Loading";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading message="Проверка авторизации..." fullScreen />;
  }

  if (user?.is_email_verified === false) {
    if (window.location.pathname !== "/verify-email") {
      return <Navigate to="/verify-email" replace />;
    }
    return <>{children}</>;
  } else {
    if (window.location.pathname === "/verify-email") {
      return <Navigate to="/" replace />;
    }
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
