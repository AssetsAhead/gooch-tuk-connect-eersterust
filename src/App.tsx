import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleBasedRedirect } from "@/components/RoleBasedRedirect";

// Page imports
import Index from "./pages/Index";
import { AuthPage } from "./pages/Auth";
import { UnauthorizedPage } from "./pages/Unauthorized";
import { PassengerDashboard } from "./components/dashboards/PassengerDashboard";
import { DriverDashboard } from "./components/dashboards/DriverDashboard";
import { OwnerDashboard } from "./components/dashboards/OwnerDashboard";
import { MarshallDashboard } from "./components/dashboards/MarshallDashboard";
import { AdminDashboard } from "./components/dashboards/AdminDashboard";
import { PoliceDashboard } from "./components/dashboards/PoliceDashboard";
import BusinessPortal from "./pages/BusinessPortal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Role-based redirect for authenticated users */}
            <Route path="/" element={
              <ProtectedRoute>
                <RoleBasedRedirect />
              </ProtectedRoute>
            } />
            
            {/* Protected role-specific routes */}
            <Route path="/passenger" element={
              <ProtectedRoute requiredRole={['passenger']}>
                <PassengerDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/driver" element={
              <ProtectedRoute requiredRole={['driver']}>
                <DriverDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/owner" element={
              <ProtectedRoute requiredRole={['owner']}>
                <OwnerDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/marshall" element={
              <ProtectedRoute requiredRole={['marshall']}>
                <MarshallDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute requiredRole={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/police" element={
              <ProtectedRoute requiredRole={['police']}>
                <PoliceDashboard />
              </ProtectedRoute>
            } />
            
            {/* Legacy routes - redirect to role-based */}
            <Route path="/business-portal" element={
              <ProtectedRoute>
                <BusinessPortal />
              </ProtectedRoute>
            } />
            
            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
