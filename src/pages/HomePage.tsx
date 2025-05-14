
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  
  // If user is logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">Welcome to ConsentGuard</h1>
          <p className="text-xl mb-8">
            The easiest way to add cookie consent management to your website
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="/login" 
              className="px-8 py-3 text-lg font-medium rounded-md bg-brand-600 text-white hover:bg-brand-700 transition"
            >
              Login
            </a>
            <a 
              href="/register" 
              className="px-8 py-3 text-lg font-medium rounded-md border border-brand-300 bg-white hover:bg-gray-50 transition"
            >
              Register
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
