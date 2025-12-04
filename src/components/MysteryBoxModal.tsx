import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BoxType, BonkCharacter, getRandomCharacter, rarityConfig } from "@/data/bonkData";
import { Gift, Sparkles } from "lucide-react";

interface MysteryBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  boxType: BoxType | null;
}

type AnimationPhase = "idle" | "shaking" | "opening" | "revealing" | "revealed";

const MysteryBoxModal = ({ isOpen, onClose, boxType }: MysteryBoxModalProps) => {
  const [phase, setPhase] = useState<AnimationPhase>("idle");
  const [revealedCharacter, setRevealedCharacter] = useState<BonkCharacter | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setPhase("idle");
      setRevealedCharacter(null);
    }
  }, [isOpen]);

  const handleOpen = () => {
    if (!boxType) return;

    setPhase("shaking");

    setTimeout(() => {
      setPhase("opening");
    }, 1500);

    setTimeout(() => {
      const character = getRandomCharacter(boxType.dropRates);
      setRevealedCharacter(character);
      setPhase("revealing");
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
              <p className="text-muted-foreground text-center mb-6">{boxType.description}</p>

              {phase === "idle" && (
                <Button variant="hero" size="lg" onClick={handleOpen}>
                  <Gift className="w-5 h-5" />
                  Open for {boxType.price} BONK
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
                className={`absolute w-64 h-64 rounded-full bg-gradient-radial ${config.color} opacity-30 blur-3xl`}
              />

              {/* Character image */}
              <div className="relative">
                <img
                  src={revealedCharacter.image}
                  alt={revealedCharacter.name}
                  className={`w-40 h-40 object-contain drop-shadow-2xl animate-float`}
                />
              </div>

              {/* Character info */}
              <h3 className="text-2xl font-bold mt-4">{revealedCharacter.name}</h3>

              <span
                className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${config.bgColor} ${config.textColor} mt-2`}
              >
                {config.label}
              </span>

              <p className="text-muted-foreground mt-2">
                Mining Rate:{" "}
                <span className="font-semibold text-gradient">
                  {revealedCharacter.miningRate} BONK/day
                </span>
              </p>

              <div className="flex gap-3 mt-6">
                <Button variant="heroOutline" onClick={handleClose}>
                  Close
                </Button>
                <Button variant="hero" onClick={() => {
                  setPhase("idle");
                  setRevealedCharacter(null);
                }}>
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
