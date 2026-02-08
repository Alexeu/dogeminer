import { useState, useEffect } from "react";
import { Gift, X, ArrowRight, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "depositPromoBannerDismissed";

const DepositPromoBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
  };

  const scrollToDeposit = () => {
    const element = document.getElementById('faucetpay');
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

  if (!isVisible) return null;

  return (
    <Alert className="relative mx-4 mt-4 border-amber-500 bg-gradient-to-r from-amber-600 via-yellow-500 to-orange-500 text-white">
      <div className="flex items-center gap-3 w-full">
        <div className="flex items-center gap-2 shrink-0">
          <Gift className="h-5 w-5 text-white" />
          <Sparkles className="h-4 w-4 text-yellow-200 animate-pulse" />
        </div>
        <AlertDescription className="flex-1 text-white font-medium text-sm md:text-base">
          <span className="font-bold">🔥 ¡MEGA PROMO!</span>{" "}
          <span className="hidden sm:inline">+50% en 100+ DOGE | </span>
          <span className="font-bold text-yellow-200">+100% en 200+ DOGE</span>
        </AlertDescription>
        <Button
          onClick={scrollToDeposit}
          size="sm"
          className="bg-white/20 hover:bg-white/30 text-white border-white/30 mr-8 shrink-0"
        >
          <span className="hidden sm:inline">Depositar</span>
          <ArrowRight className="h-4 w-4 sm:ml-1" />
        </Button>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-white hover:text-yellow-200 hover:bg-amber-700"
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  );
};

export default DepositPromoBanner;
