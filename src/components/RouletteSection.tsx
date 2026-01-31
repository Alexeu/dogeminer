import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDogeBalance } from "@/contexts/DogeBalanceContext";
import { useInventory } from "@/contexts/InventoryContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Gift, Coins, Trophy, Sparkles, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Prize {
  id: string;
  name: string;
  nameEs: string;
  type: "box" | "doge" | "none";
  value: string;
  color: string;
  textColor: string;
  icon: string;
  probability: number;
}

const prizes: Prize[] = [
  { id: "common", name: "Common Box", nameEs: "Común", type: "box", value: "common", color: "#4B5563", textColor: "#fff", icon: "📦", probability: 50 },
  { id: "rare", name: "Rare Box", nameEs: "Rara", type: "box", value: "rare", color: "#3B82F6", textColor: "#fff", icon: "💎", probability: 15 },
  { id: "doge3", name: "3 DOGE", nameEs: "3 DOGE", type: "doge", value: "3", color: "#10B981", textColor: "#fff", icon: "🪙", probability: 10 },
  { id: "doge5", name: "5 DOGE", nameEs: "5 DOGE", type: "doge", value: "5", color: "#F59E0B", textColor: "#000", icon: "🪙", probability: 5 },
  { id: "doge8", name: "8 DOGE", nameEs: "8 DOGE", type: "doge", value: "8", color: "#FBBF24", textColor: "#000", icon: "💰", probability: 2 },
  { id: "legendary", name: "Legendary", nameEs: "Legendaria", type: "box", value: "legendary", color: "#A855F7", textColor: "#fff", icon: "👑", probability: 0.5 },
  { id: "none", name: "Try Again", nameEs: "Sin Premio", type: "none", value: "0", color: "#EF4444", textColor: "#fff", icon: "❌", probability: 17.5 },
];

// Create wheel segments based on probability (each segment = 2%)
// 50 segments total: Common(25), None(9), Rare(7), 3DOGE(5), 5DOGE(2), 8DOGE(1), Legendary(1) = 50
const createWheelSegments = (): Prize[] => {
  const segments: Prize[] = [];
  
  // Distribute segments evenly around the wheel for visual variety
  const distribution = [
    'common', 'none', 'rare', 'common', 'doge3',     // 0-4
    'common', 'none', 'common', 'rare', 'common',     // 5-9
    'doge3', 'common', 'none', 'rare', 'common',      // 10-14
    'doge5', 'common', 'none', 'common', 'rare',      // 15-19
    'common', 'doge3', 'common', 'none', 'legendary', // 20-24 (legendary at 24)
    'common', 'rare', 'common', 'none', 'doge3',      // 25-29
    'common', 'none', 'common', 'rare', 'common',     // 30-34
    'doge8', 'common', 'none', 'rare', 'common',      // 35-39 (doge8 at 35)
    'doge3', 'common', 'none', 'common', 'doge5',     // 40-44
    'common', 'none', 'common', 'rare', 'common',     // 45-49
  ];
  
  for (let i = 0; i < 50; i++) {
    const prizeId = distribution[i];
    const prize = prizes.find(p => p.id === prizeId)!;
    segments.push({ ...prize, id: `${prize.id}-${i}` });
  }
  
  return segments;
};

