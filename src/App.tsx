import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AllDestinations from "./pages/AllDestinations";
import SubscriptionTiers from "./pages/SubscriptionTiers";
import PaymentPortal from "./pages/PaymentPortal";
import AuthCallback from "./pages/AuthCallback";
import MyBookings from "./pages/MyBookings";
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
          <Route path="/all-destinations" element={<AllDestinations />} />
          <Route path="/subscription-tiers" element={<SubscriptionTiers />} />
          <Route path="/payment-portal" element={<PaymentPortal />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;