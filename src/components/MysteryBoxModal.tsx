import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BoxType, BonkCharacter, getRandomCharacter, rarityConfig, isMythicCharacter } from "@/data/bonkData";
import { useBonkBalance } from "@/contexts/BonkBalanceContext";
import { useInventory } from "@/contexts/InventoryContext";
import { Gift, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface MysteryBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  boxType: BoxType | null;
}

type AnimationPhase = "idle" | "shaking" | "opening" | "revealing" | "revealed";

const MysteryBoxModal = ({ isOpen, onClose, boxType }: MysteryBoxModalProps) => {
  const [phase, setPhase] = useState<AnimationPhase>("idle");
  const [revealedCharacter, setRevealedCharacter] = useState<BonkCharacter | null>(null);
  const { balance, subtractBalance } = useBonkBalance();
  const { addToInventory } = useInventory();

  useEffect(() => {
    if (!isOpen) {
      setPhase("idle");
      setRevealedCharacter(null);
    }
  }, [isOpen]);

  const handleOpen = () => {
    if (!boxType) return;

    // Check if user has enough balance
    if (balance < boxType.price) {
      toast.error("Not enough BONK!", {
        description: `You need ${boxType.price.toLocaleString()} BONK to open this box.`,
      });
      return;
    }

    // Subtract balance
    const success = subtractBalance(boxType.price);
    if (!success) return;

    setPhase("shaking");

    setTimeout(() => {
      setPhase("opening");
    }, 1500);

    setTimeout(() => {
      const character = getRandomCharacter(boxType.dropRates, boxType.id);
      setRevealedCharacter(character);
      setPhase("revealing");

      // Add character to inventory
      addToInventory(character);
      
      const isMythic = isMythicCharacter(character.id);
      toast.success(isMythic ? `🌟 ¡¡MYTHIC!! 🌟` : `¡Nuevo personaje!`, {
        description: `${character.name} añadido a tu colección`,
      });
    }, 2500);

    setTimeout(() => {
      setPhase("revealed");
    }, 3000);
  };

  const handleClose = () => {
    setPhase("idle");
    setRevealedCharacter(null);
    onClose();
  };

  if (!boxType) return null;

  const config = revealedCharacter ? rarityConfig[revealedCharacter.rarity] : null;
  const canAfford = balance >= boxType.price;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border overflow-hidden">
        <div className="relative min-h-[400px] flex flex-col items-center justify-center p-6">
          {/* Background effects */}
          <div className="absolute inset-0 overflow-hidden">
            {phase === "revealing" || phase === "revealed" ? (
              <div
                className={`absolute inset-0 bg-gradient-to-b ${config?.color} opacity-20 animate-pulse`}
              />
            ) : (
              <div
                className={`absolute inset-0 bg-gradient-to-b ${boxType.gradient} opacity-10`}
              />
            )}
          </div>

          {/* Box animation phases */}
          {(phase === "idle" || phase === "shaking" || phase === "opening") && (
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`
                  relative w-40 h-40 rounded-2xl bg-gradient-to-br ${boxType.gradient} 
                  flex items-center justify-center shadow-2xl
                  ${phase === "shaking" ? "animate-box-shake" : ""}
                  ${phase === "opening" ? "animate-box-open" : ""}
                `}
              >
                {/* Box lid */}
                <div
                  className={`
                    absolute -top-4 left-0 right-0 h-10 rounded-t-2xl bg-gradient-to-br ${boxType.gradient}
                    shadow-lg transform-origin-bottom
                    ${phase === "opening" ? "animate-lid-open" : ""}
                  `}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-t-2xl" />
                </div>

                {/* Box shine */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-2xl" />

                {/* Question mark */}
                <span className="text-6xl font-bold text-white/90 drop-shadow-lg">?</span>

                {/* Sparkles */}
                {phase === "shaking" && (
                  <>
                    <Sparkles className="absolute -top-6 -left-4 w-6 h-6 text-yellow-300 animate-sparkle" />
                    <Sparkles className="absolute -top-4 -right-6 w-5 h-5 text-yellow-200 animate-sparkle animation-delay-200" />
                    <Sparkles className="absolute -bottom-4 -left-6 w-4 h-4 text-yellow-400 animate-sparkle animation-delay-400" />
                    <Sparkles className="absolute -bottom-6 -right-4 w-6 h-6 text-yellow-300 animate-sparkle animation-delay-600" />
                  </>
                )}
              </div>

              <h3 className="text-2xl font-bold mt-6 mb-2">{boxType.name}</h3>
              <p className="text-muted-foreground text-center mb-4">{boxType.description}</p>

              {/* Price display */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-xl font-bold ${canAfford ? "text-gradient" : "text-destructive"}`}>
                  {boxType.price.toLocaleString()} BONK
                </span>
                {!canAfford && (
                  <AlertCircle className="w-5 h-5 text-destructive" />
                )}
              </div>

              {phase === "idle" && (
                <Button
                  variant="hero"
                  size="lg"
                  onClick={handleOpen}
                  disabled={!canAfford}
                  className={!canAfford ? "opacity-50 cursor-not-allowed" : ""}
                >
                  <Gift className="w-5 h-5" />
                  {canAfford ? "Open Box" : "Not Enough BONK"}
                </Button>
              )}

              {phase === "shaking" && (
                <p className="text-primary font-semibold animate-pulse">Opening...</p>
              )}
            </div>
          )}

          {/* Revealing animation */}
          {phase === "revealing" && (
            <div className="relative z-10 animate-reveal-burst">
              <div className="w-48 h-48 rounded-full bg-gradient-radial from-white via-white/50 to-transparent flex items-center justify-center">
                <Sparkles className="w-20 h-20 text-primary animate-spin" />
              </div>
            </div>
          )}

          {/* Revealed character */}
          {phase === "revealed" && revealedCharacter && config && (
            <div className="relative z-10 flex flex-col items-center animate-slide-up">
              {/* Glow effect */}
              <div
                className={`absolute w-64 h-64 rounded-full bg-gradient-radial ${config.color} opacity-30 blur-3xl ${
                  isMythicCharacter(revealedCharacter.id) ? "animate-pulse" : ""
                }`}
              />

              {/* Mythic rainbow border */}
              {isMythicCharacter(revealedCharacter.id) && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 opacity-50 blur-xl animate-spin" style={{ animationDuration: "3s" }} />
              )}

              {/* Character image */}
              <div className="relative">
                <img
                  src={revealedCharacter.image}
                  alt={revealedCharacter.name}
                  className={`w-40 h-40 object-contain drop-shadow-2xl animate-float ${
                    isMythicCharacter(revealedCharacter.id) ? "brightness-125 contrast-110" : ""
                  }`}
                />
              </div>

              {/* Character info */}
              <h3 className={`text-2xl font-bold mt-4 ${
                isMythicCharacter(revealedCharacter.id) ? "bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent" : ""
              }`}>
                {revealedCharacter.name}
              </h3>

              <span
                className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold mt-2 ${
                  isMythicCharacter(revealedCharacter.id) 
                    ? "bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white"
                    : `${config.bgColor} ${config.textColor}`
                }`}
              >
                {isMythicCharacter(revealedCharacter.id) ? "✨ MYTHIC ✨" : config.label}
              </span>

              <p className="text-muted-foreground mt-2">
                Mining Rate:{" "}
                <span className="font-semibold text-gradient">
                  {revealedCharacter.miningRate} BONK/hora
                </span>
              </p>

              <div className="flex gap-3 mt-6">
                <Button variant="heroOutline" onClick={handleClose}>
                  Close
                </Button>
                <Button
                  variant="hero"
                  onClick={() => {
                    setPhase("idle");
                    setRevealedCharacter(null);
                  }}
                  disabled={balance < boxType.price}
                >
                  Open Another
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MysteryBoxModal;
