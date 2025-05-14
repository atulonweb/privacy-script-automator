
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader } from 'lucide-react';
import React from 'react';

type ProtectedRouteProps = {
  children?: React.ReactNode;
  component?: React.ComponentType<any>;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, component: Component }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If component prop is provided, render it; otherwise render children
  if (Component) {
    return <Component />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
