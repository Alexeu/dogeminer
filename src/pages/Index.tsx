import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
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
import ManualReviewAlert from "@/components/ManualReviewAlert";
import FaucetPayListingAlert from "@/components/FaucetPayListingAlert";
import SurveySection from "@/components/SurveySection";

import RPGDogeTokenCounter from "@/components/RPGDogeTokenCounter";
import rpgDogeBanner from "@/assets/rpgdoge-banner-2.png";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

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
        "hero", "mystery-boxes", "inventory", "collection", "doge-birds",
        "web-mining", "online-mining", "staking", "lottery", "shortlinks", "ptc", "faucetpay", "referral", "support", "survey"
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
        {/* Alerts */}
        <FaucetPayListingAlert />
        <ManualReviewAlert />
        
        {/* RPGDOGE Banner */}
        <div 
          className="px-4 pt-4 cursor-pointer"
          onClick={() => navigate("/rpgdoge")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate("/rpgdoge")}
        >
          <motion.div 
            className="relative overflow-hidden rounded-2xl border border-yellow-500/30 shadow-lg shadow-yellow-500/10 group max-w-5xl mx-auto pointer-events-none"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(234, 179, 8, 0.3)" }}
          >
            <img 
              src={rpgDogeBanner} 
              alt="RPGDOGE Presale" 
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
              <span className="text-white font-bold text-lg bg-yellow-500/80 px-4 py-2 rounded-full">
                ¡Únete a la Preventa!
              </span>
            </div>
          </motion.div>
        </div>
        
        <div id="hero">
          <HeroSection />
        </div>
        <RPGDogeTokenCounter />
        <CharacterCarousel />
        <FeaturesSection />
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
        <div id="survey">
          <SurveySection />
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
