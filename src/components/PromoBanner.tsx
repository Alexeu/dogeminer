import { Trophy, Sparkles, ArrowRight, Megaphone, Users, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import rpgdogeToken from "@/assets/rpgdoge-token.png";

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

  return (
    <div className="flex flex-col lg:pl-64">
      {/* RPGDOGE Token Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnptMCAyMGMtNC40MTggMC04LTMuNTgyLTgtOHMzLjU4Mi04IDgtOCA4IDMuNTgyIDggOC0zLjU4MiA4LTggOHoiIGZpbGw9IiNmZmYiIG9wYWNpdHk9Ii4wNSIvPjwvZz48L3N2Zz4=')] opacity-40" />
        
        <div className="relative container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img 
                src={rpgdogeToken} 
                alt="RPGDOGE Token" 
                className="w-12 h-12 rounded-full border-2 border-yellow-400 shadow-lg animate-pulse"
              />
              <div className="text-white">
                <div className="flex items-center gap-2 flex-wrap">
                  <Coins className="w-4 h-4 text-yellow-300" />
                  <h3 className="text-base md:text-lg font-bold">
                    🚀 RPGDOGE TOKEN - ¡PRÓXIMAMENTE!
                  </h3>
                </div>
                <p className="text-white/90 text-xs md:text-sm">
                  <span className="font-bold text-yellow-300">10B Supply</span> • Staking • Preventa exclusiva
                </p>
              </div>
            </div>
            
            <Button 
              size="sm"
              className="bg-yellow-400 text-purple-900 hover:bg-yellow-300 font-bold shadow-lg"
              disabled
            >
              Próximamente
              <Sparkles className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Referral Contest Banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-primary to-yellow-500 opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iLjEiIGN4PSIyMCIgY3k9IjIwIiByPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
        
        <div className="relative container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-bounce">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div className="text-white">
                <div className="flex items-center gap-2 flex-wrap">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <h3 className="text-lg md:text-xl font-bold">
                    🏆 CONCURSO DE REFERIDOS
                  </h3>
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                </div>
                <p className="text-white/90 text-sm md:text-base">
                  <span className="font-bold text-yellow-300">¡Gana hasta 15 DOGE!</span> Invita amigos y compite por los premios
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-center text-white hidden md:block">
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <Users className="w-4 h-4" />
                  <span>Mín. 10 referidos</span>
                </div>
                <div className="flex gap-3 mt-1">
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
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-3 text-white">
            <Megaphone className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm md:text-base text-center">
              <span className="font-semibold">Hemos implementado anuncios</span> para mantener RPG Doge sostenible. ¡Gracias por tu apoyo! 🐕
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;
