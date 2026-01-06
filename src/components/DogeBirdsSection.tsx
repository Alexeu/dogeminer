import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDogeBalance } from "@/contexts/DogeBalanceContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Bird, Egg, Warehouse, ArrowUpCircle, RefreshCw, Coins } from "lucide-react";

// Import bird images
import birdYellow from "@/assets/bird-yellow.png";
import birdRed from "@/assets/bird-red.png";
import birdGreen from "@/assets/bird-green.png";
import birdBlue from "@/assets/bird-blue.png";
import birdBlack from "@/assets/bird-black.png";
import eggGolden from "@/assets/egg-golden.png";
import barnImage from "@/assets/barn.png";

interface BirdType {
  id: string;
  name: string;
  nameKey: string;
  image: string;
  price: number;
  eggsPerHour: number;
  color: string;
  gradient: string;
}

const birds: BirdType[] = [
  { id: "yellow", name: "Yellow Bird", nameKey: "birds.yellow", image: birdYellow, price: 4, eggsPerHour: 80, color: "#FCD34D", gradient: "from-yellow-400 to-yellow-500" },
  { id: "red", name: "Red Bird", nameKey: "birds.red", image: birdRed, price: 15, eggsPerHour: 380, color: "#EF4444", gradient: "from-red-400 to-red-500" },
  { id: "green", name: "Green Bird", nameKey: "birds.green", image: birdGreen, price: 45, eggsPerHour: 1900, color: "#22C55E", gradient: "from-green-400 to-green-500" },
  { id: "blue", name: "Blue Bird", nameKey: "birds.blue", image: birdBlue, price: 85, eggsPerHour: 6000, color: "#3B82F6", gradient: "from-blue-400 to-blue-500" },
  { id: "black", name: "Black Bird", nameKey: "birds.black", image: birdBlack, price: 250, eggsPerHour: 28000, color: "#1F2937", gradient: "from-gray-700 to-gray-900" },
];

const barnLevels = [
  { level: 1, capacity: 60000, upgradeCost: 0 },
  { level: 2, capacity: 200000, upgradeCost: 30 },
  { level: 3, capacity: 550000, upgradeCost: 65 },
  { level: 4, capacity: 1500000, upgradeCost: 150 },
];

interface UserBirds {
  [key: string]: number;
}

interface BarnInfo {
  level: number;
  eggs: number;
  lastCollectedAt: Date;
}

