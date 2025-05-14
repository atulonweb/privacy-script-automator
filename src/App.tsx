
import { BrowserRouter, Routes, Route } from "react-router-dom";

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
import NotFound from "./pages/NotFound";
import ScriptGeneratorPage from "./pages/ScriptGeneratorPage";
import TestingPage from "./pages/TestingPage";
import EditScriptPage from "./pages/EditScriptPage";
import TestScriptPage from "./pages/TestScriptPage";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import { Toaster } from "./components/ui/toaster";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route path="/dashboard" element={<ProtectedRoute component={DashboardPage} />} />
        <Route path="/dashboard/websites" element={<ProtectedRoute component={WebsitesPage} />} />
        <Route path="/dashboard/scripts" element={<ProtectedRoute component={ScriptsPage} />} />
        <Route path="/dashboard/scripts/create" element={<ProtectedRoute component={ScriptGeneratorPage} />} />
        <Route path="/dashboard/scripts/edit/:id" element={<ProtectedRoute component={EditScriptPage} />} />
        <Route path="/dashboard/scripts/test/:id" element={<ProtectedRoute component={TestScriptPage} />} />
        <Route path="/dashboard/analytics" element={<ProtectedRoute component={AnalyticsPage} />} />
        <Route path="/dashboard/settings" element={<ProtectedRoute component={SettingsPage} />} />
        <Route path="/dashboard/testing" element={<ProtectedRoute component={TestingPage} />} />
        
        <Route path="/admin" element={<AdminRoute component={AdminDashboardPage} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
