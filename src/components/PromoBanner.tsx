import { Gift, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// New Year Promo 2025/2026
const PROMO_END_DATE = new Date('2026-01-07T00:00:00Z');
const PROMO_MIN_DEPOSIT = 3;
const PROMO_BONUS_PERCENT = 25;

const PromoBanner = () => {
  const isPromoActive = new Date() < PROMO_END_DATE;
  const daysUntilPromoEnds = isPromoActive 
    ? Math.ceil((PROMO_END_DATE.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  if (!isPromoActive) return null;

  const scrollToFaucetPay = () => {
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

  return (
    <div className="relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-primary to-amber-500 opacity-90" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iLjEiIGN4PSIyMCIgY3k9IjIwIiByPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
      
      <div className="relative container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-bounce">
              <Gift className="w-7 h-7 text-white" />
            </div>
            <div className="text-white">
              <div className="flex items-center gap-2 flex-wrap">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h3 className="text-lg md:text-xl font-bold">
                  ¡PROMO FIN DE AÑO!
                </h3>
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <p className="text-white/90 text-sm md:text-base">
                <span className="font-bold text-amber-300">+{PROMO_BONUS_PERCENT}% BONUS</span> en depósitos mayores a {PROMO_MIN_DEPOSIT} DOGE
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-center text-white">
              <p className="text-xs text-white/70">Termina en</p>
              <p className="text-2xl font-bold">{daysUntilPromoEnds} días</p>
              <p className="text-xs text-white/70">6 de Enero</p>
            </div>
            <Button 
              onClick={scrollToFaucetPay}
              className="bg-white text-primary hover:bg-white/90 font-bold shadow-lg"
            >
              Depositar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;
