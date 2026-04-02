import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import Index from "./pages/Index.tsx";
import { AdminPanel } from "./pages/AdminPanel.tsx";
import { AdminLogin } from "@/components/AdminLogin.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem("adminLoggedIn") === "true";
  });

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    localStorage.setItem("adminLoggedIn", "true");
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem("adminLoggedIn");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/admin"
              element={
                isAdminLoggedIn ? (
                  <AdminPanel onLogout={handleAdminLogout} />
                ) : (
                  <AdminLogin onLogin={handleAdminLogin} />
                )
              }
            />
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
