import HeroSection from "@/components/HeroSection";
import CharacterCarousel from "@/components/CharacterCarousel";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import WithdrawalsSection from "@/components/WithdrawalsSection";
import RaritySection from "@/components/RaritySection";
import CTASection from "@/components/CTASection";

const Index = () => {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <CharacterCarousel />
      <FeaturesSection />
      <HowItWorksSection />
      <WithdrawalsSection />
      <RaritySection />
      <CTASection />
    </main>
  );
};

export default Index;
