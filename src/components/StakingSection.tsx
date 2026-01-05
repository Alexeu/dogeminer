import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDogeBalance } from "@/contexts/DogeBalanceContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lock, TrendingUp, Clock, Gift, Loader2 } from "lucide-react";

interface Stake {
  id: string;
  amount: number;
  duration_days: number;
  bonus_rate: number;
  started_at: string;
  ends_at: string;
  status: string;
  reward_amount: number;
}

const STAKING_PLANS = [
  { days: 30, rate: 10, label: "30 días" },
  { days: 90, rate: 15, label: "90 días" },
  { days: 180, rate: 20, label: "180 días" },
];

const translations = {
  en: {
    title: "Staking",
    subtitle: "Lock your DOGE to earn bonus rewards",
    depositBalance: "Available to Stake",
    selectPlan: "Select Staking Plan",
    bonus: "bonus",
    amount: "Amount to Stake",
    stake: "Stake DOGE",
    staking: "Staking...",
    activeStakes: "Active Stakes",
    noActiveStakes: "No active stakes",
    staked: "Staked",
    reward: "Estimated Reward",
    endsIn: "Ends in",
    days: "days",
    claim: "Claim",
    claiming: "Claiming...",
    completed: "Completed",
    totalStaked: "Total Staked",
    estimatedRewards: "Estimated Rewards",
    minAmount: "Minimum 1 DOGE",
    insufficientBalance: "Insufficient balance",
    stakeSuccess: "Stake created successfully!",
    claimSuccess: "Stake claimed successfully!",
    readyToClaim: "Ready to claim!",
  },
  es: {
    title: "Staking",
    subtitle: "Bloquea tu DOGE para ganar recompensas bonus",
    depositBalance: "Disponible para Staking",
    selectPlan: "Selecciona Plan de Staking",
    bonus: "bonus",
    amount: "Cantidad a Stakear",
    stake: "Stakear DOGE",
    staking: "Stakeando...",
    activeStakes: "Stakes Activos",
    noActiveStakes: "No hay stakes activos",
    staked: "Stakeado",
    reward: "Recompensa Estimada",
    endsIn: "Termina en",
    days: "días",
    claim: "Reclamar",
    claiming: "Reclamando...",
    completed: "Completado",
    totalStaked: "Total Stakeado",
    estimatedRewards: "Recompensas Estimadas",
    minAmount: "Mínimo 1 DOGE",
    insufficientBalance: "Balance insuficiente",
    stakeSuccess: "¡Stake creado exitosamente!",
    claimSuccess: "¡Stake reclamado exitosamente!",
    readyToClaim: "¡Listo para reclamar!",
  },
};

