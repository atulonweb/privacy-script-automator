
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader } from 'lucide-react';
import React from 'react';

type AdminRouteProps = {
  children?: React.ReactNode;
  component?: React.ComponentType<any>;
};

const AdminRoute: React.FC<AdminRouteProps> = ({ children, component: Component }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // If component prop is provided, render it; otherwise render children
  if (Component) {
    return <Component />;
  }

  return <>{children}</>;
};

export default AdminRoute;
