import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface DogeBalanceContextType {
  balance: number;
  miningBalance: number;
  depositBalance: number;
  miningRate: number;
  referralCode: string;
  totalEarned: number;
  totalDeposited: number;
  isLoading: boolean;
  subtractBalance: (amount: number) => Promise<boolean>;
  claimMiningReward: (amount: number, characterId: string) => Promise<boolean>;
  applyReferralCode: (code: string) => Promise<boolean>;
  refreshBalance: () => Promise<void>;
  canWithdraw: boolean;
}

const DogeBalanceContext = createContext<DogeBalanceContextType | undefined>(undefined);

const MIN_DEPOSIT_FOR_WITHDRAWAL = 5;

export function DogeBalanceProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(0);
  const [miningBalance, setMiningBalance] = useState(0);
  const [depositBalance, setDepositBalance] = useState(0);
  const [referralCode, setReferralCode] = useState("");
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalDeposited, setTotalDeposited] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Mining rate is calculated based on owned characters (set from InventoryContext)
  const miningRate = 0;

  // User can withdraw only if they have deposited at least 5 DOGE
  const canWithdraw = totalDeposited >= MIN_DEPOSIT_FOR_WITHDRAWAL;

  const refreshBalance = useCallback(async () => {
    if (!user) {
      setBalance(0);
      setMiningBalance(0);
      setDepositBalance(0);
      setReferralCode("");
      setTotalEarned(0);
      setTotalDeposited(0);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('get_balance');
      
      if (error) {
        console.error('Error fetching balance:', error);
        return;
      }

      if (data && typeof data === 'object' && 'success' in data) {
        const result = data as { 
          success: boolean; 
          balance?: number; 
          mining_balance?: number;
          deposit_balance?: number;
          referral_code?: string; 
          total_earned?: number;
          total_deposited?: number;
        };
        if (result.success) {
          setBalance(result.balance || 0);
          setMiningBalance(result.mining_balance || 0);
          setDepositBalance(result.deposit_balance || 0);
          setReferralCode(result.referral_code || "");
          setTotalEarned(result.total_earned || 0);
          setTotalDeposited(result.total_deposited || 0);
        }
      }
    } catch (error) {
      console.error('Error refreshing balance:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  // Subscribe to realtime balance updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new) {
            const newData = payload.new as { 
              mining_balance?: number; 
              deposit_balance?: number;
              referral_code?: string; 
              total_earned?: number;
              total_deposited?: number;
            };
            setMiningBalance(newData.mining_balance || 0);
            setDepositBalance(newData.deposit_balance || 0);
            setBalance((newData.mining_balance || 0) + (newData.deposit_balance || 0));
            setReferralCode(newData.referral_code || "");
            setTotalEarned(newData.total_earned || 0);
            setTotalDeposited(newData.total_deposited || 0);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const subtractBalance = async (amount: number): Promise<boolean> => {
    if (!user) {
      toast.error("Debes iniciar sesión");
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('subtract_balance', { p_amount: amount });
      
      if (error) {
        console.error('Error subtracting balance:', error);
        toast.error("Error al restar balance");
        return false;
      }

      if (data && typeof data === 'object' && 'success' in data) {
        const result = data as { success: boolean; new_balance?: number; error?: string };
        if (result.success) {
          setDepositBalance(result.new_balance || 0);
          setBalance(miningBalance + (result.new_balance || 0));
          return true;
        } else if (result.error === 'Insufficient deposit balance') {
          toast.error("Balance de depósito insuficiente");
        } else if (result.error) {
          toast.error(result.error);
        }
      }
      return false;
    } catch (error) {
      console.error('Error subtracting balance:', error);
      return false;
    }
  };

  const claimMiningReward = async (amount: number, characterId: string): Promise<boolean> => {
    if (!user) {
      toast.error("Debes iniciar sesión");
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('claim_mining_reward', { 
        p_amount: amount,
        p_character_id: characterId 
      });
      
      if (error) {
        console.error('Error claiming reward:', error);
        toast.error("Error al reclamar recompensa");
        return false;
      }

      if (data && typeof data === 'object' && 'success' in data) {
        const result = data as { success: boolean; new_balance?: number };
        if (result.success) {
          setMiningBalance(result.new_balance || 0);
          setBalance((result.new_balance || 0) + depositBalance);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error claiming reward:', error);
      return false;
    }
  };

  const applyReferralCode = async (code: string): Promise<boolean> => {
    if (!user) {
      toast.error("Debes iniciar sesión");
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('apply_referral_code', { p_code: code });
      
      if (error) {
        console.error('Error applying referral code:', error);
        toast.error("Error al aplicar código de referido");
        return false;
      }

      if (data && typeof data === 'object' && 'success' in data) {
        const result = data as { success: boolean; new_balance?: number; bonus?: number; error?: string };
        if (result.success) {
          setMiningBalance(result.new_balance || 0);
          setBalance((result.new_balance || 0) + depositBalance);
          toast.success(`¡Código aplicado! Recibiste ${result.bonus?.toFixed(4)} DOGE de bonus`);
          return true;
        } else if (result.error) {
          toast.error(result.error);
        }
      }
      return false;
    } catch (error) {
      console.error('Error applying referral code:', error);
      return false;
    }
  };

  return (
    <DogeBalanceContext.Provider
      value={{
        balance,
        miningBalance,
        depositBalance,
        miningRate,
        referralCode,
        totalEarned,
        totalDeposited,
        isLoading,
        subtractBalance,
        claimMiningReward,
        applyReferralCode,
        refreshBalance,
        canWithdraw,
      }}
    >
      {children}
    </DogeBalanceContext.Provider>
  );
}

export function useDogeBalance() {
  const context = useContext(DogeBalanceContext);
  if (context === undefined) {
    throw new Error("useDogeBalance must be used within a DogeBalanceProvider");
  }
  return context;
}
