import { useState } from "react";
import { Button } from "@/components/ui/button";
import { boxTypes, BoxType } from "@/data/bonkData";
import MysteryBoxModal from "@/components/MysteryBoxModal";
import { Gift, Sparkles, Zap } from "lucide-react";

const MysteryBoxSection = () => {
  const [selectedBox, setSelectedBox] = useState<BoxType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenBox = (box: BoxType) => {
    setSelectedBox(box);
    setIsModalOpen(true);
  };

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-bonk-amber/5 rounded-full blur-3xl" />
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
            Try your luck and discover rare BONK characters! Each box has different
            drop rates for common to legendary BONKs.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {boxTypes.map((box, index) => (
            <div
              key={box.id}
              className="glass rounded-2xl p-6 text-center hover:shadow-bonk-lg transition-all duration-300 hover:-translate-y-2 animate-slide-up group"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Box visual */}
              <div className="relative mb-6">
                <div
                  className={`
                    w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br ${box.gradient}
                    flex items-center justify-center shadow-lg
                    transform transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3
                  `}
                >
                  {/* Box lid */}
                  <div
                    className={`
                      absolute -top-3 left-2 right-2 h-8 rounded-t-xl bg-gradient-to-br ${box.gradient}
                      shadow-md
                    `}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-t-xl" />
                  </div>

                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-2xl" />

                  {/* Icon */}
                  <Gift className="w-12 h-12 text-white/90 drop-shadow-lg" />
                </div>

                {/* Sparkle effects on hover */}
                <Sparkles className="absolute top-0 left-1/4 w-5 h-5 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
                <Sparkles className="absolute bottom-0 right-1/4 w-4 h-4 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse animation-delay-200" />
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
                <Zap className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold text-gradient">{box.price}</span>
                <span className="text-muted-foreground">BONK</span>
              </div>

              <Button
                variant={box.id === "legendary" ? "hero" : "default"}
                className="w-full"
                onClick={() => handleOpenBox(box)}
              >
                <Gift className="w-4 h-4" />
                Open Box
              </Button>
            </div>
          ))}
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