export default function StakingSection() {
  const { user } = useAuth();
  const { depositBalance, refreshBalance } = useDogeBalance();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.es;

  const [selectedPlan, setSelectedPlan] = useState(STAKING_PLANS[0]);
  const [amount, setAmount] = useState("");
  const [isStaking, setIsStaking] = useState(false);
  const [stakes, setStakes] = useState<Stake[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const fetchStakes = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("staking")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setStakes(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStakes();
  }, [user]);

  const handleStake = async () => {
    const stakeAmount = parseFloat(amount);
    
    if (!stakeAmount || stakeAmount < 1) {
      toast.error(t.minAmount);
      return;
    }

    if (stakeAmount > depositBalance) {
      toast.error(t.insufficientBalance);
      return;
    }

    setIsStaking(true);

    try {
      const { data, error } = await supabase.rpc("create_stake", {
        p_amount: stakeAmount,
        p_duration_days: selectedPlan.days,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };
      
      if (result.success) {
        toast.success(t.stakeSuccess);
        setAmount("");
        await refreshBalance();
        await fetchStakes();
      } else {
        toast.error(result.error || "Error creating stake");
      }
    } catch (error) {
      console.error("Error staking:", error);
      toast.error("Error creating stake");
    } finally {
      setIsStaking(false);
    }
  };

  const handleClaim = async (stakeId: string) => {
    setClaimingId(stakeId);

    try {
      const { data, error } = await supabase.rpc("claim_stake", {
        p_stake_id: stakeId,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; reward?: number };
      
      if (result.success) {
        toast.success(t.claimSuccess);
        await refreshBalance();
        await fetchStakes();
      } else {
        toast.error(result.error || "Error claiming stake");
      }
    } catch (error) {
      console.error("Error claiming:", error);
      toast.error("Error claiming stake");
    } finally {
      setClaimingId(null);
    }
  };

  const getDaysRemaining = (endsAt: string) => {
    const end = new Date(endsAt);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getProgress = (startedAt: string, endsAt: string) => {
    const start = new Date(startedAt).getTime();
    const end = new Date(endsAt).getTime();
    const now = Date.now();
    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const totalStaked = stakes.reduce((sum, s) => sum + s.amount, 0);
  const totalEstimatedRewards = stakes.reduce(
    (sum, s) => sum + s.amount * s.bonus_rate,
    0
  );
  const estimatedReward = parseFloat(amount || "0") * (selectedPlan.rate / 100);

  if (!user) return null;

  return (
    <section id="staking" className="py-8">
      <Card className="border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Lock className="w-5 h-5 text-primary" />
            {t.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-xs text-muted-foreground">{t.totalStaked}</p>
              <p className="text-lg font-bold text-primary">
                {totalStaked.toFixed(4)} DOGE
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-xs text-muted-foreground">{t.estimatedRewards}</p>
              <p className="text-lg font-bold text-green-500">
                +{totalEstimatedRewards.toFixed(4)} DOGE
              </p>
            </div>
          </div>

          {/* Create Stake */}
          <div className="space-y-4 p-4 rounded-lg border border-border/50 bg-background/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t.depositBalance}
              </span>
              <span className="font-mono font-medium">
                {depositBalance.toFixed(4)} DOGE
              </span>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">{t.selectPlan}</p>
              <div className="grid grid-cols-3 gap-2">
                {STAKING_PLANS.map((plan) => (
                  <button
                    key={plan.days}
                    onClick={() => setSelectedPlan(plan)}
                    className={`p-3 rounded-lg border transition-all ${
                      selectedPlan.days === plan.days
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="font-bold">{plan.label}</p>
                    <p className="text-sm text-green-500">+{plan.rate}% {t.bonus}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">{t.amount}</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="0.0000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  step="0.0001"
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(depositBalance.toFixed(4))}
                >
                  MAX
                </Button>
              </div>
              {parseFloat(amount) > 0 && (
                <p className="text-sm text-green-500 mt-1">
                  {t.reward}: +{estimatedReward.toFixed(4)} DOGE
                </p>
              )}
            </div>

            <Button
              onClick={handleStake}
              disabled={isStaking || !amount || parseFloat(amount) < 1}
              className="w-full"
            >
              {isStaking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t.staking}
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  {t.stake}
                </>
              )}
            </Button>
          </div>

          {/* Active Stakes */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {t.activeStakes}
            </h3>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : stakes.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                {t.noActiveStakes}
              </p>
            ) : (
              <div className="space-y-3">
                {stakes.map((stake) => {
                  const daysRemaining = getDaysRemaining(stake.ends_at);
                  const progress = getProgress(stake.started_at, stake.ends_at);
                  const canClaim = daysRemaining === 0;
                  const estimatedReward = stake.amount * stake.bonus_rate;

                  return (
                    <div
                      key={stake.id}
                      className="p-4 rounded-lg border border-border/50 bg-background/30 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-mono font-bold">
                            {stake.amount.toFixed(4)} DOGE
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {stake.duration_days} {t.days} • +
                            {(stake.bonus_rate * 100).toFixed(0)}% {t.bonus}
                          </p>
                        </div>
                        <Badge
                          variant={canClaim ? "default" : "secondary"}
                          className={canClaim ? "bg-green-500" : ""}
                        >
                          {canClaim ? (
                            <Gift className="w-3 h-3 mr-1" />
                          ) : (
                            <Clock className="w-3 h-3 mr-1" />
                          )}
                          {canClaim
                            ? t.readyToClaim
                            : `${daysRemaining} ${t.days}`}
                        </Badge>
                      </div>

                      <Progress value={progress} className="h-2" />

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-500">
                          {t.reward}: +{estimatedReward.toFixed(4)} DOGE
                        </span>
                        {canClaim && (
                          <Button
                            size="sm"
                            onClick={() => handleClaim(stake.id)}
                            disabled={claimingId === stake.id}
                          >
                            {claimingId === stake.id ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                {t.claiming}
                              </>
                            ) : (
                              t.claim
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