const wheelSegments = createWheelSegments();
const SEGMENT_ANGLE = 360 / 50; // 7.2 degrees per segment

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
      
      // Calculate rotation - pointer is at top (0°), wheel rotates clockwise
      // Segment 0 starts at top and goes clockwise
      const segmentCenter = targetIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
      const fullSpins = 5 + Math.floor(Math.random() * 3);
      // We want the segment to end up at the top (under the pointer)
      // So we rotate by (360 - segmentCenter) to bring it to top, plus full spins
      const newRotation = rotation + (fullSpins * 360) + (360 - segmentCenter);

      setRotation(newRotation);
      setResult(response);

      setTimeout(() => {
        setIsSpinning(false);
        setShowResult(true);
        refreshBalance();
        refreshInventory();

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
            <div className="relative w-80 h-80 md:w-[420px] md:h-[420px]">
              {/* Outer glow ring */}
              <div className="absolute inset-[-8px] rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 opacity-60 blur-md animate-pulse" />
              
              {/* Pointer - Modern arrow design */}
              <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 z-30">
                <div className="relative">
                  <div className="w-0 h-0 border-l-[18px] border-r-[18px] border-t-[35px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]" />
                  <div className="absolute top-[2px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[25px] border-l-transparent border-r-transparent border-t-yellow-300" />
                </div>
              </div>

              {/* Wheel outer border */}
              <div className="absolute inset-0 rounded-full border-[6px] border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.5),inset_0_0_20px_rgba(0,0,0,0.3)]" />

              {/* Wheel */}
              <motion.div
                className="w-full h-full rounded-full overflow-hidden relative"
                animate={{ rotate: rotation }}
                transition={{ duration: 5, ease: [0.2, 0.8, 0.3, 1] }}
              >
                {/* SVG Wheel with segments */}
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <defs>
                    {/* Gradients for each prize type */}
                    <radialGradient id="wheelGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                      <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
                    </radialGradient>
                  </defs>
                  
                  {wheelSegments.map((prize, index) => {
                    const startAngle = index * SEGMENT_ANGLE - 90; // -90 to start from top
                    const endAngle = (index + 1) * SEGMENT_ANGLE - 90;
                    const midAngle = (startAngle + endAngle) / 2;
                    
                    // Calculate path for segment
                    const startRad = (startAngle * Math.PI) / 180;
                    const endRad = (endAngle * Math.PI) / 180;
                    
                    const x1 = 100 + 95 * Math.cos(startRad);
                    const y1 = 100 + 95 * Math.sin(startRad);
                    const x2 = 100 + 95 * Math.cos(endRad);
                    const y2 = 100 + 95 * Math.sin(endRad);
                    
                    const largeArc = SEGMENT_ANGLE > 180 ? 1 : 0;
                    
                    const pathD = `M 100 100 L ${x1} ${y1} A 95 95 0 ${largeArc} 1 ${x2} ${y2} Z`;
                    
                    // Calculate text position (at 70% radius)
                    const textRad = (midAngle * Math.PI) / 180;
                    const textX = 100 + 65 * Math.cos(textRad);
                    const textY = 100 + 65 * Math.sin(textRad);
                    
                    // Only show text every 2 segments to avoid overcrowding
                    const showText = index % 2 === 0;
                    
                    return (
                      <g key={prize.id}>
                        {/* Segment */}
                        <path
                          d={pathD}
                          fill={prize.color}
                          stroke="rgba(255,255,255,0.3)"
                          strokeWidth="0.5"
                        />
                        {/* Segment highlight */}
                        <path
                          d={pathD}
                          fill="url(#wheelGlow)"
                        />
                        
                        {/* Text label */}
                        {showText && (
                          <g transform={`translate(${textX}, ${textY}) rotate(${midAngle + 90})`}>
                            <text
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fill={prize.textColor}
                              fontSize="5"
                              fontWeight="bold"
                              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                            >
                              {prize.icon}
                            </text>
                            <text
                              y="6"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fill={prize.textColor}
                              fontSize="3.5"
                              fontWeight="600"
                              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                            >
                              {prize.type === 'doge' ? `${prize.value}D` : prize.nameEs.substring(0, 6)}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                  
                  {/* Center circle overlay */}
                  <circle cx="100" cy="100" r="20" fill="url(#centerGradient)" />
                  <defs>
                    <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FBBF24" />
                      <stop offset="50%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#D97706" />
                    </linearGradient>
                  </defs>
                  <circle cx="100" cy="100" r="18" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                  <circle cx="100" cy="100" r="15" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
                  
                  {/* Center icon */}
                  <text x="100" y="103" textAnchor="middle" fontSize="12" fill="#fff" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                    🎰
                  </text>
                </svg>
              </motion.div>

              {/* Spinning glow effect */}
              {isSpinning && (
                <div className="absolute inset-0 rounded-full animate-pulse bg-yellow-400/20 pointer-events-none" />
              )}
            </div>

            {/* Prize Legend */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full max-w-2xl">
              {prizes.map((prize) => (
                <div
                  key={prize.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-xs md:text-sm"
                  style={{ borderLeft: `4px solid ${prize.color}` }}
                >
                  <span className="text-lg">{prize.icon}</span>
                  <span className="font-medium">
                    {prize.type === 'box' ? prize.nameEs : prize.type === 'doge' ? `${prize.value} DOGE` : prize.nameEs}
                  </span>
                </div>
              ))}
            </div>

            {/* Spin Button */}
            <div className="flex flex-col items-center gap-4">
              <Button
                onClick={spinRoulette}
                disabled={isSpinning || depositBalance < 3}
                size="lg"
                className="text-xl px-12 py-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold shadow-lg hover:shadow-xl transition-all"
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
                        <X className="w-24 h-24 mx-auto mb-4 text-muted-foreground" />
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
