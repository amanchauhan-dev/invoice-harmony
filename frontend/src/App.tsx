import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./context/AuthContext";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Invoices from "./pages/Invoices";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import CreateInvoice from "./pages/CreateInvoice";
import ViewInvoice from "./pages/ViewInvoice";
import PayInvoice from "./pages/PayInvoice";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/pay/:invoiceId" element={<PayInvoice />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/invoices/create" element={<CreateInvoice />} />
              <Route path="/invoices/edit/:id" element={<CreateInvoice />} />
              <Route path="/invoices/view/:id" element={<ViewInvoice />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
