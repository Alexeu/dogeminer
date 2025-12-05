import { useInventory } from "@/contexts/InventoryContext";
import { rarityConfig } from "@/data/dogeData";
import { Button } from "@/components/ui/button";
import { Play, Gift, Clock, Coins } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const MINING_DURATION = 60 * 60 * 1000; // 1 hour

const InventorySection = () => {
  const { inventory, startMining, claimRewards, getClaimableAmount } = useInventory();
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [startingId, setStartingId] = useState<string | null>(null);

  const handleStartMining = async (characterId: string) => {
    setStartingId(characterId);
    const success = await startMining(characterId);
    setStartingId(null);
    
    if (success) {
      toast.success("¡Minado iniciado! Vuelve en 1 hora para reclamar.");
    } else {
      toast.error("Error al iniciar minado");
    }
  };

  const handleClaim = async (characterId: string) => {
    setClaimingId(characterId);
    const amount = await claimRewards(characterId);
    setClaimingId(null);
    
    if (amount > 0) {
      toast.success(`¡Has reclamado ${amount.toFixed(4)} DOGE!`);
    } else {
      toast.error("Error al reclamar recompensas");
    }
  };

  const getMiningProgress = (item: typeof inventory[0]) => {
    if (!item.miningStartTime) return 0;
    const elapsed = Date.now() - item.miningStartTime;
    return Math.min((elapsed / MINING_DURATION) * 100, 100);
  };

  const getTimeRemaining = (item: typeof inventory[0]) => {
    if (!item.miningStartTime) return null;
    const elapsed = Date.now() - item.miningStartTime;
    const remaining = Math.max(MINING_DURATION - elapsed, 0);
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (inventory.length === 0) {
    return (
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tu <span className="text-primary">Colección</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Aún no tienes personajes. ¡Abre Mystery Boxes para comenzar tu colección!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Tu <span className="text-primary">Colección</span>
        </h2>
        <p className="text-muted-foreground text-center mb-12">
          Pon a minar tus personajes y reclama las ganancias cada hora
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {inventory.map((item) => {
            const config = rarityConfig[item.character.rarity];
            const progress = getMiningProgress(item);
            const timeRemaining = getTimeRemaining(item);
            const isMining = item.miningStartTime !== null;
            const canClaim = item.accumulatedDoge > 0;
            const claimableAmount = getClaimableAmount(item.character.id);
            const isClaiming = claimingId === item.character.id;
            const isStarting = startingId === item.character.id;

            return (
              <div
                key={item.character.id}
                className={`relative bg-card rounded-2xl p-4 border border-border overflow-hidden transition-all hover:scale-[1.02] ${
                  canClaim ? "ring-2 ring-primary animate-pulse" : ""
                }`}
              >
                {/* Rarity gradient background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-10`}
                />

                {/* Content */}
                <div className="relative z-10">
                  {/* Character image */}
                  <div className="relative w-full aspect-square mb-4 rounded-xl overflow-hidden bg-background/50">
                    <img
                      src={item.character.image}
                      alt={item.character.name}
                      className="w-full h-full object-contain"
                    />
                    {/* Quantity badge */}
                    {item.quantity > 1 && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-sm font-bold px-2 py-1 rounded-full">
                        x{item.quantity}
                      </div>
                    )}
                  </div>

                  {/* Character info */}
                  <h3 className="font-bold text-lg mb-1">{item.character.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${config.bgColor} ${config.textColor}`}
                    >
                      {config.label}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Coins className="w-3 h-3" />
                      {(item.character.miningRate * item.quantity).toFixed(4)} DOGE/hora
                    </span>
                  </div>

                  {/* Mining progress or action button */}
                  {isMining && !canClaim ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {timeRemaining}
                        </span>
                        <span className="text-primary font-medium">
                          +{claimableAmount.toFixed(4)} DOGE
                        </span>
                      </div>
                      <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-1000"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  ) : canClaim ? (
                    <Button
                      onClick={() => handleClaim(item.character.id)}
                      disabled={isClaiming}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      {isClaiming ? "Reclamando..." : `Reclamar ${item.accumulatedDoge.toFixed(4)} DOGE`}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleStartMining(item.character.id)}
                      disabled={isStarting}
                      variant="outline"
                      className="w-full"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {isStarting ? "Iniciando..." : "Iniciar Minado"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default InventorySection;