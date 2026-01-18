import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useDogeBalance } from "@/contexts/DogeBalanceContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TrendingUp, Clock, Coins, Zap, Crown, Rocket, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface MiningPlan {
  id: string;
  name: string;
  nameEn: string;
  dailyRate: number;
  minAmount: number;
  maxAmount: number;
  icon: React.ElementType;
  gradient: string;
  bgGradient: string;
  description: string;
  descriptionEn: string;
}

const miningPlans: MiningPlan[] = [
  {
    id: 'standard',
    name: 'Plan Standard',
    nameEn: 'Standard Plan',
    dailyRate: 4,
    minAmount: 2,
    maxAmount: 10,
    icon: Coins,
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-500/10 to-cyan-500/10',
    description: 'Perfecto para empezar tu aventura de minería',
    descriptionEn: 'Perfect to start your mining adventure'
  },
  {
    id: 'medium',
    name: 'Plan Medium',
    nameEn: 'Medium Plan',
    dailyRate: 4.5,
    minAmount: 15,
    maxAmount: 50,
    icon: Zap,
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-500/10 to-pink-500/10',
    description: 'Mayor rendimiento para mineros activos',
    descriptionEn: 'Higher returns for active miners'
  },
  {
    id: 'premium',
    name: 'Plan Premium',
    nameEn: 'Premium Plan',
    dailyRate: 5,
    minAmount: 60,
    maxAmount: 100,
    icon: Star,
    gradient: 'from-amber-500 to-orange-500',
    bgGradient: 'from-amber-500/10 to-orange-500/10',
    description: 'Ganancias premium para inversores serios',
    descriptionEn: 'Premium earnings for serious investors'
  },
  {
    id: 'vip',
    name: 'Plan VIP',
    nameEn: 'VIP Plan',
    dailyRate: 6,
    minAmount: 150,
    maxAmount: 1000,
    icon: Crown,
    gradient: 'from-yellow-400 to-amber-500',
    bgGradient: 'from-yellow-400/10 to-amber-500/10',
    description: '¡Máximo rendimiento para los Doges más ricos!',
    descriptionEn: 'Maximum returns for the richest Doges!'
  }
];

interface Investment {
  id: string;
  plan_type: string;
  invested_amount: number;
  daily_rate: number;
  total_earned: number;
  last_claim_at: string;
  created_at: string;
  is_active: boolean;
  expires_at: string;
}

const MIN_CLAIM_AMOUNT = 0.1;

