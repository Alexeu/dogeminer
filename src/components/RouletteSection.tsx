import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDogeBalance } from "@/contexts/DogeBalanceContext";
import { useInventory } from "@/contexts/InventoryContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Gift, Coins, Trophy, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

import boxCommon from "@/assets/box-common.png";
import boxRare from "@/assets/box-rare.png";
import boxLegendary from "@/assets/box-legendary.png";

interface Prize {
  id: string;
  name: string;
  type: "box" | "doge" | "none";
  value: string;
  color: string;
  icon: React.ReactNode;
  probability: number;
}

const prizes: Prize[] = [
  { id: "common", name: "Common Box", type: "box", value: "common", color: "#6b7280", icon: <Gift className="w-6 h-6" />, probability: 50 },
  { id: "rare", name: "Rare Box", type: "box", value: "rare", color: "#3b82f6", icon: <Gift className="w-6 h-6" />, probability: 15 },
  { id: "doge3", name: "3 DOGE", type: "doge", value: "3", color: "#22c55e", icon: <Coins className="w-6 h-6" />, probability: 10 },
  { id: "doge5", name: "5 DOGE", type: "doge", value: "5", color: "#f59e0b", icon: <Coins className="w-6 h-6" />, probability: 5 },
  { id: "doge8", name: "8 DOGE", type: "doge", value: "8", color: "#eab308", icon: <Coins className="w-6 h-6" />, probability: 2 },
  { id: "legendary", name: "Legendary Box", type: "box", value: "legendary", color: "#a855f7", icon: <Trophy className="w-6 h-6" />, probability: 0.5 },
  { id: "none", name: "Try Again", type: "none", value: "0", color: "#ef4444", icon: <Sparkles className="w-6 h-6" />, probability: 17.5 },
];

// Create 50 wheel segments distributed by probability
// Common Box: 50% = 25 segments, Rare Box: 15% = 7 segments, 3 DOGE: 10% = 5 segments
// 5 DOGE: 5% = 3 segments, 8 DOGE: 2% = 1 segment, Legendary: 0.5% = 1 segment, None: 17.5% = 8 segments
const createWheelSegments = (): Prize[] => {
  const segments: Prize[] = [];
  const distribution: { prize: Prize; count: number }[] = [
    { prize: prizes[0], count: 25 }, // Common Box - 50%
    { prize: prizes[6], count: 8 },  // Try Again - 17.5%
    { prize: prizes[1], count: 7 },  // Rare Box - 15%
    { prize: prizes[2], count: 5 },  // 3 DOGE - 10%
    { prize: prizes[3], count: 3 },  // 5 DOGE - 5%
    { prize: prizes[4], count: 1 },  // 8 DOGE - 2%
    { prize: prizes[5], count: 1 },  // Legendary Box - 0.5%
  ];
  
  // Interleave segments for visual variety
  let segmentIndex = 0;
  while (segments.length < 50) {
    for (const { prize, count } of distribution) {
      const currentCount = segments.filter(s => s.id === prize.id).length;
      if (currentCount < count) {
        segments.push({ ...prize, id: `${prize.id}-${segmentIndex}` });
        segmentIndex++;
        if (segments.length >= 50) break;
      }
    }
  }
  
  return segments;
};

const wheelSegments = createWheelSegments();

interface RouletteResult {
  prize_type: string;
  prize_value: string;
  box_type?: string;
  doge_amount?: number;
  character_name?: string;
  character_rarity?: string;
}

