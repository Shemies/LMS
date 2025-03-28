import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false, 
  requireAssistant = false,
  requireStudent = false
}) => {
  const { user, role, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check specific role requirements
  if (requireAdmin && role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireAssistant && role !== "assistant") {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireStudent && role !== "student") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;