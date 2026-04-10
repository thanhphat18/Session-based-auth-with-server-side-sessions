import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <main className="auth-loading">Checking your session...</main>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
