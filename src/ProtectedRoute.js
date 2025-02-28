import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, role, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>; // Show a loading spinner or message
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