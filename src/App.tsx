import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Chatbot } from "./components/chat/Chatbot";
import { PageLoader } from "./components/ui/PageLoader";
import { useAuth } from "./hooks/useAuth";

const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  const { loading: authLoading } = useAuth();
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [prevLocation, setPrevLocation] = useState(location.pathname);

  // Handle route transitions
  useEffect(() => {
    if (location.pathname !== prevLocation) {
      setIsRouteLoading(true);
      const timer = setTimeout(() => {
        setIsRouteLoading(false);
        setPrevLocation(location.pathname);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, prevLocation]);

  const showLoader = authLoading || isRouteLoading;

  return (
    <>
      {showLoader && <PageLoader message={authLoading ? "Authenticating..." : "Loading..."} />}
      <div className={`transition-opacity duration-300 ${showLoader ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login/:role" element={<Login />} />
          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRole="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient"
            element={
              <ProtectedRoute allowedRole="patient">
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Chatbot />
      </div>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
