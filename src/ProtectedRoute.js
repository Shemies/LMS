import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, role, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    ); // Show a loading spinner
  }

  if (!user) {
    return <Navigate to="/" replace />; // Redirect to login if user is not authenticated
  }

  if (requireAdmin && role !== "admin") {
    return <Navigate to="/dashboard" replace />; // Redirect to dashboard if user is not an admin
  }

  return children; // Allow access if all checks pass
};

export default ProtectedRoute;