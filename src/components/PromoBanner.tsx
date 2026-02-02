import { Trophy, Sparkles, ArrowRight, Megaphone, Users, Gift, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";

const PromoBanner = () => {
  const scrollToReferral = () => {
    const element = document.getElementById('referral');
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

  return (
    <div className="flex flex-col">
      {/* 30% Deposit Bonus Banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iLjEiIGN4PSIyMCIgY3k9IjIwIiByPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
        
        <div className="relative container mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div className="text-white">
                <div className="flex items-center gap-2 flex-wrap">
                  <Sparkles className="w-4 h-4 text-yellow-200" />
                  <h3 className="text-base md:text-lg font-bold">
                    💰 +30% BONUS EN DEPÓSITOS
                  </h3>
                  <Sparkles className="w-4 h-4 text-yellow-200" />
                </div>
                <p className="text-white/90 text-xs md:text-sm">
                  Deposita <span className="font-bold text-yellow-200">60+ DOGE</span> y recibe <span className="font-bold text-yellow-200">30% extra</span> automáticamente
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-center text-white hidden md:block bg-white/10 px-3 py-1 rounded-lg">
                <span className="text-xs">Ejemplo:</span>
                <div className="font-bold text-sm">60 → <span className="text-yellow-200">78 DOGE</span></div>
              </div>
              <Button 
                onClick={scrollToDeposit}
                className="bg-white text-amber-600 hover:bg-white/90 font-bold shadow-lg"
              >
                Depositar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Contest Banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-primary to-yellow-500 opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iLjEiIGN4PSIyMCIgY3k9IjIwIiByPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
        
        <div className="relative container mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-bounce">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className="text-white">
                <div className="flex items-center gap-2 flex-wrap">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <h3 className="text-base md:text-lg font-bold">
                    🏆 CONCURSO DE REFERIDOS
                  </h3>
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                </div>
                <p className="text-white/90 text-xs md:text-sm">
                  <span className="font-bold text-yellow-300">¡Gana hasta 15 DOGE!</span> Invita amigos y compite
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-center text-white hidden md:block">
                <div className="flex items-center gap-2 text-xs text-white/80">
                  <Users className="w-3 h-3" />
                  <span>Mín. 10 referidos</span>
                </div>
                <div className="flex gap-2 mt-1 text-sm">
                  <span className="text-yellow-300 font-bold">🥇15</span>
                  <span className="text-gray-300 font-bold">🥈10</span>
                  <span className="text-amber-400 font-bold">🥉6</span>
                </div>
              </div>
              <Button 
                onClick={scrollToReferral}
                className="bg-white text-primary hover:bg-white/90 font-bold shadow-lg"
              >
                Participar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Ads Info Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 border-t border-white/10">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-center gap-3 text-white">
            <Megaphone className="w-4 h-4 flex-shrink-0" />
            <p className="text-xs md:text-sm text-center">
              <span className="font-semibold">Hemos implementado anuncios</span> para mantener RPG Doge sostenible. ¡Gracias por tu apoyo! 🐕
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;
