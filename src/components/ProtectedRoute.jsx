import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "./LoadingSpinner";

/**
 * Wraps authenticated pages — redirects to /login if user is not logged in.
 */
export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner size="lg" text="Checking authentication..." />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
