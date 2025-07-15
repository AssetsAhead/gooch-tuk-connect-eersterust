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
import { PaymentSuccess } from "./pages/PaymentSuccess";
import { PaymentCancelled } from "./pages/PaymentCancelled";
import { RoleAuth } from "./pages/RoleAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-cancelled" element={<PaymentCancelled />} />
            <Route path="/auth/:role" element={<RoleAuth />} />
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <RoleBasedRedirect />
              </ProtectedRoute>
            } />
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
            <Route path="/business-portal" element={
              <ProtectedRoute>
                <BusinessPortal />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
