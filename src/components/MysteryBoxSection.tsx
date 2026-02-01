import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { boxTypes, BoxType } from "@/data/dogeData";
import { useDogeBalance } from "@/contexts/DogeBalanceContext";
import MysteryBoxModal from "@/components/MysteryBoxModal";
import { Gift, Sparkles, Zap, Lock, Clock } from "lucide-react";
import boxCommon from "@/assets/box-common.png";
import boxRare from "@/assets/box-rare.png";
import boxLegendary from "@/assets/box-legendary.png";
import boxChristmas from "@/assets/box-christmas.png";

const boxImages: Record<string, string> = {
  common: boxCommon,
  rare: boxRare,
  legendary: boxLegendary,
  christmas: boxChristmas,
  supreme: boxLegendary, // Usa imagen legendaria temporalmente
};

// Fecha de expiración: 6 de enero 2026 (Día de Reyes)
const CHRISTMAS_BOX_EXPIRY = new Date("2026-01-06T23:59:59");

const useCountdown = (targetDate: Date) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        expired: false,
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
};

const MysteryBoxSection = () => {
  const [selectedBox, setSelectedBox] = useState<BoxType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { depositBalance } = useDogeBalance();
  const countdown = useCountdown(CHRISTMAS_BOX_EXPIRY);

  const handleOpenBox = (box: BoxType) => {
    if (box.id === "christmas" && countdown.expired) return;
    setSelectedBox(box);
    setIsModalOpen(true);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `${(price / 1000).toFixed(1)}K`;
    }
    return price.toFixed(4);
  };

  // Filtrar la caja navideña si ha expirado
  const availableBoxes = boxTypes.filter(
    (box) => box.id !== "christmas" || !countdown.expired
  );

  return (
    <section id="mystery-boxes" className="py-20 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-doge-amber/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Gift className="w-4 h-4" />
            <span className="text-sm font-medium">Mystery Boxes</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Open <span className="text-gradient">Mystery Boxes</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Try your luck and discover rare DOGE characters! Each box has different
            drop rates for common to legendary DOGEs.
          </p>
        </div>

        <div className={`grid md:grid-cols-2 ${availableBoxes.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6 max-w-6xl mx-auto`}>
          {availableBoxes.map((box, index) => {
            const canAfford = depositBalance >= box.price;
            const isChristmas = box.id === "christmas";
            
            return (
              <div
                key={box.id}
                className={`glass rounded-2xl p-6 text-center transition-all duration-300 animate-slide-up group relative ${
                  canAfford ? "hover:shadow-doge-lg hover:-translate-y-2" : "opacity-75"
                } ${isChristmas ? "ring-2 ring-red-500/50 bg-gradient-to-b from-red-500/10 via-green-500/5 to-red-500/10" : ""}`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Christmas Badge with Countdown */}
                {isChristmas && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-500 to-green-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse whitespace-nowrap">
                    ✨ ¡EDICIÓN LIMITADA! ✨
                  </div>
                )}
                
                {/* Countdown Timer for Christmas Box */}
                {isChristmas && !countdown.expired && (
                  <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-red-500/20 via-green-500/10 to-red-500/20 border border-red-500/30">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-2">
                      <Clock className="w-3 h-3" />
                      <span>Expira en:</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 text-center">
                      <div className="bg-background/80 rounded-lg p-1">
                        <div className="text-lg font-bold text-red-500">{countdown.days}</div>
                        <div className="text-[10px] text-muted-foreground">días</div>
                      </div>
                      <div className="bg-background/80 rounded-lg p-1">
                        <div className="text-lg font-bold text-green-500">{countdown.hours.toString().padStart(2, '0')}</div>
                        <div className="text-[10px] text-muted-foreground">hrs</div>
                      </div>
                      <div className="bg-background/80 rounded-lg p-1">
                        <div className="text-lg font-bold text-red-500">{countdown.minutes.toString().padStart(2, '0')}</div>
                        <div className="text-[10px] text-muted-foreground">min</div>
                      </div>
                      <div className="bg-background/80 rounded-lg p-1">
                        <div className="text-lg font-bold text-green-500">{countdown.seconds.toString().padStart(2, '0')}</div>
                        <div className="text-[10px] text-muted-foreground">seg</div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Box visual */}
                <div className="relative mb-6">
                  <div
                    className={`
                      w-36 h-36 mx-auto
                      flex items-center justify-center
                      transform transition-transform duration-300 
                      ${canAfford ? "group-hover:scale-110 group-hover:rotate-3" : "grayscale-[30%] opacity-70"}
                    `}
                  >
                    <img 
                      src={boxImages[box.id]} 
                      alt={box.name}
                      className="w-full h-full object-contain drop-shadow-xl"
                    />
                    {!canAfford && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lock className="w-10 h-10 text-white/80 drop-shadow-lg" />
                      </div>
                    )}
                  </div>

                  {/* Sparkle effects on hover */}
                  {canAfford && (
                    <>
                      <Sparkles className="absolute top-0 left-1/4 w-5 h-5 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
                      <Sparkles className="absolute bottom-0 right-1/4 w-4 h-4 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse animation-delay-200" />
                    </>
                  )}
                </div>

                <h3 className="text-xl font-bold mb-2">{box.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{box.description}</p>

                {/* Drop rates */}
                <div className="space-y-2 mb-6">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Drop Rates</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {box.dropRates.common > 0 && (
                      <div className="flex justify-between px-2 py-1 rounded bg-gray-100">
                        <span className="text-gray-600">Common</span>
                        <span className="font-semibold">{box.dropRates.common}%</span>
                      </div>
                    )}
                    {box.dropRates.rare > 0 && (
                      <div className="flex justify-between px-2 py-1 rounded bg-blue-100">
                        <span className="text-blue-600">Rare</span>
                        <span className="font-semibold">{box.dropRates.rare}%</span>
                      </div>
                    )}
                    {box.dropRates.epic > 0 && (
                      <div className="flex justify-between px-2 py-1 rounded bg-purple-100">
                        <span className="text-purple-600">Epic</span>
                        <span className="font-semibold">{box.dropRates.epic}%</span>
                      </div>
                    )}
                    {box.dropRates.legendary > 0 && (
                      <div className="flex justify-between px-2 py-1 rounded bg-amber-100">
                        <span className="text-amber-600">Legendary</span>
                        <span className="font-semibold">{box.dropRates.legendary}%</span>
                      </div>
                    )}
                    {box.dropRates.christmas > 0 && (
                      <div className="flex justify-between px-2 py-1 rounded bg-gradient-to-r from-red-100 to-green-100 col-span-2">
                        <span className="text-red-600">🎄 Christmas</span>
                        <span className="font-semibold text-green-600">{box.dropRates.christmas}%</span>
                      </div>
                    )}
                  </div>
                  {isChristmas && (
                    <p className="text-xs text-green-600 font-medium mt-2">
                      ⚡ +50% minado vs Legendary
                    </p>
                  )}
                </div>

                {/* Price and button */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Zap className={`w-5 h-5 ${canAfford ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-2xl font-bold ${canAfford ? "text-gradient" : "text-muted-foreground"}`}>
                    {formatPrice(box.price)}
                  </span>
                  <span className="text-muted-foreground">DOGE</span>
                </div>

                <Button
                  variant={box.id === "legendary" || box.id === "christmas" ? "hero" : "default"}
                  className={`w-full ${!canAfford ? "opacity-50" : ""} ${isChristmas ? "bg-gradient-to-r from-red-500 via-green-500 to-red-500 hover:from-red-600 hover:via-green-600 hover:to-red-600" : ""}`}
                  onClick={() => handleOpenBox(box)}
                  disabled={!canAfford}
                >
                  {canAfford ? (
                    <>
                      <Gift className="w-4 h-4" />
                      {isChristmas ? "🎁 Abrir Regalo" : "Open Box"}
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Need {formatPrice(box.price - depositBalance)} more
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <MysteryBoxModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        boxType={selectedBox}
      />
    </section>
  );
};

export default MysteryBoxSection;