const RouletteSection = () => {
  const { t } = useLanguage();
  const { depositBalance, refreshBalance } = useDogeBalance();
  const { refreshInventory } = useInventory();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<RouletteResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  const spinRoulette = async () => {
    if (depositBalance < 3) {
      toast.error(t('roulette.insufficientBalance'));
      return;
    }

    setIsSpinning(true);
    setShowResult(false);
    setResult(null);

    try {
      const { data, error } = await supabase.rpc('spin_roulette');

      if (error) throw error;

      const response = data as { success: boolean; prize_type: string; prize_value: string; box_type?: string; doge_amount?: number; character_name?: string; character_rarity?: string; error?: string };

      if (!response.success) {
        toast.error(response.error || t('roulette.error'));
        setIsSpinning(false);
        return;
      }

      // Find matching segments for the prize won
      const matchingIndices = wheelSegments
        .map((seg, i) => ({ seg, i }))
        .filter(({ seg }) => {
          if (response.prize_type === 'box') return seg.type === 'box' && seg.value === response.prize_value;
          if (response.prize_type === 'doge') return seg.type === 'doge' && seg.value === response.prize_value;
          return seg.type === 'none';
        })
        .map(({ i }) => i);

      // Pick a random segment from matching ones
      const targetIndex = matchingIndices[Math.floor(Math.random() * matchingIndices.length)] || 0;
      
      // Calculate angle - each segment is 360/50 = 7.2 degrees
      const segmentAngle = 360 / wheelSegments.length;
      const targetAngle = targetIndex * segmentAngle + segmentAngle * (0.3 + Math.random() * 0.4);
      
      const fullSpins = 5 + Math.floor(Math.random() * 3); // 5-7 full spins
      const newRotation = rotation + (fullSpins * 360) + (360 - targetAngle);

      setRotation(newRotation);
      setResult(response);

      // Show result after spin animation
      setTimeout(() => {
        setIsSpinning(false);
        setShowResult(true);
        refreshBalance();
        refreshInventory();

        // Show appropriate toast
        if (response.prize_type === 'box' && response.character_name) {
          toast.success(`${t('roulette.wonBox').replace('{box}', response.prize_value)} - ${response.character_name} (${response.character_rarity})`);
        } else if (response.prize_type === 'doge') {
          toast.success(t('roulette.wonDoge').replace('{amount}', response.doge_amount?.toString() || '0'));
        } else {
          toast.info(t('roulette.noWin'));
        }
      }, 5000);

    } catch (error) {
      console.error('Error spinning roulette:', error);
      toast.error(t('roulette.error'));
      setIsSpinning(false);
    }
  };

  const getBoxImage = (boxType: string) => {
    switch (boxType) {
      case 'common': return boxCommon;
      case 'rare': return boxRare;
      case 'legendary': return boxLegendary;
      default: return boxCommon;
    }
  };

  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="border-primary/20 bg-card/80 backdrop-blur-sm overflow-hidden">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent flex items-center justify-center gap-2">
              <Sparkles className="w-8 h-8 text-yellow-400" />
              {t('roulette.title')}
              <Sparkles className="w-8 h-8 text-yellow-400" />
            </CardTitle>
            <p className="text-muted-foreground mt-2">{t('roulette.subtitle')}</p>
          </CardHeader>

          <CardContent className="flex flex-col items-center gap-8">
            {/* Wheel Container */}
            <div className="relative w-80 h-80 md:w-96 md:h-96">
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
                <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[30px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-lg" />
              </div>

              {/* Wheel */}
              <motion.div
                ref={wheelRef}
                className="w-full h-full rounded-full border-8 border-yellow-500 shadow-2xl overflow-hidden"
                style={{
                  background: (() => {
                    const segmentAngle = 100 / wheelSegments.length; // Each segment is equal size
                    const gradientParts = wheelSegments.map((prize, i) => {
                      const start = i * segmentAngle;
                      const end = (i + 1) * segmentAngle;
                      return `${prize.color} ${start}% ${end}%`;
                    });
                    return `conic-gradient(${gradientParts.join(', ')})`;
                  })(),
                }}
                animate={{ rotate: rotation }}
                transition={{ duration: 5, ease: [0.2, 0.8, 0.3, 1] }}
              >
                {/* Prize labels - show every few segments to avoid overcrowding */}
                {wheelSegments.map((prize, i) => {
                  // Only show label every 5 segments to avoid clutter
                  if (i % 5 !== 0) return null;
                  const segmentAngle = 360 / wheelSegments.length;
                  const angle = i * segmentAngle + segmentAngle / 2;
                  return (
                    <div
                      key={`label-${i}`}
                      className="absolute top-1/2 left-1/2 w-1/2 h-0.5 origin-left"
                      style={{ transform: `rotate(${angle}deg)` }}
                    >
                      <div className="absolute right-4 -translate-y-1/2 text-white font-bold whitespace-nowrap drop-shadow-lg text-[7px] md:text-[9px]">
                        {prize.type === 'box' ? (
                          <span>{prize.value === 'common' ? '📦' : prize.value === 'rare' ? '💎' : '👑'}</span>
                        ) : prize.type === 'doge' ? (
                          <span>🪙</span>
                        ) : (
                          <span>❌</span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Center decoration */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-4 border-white shadow-lg flex items-center justify-center">
                  <Coins className="w-8 h-8 text-white" />
                </div>
              </motion.div>

              {/* Glow effect when spinning */}
              {isSpinning && (
                <div className="absolute inset-0 rounded-full animate-pulse bg-yellow-400/20" />
              )}
            </div>

            {/* Prize Legend */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-2xl">
              {prizes.filter(p => p.type !== 'none').map((prize) => (
                <div
                  key={prize.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-sm"
                  style={{ borderLeft: `4px solid ${prize.color}` }}
                >
                  {prize.icon}
                  <div className="font-medium">{prize.type === 'box' ? t(`roulette.prize.${prize.value}Box`) : `${prize.value} DOGE`}</div>
                </div>
              ))}
            </div>

            {/* Spin Button */}
            <div className="flex flex-col items-center gap-4">
              <Button
                onClick={spinRoulette}
                disabled={isSpinning || depositBalance < 3}
                size="lg"
                className="text-xl px-12 py-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold shadow-lg"
              >
                {isSpinning ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    {t('roulette.spinning')}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 mr-2" />
                    {t('roulette.spin')} (3 DOGE)
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground">
                {t('roulette.balance')}: <span className="font-bold text-primary">{depositBalance.toFixed(4)} DOGE</span>
              </p>
            </div>

            {/* Result Modal */}
            <AnimatePresence>
              {showResult && result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                  onClick={() => setShowResult(false)}
                >
                  <motion.div
                    initial={{ y: 50 }}
                    animate={{ y: 0 }}
                    className="bg-card border border-primary/30 rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {result.prize_type === 'box' ? (
                      <>
                        <Gift className="w-24 h-24 mx-auto mb-4 text-primary animate-bounce" />
                        <h3 className="text-2xl font-bold text-primary mb-2">
                          🎉 {t('roulette.congratulations')}!
                        </h3>
                        <p className="text-lg mb-2">
                          {t('roulette.youWon')} <span className="font-bold capitalize">{result.box_type}</span> Box!
                        </p>
                        {result.character_name && (
                          <div className="mt-4 p-4 bg-primary/10 rounded-xl">
                            <p className="text-sm text-muted-foreground">{t('roulette.characterReceived') || 'Character received:'}</p>
                            <p className="text-xl font-bold text-primary">{result.character_name}</p>
                            <p className="text-sm text-muted-foreground">({result.character_rarity})</p>
                          </div>
                        )}
                      </>
                    ) : result.prize_type === 'doge' ? (
                      <>
                        <Coins className="w-24 h-24 mx-auto mb-4 text-yellow-400 animate-bounce" />
                        <h3 className="text-2xl font-bold text-primary mb-2">
                          🎉 {t('roulette.congratulations')}!
                        </h3>
                        <p className="text-lg">
                          {t('roulette.youWon')} <span className="font-bold text-yellow-400">{result.doge_amount} DOGE</span>!
                        </p>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-24 h-24 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-2xl font-bold text-muted-foreground mb-2">
                          {t('roulette.tryAgain')}
                        </h3>
                        <p className="text-lg text-muted-foreground">
                          {t('roulette.betterLuck')}
                        </p>
                      </>
                    )}
                    <Button
                      onClick={() => setShowResult(false)}
                      className="mt-6"
                      variant="outline"
                    >
                      {t('roulette.close')}
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default RouletteSection;
