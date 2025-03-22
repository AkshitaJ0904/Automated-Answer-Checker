import React from 'react';
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
  requiredRole?: string;
}
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, redirectPath = "/login", requiredRole }) => {
  const { user, loading, role } = useAuth();

  console.log("ProtectedRoute Check:", { user, loading, role });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    console.warn("User not authenticated. Redirecting to login.");
    return <Navigate to={redirectPath} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    console.warn(`User does not have the required role (${requiredRole}). Redirecting to login.`);
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;