import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useInactivityLogout } from "@/hooks/useInactivityLogout";
import HeroSection from "@/components/HeroSection";
import CharacterCarousel from "@/components/CharacterCarousel";
import FeaturesSection from "@/components/FeaturesSection";
import MysteryBoxSection from "@/components/MysteryBoxSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import WithdrawalsSection from "@/components/WithdrawalsSection";
import RaritySection from "@/components/RaritySection";
import ReferralSection from "@/components/ReferralSection";
import ReferralContestSection from "@/components/ReferralContestSection";
import CTASection from "@/components/CTASection";
import BalanceHeader from "@/components/BalanceHeader";
import InventorySection from "@/components/InventorySection";
import FaucetPaySection from "@/components/FaucetPaySection";
import PTCSection from "@/components/PTCSection";
import CollectionSection from "@/components/CollectionSection";
import LotterySection from "@/components/LotterySection";
import OnlineMiningSection from "@/components/OnlineMiningSection";
import WebMiningSection from "@/components/WebMiningSection";
import { ShortlinksSection } from "@/components/ShortlinksSection";
import AppSidebar from "@/components/AppSidebar";
import SupportSection from "@/components/SupportSection";
import StakingSection from "@/components/StakingSection";
import DogeBirdsSection from "@/components/DogeBirdsSection";
import SocialTasksSection from "@/components/SocialTasksSection";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("hero");
  const mainContentRef = useRef<HTMLDivElement>(null);
  
  // Auto-logout after 5 minutes of inactivity (except admins)
  useInactivityLogout();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Track active section based on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "hero", "social-tasks", "mystery-boxes", "inventory", "collection", "doge-birds",
        "web-mining", "online-mining", "staking", "lottery", "shortlinks", "ptc", "faucetpay", "referral", "support"
      ];
      
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

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
    <div className="min-h-screen">
      <BalanceHeader />
      <AppSidebar activeSection={activeSection} onNavigate={scrollToSection} />
      
      {/* Main content with sidebar offset */}
      <main 
        ref={mainContentRef}
        className="pt-16 lg:pl-64 transition-all duration-300"
      >
        
        <div id="hero">
          <HeroSection />
        </div>
        <CharacterCarousel />
        <FeaturesSection />
        <div id="social-tasks">
          <SocialTasksSection />
        </div>
        <div id="mystery-boxes">
          <MysteryBoxSection />
        </div>
        <div id="inventory">
          <InventorySection />
        </div>
        <div id="collection">
          <CollectionSection />
        </div>
        <div id="doge-birds">
          <DogeBirdsSection />
        </div>
        <div id="web-mining">
          <WebMiningSection />
        </div>
        <div id="online-mining">
          <OnlineMiningSection />
        </div>
        <div id="staking">
          <StakingSection />
        </div>
        <div id="lottery">
          <LotterySection />
        </div>
        <div id="shortlinks">
          <ShortlinksSection />
        </div>
        <div id="ptc">
          <PTCSection />
        </div>
        <div id="faucetpay">
          <FaucetPaySection />
        </div>
        <div id="referral">
          <ReferralContestSection />
          <ReferralSection />
        </div>
        <div id="support">
          <SupportSection />
        </div>
        <HowItWorksSection />
        <WithdrawalsSection />
        <RaritySection />
        <CTASection />
      </main>
    </div>
  );
};

export default Index;
