
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import WebsitesPage from "./pages/WebsitesPage";
import ScriptsPage from "./pages/ScriptsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminSetupPage from "./pages/AdminSetupPage";
import MakeAdminPage from "./pages/MakeAdminPage";
import NotFound from "./pages/NotFound";
import ScriptGeneratorPage from "./pages/ScriptGeneratorPage";
import TestingPage from "./pages/TestingPage";
import EditScriptPage from "./pages/EditScriptPage";
import TestScriptPage from "./pages/TestScriptPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import AdminWebhooksPage from "./pages/AdminWebhooksPage";
import AdminManagementPage from "./pages/AdminManagementPage";
import AdminUserDetailPage from './pages/AdminUserDetailPage';
import AdminScriptsPage from './pages/AdminScriptsPage';
import AdminDomainsPage from './pages/AdminDomainsPage';
import AdminConsentLogsPage from './pages/AdminConsentLogsPage';

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import { Toaster } from "./components/ui/toaster";

// Define App as a React functional component
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin-setup" element={<AdminSetupPage />} />
          <Route path="/make-admin" element={<MakeAdminPage />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/websites" element={<ProtectedRoute><WebsitesPage /></ProtectedRoute>} />
          <Route path="/dashboard/scripts" element={<ProtectedRoute><ScriptsPage /></ProtectedRoute>} />
          <Route path="/dashboard/scripts/create" element={<ProtectedRoute><ScriptGeneratorPage /></ProtectedRoute>} />
          <Route path="/dashboard/scripts/edit/:id" element={<ProtectedRoute><EditScriptPage /></ProtectedRoute>} />
          <Route path="/dashboard/scripts/test/:id" element={<ProtectedRoute><TestScriptPage /></ProtectedRoute>} />
          <Route path="/dashboard/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/dashboard/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/dashboard/testing" element={<ProtectedRoute><TestingPage /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute component={AdminDashboardPage} />
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <AdminRoute component={AdminUsersPage} />
            } 
          />
          <Route 
            path="/admin/users/:userId" 
            element={
              <AdminRoute component={AdminUserDetailPage} />
            } 
          />
          <Route 
            path="/admin/scripts" 
            element={
              <AdminRoute component={AdminScriptsPage} />
            } 
          />
          <Route 
            path="/admin/domains" 
            element={
              <AdminRoute component={AdminDomainsPage} />
            } 
          />
          <Route 
            path="/admin/consent-logs" 
            element={
              <AdminRoute component={AdminConsentLogsPage} />
            } 
          />
          <Route path="/admin/settings" element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />
          <Route path="/admin/webhooks" element={<AdminRoute><AdminWebhooksPage /></AdminRoute>} />
          <Route path="/admin/admins" element={<AdminRoute><AdminManagementPage /></AdminRoute>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