const OnlineMiningSection = () => {
  const { depositBalance, refreshBalance } = useDogeBalance();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [investAmount, setInvestAmount] = useState<number>(2);
  const [investing, setInvesting] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [pendingRewards, setPendingRewards] = useState<Record<string, number>>({});
  const [currentTime, setCurrentTime] = useState(Date.now());

  const texts = {
    title: { es: 'Minería Online', en: 'Online Mining' },
    subtitle: { es: 'Invierte tu DOGE y gana recompensas diarias automáticamente', en: 'Invest your DOGE and earn daily rewards automatically' },
    dailyReturn: { es: 'Retorno Diario', en: 'Daily Return' },
    range: { es: 'Rango', en: 'Range' },
    invest: { es: 'Invertir', en: 'Invest' },
    investing: { es: 'Invirtiendo...', en: 'Investing...' },
    yourInvestments: { es: 'Tus Inversiones Activas', en: 'Your Active Investments' },
    noInvestments: { es: 'Aún no tienes inversiones. ¡Elige un plan y empieza a ganar!', en: "You don't have investments yet. Choose a plan and start earning!" },
    invested: { es: 'Invertido', en: 'Invested' },
    earned: { es: 'Ganado', en: 'Earned' },
    pending: { es: 'Pendiente', en: 'Pending' },
    claim: { es: 'Reclamar', en: 'Claim' },
    claiming: { es: 'Reclamando...', en: 'Claiming...' },
    minRequired: { es: 'Mínimo 0.1 DOGE', en: 'Minimum 0.1 DOGE' },
    selectAmount: { es: 'Selecciona la cantidad', en: 'Select amount' },
    balance: { es: 'Tu balance', en: 'Your balance' },
    perDay: { es: '/día', en: '/day' },
    muchProfit: { es: '¡Much Profit! 🐕', en: 'Much Profit! 🐕' },
    mining: { es: 'Minando...', en: 'Mining...' },
    perSecond: { es: '/seg', en: '/sec' }
  };

  const getText = (key: keyof typeof texts) => texts[key][language];

  // Real-time counter update every 100ms
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Calculate pending rewards in real-time
  // Note: daily_rate is stored as decimal (0.04 = 4%), so we use it directly
  useEffect(() => {
    const newPendingRewards: Record<string, number> = {};
    investments.forEach((investment) => {
      const msElapsed = currentTime - new Date(investment.last_claim_at).getTime();
      const hoursElapsed = msElapsed / (1000 * 60 * 60);
      const reward = (investment.invested_amount * investment.daily_rate / 24) * hoursElapsed;
      newPendingRewards[investment.id] = Math.max(0, reward);
    });
    setPendingRewards(newPendingRewards);
  }, [currentTime, investments]);

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      const { data, error } = await supabase
        .from('mining_investments')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setInvestments(data || []);
    } catch (error) {
      console.error('Error fetching investments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvest = async (plan: MiningPlan) => {
    if (investing) return;
    
    if (depositBalance < investAmount) {
      toast({
        title: language === 'es' ? 'Balance de depósito insuficiente' : 'Insufficient deposit balance',
        description: language === 'es' ? 'No tienes suficiente DOGE de depósito' : "You don't have enough deposit DOGE",
        variant: 'destructive'
      });
      return;
    }

    setInvesting(true);
    try {
      const { data, error } = await supabase.rpc('create_mining_investment', {
        p_plan_type: plan.id,
        p_amount: investAmount
      });

      if (error) throw error;
      
      const result = data as { success: boolean; error?: string };
      
      if (!result.success) {
        throw new Error(result.error || 'Investment failed');
      }

      toast({
        title: getText('muchProfit'),
        description: language === 'es' 
          ? `Invertiste ${investAmount} DOGE en ${plan.name}` 
          : `You invested ${investAmount} DOGE in ${plan.nameEn}`
      });

      await refreshBalance();
      await fetchInvestments();
      setSelectedPlan(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setInvesting(false);
    }
  };

  const handleClaim = async (investment: Investment) => {
    if (claimingId) return;
    
    const pendingReward = pendingRewards[investment.id] || 0;
    if (pendingReward < MIN_CLAIM_AMOUNT) {
      toast({
        title: language === 'es' ? 'Mínimo no alcanzado' : 'Minimum not reached',
        description: language === 'es' 
          ? `Necesitas al menos ${MIN_CLAIM_AMOUNT} DOGE para reclamar` 
          : `You need at least ${MIN_CLAIM_AMOUNT} DOGE to claim`,
        variant: 'destructive'
      });
      return;
    }
    
    setClaimingId(investment.id);
    try {
      const { data, error } = await supabase.rpc('claim_mining_investment_reward', {
        p_investment_id: investment.id
      });

      if (error) throw error;
      
      const result = data as { success: boolean; error?: string; reward?: number };
      
      if (!result.success) {
        throw new Error(result.error || 'Claim failed');
      }

      toast({
        title: getText('muchProfit'),
        description: language === 'es' 
          ? `¡Reclamaste ${result.reward?.toFixed(8)} DOGE!` 
          : `You claimed ${result.reward?.toFixed(8)} DOGE!`
      });

      await refreshBalance();
      await fetchInvestments();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setClaimingId(null);
    }
  };

  const canClaim = (investmentId: string) => {
    const pendingReward = pendingRewards[investmentId] || 0;
    return pendingReward >= MIN_CLAIM_AMOUNT;
  };

  const getClaimProgress = (investmentId: string) => {
    const pendingReward = pendingRewards[investmentId] || 0;
    return Math.min(100, (pendingReward / MIN_CLAIM_AMOUNT) * 100);
  };

  const getMiningRatePerSecond = (investment: Investment) => {
    // daily_rate is stored as decimal (0.04 = 4%)
    return (investment.invested_amount * investment.daily_rate) / 86400;
  };

  const getPlanInfo = (planId: string) => miningPlans.find(p => p.id === planId);

  if (loading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto flex justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
            <Rocket className="w-4 h-4 mr-2" />
            {getText('muchProfit')}
          </Badge>
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
              {getText('title')}
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {getText('subtitle')}
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {miningPlans.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            
            return (
              <Card 
                key={plan.id}
                className={cn(
                  "relative overflow-hidden transition-all duration-300 cursor-pointer hover:scale-105",
                  "border-2",
                  isSelected ? "border-primary shadow-lg shadow-primary/20" : "border-border/50 hover:border-primary/50"
                )}
                onClick={() => {
                  setSelectedPlan(isSelected ? null : plan.id);
                  setInvestAmount(plan.minAmount);
                }}
              >
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", plan.bgGradient)} />
                
                <CardHeader className="relative pb-2">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-3",
                    "bg-gradient-to-br", plan.gradient
                  )}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">
                    {language === 'es' ? plan.name : plan.nameEn}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {language === 'es' ? plan.description : plan.descriptionEn}
                  </p>
                </CardHeader>
                
                <CardContent className="relative space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{getText('dailyReturn')}</span>
                    <span className={cn("text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent", plan.gradient)}>
                      {plan.dailyRate}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{getText('range')}</span>
                    <span className="font-medium">{plan.minAmount} - {plan.maxAmount} DOGE</span>
                  </div>

                  {isSelected && (
                    <div 
                      className="pt-4 border-t border-border/50 space-y-4 animate-in fade-in slide-in-from-top-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>{getText('selectAmount')}</span>
                          <span className="font-bold text-primary">{investAmount} DOGE</span>
                        </div>
                        <div 
                          onPointerDown={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                        >
                          <Slider
                            value={[investAmount]}
                            onValueChange={(v) => setInvestAmount(v[0])}
                            min={plan.minAmount}
                            max={plan.maxAmount}
                            step={plan.minAmount < 10 ? 0.5 : 1}
                            className="mb-2"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {getText('balance')}: {depositBalance.toFixed(8)} DOGE
                        </p>
                      </div>
                      
                      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{getText('dailyReturn')}</span>
                          <span className="font-bold text-green-500">
                            +{(investAmount * plan.dailyRate / 100).toFixed(4)} DOGE{getText('perDay')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{language === 'es' ? 'Duración del plan' : 'Plan duration'}</span>
                          <span className="font-medium text-foreground">30 {language === 'es' ? 'días' : 'days'}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{language === 'es' ? 'Ganancia estimada (30d)' : 'Est. earnings (30d)'}</span>
                          <span className="font-bold text-primary">
                            +{(investAmount * plan.dailyRate / 100 * 30).toFixed(4)} DOGE
                          </span>
                        </div>
                      </div>

                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInvest(plan);
                        }}
                        disabled={investing || depositBalance < investAmount}
                        className={cn("w-full bg-gradient-to-r", plan.gradient)}
                      >
                        {investing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {getText('investing')}
                          </>
                        ) : (
                          <>
                            <TrendingUp className="w-4 h-4 mr-2" />
                            {getText('invest')} {investAmount} DOGE
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Active Investments */}
        <div>
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            {getText('yourInvestments')}
          </h3>

          {investments.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="py-12 text-center">
                <Coins className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">{getText('noInvestments')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {investments.map((investment) => {
                const planInfo = getPlanInfo(investment.plan_type);
                if (!planInfo) return null;
                
                const Icon = planInfo.icon;
                const pendingReward = pendingRewards[investment.id] || 0;
                const canClaimNow = canClaim(investment.id);
                
                return (
                  <Card key={investment.id} className="relative overflow-hidden">
                    <div className={cn("absolute inset-0 bg-gradient-to-br opacity-30", planInfo.bgGradient)} />
                    
                    <CardContent className="relative p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            "bg-gradient-to-br", planInfo.gradient
                          )}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold">{language === 'es' ? planInfo.name : planInfo.nameEn}</p>
                            <p className="text-xs text-muted-foreground">
                              {planInfo.dailyRate}% {getText('perDay')}
                            </p>
                          </div>
                        </div>
                        {/* Expiration badge */}
                        {(() => {
                          const daysLeft = Math.max(0, Math.ceil((new Date(investment.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                          const isExpiringSoon = daysLeft <= 5;
                          return (
                            <Badge 
                              variant={isExpiringSoon ? "destructive" : "secondary"}
                              className={cn(
                                "text-xs",
                                isExpiringSoon ? "bg-destructive/20 text-destructive animate-pulse" : ""
                              )}
                            >
                              {daysLeft > 0 ? `${daysLeft}d` : language === 'es' ? 'Expirado' : 'Expired'}
                            </Badge>
                          );
                        })()}
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-muted/50 rounded-lg p-2">
                          <p className="text-xs text-muted-foreground">{getText('invested')}</p>
                          <p className="font-bold text-sm">{investment.invested_amount}</p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-2">
                          <p className="text-xs text-muted-foreground">{getText('earned')}</p>
                          <p className="font-bold text-sm text-green-500">{investment.total_earned.toFixed(4)}</p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-2">
                          <p className="text-xs text-muted-foreground">{getText('pending')}</p>
                          <p className="font-bold text-sm text-amber-500 font-mono">
                            {pendingReward.toFixed(8)}
                          </p>
                        </div>
                      </div>

                      {/* Real-time mining indicator */}
                      <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            {getText('mining')}
                          </span>
                          <span className="text-green-500 font-mono">
                            +{getMiningRatePerSecond(investment).toFixed(10)}{getText('perSecond')}
                          </span>
                        </div>
                        <Progress 
                          value={getClaimProgress(investment.id)} 
                          className="h-2"
                        />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{pendingReward.toFixed(4)} / {MIN_CLAIM_AMOUNT} DOGE</span>
                          <span>{getClaimProgress(investment.id).toFixed(1)}%</span>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleClaim(investment)}
                        disabled={!canClaimNow || claimingId === investment.id}
                        className={cn(
                          "w-full",
                          canClaimNow 
                            ? cn("bg-gradient-to-r", planInfo.gradient) 
                            : "bg-muted text-muted-foreground"
                        )}
                        variant={canClaimNow ? "default" : "secondary"}
                      >
                        {claimingId === investment.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {getText('claiming')}
                          </>
                        ) : canClaimNow ? (
                          <>
                            <Coins className="w-4 h-4 mr-2" />
                            {getText('claim')} {pendingReward.toFixed(4)} DOGE
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4 mr-2" />
                            {getText('minRequired')}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default OnlineMiningSection;
