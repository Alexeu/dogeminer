import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DogeBalanceProvider } from "@/contexts/DogeBalanceContext";
import { InventoryProvider } from "@/contexts/InventoryContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import AdBlockDetector from "@/components/AdBlockDetector";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import RPGDogeLore from "./pages/RPGDogeLore";
import RPGDogePresale from "./pages/RPGDogePresale";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AdBlockDetector>
        <TooltipProvider>
          <AuthProvider>
            <DogeBalanceProvider>
              <InventoryProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/rpgdoge" element={<RPGDogeLore />} />
                    <Route path="/rpgdoge/presale" element={<RPGDogePresale />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </InventoryProvider>
            </DogeBalanceProvider>
          </AuthProvider>
        </TooltipProvider>
      </AdBlockDetector>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
