import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PendingApproval from "./pages/PendingApproval";
import Dashboard from "./pages/Dashboard";
import MeusAgendamentos from "./pages/MeusAgendamentos";
import SuperAdmin from "./pages/SuperAdmin";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/pending-approval" 
            element={
              <ProtectedRoute requiredRole="administrador" requiredStatus="pendente">
                <PendingApproval />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requiredRole="administrador" requiredStatus="ativo">
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/meus-agendamentos" 
            element={
              <ProtectedRoute requiredRole="cliente">
                <MeusAgendamentos />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/super-admin" 
            element={
              <ProtectedRoute requiredRole="super_admin">
                <SuperAdmin />
              </ProtectedRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
