import { useState } from "react";
import { Button } from "@/components/ui/button";
import { boxTypes, BoxType } from "@/data/dogeData";
import { useDogeBalance } from "@/contexts/DogeBalanceContext";
import MysteryBoxModal from "@/components/MysteryBoxModal";
import { Gift, Sparkles, Zap, Lock } from "lucide-react";
import boxCommon from "@/assets/box-common.png";
import boxRare from "@/assets/box-rare.png";
import boxLegendary from "@/assets/box-legendary.png";

const boxImages: Record<string, string> = {
  common: boxCommon,
  rare: boxRare,
  legendary: boxLegendary,
};

const MysteryBoxSection = () => {
  const [selectedBox, setSelectedBox] = useState<BoxType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { depositBalance } = useDogeBalance();

  const handleOpenBox = (box: BoxType) => {
    setSelectedBox(box);
    setIsModalOpen(true);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `${(price / 1000).toFixed(1)}K`;
    }
    return price.toFixed(4);
  };

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

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {boxTypes.map((box, index) => {
            const canAfford = depositBalance >= box.price;
            
            return (
              <div
                key={box.id}
                className={`glass rounded-2xl p-6 text-center transition-all duration-300 animate-slide-up group ${
                  canAfford ? "hover:shadow-doge-lg hover:-translate-y-2" : "opacity-75"
                }`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
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
                    <div className="flex justify-between px-2 py-1 rounded bg-gray-100">
                      <span className="text-gray-600">Common</span>
                      <span className="font-semibold">{box.dropRates.common}%</span>
                    </div>
                    <div className="flex justify-between px-2 py-1 rounded bg-blue-100">
                      <span className="text-blue-600">Rare</span>
                      <span className="font-semibold">{box.dropRates.rare}%</span>
                    </div>
                    <div className="flex justify-between px-2 py-1 rounded bg-purple-100">
                      <span className="text-purple-600">Epic</span>
                      <span className="font-semibold">{box.dropRates.epic}%</span>
                    </div>
                    <div className="flex justify-between px-2 py-1 rounded bg-amber-100">
                      <span className="text-amber-600">Legendary</span>
                      <span className="font-semibold">{box.dropRates.legendary}%</span>
                    </div>
                  </div>
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
                  variant={box.id === "legendary" ? "hero" : "default"}
                  className={`w-full ${!canAfford ? "opacity-50" : ""}`}
                  onClick={() => handleOpenBox(box)}
                  disabled={!canAfford}
                >
                  {canAfford ? (
                    <>
                      <Gift className="w-4 h-4" />
                      Open Box
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
