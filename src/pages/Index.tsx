import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import HeroSection from "@/components/HeroSection";
import CharacterCarousel from "@/components/CharacterCarousel";
import FeaturesSection from "@/components/FeaturesSection";
import MysteryBoxSection from "@/components/MysteryBoxSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import WithdrawalsSection from "@/components/WithdrawalsSection";
import RaritySection from "@/components/RaritySection";
import ReferralSection from "@/components/ReferralSection";
import CTASection from "@/components/CTASection";
import BalanceHeader from "@/components/BalanceHeader";
import InventorySection from "@/components/InventorySection";
import FaucetPaySection from "@/components/FaucetPaySection";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen">
      <BalanceHeader />
      <div className="pt-16">
        <HeroSection />
        <CharacterCarousel />
        <FeaturesSection />
        <MysteryBoxSection />
        <InventorySection />
        <FaucetPaySection />
        <ReferralSection />
        <HowItWorksSection />
        <WithdrawalsSection />
        <RaritySection />
        <CTASection />
      </div>
    </main>
  );
};

export default Index;
