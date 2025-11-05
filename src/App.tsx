import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { EnhancedSecurityProvider } from "@/components/security/EnhancedSecurityProvider";
import { AnalyticsProvider } from "@/components/AnalyticsTracker";
import { AdminUniversalAccess } from "@/components/AdminUniversalAccess";
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
import CommunitySafetyPortal from "./pages/CommunitySafetyPortal";
import PassengerRecruitment from "./pages/PassengerRecruitment";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import { PaymentSuccess } from "./pages/PaymentSuccess";
import { PaymentCancelled } from "./pages/PaymentCancelled";
import { RoleAuth } from "./pages/RoleAuth";
import RegisterComplete from "./pages/RegisterComplete";
import { SafeMode } from "./pages/SafeMode";
import { Compliance } from "./pages/Compliance";
import { GlobalPanicButton } from "./components/GlobalPanicButton";
import { ReactHealthMonitor } from "./components/dev/ReactHealthMonitor";

const queryClient = new QueryClient();

const App = () => {
  console.log('App component rendering');
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AnalyticsProvider>
          <AdminUniversalAccess>
            <BrowserRouter>
              <EnhancedSecurityProvider>
                <Toaster />
                <Sonner />
                <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/register-complete" element={<RegisterComplete />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-cancelled" element={<PaymentCancelled />} />
                <Route path="/auth/:role" element={<RoleAuth />} />
                <Route path="/safe" element={<SafeMode />} />
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <RoleBasedRedirect />
                  </ProtectedRoute>
                } />
                <Route path="/passenger" element={
                  <ProtectedRoute requiredRole={['passenger', 'admin']}>
                    <PassengerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/driver" element={
                  <ProtectedRoute requiredRole={['driver', 'admin']}>
                    <DriverDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/owner" element={
                  <ProtectedRoute requiredRole={['owner', 'admin']}>
                    <OwnerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/marshall" element={
                  <ProtectedRoute requiredRole={['marshall', 'admin']}>
                    <MarshallDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute requiredRole={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/police" element={
                  <ProtectedRoute requiredRole={['police', 'admin']}>
                    <PoliceDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/business-portal" element={<BusinessPortal />} />
                <Route path="/community-safety" element={<CommunitySafetyPortal />} />
                <Route path="/passenger-recruitment" element={<PassengerRecruitment />} />
                <Route path="/compliance" element={<Compliance />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <GlobalPanicButton />
                <ReactHealthMonitor />
              </EnhancedSecurityProvider>
            </BrowserRouter>
          </AdminUniversalAccess>
        </AnalyticsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
