
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";
import ScriptGeneratorPage from "./pages/ScriptGeneratorPage";
import TestingPage from "./pages/TestingPage";
import EditScriptPage from "./pages/EditScriptPage";
import TestScriptPage from "./pages/TestScriptPage";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import { Toaster } from "./components/ui/toaster";

// Define App as a React functional component
const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin-setup" element={<AdminSetupPage />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/websites" element={<ProtectedRoute><WebsitesPage /></ProtectedRoute>} />
          <Route path="/dashboard/scripts" element={<ProtectedRoute><ScriptsPage /></ProtectedRoute>} />
          <Route path="/dashboard/scripts/create" element={<ProtectedRoute><ScriptGeneratorPage /></ProtectedRoute>} />
          <Route path="/dashboard/scripts/edit/:id" element={<ProtectedRoute><EditScriptPage /></ProtectedRoute>} />
          <Route path="/dashboard/scripts/test/:id" element={<ProtectedRoute><TestScriptPage /></ProtectedRoute>} />
          <Route path="/dashboard/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/dashboard/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/dashboard/testing" element={<ProtectedRoute><TestingPage /></ProtectedRoute>} />
          
          <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
