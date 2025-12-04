import HeroSection from "@/components/HeroSection";
import CharacterCarousel from "@/components/CharacterCarousel";
import FeaturesSection from "@/components/FeaturesSection";
import MysteryBoxSection from "@/components/MysteryBoxSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import WithdrawalsSection from "@/components/WithdrawalsSection";
import RaritySection from "@/components/RaritySection";
import CTASection from "@/components/CTASection";
import BalanceHeader from "@/components/BalanceHeader";

const Index = () => {
  return (
    <main className="min-h-screen">
      <BalanceHeader />
      <div className="pt-16"> {/* Offset for fixed header */}
        <HeroSection />
        <CharacterCarousel />
        <FeaturesSection />
        <MysteryBoxSection />
        <HowItWorksSection />
        <WithdrawalsSection />
        <RaritySection />
        <CTASection />
      </div>
    </main>
  );
};

export default Index;