const DogeBirdsSection = () => {
  const { user } = useAuth();
  const { depositBalance, refreshBalance } = useDogeBalance();
  const { t } = useLanguage();
  
  const [userBirds, setUserBirds] = useState<UserBirds>({});
  const [barn, setBarn] = useState<BarnInfo>({ level: 1, eggs: 0, lastCollectedAt: new Date() });
  const [pendingEggs, setPendingEggs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [buyingBird, setBuyingBird] = useState<string | null>(null);
  const [upgradingBarn, setUpgradingBarn] = useState(false);
  const [collectingEggs, setCollectingEggs] = useState(false);
  const [convertingEggs, setConvertingEggs] = useState(false);

  const fetchUserData = useCallback(async () => {
    if (!user) return;
    
    // Fetch user birds
    const { data: birdsData } = await supabase
      .from("user_birds")
      .select("bird_type, quantity")
      .eq("user_id", user.id);
    
    if (birdsData) {
      const birdsMap: UserBirds = {};
      birdsData.forEach(bird => {
        birdsMap[bird.bird_type] = bird.quantity;
      });
      setUserBirds(birdsMap);
    }
    
    // Fetch barn info
    const { data: barnData } = await supabase
      .from("user_barn")
      .select("*")
      .eq("user_id", user.id)
      .single();
    
    if (barnData) {
      setBarn({
        level: barnData.level,
        eggs: Number(barnData.eggs),
        lastCollectedAt: new Date(barnData.last_collected_at)
      });
    }
  }, [user]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Calculate pending eggs in real-time
  useEffect(() => {
    const calculatePendingEggs = () => {
      let totalEggsPerHour = 0;
      birds.forEach(bird => {
        const quantity = userBirds[bird.id] || 0;
        totalEggsPerHour += bird.eggsPerHour * quantity;
      });
      
      const hoursElapsed = (Date.now() - barn.lastCollectedAt.getTime()) / (1000 * 60 * 60);
      const pending = Math.floor(totalEggsPerHour * hoursElapsed);
      setPendingEggs(pending);
    };
    
    calculatePendingEggs();
    const interval = setInterval(calculatePendingEggs, 1000);
    return () => clearInterval(interval);
  }, [userBirds, barn.lastCollectedAt]);

  const handleBuyBird = async (birdId: string, price: number) => {
    if (!user) return;
    
    if (depositBalance < price) {
      toast.error(t("birds.insufficientBalance"));
      return;
    }
    
    setBuyingBird(birdId);
    try {
      const { data, error } = await supabase.rpc("buy_bird", { bird_type_param: birdId });
      
      if (error) throw error;
      
      const result = data as { success: boolean; error?: string };
      
      if (result.success) {
        toast.success(t("birds.birdPurchased"));
        await fetchUserData();
        await refreshBalance();
      } else {
        toast.error(result.error || t("birds.purchaseFailed"));
      }
    } catch (error) {
      console.error("Error buying bird:", error);
      toast.error(t("birds.purchaseFailed"));
    } finally {
      setBuyingBird(null);
    }
  };

  const handleCollectEggs = async () => {
    if (!user || pendingEggs <= 0) return;
    
    setCollectingEggs(true);
    try {
      const { data, error } = await supabase.rpc("collect_eggs");
      
      if (error) throw error;
      
      const result = data as { success: boolean; eggs_collected?: number; error?: string };
      
      if (result.success) {
        toast.success(`${t("birds.eggsCollected")}: ${result.eggs_collected?.toLocaleString()} 🥚`);
        await fetchUserData();
      } else {
        toast.error(result.error || t("birds.collectFailed"));
      }
    } catch (error) {
      console.error("Error collecting eggs:", error);
      toast.error(t("birds.collectFailed"));
    } finally {
      setCollectingEggs(false);
    }
  };

  const handleUpgradeBarn = async () => {
    if (!user) return;
    
    const nextLevel = barnLevels.find(l => l.level === barn.level + 1);
    if (!nextLevel) {
      toast.error(t("birds.barnMaxLevel"));
      return;
    }
    
    if (depositBalance < nextLevel.upgradeCost) {
      toast.error(t("birds.insufficientBalance"));
      return;
    }
    
    setUpgradingBarn(true);
    try {
      const { data, error } = await supabase.rpc("upgrade_barn");
      
      if (error) throw error;
      
      const result = data as { success: boolean; new_level?: number; error?: string };
      
      if (result.success) {
        toast.success(`${t("birds.barnUpgraded")} ${result.new_level}! 🏠`);
        await fetchUserData();
        await refreshBalance();
      } else {
        toast.error(result.error || t("birds.upgradeFailed"));
      }
    } catch (error) {
      console.error("Error upgrading barn:", error);
      toast.error(t("birds.upgradeFailed"));
    } finally {
      setUpgradingBarn(false);
    }
  };

  const handleConvertEggs = async () => {
    if (!user || barn.eggs < 60000) {
      toast.error(t("birds.minEggsRequired"));
      return;
    }
    
    // Convert all available eggs (in multiples of 60000)
    const eggsToConvert = Math.floor(barn.eggs / 60000) * 60000;
    
    setConvertingEggs(true);
    try {
      const { data, error } = await supabase.rpc("convert_eggs_to_doge", { eggs_amount: eggsToConvert });
      
      if (error) throw error;
      
      const result = data as { success: boolean; doge_received?: number; error?: string };
      
      if (result.success) {
        toast.success(`${t("birds.eggsConverted")}: ${result.doge_received?.toFixed(8)} DOGE! 🐕`);
        await fetchUserData();
        await refreshBalance();
      } else {
        toast.error(result.error || t("birds.convertFailed"));
      }
    } catch (error) {
      console.error("Error converting eggs:", error);
      toast.error(t("birds.convertFailed"));
    } finally {
      setConvertingEggs(false);
    }
  };

  const getBarnCapacity = () => {
    return barnLevels.find(l => l.level === barn.level)?.capacity || 60000;
  };

  const getNextBarnLevel = () => {
    return barnLevels.find(l => l.level === barn.level + 1);
  };

  const getTotalEggsPerHour = () => {
    return birds.reduce((total, bird) => {
      return total + (bird.eggsPerHour * (userBirds[bird.id] || 0));
    }, 0);
  };

  const barnCapacity = getBarnCapacity();
  const barnProgress = (barn.eggs / barnCapacity) * 100;
  const nextBarnLevel = getNextBarnLevel();
  const totalEggsPerHour = getTotalEggsPerHour();

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-green-900/20 to-background">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-400 mb-4">
            <Bird className="w-5 h-5" />
            <span className="text-sm font-medium">DOGE Birds Game</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("birds.title")} <span className="text-green-400">{t("birds.titleHighlight")}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("birds.subtitle")}
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card/50 border-green-500/20">
            <CardContent className="p-4 text-center">
              <Egg className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
              <p className="text-2xl font-bold text-yellow-400">{barn.eggs.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{t("birds.storedEggs")}</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-green-500/20">
            <CardContent className="p-4 text-center">
              <RefreshCw className="w-6 h-6 mx-auto mb-2 text-green-400 animate-spin" />
              <p className="text-2xl font-bold text-green-400">{pendingEggs.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{t("birds.pendingEggs")}</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-green-500/20">
            <CardContent className="p-4 text-center">
              <Bird className="w-6 h-6 mx-auto mb-2 text-blue-400" />
              <p className="text-2xl font-bold text-blue-400">{totalEggsPerHour.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{t("birds.eggsPerHour")}</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-green-500/20">
            <CardContent className="p-4 text-center">
              <Coins className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-primary">{depositBalance.toFixed(4)}</p>
              <p className="text-xs text-muted-foreground">{t("birds.balance")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Barn Section */}
        <Card className="mb-8 bg-gradient-to-br from-amber-900/30 to-red-900/20 border-amber-500/30">
          <CardHeader className="flex flex-row items-center gap-4">
            <img src={barnImage} alt="Barn" className="w-20 h-20 object-contain" />
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-amber-400" />
                {t("birds.barn")} - {t("birds.level")} {barn.level}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {t("birds.capacity")}: {barn.eggs.toLocaleString()} / {barnCapacity.toLocaleString()}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={barnProgress} className="h-4 mb-4" />
            
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleCollectEggs}
                disabled={collectingEggs || pendingEggs <= 0}
                className="bg-green-600 hover:bg-green-700"
              >
                {collectingEggs ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Egg className="w-4 h-4 mr-2" />
                )}
                {t("birds.collectEggs")} ({pendingEggs.toLocaleString()})
              </Button>
              
              <Button
                onClick={handleConvertEggs}
                disabled={convertingEggs || barn.eggs < 60000}
                variant="outline"
                className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20"
              >
                {convertingEggs ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Coins className="w-4 h-4 mr-2" />
                )}
                {t("birds.convertToDoge")}
              </Button>
              
              {nextBarnLevel && (
                <Button
                  onClick={handleUpgradeBarn}
                  disabled={upgradingBarn || depositBalance < nextBarnLevel.upgradeCost}
                  variant="outline"
                  className="border-amber-500/50 text-amber-400 hover:bg-amber-500/20"
                >
                  {upgradingBarn ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowUpCircle className="w-4 h-4 mr-2" />
                  )}
                  {t("birds.upgradeBarn")} ({nextBarnLevel.upgradeCost} DOGE)
                </Button>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground mt-4">
              💱 {t("birds.exchangeRate")}: 60,000 🥚 = 0.0060 DOGE
            </p>
          </CardContent>
        </Card>

        {/* Birds Grid */}
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Bird className="w-5 h-5 text-green-400" />
          {t("birds.buyBirds")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {birds.map((bird) => {
            const owned = userBirds[bird.id] || 0;
            const canAfford = depositBalance >= bird.price;
            const isGenerating = owned > 0;
            
            return (
              <Card 
                key={bird.id} 
                className={`bird-card relative overflow-hidden bg-gradient-to-br ${bird.gradient}/20 border-2 ${isGenerating ? 'animate-glow-pulse' : ''}`}
                style={{ 
                  borderColor: `${bird.color}40`,
                  '--bird-color': `${bird.color}60`
                } as React.CSSProperties}
              >
                {/* Quantity badge */}
                <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/50 text-xs font-bold z-10">
                  x{owned}
                </div>
                
                {/* Floating eggs animation when generating */}
                {isGenerating && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(3)].map((_, i) => (
                      <span
                        key={i}
                        className="absolute text-lg animate-egg-drop"
                        style={{
                          left: `${20 + i * 25}%`,
                          bottom: '20%',
                          animationDelay: `${i * 0.5}s`,
                          animationIterationCount: 'infinite',
                          animationDuration: '2s'
                        }}
                      >
                        🥚
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Floating feathers when generating */}
                {isGenerating && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(2)].map((_, i) => (
                      <span
                        key={i}
                        className="absolute text-sm animate-feather-float"
                        style={{
                          left: `${30 + i * 40}%`,
                          bottom: '40%',
                          animationDelay: `${i * 1.5}s`,
                          animationIterationCount: 'infinite',
                          animationDuration: '3s'
                        }}
                      >
                        🪶
                      </span>
                    ))}
                  </div>
                )}
                
                <CardContent className="p-4 text-center relative">
                  {/* Bird image with animations */}
                  <div className="relative">
                    <img 
                      src={bird.image} 
                      alt={bird.name}
                      className={`bird-image w-24 h-24 mx-auto mb-3 object-contain transition-all ${
                        isGenerating 
                          ? 'animate-bird-hop' 
                          : 'animate-bird-idle'
                      }`}
                      style={{
                        filter: isGenerating ? `drop-shadow(0 0 10px ${bird.color}80)` : 'none'
                      }}
                    />
                    
                    {/* Heart pop effect when generating */}
                    {isGenerating && (
                      <span 
                        className="absolute -top-1 right-4 text-lg animate-heart-pop"
                        style={{ animationIterationCount: 'infinite', animationDuration: '3s' }}
                      >
                        💛
                      </span>
                    )}
                    
                    {/* Generating indicator */}
                    {isGenerating && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></span>
                          Generando
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <h4 className="font-bold text-lg mb-1 mt-2" style={{ color: bird.color }}>
                    {t(bird.nameKey)}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {bird.eggsPerHour.toLocaleString()} 🥚/{t("birds.hour")}
                  </p>
                  
                  {/* Egg production preview */}
                  {isGenerating && (
                    <div className="mb-2 text-xs text-green-400 flex items-center justify-center gap-1">
                      <img src={eggGolden} alt="egg" className="w-3 h-3 animate-egg-shimmer" />
                      +{(bird.eggsPerHour * owned).toLocaleString()}/h
                    </div>
                  )}
                  
                  <div className="flex items-center justify-center gap-1 mb-3">
                    <img src={eggGolden} alt="egg" className="w-4 h-4" />
                    <span className="font-bold text-primary">{bird.price} DOGE</span>
                  </div>
                  <Button
                    onClick={() => handleBuyBird(bird.id, bird.price)}
                    disabled={buyingBird === bird.id || !canAfford}
                    className={`w-full bg-gradient-to-r ${bird.gradient} hover:opacity-90 transition-all hover:scale-105`}
                    size="sm"
                  >
                    {buyingBird === bird.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      t("birds.buy")
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-8 p-4 rounded-xl bg-card/30 border border-border/50">
          <h4 className="font-bold mb-2">{t("birds.howItWorks")}</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>🐦 {t("birds.info1")}</li>
            <li>🥚 {t("birds.info2")}</li>
            <li>🏠 {t("birds.info3")}</li>
            <li>💰 {t("birds.info4")}</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default DogeBirdsSection;
