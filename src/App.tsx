
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ScriptGeneratorPage from "./pages/ScriptGeneratorPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import WebsitesPage from "./pages/WebsitesPage";
import ScriptsPage from "./pages/ScriptsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import Index from "./pages/Index";
import TestingPage from "./pages/TestingPage";

// Create a new QueryClient instance with proper error handling for v5
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      meta: {
        onError: (error: Error) => {
          console.error('Query error:', error);
        }
      }
    },
    mutations: {
      meta: {
        onError: (error: Error) => {
          console.error('Mutation error:', error);
        }
      }
    }
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/home" element={<Layout><HomePage /></Layout>} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/websites" 
                element={
                  <ProtectedRoute>
                    <WebsitesPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/scripts" 
                element={
                  <ProtectedRoute>
                    <ScriptsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/scripts/create" 
                element={
                  <ProtectedRoute>
                    <ScriptGeneratorPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/analytics" 
                element={
                  <ProtectedRoute>
                    <AnalyticsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/settings" 
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/testing" 
                element={
                  <ProtectedRoute>
                    <TestingPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <AdminRoute>
                    <AdminDashboardPage />
                  </AdminRoute>
                } 
              />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
